use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};

use anyhow::{Context, Result};
use rusqlite::Connection;

use crate::persistence::migrations::{apply_migrations, applied_migrations, MigrationRecord};

pub struct Database {
    path: PathBuf,
    connection: Mutex<Connection>,
}

impl Database {
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .with_context(|| format!("failed to create database directory {}", parent.display()))?;
        }

        let mut connection = Connection::open(&path)
            .with_context(|| format!("failed to open sqlite database {}", path.display()))?;
        configure_connection(&connection)?;
        apply_migrations(&mut connection)?;

        Ok(Self {
            path,
            connection: Mutex::new(connection),
        })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn run_migrations(&self) -> Result<Vec<MigrationRecord>> {
        let mut connection = self
            .connection
            .lock()
            .expect("database connection mutex poisoned");
        configure_connection(&connection)?;
        apply_migrations(&mut connection)
    }

    pub fn applied_migrations(&self) -> Result<Vec<MigrationRecord>> {
        let connection = self
            .connection
            .lock()
            .expect("database connection mutex poisoned");
        applied_migrations(&connection)
    }

    pub fn read<T, F>(&self, reader: F) -> Result<T>
    where
        F: FnOnce(&Connection) -> Result<T>,
    {
        let connection = self
            .connection
            .lock()
            .expect("database connection mutex poisoned");
        reader(&connection)
    }

    pub fn write<T, F>(&self, writer: F) -> Result<T>
    where
        F: FnOnce(&Connection) -> Result<T>,
    {
        let connection = self
            .connection
            .lock()
            .expect("database connection mutex poisoned");
        writer(&connection)
    }

    pub fn transaction<T, F>(&self, writer: F) -> Result<T>
    where
        F: FnOnce(&rusqlite::Transaction<'_>) -> Result<T>,
    {
        let mut connection = self
            .connection
            .lock()
            .expect("database connection mutex poisoned");
        let transaction = connection.transaction().context("failed to open sqlite transaction")?;

        match writer(&transaction) {
            Ok(value) => {
                transaction.commit().context("failed to commit sqlite transaction")?;
                Ok(value)
            }
            Err(error) => Err(error),
        }
    }
}

fn configure_connection(connection: &Connection) -> Result<()> {
    connection
        .pragma_update(None, "foreign_keys", true)
        .context("failed to enable foreign keys")?;
    connection
        .pragma_update(None, "journal_mode", "WAL")
        .context("failed to enable WAL mode")?;
    connection
        .pragma_update(None, "synchronous", "NORMAL")
        .context("failed to set synchronous pragma")?;
    connection
        .pragma_update(None, "busy_timeout", 5000)
        .context("failed to set busy_timeout pragma")?;
    connection
        .pragma_update(None, "auto_vacuum", "INCREMENTAL")
        .context("failed to set auto_vacuum pragma")?;

    Ok(())
}
