use std::{
    path::PathBuf,
    process::Stdio,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};

use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader, BufWriter, Lines},
    process::{Child, ChildStdin, ChildStdout, Command},
    sync::Mutex,
    time::{sleep, Duration},
};

#[derive(Clone, Debug)]
pub struct BunWorkerConfig {
    pub bun_executable: String,
    pub script_path: PathBuf,
}

impl Default for BunWorkerConfig {
    fn default() -> Self {
        Self {
            bun_executable: "bun".to_string(),
            script_path: PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("..")
                .join("worker")
                .join("bridge.ts"),
        }
    }
}

#[derive(Clone)]
pub struct BunWorkerBridge {
    config: BunWorkerConfig,
    process: Arc<Mutex<Option<WorkerProcess>>>,
    next_id: Arc<AtomicU64>,
}

pub type WorkerResult<T> = std::result::Result<T, WorkerError>;

#[derive(Debug, Error)]
pub enum WorkerError {
    #[error("failed to spawn bun worker: {0}")]
    Spawn(String),
    #[error("worker protocol error: {0}")]
    Protocol(String),
    #[error("worker request failed: {0}")]
    RequestFailed(String),
}

pub struct WorkerHealth {
    pub status: String,
    pub pid: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamMessage {
    pub role: String,
    pub content: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamRequest {
    pub provider_id: String,
    pub model_id: String,
    pub session_id: String,
    pub api_key: Option<String>,
    pub reasoning_mode: Option<String>,
    pub reasoning_effort: Option<String>,
    pub messages: Vec<StreamMessage>,
}

pub struct StreamResponse {
    pub tokens: Vec<String>,
    pub final_text: String,
    pub tool_call: Option<WorkerToolCall>,
    pub prompt_tokens: i64,
    pub completion_tokens: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmbeddingRequest {
    pub provider_id: String,
    pub model_id: String,
    pub api_key: Option<String>,
    pub input: String,
}

pub struct EmbeddingResponse {
    pub vector: Vec<f32>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkerToolCall {
    pub call_id: String,
    pub tool_name: String,
    pub args: Value,
}

struct WorkerProcess {
    child: Child,
    stdin: BufWriter<ChildStdin>,
    stdout: Lines<BufReader<ChildStdout>>,
}

#[derive(Serialize)]
struct JsonRpcRequest<'a, T> {
    jsonrpc: &'static str,
    id: String,
    method: &'a str,
    params: T,
}

#[derive(Deserialize)]
struct JsonRpcResponse<T> {
    id: Option<String>,
    result: Option<T>,
    method: Option<String>,
    params: Option<Value>,
    error: Option<JsonRpcError>,
}

#[derive(Deserialize)]
struct JsonRpcError {
    code: i64,
    message: String,
}

#[derive(Deserialize)]
struct HealthResult {
    status: String,
    pid: i64,
}

#[derive(Deserialize)]
struct EmbeddingResult {
    vector: Vec<f32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StreamStartResult {
    stream_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StreamTokenNotification {
    stream_id: String,
    text: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StreamDoneNotification {
    stream_id: String,
    final_text: String,
    prompt_tokens: Option<i64>,
    completion_tokens: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StreamToolCallNotification {
    stream_id: String,
    call_id: String,
    tool_name: String,
    args: Value,
}

impl BunWorkerBridge {
    pub async fn new(config: BunWorkerConfig) -> WorkerResult<Self> {
        let bridge = Self {
            config,
            process: Arc::new(Mutex::new(None)),
            next_id: Arc::new(AtomicU64::new(1)),
        };

        bridge.ensure_process().await.map_err(WorkerError::from)?;
        Ok(bridge)
    }

    pub async fn health_check(&self) -> WorkerResult<WorkerHealth> {
        let result: HealthResult = self
            .request("health.check", serde_json::json!({}))
            .await
            .map_err(WorkerError::from)?;
        Ok(WorkerHealth {
            status: result.status,
            pid: result.pid,
        })
    }

    pub async fn stream_completion(&self, request: StreamRequest) -> WorkerResult<StreamResponse> {
        self.stream_completion_with_handler(request, |_| Ok(())).await
    }

    pub async fn stream_completion_with_handler<F>(
        &self,
        request: StreamRequest,
        mut on_token: F,
    ) -> WorkerResult<StreamResponse>
    where
        F: FnMut(&str) -> WorkerResult<()>,
    {
        let mut process = self.process.lock().await;
        let process = self
            .ensure_process_locked(&mut process)
            .await
            .map_err(WorkerError::from)?;
        let id = self.next_request_id();

        write_request(
            &mut process.stdin,
            &JsonRpcRequest {
                jsonrpc: "2.0",
                id: id.clone(),
                method: "stream.start",
                params: request,
            },
        )
        .await
        .map_err(WorkerError::from)?;

        let mut tokens = Vec::new();
        let mut stream_id = None::<String>;
        let mut tool_call = None::<WorkerToolCall>;

        loop {
            let line = read_line(&mut process.stdout)
                .await
                .map_err(WorkerError::from)?;
            let response: JsonRpcResponse<Value> =
                serde_json::from_str(&line)
                    .context("failed to decode worker message")
                    .map_err(WorkerError::from)?;

            if response.id.as_deref() == Some(id.as_str()) {
                if let Some(error) = response.error {
                    return Err(WorkerError::RequestFailed(format!(
                        "worker stream.start failed {}: {}",
                        error.code, error.message
                    )));
                }
                let result: StreamStartResult = serde_json::from_value(
                    response.result.context("missing stream.start result")?,
                )
                .context("failed to decode stream start result")
                .map_err(WorkerError::from)?;
                stream_id = Some(result.stream_id);
                continue;
            }

            match response.method.as_deref() {
                Some("stream.token") => {
                    let notification: StreamTokenNotification = serde_json::from_value(
                        response.params.context("missing stream token params")?,
                    )
                    .context("failed to decode stream token")
                    .map_err(WorkerError::from)?;
                    if stream_id.as_deref() == Some(notification.stream_id.as_str()) {
                        on_token(&notification.text)?;
                        tokens.push(notification.text);
                    }
                }
                Some("stream.tool_call") => {
                    let notification: StreamToolCallNotification = serde_json::from_value(
                        response.params.context("missing stream tool call params")?,
                    )
                    .context("failed to decode stream tool call")
                    .map_err(WorkerError::from)?;
                    if stream_id.as_deref() == Some(notification.stream_id.as_str()) {
                        tool_call = Some(WorkerToolCall {
                            call_id: notification.call_id,
                            tool_name: notification.tool_name,
                            args: notification.args,
                        });
                    }
                }
                Some("stream.done") => {
                    let notification: StreamDoneNotification = serde_json::from_value(
                        response.params.context("missing stream done params")?,
                    )
                    .context("failed to decode stream done")
                    .map_err(WorkerError::from)?;
                    if stream_id.as_deref() == Some(notification.stream_id.as_str()) {
                        return Ok(StreamResponse {
                            tokens,
                            final_text: notification.final_text,
                            tool_call,
                            prompt_tokens: notification.prompt_tokens.unwrap_or(0),
                            completion_tokens: notification.completion_tokens.unwrap_or(0),
                        });
                    }
                }
                Some("stream.error") => {
                    let error = response
                        .params
                        .and_then(|value| value.get("message").and_then(Value::as_str).map(str::to_string))
                        .unwrap_or_else(|| "worker stream error".to_string());
                    return Err(WorkerError::RequestFailed(error));
                }
                _ => {}
            }
        }
    }

    pub async fn generate_embedding(&self, request: EmbeddingRequest) -> WorkerResult<EmbeddingResponse> {
        let result: EmbeddingResult = self
            .request("embed.generate", request)
            .await
            .map_err(WorkerError::from)?;
        Ok(EmbeddingResponse {
            vector: result.vector,
        })
    }

    pub async fn crash_for_test(&self) -> WorkerResult<()> {
        let _: Value = self
            .request("worker.crash", serde_json::json!({}))
            .await
            .map_err(WorkerError::from)?;
        for _ in 0..10 {
            let mut process = self.process.lock().await;
            let has_exited = process
                .as_mut()
                .and_then(|worker| worker.child.try_wait().ok())
                .flatten()
                .is_some();
            drop(process);

            if has_exited {
                break;
            }

            sleep(Duration::from_millis(25)).await;
        }
        Ok(())
    }

    async fn request<P: Serialize, T: for<'de> Deserialize<'de>>(
        &self,
        method: &str,
        params: P,
    ) -> Result<T> {
        let mut process = self.process.lock().await;
        let process = self.ensure_process_locked(&mut process).await?;
        let id = self.next_request_id();

        write_request(
            &mut process.stdin,
            &JsonRpcRequest {
                jsonrpc: "2.0",
                id: id.clone(),
                method,
                params,
            },
        )
        .await?;

        loop {
            let line = read_line(&mut process.stdout).await?;
            let response: JsonRpcResponse<T> =
                serde_json::from_str(&line).context("failed to decode worker response")?;
            if response.id.as_deref() != Some(id.as_str()) {
                continue;
            }

            if let Some(error) = response.error {
                return Err(anyhow!("worker request {} failed {}: {}", method, error.code, error.message));
            }

            return response
                .result
                .ok_or_else(|| anyhow!("worker response for {} missing result", method));
        }
    }

    async fn ensure_process(&self) -> Result<()> {
        let mut process = self.process.lock().await;
        self.ensure_process_locked(&mut process).await?;
        Ok(())
    }

    async fn ensure_process_locked<'a>(
        &self,
        process: &'a mut Option<WorkerProcess>,
    ) -> Result<&'a mut WorkerProcess> {
        let should_spawn = match process.as_mut() {
            Some(existing) => existing
                .child
                .try_wait()
                .context("failed to poll bun worker status")?
                .is_some(),
            None => true,
        };

        if should_spawn {
            *process = Some(spawn_process(&self.config).await?);
        }

        process
            .as_mut()
            .ok_or_else(|| anyhow!("bun worker process missing after spawn"))
    }

    fn next_request_id(&self) -> String {
        self.next_id.fetch_add(1, Ordering::Relaxed).to_string()
    }
}

impl From<anyhow::Error> for WorkerError {
    fn from(error: anyhow::Error) -> Self {
        WorkerError::Protocol(error.to_string())
    }
}

async fn spawn_process(config: &BunWorkerConfig) -> Result<WorkerProcess> {
    let mut command = Command::new(&config.bun_executable);
    command
        .arg(&config.script_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit());

    if std::env::var_os("RUST_TEST_THREADS").is_some() {
        command.env("LUNARIA_ENABLE_MOCK_PROVIDER", "1");
    }

    let mut child = command.spawn().with_context(|| {
        format!(
            "failed to spawn bun worker using {} {}",
            config.bun_executable,
            config.script_path.display()
        )
    })?;

    let stdin = child.stdin.take().context("bun worker stdin missing")?;
    let stdout = child.stdout.take().context("bun worker stdout missing")?;

    Ok(WorkerProcess {
        child,
        stdin: BufWriter::new(stdin),
        stdout: BufReader::new(stdout).lines(),
    })
}

async fn write_request<P: Serialize>(
    stdin: &mut BufWriter<ChildStdin>,
    request: &JsonRpcRequest<'_, P>,
) -> Result<()> {
    let encoded = serde_json::to_string(request).context("failed to encode worker request")?;
    stdin
        .write_all(encoded.as_bytes())
        .await
        .context("failed to write worker request")?;
    stdin
        .write_all(b"\n")
        .await
        .context("failed to terminate worker request line")?;
    stdin.flush().await.context("failed to flush worker request")
}

async fn read_line(stdout: &mut Lines<BufReader<ChildStdout>>) -> Result<String> {
    stdout
        .next_line()
        .await
        .context("failed to read worker line")?
        .ok_or_else(|| anyhow!("worker process ended unexpectedly"))
}
