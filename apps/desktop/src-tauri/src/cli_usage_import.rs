use std::path::Path;

use anyhow::{Context, Result};
use tracing::{debug, info};

use crate::persistence::repositories::usage::UsageAnalyticsRepository;
use crate::persistence::UsageAnalyticsRecord;

/// Scans external CLI tool data directories and imports usage records.
/// Uses deterministic IDs to prevent duplicate imports.
pub fn import_cli_usage(usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    let mut total_imported = 0;

    let home = dirs::home_dir().context("could not determine home directory")?;

    let importers: Vec<(&str, fn(&Path, &UsageAnalyticsRepository) -> Result<usize>)> = vec![
        ("Codex CLI", import_codex_usage),
        ("Opencode CLI", import_opencode_usage),
        ("Claude Code CLI", import_claude_code_usage),
        ("Gemini CLI", import_gemini_usage),
    ];

    for (name, importer) in importers {
        match importer(&home, usage_repo) {
            Ok(count) => {
                if count > 0 {
                    info!(count, source = name, "imported CLI usage records");
                }
                total_imported += count;
            }
            Err(err) => {
                debug!(?err, source = name, "skipping CLI usage import");
            }
        }
    }

    Ok(total_imported)
}

// ---------------------------------------------------------------------------
// Codex CLI — ~/.codex/state_5.sqlite → threads table
// ---------------------------------------------------------------------------

fn import_codex_usage(home: &Path, usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    let db_path = home.join(".codex").join("state_5.sqlite");
    if !db_path.exists() {
        return Ok(0);
    }

    let conn = open_readonly_sqlite(&db_path)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, created_at, model_provider, tokens_used, title
             FROM threads
             WHERE tokens_used > 0
             ORDER BY created_at ASC",
        )
        .context("failed to prepare Codex threads query")?;

    let mut imported = 0;
    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, i64>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
            ))
        })
        .context("failed to query Codex threads")?;

    for row in rows {
        let (thread_id, created_at, provider, tokens) =
            row.context("failed to read Codex thread row")?;

        let record_id = format!("cli-codex-{}", thread_id);
        let timestamp = unix_to_rfc3339(created_at);
        // Codex tokens_used is cumulative context (includes repeated prompt on every turn).
        // Estimate ~5% as net new tokens (the rest is cached context resent each turn).
        let estimated_net = (tokens as f64 * 0.05) as i64;
        let input_tokens = (estimated_net as f64 * 0.6) as i64;
        let output_tokens = estimated_net - input_tokens;
        let cost = crate::pricing_cache::calculate_cost(
            "o4-mini",
            &provider,
            input_tokens,
            output_tokens,
        );

        let record = UsageAnalyticsRecord {
            id: record_id,
            session_id: Some(format!("codex-{}", thread_id)),
            provider: normalize_provider(&provider),
            model: format!("{} CLI", normalize_provider(&provider)),
            input_tokens,
            output_tokens,
            cost,
            timestamp,
            latency_ms: None,
        };

        if usage_repo.import_if_not_exists(&record)? {
            imported += 1;
        }
    }

    Ok(imported)
}

// ---------------------------------------------------------------------------
// Opencode — ~/.local/share/opencode/opencode.db → session + part tables
// ---------------------------------------------------------------------------

