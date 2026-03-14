use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    models::{SettingRecord, SettingScope},
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
};

pub struct SettingsRepository {
    db: Arc<Database>,
}

impl SettingsRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, setting: &SettingRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO settings (key, value, scope, scope_ref, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
                     ON CONFLICT(key, scope, scope_ref) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
                    params![
                        setting.key,
                        serde_json::to_string(&setting.value)?,
                        setting.scope.as_str(),
                        setting.scope_ref,
                        setting.updated_at,
                    ],
                )
                .context("failed to upsert setting")?;

            Ok(())
        })
    }

    pub fn get(
        &self,
        key: &str,
        scope: SettingScope,
        scope_ref: Option<&str>,
    ) -> Result<Option<SettingRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT key, value, scope, scope_ref, updated_at
                     FROM settings
                     WHERE key = ?1 AND scope = ?2 AND ((scope_ref IS NULL AND ?3 IS NULL) OR scope_ref = ?3)",
                    params![key, scope.as_str(), scope_ref],
                    map_setting,
                )
                .optional()
                .context("failed to load setting")
        })
    }
}

fn map_setting(row: &Row<'_>) -> rusqlite::Result<SettingRecord> {
    Ok(SettingRecord {
        key: row.get(0)?,
        value: parse_json_value(row.get(1)?)
            .map_err(|error| sqlite_text_conversion_error(1, error))?,
        scope: row
            .get::<_, String>(2)?
            .parse::<SettingScope>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        scope_ref: row.get(3)?,
        updated_at: row.get(4)?,
    })
}
