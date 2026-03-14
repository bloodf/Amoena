use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    CloneType, WorkspaceRecord, WorkspaceStatus,
};

pub struct WorkspaceRepository {
    db: Arc<Database>,
}

impl WorkspaceRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &WorkspaceRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO workspaces (id, project_id, agent_id, persona_name, clone_path, clone_type, status, created_at, run_summary)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    record.id,
                    record.project_id,
                    record.agent_id,
                    record.persona_name,
                    record.clone_path,
                    record.clone_type.as_str(),
                    record.status.as_str(),
                    record.created_at,
                    serde_json::to_string(&record.run_summary)?,
                ],
            ).context("failed to insert workspace")?;
            Ok(())
        })
    }

    pub fn update(&self, record: &WorkspaceRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "UPDATE workspaces
                 SET project_id = ?2, agent_id = ?3, persona_name = ?4, clone_path = ?5, clone_type = ?6, status = ?7, created_at = ?8, run_summary = ?9
                 WHERE id = ?1",
                params![
                    record.id,
                    record.project_id,
                    record.agent_id,
                    record.persona_name,
                    record.clone_path,
                    record.clone_type.as_str(),
                    record.status.as_str(),
                    record.created_at,
                    serde_json::to_string(&record.run_summary)?,
                ],
            ).context("failed to update workspace")?;
            Ok(())
        })
    }

    pub fn list(&self) -> Result<Vec<WorkspaceRecord>> {
        self.db.read(|connection| {
            let mut statement = connection.prepare(
                "SELECT id, project_id, agent_id, persona_name, clone_path, clone_type, status, created_at, run_summary
                 FROM workspaces ORDER BY created_at DESC",
            ).context("failed to prepare workspace query")?;
            let rows = statement
                .query_map([], map_workspace)
                .context("failed to query workspaces")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect workspaces")?;
            Ok(rows)
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<WorkspaceRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT id, project_id, agent_id, persona_name, clone_path, clone_type, status, created_at, run_summary
                 FROM workspaces WHERE id = ?1",
                params![id],
                map_workspace,
            ).optional().context("failed to load workspace")
        })
    }
}

fn map_workspace(row: &Row<'_>) -> rusqlite::Result<WorkspaceRecord> {
    Ok(WorkspaceRecord {
        id: row.get(0)?,
        project_id: row.get(1)?,
        agent_id: row.get(2)?,
        persona_name: row.get(3)?,
        clone_path: row.get(4)?,
        clone_type: row
            .get::<_, String>(5)?
            .parse::<CloneType>()
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        status: row
            .get::<_, String>(6)?
            .parse::<WorkspaceStatus>()
            .map_err(|error| sqlite_text_conversion_error(6, error))?,
        created_at: row.get(7)?,
        run_summary: parse_json_value(row.get(8)?)
            .map_err(|error| sqlite_text_conversion_error(8, error))?,
    })
}
