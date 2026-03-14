use std::sync::Arc;

use lunaria_desktop::{
    config::{ConfigService, MemorySecretStore, RuntimePaths},
    persistence::{repositories::providers::ProviderRepository, AuthStatus, Database, ProviderAuthType, ProviderModelRecord, ProviderRecord, ProviderType, SettingScope},
    routing::{
        adaptive_reasoning_mode, ProviderRoutingService, ReasoningEffort, ReasoningMode,
        RoutingAgentState, RoutingPersonaContext, RoutingRequest,
    },
};
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, Arc<ConfigService>) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let state_root = tempdir.path().join(".lunaria");
    let database = Arc::new(
        Database::open(state_root.join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let config = Arc::new(ConfigService::new(
        RuntimePaths::new(state_root),
        database.clone(),
        Arc::new(MemorySecretStore::new()),
    ));

    let provider_service = lunaria_desktop::providers::ProviderRegistryService::new(
        database.clone(),
        config.clone(),
        Arc::new(lunaria_desktop::providers::StaticEnvironment::default()),
        vec![],
    );
    tokio::runtime::Runtime::new()
        .expect("tokio runtime should build")
        .block_on(provider_service.refresh_catalog())
        .expect("catalog refresh should succeed");

    (tempdir, database, config)
}

#[test]
fn override_precedence_prefers_turn_then_setting_then_adaptive_policy() {
    let (_tempdir, database, config) = setup();
    config
        .put_setting(
            "providers.reasoning.anthropic/claude-sonnet-4-20250514.mode",
            SettingScope::Global,
            None,
            &"on".to_string(),
        )
        .expect("reasoning default should persist");
    config
        .put_setting(
            "providers.reasoning.anthropic/claude-sonnet-4-20250514.effort",
            SettingScope::Global,
            None,
            &"high".to_string(),
        )
        .expect("reasoning effort should persist");

    let routing = ProviderRoutingService::new(database, config);
    let decision = routing
        .resolve(RoutingRequest {
            provider_id: Some("anthropic".to_string()),
            model_id: Some("claude-sonnet-4-20250514".to_string()),
            task_type: "architecture".to_string(),
            agent_state: RoutingAgentState::Active,
            turn_reasoning_mode: Some(ReasoningMode::Off),
            turn_reasoning_effort: Some(ReasoningEffort::Low),
            persona: RoutingPersonaContext {
                preferred_model: None,
                division: "engineering".to_string(),
                decision_weight: 0.7,
            },
        })
        .expect("routing should resolve");

    assert_eq!(decision.reasoning_mode, ReasoningMode::Off);
    assert_eq!(decision.reasoning_effort, None);
}

#[test]
fn adaptive_policy_is_deterministic_for_heavy_and_light_tasks() {
    assert_eq!(adaptive_reasoning_mode("architecture", "engineering"), ReasoningMode::On);
    assert_eq!(adaptive_reasoning_mode("system.title", "engineering"), ReasoningMode::Off);
    assert_eq!(adaptive_reasoning_mode("misc-task", "engineering"), ReasoningMode::Auto);
    assert_eq!(adaptive_reasoning_mode("misc-task", "security"), ReasoningMode::On);
}

#[test]
fn unsupported_models_reject_fake_reasoning_overrides() {
    let (_tempdir, database, config) = setup();
    let repo = ProviderRepository::new(database.clone());
    repo.upsert_provider(&ProviderRecord {
        id: "local-lm-studio".to_string(),
        name: "LM Studio".to_string(),
        npm_package: Some("@ai-sdk/openai".to_string()),
        provider_type: ProviderType::Local,
        base_url: Some("http://127.0.0.1:1234".to_string()),
        auth_type: ProviderAuthType::None,
        auth_status: AuthStatus::Connected,
        model_count: 1,
        last_refreshed_at: Some("2026-03-12T00:00:00Z".to_string()),
        created_at: "2026-03-12T00:00:00Z".to_string(),
    })
    .expect("local provider should insert");
    repo.replace_models(
        "local-lm-studio",
        &[ProviderModelRecord {
            provider_id: "local-lm-studio".to_string(),
            model_id: "phi-4-mini".to_string(),
            display_name: "Phi-4 Mini".to_string(),
            context_window: None,
            input_cost_per_million: None,
            output_cost_per_million: None,
            supports_vision: false,
            supports_tools: true,
            supports_reasoning: false,
            reasoning_modes: vec!["off".to_string()],
            reasoning_effort_supported: false,
            reasoning_effort_values: vec![],
            reasoning_token_budget_supported: false,
            discovered_at: "2026-03-12T00:00:00Z".to_string(),
            refreshed_at: "2026-03-12T00:00:00Z".to_string(),
        }],
    )
    .expect("local model should insert");
    let routing = ProviderRoutingService::new(database, config);

    let error = routing
        .resolve(RoutingRequest {
            provider_id: Some("local-lm-studio".to_string()),
            model_id: Some("phi-4-mini".to_string()),
            task_type: "architecture".to_string(),
            agent_state: RoutingAgentState::Active,
            turn_reasoning_mode: Some(ReasoningMode::On),
            turn_reasoning_effort: None,
            persona: RoutingPersonaContext {
                preferred_model: None,
                division: "engineering".to_string(),
                decision_weight: 0.5,
            },
        })
        .expect_err("unsupported local model should reject reasoning");

    assert!(matches!(
        error,
        lunaria_desktop::routing::RoutingError::UnsupportedReasoningModel { .. }
    ));
}

#[test]
fn persona_preferred_model_and_agent_state_are_respected() {
    let (_tempdir, database, config) = setup();
    let routing = ProviderRoutingService::new(database, config);

    let decision = routing
        .resolve(RoutingRequest {
            provider_id: None,
            model_id: None,
            task_type: "planning".to_string(),
            agent_state: RoutingAgentState::Running,
            turn_reasoning_mode: None,
            turn_reasoning_effort: None,
            persona: RoutingPersonaContext {
                preferred_model: Some("gpt-5-mini".to_string()),
                division: "engineering".to_string(),
                decision_weight: 0.8,
            },
        })
        .expect("preferred model should route if available");

    assert_eq!(decision.model_id, "gpt-5-mini");
    assert_eq!(decision.decision_weight, 0.8);

    let paused_error = routing
        .resolve(RoutingRequest {
            provider_id: None,
            model_id: None,
            task_type: "planning".to_string(),
            agent_state: RoutingAgentState::Paused,
            turn_reasoning_mode: None,
            turn_reasoning_effort: None,
            persona: RoutingPersonaContext {
                preferred_model: None,
                division: "engineering".to_string(),
                decision_weight: 0.5,
            },
        })
        .expect_err("paused agents should be rejected");

    assert!(matches!(
        paused_error,
        lunaria_desktop::routing::RoutingError::InvalidAgentState(_)
    ));
}
