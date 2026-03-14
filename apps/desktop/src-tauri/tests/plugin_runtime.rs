use std::{fs, sync::Arc};

use lunaria_desktop::{plugins::PluginRegistryService, persistence::Database};
use serde_json::json;
use tempfile::TempDir;

fn setup() -> (TempDir, PluginRegistryService) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let service = PluginRegistryService::new(database);
    (tempdir, service)
}

#[test]
fn plugin_discovery_populates_registry_and_enablement() {
    let (tempdir, service) = setup();
    let plugin_dir = tempdir.path().join("plugins/metrics");
    fs::create_dir_all(&plugin_dir).expect("plugin dir should create");
    fs::write(
        plugin_dir.join("manifest.json"),
        r#"{
  "id": "com.lunaria.metrics",
  "name": "Metrics",
  "version": "0.1.0",
  "author": "Lunaria",
  "description": "Metrics plugin",
  "main": "dist/index.js",
  "permissions": ["sessions.read"],
  "activationEvents": ["onStartup"],
  "divisionAffinity": ["engineering", "qa"]
}"#,
    )
    .expect("manifest should write");

    let discovered = service
        .discover(&tempdir.path().join("plugins"))
        .expect("plugins should discover");
    assert_eq!(discovered.len(), 1);
    assert_eq!(discovered[0].id, "com.lunaria.metrics");

    service
        .set_enabled("com.lunaria.metrics", false)
        .expect("plugin should disable");
    let plugins = service.list().expect("plugins should list");
    assert!(!plugins[0].enabled);
    assert_eq!(plugins[0].division_affinity, vec!["engineering", "qa"]);
}

#[test]
fn deeplinks_parse_into_install_review_intents() {
    let (_tempdir, service) = setup();

    let intent = service
        .parse_install_deeplink(
            "lunaria://plugin/install?id=com.lunaria.metrics&source=marketplace&version=1.2.3&manifestUrl=https://plugins.example/manifest.json&signature=signed&publisher=Lunaria&title=Metrics",
        )
        .expect("trusted deeplink should parse");

    assert_eq!(intent.target_kind, "plugin");
    assert_eq!(intent.id, "com.lunaria.metrics");
    assert!(intent.trusted);
    assert!(intent.warnings.is_empty());
}

#[test]
fn unsafe_or_invalid_deeplinks_are_flagged() {
    let (_tempdir, service) = setup();

    let unsafe_intent = service
        .parse_install_deeplink(
            "lunaria://plugin/install?id=com.lunaria.unsafe&source=custom&manifestUrl=http://insecure.local/manifest.json",
        )
        .expect("unsigned deeplink should still parse into review intent");
    assert!(!unsafe_intent.trusted);
    assert!(unsafe_intent.warnings.contains(&"manifest_url_untrusted".to_string()));
    assert!(unsafe_intent.warnings.contains(&"unsigned_plugin".to_string()));

    let invalid = service.parse_install_deeplink("https://example.com/plugin/install");
    assert!(invalid.is_err());
}

#[tokio::test]
async fn plugin_execution_loads_executes_and_uninstalls() {
    let (tempdir, service) = setup();
    let plugin_dir = tempdir.path().join("plugins/runtime");
    fs::create_dir_all(&plugin_dir).expect("plugin dir should create");
    fs::write(
        plugin_dir.join("manifest.json"),
        r#"{
  "id": "com.lunaria.runtime",
  "name": "Runtime",
  "version": "0.1.0",
  "author": "Lunaria",
  "description": "Runtime plugin",
  "main": "index.js",
  "permissions": ["sessions.read"],
  "activationEvents": ["onStartup", "session.execute"]
}"#,
    )
    .expect("manifest should write");
    fs::write(
        plugin_dir.join("index.js"),
        r#"process.stdin.setEncoding("utf8");
let buffer = "";
process.stdin.on("data", chunk => {
  buffer += chunk;
  let newlineIndex = buffer.indexOf("\n");
  while (newlineIndex >= 0) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (line.length > 0) {
      const request = JSON.parse(line);
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          acknowledgedHook: request.params.hook,
          echoedPayload: request.params.payload
        }
      }) + "\n");
    }
    newlineIndex = buffer.indexOf("\n");
  }
});"#,
    )
    .expect("plugin main should write");

    service
        .discover(&tempdir.path().join("plugins"))
        .expect("plugins should discover");
    let manifest = service
        .load("com.lunaria.runtime")
        .expect("plugin should load");
    assert_eq!(manifest.main, "index.js");

    let response = service
        .execute_hook(
            "com.lunaria.runtime",
            "session.execute",
            json!({ "step": "run" }),
            None,
        )
        .await
        .expect("plugin execution should succeed");
    assert_eq!(response["acknowledgedHook"], "session.execute");
    assert_eq!(response["echoedPayload"]["step"], "run");

    service
        .uninstall("com.lunaria.runtime")
        .expect("plugin should uninstall");
    assert!(
        service
            .list()
            .expect("plugins should list")
            .iter()
            .all(|plugin| plugin.id != "com.lunaria.runtime")
    );
    assert!(!plugin_dir.exists(), "plugin dir should be removed");
}

#[tokio::test]
async fn plugin_execution_enforces_activation_and_permissions() {
    let (tempdir, service) = setup();
    let plugin_dir = tempdir.path().join("plugins/limited");
    fs::create_dir_all(&plugin_dir).expect("plugin dir should create");
    fs::write(
        plugin_dir.join("manifest.json"),
        r#"{
  "id": "com.lunaria.limited",
  "name": "Limited",
  "version": "0.1.0",
  "description": "Limited plugin",
  "main": "index.js",
  "permissions": ["sessions.read"],
  "activationEvents": ["onStartup"]
}"#,
    )
    .expect("manifest should write");
    fs::write(
        plugin_dir.join("index.js"),
        "process.stdin.resume();",
    )
    .expect("plugin main should write");

    service
        .discover(&tempdir.path().join("plugins"))
        .expect("plugins should discover");

    let hook_error = service
        .execute_hook(
            "com.lunaria.limited",
            "session.execute",
            json!({}),
            None,
        )
        .await
        .expect_err("unexpected hook should be rejected");
    assert!(hook_error.to_string().contains("activation"));

    let permission_error = service
        .execute_hook(
            "com.lunaria.limited",
            "onStartup",
            json!({}),
            Some("shell.execute"),
        )
        .await
        .expect_err("missing permission should be rejected");
    assert!(permission_error.to_string().contains("shell.execute"));
}
