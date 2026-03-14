use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Row};

use crate::persistence::{database::Database, UsageAnalyticsRecord};

pub struct UsageAnalyticsRepository {
    db: Arc<Database>,
}

impl UsageAnalyticsRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &UsageAnalyticsRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO usage_analytics (id, session_id, provider, model, input_tokens, output_tokens, cost, timestamp)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        record.id,
                        record.session_id,
                        record.provider,
                        record.model,
                        record.input_tokens,
                        record.output_tokens,
                        record.cost,
                        record.timestamp,
                    ],
                )
                .context("failed to insert usage analytics")?;

            Ok(())
        })
    }

    pub fn list_by_session(&self, session_id: &str) -> Result<Vec<UsageAnalyticsRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, session_id, provider, model, input_tokens, output_tokens, cost, timestamp
                     FROM usage_analytics WHERE session_id = ?1 ORDER BY timestamp ASC",
                )
                .context("failed to prepare usage analytics query")?;

            let records = statement
                .query_map(params![session_id], map_usage)
                .context("failed to query usage analytics")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect usage analytics")?;

            Ok(records)
        })
    }
}

fn map_usage(row: &Row<'_>) -> rusqlite::Result<UsageAnalyticsRecord> {
    Ok(UsageAnalyticsRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        provider: row.get(2)?,
        model: row.get(3)?,
        input_tokens: row.get(4)?,
        output_tokens: row.get(5)?,
        cost: row.get(6)?,
        timestamp: row.get(7)?,
    })
}
