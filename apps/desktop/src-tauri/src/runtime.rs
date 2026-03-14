use std::{
    collections::HashMap,
    convert::Infallible,
    fs::{self, File, OpenOptions},
    io::{BufRead, BufReader, Write},
    net::{Ipv4Addr, SocketAddr},
    path::PathBuf,
    sync::{Arc, Mutex},
    sync::atomic::{AtomicBool, Ordering},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use anyhow::{Context, Result};
use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header::AUTHORIZATION, HeaderMap, Request, StatusCode},
    middleware::{self, Next},
    response::{
        sse::{Event, KeepAlive},
        Response, Sse,
    },
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::async_runtime::JoinHandle;
use tokio::{
    net::TcpListener,
    sync::{broadcast, oneshot},
};
use tokio_stream::{wrappers::BroadcastStream, StreamExt};
use tracing::{error, info, warn};
use uuid::Uuid;

use crate::{
    ai_worker::{BunWorkerBridge, BunWorkerConfig, StreamMessage, StreamRequest, WorkerToolCall},
    hooks::{HookEngine, HookEvent},
    config::{
        ConfigService, KeyringSecretStore, ResolvedConfig, RuntimePaths, RuntimeResolutionRequest,
    },
    logging,
    memory::{MemoryService, ObservationInput, ObservationSearchResult, ObservationSource},
    orchestration::{CreateTeamRequest as OrchestrationCreateTeamRequest, OrchestrationService, SendMailboxRequest, SpawnSubagentRequest},
    persona::PersonaProfile,
    plugins::PluginRegistryService,
    persistence::{
        repositories::{
            clock::utc_now, messages::MessageRepository,
            sessions::SessionRepository, settings::SettingsRepository,
            usage::UsageAnalyticsRepository,
        },
        Database, DeviceType, MessageRecord, MessageRole,
        SessionRecord, SessionStatus, SessionSummaryRecord, SessionType, SettingScope,
        UsageAnalyticsRecord,
    },
    providers::{ProviderRegistryService, SystemEnvironment},
    remote::{
        DeviceMetadata, LanListenerStatus, PairingCompleteResponse, PairingIntentResponse,
        RelayCommandRequest, RelayJoinRequest, RelayJoinResponse, RelayRoomEvent,
        RelayRoomResponse, RemoteAccessService,
    },
    routing::{ProviderRoutingService, ReasoningEffort, ReasoningMode, RoutingAgentState, RoutingPersonaContext, RoutingRequest},
    terminal::{RemoteTerminalManager, TerminalOutputEvent, TerminalSessionCreated},
    workspaces::{WorkspaceManager, WorkspaceCreateRequest},
    workspace_reviews::WorkspaceReviewManager,
    tools::{PendingApprovalDecision, PermissionBroker, PermissionResolution, ToolExecutionContext, ToolExecutionOutcome, ToolExecutor, ToolInput},
    wrappers::{NormalizedWrapperEvent, WrapperExecutionRequest, WrapperManager},
};

const LEGACY_BOOTSTRAP_PATH: &str = "/api/bootstrap/auth";
const V1_BOOTSTRAP_PATH: &str = "/api/v1/bootstrap/auth";

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchContext {
    pub api_base_url: String,
    pub bootstrap_path: String,
    pub bootstrap_token: String,
    pub expires_at_unix_ms: u64,
    pub instance_id: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapSession {
    pub api_base_url: String,
    pub auth_token: String,
    pub instance_id: String,
    pub sse_base_url: String,
    pub token_type: String,
}

#[derive(Clone, Debug)]
pub struct RuntimeConfig {
    pub app_name: String,
    pub app_version: String,
    pub bootstrap_ttl: Duration,
    pub database_path: PathBuf,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            app_name: "Lunaria".to_string(),
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            bootstrap_ttl: Duration::from_secs(60),
            database_path: default_database_path(),
        }
    }
}

pub struct RuntimeHandle {
    launch_context: LaunchContext,
    remote_access: RemoteAccessService,
    shutdown_tx: Mutex<Option<oneshot::Sender<()>>>,
    server_task: Mutex<Option<JoinHandle<Result<()>>>>,
}

impl RuntimeHandle {
    pub fn launch_context(&self) -> &LaunchContext {
        &self.launch_context
    }

    pub async fn shutdown(&self) -> Result<()> {
        self.remote_access.shutdown().await?;

        let shutdown_tx = self
            .shutdown_tx
            .lock()
            .expect("shutdown sender poisoned")
            .take();

        if let Some(tx) = shutdown_tx {
            let _ = tx.send(());
        }

        let server_task = self
            .server_task
            .lock()
            .expect("server task handle poisoned")
            .take();

        if let Some(task) = server_task {
            task.await.context("runtime server task join failed")??;
        }

        Ok(())
    }
}

#[derive(Clone)]
struct AppState {
    shared: Arc<SharedState>,
}

struct SharedState {
    app_name: String,
    app_version: String,
    api_base_url: String,
    instance_id: String,
    _database: Arc<Database>,
    config: Arc<ConfigService>,
    _resolved_config: ResolvedConfig,
    memory: MemoryService,
    sessions: SessionRepository,
    messages: MessageRepository,
    _settings: SettingsRepository,
    usage: UsageAnalyticsRepository,
    providers: ProviderRegistryService,
    plugins: PluginRegistryService,
    hooks: Arc<HookEngine>,
    routing: ProviderRoutingService,
    orchestration: OrchestrationService,
    tools: ToolExecutor,
    worker: Arc<BunWorkerBridge>,
    native_turns: NativeTurnRegistry,
    wrappers: WrapperManager,
    wrapper_turns: NativeTurnRegistry,
    remote_access: RemoteAccessService,
    terminals: RemoteTerminalManager,
    workspace_manager: Arc<WorkspaceManager>,
    workspace_reviews: Arc<WorkspaceReviewManager>,
    events: EventBroker,
    transcripts: TranscriptStore,
    bootstrap: BootstrapState,
    message_queue: crate::persistence::repositories::message_queue::MessageQueueRepository,
    tasks: crate::persistence::repositories::tasks::TaskRepository,
    extensions: Arc<crate::extensions::manager::ExtensionManager>,
}

#[derive(Clone)]
struct WorkerExecutionTarget {
    provider_id: String,
    model_id: String,
    api_key: Option<String>,
}

