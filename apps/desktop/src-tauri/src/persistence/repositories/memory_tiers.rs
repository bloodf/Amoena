use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{database::Database, MemoryTierRecord};

pub struct MemoryTierRepository {
    db: Arc<Database>,
}

impl MemoryTierRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, record: &MemoryTierRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO memory_tiers (observation_id, l0_summary, l1_summary, l2_content, l0_tokens, l1_tokens, l2_tokens, generated_at, model)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
                 ON CONFLICT(observation_id) DO UPDATE SET
                   l0_summary = excluded.l0_summary,
                   l1_summary = excluded.l1_summary,
                   l2_content = excluded.l2_content,
                   l0_tokens = excluded.l0_tokens,
                   l1_tokens = excluded.l1_tokens,
                   l2_tokens = excluded.l2_tokens,
                   generated_at = excluded.generated_at,
                   model = excluded.model",
                params![
                    record.observation_id,
                    record.l0_summary,
                    record.l1_summary,
                    record.l2_content,
                    record.l0_tokens,
                    record.l1_tokens,
                    record.l2_tokens,
                    record.generated_at,
                    record.model,
                ],
            ).context("failed to upsert memory tiers")?;
            Ok(())
        })
    }

    pub fn get(&self, observation_id: &str) -> Result<Option<MemoryTierRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT observation_id, l0_summary, l1_summary, l2_content, l0_tokens, l1_tokens, l2_tokens, generated_at, model
                 FROM memory_tiers WHERE observation_id = ?1",
                params![observation_id],
                map_tier,
            )
            .optional()
            .context("failed to load memory tiers")
        })
    }
}

fn map_tier(row: &Row<'_>) -> rusqlite::Result<MemoryTierRecord> {
    Ok(MemoryTierRecord {
        observation_id: row.get(0)?,
        l0_summary: row.get(1)?,
        l1_summary: row.get(2)?,
        l2_content: row.get(3)?,
        l0_tokens: row.get(4)?,
        l1_tokens: row.get(5)?,
        l2_tokens: row.get(6)?,
        generated_at: row.get(7)?,
        model: row.get(8)?,
    })
}
