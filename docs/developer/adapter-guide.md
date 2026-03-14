# Adapter Implementation Guide

## Overview

Lunaria supports wrapping external CLI coding agents (Claude Code, OpenCode, Codex CLI, Gemini CLI) through a unified adapter interface. This guide explains how to implement a new wrapper adapter.

## Architecture

```
User ←→ Lunaria UI ←→ Adapter ←→ External CLI Tool
                         │
                    Translates between Lunaria's
                    session/event model and the
                    CLI tool's native interface
```

Each adapter implements the `BackendAdapter` trait, translating between Lunaria's unified session contract and the external tool's communication protocol.

## Adapter Interface

Every adapter must implement:

```typescript
interface BackendAdapter {
  /** Unique identifier for this backend */
  readonly id: string;

  /** Human-readable name */
  readonly displayName: string;

  /** Integration mode: "full" | "partial" | "pty-only" */
  readonly mode: IntegrationMode;

  /** Check if the CLI tool is installed and available */
  detect(): Promise<DetectionResult>;

  /** Start a new session */
  startSession(config: SessionConfig): Promise<SessionHandle>;

  /** Send a message to the active session */
  sendMessage(handle: SessionHandle, message: string): Promise<void>;

  /** Subscribe to session events */
  onEvent(handle: SessionHandle, callback: (event: StreamEvent) => void): void;

  /** Interrupt the current generation */
  interrupt(handle: SessionHandle): Promise<void>;

  /** End the session */
  endSession(handle: SessionHandle): Promise<void>;

  /** Get capabilities of this backend */
  capabilities(): BackendCapabilities;
}
```

## Integration Modes

| Mode | Description | Example |
|------|------------|---------|
| `full` | Bidirectional machine API (structured I/O, session control) | Claude Code via `--sdk-url` |
| `partial` | Some structured control, missing full lifecycle | OpenCode JSON-RPC |
| `pty-only` | Terminal emulation only, output parsing required | Codex CLI, Gemini CLI |

## Step-by-Step: Adding a New Adapter

### 1. Check the TUI Capability Matrix

Read `docs/architecture/tui-capability-matrix.md` to understand what the target CLI supports:
- Does it have a machine-readable API?
- Does it support session management?
- What output formats are available?
- Can it be controlled programmatically?

### 2. Create the Adapter File

```
src-tauri/src/adapters/
├── mod.rs
├── claude_code.rs    # Existing
├── opencode.rs       # Existing
└── my_new_tool.rs    # Your new adapter
```

### 3. Implement Detection

```rust
pub async fn detect() -> DetectionResult {
    // Check if the CLI tool is installed
    let output = Command::new("my-tool").arg("--version").output().await;
    match output {
        Ok(out) => DetectionResult {
            installed: true,
            version: parse_version(&out.stdout),
            path: which("my-tool"),
        },
        Err(_) => DetectionResult {
            installed: false,
            version: None,
            path: None,
        },
    }
}
```

### 4. Implement Session Lifecycle

For `full` mode adapters:
```rust
// Start the CLI tool with its machine API
let child = Command::new("my-tool")
    .args(["--api-mode", "--output=json"])
    .stdin(Stdio::piped())
    .stdout(Stdio::piped())
    .spawn()?;
```

For `pty-only` mode adapters:
```rust
// Start the CLI tool in a PTY
let pty = PtyProcess::spawn("my-tool", &["--no-color"])?;
// Parse output using pattern matching
```

### 5. Map Events to StreamEvent

All adapters must translate their tool's output into Lunaria's `StreamEvent` enum:

```rust
// Map tool-specific events to Lunaria events
match tool_event {
    ToolEvent::Text(text) => StreamEvent::Token { text },
    ToolEvent::ToolUse { name, args } => StreamEvent::ToolCall { id, name, args },
    ToolEvent::Done => StreamEvent::Done {},
    // ...
}
```

### 6. Register the Adapter

Add the adapter to the registry in `src-tauri/src/adapters/mod.rs`:

```rust
pub fn create_adapter(id: &str) -> Option<Box<dyn BackendAdapter>> {
    match id {
        "claude-code" => Some(Box::new(ClaudeCodeAdapter::new())),
        "opencode" => Some(Box::new(OpenCodeAdapter::new())),
        "my-new-tool" => Some(Box::new(MyNewToolAdapter::new())),
        _ => None,
    }
}
```

## Testing an Adapter

### Unit Tests

Test event mapping and parsing without the actual CLI tool:

```rust
#[test]
fn test_event_mapping() {
    let raw = r#"{"type": "text", "content": "hello"}"#;
    let event = MyAdapter::parse_event(raw).unwrap();
    assert_eq!(event, StreamEvent::Token { text: "hello".into() });
}
```

### Integration Tests

Test with the real CLI tool installed:

```rust
#[test]
#[ignore] // Requires my-tool to be installed
fn test_session_lifecycle() {
    let adapter = MyNewToolAdapter::new();
    let detection = adapter.detect().await;
    assert!(detection.installed);

    let session = adapter.start_session(config).await.unwrap();
    adapter.send_message(&session, "Hello").await.unwrap();
    // Verify events are received...
    adapter.end_session(&session).await.unwrap();
}
```

## Graceful Degradation

Adapters must handle tool unavailability gracefully:

- If detection fails, the adapter is disabled in the UI (not hidden).
- If the tool crashes mid-session, emit an `ErrorEvent` with `retryable: true`.
- If a feature is unsupported (e.g., PTY-only tool can't provide structured tool calls), return `NotSupported` rather than failing.

## Reference

- `docs/architecture/agent-backend-interface.md` — Full backend interface spec
- `docs/architecture/tui-capability-matrix.md` — Capability comparison across all supported tools
- `docs/architecture/implementation-roadmap.md` — Phase schedule for adapter delivery
