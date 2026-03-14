use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    PluginEcosystem, PluginHealthStatus, PluginRecord,
};

pub struct PluginRepository {
    db: Arc<Database>,
}

impl PluginRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, record: &PluginRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO plugins (id, name, ecosystem, version, description, source_path, enabled, priority, capabilities, agent_profiles, health_status, error_count, last_error, last_event_at, latency_ms_avg, division_affinity, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)
                 ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   ecosystem = excluded.ecosystem,
                   version = excluded.version,
                   description = excluded.description,
                   source_path = excluded.source_path,
                   enabled = excluded.enabled,
                   priority = excluded.priority,
                   capabilities = excluded.capabilities,
                   agent_profiles = excluded.agent_profiles,
                   health_status = excluded.health_status,
                   error_count = excluded.error_count,
                   last_error = excluded.last_error,
                   last_event_at = excluded.last_event_at,
                   latency_ms_avg = excluded.latency_ms_avg,
                   division_affinity = excluded.division_affinity,
                   updated_at = excluded.updated_at",
                params![
                    record.id,
                    record.name,
                    record.ecosystem.as_str(),
                    record.version,
                    record.description,
                    record.source_path,
                    if record.enabled { 1 } else { 0 },
                    record.priority,
                    serde_json::to_string(&record.capabilities)?,
                    serde_json::to_string(&record.agent_profiles)?,
                    record.health_status.as_str(),
                    record.error_count,
                    record.last_error,
                    record.last_event_at,
                    record.latency_ms_avg,
                    serde_json::to_string(&record.division_affinity)?,
                    record.created_at,
                    record.updated_at,
                ],
            )
            .context("failed to upsert plugin")?;
            Ok(())
        })
    }

    pub fn list(&self) -> Result<Vec<PluginRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, name, ecosystem, version, description, source_path, enabled, priority, capabilities, agent_profiles, health_status, error_count, last_error, last_event_at, latency_ms_avg, division_affinity, created_at, updated_at
                     FROM plugins ORDER BY name ASC",
                )
                .context("failed to prepare plugin query")?;
            let rows = statement
                .query_map([], map_plugin)
                .context("failed to query plugins")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect plugin rows")?;
            Ok(rows)
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<PluginRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, name, ecosystem, version, description, source_path, enabled, priority, capabilities, agent_profiles, health_status, error_count, last_error, last_event_at, latency_ms_avg, division_affinity, created_at, updated_at
                     FROM plugins WHERE id = ?1",
                    params![id],
                    map_plugin,
                )
                .optional()
                .context("failed to get plugin")
        })
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute("DELETE FROM plugins WHERE id = ?1", params![id])
                .context("failed to delete plugin")?;
            Ok(())
        })
    }
}

fn map_plugin(row: &Row<'_>) -> rusqlite::Result<PluginRecord> {
    Ok(PluginRecord {
        id: row.get(0)?,
        name: row.get(1)?,
        ecosystem: row
            .get::<_, String>(2)?
            .parse::<PluginEcosystem>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        version: row.get(3)?,
        description: row.get(4)?,
        source_path: row.get(5)?,
        enabled: row.get::<_, i64>(6)? != 0,
        priority: row.get(7)?,
        capabilities: serde_json::from_value(
            parse_json_value(row.get(8)?).map_err(|error| sqlite_text_conversion_error(8, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(8, error))?,
        agent_profiles: serde_json::from_value(
            parse_json_value(row.get(9)?).map_err(|error| sqlite_text_conversion_error(9, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(9, error))?,
        health_status: row
            .get::<_, String>(10)?
            .parse::<PluginHealthStatus>()
            .map_err(|error| sqlite_text_conversion_error(10, error))?,
        error_count: row.get(11)?,
        last_error: row.get(12)?,
        last_event_at: row.get(13)?,
        latency_ms_avg: row.get(14)?,
        division_affinity: serde_json::from_value(
            parse_json_value(row.get(15)?).map_err(|error| sqlite_text_conversion_error(15, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(15, error))?,
        created_at: row.get(16)?,
        updated_at: row.get(17)?,
    })
}
