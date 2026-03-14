use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::sqlite_text_conversion_error,
    MailboxFlagRecord, MailboxFlagStatus,
};

pub struct MailboxFlagRepository {
    db: Arc<Database>,
}

impl MailboxFlagRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &MailboxFlagRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO mailbox_flags (id, message_id, team_id, session_id, flag_type, status, created_at, resolved_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    record.id,
                    record.message_id,
                    record.team_id,
                    record.session_id,
                    record.flag_type,
                    record.status.as_str(),
                    record.created_at,
                    record.resolved_at,
                ],
            ).context("failed to insert mailbox flag")?;
            Ok(())
        })
    }

    pub fn list_open_for_team(&self, team_id: &str) -> Result<Vec<MailboxFlagRecord>> {
        self.db.read(|connection| {
            let mut statement = connection.prepare(
                "SELECT id, message_id, team_id, session_id, flag_type, status, created_at, resolved_at
                 FROM mailbox_flags WHERE team_id = ?1 AND status = 'open' ORDER BY rowid ASC",
            ).context("failed to prepare mailbox flag query")?;
            let rows = statement
                .query_map(params![team_id], map_flag)
                .context("failed to query mailbox flags")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect mailbox flags")?;
            Ok(rows)
        })
    }
}

fn map_flag(row: &Row<'_>) -> rusqlite::Result<MailboxFlagRecord> {
    Ok(MailboxFlagRecord {
        id: row.get(0)?,
        message_id: row.get(1)?,
        team_id: row.get(2)?,
        session_id: row.get(3)?,
        flag_type: row.get(4)?,
        status: row
            .get::<_, String>(5)?
            .parse::<MailboxFlagStatus>()
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        created_at: row.get(6)?,
        resolved_at: row.get(7)?,
    })
}
