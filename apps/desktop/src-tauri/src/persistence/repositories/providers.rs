use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    models::{
        AuthStatus, CredentialType, ProviderAuthType, ProviderCredentialRecord, ProviderModelRecord,
        ProviderRecord, ProviderType,
    },
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
};

pub struct ProviderRepository {
    db: Arc<Database>,
}

impl ProviderRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert_provider(&self, provider: &ProviderRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO providers (id, name, npm_package, provider_type, base_url, auth_type, auth_status, model_count, last_refreshed_at, created_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
                     ON CONFLICT(id) DO UPDATE SET
                       name = excluded.name,
                       npm_package = excluded.npm_package,
                       provider_type = excluded.provider_type,
                       base_url = excluded.base_url,
                       auth_type = excluded.auth_type,
                       auth_status = excluded.auth_status,
                       model_count = excluded.model_count,
                       last_refreshed_at = excluded.last_refreshed_at",
                    params![
                        provider.id,
                        provider.name,
                        provider.npm_package,
                        provider.provider_type.as_str(),
                        provider.base_url,
                        provider.auth_type.as_str(),
                        provider.auth_status.as_str(),
                        provider.model_count,
                        provider.last_refreshed_at,
                        provider.created_at,
                    ],
                )
                .context("failed to upsert provider")?;

            Ok(())
        })
    }

    pub fn list_providers(&self) -> Result<Vec<ProviderRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, name, npm_package, provider_type, base_url, auth_type, auth_status, model_count, last_refreshed_at, created_at FROM providers ORDER BY name ASC",
                )
                .context("failed to prepare provider query")?;

            let providers = statement
                .query_map([], map_provider)
                .context("failed to query providers")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect provider rows")?;

            Ok(providers)
        })
    }

    pub fn get_provider(&self, provider_id: &str) -> Result<Option<ProviderRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, name, npm_package, provider_type, base_url, auth_type, auth_status, model_count, last_refreshed_at, created_at FROM providers WHERE id = ?1",
                    params![provider_id],
                    map_provider,
                )
                .optional()
                .context("failed to lookup provider")
        })
    }

    pub fn replace_models(&self, provider_id: &str, models: &[ProviderModelRecord]) -> Result<()> {
        self.db.transaction(|transaction| {
            transaction
                .execute(
                    "DELETE FROM provider_models WHERE provider_id = ?1",
                    params![provider_id],
                )
                .context("failed to clear provider models")?;

            for model in models {
                transaction
                    .execute(
                        "INSERT INTO provider_models (
                            provider_id, model_id, display_name, context_window, input_cost_per_million,
                            output_cost_per_million, supports_vision, supports_tools, supports_reasoning,
                            reasoning_modes, reasoning_effort_supported, reasoning_effort_values,
                            reasoning_token_budget_supported, discovered_at, refreshed_at
                         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
                        params![
                            model.provider_id,
                            model.model_id,
                            model.display_name,
                            model.context_window,
                            model.input_cost_per_million,
                            model.output_cost_per_million,
                            if model.supports_vision { 1 } else { 0 },
                            if model.supports_tools { 1 } else { 0 },
                            if model.supports_reasoning { 1 } else { 0 },
                            serde_json::to_string(&model.reasoning_modes)?,
                            if model.reasoning_effort_supported { 1 } else { 0 },
                            serde_json::to_string(&model.reasoning_effort_values)?,
                            if model.reasoning_token_budget_supported { 1 } else { 0 },
                            model.discovered_at,
                            model.refreshed_at,
                        ],
                    )
                    .context("failed to insert provider model")?;
            }

            Ok(())
        })
    }

    pub fn list_models(&self, provider_id: &str) -> Result<Vec<ProviderModelRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT provider_id, model_id, display_name, context_window, input_cost_per_million, output_cost_per_million,
                            supports_vision, supports_tools, supports_reasoning, reasoning_modes, reasoning_effort_supported,
                            reasoning_effort_values, reasoning_token_budget_supported, discovered_at, refreshed_at
                     FROM provider_models WHERE provider_id = ?1 ORDER BY model_id ASC",
                )
                .context("failed to prepare provider model query")?;

            let models = statement
                .query_map(params![provider_id], map_provider_model)
                .context("failed to query provider models")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect provider model rows")?;

            Ok(models)
        })
    }

    pub fn list_all_models(&self) -> Result<Vec<ProviderModelRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT provider_id, model_id, display_name, context_window, input_cost_per_million, output_cost_per_million,
                            supports_vision, supports_tools, supports_reasoning, reasoning_modes, reasoning_effort_supported,
                            reasoning_effort_values, reasoning_token_budget_supported, discovered_at, refreshed_at
                     FROM provider_models ORDER BY provider_id ASC, model_id ASC",
                )
                .context("failed to prepare all provider models query")?;

            let models = statement
                .query_map([], map_provider_model)
                .context("failed to query all provider models")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect all provider model rows")?;

            Ok(models)
        })
    }

    pub fn upsert_credential(&self, credential: &ProviderCredentialRecord) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute(
                    "INSERT INTO provider_credentials (id, provider_id, credential_type, keychain_ref, expires_at, refresh_token_ref, created_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                     ON CONFLICT(id) DO UPDATE SET
                       credential_type = excluded.credential_type,
                       keychain_ref = excluded.keychain_ref,
                       expires_at = excluded.expires_at,
                       refresh_token_ref = excluded.refresh_token_ref",
                    params![
                        credential.id,
                        credential.provider_id,
                        credential.credential_type.as_str(),
                        credential.keychain_ref,
                        credential.expires_at,
                        credential.refresh_token_ref,
                        credential.created_at,
                    ],
                )
                .context("failed to upsert provider credential")?;
            Ok(())
        })
    }

    pub fn latest_credential(&self, provider_id: &str) -> Result<Option<ProviderCredentialRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, provider_id, credential_type, keychain_ref, expires_at, refresh_token_ref, created_at
                     FROM provider_credentials
                     WHERE provider_id = ?1
                     ORDER BY created_at DESC
                     LIMIT 1",
                    params![provider_id],
                    map_provider_credential,
                )
                .optional()
                .context("failed to load provider credential")
        })
    }
}