fn import_opencode_usage(home: &Path, usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    let db_path = home.join(".local/share/opencode/opencode.db");
    if !db_path.exists() {
        return Ok(0);
    }

    let conn = open_readonly_sqlite(&db_path)?;

    // Aggregate token data from "step-finish" parts per session.
    // The `part.data` column is JSON; step-finish events contain a `tokens` object.
    let mut stmt = conn
        .prepare(
            "SELECT
                p.session_id,
                m.data AS message_data,
                p.data AS part_data
             FROM part p
             JOIN message m ON m.id = p.message_id
             WHERE p.data LIKE '%step-finish%'
             ORDER BY p.id ASC",
        )
        .context("failed to prepare Opencode parts query")?;

    // Accumulate per-session
    let mut session_map: std::collections::HashMap<
        String,
        (i64, i64, String, String, i64), // (input, output, model, provider, timestamp_ms)
    > = std::collections::HashMap::new();

    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .context("failed to query Opencode parts")?;

    for row in rows {
        let (session_id, message_data, part_data) =
            row.context("failed to read Opencode part row")?;

        let part_json: serde_json::Value = match serde_json::from_str(&part_data) {
            Ok(v) => v,
            Err(_) => continue,
        };

        // Extract tokens from step-finish event
        let tokens = match part_json.get("tokens") {
            Some(t) => t,
            None => continue,
        };

        let input = tokens.get("input").and_then(|v| v.as_i64()).unwrap_or(0);
        let output = tokens.get("output").and_then(|v| v.as_i64()).unwrap_or(0);

        if input == 0 && output == 0 {
            continue;
        }

        // Extract model info from message data
        let msg_json: serde_json::Value = serde_json::from_str(&message_data).unwrap_or_default();
        let model_id = msg_json
            .pointer("/model/modelID")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string();
        let provider_id = msg_json
            .pointer("/model/providerID")
            .and_then(|v| v.as_str())
            .unwrap_or("opencode")
            .to_string();
        let time_created = msg_json
            .pointer("/time/created")
            .and_then(|v| v.as_i64())
            .unwrap_or(0);

        let entry = session_map.entry(session_id).or_insert((0, 0, model_id.clone(), provider_id.clone(), time_created));
        entry.0 += input;
        entry.1 += output;
        // Keep most recent model/provider
        if time_created > entry.4 {
            entry.2 = model_id;
            entry.3 = provider_id;
            entry.4 = time_created;
        }
    }

    let mut imported = 0;

    for (session_id, (input_tokens, output_tokens, model, provider, timestamp_ms)) in session_map {
        let record_id = format!("cli-opencode-{}", session_id);

        // Opencode timestamps are milliseconds
        let timestamp = if timestamp_ms > 0 {
            unix_ms_to_rfc3339(timestamp_ms)
        } else {
            chrono::Utc::now().to_rfc3339()
        };

        let cost = crate::pricing_cache::calculate_cost(&model, &provider, input_tokens, output_tokens);

        let record = UsageAnalyticsRecord {
            id: record_id,
            session_id: Some(format!("opencode-{}", session_id)),
            provider: normalize_provider(&provider),
            model,
            input_tokens,
            output_tokens,
            cost,
            timestamp,
            latency_ms: None,
        };

        if usage_repo.import_if_not_exists(&record)? {
            imported += 1;
        }
    }

    Ok(imported)
}

// ---------------------------------------------------------------------------
// Claude Code — ~/.claude/projects/*/*.jsonl transcript files
// Assistant entries contain: { "message": { "model": "...", "usage": {
//   "input_tokens": N, "output_tokens": N, "cache_read_input_tokens": N,
//   "cache_creation_input_tokens": N } }, "timestamp": MS_EPOCH }
// ---------------------------------------------------------------------------

fn import_claude_code_usage(home: &Path, usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    let projects_dir = home.join(".claude").join("projects");
    if !projects_dir.exists() {
        return Ok(0);
    }

    let mut imported = 0;

    for project_entry in std::fs::read_dir(&projects_dir)? {
        let project_entry = project_entry?;
        if !project_entry.file_type()?.is_dir() {
            continue;
        }

        for file_entry in std::fs::read_dir(project_entry.path())? {
            let file_entry = file_entry?;
            let path = file_entry.path();

            if path.extension().and_then(|e| e.to_str()) != Some("jsonl") {
                continue;
            }

            match import_claude_session_file(&path, usage_repo) {
                Ok(count) => imported += count,
                Err(err) => {
                    debug!(?err, ?path, "skipping Claude Code session file");
                }
            }
        }
    }

    Ok(imported)
}

