use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    AgentLifecycleStatus, AgentMode, AgentRecord,
};

pub struct AgentRepository {
    db: Arc<Database>,
}

impl AgentRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &AgentRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO agents (id, session_id, parent_agent_id, type, mode, model, system_prompt, tool_access, permission_config, status, steps_limit, division, collaboration_style, communication_preference, decision_weight)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
                params![
                    record.id,
                    record.session_id,
                    record.parent_agent_id,
                    record.agent_type,
                    record.mode.as_str(),
                    record.model,
                    record.system_prompt,
                    serde_json::to_string(&record.tool_access)?,
                    serde_json::to_string(&record.permission_config)?,
                    record.status.as_str(),
                    record.steps_limit,
                    record.division,
                    record.collaboration_style,
                    record.communication_preference,
                    record.decision_weight,
                ],
            ).context("failed to insert agent")?;
            Ok(())
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<AgentRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT id, session_id, parent_agent_id, type, mode, model, system_prompt, tool_access, permission_config, status, steps_limit, division, collaboration_style, communication_preference, decision_weight
                 FROM agents WHERE id = ?1",
                params![id],
                map_agent,
            )
            .optional()
            .context("failed to load agent")
        })
    }

    pub fn list_by_session(&self, session_id: &str) -> Result<Vec<AgentRecord>> {
        self.db.read(|connection| {
            let mut statement = connection.prepare(
                "SELECT id, session_id, parent_agent_id, type, mode, model, system_prompt, tool_access, permission_config, status, steps_limit, division, collaboration_style, communication_preference, decision_weight
                 FROM agents WHERE session_id = ?1 ORDER BY rowid ASC",
            ).context("failed to prepare agents query")?;
            let rows = statement
                .query_map(params![session_id], map_agent)
                .context("failed to query agents")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect agent rows")?;
            Ok(rows)
        })
    }
}

fn map_agent(row: &Row<'_>) -> rusqlite::Result<AgentRecord> {
    Ok(AgentRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        parent_agent_id: row.get(2)?,
        agent_type: row.get(3)?,
        mode: row
            .get::<_, String>(4)?
            .parse::<AgentMode>()
            .map_err(|error| sqlite_text_conversion_error(4, error))?,
        model: row.get(5)?,
        system_prompt: row.get(6)?,
        tool_access: serde_json::from_value(
            parse_json_value(row.get(7)?).map_err(|error| sqlite_text_conversion_error(7, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(7, error))?,
        permission_config: parse_json_value(row.get(8)?)
            .map_err(|error| sqlite_text_conversion_error(8, error))?,
        status: row
            .get::<_, String>(9)?
            .parse::<AgentLifecycleStatus>()
            .map_err(|error| sqlite_text_conversion_error(9, error))?,
        steps_limit: row.get(10)?,
        division: row.get(11)?,
        collaboration_style: row.get(12)?,
        communication_preference: row.get(13)?,
        decision_weight: row.get(14)?,
    })
}
