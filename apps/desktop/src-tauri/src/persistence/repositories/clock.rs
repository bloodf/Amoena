use anyhow::{Context, Result};
use rusqlite::{types::Type, Error};
use std::io;
use time::{format_description::well_known::Rfc3339, OffsetDateTime};

pub fn utc_now() -> String {
    OffsetDateTime::now_utc()
        .format(&Rfc3339)
        .expect("Rfc3339 formatting should succeed")
}

pub fn parse_json_value(raw: String) -> Result<serde_json::Value> {
    serde_json::from_str(&raw).context("failed to deserialize JSON column")
}

pub fn sqlite_text_conversion_error(
    column_index: usize,
    error: impl std::fmt::Display,
) -> Error {
    Error::FromSqlConversionFailure(
        column_index,
        Type::Text,
        Box::new(io::Error::new(io::ErrorKind::InvalidData, error.to_string())),
    )
}
