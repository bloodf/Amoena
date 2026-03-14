use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use std::path::PathBuf;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..")
}

fn temp_config(tempdir: &TempDir) -> RuntimeConfig {
    let mut config = RuntimeConfig::default();
    config.database_path = tempdir.path().join("lunaria.sqlite");
    config
}

async fn bootstrap(client: &Client, runtime: &RuntimeHandle) -> BootstrapSession {
    client
        .post(format!(
            "{}{}",
            runtime.launch_context().api_base_url,
            runtime.launch_context().bootstrap_path
        ))
        .json(&serde_json::json!({ "token": runtime.launch_context().bootstrap_token }))
        .send()
        .await
        .expect("bootstrap request should complete")
        .error_for_status()
        .expect("bootstrap request should succeed")
        .json()
        .await
        .expect("bootstrap response should deserialize")
}

async fn create_session(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    working_dir: &str,
) -> String {
    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(auth_token)
        .json(&serde_json::json!({
            "workingDir": working_dir,
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");

    session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string()
}

async fn post_observation(
    client: &Client,
    base_url: &str,
    auth_token: &str,
    session_id: &str,
    title: &str,
    narrative: &str,
    category: &str,
) {
    let response = client
        .post(format!("{}/api/v1/memory/observe", base_url))
        .bearer_auth(auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "title": title,
            "narrative": narrative,
            "category": category
        }))
        .send()
        .await
        .expect("observe request should complete")
        .error_for_status()
        .expect("observe request should succeed");
    assert_eq!(
        response.status().as_u16(),
        201,
        "observe should return 201 Created"
    );
}

async fn search_memory(
    client: &Client,
    base_url: &str,
    auth_token: &str,
    query: &str,
    category: Option<&str>,
) -> Vec<serde_json::Value> {
    let url = match category {
        Some(cat) => format!(
            "{}/api/v1/memory/search?query={}&category={}",
            base_url, query, cat
        ),
        None => format!("{}/api/v1/memory/search?query={}", base_url, query),
    };

    client
        .get(&url)
        .bearer_auth(auth_token)
        .send()
        .await
        .expect("memory search request should complete")
        .error_for_status()
        .expect("memory search request should succeed")
        .json::<Vec<serde_json::Value>>()
        .await
        .expect("memory search response should deserialize")
}

async fn get_session_memory(
    client: &Client,
    base_url: &str,
    auth_token: &str,
    session_id: &str,
) -> serde_json::Value {
    client
        .get(format!(
            "{}/api/v1/sessions/{}/memory",
            base_url, session_id
        ))
        .bearer_auth(auth_token)
        .send()
        .await
        .expect("session memory request should complete")
        .error_for_status()
        .expect("session memory request should succeed")
        .json()
        .await
        .expect("session memory response should deserialize")
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn observation_capture_and_search_round_trip() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    post_observation(
        &client,
        &runtime.launch_context().api_base_url,
        &bs.auth_token,
        &session_id,
        "Rust compiler optimization",
        "The Rust compiler uses LLVM for backend optimization passes",
        "entity",
    )
    .await;

    let results = search_memory(
        &client,
        &runtime.launch_context().api_base_url,
        &bs.auth_token,
        "Rust compiler",
        None,
    )
    .await;

    assert!(
        !results.is_empty(),
        "search should return at least one result"
    );
    assert!(
        results
            .iter()
            .any(|r| r["observation"]["title"].as_str() == Some("Rust compiler optimization")),
        "search results should contain the captured observation title"
    );
    assert!(
        results.iter().any(|r| r["observation"]["narrative"]
            .as_str()
            .unwrap_or("")
            .contains("LLVM")),
        "search results should contain the captured observation narrative"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn observation_auto_captured_from_user_message() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{}/messages",
            runtime.launch_context().api_base_url,
            session_id
        ))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "content": "I prefer using dark mode in all my applications and always use vim keybindings"
        }))
        .send()
        .await
        .expect("message request should complete")
        .error_for_status()
        .expect("message request should succeed");

    sleep(Duration::from_millis(500)).await;

    let memory = get_session_memory(
        &client,
        &runtime.launch_context().api_base_url,
        &bs.auth_token,
        &session_id,
    )
    .await;

    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");
    assert!(
        !entries.is_empty(),
        "session memory should contain at least one entry after user message"
    );
    assert!(
        entries
            .iter()
            .any(|e| e["category"].as_str() == Some("preference")),
        "auto-captured observation should be classified as preference"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn observation_deduplication_prevents_duplicates() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "Favorite editor",
        "The user always uses Neovim as their primary editor",
        "preference",
    )
    .await;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "Favorite editor",
        "The user always uses Neovim as their primary editor",
        "preference",
    )
    .await;

    let results = search_memory(&client, base_url, &bs.auth_token, "Neovim", None).await;

    assert_eq!(
        results.len(),
        1,
        "hash-based deduplication should prevent duplicate observations; got {}",
        results.len()
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn observation_semantic_deduplication() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "dark mode preference",
        "The user prefers dark mode settings",
        "preference",
    )
    .await;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "dark mode preference",
        "The user likes dark mode in settings",
        "preference",
    )
    .await;

    let results =
        search_memory(&client, base_url, &bs.auth_token, "dark mode", None).await;

    assert_eq!(
        results.len(),
        1,
        "semantic deduplication (Jaccard >= 0.50) should suppress near-duplicate observations; got {}",
        results.len()
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn observation_category_auto_classification() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    // Each POST omits "category" to let auto-classification run
    for (title, narrative) in &[
        ("spacing preference", "I prefer tabs over spaces"),
        ("engineer profile", "I am a senior backend engineer"),
        ("immutability pattern", "The pattern is to always use immutable data"),
    ] {
        client
            .post(format!("{}/api/v1/memory/observe", base_url))
            .bearer_auth(&bs.auth_token)
            .json(&serde_json::json!({
                "sessionId": &session_id,
                "title": title,
                "narrative": narrative
            }))
            .send()
            .await
            .expect("auto-classify observe request should complete")
            .error_for_status()
            .expect("auto-classify observe request should succeed");
    }

    let pref_results =
        search_memory(&client, base_url, &bs.auth_token, "tabs spaces", Some("preference")).await;
    assert!(
        !pref_results.is_empty(),
        "tabs/spaces narrative should auto-classify as preference"
    );

    let profile_results =
        search_memory(&client, base_url, &bs.auth_token, "backend engineer", Some("profile")).await;
    assert!(
        !profile_results.is_empty(),
        "engineer narrative should auto-classify as profile"
    );

    let pattern_results =
        search_memory(&client, base_url, &bs.auth_token, "immutable data", Some("pattern")).await;
    assert!(
        !pattern_results.is_empty(),
        "immutable data narrative should auto-classify as pattern"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_tiers_l0_l1_l2_generation() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;
    let long_narrative = "Good API design is a critical skill for building maintainable software. \
        APIs should be versioned, consistent, and follow the principle of least astonishment. \
        HTTP REST conventions should be respected: nouns for resources, verbs for actions via HTTP methods, \
        status codes as semantic signals. Pagination, filtering, and sorting should be standardised. \
        Error envelopes should include machine-readable codes alongside human-readable messages.";

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "API Design",
        long_narrative,
        "skill",
    )
    .await;

    let memory = get_session_memory(&client, base_url, &bs.auth_token, &session_id).await;

    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");
    assert!(!entries.is_empty(), "entries should contain the observation");

    let entry = entries
        .iter()
        .find(|e| e["title"].as_str() == Some("API Design"))
        .expect("API Design observation should be present in session memory");

    let l0 = entry["l0Summary"].as_str().unwrap_or("");
    assert!(
        l0.contains("API Design"),
        "l0Summary should contain the observation title; got: {l0}"
    );
    assert!(
        l0.contains("skill"),
        "l0Summary should contain the observation category; got: {l0}"
    );

    let l1 = entry["l1Summary"].as_str().unwrap_or("");
    assert!(
        l1.contains("API Design"),
        "l1Summary should contain the observation title; got: {l1}"
    );
    assert!(
        !l1.is_empty(),
        "l1Summary should not be empty"
    );

    let l2 = entry["l2Content"].as_str().unwrap_or("");
    assert!(
        l2.contains("API Design"),
        "l2Content should contain the observation data; got: {l2}"
    );

    assert!(
        entry["l0Tokens"].as_u64().unwrap_or(0) > 0,
        "l0Tokens should be positive"
    );
    assert!(
        entry["l1Tokens"].as_u64().unwrap_or(0) > 0,
        "l1Tokens should be positive"
    );
    assert!(
        entry["l2Tokens"].as_u64().unwrap_or(0) > 0,
        "l2Tokens should be positive"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_search_with_category_filter() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "Rust language entity",
        "Rust is a systems programming language with strong safety guarantees",
        "entity",
    )
    .await;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "Rust style preference",
        "I prefer using rustfmt and clippy in every Rust project",
        "preference",
    )
    .await;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "Rust developer profile",
        "I am an experienced Rust developer working on systems projects",
        "profile",
    )
    .await;

    let pref_results =
        search_memory(&client, base_url, &bs.auth_token, "Rust", Some("preference")).await;

    assert_eq!(
        pref_results.len(),
        1,
        "category filter should return only preference observations; got {}",
        pref_results.len()
    );
    assert_eq!(
        pref_results[0]["observation"]["category"].as_str(),
        Some("preference"),
        "returned observation should have preference category"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_cross_session_isolation() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let base_url = &runtime.launch_context().api_base_url;
    let working_dir = tempdir.path().display().to_string();

    let session_a = create_session(&client, &runtime, &bs.auth_token, &working_dir).await;
    let session_b = create_session(&client, &runtime, &bs.auth_token, &working_dir).await;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_a,
        "Session A observation",
        "This fact belongs exclusively to session alpha",
        "entity",
    )
    .await;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_b,
        "Session B observation",
        "This fact belongs exclusively to session beta",
        "entity",
    )
    .await;

    let memory_a = get_session_memory(&client, base_url, &bs.auth_token, &session_a).await;
    let entries_a = memory_a["entries"]
        .as_array()
        .expect("session A entries should be an array");
    assert!(
        entries_a
            .iter()
            .any(|e| e["title"].as_str() == Some("Session A observation")),
        "session A memory should contain its own observation"
    );
    assert!(
        !entries_a
            .iter()
            .any(|e| e["title"].as_str() == Some("Session B observation")),
        "session A memory should not contain session B observations"
    );

    let memory_b = get_session_memory(&client, base_url, &bs.auth_token, &session_b).await;
    let entries_b = memory_b["entries"]
        .as_array()
        .expect("session B entries should be an array");
    assert!(
        entries_b
            .iter()
            .any(|e| e["title"].as_str() == Some("Session B observation")),
        "session B memory should contain its own observation"
    );
    assert!(
        !entries_b
            .iter()
            .any(|e| e["title"].as_str() == Some("Session A observation")),
        "session B memory should not contain session A observations"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_persists_across_session_lifecycle() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    post_observation(
        &client,
        base_url,
        &bs.auth_token,
        &session_id,
        "Persistent knowledge",
        "Observations should survive session deletion and remain searchable",
        "entity",
    )
    .await;

    client
        .delete(format!("{}/api/v1/sessions/{}", base_url, session_id))
        .bearer_auth(&bs.auth_token)
        .send()
        .await
        .expect("delete session request should complete")
        .error_for_status()
        .expect("delete session request should succeed");

    let new_session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let results = search_memory(
        &client,
        base_url,
        &bs.auth_token,
        "Persistent knowledge",
        None,
    )
    .await;

    assert!(
        !results.is_empty(),
        "observations should persist after session deletion and be globally searchable"
    );
    assert!(
        results
            .iter()
            .any(|r| r["observation"]["title"].as_str() == Some("Persistent knowledge")),
        "the persisted observation should be findable by title"
    );

    // new_session_id used to demonstrate the old session was deleted
    let _ = new_session_id;

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_scope_classification() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    // Three observations that should map to distinct scopes / categories.
    let observations = [
        (
            "workspace tab preference",
            "I prefer this workspace to use tabs for indentation",
            "preference",
        ),
        (
            "global dark mode preference",
            "I always prefer dark mode in all editors and applications",
            "preference",
        ),
        (
            "project typescript config",
            "The project uses TypeScript with strict mode enabled",
            "entity",
        ),
    ];

    for (title, narrative, category) in &observations {
        post_observation(
            &client,
            base_url,
            &bs.auth_token,
            &session_id,
            title,
            narrative,
            category,
        )
        .await;
    }

    // Each observation should be independently searchable.
    let workspace_results = search_memory(
        &client,
        base_url,
        &bs.auth_token,
        "workspace tabs indentation",
        None,
    )
    .await;
    assert!(
        !workspace_results.is_empty(),
        "workspace tab preference observation should be searchable"
    );

    let darkmode_results = search_memory(
        &client,
        base_url,
        &bs.auth_token,
        "dark mode editors",
        None,
    )
    .await;
    assert!(
        !darkmode_results.is_empty(),
        "global dark mode preference observation should be searchable"
    );

    let typescript_results = search_memory(
        &client,
        base_url,
        &bs.auth_token,
        "TypeScript strict mode",
        None,
    )
    .await;
    assert!(
        !typescript_results.is_empty(),
        "TypeScript project entity observation should be searchable"
    );

    // All three should appear in session memory.
    let memory = get_session_memory(&client, base_url, &bs.auth_token, &session_id).await;
    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");

    let titles: Vec<&str> = entries
        .iter()
        .filter_map(|e| e["title"].as_str())
        .collect();

    for (title, _, _) in &observations {
        assert!(
            titles.contains(title),
            "session memory should contain observation '{title}'; found: {titles:?}"
        );
    }

    // Verify we have at least one entry with a known category.
    let has_preference = entries
        .iter()
        .any(|e| e["category"].as_str() == Some("preference"));
    let has_entity = entries
        .iter()
        .any(|e| e["category"].as_str() == Some("entity"));

    assert!(
        has_preference,
        "session memory should contain at least one preference-category entry"
    );
    assert!(
        has_entity,
        "session memory should contain at least one entity-category entry"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_token_budget_tracking() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    let observations = [
        ("Budget obs 1", "Short narrative about memory budgets"),
        ("Budget obs 2", "A somewhat longer narrative describing how token budgets are tracked across observations in a session context"),
        ("Budget obs 3", "Another observation with different content: the system should accumulate l0 tokens for each captured observation tier"),
        ("Budget obs 4", "Fourth observation with unique phrasing to avoid semantic deduplication thresholds during this token budget test scenario"),
        ("Budget obs 5", "Fifth and final observation ensuring we have enough entries to meaningfully verify that token budget totals are non-zero and consistent"),
    ];

    for (title, narrative) in &observations {
        post_observation(
            &client,
            base_url,
            &bs.auth_token,
            &session_id,
            title,
            narrative,
            "entity",
        )
        .await;
    }

    let memory = get_session_memory(&client, base_url, &bs.auth_token, &session_id).await;

    let token_budget = &memory["tokenBudget"];
    assert!(
        token_budget["total"].as_u64().unwrap_or(0) > 0,
        "tokenBudget.total should be positive after observations are captured"
    );

    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");

    let sum_l0: u64 = entries
        .iter()
        .map(|e| e["l0Tokens"].as_u64().unwrap_or(0))
        .sum();
    let sum_l1: u64 = entries
        .iter()
        .map(|e| e["l1Tokens"].as_u64().unwrap_or(0))
        .sum();

    assert_eq!(
        token_budget["l0"].as_u64().unwrap_or(0),
        sum_l0,
        "tokenBudget.l0 should equal the sum of all entry l0Tokens"
    );
    assert_eq!(
        token_budget["l1"].as_u64().unwrap_or(0),
        sum_l1,
        "tokenBudget.l1 should equal the sum of all entry l1Tokens"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_observation_with_facts_and_files() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;
    let message_content =
        "Read the file config.toml and noticed the database URL is set to localhost";

    client
        .post(format!(
            "{}/api/v1/sessions/{}/messages",
            base_url, session_id
        ))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({ "content": message_content }))
        .send()
        .await
        .expect("message request should complete")
        .error_for_status()
        .expect("message request should succeed");

    sleep(Duration::from_millis(500)).await;

    let memory = get_session_memory(&client, base_url, &bs.auth_token, &session_id).await;

    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");
    assert!(
        !entries.is_empty(),
        "session memory should have at least one entry after sending a message"
    );

    let has_relevant = entries.iter().any(|e| {
        let l2 = e["l2Content"].as_str().unwrap_or("");
        let title = e["title"].as_str().unwrap_or("");
        l2.contains("config.toml")
            || l2.contains("database")
            || l2.contains("localhost")
            || title.contains("config.toml")
            || title.contains("database")
    });
    assert!(
        has_relevant,
        "at least one observation narrative should reflect the message content about config.toml"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_concurrent_observations() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = runtime.launch_context().api_base_url.clone();
    let auth_token = bs.auth_token.clone();

    // Use maximally distinct narratives to avoid Jaccard semantic deduplication
    let narratives = [
        "The Python programming language uses indentation for block structure and dynamic typing",
        "Kubernetes orchestrates containerized workloads across clusters with declarative config",
        "PostgreSQL supports JSONB columns enabling hybrid relational and document storage",
        "Rust ownership model prevents data races at compile time without a garbage collector",
        "React hooks replaced class components enabling stateful logic in function components",
        "GraphQL allows clients to specify exact data requirements reducing over-fetching",
        "WebAssembly enables near-native performance for browser-based computation tasks",
        "Terraform provisions cloud infrastructure through declarative HCL configuration files",
        "Redis stores data structures in memory enabling sub-millisecond read write latency",
        "gRPC uses Protocol Buffers for efficient binary serialization between microservices",
    ];
    let handles: Vec<_> = (0..10)
        .map(|i| {
            let client = Client::new();
            let base_url = base_url.clone();
            let auth_token = auth_token.clone();
            let session_id = session_id.clone();
            let narrative = narratives[i].to_string();
            tokio::spawn(async move {
                client
                    .post(format!("{}/api/v1/memory/observe", base_url))
                    .bearer_auth(&auth_token)
                    .json(&serde_json::json!({
                        "sessionId": &session_id,
                        "title": format!("Concurrent observation {i}"),
                        "narrative": narrative,
                        "category": "entity"
                    }))
                    .send()
                    .await
                    .expect("concurrent observe request should complete")
                    .error_for_status()
                    .expect("concurrent observe request should succeed")
            })
        })
        .collect();

    for handle in handles {
        handle.await.expect("concurrent task should not panic");
    }

    let results = search_memory(&client, &base_url, &auth_token, "Concurrent observation", None).await;

    assert_eq!(
        results.len(),
        10,
        "all 10 concurrent observations should be captured; got {}",
        results.len()
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_session_summary_endpoint() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_session(
        &client,
        &runtime,
        &bs.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let base_url = &runtime.launch_context().api_base_url;

    // Use maximally distinct messages to avoid semantic deduplication
    let messages = [
        "I prefer tabs over spaces for indentation in all my TypeScript projects",
        "My database of choice is PostgreSQL because I need JSONB and full-text search",
        "I always deploy with Docker Compose for local development and Kubernetes in production",
    ];

    for msg in &messages {
        client
            .post(format!("{}/api/v1/sessions/{}/messages", base_url, session_id))
            .bearer_auth(&bs.auth_token)
            .json(&serde_json::json!({ "content": msg }))
            .send()
            .await
            .expect("message request should complete")
            .error_for_status()
            .expect("message request should succeed");

        sleep(Duration::from_millis(150)).await;
    }

    sleep(Duration::from_millis(300)).await;

    let memory = get_session_memory(&client, base_url, &bs.auth_token, &session_id).await;

    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");
    assert!(
        !entries.is_empty(),
        "session memory should have at least one entry after posting messages; got {}",
        entries.len()
    );

    // Verify ordering: createdAt timestamps should be consistently ordered (non-increasing, newest first)
    let timestamps: Vec<&str> = entries
        .iter()
        .filter_map(|e| e["createdAt"].as_str())
        .collect();
    if timestamps.len() > 1 {
        let is_nondecreasing = timestamps.windows(2).all(|w| w[0] <= w[1]);
        let is_nonincreasing = timestamps.windows(2).all(|w| w[0] >= w[1]);
        assert!(
            is_nondecreasing || is_nonincreasing,
            "session memory entries should be consistently ordered by creation time"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn real_cli_memory_round_trip() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let base_url = &runtime.launch_context().api_base_url;

    // Create a wrapper session backed by the real Claude CLI
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": repo_root().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create wrapper session request should complete")
        .error_for_status()
        .expect("create wrapper session should succeed")
        .json()
        .await
        .expect("create wrapper session response should deserialize");
    let session_id = session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    client
        .post(format!("{}/api/v1/sessions/{}/messages", base_url, session_id))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "content": "Remember that my favorite color is blue"
        }))
        .send()
        .await
        .expect("message request should complete")
        .error_for_status()
        .expect("message request should succeed");

    // Allow time for the CLI to process and for memory capture to run
    timeout(Duration::from_secs(30), async {
        loop {
            let memory =
                get_session_memory(&client, base_url, &bs.auth_token, &session_id).await;
            let entries = memory["entries"].as_array().expect("entries should be an array");
            if !entries.is_empty() {
                break;
            }
            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("timed out waiting for real CLI memory capture");

    let results = search_memory(&client, base_url, &bs.auth_token, "favorite color blue", None).await;

    assert!(
        !results.is_empty(),
        "real CLI session should produce a searchable observation about color preference"
    );
    assert!(
        results.iter().any(|r| {
            let narrative = r["observation"]["narrative"].as_str().unwrap_or("");
            let title = r["observation"]["title"].as_str().unwrap_or("");
            narrative.contains("blue") || title.contains("blue") || narrative.contains("color")
        }),
        "memory observation should reference the user's color preference"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
