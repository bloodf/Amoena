use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Connection, Row, Transaction};

use crate::persistence::{
    database::Database,
    models::{MessageRecord, MessageRole},
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
};

pub struct MessageRepository {
    db: Arc<Database>,
}

impl MessageRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, message: &MessageRecord) -> Result<()> {
        self.db.write(|connection| insert_message_connection(connection, message))
    }

    pub fn list_by_session(&self, session_id: &str) -> Result<Vec<MessageRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, session_id, role, content, attachments, tool_calls, tokens, cost, created_at FROM messages WHERE session_id = ?1 ORDER BY created_at ASC",
                )
                .context("failed to prepare session messages query")?;

            let rows = statement
                .query_map(params![session_id], map_message)
                .context("failed to query session messages")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect session messages")?;

            Ok(rows)
        })
    }

    pub fn insert_tx(transaction: &Transaction<'_>, message: &MessageRecord) -> Result<()> {
        insert_message_transaction(transaction, message)
    }
}

fn insert_message_connection(connection: &Connection, message: &MessageRecord) -> Result<()> {
    connection
        .execute(
            "INSERT INTO messages (id, session_id, role, content, attachments, tool_calls, tokens, cost, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                message.id,
                message.session_id,
                message.role.as_str(),
                message.content,
                serde_json::to_string(&message.attachments)?,
                serde_json::to_string(&message.tool_calls)?,
                message.tokens,
                message.cost,
                message.created_at,
            ],
        )
        .context("failed to insert message")?;

    Ok(())
}

fn insert_message_transaction(transaction: &Transaction<'_>, message: &MessageRecord) -> Result<()> {
    transaction
        .execute(
            "INSERT INTO messages (id, session_id, role, content, attachments, tool_calls, tokens, cost, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                message.id,
                message.session_id,
                message.role.as_str(),
                message.content,
                serde_json::to_string(&message.attachments)?,
                serde_json::to_string(&message.tool_calls)?,
                message.tokens,
                message.cost,
                message.created_at,
            ],
        )
        .context("failed to insert message in transaction")?;

    Ok(())
}

fn map_message(row: &Row<'_>) -> rusqlite::Result<MessageRecord> {
    Ok(MessageRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        role: row
            .get::<_, String>(2)?
            .parse::<MessageRole>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        content: row.get(3)?,
        attachments: parse_json_value(row.get(4)?)
            .map_err(|error| sqlite_text_conversion_error(4, error))?,
        tool_calls: parse_json_value(row.get(5)?)
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        tokens: row.get(6)?,
        cost: row.get(7)?,
        created_at: row.get(8)?,
    })
}
