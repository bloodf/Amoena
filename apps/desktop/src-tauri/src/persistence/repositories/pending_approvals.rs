use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    PendingApprovalRecord, PendingApprovalStatus,
};

pub struct PendingApprovalRepository {
    db: Arc<Database>,
}

impl PendingApprovalRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &PendingApprovalRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO pending_approvals (id, session_id, tool_name, input, status, created_at, resolved_at, decision_reason)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        record.id,
                        record.session_id,
                        record.tool_name,
                        serde_json::to_string(&record.input)?,
                        record.status.as_str(),
                        record.created_at,
                        record.resolved_at,
                        record.decision_reason,
                    ],
                )
                .context("failed to insert pending approval")?;
            Ok(())
        })
    }

    pub fn update_resolution(
        &self,
        request_id: &str,
        status: PendingApprovalStatus,
        reason: Option<String>,
        resolved_at: String,
    ) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "UPDATE pending_approvals SET status = ?2, resolved_at = ?3, decision_reason = ?4 WHERE id = ?1",
                    params![request_id, status.as_str(), resolved_at, reason],
                )
                .context("failed to update pending approval")?;
            Ok(())
        })
    }

    pub fn get(&self, request_id: &str) -> Result<Option<PendingApprovalRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, session_id, tool_name, input, status, created_at, resolved_at, decision_reason
                     FROM pending_approvals WHERE id = ?1",
                    params![request_id],
                    map_pending_approval,
                )
                .optional()
                .context("failed to load pending approval")
        })
    }
}

fn map_pending_approval(row: &Row<'_>) -> rusqlite::Result<PendingApprovalRecord> {
    Ok(PendingApprovalRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        tool_name: row.get(2)?,
        input: parse_json_value(row.get(3)?).map_err(|error| sqlite_text_conversion_error(3, error))?,
        status: row
            .get::<_, String>(4)?
            .parse::<PendingApprovalStatus>()
            .map_err(|error| sqlite_text_conversion_error(4, error))?,
        created_at: row.get(5)?,
        resolved_at: row.get(6)?,
        decision_reason: row.get(7)?,
    })
}
