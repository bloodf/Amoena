use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    models::{QueueMessageRecord, QueueMessageStatus, QueueType},
    repositories::clock::{sqlite_text_conversion_error, utc_now},
};

pub struct MessageQueueRepository {
    db: Arc<Database>,
}

impl MessageQueueRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &QueueMessageRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO message_queue (id, session_id, content, queue_type, status, order_index, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    record.id,
                    record.session_id,
                    record.content,
                    record.queue_type.as_str(),
                    record.status.as_str(),
                    record.order_index,
                    record.created_at,
                    record.updated_at,
                ],
            )
            .context("failed to insert queue message")?;
            Ok(())
        })
    }

    pub fn list_by_session(&self, session_id: &str) -> Result<Vec<QueueMessageRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, session_id, content, queue_type, status, order_index, created_at, updated_at
                     FROM message_queue WHERE session_id = ?1 ORDER BY order_index ASC",
                )
                .context("failed to prepare queue list query")?;
            let records = statement
                .query_map(params![session_id], map_queue_message)
                .context("failed to query queue messages")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect queue messages")?;
            Ok(records)
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<QueueMessageRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, session_id, content, queue_type, status, order_index, created_at, updated_at
                     FROM message_queue WHERE id = ?1",
                    params![id],
                    map_queue_message,
                )
                .optional()
                .context("failed to load queue message")
        })
    }

    pub fn update(&self, record: &QueueMessageRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "UPDATE message_queue SET content = ?2, status = ?3, order_index = ?4, updated_at = ?5 WHERE id = ?1",
                params![
                    record.id,
                    record.content,
                    record.status.as_str(),
                    record.order_index,
                    record.updated_at,
                ],
            )
            .context("failed to update queue message")?;
            Ok(())
        })
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute("DELETE FROM message_queue WHERE id = ?1", params![id])
                .context("failed to delete queue message")?;
            Ok(())
        })
    }

    pub fn next_order_index(&self, session_id: &str) -> Result<i64> {
        self.db.read(|connection| {
            let max: Option<i64> = connection
                .query_row(
                    "SELECT MAX(order_index) FROM message_queue WHERE session_id = ?1",
                    params![session_id],
                    |row| row.get(0),
                )
                .optional()
                .context("failed to query max order index")?
                .flatten();
            Ok(max.unwrap_or(-1) + 1)
        })
    }

    pub fn reorder(&self, session_id: &str, ordered_ids: &[String]) -> Result<()> {
        self.db.write(|connection| {
            for (index, id) in ordered_ids.iter().enumerate() {
                connection.execute(
                    "UPDATE message_queue SET order_index = ?2, updated_at = ?3 WHERE id = ?1 AND session_id = ?4",
                    params![id, index as i64, utc_now(), session_id],
                )
                .context("failed to reorder queue message")?;
            }
            Ok(())
        })
    }

    pub fn next_pending(&self, session_id: &str) -> Result<Option<QueueMessageRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, session_id, content, queue_type, status, order_index, created_at, updated_at
                     FROM message_queue WHERE session_id = ?1 AND status = 'pending' ORDER BY order_index ASC LIMIT 1",
                    params![session_id],
                    map_queue_message,
                )
                .optional()
                .context("failed to load next pending queue message")
        })
    }
}

fn map_queue_message(row: &Row<'_>) -> rusqlite::Result<QueueMessageRecord> {
    Ok(QueueMessageRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        content: row.get(2)?,
        queue_type: row
            .get::<_, String>(3)?
            .parse::<QueueType>()
            .map_err(|error| sqlite_text_conversion_error(3, error))?,
        status: row
            .get::<_, String>(4)?
            .parse::<QueueMessageStatus>()
            .map_err(|error| sqlite_text_conversion_error(4, error))?,
        order_index: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}
