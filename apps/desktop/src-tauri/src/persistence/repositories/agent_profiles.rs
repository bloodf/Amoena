use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    AgentProfileRecord,
};

pub struct AgentProfileRepository {
    db: Arc<Database>,
}

impl AgentProfileRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, record: &AgentProfileRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO agent_profiles (id, name, division, system_prompt, tool_access, permission_config, collaboration_style, communication_preference, decision_weight, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
                 ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   division = excluded.division,
                   system_prompt = excluded.system_prompt,
                   tool_access = excluded.tool_access,
                   permission_config = excluded.permission_config,
                   collaboration_style = excluded.collaboration_style,
                   communication_preference = excluded.communication_preference,
                   decision_weight = excluded.decision_weight,
                   updated_at = excluded.updated_at",
                params![
                    record.id,
                    record.name,
                    record.division,
                    record.system_prompt,
                    serde_json::to_string(&record.tool_access)?,
                    serde_json::to_string(&record.permission_config)?,
                    record.collaboration_style,
                    record.communication_preference,
                    record.decision_weight,
                    record.created_at,
                    record.updated_at,
                ],
            ).context("failed to upsert agent profile")?;
            Ok(())
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<AgentProfileRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT id, name, division, system_prompt, tool_access, permission_config, collaboration_style, communication_preference, decision_weight, created_at, updated_at
                 FROM agent_profiles WHERE id = ?1",
                params![id],
                map_agent_profile,
            )
            .optional()
            .context("failed to load agent profile")
        })
    }
}

fn map_agent_profile(row: &Row<'_>) -> rusqlite::Result<AgentProfileRecord> {
    Ok(AgentProfileRecord {
        id: row.get(0)?,
        name: row.get(1)?,
        division: row.get(2)?,
        system_prompt: row.get(3)?,
        tool_access: serde_json::from_value(
            parse_json_value(row.get(4)?).map_err(|error| sqlite_text_conversion_error(4, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(4, error))?,
        permission_config: parse_json_value(row.get(5)?)
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        collaboration_style: row.get(6)?,
        communication_preference: row.get(7)?,
        decision_weight: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}
