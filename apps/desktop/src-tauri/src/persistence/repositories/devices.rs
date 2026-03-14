use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    DeviceRecord, DeviceStatus, DeviceType,
};

#[derive(Clone)]
pub struct DeviceRepository {
    db: Arc<Database>,
}

impl DeviceRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &DeviceRecord) -> Result<()> {
        self.upsert(record)
    }

    pub fn update(&self, record: &DeviceRecord) -> Result<()> {
        self.upsert(record)
    }

    pub fn upsert(&self, record: &DeviceRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO device_registry (device_id, name, device_type, platform, paired_at, last_seen, refresh_token_hash, token_family_id, scopes, status, metadata, revoked_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
                     ON CONFLICT(device_id) DO UPDATE SET
                       name = excluded.name,
                       device_type = excluded.device_type,
                       platform = excluded.platform,
                       last_seen = excluded.last_seen,
                       refresh_token_hash = excluded.refresh_token_hash,
                       token_family_id = excluded.token_family_id,
                       scopes = excluded.scopes,
                       status = excluded.status,
                       metadata = excluded.metadata,
                       revoked_at = excluded.revoked_at",
                    params![
                        record.device_id,
                        record.name,
                        record.device_type.as_str(),
                        record.platform,
                        record.paired_at,
                        record.last_seen,
                        record.refresh_token_hash,
                        record.token_family_id,
                        serde_json::to_string(&record.scopes)?,
                        record.status.as_str(),
                        serde_json::to_string(&record.metadata)?,
                        record.revoked_at,
                    ],
                )
                .context("failed to upsert device")?;

            Ok(())
        })
    }

    pub fn list(&self) -> Result<Vec<DeviceRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT device_id, name, device_type, platform, paired_at, last_seen, refresh_token_hash, token_family_id, scopes, status, metadata, revoked_at
                     FROM device_registry ORDER BY paired_at DESC",
                )
                .context("failed to prepare device list query")?;
            let rows = statement
                .query_map([], map_device)
                .context("failed to query devices")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect device rows")?;
            Ok(rows)
        })
    }

    pub fn get(&self, device_id: &str) -> Result<Option<DeviceRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT device_id, name, device_type, platform, paired_at, last_seen, refresh_token_hash, token_family_id, scopes, status, metadata, revoked_at
                     FROM device_registry WHERE device_id = ?1",
                    params![device_id],
                    map_device,
                )
                .optional()
                .context("failed to get device")
        })
    }

    pub fn get_by_token_family(&self, token_family_id: &str) -> Result<Option<DeviceRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT device_id, name, device_type, platform, paired_at, last_seen, refresh_token_hash, token_family_id, scopes, status, metadata, revoked_at
                     FROM device_registry WHERE token_family_id = ?1",
                    params![token_family_id],
                    map_device,
                )
                .optional()
                .context("failed to get device by token family")
        })
    }
}

fn map_device(row: &Row<'_>) -> rusqlite::Result<DeviceRecord> {
    Ok(DeviceRecord {
        device_id: row.get(0)?,
        name: row.get(1)?,
        device_type: row
            .get::<_, String>(2)?
            .parse::<DeviceType>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        platform: row.get(3)?,
        paired_at: row.get(4)?,
        last_seen: row.get(5)?,
        refresh_token_hash: row.get(6)?,
        token_family_id: row.get(7)?,
        scopes: serde_json::from_value(
            parse_json_value(row.get(8)?).map_err(|error| sqlite_text_conversion_error(8, error))?,
        )
        .map_err(|error| sqlite_text_conversion_error(8, error))?,
        status: row
            .get::<_, String>(9)?
            .parse::<DeviceStatus>()
            .map_err(|error| sqlite_text_conversion_error(9, error))?,
        metadata: parse_json_value(row.get(10)?)
            .map_err(|error| sqlite_text_conversion_error(10, error))?,
        revoked_at: row.get(11)?,
    })
}