fn map_provider(row: &Row<'_>) -> rusqlite::Result<ProviderRecord> {
    Ok(ProviderRecord {
        id: row.get(0)?,
        name: row.get(1)?,
        npm_package: row.get(2)?,
        provider_type: row
            .get::<_, String>(3)?
            .parse::<ProviderType>()
            .map_err(|error| sqlite_text_conversion_error(3, error))?,
        base_url: row.get(4)?,
        auth_type: row
            .get::<_, String>(5)?
            .parse::<ProviderAuthType>()
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        auth_status: row
            .get::<_, String>(6)?
            .parse::<AuthStatus>()
            .map_err(|error| sqlite_text_conversion_error(6, error))?,
        model_count: row.get(7)?,
        last_refreshed_at: row.get(8)?,
        created_at: row.get(9)?,
    })
}

fn map_provider_model(row: &Row<'_>) -> rusqlite::Result<ProviderModelRecord> {
    let reasoning_modes = parse_json_value(row.get(9)?)
        .map_err(|error| sqlite_text_conversion_error(9, error))?;
    let reasoning_effort_values = parse_json_value(row.get(11)?)
        .map_err(|error| sqlite_text_conversion_error(11, error))?;

    Ok(ProviderModelRecord {
        provider_id: row.get(0)?,
        model_id: row.get(1)?,
        display_name: row.get(2)?,
        context_window: row.get(3)?,
        input_cost_per_million: row.get(4)?,
        output_cost_per_million: row.get(5)?,
        supports_vision: row.get::<_, i64>(6)? != 0,
        supports_tools: row.get::<_, i64>(7)? != 0,
        supports_reasoning: row.get::<_, i64>(8)? != 0,
        reasoning_modes: serde_json::from_value(reasoning_modes)
            .map_err(|error| sqlite_text_conversion_error(9, error))?,
        reasoning_effort_supported: row.get::<_, i64>(10)? != 0,
        reasoning_effort_values: serde_json::from_value(reasoning_effort_values)
            .map_err(|error| sqlite_text_conversion_error(11, error))?,
        reasoning_token_budget_supported: row.get::<_, i64>(12)? != 0,
        discovered_at: row.get(13)?,
        refreshed_at: row.get(14)?,
    })
}

fn map_provider_credential(row: &Row<'_>) -> rusqlite::Result<ProviderCredentialRecord> {
    Ok(ProviderCredentialRecord {
        id: row.get(0)?,
        provider_id: row.get(1)?,
        credential_type: row
            .get::<_, String>(2)?
            .parse::<CredentialType>()
            .map_err(|error| sqlite_text_conversion_error(2, error))?,
        keychain_ref: row.get(3)?,
        expires_at: row.get(4)?,
        refresh_token_ref: row.get(5)?,
        created_at: row.get(6)?,
    })
}
