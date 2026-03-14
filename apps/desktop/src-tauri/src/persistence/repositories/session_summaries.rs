use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    SessionSummaryRecord,
};

pub struct SessionSummaryRepository {
    db: Arc<Database>,
}

impl SessionSummaryRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, record: &SessionSummaryRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO session_summaries (session_id, request, investigated, learned, completed, next_steps, files_read, files_edited)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
                 ON CONFLICT(session_id) DO UPDATE SET
                   request = excluded.request,
                   investigated = excluded.investigated,
                   learned = excluded.learned,
                   completed = excluded.completed,
                   next_steps = excluded.next_steps,
                   files_read = excluded.files_read,
                   files_edited = excluded.files_edited",
                params![
                    record.session_id,
                    record.request,
                    serde_json::to_string(&record.investigated)?,
                    serde_json::to_string(&record.learned)?,
                    serde_json::to_string(&record.completed)?,
                    serde_json::to_string(&record.next_steps)?,
                    serde_json::to_string(&record.files_read)?,
                    serde_json::to_string(&record.files_edited)?,
                ],
            ).context("failed to upsert session summary")?;
            Ok(())
        })
    }

    pub fn get(&self, session_id: &str) -> Result<Option<SessionSummaryRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT session_id, request, investigated, learned, completed, next_steps, files_read, files_edited
                 FROM session_summaries WHERE session_id = ?1",
                params![session_id],
                map_summary,
            )
            .optional()
            .context("failed to load session summary")
        })
    }
}

fn map_summary(row: &Row<'_>) -> rusqlite::Result<SessionSummaryRecord> {
    Ok(SessionSummaryRecord {
        session_id: row.get(0)?,
        request: row.get(1)?,
        investigated: serde_json::from_value(
            parse_json_value(row.get(2)?).map_err(|error| sqlite_text_conversion_error(2, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(2, error))?,
        learned: serde_json::from_value(
            parse_json_value(row.get(3)?).map_err(|error| sqlite_text_conversion_error(3, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(3, error))?,
        completed: serde_json::from_value(
            parse_json_value(row.get(4)?).map_err(|error| sqlite_text_conversion_error(4, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(4, error))?,
        next_steps: serde_json::from_value(
            parse_json_value(row.get(5)?).map_err(|error| sqlite_text_conversion_error(5, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(5, error))?,
        files_read: serde_json::from_value(
            parse_json_value(row.get(6)?).map_err(|error| sqlite_text_conversion_error(6, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(6, error))?,
        files_edited: serde_json::from_value(
            parse_json_value(row.get(7)?).map_err(|error| sqlite_text_conversion_error(7, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(7, error))?,
    })
}
