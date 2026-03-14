use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Connection, OptionalExtension, Row, Transaction};

use crate::persistence::{
    database::Database,
    models::{SessionMode, SessionRecord, SessionStatus, SessionType, TuiType},
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
};

pub struct SessionRepository {
    db: Arc<Database>,
}

impl SessionRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, session: &SessionRecord) -> Result<()> {
        self.db.write(|connection| insert_session_connection(connection, session))
    }

    pub fn get(&self, id: &str) -> Result<Option<SessionRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, parent_session_id, session_type, session_mode, tui_type, provider_id, model_id, working_dir, compaction_count, context_token_count, workspace_id, created_at, updated_at, status, metadata FROM sessions WHERE id = ?1",
                    params![id],
                    map_session,
                )
                .optional()
                .context("failed to load session")
        })
    }

    pub fn list(&self) -> Result<Vec<SessionRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, parent_session_id, session_type, session_mode, tui_type, provider_id, model_id, working_dir, compaction_count, context_token_count, workspace_id, created_at, updated_at, status, metadata FROM sessions ORDER BY updated_at DESC",
                )
                .context("failed to prepare session list query")?;

            let sessions = statement
                .query_map([], map_session)
                .context("failed to query sessions")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect session rows")?;

            Ok(sessions)
        })
    }

    pub fn update(&self, session: &SessionRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "UPDATE sessions
                     SET parent_session_id = ?2, session_type = ?3, session_mode = ?4, tui_type = ?5,
                         provider_id = ?6, model_id = ?7, working_dir = ?8, compaction_count = ?9,
                         context_token_count = ?10, workspace_id = ?11, created_at = ?12,
                         updated_at = ?13, status = ?14, metadata = ?15
                     WHERE id = ?1",
                    params![
                        session.id,
                        session.parent_session_id,
                        session.session_type.as_str(),
                        session.session_mode.as_str(),
                        session.tui_type.as_str(),
                        session.provider_id,
                        session.model_id,
                        session.working_dir,
                        session.compaction_count,
                        session.context_token_count,
                        session.workspace_id,
                        session.created_at,
                        session.updated_at,
                        session.status.as_str(),
                        serde_json::to_string(&session.metadata)?,
                    ],
                )
                .context("failed to update session")?;
            Ok(())
        })
    }

    pub fn list_children(&self, parent_id: &str) -> Result<Vec<SessionRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, parent_session_id, session_type, session_mode, tui_type, provider_id, model_id, working_dir, compaction_count, context_token_count, workspace_id, created_at, updated_at, status, metadata FROM sessions WHERE parent_session_id = ?1 ORDER BY created_at ASC",
                )
                .context("failed to prepare children query")?;
            let sessions = statement
                .query_map(params![parent_id], map_session)
                .context("failed to query child sessions")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect child session rows")?;
            Ok(sessions)
        })
    }

    pub fn get_ancestry(&self, session_id: &str) -> Result<Vec<SessionRecord>> {
        let mut ancestry = Vec::new();
        let mut current_id = Some(session_id.to_string());
        while let Some(id) = current_id {
            if let Some(session) = self.get(&id)? {
                current_id = session.parent_session_id.clone();
                ancestry.push(session);
            } else {
                break;
            }
        }
        ancestry.reverse();
        Ok(ancestry)
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute("DELETE FROM sessions WHERE id = ?1", params![id])
                .context("failed to delete session")?;
            Ok(())
        })
    }

    pub fn insert_tx(transaction: &Transaction<'_>, session: &SessionRecord) -> Result<()> {
        insert_session_transaction(transaction, session)
    }
}

fn insert_session_connection(connection: &Connection, session: &SessionRecord) -> Result<()> {
    connection
        .execute(
            "INSERT INTO sessions (id, parent_session_id, session_type, session_mode, tui_type, provider_id, model_id, working_dir, compaction_count, context_token_count, workspace_id, created_at, updated_at, status, metadata) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                session.id,
                session.parent_session_id,
                session.session_type.as_str(),
                session.session_mode.as_str(),
                session.tui_type.as_str(),
                session.provider_id,
                session.model_id,
                session.working_dir,
                session.compaction_count,
                session.context_token_count,
                session.workspace_id,
                session.created_at,
                session.updated_at,
                session.status.as_str(),
                serde_json::to_string(&session.metadata)?,
            ],
        )
        .context("failed to insert session")?;

    Ok(())
}

fn insert_session_transaction(transaction: &Transaction<'_>, session: &SessionRecord) -> Result<()> {
    transaction
        .execute(
            "INSERT INTO sessions (id, parent_session_id, session_type, session_mode, tui_type, provider_id, model_id, working_dir, compaction_count, context_token_count, workspace_id, created_at, updated_at, status, metadata) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                session.id,
                session.parent_session_id,
                session.session_type.as_str(),
                session.session_mode.as_str(),
                session.tui_type.as_str(),
                session.provider_id,
                session.model_id,
                session.working_dir,
                session.compaction_count,
                session.context_token_count,
                session.workspace_id,
                session.created_at,
                session.updated_at,
                session.status.as_str(),
                serde_json::to_string(&session.metadata)?,
            ],
        )
        .context("failed to insert session in transaction")?;

    Ok(())
}

fn map_session(row: &Row<'_>) -> rusqlite::Result<SessionRecord> {
    Ok(SessionRecord {
        id: row.get(0)?,
        parent_session_id: row.get(1)?,
        session_type: row
            .get::<_, String>(2)?
            .parse::<SessionType>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        session_mode: row
            .get::<_, String>(3)?
            .parse::<SessionMode>()
            .map_err(|error| sqlite_text_conversion_error(3, error))?,
        tui_type: row
            .get::<_, String>(4)?
            .parse::<TuiType>()
            .map_err(|error| sqlite_text_conversion_error(4, error))?,
        provider_id: row.get(5)?,
        model_id: row.get(6)?,
        working_dir: row.get(7)?,
        compaction_count: row.get(8)?,
        context_token_count: row.get(9)?,
        workspace_id: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
        status: row
            .get::<_, String>(13)?
            .parse::<SessionStatus>()
            .map_err(|error| sqlite_text_conversion_error(13, error))?,
        metadata: parse_json_value(row.get(14)?)
            .map_err(|error| sqlite_text_conversion_error(14, error))?,
    })
}
