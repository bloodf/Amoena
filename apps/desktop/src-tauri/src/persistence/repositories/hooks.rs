use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    HookHandlerType, HookRecord,
};

pub struct HookRepository {
    db: Arc<Database>,
}

impl HookRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, hook: &HookRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO hooks (id, event_name, handler_type, handler_config, matcher_regex, enabled, priority, timeout_ms)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
                 ON CONFLICT(id) DO UPDATE SET
                   event_name = excluded.event_name,
                   handler_type = excluded.handler_type,
                   handler_config = excluded.handler_config,
                   matcher_regex = excluded.matcher_regex,
                   enabled = excluded.enabled,
                   priority = excluded.priority,
                   timeout_ms = excluded.timeout_ms",
                params![
                    hook.id,
                    hook.event_name,
                    hook.handler_type.as_str(),
                    serde_json::to_string(&hook.handler_config)?,
                    hook.matcher_regex,
                    if hook.enabled { 1 } else { 0 },
                    hook.priority,
                    hook.timeout_ms,
                ],
            )
            .context("failed to upsert hook")?;
            Ok(())
        })
    }

    pub fn list_by_event(&self, event_name: &str) -> Result<Vec<HookRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, event_name, handler_type, handler_config, matcher_regex, enabled, priority, timeout_ms
                     FROM hooks WHERE event_name = ?1 ORDER BY priority ASC, rowid ASC",
                )
                .context("failed to prepare hooks query")?;
            let rows = statement
                .query_map(params![event_name], map_hook)
                .context("failed to query hooks")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect hooks")?;
            Ok(rows)
        })
    }

    pub fn list(&self) -> Result<Vec<HookRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, event_name, handler_type, handler_config, matcher_regex, enabled, priority, timeout_ms
                     FROM hooks ORDER BY priority ASC, rowid ASC",
                )
                .context("failed to prepare hooks list query")?;
            let rows = statement
                .query_map([], map_hook)
                .context("failed to query hooks")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect hooks")?;
            Ok(rows)
        })
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute("DELETE FROM hooks WHERE id = ?1", params![id])
                .context("failed to delete hook")?;
            Ok(())
        })
    }
}

fn map_hook(row: &Row<'_>) -> rusqlite::Result<HookRecord> {
    Ok(HookRecord {
        id: row.get(0)?,
        event_name: row.get(1)?,
        handler_type: row
            .get::<_, String>(2)?
            .parse::<HookHandlerType>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        handler_config: parse_json_value(row.get(3)?)
            .map_err(|error| sqlite_text_conversion_error(3, error))?,
        matcher_regex: row.get(4)?,
        enabled: row.get::<_, i64>(5)? != 0,
        priority: row.get(6)?,
        timeout_ms: row.get(7)?,
    })
}
