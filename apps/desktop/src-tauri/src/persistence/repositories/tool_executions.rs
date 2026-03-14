use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    ToolExecutionRecord, ToolPermissionDecision,
};

pub struct ToolExecutionRepository {
    db: Arc<Database>,
}

impl ToolExecutionRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &ToolExecutionRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO tool_executions (id, session_id, agent_id, tool_name, input, output, permission_decision, duration_ms)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        record.id,
                        record.session_id,
                        record.agent_id,
                        record.tool_name,
                        serde_json::to_string(&record.input)?,
                        record.output.as_ref().map(serde_json::to_string).transpose()?,
                        record.permission_decision.as_str(),
                        record.duration_ms,
                    ],
                )
                .context("failed to insert tool execution audit")?;

            Ok(())
        })
    }

    pub fn list_by_session(&self, session_id: &str) -> Result<Vec<ToolExecutionRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, session_id, agent_id, tool_name, input, output, permission_decision, duration_ms
                     FROM tool_executions WHERE session_id = ?1 ORDER BY rowid ASC",
                )
                .context("failed to prepare tool execution query")?;

            let rows = statement
                .query_map(params![session_id], map_tool_execution)
                .context("failed to query tool executions")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect tool execution rows")?;

            Ok(rows)
        })
    }
}

fn map_tool_execution(row: &Row<'_>) -> rusqlite::Result<ToolExecutionRecord> {
    Ok(ToolExecutionRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        agent_id: row.get(2)?,
        tool_name: row.get(3)?,
        input: parse_json_value(row.get(4)?).map_err(|error| sqlite_text_conversion_error(4, error))?,
        output: row
            .get::<_, Option<String>>(5)?
            .map(|value| parse_json_value(value).map_err(|error| sqlite_text_conversion_error(5, error)))
            .transpose()?,
        permission_decision: row
            .get::<_, String>(6)?
            .parse::<ToolPermissionDecision>()
            .map_err(|error| sqlite_text_conversion_error(6, error))?,
        duration_ms: row.get(7)?,
    })
}
