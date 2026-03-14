use std::sync::Arc;

use lunaria_desktop::persistence::{
    repositories::{messages::MessageRepository, sessions::SessionRepository, settings::SettingsRepository},
    Database, MessageRecord, MessageRole, MIGRATIONS, SessionMode, SessionRecord, SessionStatus,
    SessionType, SettingRecord, SettingScope, TuiType,
};
use serde_json::json;
use tempfile::TempDir;

fn temp_db() -> (TempDir, Arc<Database>) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Database::open(tempdir.path().join("lunaria.sqlite"))
        .expect("database should be created");
    (tempdir, Arc::new(database))
}

#[test]
fn first_run_initializes_database_with_migrations_and_pragmas() {
    let (_tempdir, database) = temp_db();

    assert!(database.path().exists(), "database file should exist after first launch");

    let migrations = database
        .applied_migrations()
        .expect("migrations should be queryable");
    assert_eq!(
        migrations.len(),
        MIGRATIONS.len(),
        "expected all declared migrations to be applied on first launch"
    );

    let (journal_mode, foreign_keys): (String, i64) = database
        .read(|connection| {
            let journal_mode: String =
                connection.query_row("PRAGMA journal_mode", [], |row| row.get(0))?;
            let foreign_keys: i64 =
                connection.query_row("PRAGMA foreign_keys", [], |row| row.get(0))?;
            Ok((journal_mode, foreign_keys))
        })
        .expect("pragmas should be readable");

    assert_eq!(journal_mode.to_lowercase(), "wal");
    assert_eq!(foreign_keys, 1);
}

#[test]
fn rerunning_migrations_is_safe_and_idempotent() {
    let (_tempdir, database) = temp_db();
    let before = database
        .applied_migrations()
        .expect("migrations should be queryable");

    let after = database
        .run_migrations()
        .expect("rerunning migrations should succeed");

    assert_eq!(before, after, "rerunning migrations should not duplicate versions");
}

#[test]
fn repositories_persist_sessions_messages_and_settings() {
    let (_tempdir, database) = temp_db();
    let sessions = SessionRepository::new(database.clone());
    let messages = MessageRepository::new(database.clone());
    let settings = SettingsRepository::new(database);

    let session = SessionRecord {
        id: "session-1".to_string(),
        parent_session_id: None,
        session_type: SessionType::Primary,
        session_mode: SessionMode::Native,
        tui_type: TuiType::Native,
        provider_id: None,
        model_id: Some("claude-sonnet-4".to_string()),
        working_dir: "/tmp/project".to_string(),
        compaction_count: 0,
        context_token_count: 0,
        workspace_id: None,
        created_at: "2026-03-12T00:00:00Z".to_string(),
        updated_at: "2026-03-12T00:00:00Z".to_string(),
        status: SessionStatus::Created,
        metadata: json!({ "origin": "bootstrap" }),
    };
    sessions.insert(&session).expect("session should be inserted");

    let message = MessageRecord {
        id: "message-1".to_string(),
        session_id: session.id.clone(),
        role: MessageRole::User,
        content: "hello".to_string(),
        attachments: json!([]),
        tool_calls: json!([]),
        tokens: 12,
        cost: 0.04,
        created_at: "2026-03-12T00:00:01Z".to_string(),
    };
    messages.insert(&message).expect("message should be inserted");

    let setting = SettingRecord {
        key: "ui.theme".to_string(),
        value: json!("system"),
        scope: SettingScope::Global,
        scope_ref: None,
        updated_at: "2026-03-12T00:00:02Z".to_string(),
    };
    settings.upsert(&setting).expect("setting should be upserted");

    assert_eq!(
        sessions.get(&session.id).expect("session get should work"),
        Some(session.clone())
    );
    assert_eq!(
        messages
            .list_by_session(&session.id)
            .expect("message list should work"),
        vec![message]
    );
    assert_eq!(
        settings
            .get("ui.theme", SettingScope::Global, None)
            .expect("setting get should work"),
        Some(setting)
    );
}

#[test]
fn failed_transaction_rolls_back_all_changes() {
    let (_tempdir, database) = temp_db();
    let sessions = SessionRepository::new(database.clone());

    let result = database.transaction(|transaction| {
        let session = SessionRecord {
            id: "session-rollback".to_string(),
            parent_session_id: None,
            session_type: SessionType::Primary,
            session_mode: SessionMode::Native,
            tui_type: TuiType::Native,
            provider_id: None,
            model_id: None,
            working_dir: "/tmp/project".to_string(),
            compaction_count: 0,
            context_token_count: 0,
            workspace_id: None,
            created_at: "2026-03-12T00:00:00Z".to_string(),
            updated_at: "2026-03-12T00:00:00Z".to_string(),
            status: SessionStatus::Created,
            metadata: json!({}),
        };

        SessionRepository::insert_tx(transaction, &session)?;
        MessageRepository::insert_tx(
            transaction,
            &MessageRecord {
                id: "broken-message".to_string(),
                session_id: "missing-session".to_string(),
                role: MessageRole::Assistant,
                content: "this should fail".to_string(),
                attachments: json!([]),
                tool_calls: json!([]),
                tokens: 0,
                cost: 0.0,
                created_at: "2026-03-12T00:00:01Z".to_string(),
            },
        )?;

        Ok(())
    });

    assert!(result.is_err(), "transaction should fail on foreign-key violation");
    assert!(
        sessions
            .get("session-rollback")
            .expect("session lookup should succeed")
            .is_none(),
        "failed transaction should not leave partial session rows behind"
    );
}