struct BootstrapState {
    bootstrap_token: String,
    bootstrap_expires_at: SystemTime,
    bootstrap_consumed: Mutex<bool>,
    session_token: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventEnvelope {
    pub version: i64,
    pub id: String,
    pub channel: String,
    pub event_type: String,
    pub session_id: Option<String>,
    pub occurred_at: String,
    pub payload: Value,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SessionSummary {
    id: String,
    session_mode: String,
    tui_type: String,
    working_dir: String,
    status: String,
    created_at: String,
    updated_at: String,
    metadata: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    provider_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    model_id: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HealthResponse {
    app_name: String,
    app_version: String,
    instance_id: String,
    status: &'static str,
}

#[derive(Clone)]
struct EventBroker {
    global: broadcast::Sender<EventEnvelope>,
    session_channels: Arc<Mutex<HashMap<String, broadcast::Sender<EventEnvelope>>>>,
}

#[derive(Clone)]
struct TranscriptStore {
    sessions_root: PathBuf,
}

#[derive(Clone)]
struct NativeTurnRegistry {
    flags: Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>,
}

#[derive(Clone)]
struct NativeTurnRequest {
    session_id: String,
    task_type: String,
    reasoning_mode: Option<ReasoningMode>,
    reasoning_effort: Option<ReasoningEffort>,
}

#[derive(Deserialize)]
struct BootstrapAuthRequest {
    token: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateSessionRequest {
    working_dir: String,
    session_mode: Option<String>,
    tui_type: Option<String>,
    provider_id: Option<String>,
    model_id: Option<String>,
    metadata: Option<Value>,
    parent_session_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateMessageRequest {
    content: String,
    task_type: Option<String>,
    reasoning_mode: Option<String>,
    reasoning_effort: Option<String>,
    attachments: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ToggleAutopilotRequest {
    enabled: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProviderAuthRequest {
    api_key: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PermissionDecisionRequest {
    request_id: String,
    decision: String,
    reason: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SpawnAgentRequest {
    parent_agent_id: String,
    persona_id: Option<String>,
    agent_type: String,
    model: String,
    requested_tools: Vec<String>,
    steps_limit: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateTeamRequest {
    name: String,
    division_requirements: Value,
    threshold: Option<f64>,
    shared_task_list_path: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MailboxMessageRequest {
    session_id: String,
    from_agent_id: String,
    to_agent_id: Option<String>,
    content: String,
    message_type: Option<String>,
    metadata: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManualObservationRequest {
    session_id: String,
    title: String,
    narrative: String,
    category: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MemorySearchQuery {
    query: String,
    category: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionMemoryEntryResponse {
    id: String,
    title: String,
    observation_type: String,
    category: String,
    created_at: String,
    l0_summary: String,
    l1_summary: String,
    l2_content: String,
    l0_tokens: i64,
    l1_tokens: i64,
    l2_tokens: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionMemoryTokenBudgetResponse {
    total: i64,
    l0: i64,
    l1: i64,
    l2: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionMemoryResponse {
    summary: Option<SessionSummaryRecord>,
    token_budget: SessionMemoryTokenBudgetResponse,
    entries: Vec<SessionMemoryEntryResponse>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PairingIntentRequest {
    advertised_host: Option<String>,
    #[serde(default)]
    scopes: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PairingCompleteRequest {
    #[serde(alias = "pairingToken")]
    token: String,
    #[serde(alias = "pinCode")]
    pin: String,
    #[serde(default)]
    device_metadata: RemoteDeviceMetadataRequest,
    #[serde(default)]
    device_name: Option<String>,
    #[serde(default)]
    device_type: Option<String>,
    #[serde(default)]
    platform: Option<String>,
    #[serde(default)]
    metadata: Option<Value>,
}

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RemoteDeviceMetadataRequest {
    #[serde(default)]
    name: String,
    #[serde(default, alias = "type")]
    device_type: Option<String>,
    #[serde(default)]
    platform: Option<String>,
    #[serde(default)]
    metadata: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RefreshTokenRequest {
    refresh_token: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RevokeRemoteAuthRequest {
    refresh_token: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LanListenerRequest {
    enabled: bool,
    bind_address: Option<String>,
    port: Option<u16>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LanEnableRequest {
    bind_address: Option<String>,
    port: Option<u16>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RemoteStatusResponse {
    enabled: bool,
    lan_enabled: bool,
    lan_base_url: Option<String>,
    bind_address: String,
    relay_endpoint: String,
    paired_device_count: usize,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FileTreeQuery {
    root: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FileContentQuery {
    path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FileContentUpdateRequest {
    path: String,
    content: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceFileNode {
    name: String,
    path: String,
    node_type: String,
    children: Vec<WorkspaceFileNode>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FileContentResponse {
    path: String,
    content: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RelayEventsQuery {
    last_event_id: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TerminalCreateRequest {
    shell: Option<String>,
    cwd: Option<String>,
    cols: Option<u16>,
    rows: Option<u16>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TerminalInputRequest {
    data: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TerminalResizeRequest {
    cols: u16,
    rows: u16,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateReasoningRequest {
    mode: String,
    effort: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TogglePluginRequest {
    enabled: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateSettingsRequest {
    values: Value,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct InstallReviewRequest {
    deeplink: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct InstallPluginRequest {
    deeplink_url: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExecutePluginHookRequest {
    hook: String,
    payload: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegisterHookRequest {
    event_name: String,
    handler_type: String,
    handler_config: Value,
    matcher_regex: Option<String>,
    priority: Option<i64>,
    timeout_ms: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FireHookRequest {
    event: String,
    payload: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EnqueueMessageRequest {
    content: String,
    queue_type: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EditQueueMessageRequest {
    content: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReorderQueueRequest {
    ordered_ids: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateTaskRequest {
    title: String,
    description: Option<String>,
    agent_id: Option<String>,
    priority: Option<i64>,
    parent_task_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateTaskRequest {
    title: Option<String>,
    description: Option<String>,
    status: Option<String>,
    priority: Option<i64>,
    parent_task_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReorderTasksRequest {
    ordered_ids: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct InstallExtensionRequest {
    path: Option<String>,
    url: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetExtensionEnabledRequest {
    enabled: bool,
}

pub async fn start_runtime(config: RuntimeConfig) -> Result<RuntimeHandle> {
    logging::init_logging();
    let database = Arc::new(Database::open(&config.database_path)?);
    let runtime_paths = RuntimePaths::from_database_path(&config.database_path);
    let secret_store = Arc::new(KeyringSecretStore::default());
    let config_service = Arc::new(ConfigService::new(
        runtime_paths.clone(),
        database.clone(),
        secret_store,
    ));
    let resolved_config = config_service.resolve(RuntimeResolutionRequest {
        working_dir: std::env::current_dir().ok(),
        ..RuntimeResolutionRequest::default()
    })?;
    let memory = MemoryService::new(database.clone());
    let sessions = SessionRepository::new(database.clone());
    let messages = MessageRepository::new(database.clone());
    let settings = SettingsRepository::new(database.clone());
    let usage = UsageAnalyticsRepository::new(database.clone());
    let permission_broker = PermissionBroker::new();
    let tools = ToolExecutor::new(
        crate::persistence::repositories::tool_executions::ToolExecutionRepository::new(
            database.clone(),
        ),
        crate::persistence::repositories::pending_approvals::PendingApprovalRepository::new(
            database.clone(),
        ),
        crate::persistence::repositories::memory_tiers::MemoryTierRepository::new(
            database.clone(),
        ),
        permission_broker,
    );
    let routing = ProviderRoutingService::new(database.clone(), config_service.clone());
    let orchestration = OrchestrationService::new(database.clone());
    let plugins = PluginRegistryService::new(database.clone());
    let hooks = Arc::new(HookEngine::new(database.clone()));
    let providers = ProviderRegistryService::new(
        database.clone(),
        config_service.clone(),
        Arc::new(SystemEnvironment),
        vec![],
    );
    providers.refresh_catalog().await?;
    let _ = plugins.discover(&runtime_paths.state_root.join("plugins"));
    let worker = Arc::new(
        BunWorkerBridge::new(BunWorkerConfig::default())
            .await
            .map_err(|error| anyhow::anyhow!(error.to_string()))?,
    );
    let wrappers = WrapperManager::new();
    let remote_access = RemoteAccessService::new(
        database.clone(),
        Duration::from_secs(resolved_config.global.remote_access.pairing_pin_ttl_seconds as u64),
        resolved_config.global.remote_access.relay_endpoint.clone(),
    );
    let terminals = RemoteTerminalManager::new();
    let managed_workspaces_root = runtime_paths.state_root.join("workspaces");
    let workspace_manager = Arc::new(WorkspaceManager::new(database.clone(), managed_workspaces_root.clone()));
    let workspace_reviews = Arc::new(WorkspaceReviewManager::new(database.clone(), managed_workspaces_root));
    let message_queue = crate::persistence::repositories::message_queue::MessageQueueRepository::new(database.clone());
    let tasks = crate::persistence::repositories::tasks::TaskRepository::new(database.clone());
    let extensions_dir = runtime_paths.state_root.join("extensions");
    let extension_manager = Arc::new(crate::extensions::manager::ExtensionManager::new(extensions_dir));
    let _ = extension_manager.discover().await;

    let listener = TcpListener::bind(SocketAddr::from((Ipv4Addr::LOCALHOST, 0)))
        .await
        .context("failed to bind runtime loopback listener")?;
    let bound_addr = listener
        .local_addr()
        .context("failed to determine runtime listener address")?;
    let api_base_url = format!("http://{}", bound_addr);
    let instance_id = Uuid::new_v4().to_string();
    let bootstrap_token = issue_token("lnr-bootstrap");
    let session_token = issue_token("lnr-session");
    let bootstrap_expires_at = SystemTime::now() + config.bootstrap_ttl;

    let shared = Arc::new(SharedState {
        app_name: config.app_name,
        app_version: config.app_version,
        api_base_url: api_base_url.clone(),
        instance_id: instance_id.clone(),
        _database: database,
        config: config_service,
        _resolved_config: resolved_config.clone(),
        memory,
        sessions,
        messages,
        _settings: settings,
        usage,
        providers,
        plugins,
        hooks,
        routing,
        orchestration,
        tools,
        worker,
        native_turns: NativeTurnRegistry::default(),
        wrappers,
        wrapper_turns: NativeTurnRegistry::default(),
        remote_access: remote_access.clone(),
        terminals,
        workspace_manager,
        workspace_reviews,
        events: EventBroker::new(),
        transcripts: TranscriptStore::new(runtime_paths.sessions_root),
        bootstrap: BootstrapState {
            bootstrap_token: bootstrap_token.clone(),
            bootstrap_expires_at,
            bootstrap_consumed: Mutex::new(false),
            session_token,
        },
        message_queue,
        tasks,
        extensions: extension_manager,
    });

    let launch_context = LaunchContext {
        api_base_url: api_base_url.clone(),
        bootstrap_path: V1_BOOTSTRAP_PATH.to_string(),
        bootstrap_token,
        expires_at_unix_ms: unix_millis(bootstrap_expires_at),
        instance_id: instance_id.clone(),
    };

    let app_state = AppState {
        shared: shared.clone(),
    };
    let router = build_loopback_router(app_state.clone());

    if resolved_config.global.remote_access.enabled && resolved_config.global.remote_access.lan_enabled {
        remote_access
            .enable_lan_listener(
                build_lan_router(app_state.clone()),
                &resolved_config.global.remote_access.lan_bind_address,
                None,
            )
            .await
            .context("failed to auto-enable lan listener from config")?;
    }

    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();
    let server_task = tauri::async_runtime::spawn(async move {
        axum::serve(listener, router)
            .with_graceful_shutdown(async move {
                let _ = shutdown_rx.await;
            })
            .await
            .context("runtime axum server terminated unexpectedly")
    });

    info!(
        event = "runtime_bootstrap_started",
        api_base_url = %api_base_url,
        instance_id = %instance_id,
        database_path = %config.database_path.display(),
        remote_access_enabled = resolved_config.global.remote_access.enabled,
        transcript_format = %resolved_config.transcript_format,
        bootstrap_expires_at_unix_ms = launch_context.expires_at_unix_ms
    );

    Ok(RuntimeHandle {
        launch_context,
        remote_access,
        shutdown_tx: Mutex::new(Some(shutdown_tx)),
        server_task: Mutex::new(Some(server_task)),
    })
}

fn build_loopback_router(state: AppState) -> Router {
    let protected_routes = Router::new()
        .route("/api/v1/events", get(global_events))
        .route("/api/v1/providers", get(list_providers))
        .route("/api/v1/providers/{provider_id}/models", get(list_provider_models))
        .route("/api/v1/providers/{provider_id}/auth", post(store_provider_auth))
        .route("/api/v1/providers/{provider_id}/models/{model_id}/reasoning", post(update_reasoning_defaults))
        .route("/api/v1/plugins", get(list_plugins))
        .route("/api/v1/plugins/{plugin_id}", post(toggle_plugin))
        .route("/api/v1/plugins/install-review", post(parse_plugin_install_review))
        .route("/api/v1/plugins/install", post(install_plugin))
        .route("/api/v1/plugins/{plugin_id}/uninstall", axum::routing::delete(uninstall_plugin))
        .route("/api/v1/plugins/{plugin_id}/execute", post(execute_plugin_hook))
        .route("/api/v1/plugins/{plugin_id}/health", get(get_plugin_health))
        .route("/api/v1/hooks", get(list_hooks).post(register_hook))
        .route("/api/v1/hooks/{hook_id}", axum::routing::delete(delete_hook))
        .route("/api/v1/hooks/fire", post(fire_hook))
        .route("/api/v1/settings", get(get_settings).post(update_settings))
        .route("/api/v1/remote/devices/me", get(remote_device_me))
        .route("/api/v1/remote/devices", get(list_remote_devices))
        .route("/api/v1/remote/devices/{device_id}/revoke", post(revoke_remote_device))
        .route("/api/v1/remote/status", get(remote_status))
        .route("/api/v1/remote/relay/rooms", post(create_relay_room))
        .route("/api/v1/remote/lan/enable", post(enable_remote_lan))
        .route("/api/v1/remote/lan/disable", post(disable_remote_lan))
        .route("/api/v1/remote/lan", get(remote_lan_status).post(set_remote_lan_status))
        .route("/api/v1/remote/pairing/intents", post(create_pairing_intent))
        .route("/api/v1/remote/pairing-intents", post(create_pairing_intent))
        .route("/api/v1/pair/start", post(create_pairing_intent))
        .route("/api/v1/wrappers/capabilities", get(list_wrapper_capabilities))
        .route("/api/v1/sessions", get(list_sessions).post(create_session))
        .route("/api/v1/sessions/{session_id}", axum::routing::delete(delete_session))
        .route("/api/v1/sessions/{session_id}/children", get(list_session_children))
        .route("/api/v1/sessions/{session_id}/tree", get(get_session_tree))
        .route("/api/v1/sessions/{session_id}/autopilot", post(toggle_autopilot))
        .route("/api/v1/sessions/{session_id}/messages", get(list_session_messages).post(create_message))
        .route("/api/v1/sessions/{session_id}/agents", post(spawn_subagent))
        .route("/api/v1/sessions/{session_id}/agents/list", get(list_session_agents))
        .route("/api/v1/sessions/{session_id}/interrupt", post(interrupt_session))
        .route("/api/v1/sessions/{session_id}/permissions", post(resolve_permission))
        .route("/api/v1/sessions/{session_id}/stream", get(session_events))
        .route("/api/v1/sessions/{session_id}/transcript", get(replay_transcript))
        .route("/api/v1/files/tree", get(get_file_tree))
        .route("/api/v1/files/content", get(get_file_content).post(update_file_content))
        .route("/api/v1/teams", post(create_team))
        .route("/api/v1/teams/{team_id}/mailbox", get(list_mailbox).post(send_mailbox_message))
        .route("/api/v1/memory/observe", post(observe_memory))
        .route("/api/v1/memory/search", get(search_memory))
        .route("/api/v1/sessions/{session_id}/memory", get(get_session_memory))
        .route("/api/v1/terminal/sessions", post(create_terminal_session))
        .route("/api/v1/terminal/sessions/{terminal_id}/input", post(send_terminal_input))
        .route("/api/v1/terminal/sessions/{terminal_id}/resize", post(resize_terminal_session))
        .route("/api/v1/terminal/sessions/{terminal_id}/events", get(list_terminal_events))
        .route("/api/v1/terminal/sessions/{terminal_id}", axum::routing::delete(close_terminal_session))
        .route("/api/v1/sessions/{session_id}/queue", get(list_queue_messages).post(enqueue_message))
        .route("/api/v1/sessions/{session_id}/queue/{msg_id}", axum::routing::put(edit_queue_message).delete(delete_queue_message))
        .route("/api/v1/sessions/{session_id}/queue/reorder", post(reorder_queue))
        .route("/api/v1/sessions/{session_id}/queue/flush", post(flush_queue))
        .route("/api/v1/sessions/{session_id}/tasks", get(list_session_tasks).post(create_session_task))
        .route("/api/v1/sessions/{session_id}/tasks/{task_id}", axum::routing::put(update_session_task).delete(delete_session_task))
        .route("/api/v1/sessions/{session_id}/tasks/reorder", post(reorder_session_tasks))
        .route("/api/v1/workspaces", get(list_workspaces).post(create_workspace))
        .route("/api/v1/workspaces/{workspace_id}", get(inspect_workspace).delete(destroy_workspace))
        .route("/api/v1/workspaces/{workspace_id}/archive", post(archive_workspace))
        .route("/api/v1/workspaces/{workspace_id}/reviews", post(prepare_workspace_review))
        .route("/api/v1/extensions", get(list_extensions).post(install_extension))
        .route("/api/v1/extensions/contributions", get(get_extension_contributions))
        .route("/api/v1/extensions/{ext_id}", axum::routing::delete(uninstall_extension))
        .route("/api/v1/extensions/{ext_id}/toggle", post(toggle_extension))
        .route("/api/v1/extensions/{ext_id}/panels/{panel_id}", get(get_extension_panel_html))
        .with_state(state.clone())
        .route_layer(middleware::from_fn_with_state(state.clone(), require_local_auth));

    let remote_device_routes = Router::new()
        .route("/api/v1/remote/relay/rooms/{room_id}/join", post(join_relay_room))
        .route("/api/v1/remote/relay/rooms/{room_id}/commands", post(send_relay_command))
        .route("/api/v1/remote/relay/rooms/{room_id}/events", get(list_relay_events))
        .with_state(state.clone())
        .route_layer(middleware::from_fn_with_state(state.clone(), require_remote_auth));

    Router::new()
        .route("/health", get(health))
        .route("/api/v1/health", get(health))
        .route("/api/v1/remote/health", get(health))
        .route(LEGACY_BOOTSTRAP_PATH, post(bootstrap_auth))
        .route(V1_BOOTSTRAP_PATH, post(bootstrap_auth))
        .route("/api/v1/pair/complete", post(complete_pairing))
        .route("/api/v1/remote/pair/complete", post(complete_pairing))
        .route("/api/v1/remote/pairings/complete", post(complete_pairing))
        .route("/api/v1/auth/refresh", post(refresh_remote_auth))
        .route("/api/v1/remote/auth/refresh", post(refresh_remote_auth))
        .route("/api/v1/auth/revoke", post(revoke_remote_auth))
        .route("/api/v1/remote/auth/revoke", post(revoke_remote_auth))
        .with_state(state)
        .merge(protected_routes)
        .merge(remote_device_routes)
}

fn build_lan_router(state: AppState) -> Router {
    let protected_routes = Router::new()
        .route("/api/v1/events", get(global_events))
        .route("/api/v1/sessions", get(list_sessions))
        .route("/api/v1/sessions/{session_id}/messages", get(list_session_messages).post(create_message))
        .route("/api/v1/sessions/{session_id}/agents/list", get(list_session_agents))
        .route("/api/v1/sessions/{session_id}/stream", get(session_events))
        .route("/api/v1/sessions/{session_id}/transcript", get(replay_transcript))
        .route("/api/v1/sessions/{session_id}/memory", get(get_session_memory))
        .route("/api/v1/remote/devices/me", get(remote_device_me))
        .route("/api/v1/remote/sessions/{session_id}/permissions", post(resolve_permission))
        .route("/api/v1/terminal/sessions", post(create_terminal_session))
        .route("/api/v1/terminal/sessions/{terminal_id}/input", post(send_terminal_input))
        .route("/api/v1/terminal/sessions/{terminal_id}/resize", post(resize_terminal_session))
        .route("/api/v1/terminal/sessions/{terminal_id}/events", get(list_terminal_events))
        .route("/api/v1/terminal/sessions/{terminal_id}", axum::routing::delete(close_terminal_session))
        .route("/api/v1/remote/relay/rooms/{room_id}/join", post(join_relay_room))
        .route("/api/v1/remote/relay/rooms/{room_id}/commands", post(send_relay_command))
        .route("/api/v1/remote/relay/rooms/{room_id}/events", get(list_relay_events))
        .with_state(state.clone())
        .route_layer(middleware::from_fn_with_state(state.clone(), require_remote_auth));

    Router::new()
        .route("/health", get(health))
        .route("/api/v1/health", get(health))
        .route("/api/v1/remote/health", get(health))
        .route("/api/v1/pair/complete", post(complete_pairing))
        .route("/api/v1/remote/pair/complete", post(complete_pairing))
        .route("/api/v1/remote/pairings/complete", post(complete_pairing))
        .route("/api/v1/auth/refresh", post(refresh_remote_auth))
        .route("/api/v1/remote/auth/refresh", post(refresh_remote_auth))
        .route("/api/v1/auth/revoke", post(revoke_remote_auth))
        .route("/api/v1/remote/auth/revoke", post(revoke_remote_auth))
        .with_state(state)
        .merge(protected_routes)
}

async fn require_local_auth(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> std::result::Result<Response, StatusCode> {
    let token = bearer_token(&request)?;
    if token != state.shared.bootstrap.session_token {
        return Err(StatusCode::UNAUTHORIZED);
    }
    Ok(next.run(request).await)
}

async fn require_remote_auth(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> std::result::Result<Response, StatusCode> {
    let token = bearer_token(&request)?;
    if state
        .shared
        .remote_access
        .authenticate_access_token(token)
        .map_err(|error| internal_error("remote_auth_failed", error))?
        .is_none()
    {
        return Err(StatusCode::UNAUTHORIZED);
    }
    Ok(next.run(request).await)
}

fn bearer_token(request: &Request<Body>) -> std::result::Result<&str, StatusCode> {
    bearer_token_from_headers(request.headers()).or_else(|_| {
        request
            .uri()
            .query()
            .and_then(|query| {
                query.split('&').find_map(|entry| {
                    let mut parts = entry.splitn(2, '=');
                    let key = parts.next()?;
                    let value = parts.next()?;
                    (key == "authToken").then_some(value)
                })
            })
            .ok_or(StatusCode::UNAUTHORIZED)
    })
}

fn bearer_token_from_headers(headers: &HeaderMap) -> std::result::Result<&str, StatusCode> {
    let Some(header) = headers.get(AUTHORIZATION) else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    let Ok(header) = header.to_str() else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    let Some(token) = header.strip_prefix("Bearer ") else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    Ok(token)
}


async fn bootstrap_auth(
    State(state): State<AppState>,
    Json(request): Json<BootstrapAuthRequest>,
) -> std::result::Result<Json<BootstrapSession>, StatusCode> {
    let is_expired = SystemTime::now() > state.shared.bootstrap.bootstrap_expires_at;
    let mut bootstrap_consumed = state
        .shared
        .bootstrap
        .bootstrap_consumed
        .lock()
        .expect("bootstrap guard poisoned");

    let is_authorized = !*bootstrap_consumed
        && !is_expired
        && request.token == state.shared.bootstrap.bootstrap_token;

    if !is_authorized {
        warn!(
            event = "runtime_bootstrap_auth_rejected",
            instance_id = %state.shared.instance_id,
            expired = is_expired,
            already_consumed = *bootstrap_consumed
        );
        return Err(StatusCode::UNAUTHORIZED);
    }

    *bootstrap_consumed = true;

    info!(
        event = "runtime_bootstrap_auth_succeeded",
        instance_id = %state.shared.instance_id
    );

    Ok(Json(BootstrapSession {
        api_base_url: state.shared.api_base_url.clone(),
        auth_token: state.shared.bootstrap.session_token.clone(),
        instance_id: state.shared.instance_id.clone(),
        sse_base_url: format!("{}/api/v1/events", state.shared.api_base_url),
        token_type: "Bearer".to_string(),
    }))
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        app_name: state.shared.app_name.clone(),
        app_version: state.shared.app_version.clone(),
        instance_id: state.shared.instance_id.clone(),
        status: "ok",
    })
}

async fn remote_lan_status(
    State(state): State<AppState>,
) -> std::result::Result<Json<LanListenerStatus>, StatusCode> {
    let status = state
        .shared
        .remote_access
        .lan_status()
        .map_err(|error| internal_error("remote_lan_status_failed", error))?;
    Ok(Json(status))
}

async fn remote_status(
    State(state): State<AppState>,
) -> std::result::Result<Json<RemoteStatusResponse>, StatusCode> {
    let lan_status = state
        .shared
        .remote_access
        .lan_status()
        .map_err(|error| internal_error("remote_status_failed", error))?;
    let paired_device_count = state
        .shared
        .remote_access
        .list_devices()
        .map_err(|error| internal_error("remote_status_failed", error))?
        .len();

    Ok(Json(RemoteStatusResponse {
        enabled: lan_status.enabled || paired_device_count > 0,
        lan_enabled: lan_status.enabled,
        lan_base_url: lan_status.lan_base_url,
        bind_address: lan_status.bind_address,
        relay_endpoint: state.shared._resolved_config.global.remote_access.relay_endpoint.clone(),
        paired_device_count,
    }))
}

async fn enable_remote_lan(
    State(state): State<AppState>,
    Json(request): Json<LanEnableRequest>,
) -> std::result::Result<Json<LanListenerStatus>, StatusCode> {
    let bind_address = request
        .bind_address
        .unwrap_or_else(|| state.shared._resolved_config.global.remote_access.lan_bind_address.clone());
    update_remote_lan_status(state, true, bind_address, request.port).await
}

async fn disable_remote_lan(
    State(state): State<AppState>,
) -> std::result::Result<Json<LanListenerStatus>, StatusCode> {
    let bind_address = state
        .shared
        ._resolved_config
        .global
        .remote_access
        .lan_bind_address
        .clone();
    update_remote_lan_status(state, false, bind_address, None).await
}

async fn set_remote_lan_status(
    State(state): State<AppState>,
    Json(request): Json<LanListenerRequest>,
) -> std::result::Result<Json<LanListenerStatus>, StatusCode> {
    let bind_address = request
        .bind_address
        .unwrap_or_else(|| state.shared._resolved_config.global.remote_access.lan_bind_address.clone());

    update_remote_lan_status(state, request.enabled, bind_address, request.port).await
}

async fn update_remote_lan_status(
    state: AppState,
    enabled: bool,
    bind_address: String,
    port: Option<u16>,
) -> std::result::Result<Json<LanListenerStatus>, StatusCode> {

    state
        .shared
        .config
        .put_setting("remote_access.enabled", SettingScope::Global, None, &enabled)
        .map_err(|error| internal_error("remote_setting_update_failed", error))?;
    state
        .shared
        .config
        .put_setting("remote_access.lan.enabled", SettingScope::Global, None, &enabled)
        .map_err(|error| internal_error("remote_setting_update_failed", error))?;
    state
        .shared
        .config
        .put_setting("remote_access.lan.bind_address", SettingScope::Global, None, &bind_address)
        .map_err(|error| internal_error("remote_setting_update_failed", error))?;

    let status = if enabled {
        state
            .shared
            .remote_access
            .enable_lan_listener(build_lan_router(state.clone()), &bind_address, port)
            .await
            .map_err(|error| internal_error("remote_lan_enable_failed", error))?
    } else {
        state
            .shared
            .remote_access
            .disable_lan_listener()
            .await
            .map_err(|error| internal_error("remote_lan_disable_failed", error))?
    };

    Ok(Json(status))
}

async fn create_pairing_intent(
    State(state): State<AppState>,
    request: Option<Json<PairingIntentRequest>>,
) -> std::result::Result<(StatusCode, Json<PairingIntentResponse>), StatusCode> {
    let request = request.map(|Json(value)| value).unwrap_or(PairingIntentRequest {
        advertised_host: None,
        scopes: Vec::new(),
    });
    let mut payload = state
        .shared
        .remote_access
        .create_pairing_intent(request.advertised_host.as_deref())
        .map_err(|error: anyhow::Error| {
            if error.to_string().contains("lan listener must be enabled") {
                warn!(event = "remote_pairing_intent_failed", error = %error);
                StatusCode::CONFLICT
            } else {
                internal_error("remote_pairing_intent_failed", error)
            }
        })?;
    if !request.scopes.is_empty() {
        state
            .shared
            .remote_access
            .set_pairing_scopes(&payload.pairing_token, request.scopes)
            .map_err(|error| internal_error("remote_pairing_scope_failed", error))?;
    }
    payload.pin = payload.pin_code.clone();
    Ok((StatusCode::CREATED, Json(payload)))
}

async fn complete_pairing(
    State(state): State<AppState>,
    Json(request): Json<PairingCompleteRequest>,
) -> std::result::Result<(StatusCode, Json<PairingCompleteResponse>), StatusCode> {
    let nested_name = if request.device_metadata.name.is_empty() {
        None
    } else {
        Some(request.device_metadata.name)
    };
    let device_name = nested_name
        .or(request.device_name)
        .ok_or(StatusCode::BAD_REQUEST)?;
    let device_type = request
        .device_metadata
        .device_type
        .or(request.device_type);
    let platform = request.device_metadata.platform.or(request.platform);
    let payload = state
        .shared
        .remote_access
        .complete_pairing(
            &request.token,
            &request.pin,
            DeviceMetadata {
                name: device_name,
                device_type: parse_device_type(device_type)?,
                platform,
                metadata: request
                    .device_metadata
                    .metadata
                    .or(request.metadata)
                    .unwrap_or_else(|| json!({})),
            },
        )
        .map_err(|error| auth_error("remote_pairing_complete_failed", error))?;
    Ok((StatusCode::CREATED, Json(payload)))
}

async fn refresh_remote_auth(
    State(state): State<AppState>,
    Json(request): Json<RefreshTokenRequest>,
) -> std::result::Result<Json<PairingCompleteResponse>, StatusCode> {
    let payload = state
        .shared
        .remote_access
        .refresh(&request.refresh_token)
        .map_err(|error| auth_error("remote_refresh_failed", error))?;
    Ok(Json(payload))
}

async fn revoke_remote_auth(
    State(state): State<AppState>,
    Json(request): Json<RevokeRemoteAuthRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .remote_access
        .revoke_refresh_token(&request.refresh_token)
        .map_err(|error| auth_error("remote_revoke_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn create_relay_room(
    State(state): State<AppState>,
) -> std::result::Result<(StatusCode, Json<RelayRoomResponse>), StatusCode> {
    let room = state
        .shared
        .remote_access
        .create_relay_room()
        .map_err(|error| internal_error("relay_room_create_failed", error))?;
    Ok((StatusCode::CREATED, Json(room)))
}

async fn join_relay_room(
    Path(room_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<RelayJoinRequest>,
) -> std::result::Result<Json<RelayJoinResponse>, StatusCode> {
    let joined = state
        .shared
        .remote_access
        .join_relay_room(&room_id, request)
        .map_err(|error| auth_error("relay_room_join_failed", error))?;
    Ok(Json(joined))
}

async fn send_relay_command(
    Path(room_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<RelayCommandRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let Some(command) = state
        .shared
        .remote_access
        .accept_relay_command(&room_id, request.clone())
        .map_err(|error| auth_error("relay_command_failed", error))?
    else {
        return Ok(StatusCode::ACCEPTED);
    };

    let payload = match command.get("kind").and_then(Value::as_str) {
        Some("sessions.list") => {
            let sessions = state
                .shared
                .sessions
                .list()
                .map_err(|error| internal_error("relay_sessions_list_failed", error))?
                .into_iter()
                .map(SessionSummary::from_record)
                .collect::<Vec<_>>();
            json!({ "sessions": sessions })
        }
        Some("permissions.resolve") => {
            let session_id = command
                .get("sessionId")
                .and_then(Value::as_str)
                .ok_or(StatusCode::BAD_REQUEST)?;
            let request_id = command
                .get("requestId")
                .and_then(Value::as_str)
                .ok_or(StatusCode::BAD_REQUEST)?;
            let decision = command
                .get("decision")
                .and_then(Value::as_str)
                .ok_or(StatusCode::BAD_REQUEST)?;
            resolve_permission_inner(
                &state.shared,
                session_id,
                request_id,
                decision,
                command
                    .get("reason")
                    .and_then(Value::as_str)
                    .map(str::to_string),
            )?;
            json!({ "ok": true })
        }
        _ => return Err(StatusCode::BAD_REQUEST),
    };

    state
        .shared
        .remote_access
        .push_relay_response(
            &room_id,
            request.request_id.as_str(),
            &json!({
                "requestId": request.request_id,
                "payload": payload
            }),
        )
        .map_err(|error| internal_error("relay_response_failed", error))?;

    Ok(StatusCode::ACCEPTED)
}

async fn list_relay_events(
    Path(room_id): Path<String>,
    Query(query): Query<RelayEventsQuery>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<RelayRoomEvent>>, StatusCode> {
    let events = state
        .shared
        .remote_access
        .relay_events_since(&room_id, query.last_event_id)
        .map_err(|error| internal_error("relay_events_failed", error))?;
    Ok(Json(events))
}

async fn remote_device_me(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> std::result::Result<Json<Value>, StatusCode> {
    let token = bearer_token_from_headers(&headers)?;
    let Some(subject) = state
        .shared
        .remote_access
        .authenticate_access_token(token)
        .map_err(|error| internal_error("remote_auth_failed", error))?
    else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    let Some(device) = state
        .shared
        .remote_access
        .get_device(&subject.device_id)
        .map_err(|error| internal_error("remote_device_lookup_failed", error))?
    else {
        return Err(StatusCode::NOT_FOUND);
    };

    Ok(Json(json!({
        "deviceId": device.device_id,
        "name": device.name,
        "deviceType": device.device_type.as_str(),
        "platform": device.platform,
        "pairedAt": device.paired_at,
        "lastSeen": device.last_seen,
        "scopes": subject.scopes,
        "status": device.status.as_str(),
        "revokedAt": device.revoked_at,
    })))
}
async fn list_remote_devices(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<Value>>, StatusCode> {
    let devices = state
        .shared
        .remote_access
        .list_devices()
        .map_err(|error| internal_error("remote_device_list_failed", error))?
        .into_iter()
        .map(|device| {
            json!({
                "deviceId": device.device_id,
                "name": device.name,
                "deviceType": device.device_type.as_str(),
                "platform": device.platform,
                "pairedAt": device.paired_at,
                "lastSeen": device.last_seen,
                "scopes": device.scopes,
                "status": device.status.as_str(),
                "revokedAt": device.revoked_at,
            })
        })
        .collect::<Vec<_>>();
    Ok(Json(devices))
}

async fn revoke_remote_device(
    Path(device_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .remote_access
        .revoke_device(&device_id)
        .map_err(|error| internal_error("remote_device_revoke_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}


async fn create_terminal_session(
    State(state): State<AppState>,
    Json(request): Json<TerminalCreateRequest>,
) -> std::result::Result<(StatusCode, Json<TerminalSessionCreated>), StatusCode> {
    let created = state
        .shared
        .terminals
        .create(request.shell, request.cwd, request.cols, request.rows)
        .await
        .map_err(|error| internal_error("terminal_create_failed", error))?;
    Ok((StatusCode::CREATED, Json(created)))
}

async fn send_terminal_input(
    Path(terminal_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<TerminalInputRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .terminals
        .input(&terminal_id, &request.data)
        .await
        .map_err(|error| internal_error("terminal_input_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn resize_terminal_session(
    Path(terminal_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<TerminalResizeRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .terminals
        .resize(&terminal_id, request.cols, request.rows)
        .map_err(|error| internal_error("terminal_resize_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_terminal_events(
    Path(terminal_id): Path<String>,
    Query(query): Query<RelayEventsQuery>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<TerminalOutputEvent>>, StatusCode> {
    let events = state
        .shared
        .terminals
        .events_since(&terminal_id, query.last_event_id)
        .map_err(|error| internal_error("terminal_events_failed", error))?;
    Ok(Json(events))
}

async fn close_terminal_session(
    Path(terminal_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .terminals
        .close(&terminal_id)
        .await
        .map_err(|error| internal_error("terminal_close_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_sessions(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<SessionSummary>>, StatusCode> {
    let sessions = state
        .shared
        .sessions
        .list()
        .map_err(|error| internal_error("session_list_failed", error))?;

    Ok(Json(
        sessions
            .into_iter()
            .filter(|session| session.status != SessionStatus::Archived)
            .map(SessionSummary::from_record)
            .collect::<Vec<_>>(),
    ))
}

async fn delete_session(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    let Some(mut session) = state
        .shared
        .sessions
        .get(&session_id)
        .map_err(|error| internal_error("session_lookup_failed", error))?
    else {
        return Err(StatusCode::NOT_FOUND);
    };

    // Fire SessionEnd hook
    let hooks = state.shared.hooks.clone();
    let session_id_for_hook = session_id.clone();
    let hook_payload = json!({ "sessionId": session_id_for_hook });
    tokio::spawn(async move { let _ = hooks.fire(HookEvent::SessionEnd, hook_payload).await; });

    session.status = SessionStatus::Archived;
    session.updated_at = utc_now();
    state
        .shared
        .sessions
        .update(&session)
        .map_err(|error| internal_error("session_archive_failed", error))?;
    state.shared.native_turns.cancel(&session_id);
    state.shared.wrapper_turns.cancel(&session_id);

    let summary = SessionSummary::from_record(session.clone());
    let payload = serde_json::to_value(&summary).expect("session summary should serialize");
    state.shared.events.publish_global(EventEnvelope::new(
        "global",
        "session.deleted",
        Some(session_id.clone()),
        payload.clone(),
    ));
    state
        .shared
        .record_session_event(
            &session_id,
            EventEnvelope::new(
                "session.lifecycle",
                "session.deleted",
                Some(session_id.clone()),
                payload,
            ),
        )
        .map_err(|error| internal_error("session_delete_event_failed", error))?;

    Ok(StatusCode::NO_CONTENT)
}

async fn toggle_autopilot(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<ToggleAutopilotRequest>,
) -> std::result::Result<Json<SessionRecord>, StatusCode> {
    let Some(mut session) = state
        .shared
        .sessions
        .get(&session_id)
        .map_err(|error| internal_error("session_lookup_failed", error))?
    else {
        return Err(StatusCode::NOT_FOUND);
    };

    let mut metadata = session.metadata.as_object().cloned().unwrap_or_default();
    metadata.insert("autopilot".to_string(), Value::Bool(request.enabled));
    session.metadata = Value::Object(metadata);
    session.updated_at = utc_now();
    let current_phase = request.enabled.then_some("goal_analysis");

    state
        .shared
        .sessions
        .update(&session)
        .map_err(|error| internal_error("session_update_failed", error))?;

    state
        .shared
        .record_session_event(
            &session_id,
            EventEnvelope::new(
                "session.stream",
                "autopilot.phase",
                Some(session_id.clone()),
                json!({
                    "enabled": request.enabled,
                    "currentPhase": current_phase
                }),
            ),
        )
        .map_err(|error| internal_error("session_event_write_failed", error))?;

    state.shared.events.publish_global(EventEnvelope::new(
        "global",
        "session.updated",
        Some(session_id),
        json!({ "autopilot": request.enabled }),
    ));

    Ok(Json(session))
}

async fn list_session_messages(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<MessageRecord>>, StatusCode> {
    let messages = state
        .shared
        .messages
        .list_by_session(&session_id)
        .map_err(|error| internal_error("session_messages_list_failed", error))?;
    Ok(Json(messages))
}

async fn list_session_agents(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::AgentRecord>>, StatusCode> {
    let agents = crate::persistence::repositories::agents::AgentRepository::new(
        state.shared._database.clone(),
    )
    .list_by_session(&session_id)
    .map_err(|error| internal_error("session_agents_list_failed", error))?;
    Ok(Json(agents))
}

async fn get_session_memory(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<SessionMemoryResponse>, StatusCode> {
    let session = state
        .shared
        .sessions
        .get(&session_id)
        .map_err(|error| internal_error("session_lookup_failed", error))?;
    let Some(session) = session else {
        return Err(StatusCode::NOT_FOUND);
    };

    let entries = state
        .shared
        .memory
        .list_recent_for_session(&session_id, 25)
        .map_err(|error| internal_error("session_memory_list_failed", error))?;
    let summary = state
        .shared
        .memory
        .session_summary(&session_id)
        .map_err(|error| internal_error("session_memory_summary_failed", error))?;

    let mapped = entries
        .into_iter()
        .map(|result| {
            let fallback_content = result
                .observation
                .narrative
                .clone()
                .unwrap_or_else(|| result.observation.title.clone());
            let tiers = result.tiers;
            SessionMemoryEntryResponse {
                id: result.observation.id,
                title: result.observation.title,
                observation_type: result.observation.observation_type,
                category: result.observation.category.as_str().to_string(),
                created_at: result.observation.created_at,
                l0_summary: tiers
                    .as_ref()
                    .map(|value| value.l0_summary.clone())
                    .unwrap_or_else(|| fallback_content.clone()),
                l1_summary: tiers
                    .as_ref()
                    .map(|value| value.l1_summary.clone())
                    .unwrap_or_else(|| fallback_content.clone()),
                l2_content: tiers
                    .as_ref()
                    .map(|value| value.l2_content.clone())
                    .unwrap_or(fallback_content),
                l0_tokens: tiers.as_ref().map(|value| value.l0_tokens).unwrap_or(0),
                l1_tokens: tiers.as_ref().map(|value| value.l1_tokens).unwrap_or(0),
                l2_tokens: tiers.as_ref().map(|value| value.l2_tokens).unwrap_or(0),
            }
        })
        .collect::<Vec<_>>();

    let token_budget = SessionMemoryTokenBudgetResponse {
        total: if session.context_token_count > 0 {
            session.context_token_count
        } else {
            100_000
        },
        l0: mapped.iter().map(|entry| entry.l0_tokens).sum(),
        l1: mapped.iter().map(|entry| entry.l1_tokens).sum(),
        l2: mapped.iter().map(|entry| entry.l2_tokens).sum(),
    };

    Ok(Json(SessionMemoryResponse {
        summary,
        token_budget,
        entries: mapped,
    }))
}

async fn get_file_tree(
    Query(query): Query<FileTreeQuery>,
    State(_state): State<AppState>,
) -> std::result::Result<Json<Vec<WorkspaceFileNode>>, StatusCode> {
    let root = PathBuf::from(query.root);
    let tree = build_file_tree(&root, 0).map_err(|error| internal_error("file_tree_failed", error))?;
    Ok(Json(tree))
}

async fn get_file_content(
    Query(query): Query<FileContentQuery>,
    State(_state): State<AppState>,
) -> std::result::Result<Json<FileContentResponse>, StatusCode> {
    let path = PathBuf::from(&query.path);
    let content = std::fs::read_to_string(&path)
        .map_err(|error| internal_error("file_content_failed", error.into()))?;
    Ok(Json(FileContentResponse {
        path: query.path,
        content,
    }))
}

async fn update_file_content(
    State(_state): State<AppState>,
    Json(request): Json<FileContentUpdateRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    std::fs::write(&request.path, request.content)
        .map_err(|error| internal_error("file_content_update_failed", error.into()))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_providers(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::providers::ProviderSummary>>, StatusCode> {
    let providers = state
        .shared
        .providers
        .list_providers()
        .map_err(|error| internal_error("provider_list_failed", error))?;

    Ok(Json(providers))
}

async fn list_wrapper_capabilities(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::wrappers::WrapperAdapterCapabilities>>, StatusCode> {
    Ok(Json(state.shared.wrappers.capabilities()))
}

async fn list_provider_models(
    Path(provider_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::ProviderModelRecord>>, StatusCode> {
    let models = state
        .shared
        .providers
        .list_models(&provider_id)
        .map_err(|error| internal_error("provider_model_list_failed", error))?;

    Ok(Json(models))
}

async fn store_provider_auth(
    Path(provider_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<ProviderAuthRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .providers
        .store_api_key(&provider_id, &request.api_key)
        .await
        .map_err(|error| internal_error("provider_auth_store_failed", error))?;

    Ok(StatusCode::NO_CONTENT)
}

async fn update_reasoning_defaults(
    Path((provider_id, model_id)): Path<(String, String)>,
    State(state): State<AppState>,
    Json(request): Json<UpdateReasoningRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .config
        .put_setting(
            &format!("providers.reasoning.{provider_id}/{model_id}.mode"),
            SettingScope::Global,
            None,
            &request.mode,
        )
        .map_err(|error| internal_error("reasoning_mode_update_failed", error))?;
    if let Some(effort) = request.effort {
        state
            .shared
            .config
            .put_setting(
                &format!("providers.reasoning.{provider_id}/{model_id}.effort"),
                SettingScope::Global,
                None,
                &effort,
            )
            .map_err(|error| internal_error("reasoning_effort_update_failed", error))?;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn list_plugins(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::PluginRecord>>, StatusCode> {
    let plugins = state
        .shared
        .plugins
        .list()
        .map_err(|error| internal_error("plugin_list_failed", error))?;
    Ok(Json(plugins))
}

async fn toggle_plugin(
    Path(plugin_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<TogglePluginRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .plugins
        .set_enabled(&plugin_id, request.enabled)
        .map_err(|error| internal_error("plugin_toggle_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_hooks(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::HookRecord>>, StatusCode> {
    let hooks = state
        .shared
        .hooks
        .list()
        .map_err(|error| internal_error("hook_list_failed", error))?;
    Ok(Json(hooks))
}

async fn register_hook(
    State(state): State<AppState>,
    Json(request): Json<RegisterHookRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let handler_type = match request.handler_type.as_str() {
        "command" => crate::persistence::HookHandlerType::Command,
        "http" => crate::persistence::HookHandlerType::Http,
        "prompt" => crate::persistence::HookHandlerType::Prompt,
        "agent" => crate::persistence::HookHandlerType::Agent,
        _ => return Err(StatusCode::BAD_REQUEST),
    };
    let hook = crate::persistence::HookRecord {
        id: Uuid::new_v4().to_string(),
        event_name: request.event_name,
        handler_type,
        handler_config: request.handler_config,
        matcher_regex: request.matcher_regex,
        enabled: true,
        priority: request.priority.unwrap_or(100),
        timeout_ms: request.timeout_ms.unwrap_or(30_000),
    };
    state
        .shared
        .hooks
        .register(hook)
        .map_err(|error| internal_error("hook_register_failed", error))?;
    Ok(StatusCode::CREATED)
}

async fn delete_hook(
    Path(hook_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .hooks
        .delete(&hook_id)
        .map_err(|error| internal_error("hook_delete_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn fire_hook(
    State(state): State<AppState>,
    Json(request): Json<FireHookRequest>,
) -> std::result::Result<Json<Vec<crate::hooks::HookInvocationResult>>, StatusCode> {
    let event = crate::hooks::HookEvent::from_str(&request.event)
        .ok_or(StatusCode::BAD_REQUEST)?;
    let payload = request.payload.unwrap_or(json!({}));
    let results = state
        .shared
        .hooks
        .fire(event, payload)
        .await
        .map_err(|error| internal_error("hook_fire_failed", error))?;
    Ok(Json(results))
}

async fn parse_plugin_install_review(
    State(state): State<AppState>,
    Json(request): Json<InstallReviewRequest>,
) -> std::result::Result<Json<crate::plugins::InstallReviewIntent>, StatusCode> {
    let review = state
        .shared
        .plugins
        .parse_install_deeplink(&request.deeplink)
        .map_err(|error| internal_error("plugin_install_review_failed", error))?;
    Ok(Json(review))
}

async fn install_plugin(
    State(state): State<AppState>,
    Json(request): Json<InstallPluginRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let intent = state
        .shared
        .plugins
        .parse_install_deeplink(&request.deeplink_url)
        .map_err(|error| internal_error("plugin_install_failed", error))?;
    let _ = state
        .shared
        .plugins
        .discover(&std::path::PathBuf::from(&intent.source));
    Ok(StatusCode::CREATED)
}

async fn uninstall_plugin(
    Path(plugin_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .plugins
        .uninstall(&plugin_id)
        .map_err(|error| internal_error("plugin_uninstall_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn execute_plugin_hook(
    Path(plugin_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<ExecutePluginHookRequest>,
) -> std::result::Result<Json<Value>, StatusCode> {
    let result = state
        .shared
        .plugins
        .execute_hook(&plugin_id, &request.hook, request.payload.unwrap_or(json!({})), None)
        .await
        .map_err(|error| internal_error("plugin_execute_failed", error))?;
    Ok(Json(result))
}

async fn get_plugin_health(
    Path(plugin_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Value>, StatusCode> {
    let plugin = state
        .shared
        .plugins
        .get_record(&plugin_id)
        .map_err(|error| internal_error("plugin_load_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(json!({
        "id": plugin.id,
        "healthStatus": plugin.health_status.as_str(),
        "errorCount": plugin.error_count,
        "lastError": plugin.last_error,
        "lastEventAt": plugin.last_event_at,
        "latencyMsAvg": plugin.latency_ms_avg,
    })))
}

async fn get_settings(
    State(state): State<AppState>,
) -> std::result::Result<Json<Value>, StatusCode> {
    Ok(Json(json!({
        "ui": state.shared._resolved_config.global.ui,
        "notifications": state.shared._resolved_config.global.notifications,
        "telemetry": state.shared._resolved_config.global.telemetry,
        "remoteAccess": state.shared._resolved_config.global.remote_access,
        "settings": state.shared._resolved_config.settings,
    })))
}

async fn update_settings(
    State(state): State<AppState>,
    Json(request): Json<UpdateSettingsRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let Some(values) = request.values.as_object() else {
        return Err(StatusCode::BAD_REQUEST);
    };

    for (key, value) in values {
        state
            .shared
            .config
            .put_setting(key, SettingScope::Global, None, value)
            .map_err(|error| internal_error("settings_update_failed", error))?;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn resolve_permission(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<PermissionDecisionRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    resolve_permission_inner(
        &state.shared,
        &session_id,
        &request.request_id,
        &request.decision,
        request.reason.clone(),
    )?;

    // Fire PermissionRequest hook
    let hooks = state.shared.hooks.clone();
    let hook_payload = json!({ "sessionId": session_id, "requestId": request.request_id, "decision": request.decision });
    tokio::spawn(async move { let _ = hooks.fire(HookEvent::PermissionRequest, hook_payload).await; });

    Ok(StatusCode::NO_CONTENT)
}

fn resolve_permission_inner(
    shared: &SharedState,
    session_id: &str,
    request_id: &str,
    decision: &str,
    reason: Option<String>,
) -> std::result::Result<(), StatusCode> {
    let pending = shared
        .tools
        .approvals()
        .get(request_id)
        .map_err(|error| internal_error("permission_lookup_failed", error))?;
    let Some(pending) = pending else {
        return Err(StatusCode::NOT_FOUND);
    };
    if pending.session_id != session_id {
        return Err(StatusCode::BAD_REQUEST);
    }

    let resolution = PermissionResolution {
        decision: match decision {
            "approve" => PendingApprovalDecision::Approved,
            "deny" => PendingApprovalDecision::Denied,
            _ => return Err(StatusCode::BAD_REQUEST),
        },
        reason: reason.clone(),
    };

    shared
        .tools
        .resolve_approval(request_id, resolution)
        .map_err(|error| internal_error("permission_resolve_failed", error))?;

    let status = match decision {
        "approve" => crate::persistence::PendingApprovalStatus::Approved,
        "deny" => crate::persistence::PendingApprovalStatus::Denied,
        _ => return Err(StatusCode::BAD_REQUEST),
    };
    shared
        .tools
        .approvals()
        .update_resolution(request_id, status, reason.clone(), utc_now())
        .map_err(|error| internal_error("permission_resolution_persist_failed", error))?;

    shared
        .record_session_event(
            session_id,
            EventEnvelope::new(
                "session.stream",
                "permission.resolved",
                Some(session_id.to_string()),
                json!({ "requestId": request_id, "decision": decision, "reason": reason }),
            ),
        )
        .map_err(|error| internal_error("permission_event_write_failed", error))?;
    shared
        .record_session_event(
            session_id,
            EventEnvelope::new(
                "session.lifecycle",
                "permission.resolved",
                Some(session_id.to_string()),
                json!({
                    "requestId": request_id,
                    "decision": decision,
                    "reason": reason,
                }),
            ),
        )
        .map_err(|error| internal_error("permission_lifecycle_event_write_failed", error))?;
    Ok(())
}

async fn create_session(
    State(state): State<AppState>,
    Json(request): Json<CreateSessionRequest>,
) -> std::result::Result<(StatusCode, Json<SessionSummary>), StatusCode> {
    let created_at = utc_now();
    let persona = PersonaProfile::load(default_native_persona_path())
        .map_err(|error| internal_error("persona_load_failed", error))?;
    let session = SessionRecord {
        id: Uuid::new_v4().to_string(),
        parent_session_id: request.parent_session_id.clone(),
        session_type: if request.parent_session_id.is_some() { SessionType::Child } else { SessionType::Primary },
        session_mode: request
            .session_mode
            .as_deref()
            .unwrap_or("native")
            .parse()
            .map_err(|_| StatusCode::BAD_REQUEST)?,
        tui_type: request
            .tui_type
            .as_deref()
            .unwrap_or("native")
            .parse()
            .map_err(|_| StatusCode::BAD_REQUEST)?,
        provider_id: request.provider_id,
        model_id: request.model_id,
        working_dir: request.working_dir,
        compaction_count: 0,
        context_token_count: 0,
        workspace_id: None,
        created_at: created_at.clone(),
        updated_at: created_at.clone(),
        status: SessionStatus::Created,
        metadata: merge_session_metadata(
            request.metadata,
            json!({
                "persona": {
                    "path": default_native_persona_path().display().to_string(),
                    "name": persona.name,
                "division": persona.division,
                "collaborationStyle": persona.collaboration_style,
                "communicationPreference": persona.communication_preference,
                "decisionWeight": persona.decision_weight,
                "tools": persona.tools,
                "permissions": persona.permissions,
                }
            }),
        ),
    };

    state
        .shared
        .sessions
        .insert(&session)
        .map_err(|error| internal_error("session_create_failed", error))?;

    // Fire SessionStart hook
    let hooks = state.shared.hooks.clone();
    let session_id_for_hook = session.id.clone();
    let hook_payload = json!({ "sessionId": session_id_for_hook, "sessionMode": session.session_mode.as_str() });
    tokio::spawn(async move { let _ = hooks.fire(HookEvent::SessionStart, hook_payload).await; });

    state.shared.native_turns.register(&session.id);
    state.shared.wrapper_turns.register(&session.id);

    let primary_agent = state
        .shared
        .orchestration
        .create_primary_agent(
            &session.id,
            &default_native_persona_path(),
            session.model_id.as_deref().unwrap_or("gpt-5-mini"),
        )
        .map_err(|error| internal_error("primary_agent_create_failed", error))?;
    state
        .shared
        .record_session_event(
            &session.id,
            EventEnvelope::new(
                "session.lifecycle",
                "agent.spawned",
                Some(session.id.clone()),
                json!({ "agentId": primary_agent.id, "mode": "primary", "status": "active" }),
            ),
        )
        .map_err(|error| internal_error("agent_spawn_event_failed", error))?;

    let summary = SessionSummary::from_record(session.clone());
    let global_event = EventEnvelope::new(
        "global",
        "session.created",
        Some(session.id.clone()),
        serde_json::to_value(&summary).expect("session summary should serialize"),
    );
    let session_event = EventEnvelope::new(
        "session.lifecycle",
        "session.created",
        Some(session.id.clone()),
        serde_json::to_value(&summary).expect("session summary should serialize"),
    );

    state.shared.events.publish_global(global_event);
    state
        .shared
        .record_session_event(&session.id, session_event)
        .map_err(|error| internal_error("session_event_write_failed", error))?;

    Ok((StatusCode::CREATED, Json(summary)))
}

async fn create_message(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<CreateMessageRequest>,
) -> std::result::Result<(StatusCode, Json<MessageRecord>), StatusCode> {
    let session = state
        .shared
        .sessions
        .get(&session_id)
        .map_err(|error| internal_error("session_lookup_failed", error))?;
    let Some(session) = session else {
        return Err(StatusCode::NOT_FOUND);
    };

    let message = MessageRecord {
        id: Uuid::new_v4().to_string(),
        session_id: session_id.clone(),
        role: MessageRole::User,
        content: request.content,
        attachments: request.attachments.unwrap_or_else(|| json!([])),
        tool_calls: json!([]),
        tokens: 0,
        cost: 0.0,
        created_at: utc_now(),
    };

    state
        .shared
        .messages
        .insert(&message)
        .map_err(|error| internal_error("message_create_failed", error))?;
    state
        .shared
        .memory
        .capture(ObservationInput {
            session_id: session_id.clone(),
            title: "User prompt".to_string(),
            narrative: message.content.clone(),
            source: ObservationSource::UserPrompt,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 0,
        })
        .map_err(|error| internal_error("memory_capture_failed", error))?;

    let message_value = serde_json::to_value(&message).expect("message should serialize");
    state
        .shared
        .record_session_event(
            &session_id,
            EventEnvelope::new(
                "session.stream",
                "message.created",
                Some(session_id.clone()),
                message_value,
            ),
        )
        .map_err(|error| internal_error("message_event_write_failed", error))?;

    state.shared.events.publish_global(EventEnvelope::new(
        "global",
        "session.updated",
        Some(session_id.clone()),
        json!({ "messageId": message.id, "role": "user" }),
    ));

    // Fire UserPromptSubmit hook
    let hooks = state.shared.hooks.clone();
    let hook_payload = json!({ "sessionId": session_id, "messageId": message.id, "content": message.content });
    tokio::spawn(async move { let _ = hooks.fire(HookEvent::UserPromptSubmit, hook_payload).await; });

    if session.session_mode.as_str() == "native" {
        let shared = state.shared.clone();
        let session_id_for_task = message.session_id.clone();
        let turn_request = NativeTurnRequest {
            session_id: session_id_for_task.clone(),
            task_type: request.task_type.unwrap_or_else(|| "default".to_string()),
            reasoning_mode: request
                .reasoning_mode
                .as_deref()
                .map(parse_reasoning_mode_request)
                .transpose()
                .map_err(|_| StatusCode::BAD_REQUEST)?,
            reasoning_effort: request
                .reasoning_effort
                .as_deref()
                .map(parse_reasoning_effort_request)
                .transpose()
                .map_err(|_| StatusCode::BAD_REQUEST)?,
        };
        tokio::spawn(async move {
            if let Err(error) = run_native_turn(shared, turn_request).await {
                error!(event = "native_turn_failed", error = %error);
            }
        });
    } else {
        let shared = state.shared.clone();
        let session_id_for_task = message.session_id.clone();
        tokio::spawn(async move {
            if let Err(error) = run_wrapper_turn(shared, session_id_for_task).await {
                error!(event = "wrapper_turn_failed", error = %error);
            }
        });
    }

    Ok((StatusCode::CREATED, Json(message)))
}

async fn interrupt_session(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    let session = state
        .shared
        .sessions
        .get(&session_id)
        .map_err(|error| internal_error("session_lookup_failed", error))?;
    let Some(session) = session else {
        return Err(StatusCode::NOT_FOUND);
    };

    let cancelled = if session.session_mode.as_str() == "native" {
        state.shared.native_turns.cancel(&session_id)
    } else {
        state.shared.wrapper_turns.cancel(&session_id)
    };

    if !cancelled {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}

async fn spawn_subagent(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<SpawnAgentRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let agent = state
        .shared
        .orchestration
        .spawn_subagent(SpawnSubagentRequest {
            session_id: session_id.clone(),
            parent_agent_id: request.parent_agent_id,
            persona_id: request.persona_id,
            agent_type: request.agent_type,
            model: request.model,
            requested_tools: request.requested_tools,
            steps_limit: request.steps_limit,
        })
        .map_err(|error| internal_error("subagent_spawn_failed", error))?;

    state
        .shared
        .record_session_event(
            &session_id,
            EventEnvelope::new(
                "session.lifecycle",
                "agent.spawned",
                Some(session_id.clone()),
                json!({ "agentId": agent.id, "parentAgentId": agent.parent_agent_id, "mode": "subagent" }),
            ),
        )
        .map_err(|error| internal_error("subagent_spawn_event_failed", error))?;
    state
        .shared
        .record_session_event(
            &session_id,
            EventEnvelope::new(
                "session.lifecycle",
                "agent.status",
                Some(session_id.clone()),
                json!({ "agentId": agent.id, "status": agent.status.as_str(), "role": agent.agent_type }),
            ),
        )
        .map_err(|error| internal_error("subagent_status_event_failed", error))?;

    // Fire SubagentStart hook
    let hooks = state.shared.hooks.clone();
    let hook_payload = json!({ "sessionId": session_id, "agentId": agent.id, "agentType": agent.agent_type });
    tokio::spawn(async move { let _ = hooks.fire(HookEvent::SubagentStart, hook_payload).await; });

    Ok(StatusCode::CREATED)
}

async fn create_team(
    State(state): State<AppState>,
    Json(request): Json<CreateTeamRequest>,
) -> std::result::Result<Json<crate::persistence::AgentTeamRecord>, StatusCode> {
    let team = state
        .shared
        .orchestration
        .create_team(OrchestrationCreateTeamRequest {
            name: request.name,
            division_requirements: request.division_requirements,
            threshold: request.threshold.unwrap_or(0.6),
            shared_task_list_path: request.shared_task_list_path,
        })
        .map_err(|error| internal_error("team_create_failed", error))?;

    Ok(Json(team))
}

async fn send_mailbox_message(
    Path(team_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<MailboxMessageRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let message_type = match request.message_type.as_deref().unwrap_or("message") {
        "message" => crate::persistence::MailboxMessageType::Message,
        "decision_request" => crate::persistence::MailboxMessageType::DecisionRequest,
        "decision_response" => crate::persistence::MailboxMessageType::DecisionResponse,
        _ => return Err(StatusCode::BAD_REQUEST),
    };

    let message = state
        .shared
        .orchestration
        .send_mailbox_message(SendMailboxRequest {
            session_id: request.session_id.clone(),
            team_id: team_id.clone(),
            from_agent_id: request.from_agent_id,
            to_agent_id: request.to_agent_id,
            content: request.content,
            message_type,
            metadata: request.metadata.unwrap_or_else(|| json!({})),
        })
        .map_err(|error| internal_error("mailbox_send_failed", error))?;

    state
        .shared
        .record_session_event(
            &request.session_id,
            EventEnvelope::new(
                "session.lifecycle",
                "agent.mailbox",
                Some(request.session_id.clone()),
                json!({
                    "teamId": team_id,
                    "fromAgentId": message.from_agent_id,
                    "toAgentId": message.to_agent_id,
                    "message": message.content,
                    "collaborationStyle": message.collaboration_style,
                    "decisionWeight": message.decision_weight
                }),
            ),
        )
        .map_err(|error| internal_error("mailbox_event_failed", error))?;

    Ok(StatusCode::CREATED)
}

async fn list_mailbox(
    Path(team_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::AgentMessageRecord>>, StatusCode> {
    let messages = state
        .shared
        .orchestration
        .list_mailbox(&team_id)
        .map_err(|error| internal_error("mailbox_list_failed", error))?;
    Ok(Json(messages))
}

async fn observe_memory(
    State(state): State<AppState>,
    Json(request): Json<ManualObservationRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .memory
        .observe_manual(
            &request.session_id,
            &request.title,
            &request.narrative,
            request.category.as_deref().and_then(parse_observation_category),
        )
        .map_err(|error| internal_error("manual_memory_observe_failed", error))?;

    Ok(StatusCode::CREATED)
}

async fn search_memory(
    State(state): State<AppState>,
    Query(query): Query<MemorySearchQuery>,
) -> std::result::Result<Json<Vec<ObservationSearchResult>>, StatusCode> {
    let results = state
        .shared
        .memory
        .search(
            &query.query,
            query.category.as_deref().and_then(parse_observation_category),
        )
        .map_err(|error| internal_error("memory_search_failed", error))?;
    Ok(Json(results))
}

async fn global_events(State(state): State<AppState>) -> Sse<impl tokio_stream::Stream<Item = std::result::Result<Event, Infallible>>> {
    sse_from_receiver(state.shared.events.subscribe_global())
}

async fn session_events(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> Sse<impl tokio_stream::Stream<Item = std::result::Result<Event, Infallible>>> {
    sse_from_receiver(state.shared.events.subscribe_session(&session_id))
}

async fn replay_transcript(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<EventEnvelope>>, StatusCode> {
    let events = state
        .shared
        .transcripts
        .replay(&session_id)
        .map_err(|error| internal_error("transcript_replay_failed", error))?;

    Ok(Json(events))
}

fn sse_from_receiver(
    receiver: broadcast::Receiver<EventEnvelope>,
) -> Sse<impl tokio_stream::Stream<Item = std::result::Result<Event, Infallible>>> {
    let stream = BroadcastStream::new(receiver).filter_map(|result| match result {
        Ok(envelope) => {
            let payload = serde_json::to_string(&envelope).expect("event envelope should serialize");
            Some(Ok(Event::default().event(envelope.event_type.clone()).data(payload)))
        }
        Err(_) => None,
    });

    Sse::new(stream).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keepalive"),
    )
}

impl SharedState {
    fn record_session_event(&self, session_id: &str, envelope: EventEnvelope) -> Result<()> {
        self.transcripts.append(session_id, &envelope)?;
        self.events.publish_session(session_id, envelope);
        Ok(())
    }
}

impl Default for NativeTurnRegistry {
    fn default() -> Self {
        Self {
            flags: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl NativeTurnRegistry {
    fn register(&self, session_id: &str) {
        self.flags
            .lock()
            .expect("native turn registry mutex poisoned")
            .insert(session_id.to_string(), Arc::new(AtomicBool::new(false)));
    }

    fn flag(&self, session_id: &str) -> Option<Arc<AtomicBool>> {
        self.flags
            .lock()
            .expect("native turn registry mutex poisoned")
            .get(session_id)
            .cloned()
    }

    fn cancel(&self, session_id: &str) -> bool {
        if let Some(flag) = self.flag(session_id) {
            flag.store(true, Ordering::SeqCst);
            true
        } else {
            false
        }
    }

    fn reset(&self, session_id: &str) {
        if let Some(flag) = self.flag(session_id) {
            flag.store(false, Ordering::SeqCst);
        }
    }
}

impl EventBroker {
    fn new() -> Self {
        let (global, _) = broadcast::channel(256);

        Self {
            global,
            session_channels: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn publish_global(&self, envelope: EventEnvelope) {
        let _ = self.global.send(envelope);
    }

    fn publish_session(&self, session_id: &str, envelope: EventEnvelope) {
        let _ = self.session_sender(session_id).send(envelope);
    }

    fn subscribe_global(&self) -> broadcast::Receiver<EventEnvelope> {
        self.global.subscribe()
    }

    fn subscribe_session(&self, session_id: &str) -> broadcast::Receiver<EventEnvelope> {
        self.session_sender(session_id).subscribe()
    }

    fn session_sender(&self, session_id: &str) -> broadcast::Sender<EventEnvelope> {
        let mut session_channels = self
            .session_channels
            .lock()
            .expect("session event broker mutex poisoned");
        session_channels
            .entry(session_id.to_string())
            .or_insert_with(|| {
                let (sender, _) = broadcast::channel(256);
                sender
            })
            .clone()
    }
}

impl TranscriptStore {
    fn new(sessions_root: PathBuf) -> Self {
        Self { sessions_root }
    }

    fn append(&self, session_id: &str, envelope: &EventEnvelope) -> Result<()> {
        fs::create_dir_all(&self.sessions_root)
            .with_context(|| format!("failed to create transcript dir {}", self.sessions_root.display()))?;
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.path_for(session_id))
            .with_context(|| format!("failed to open transcript for session {session_id}"))?;
        writeln!(file, "{}", serde_json::to_string(envelope)?)
            .with_context(|| format!("failed to append transcript event for session {session_id}"))?;
        Ok(())
    }

    fn replay(&self, session_id: &str) -> Result<Vec<EventEnvelope>> {
        let path = self.path_for(session_id);
        if !path.exists() {
            return Ok(vec![]);
        }

        let reader = BufReader::new(
            File::open(&path)
                .with_context(|| format!("failed to open transcript file {}", path.display()))?,
        );

        reader
            .lines()
            .map(|line| {
                let line = line.context("failed to read transcript line")?;
                serde_json::from_str(&line).context("failed to deserialize transcript line")
            })
            .collect()
    }

    fn path_for(&self, session_id: &str) -> PathBuf {
        self.sessions_root.join(format!("{session_id}.jsonl"))
    }
}

impl EventEnvelope {
    fn new(
        channel: impl Into<String>,
        event_type: impl Into<String>,
        session_id: Option<String>,
        payload: Value,
    ) -> Self {
        Self {
            version: 1,
            id: Uuid::new_v4().to_string(),
            channel: channel.into(),
            event_type: event_type.into(),
            session_id,
            occurred_at: utc_now(),
            payload,
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionTreeNode {
    session: SessionSummary,
    children: Vec<SessionTreeNode>,
}

fn session_to_summary(session: &SessionRecord) -> SessionSummary {
    SessionSummary {
        id: session.id.clone(),
        session_mode: session.session_mode.as_str().to_string(),
        tui_type: session.tui_type.as_str().to_string(),
        working_dir: session.working_dir.clone(),
        status: session.status.as_str().to_string(),
        created_at: session.created_at.clone(),
        updated_at: session.updated_at.clone(),
        metadata: session.metadata.clone(),
        provider_id: session.provider_id.clone(),
        model_id: session.model_id.clone(),
    }
}

async fn list_session_children(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<SessionSummary>>, StatusCode> {
    let children = state
        .shared
        .sessions
        .list_children(&session_id)
        .map_err(|error| internal_error("session_children_failed", error))?;
    let summaries = children.into_iter().map(|s| session_to_summary(&s)).collect();
    Ok(Json(summaries))
}

async fn get_session_tree(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<SessionTreeNode>, StatusCode> {
    let session = state
        .shared
        .sessions
        .get(&session_id)
        .map_err(|error| internal_error("session_lookup_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    let tree = build_session_tree(&state.shared.sessions, &session)
        .map_err(|error| internal_error("session_tree_failed", error))?;
    Ok(Json(tree))
}

fn build_session_tree(
    repo: &SessionRepository,
    session: &SessionRecord,
) -> Result<SessionTreeNode> {
    let children = repo.list_children(&session.id)?;
    let child_nodes = children
        .iter()
        .map(|child| build_session_tree(repo, child))
        .collect::<Result<Vec<_>>>()?;
    Ok(SessionTreeNode {
        session: session_to_summary(session),
        children: child_nodes,
    })
}

impl SessionSummary {
    fn from_record(record: SessionRecord) -> Self {
        Self {
            id: record.id,
            session_mode: record.session_mode.as_str().to_string(),
            tui_type: record.tui_type.as_str().to_string(),
            working_dir: record.working_dir,
            status: record.status.as_str().to_string(),
            created_at: record.created_at,
            updated_at: record.updated_at,
            metadata: record.metadata,
            provider_id: record.provider_id,
            model_id: record.model_id,
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateWorkspaceRequest {
    project_path: String,
    agent_id: Option<String>,
    persona_name: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ArchiveWorkspaceRequest {
    summary: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PrepareReviewRequest {
    target_project_path: String,
    contributing_agents: Value,
}

async fn list_workspaces(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::WorkspaceRecord>>, StatusCode> {
    let workspaces = state
        .shared
        .workspace_manager
        .list()
        .map_err(|error| internal_error("workspace_list_failed", error))?;
    Ok(Json(workspaces))
}

async fn create_workspace(
    State(state): State<AppState>,
    Json(request): Json<CreateWorkspaceRequest>,
) -> std::result::Result<(StatusCode, Json<crate::persistence::WorkspaceRecord>), StatusCode> {
    let workspace = state
        .shared
        .workspace_manager
        .create(WorkspaceCreateRequest {
            project_path: PathBuf::from(request.project_path),
            agent_id: request.agent_id,
            persona_name: request.persona_name,
        })
        .map_err(|error| internal_error("workspace_create_failed", error))?;
    Ok((StatusCode::CREATED, Json(workspace)))
}

async fn inspect_workspace(
    Path(workspace_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<crate::persistence::WorkspaceRecord>, StatusCode> {
    let workspace = state
        .shared
        .workspace_manager
        .inspect(&workspace_id)
        .map_err(|error| internal_error("workspace_inspect_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(workspace))
}

async fn archive_workspace(
    Path(workspace_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<ArchiveWorkspaceRequest>,
) -> std::result::Result<Json<crate::persistence::WorkspaceRecord>, StatusCode> {
    let workspace = state
        .shared
        .workspace_manager
        .archive(&workspace_id, request.summary.unwrap_or(json!({})))
        .map_err(|error| internal_error("workspace_archive_failed", error))?;
    Ok(Json(workspace))
}

async fn destroy_workspace(
    Path(workspace_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .workspace_manager
        .destroy(&workspace_id)
        .map_err(|error| internal_error("workspace_destroy_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn prepare_workspace_review(
    Path(workspace_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<PrepareReviewRequest>,
) -> std::result::Result<(StatusCode, Json<crate::persistence::WorkspaceMergeReviewRecord>), StatusCode> {
    let review = state
        .shared
        .workspace_reviews
        .prepare_review(
            &workspace_id,
            &PathBuf::from(request.target_project_path),
            request.contributing_agents,
        )
        .map_err(|error| internal_error("workspace_review_failed", error))?;
    Ok((StatusCode::CREATED, Json(review)))
}

async fn list_extensions(
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::extensions::manager::ExtensionSummary>>, StatusCode> {
    let extensions = state.shared.extensions.list().await;
    Ok(Json(extensions))
}

async fn install_extension(
    State(state): State<AppState>,
    Json(request): Json<InstallExtensionRequest>,
) -> std::result::Result<(StatusCode, Json<Value>), StatusCode> {
    let manifest = if let Some(path) = request.path {
        state
            .shared
            .extensions
            .install_from_path(&PathBuf::from(path))
            .await
    } else if let Some(url) = request.url {
        state.shared.extensions.install_from_url(&url).await
    } else {
        return Err(StatusCode::BAD_REQUEST);
    };
    let manifest =
        manifest.map_err(|error| internal_error("extension_install_failed", error))?;
    Ok((
        StatusCode::CREATED,
        Json(serde_json::to_value(manifest).unwrap_or_default()),
    ))
}

async fn uninstall_extension(
    Path(ext_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .extensions
        .uninstall(&ext_id)
        .await
        .map_err(|error| internal_error("extension_uninstall_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn toggle_extension(
    Path(ext_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<SetExtensionEnabledRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .extensions
        .set_enabled(&ext_id, request.enabled)
        .await
        .map_err(|error| internal_error("extension_toggle_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_extension_contributions(
    State(state): State<AppState>,
) -> std::result::Result<Json<crate::extensions::contributions::AggregatedContributions>, StatusCode>
{
    let contributions = state.shared.extensions.get_contributions().await;
    Ok(Json(contributions))
}

async fn get_extension_panel_html(
    Path((ext_id, panel_id)): Path<(String, String)>,
    State(state): State<AppState>,
) -> std::result::Result<axum::response::Html<String>, StatusCode> {
    let html = state
        .shared
        .extensions
        .get_panel_html(&ext_id, &panel_id)
        .await
        .map_err(|error| internal_error("extension_panel_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    Ok(axum::response::Html(html))
}

fn internal_error(context_name: &'static str, error: anyhow::Error) -> StatusCode {
    error!(event = context_name, error = %error);
    StatusCode::INTERNAL_SERVER_ERROR
}

fn auth_error(context_name: &'static str, error: anyhow::Error) -> StatusCode {
    warn!(event = context_name, error = %error);
    StatusCode::UNAUTHORIZED
}

fn unix_millis(time: SystemTime) -> u64 {
    time.duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .try_into()
        .unwrap_or(u64::MAX)
}

fn issue_token(prefix: &str) -> String {
    format!(
        "{prefix}-{}{}",
        Uuid::new_v4().simple(),
        Uuid::new_v4().simple()
    )
}

fn default_database_path() -> PathBuf {
    let state_root = dirs::home_dir()
        .unwrap_or_else(|| std::env::current_dir().expect("current_dir should resolve"))
        .join(".lunaria");
    state_root.join("lunaria.sqlite")
}

async fn run_wrapper_turn(shared: Arc<SharedState>, session_id: String) -> Result<()> {
    shared.wrapper_turns.reset(&session_id);
    let Some(cancel_flag) = shared.wrapper_turns.flag(&session_id) else {
        return Ok(());
    };

    let session = shared
        .sessions
        .get(&session_id)?
        .ok_or_else(|| anyhow::anyhow!("session {session_id} no longer exists"))?;
    let persona_path = session
        .metadata
        .get("persona")
        .and_then(|persona| persona.get("path"))
        .and_then(Value::as_str)
        .map(PathBuf::from)
        .unwrap_or_else(default_native_persona_path);
    let prompt = shared
        .messages
        .list_by_session(&session_id)?
        .into_iter()
        .rev()
        .find(|message| message.role == MessageRole::User)
        .map(|message| message.content)
        .unwrap_or_default();

    let adapter_config = WrapperManager::config_from_metadata(&session.metadata);
    let outcome = shared
        .wrappers
        .execute_turn(
            session.tui_type.as_str(),
            WrapperExecutionRequest {
                session_id: session_id.clone(),
                working_dir: PathBuf::from(&session.working_dir),
                prompt,
                persona_path,
                adapter_config,
            },
        )
        .await?;

    if cancel_flag.load(Ordering::SeqCst) {
        shared.record_session_event(
            &session_id,
            EventEnvelope::new(
                "session.stream",
                "error",
                Some(session_id.clone()),
                json!({ "code": "cancelled", "message": "wrapper turn interrupted", "retryable": true }),
            ),
        )?;
        return Ok(());
    }

    let mut completion_tokens = 0;
    let mut last_completion = None::<String>;

    for event in outcome.events {
        match event {
            NormalizedWrapperEvent::MessageDelta(text) => {
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "message.delta",
                        Some(session_id.clone()),
                        json!({ "text": text }),
                    ),
                )?;
            }
            NormalizedWrapperEvent::MessageComplete(content) => {
                let assistant_message = MessageRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: session_id.clone(),
                    role: MessageRole::Assistant,
                    content: content.clone(),
                    attachments: json!([]),
                    tool_calls: json!([]),
                    tokens: completion_tokens,
                    cost: 0.0,
                    created_at: utc_now(),
                };
                shared.messages.insert(&assistant_message)?;
                let _ = shared.memory.capture(ObservationInput {
                    session_id: session_id.clone(),
                    title: "Assistant response".to_string(),
                    narrative: content.clone(),
                    source: ObservationSource::AssistantResponse,
                    facts: vec![],
                    files_read: vec![],
                    files_modified: vec![],
                    prompt_number: 0,
                });
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "message.complete",
                        Some(session_id.clone()),
                        json!({ "messageId": assistant_message.id, "content": content }),
                    ),
                )?;
                last_completion = Some(assistant_message.content);
            }
            NormalizedWrapperEvent::ToolStart { tool_name, call_id, args } => {
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "tool.start",
                        Some(session_id.clone()),
                        json!({ "toolName": tool_name, "callId": call_id, "args": args }),
                    ),
                )?;
            }
            NormalizedWrapperEvent::ToolResult {
                tool_name,
                call_id,
                result,
            } => {
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "tool.result",
                        Some(session_id.clone()),
                        json!({ "toolName": tool_name, "callId": call_id, "result": result }),
                    ),
                )?;
            }
            NormalizedWrapperEvent::Usage {
                input_tokens,
                output_tokens,
            } => {
                completion_tokens = output_tokens;
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "usage",
                        Some(session_id.clone()),
                        json!({ "inputTokens": input_tokens, "outputTokens": output_tokens, "cost": 0.0 }),
                    ),
                )?;
            }
            NormalizedWrapperEvent::Error {
                code,
                message,
                retryable,
            } => {
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "error",
                        Some(session_id.clone()),
                        json!({ "code": code, "message": message, "retryable": retryable }),
                    ),
                )?;
            }
        }
    }

    if let Some(content) = last_completion {
        info!(event = "wrapper_turn_complete", session_id = %session_id, content = %content);
    }

    Ok(())
}

fn merge_session_metadata(user_metadata: Option<Value>, base_metadata: Value) -> Value {
    match user_metadata {
        Some(Value::Object(mut object)) => {
            if let Value::Object(base) = base_metadata {
                for (key, value) in base {
                    object.entry(key).or_insert(value);
                }
            }
            Value::Object(object)
        }
        _ => base_metadata,
    }
}

fn session_autopilot_enabled(session: &SessionRecord) -> bool {
    session
        .metadata
        .get("autopilot")
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

fn next_autopilot_phase(turn: usize) -> &'static str {
    match turn {
        0 => "goal_analysis",
        1 => "story_decomposition",
        2 => "agent_assignment",
        3 => "execution",
        4 => "verification",
        _ => "report",
    }
}

fn strip_autopilot_completion_marker(content: &str) -> String {
    content
        .replace("AUTOPILOT_COMPLETE", "")
        .lines()
        .map(str::trim_end)
        .collect::<Vec<_>>()
        .join("\n")
        .trim()
        .to_string()
}

fn emit_autopilot_phase(shared: &SharedState, session_id: &str, phase: &str) -> Result<()> {
    shared.record_session_event(
        session_id,
        EventEnvelope::new(
            "session.stream",
            "autopilot.phase",
            Some(session_id.to_string()),
            json!({ "currentPhase": phase }),
        ),
    )?;
    Ok(())
}

async fn run_native_turn(shared: Arc<SharedState>, request: NativeTurnRequest) -> Result<()> {
    const MAX_TOOL_ITERATIONS: usize = 4;
    const MAX_AUTOPILOT_TURNS: usize = 20;
    let session_id = request.session_id.clone();

    shared.native_turns.reset(&session_id);
    let Some(cancel_flag) = shared.native_turns.flag(&session_id) else {
        return Ok(());
    };

    info!(event = "native_turn_started", session_id = %session_id);

    let mut tool_iterations = 0usize;
    let session = shared
        .sessions
        .get(&session_id)?
        .ok_or_else(|| anyhow::anyhow!("session {session_id} no longer exists"))?;
    let persona = load_session_persona(&session)?;
    let routing_decision = shared
        .routing
        .resolve(RoutingRequest {
            provider_id: session.provider_id.clone(),
            model_id: session.model_id.clone(),
            task_type: request.task_type.clone(),
            agent_state: RoutingAgentState::Running,
            turn_reasoning_mode: request.reasoning_mode.clone(),
            turn_reasoning_effort: request.reasoning_effort.clone(),
            persona: RoutingPersonaContext::from(&persona),
        })
        .map_err(|error| anyhow::anyhow!(error.to_string()))?;
    let worker_target = resolve_worker_execution_target(
        &shared,
        &routing_decision.provider_id,
        &routing_decision.model_id,
    )?;
    let event_context = json!({
        "collaborationStyle": persona.collaboration_style,
        "communicationPreference": persona.communication_preference,
        "providerId": routing_decision.provider_id,
        "modelId": routing_decision.model_id,
        "reasoningMode": format_reasoning_mode(&routing_decision.reasoning_mode),
        "reasoningEffort": routing_decision.reasoning_effort.as_ref().map(format_reasoning_effort),
    });
    let memory_api_key = shared.providers.read_api_key("openai")?;
    let mut autopilot_turns = 0usize;
    let mut autopilot_follow_up_prompt = None::<String>;
    let mut autopilot_enabled = session_autopilot_enabled(&session);

    if autopilot_enabled {
        let _ = shared.hooks.fire(HookEvent::AutopilotStoryStart, json!({ "sessionId": session_id, "phase": "goal_analysis" })).await;

        emit_autopilot_phase(&shared, &session_id, "goal_analysis")?;
    }

    loop {
        let stored_messages = shared.messages.list_by_session(&session_id)?;
        let latest_user_query = stored_messages
            .iter()
            .rev()
            .find(|message| message.role == MessageRole::User)
            .map(|message| message.content.clone())
            .unwrap_or_else(|| request.task_type.clone());
        let injection_bundle = shared
            .memory
            .injection_bundle(&shared.worker, memory_api_key.clone(), &latest_user_query, 3)
            .await
            .unwrap_or(crate::memory::InjectionBundle {
                scope: crate::memory::RetrievalScope::SessionLocal,
                summaries: vec![],
                token_budget_used: 0,
            });
        let mut worker_messages = vec![StreamMessage {
            role: "system".to_string(),
            content: format!(
                "{}\n\nActive workspace: {}\nSession id: {}\nMemory scope: {:?}\nInjected memory:\n{}",
                persona.body,
                session.working_dir,
                session_id,
                injection_bundle.scope,
                injection_bundle.summaries.join("\n"),
            ),
        }];
        worker_messages.extend(stored_messages.iter()
            .map(|message| StreamMessage {
                role: message.role.as_str().to_string(),
                content: message.content.clone(),
            })
            .collect::<Vec<_>>());
        if let Some(follow_up_prompt) = &autopilot_follow_up_prompt {
            worker_messages.push(StreamMessage {
                role: "user".to_string(),
                content: follow_up_prompt.clone(),
            });
        }

        let token_buffer = Arc::new(Mutex::new(String::new()));
        let token_buffer_for_callback = token_buffer.clone();
        let shared_for_callback = shared.clone();
        let session_id_for_callback = session_id.clone();
        let cancel_for_callback = cancel_flag.clone();
        let callback_event_context = event_context.clone();

        let response = shared
            .worker
            .stream_completion_with_handler(
                StreamRequest {
                    provider_id: worker_target.provider_id.clone(),
                    model_id: worker_target.model_id.clone(),
                    session_id: session_id.clone(),
                    api_key: worker_target.api_key.clone(),
                    reasoning_mode: Some(format_reasoning_mode(&routing_decision.reasoning_mode)),
                    reasoning_effort: routing_decision
                        .reasoning_effort
                        .as_ref()
                        .map(format_reasoning_effort),
                    messages: worker_messages,
                },
                move |token| {
                    if cancel_for_callback.load(Ordering::SeqCst) {
                        return Err(crate::ai_worker::WorkerError::RequestFailed(
                            "cancelled".to_string(),
                        ));
                    }

                    token_buffer_for_callback
                        .lock()
                        .expect("token buffer mutex poisoned")
                        .push_str(&format!("{token} "));
                    shared_for_callback
                        .record_session_event(
                            &session_id_for_callback,
                            EventEnvelope::new(
                                "session.stream",
                                "message.delta",
                                Some(session_id_for_callback.clone()),
                                json!({ "text": token, "collaborationStyle": callback_event_context["collaborationStyle"], "communicationPreference": callback_event_context["communicationPreference"] }),
                            ),
                        )
                        .map_err(|error| crate::ai_worker::WorkerError::Protocol(error.to_string()))?;
                    info!(event = "native_turn_delta", session_id = %session_id_for_callback, token = %token);
                    Ok(())
                },
            )
            .await;

        match response {
            Ok(response) => {
                if let Some(tool_call) = response.tool_call {
                    info!(event = "native_turn_tool_call", session_id = %session_id, tool_name = %tool_call.tool_name);
                    if tool_iterations >= MAX_TOOL_ITERATIONS {
                        shared.record_session_event(
                            &session_id,
                            EventEnvelope::new(
                                "session.stream",
                                "error",
                                Some(session_id.clone()),
                                json!({ "code": "tool_limit", "message": "native tool loop exceeded the step limit", "retryable": false }),
                            ),
                        )?;
                        return Ok(());
                    }

                    if !persona_allows_tool(&persona, &tool_call.tool_name) {
                        shared.record_session_event(
                            &session_id,
                            EventEnvelope::new(
                                "session.stream",
                                "error",
                                Some(session_id.clone()),
                                json!({ "code": "persona_tool_denied", "message": format!("persona denied tool {}", tool_call.tool_name), "retryable": false, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"] }),
                            ),
                        )?;
                        return Ok(());
                    }

                    handle_tool_call(&shared, &session, &session_id, tool_call, &event_context)
                        .await?;
                    tool_iterations += 1;
                    continue;
                }

                let assistant_content = token_buffer
                    .lock()
                    .expect("token buffer mutex poisoned")
                    .trim()
                    .to_string();
                let final_content = if assistant_content.is_empty() {
                    response.final_text.clone()
                } else {
                    assistant_content
                };
                let sanitized_final_content = strip_autopilot_completion_marker(&final_content);

                let assistant_message = MessageRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: session_id.clone(),
                    role: MessageRole::Assistant,
                    content: sanitized_final_content.clone(),
                    attachments: json!([]),
                    tool_calls: json!([]),
                    tokens: response.completion_tokens,
                    cost: 0.0,
                    created_at: utc_now(),
                };
                shared.messages.insert(&assistant_message)?;

                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "message.complete",
                        Some(session_id.clone()),
                        json!({ "messageId": assistant_message.id, "content": sanitized_final_content, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"], "memoryBudgetUsed": injection_bundle.token_budget_used }),
                    ),
                )?;
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "usage",
                        Some(session_id.clone()),
                        json!({ "inputTokens": response.prompt_tokens, "outputTokens": response.completion_tokens, "cost": 0.0, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"], "providerId": event_context["providerId"], "modelId": event_context["modelId"], "reasoningMode": event_context["reasoningMode"], "reasoningEffort": event_context["reasoningEffort"] }),
                    ),
                )?;
                shared.usage.insert(&UsageAnalyticsRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: Some(session_id.clone()),
                    provider: routing_decision.provider_id.clone(),
                    model: routing_decision.model_id.clone(),
                    input_tokens: response.prompt_tokens,
                    output_tokens: response.completion_tokens,
                    cost: 0.0,
                    timestamp: utc_now(),
                })?;
                let _ = shared.memory.upsert_session_summary(SessionSummaryRecord {
                    session_id: session_id.clone(),
                    request: latest_user_query.clone(),
                    investigated: vec![],
                    learned: vec![sanitized_final_content.clone()],
                    completed: vec![sanitized_final_content.clone()],
                    next_steps: vec![],
                    files_read: vec![],
                    files_edited: vec![],
                });
                info!(event = "native_turn_complete", session_id = %session_id, output_tokens = response.completion_tokens);

                if autopilot_enabled {
                    let completion_marker_seen = final_content.contains("AUTOPILOT_COMPLETE");
                    if completion_marker_seen || autopilot_turns >= MAX_AUTOPILOT_TURNS - 1 {
                        emit_autopilot_phase(&shared, &session_id, "report")?;
                        let _ = shared.hooks.fire(HookEvent::AutopilotStoryComplete, json!({ "sessionId": session_id })).await;

                        return Ok(());
                    }

                    autopilot_turns += 1;
                    emit_autopilot_phase(&shared, &session_id, next_autopilot_phase(autopilot_turns))?;
                    autopilot_follow_up_prompt = Some(
                        "Autopilot remains enabled for this session. Continue the task autonomously using the current workspace context and prior results. If the task is complete, begin your response with AUTOPILOT_COMPLETE on its own line and then provide the final report.".to_string(),
                    );
                    autopilot_enabled = shared
                        .sessions
                        .get(&session_id)?
                        .map(|current| session_autopilot_enabled(&current))
                        .unwrap_or(false);

                    if autopilot_enabled {
                        continue;
                    }
                }

                return Ok(());
            }
            Err(crate::ai_worker::WorkerError::RequestFailed(error)) if error == "cancelled" => {
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "error",
                        Some(session_id.clone()),
                        json!({ "code": "cancelled", "message": "native turn interrupted", "retryable": true, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"] }),
                    ),
                )?;
                info!(event = "native_turn_cancelled", session_id = %session_id);
                return Ok(());
            }
            Err(error) => {
                shared.record_session_event(
                    &session_id,
                    EventEnvelope::new(
                        "session.stream",
                        "error",
                        Some(session_id.clone()),
                        json!({ "code": "worker_error", "message": error.to_string(), "retryable": true, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"] }),
                    ),
                )?;
                warn!(event = "native_turn_worker_error", session_id = %session_id, error = %error);
                let _ = shared.hooks.fire(HookEvent::ErrorUnhandled, json!({ "sessionId": session_id, "error": error.to_string() })).await;

                return Ok(());
            }
        }
    }
}

async fn handle_tool_call(
    shared: &SharedState,
    session: &SessionRecord,
    session_id: &str,
    tool_call: WorkerToolCall,
    event_context: &serde_json::Value,
) -> Result<()> {
    shared.record_session_event(
        session_id,
        EventEnvelope::new(
            "session.stream",
            "tool.start",
            Some(session_id.to_string()),
            json!({ "toolName": tool_call.tool_name, "callId": tool_call.call_id, "args": tool_call.args, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"] }),
        ),
    )?;

    // Fire PreToolUse hook
    let _ = shared.hooks.fire(HookEvent::PreToolUse, json!({ "sessionId": session_id, "toolName": tool_call.tool_name, "args": tool_call.args })).await;

    let context = ToolExecutionContext {
        session_id: session_id.to_string(),
        working_dir: PathBuf::from(&session.working_dir),
        session_metadata: session.metadata.clone(),
        persona_ceiling: ToolExecutor::persona_ceiling_from_metadata(&session.metadata),
        agent_id: None,
    };
    let tool_input = ToolInput {
        tool_name: tool_call.tool_name.clone(),
        args: tool_call.args.clone(),
    };

    let outcome = match shared.tools.execute(&context, tool_input).await {
        Ok(ToolExecutionOutcome::Completed { output, .. }) => output,
        Ok(ToolExecutionOutcome::Pending(pending)) => {
            shared.record_session_event(
                session_id,
                EventEnvelope::new(
                    "session.stream",
                    "permission.requested",
                    Some(session_id.to_string()),
                    json!({ "requestId": pending.request_id, "toolName": pending.tool_name, "args": pending.input, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"] }),
                ),
            )?;
            shared.record_session_event(
                session_id,
                EventEnvelope::new(
                    "session.lifecycle",
                    "permission.request",
                    Some(session_id.to_string()),
                    json!({
                        "requestId": pending.request_id,
                        "toolName": pending.tool_name,
                        "input": pending.input,
                        "sessionId": session_id,
                    }),
                ),
            )?;
            match shared.tools.await_and_execute(&context, pending).await {
                Ok(ToolExecutionOutcome::Completed { output, .. }) => output,
                Ok(ToolExecutionOutcome::Pending(_)) => unreachable!("approval resolution should complete"),
                Err(error) => {
                    shared.record_session_event(
                        session_id,
                        EventEnvelope::new(
                            "session.stream",
                            "error",
                            Some(session_id.to_string()),
                            json!({ "code": "permission_denied", "message": error.to_string(), "retryable": false }),
                        ),
                    )?;
                    return Ok(());
                }
            }
        }
        Err(error) => {
            shared.record_session_event(
                session_id,
                EventEnvelope::new(
                    "session.stream",
                    "error",
                    Some(session_id.to_string()),
                    json!({ "code": "tool_error", "message": error.to_string(), "retryable": false }),
                ),
            )?;
            // Fire PostToolUseFailure hook
            let _ = shared.hooks.fire(HookEvent::PostToolUseFailure, json!({ "sessionId": session_id, "toolName": tool_call.tool_name, "error": error.to_string() })).await;

            return Ok(());
        }
    };

    let tool_result = output_to_tool_message(&outcome);
    info!(event = "native_turn_tool_result", session_id = %session_id, tool_name = %tool_call.tool_name, result = %tool_result);
    // Fire PostToolUse hook
    let _ = shared.hooks.fire(HookEvent::PostToolUse, json!({ "sessionId": session_id, "toolName": tool_call.tool_name, "result": tool_result })).await;


    let tool_message = MessageRecord {
        id: Uuid::new_v4().to_string(),
        session_id: session_id.to_string(),
        role: MessageRole::Tool,
        content: tool_result.clone(),
        attachments: json!([]),
        tool_calls: json!([]),
        tokens: 0,
        cost: 0.0,
        created_at: utc_now(),
    };
    shared.messages.insert(&tool_message)?;
    let _ = shared.memory.capture(ObservationInput {
        session_id: session_id.to_string(),
        title: format!("Tool {}", tool_call.tool_name),
        narrative: tool_result.clone(),
        source: ObservationSource::ToolResult {
            tool_name: tool_call.tool_name.clone(),
        },
        facts: vec![],
        files_read: vec![],
        files_modified: vec![],
        prompt_number: 0,
    });

    shared.record_session_event(
        session_id,
        EventEnvelope::new(
            "session.stream",
            "tool.result",
            Some(session_id.to_string()),
            json!({ "toolName": tool_call.tool_name, "callId": tool_call.call_id, "result": outcome, "collaborationStyle": event_context["collaborationStyle"], "communicationPreference": event_context["communicationPreference"] }),
        ),
    )?;

    Ok(())
}

fn load_session_persona(session: &SessionRecord) -> Result<PersonaProfile> {
    let persona_path = session
        .metadata
        .get("persona")
        .and_then(|persona| persona.get("path"))
        .and_then(serde_json::Value::as_str)
        .map(PathBuf::from)
        .unwrap_or_else(default_native_persona_path);
    PersonaProfile::load(persona_path)
}

fn persona_allows_tool(persona: &PersonaProfile, tool_name: &str) -> bool {
    if persona.tools.is_empty() {
        return true;
    }

    persona.tools.iter().any(|tool| tool == "Agent" || tool == tool_name)
}

fn default_native_persona_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("resources")
        .join("agent-personas")
        .join("ai")
        .join("agent-orchestrator.md")
}

fn parse_reasoning_mode_request(value: &str) -> Result<ReasoningMode> {
    match value {
        "off" => Ok(ReasoningMode::Off),
        "auto" => Ok(ReasoningMode::Auto),
        "on" => Ok(ReasoningMode::On),
        other => anyhow::bail!("unsupported reasoning mode: {other}"),
    }
}

fn parse_reasoning_effort_request(value: &str) -> Result<ReasoningEffort> {
    match value {
        "low" => Ok(ReasoningEffort::Low),
        "medium" => Ok(ReasoningEffort::Medium),
        "high" => Ok(ReasoningEffort::High),
        other => anyhow::bail!("unsupported reasoning effort: {other}"),
    }
}

fn format_reasoning_mode(value: &ReasoningMode) -> String {
    match value {
        ReasoningMode::Off => "off",
        ReasoningMode::Auto => "auto",
        ReasoningMode::On => "on",
    }
    .to_string()
}

fn format_reasoning_effort(value: &ReasoningEffort) -> String {
    match value {
        ReasoningEffort::Low => "low",
        ReasoningEffort::Medium => "medium",
        ReasoningEffort::High => "high",
    }
    .to_string()
}

fn resolve_worker_execution_target(
    shared: &SharedState,
    provider_id: &str,
    model_id: &str,
) -> Result<WorkerExecutionTarget> {
    if !matches!(provider_id, "anthropic" | "openai" | "google") {
        return Ok(WorkerExecutionTarget {
            provider_id: provider_id.to_string(),
            model_id: model_id.to_string(),
            api_key: None,
        });
    }

    let api_key = shared.config.read_provider_api_key(provider_id)?;
    let env_available = provider_env_var(provider_id)
        .and_then(std::env::var_os)
        .is_some();

    if api_key.is_some() || env_available {
        return Ok(WorkerExecutionTarget {
            provider_id: provider_id.to_string(),
            model_id: model_id.to_string(),
            api_key,
        });
    }

    Ok(WorkerExecutionTarget {
        provider_id: "mock".to_string(),
        model_id: "mock-echo".to_string(),
        api_key: None,
    })
}

fn provider_env_var(provider_id: &str) -> Option<&'static str> {
    match provider_id {
        "anthropic" => Some("ANTHROPIC_API_KEY"),
        "openai" => Some("OPENAI_API_KEY"),
        "google" => Some("GOOGLE_API_KEY"),
        _ => None,
    }
}

fn parse_observation_category(value: &str) -> Option<crate::persistence::ObservationCategory> {
    value.parse::<crate::persistence::ObservationCategory>().ok()
}

fn parse_device_type(value: Option<String>) -> std::result::Result<DeviceType, StatusCode> {
    value.unwrap_or_else(|| "unknown".to_string())
        .parse::<DeviceType>()
        .map_err(|_| StatusCode::BAD_REQUEST)
}

fn build_file_tree(root: &PathBuf, depth: usize) -> Result<Vec<WorkspaceFileNode>> {
    if depth > 3 || !root.exists() {
        return Ok(Vec::new());
    }

    let mut entries = std::fs::read_dir(root)
        .with_context(|| format!("failed to read directory {}", root.display()))?
        .filter_map(|entry| entry.ok())
        .collect::<Vec<_>>();
    entries.sort_by_key(|entry| entry.file_name());

    entries
        .into_iter()
        .filter(|entry| !entry.file_name().to_string_lossy().starts_with('.'))
        .map(|entry| {
            let path = entry.path();
            let metadata = entry.metadata()?;
            let node_type = if metadata.is_dir() { "folder" } else { "file" }.to_string();
            let children = if metadata.is_dir() {
                build_file_tree(&path, depth + 1)?
            } else {
                Vec::new()
            };

            Ok(WorkspaceFileNode {
                name: entry.file_name().to_string_lossy().to_string(),
                path: path.display().to_string(),
                node_type,
                children,
            })
        })
        .collect()
}

fn output_to_tool_message(output: &Value) -> String {
    output
        .get("text")
        .and_then(Value::as_str)
        .map(str::to_string)
        .unwrap_or_else(|| output.to_string())
}

async fn list_queue_messages(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::QueueMessageRecord>>, StatusCode> {
    let messages = state
        .shared
        .message_queue
        .list_by_session(&session_id)
        .map_err(|error| internal_error("queue_list_failed", error))?;
    Ok(Json(messages))
}

async fn enqueue_message(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<EnqueueMessageRequest>,
) -> std::result::Result<(StatusCode, Json<crate::persistence::QueueMessageRecord>), StatusCode> {
    let queue_type = match request.queue_type.as_deref().unwrap_or("app") {
        "app" => crate::persistence::QueueType::App,
        "cli" => crate::persistence::QueueType::Cli,
        _ => return Err(StatusCode::BAD_REQUEST),
    };
    let order_index = state
        .shared
        .message_queue
        .next_order_index(&session_id)
        .map_err(|error| internal_error("queue_order_failed", error))?;
    let now = crate::persistence::repositories::clock::utc_now();
    let record = crate::persistence::QueueMessageRecord {
        id: Uuid::new_v4().to_string(),
        session_id,
        content: request.content,
        queue_type,
        status: crate::persistence::QueueMessageStatus::Pending,
        order_index,
        created_at: now.clone(),
        updated_at: now,
    };
    state
        .shared
        .message_queue
        .insert(&record)
        .map_err(|error| internal_error("queue_enqueue_failed", error))?;
    Ok((StatusCode::CREATED, Json(record)))
}

async fn edit_queue_message(
    Path((session_id, msg_id)): Path<(String, String)>,
    State(state): State<AppState>,
    Json(request): Json<EditQueueMessageRequest>,
) -> std::result::Result<Json<crate::persistence::QueueMessageRecord>, StatusCode> {
    let mut record = state
        .shared
        .message_queue
        .get(&msg_id)
        .map_err(|error| internal_error("queue_get_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    if record.session_id != session_id {
        return Err(StatusCode::NOT_FOUND);
    }
    record.content = request.content;
    record.updated_at = crate::persistence::repositories::clock::utc_now();
    state
        .shared
        .message_queue
        .update(&record)
        .map_err(|error| internal_error("queue_edit_failed", error))?;
    Ok(Json(record))
}

async fn delete_queue_message(
    Path((session_id, msg_id)): Path<(String, String)>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    let record = state
        .shared
        .message_queue
        .get(&msg_id)
        .map_err(|error| internal_error("queue_get_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    if record.session_id != session_id {
        return Err(StatusCode::NOT_FOUND);
    }
    state
        .shared
        .message_queue
        .delete(&msg_id)
        .map_err(|error| internal_error("queue_delete_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn reorder_queue(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<ReorderQueueRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    let messages = state
        .shared
        .message_queue
        .list_by_session(&session_id)
        .map_err(|error| internal_error("queue_list_failed", error))?;
    if messages.iter().any(|m| m.queue_type == crate::persistence::QueueType::Cli) {
        return Err(StatusCode::FORBIDDEN);
    }
    state
        .shared
        .message_queue
        .reorder(&session_id, &request.ordered_ids)
        .map_err(|error| internal_error("queue_reorder_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn flush_queue(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Option<crate::persistence::QueueMessageRecord>>, StatusCode> {
    let next = state
        .shared
        .message_queue
        .next_pending(&session_id)
        .map_err(|error| internal_error("queue_flush_failed", error))?;
    if let Some(mut record) = next {
        record.status = crate::persistence::QueueMessageStatus::Processing;
        record.updated_at = crate::persistence::repositories::clock::utc_now();
        state
            .shared
            .message_queue
            .update(&record)
            .map_err(|error| internal_error("queue_update_failed", error))?;
        Ok(Json(Some(record)))
    } else {
        Ok(Json(None))
    }
}

async fn list_session_tasks(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
) -> std::result::Result<Json<Vec<crate::persistence::TaskRecord>>, StatusCode> {
    let tasks = state
        .shared
        .tasks
        .list_by_session(&session_id)
        .map_err(|error| internal_error("task_list_failed", error))?;
    Ok(Json(tasks))
}

async fn create_session_task(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<CreateTaskRequest>,
) -> std::result::Result<(StatusCode, Json<crate::persistence::TaskRecord>), StatusCode> {
    let now = crate::persistence::repositories::clock::utc_now();
    let record = crate::persistence::TaskRecord {
        id: Uuid::new_v4().to_string(),
        session_id,
        agent_id: request.agent_id,
        title: request.title,
        description: request.description,
        status: crate::persistence::TaskStatus::Pending,
        priority: request.priority.unwrap_or(0),
        order_index: 0,
        parent_task_id: request.parent_task_id,
        created_at: now.clone(),
        updated_at: now,
    };
    state
        .shared
        .tasks
        .insert(&record)
        .map_err(|error| internal_error("task_create_failed", error))?;
    Ok((StatusCode::CREATED, Json(record)))
}

async fn update_session_task(
    Path((session_id, task_id)): Path<(String, String)>,
    State(state): State<AppState>,
    Json(request): Json<UpdateTaskRequest>,
) -> std::result::Result<Json<crate::persistence::TaskRecord>, StatusCode> {
    let mut record = state
        .shared
        .tasks
        .get(&task_id)
        .map_err(|error| internal_error("task_get_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    if record.session_id != session_id {
        return Err(StatusCode::NOT_FOUND);
    }
    if let Some(title) = request.title {
        record.title = title;
    }
    if let Some(description) = request.description {
        record.description = Some(description);
    }
    if let Some(status) = request.status {
        record.status = status
            .parse::<crate::persistence::TaskStatus>()
            .map_err(|_| StatusCode::BAD_REQUEST)?;
    }
    if let Some(priority) = request.priority {
        record.priority = priority;
    }
    if let Some(parent_task_id) = request.parent_task_id {
        record.parent_task_id = Some(parent_task_id);
    }
    record.updated_at = crate::persistence::repositories::clock::utc_now();
    state
        .shared
        .tasks
        .update(&record)
        .map_err(|error| internal_error("task_update_failed", error))?;
    Ok(Json(record))
}

async fn delete_session_task(
    Path((session_id, task_id)): Path<(String, String)>,
    State(state): State<AppState>,
) -> std::result::Result<StatusCode, StatusCode> {
    let record = state
        .shared
        .tasks
        .get(&task_id)
        .map_err(|error| internal_error("task_get_failed", error))?
        .ok_or(StatusCode::NOT_FOUND)?;
    if record.session_id != session_id {
        return Err(StatusCode::NOT_FOUND);
    }
    state
        .shared
        .tasks
        .delete(&task_id)
        .map_err(|error| internal_error("task_delete_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn reorder_session_tasks(
    Path(session_id): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<ReorderTasksRequest>,
) -> std::result::Result<StatusCode, StatusCode> {
    state
        .shared
        .tasks
        .reorder(&session_id, &request.ordered_ids)
        .map_err(|error| internal_error("task_reorder_failed", error))?;
    Ok(StatusCode::NO_CONTENT)
}
