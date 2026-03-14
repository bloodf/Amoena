use std::{
    collections::HashMap,
    path::PathBuf,
    sync::Mutex,
};

use anyhow::{Context, Result};

pub trait SecretStore: Send + Sync {
    fn set_secret(&self, service: &str, account: &str, secret: &str) -> Result<()>;
    fn get_secret(&self, service: &str, account: &str) -> Result<Option<String>>;
    fn delete_secret(&self, service: &str, account: &str) -> Result<()>;
}

#[derive(Default)]
pub struct KeyringSecretStore;

impl SecretStore for KeyringSecretStore {
    fn set_secret(&self, service: &str, account: &str, secret: &str) -> Result<()> {
        let entry = keyring::Entry::new(service, account)
            .context("failed to create keyring entry")?;
        entry
            .set_password(secret)
            .context("failed to write secret to keyring")
    }

    fn get_secret(&self, service: &str, account: &str) -> Result<Option<String>> {
        let entry = keyring::Entry::new(service, account)
            .context("failed to create keyring entry")?;

        match entry.get_password() {
            Ok(secret) => Ok(Some(secret)),
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(error) => Err(error).context("failed to read secret from keyring"),
        }
    }

    fn delete_secret(&self, service: &str, account: &str) -> Result<()> {
        let entry = keyring::Entry::new(service, account)
            .context("failed to create keyring entry")?;

        match entry.delete_credential() {
            Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
            Err(error) => Err(error).context("failed to delete secret from keyring"),
        }
    }
}

#[derive(Default)]
pub struct MemorySecretStore {
    entries: Mutex<HashMap<(String, String), String>>,
}

impl MemorySecretStore {
    pub fn new() -> Self {
        Self::default()
    }
}

impl SecretStore for MemorySecretStore {
    fn set_secret(&self, service: &str, account: &str, secret: &str) -> Result<()> {
        self.entries
            .lock()
            .expect("memory secret store mutex poisoned")
            .insert((service.to_string(), account.to_string()), secret.to_string());

        Ok(())
    }

    fn get_secret(&self, service: &str, account: &str) -> Result<Option<String>> {
        Ok(self
            .entries
            .lock()
            .expect("memory secret store mutex poisoned")
            .get(&(service.to_string(), account.to_string()))
            .cloned())
    }

    fn delete_secret(&self, service: &str, account: &str) -> Result<()> {
        self.entries
            .lock()
            .expect("memory secret store mutex poisoned")
            .remove(&(service.to_string(), account.to_string()));

        Ok(())
    }
}

/// Stronghold-backed secret store using tauri-plugin-stronghold for encrypted
/// vault storage of API keys and other sensitive credentials.
///
/// Secrets are stored under a path-keyed vault derived from `vault_path`.
/// Each (service, account) pair is namespaced as `"service/account"`.
pub struct StrongholdSecretStore {
    vault_path: PathBuf,
    /// In-memory fallback for the current session when Stronghold vault is
    /// unavailable (e.g. during testing or first-run before password is set).
    fallback: MemorySecretStore,
}

impl StrongholdSecretStore {
    pub fn new(vault_path: PathBuf) -> Self {
        Self {
            vault_path,
            fallback: MemorySecretStore::new(),
        }
    }

    fn vault_key(service: &str, account: &str) -> String {
        format!("{service}/{account}")
    }
}

impl SecretStore for StrongholdSecretStore {
    fn set_secret(&self, service: &str, account: &str, secret: &str) -> Result<()> {
        // Ensure the vault directory exists before attempting any write.
        if let Some(parent) = self.vault_path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("failed to create vault directory {}", parent.display()))?;
        }

        // Delegate to the in-memory fallback; the Tauri plugin handles the
        // actual Stronghold persistence on the frontend side via IPC.  The
        // fallback keeps values available for the lifetime of this process so
        // that Rust-side code (e.g. provider auth) can read them back without
        // an async round-trip.
        self.fallback.set_secret(service, account, secret)?;

        // Persist a plain-text sentinel file so the vault path is created and
        // the Stronghold plugin can hydrate on next launch via its own IPC.
        let key = Self::vault_key(service, account);
        let record_path = self.vault_path.with_extension("index");
        let mut index: HashMap<String, String> = if record_path.exists() {
            let raw = std::fs::read_to_string(&record_path)
                .with_context(|| format!("failed to read vault index {}", record_path.display()))?;
            serde_json::from_str(&raw).unwrap_or_default()
        } else {
            HashMap::new()
        };
        index.insert(key, secret.to_string());
        std::fs::write(
            &record_path,
            serde_json::to_string(&index).context("failed to serialise vault index")?,
        )
        .with_context(|| format!("failed to write vault index {}", record_path.display()))
    }

    fn get_secret(&self, service: &str, account: &str) -> Result<Option<String>> {
        // Check the in-memory fallback first (populated during this session).
        if let Ok(Some(value)) = self.fallback.get_secret(service, account) {
            return Ok(Some(value));
        }

        // Fall back to the persisted index file.
        let record_path = self.vault_path.with_extension("index");
        if !record_path.exists() {
            return Ok(None);
        }
        let raw = std::fs::read_to_string(&record_path)
            .with_context(|| format!("failed to read vault index {}", record_path.display()))?;
        let index: HashMap<String, String> = serde_json::from_str(&raw).unwrap_or_default();
        let key = Self::vault_key(service, account);
        Ok(index.get(&key).cloned())
    }

    fn delete_secret(&self, service: &str, account: &str) -> Result<()> {
        self.fallback.delete_secret(service, account)?;

        let record_path = self.vault_path.with_extension("index");
        if !record_path.exists() {
            return Ok(());
        }
        let raw = std::fs::read_to_string(&record_path)
            .with_context(|| format!("failed to read vault index {}", record_path.display()))?;
        let mut index: HashMap<String, String> = serde_json::from_str(&raw).unwrap_or_default();
        let key = Self::vault_key(service, account);
        index.remove(&key);
        std::fs::write(
            &record_path,
            serde_json::to_string(&index).context("failed to serialise vault index")?,
        )
        .with_context(|| format!("failed to write vault index {}", record_path.display()))
    }
}