fn import_claude_session_file(path: &Path, usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    use std::io::BufRead;

    let file = std::fs::File::open(path)?;
    let reader = std::io::BufReader::new(file);

    let session_id = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown")
        .to_string();

    let mut total_input = 0i64;
    let mut total_output = 0i64;
    let mut first_timestamp_ms: i64 = 0;
    let mut model = String::new();

    for line in reader.lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        let value: serde_json::Value = match serde_json::from_str(&line) {
            Ok(v) => v,
            Err(_) => continue,
        };

        // Claude Code JSONL: assistant entries have message.usage with token counts
        // Structure: { "message": { "model": "...", "usage": { "input_tokens": N, "output_tokens": N, ... } } }
        if let Some(message) = value.get("message") {
            if let Some(usage) = message.get("usage") {
                let input = usage.get("input_tokens").and_then(|v| v.as_i64()).unwrap_or(0);
                let output = usage.get("output_tokens").and_then(|v| v.as_i64()).unwrap_or(0);
                let cache_read = usage.get("cache_read_input_tokens").and_then(|v| v.as_i64()).unwrap_or(0);
                let cache_create = usage.get("cache_creation_input_tokens").and_then(|v| v.as_i64()).unwrap_or(0);

                // cache_read tokens are part of input_tokens (cached portion), NOT additional
                // cache_creation tokens are the cost of writing to cache
                // Only count: input_tokens + output_tokens (these are the actual billable tokens)
                let _ = cache_read;
                let _ = cache_create;
                total_input += input;
                total_output += output;
            }

            // Extract model from message object
            if model.is_empty() {
                if let Some(m) = message.get("model").and_then(|v| v.as_str()) {
                    model = m.to_string();
                }
            }
        }

        // Extract earliest timestamp (milliseconds epoch)
        if first_timestamp_ms == 0 {
            if let Some(ts) = value.get("timestamp").and_then(|v| v.as_i64()) {
                first_timestamp_ms = ts;
            }
        }
    }

    if total_input == 0 && total_output == 0 {
        return Ok(0);
    }

    if model.is_empty() {
        model = "Claude".to_string();
    }

    let timestamp = if first_timestamp_ms > 0 {
        unix_ms_to_rfc3339(first_timestamp_ms)
    } else {
        std::fs::metadata(path)
            .and_then(|m| m.modified())
            .map(|t| {
                let dt: chrono::DateTime<chrono::Utc> = t.into();
                dt.to_rfc3339()
            })
            .unwrap_or_else(|_| chrono::Utc::now().to_rfc3339())
    };

    let cost = crate::pricing_cache::calculate_cost(&model, "anthropic", total_input, total_output);

    let record_id = format!("cli-claude-{}", session_id);

    let record = UsageAnalyticsRecord {
        id: record_id,
        session_id: Some(format!("claude-{}", session_id)),
        provider: "Anthropic".to_string(),
        model,
        input_tokens: total_input,
        output_tokens: total_output,
        cost,
        timestamp,
        latency_ms: None,
    };

    if usage_repo.import_if_not_exists(&record)? {
        return Ok(1);
    }

    Ok(0)
}

// ---------------------------------------------------------------------------
// Gemini CLI — ~/.gemini/tmp/*/chats/session-*.json
// Session JSON: { "messages": [ { "type": "gemini", "model": "...",
//   "tokens": { "input": N, "output": N, "cached": N, "thoughts": N,
//   "tool": N, "total": N }, "timestamp": "ISO" } ] }
// ---------------------------------------------------------------------------

fn import_gemini_usage(home: &Path, usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    let gemini_dir = home.join(".gemini").join("tmp");
    if !gemini_dir.exists() {
        return Ok(0);
    }

    let mut imported = 0;

    // Walk ~/.gemini/tmp/*/chats/session-*.json
    for project_entry in std::fs::read_dir(&gemini_dir)? {
        let project_entry = project_entry?;
        if !project_entry.file_type()?.is_dir() {
            continue;
        }

        let chats_dir = project_entry.path().join("chats");
        if !chats_dir.exists() {
            continue;
        }

        for file_entry in std::fs::read_dir(&chats_dir)? {
            let file_entry = file_entry?;
            let path = file_entry.path();

            if path.extension().and_then(|e| e.to_str()) != Some("json") {
                continue;
            }

            match import_gemini_session_file(&path, usage_repo) {
                Ok(count) => imported += count,
                Err(err) => {
                    debug!(?err, ?path, "skipping Gemini CLI session file");
                }
            }
        }
    }

    Ok(imported)
}

