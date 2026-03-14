use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{database::Database, ObservationEmbeddingRecord};

pub struct ObservationEmbeddingRepository {
    db: Arc<Database>,
}

impl ObservationEmbeddingRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, record: &ObservationEmbeddingRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO observation_embeddings (observation_id, embedding, model)
                     VALUES (?1, ?2, ?3)
                     ON CONFLICT(observation_id) DO UPDATE SET
                       embedding = excluded.embedding,
                       model = excluded.model",
                    params![
                        record.observation_id,
                        serde_json::to_string(&record.vector)?,
                        record.model,
                    ],
                )
                .context("failed to upsert observation embedding")?;
            Ok(())
        })
    }

    pub fn get(&self, observation_id: &str) -> Result<Option<ObservationEmbeddingRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT observation_id, embedding, model FROM observation_embeddings WHERE observation_id = ?1",
                    params![observation_id],
                    map_embedding,
                )
                .optional()
                .context("failed to load observation embedding")
        })
    }
}

fn map_embedding(row: &Row<'_>) -> rusqlite::Result<ObservationEmbeddingRecord> {
    Ok(ObservationEmbeddingRecord {
        observation_id: row.get(0)?,
        vector: serde_json::from_str::<Vec<f32>>(&row.get::<_, String>(1)?)
            .map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    1,
                    rusqlite::types::Type::Text,
                    Box::new(std::io::Error::new(
                        std::io::ErrorKind::InvalidData,
                        error.to_string(),
                    )),
                )
            })?,
        model: row.get(2)?,
    })
}
