use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    ObservationCategory, ObservationRecord,
};

pub struct ObservationRepository {
    db: Arc<Database>,
}

impl ObservationRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &ObservationRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO observations (id, session_id, uri, parent_uri, type, category, title, subtitle, facts, narrative, concepts, files_read, files_modified, content_hash, prompt_number, discovery_tokens, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
                params![
                    record.id,
                    record.session_id,
                    record.uri,
                    record.parent_uri,
                    record.observation_type,
                    record.category.as_str(),
                    record.title,
                    record.subtitle,
                    serde_json::to_string(&record.facts)?,
                    record.narrative,
                    serde_json::to_string(&record.concepts)?,
                    serde_json::to_string(&record.files_read)?,
                    serde_json::to_string(&record.files_modified)?,
                    record.content_hash,
                    record.prompt_number,
                    record.discovery_tokens,
                    record.created_at,
                ],
            ).context("failed to insert observation")?;
            Ok(())
        })
    }

    pub fn latest_by_hash(&self, session_id: &str, content_hash: &str) -> Result<Option<ObservationRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT id, session_id, uri, parent_uri, type, category, title, subtitle, facts, narrative, concepts, files_read, files_modified, content_hash, prompt_number, discovery_tokens, created_at
                 FROM observations WHERE session_id = ?1 AND content_hash = ?2 ORDER BY rowid DESC LIMIT 1",
                params![session_id, content_hash],
                map_observation,
            )
            .optional()
            .context("failed to lookup observation by hash")
        })
    }

    pub fn list_recent_for_session(&self, session_id: &str, limit: i64) -> Result<Vec<ObservationRecord>> {
        self.db.read(|connection| {
            let mut statement = connection.prepare(
                "SELECT id, session_id, uri, parent_uri, type, category, title, subtitle, facts, narrative, concepts, files_read, files_modified, content_hash, prompt_number, discovery_tokens, created_at
                 FROM observations WHERE session_id = ?1 ORDER BY rowid DESC LIMIT ?2",
            ).context("failed to prepare observation query")?;
            let rows = statement
                .query_map(params![session_id, limit], map_observation)
                .context("failed to query observations")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect observations")?;
            Ok(rows)
        })
    }

    pub fn search(
        &self,
        query: &str,
        category: Option<&str>,
    ) -> Result<Vec<ObservationRecord>> {
        self.db.read(|connection| {
            if let Some(category) = category {
                let mut statement = connection.prepare(
                    "SELECT o.id, o.session_id, o.uri, o.parent_uri, o.type, o.category, o.title, o.subtitle, o.facts, o.narrative, o.concepts, o.files_read, o.files_modified, o.content_hash, o.prompt_number, o.discovery_tokens, o.created_at
                     FROM observations_fts fts JOIN observations o ON o.rowid = fts.rowid
                     WHERE observations_fts MATCH ?1 AND o.category = ?2
                     ORDER BY bm25(observations_fts)",
                ).context("failed to prepare categorized observation search")?;
                let rows = statement
                    .query_map(rusqlite::params![query, category], map_observation)
                    .context("failed to search categorized observations")?
                    .collect::<rusqlite::Result<Vec<_>>>()
                    .context("failed to collect categorized observations")?;
                Ok(rows)
            } else {
                let mut statement = connection.prepare(
                    "SELECT o.id, o.session_id, o.uri, o.parent_uri, o.type, o.category, o.title, o.subtitle, o.facts, o.narrative, o.concepts, o.files_read, o.files_modified, o.content_hash, o.prompt_number, o.discovery_tokens, o.created_at
                     FROM observations_fts fts JOIN observations o ON o.rowid = fts.rowid
                     WHERE observations_fts MATCH ?1
                     ORDER BY bm25(observations_fts)",
                ).context("failed to prepare observation search")?;
                let rows = statement
                    .query_map(rusqlite::params![query], map_observation)
                    .context("failed to search observations")?
                    .collect::<rusqlite::Result<Vec<_>>>()
                    .context("failed to collect searched observations")?;
                Ok(rows)
            }
        })
    }
}

fn map_observation(row: &Row<'_>) -> rusqlite::Result<ObservationRecord> {
    Ok(ObservationRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        uri: row.get(2)?,
        parent_uri: row.get(3)?,
        observation_type: row.get(4)?,
        category: row
            .get::<_, String>(5)?
            .parse::<ObservationCategory>()
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        title: row.get(6)?,
        subtitle: row.get(7)?,
        facts: serde_json::from_value(
            parse_json_value(row.get(8)?).map_err(|error| sqlite_text_conversion_error(8, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(8, error))?,
        narrative: row.get(9)?,
        concepts: serde_json::from_value(
            parse_json_value(row.get(10)?).map_err(|error| sqlite_text_conversion_error(10, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(10, error))?,
        files_read: serde_json::from_value(
            parse_json_value(row.get(11)?).map_err(|error| sqlite_text_conversion_error(11, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(11, error))?,
        files_modified: serde_json::from_value(
            parse_json_value(row.get(12)?).map_err(|error| sqlite_text_conversion_error(12, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(12, error))?,
        content_hash: row.get(13)?,
        prompt_number: row.get(14)?,
        discovery_tokens: row.get(15)?,
        created_at: row.get(16)?,
    })
}
