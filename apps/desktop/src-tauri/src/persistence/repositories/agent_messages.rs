use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    AgentMessageRecord, MailboxMessageType,
};

pub struct AgentMessageRepository {
    db: Arc<Database>,
}

impl AgentMessageRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &AgentMessageRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO agent_messages (id, team_id, from_agent_id, to_agent_id, content, message_type, collaboration_style, decision_weight, metadata, created_at, read_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                params![
                    record.id,
                    record.team_id,
                    record.from_agent_id,
                    record.to_agent_id,
                    record.content,
                    record.message_type.as_str(),
                    record.collaboration_style,
                    record.decision_weight,
                    serde_json::to_string(&record.metadata)?,
                    record.created_at,
                    record.read_at,
                ],
            ).context("failed to insert agent message")?;
            Ok(())
        })
    }

    pub fn list_for_team(&self, team_id: &str) -> Result<Vec<AgentMessageRecord>> {
        self.db.read(|connection| {
            let mut statement = connection.prepare(
                "SELECT id, team_id, from_agent_id, to_agent_id, content, message_type, collaboration_style, decision_weight, metadata, created_at, read_at
                 FROM agent_messages WHERE team_id = ?1 ORDER BY rowid ASC",
            ).context("failed to prepare agent message query")?;
            let rows = statement
                .query_map(params![team_id], map_message)
                .context("failed to query agent messages")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect agent messages")?;
            Ok(rows)
        })
    }
}

fn map_message(row: &Row<'_>) -> rusqlite::Result<AgentMessageRecord> {
    Ok(AgentMessageRecord {
        id: row.get(0)?,
        team_id: row.get(1)?,
        from_agent_id: row.get(2)?,
        to_agent_id: row.get(3)?,
        content: row.get(4)?,
        message_type: row
            .get::<_, String>(5)?
            .parse::<MailboxMessageType>()
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        collaboration_style: row.get(6)?,
        decision_weight: row.get(7)?,
        metadata: parse_json_value(row.get(8)?)
            .map_err(|error| sqlite_text_conversion_error(8, error))?,
        created_at: row.get(9)?,
        read_at: row.get(10)?,
    })
}