fn import_gemini_session_file(path: &Path, usage_repo: &UsageAnalyticsRepository) -> Result<usize> {
    let content = std::fs::read_to_string(path)?;
    let session_json: serde_json::Value = serde_json::from_str(&content)?;

    let messages = match session_json.get("messages").and_then(|v| v.as_array()) {
        Some(msgs) => msgs,
        None => return Ok(0),
    };

    if messages.len() < 2 {
        return Ok(0);
    }

    let session_id = session_json
        .get("sessionId")
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| {
            path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
        })
        .to_string();

    let record_id = format!("cli-gemini-{}", session_id);

    let mut total_input = 0i64;
    let mut total_output = 0i64;
    let mut model = String::new();
    let mut first_timestamp = String::new();

    for msg in messages {
        let msg_type = msg.get("type").and_then(|v| v.as_str()).unwrap_or("");

        // Gemini response messages have type "gemini" with a tokens object
        if msg_type == "gemini" {
            if let Some(tokens) = msg.get("tokens") {
                let input = tokens.get("input").and_then(|v| v.as_i64()).unwrap_or(0);
                let output = tokens.get("output").and_then(|v| v.as_i64()).unwrap_or(0);
                let cached = tokens.get("cached").and_then(|v| v.as_i64()).unwrap_or(0);
                let thoughts = tokens.get("thoughts").and_then(|v| v.as_i64()).unwrap_or(0);

                total_input += input + cached;
                total_output += output + thoughts;
            }

            if model.is_empty() {
                if let Some(m) = msg.get("model").and_then(|v| v.as_str()) {
                    model = m.to_string();
                }
            }
        }

        // Capture first timestamp
        if first_timestamp.is_empty() {
            if let Some(ts) = msg.get("timestamp").and_then(|v| v.as_str()) {
                first_timestamp = ts.to_string();
            }
        }
    }

    if total_input == 0 && total_output == 0 {
        return Ok(0);
    }

    if model.is_empty() {
        model = "Gemini CLI".to_string();
    }

    // Use session startTime, then first message timestamp, then file mtime
    let timestamp = session_json
        .get("startTime")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| if first_timestamp.is_empty() { None } else { Some(first_timestamp) })
        .unwrap_or_else(|| {
            std::fs::metadata(path)
                .and_then(|m| m.modified())
                .map(|t| {
                    let dt: chrono::DateTime<chrono::Utc> = t.into();
                    dt.to_rfc3339()
                })
                .unwrap_or_else(|_| chrono::Utc::now().to_rfc3339())
        });

    let cost = crate::pricing_cache::calculate_cost(&model, "google", total_input, total_output);

    let record = UsageAnalyticsRecord {
        id: record_id,
        session_id: Some(format!("gemini-{}", session_id)),
        provider: "Google".to_string(),
        model,
        input_tokens: total_input,
        output_tokens: total_output,
        cost,
        timestamp,
        latency_ms: None,
    };

    if usage_repo.import_if_not_exists(&record)? {
        return Ok(1);
    }

    Ok(0)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn open_readonly_sqlite(path: &Path) -> Result<rusqlite::Connection> {
    rusqlite::Connection::open_with_flags(
        path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .with_context(|| format!("failed to open SQLite database at {}", path.display()))
}

fn unix_to_rfc3339(secs: i64) -> String {
    chrono::DateTime::from_timestamp(secs, 0)
        .map(|dt| dt.to_rfc3339())
        .unwrap_or_else(|| chrono::Utc::now().to_rfc3339())
}

fn unix_ms_to_rfc3339(ms: i64) -> String {
    chrono::DateTime::from_timestamp_millis(ms)
        .map(|dt| dt.to_rfc3339())
        .unwrap_or_else(|| chrono::Utc::now().to_rfc3339())
}

fn normalize_provider(raw: &str) -> String {
    match raw.to_lowercase().as_str() {
        "anthropic" | "claude" => "Anthropic".to_string(),
        "openai" | "gpt" => "OpenAI".to_string(),
        "google" | "gemini" => "Google".to_string(),
        other => {
            let mut chars = other.chars();
            match chars.next() {
                Some(c) => c.to_uppercase().to_string() + chars.as_str(),
                None => other.to_string(),
            }
        }
    }
}
