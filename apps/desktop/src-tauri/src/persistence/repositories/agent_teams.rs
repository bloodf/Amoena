use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    AgentTeamRecord, TeamLifecycleStatus,
};

pub struct AgentTeamRepository {
    db: Arc<Database>,
}

impl AgentTeamRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &AgentTeamRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO agent_teams (id, name, shared_task_list_path, status, division_requirements, threshold)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    record.id,
                    record.name,
                    record.shared_task_list_path,
                    record.status.as_str(),
                    serde_json::to_string(&record.division_requirements)?,
                    record.threshold,
                ],
            ).context("failed to insert agent team")?;
            Ok(())
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<AgentTeamRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT id, name, shared_task_list_path, status, division_requirements, threshold FROM agent_teams WHERE id = ?1",
                params![id],
                map_team,
            )
            .optional()
            .context("failed to load agent team")
        })
    }
}

fn map_team(row: &Row<'_>) -> rusqlite::Result<AgentTeamRecord> {
    Ok(AgentTeamRecord {
        id: row.get(0)?,
        name: row.get(1)?,
        shared_task_list_path: row.get(2)?,
        status: row
            .get::<_, String>(3)?
            .parse::<TeamLifecycleStatus>()
            .map_err(|error| sqlite_text_conversion_error(3, error))?,
        division_requirements: parse_json_value(row.get(4)?)
            .map_err(|error| sqlite_text_conversion_error(4, error))?,
        threshold: row.get(5)?,
    })
}
