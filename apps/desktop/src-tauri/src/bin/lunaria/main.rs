mod client;
mod commands;
mod output;

use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};

use client::LunariaClient;

#[derive(Parser)]
#[command(
    name = "lunaria",
    version,
    about = "Lunaria CLI — manage sessions, agents, and AI workflows"
)]
struct Cli {
    /// Override API base URL (default: auto-detect from running instance)
    #[arg(long, env = "LUNARIA_URL", global = true)]
    url: Option<String>,

    /// Override auth token
    #[arg(long, env = "LUNARIA_TOKEN", global = true)]
    token: Option<String>,

    /// Output raw JSON instead of formatted tables
    #[arg(long, global = true)]
    json: bool,

    /// Show request/response details
    #[arg(long, global = true)]
    verbose: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Authenticate with a provider (opens browser)
    Auth {
        /// Provider: anthropic, openai, google
        provider: String,
    },
    /// Check system health
    Health,
    /// Manage sessions (list, create, delete, inspect)
    Sessions {
        #[command(subcommand)]
        command: commands::sessions::SessionsCommand,
    },
    /// Manage message queue
    Queue {
        #[command(subcommand)]
        command: commands::queue::QueueCommand,
    },
    /// Manage tasks (list, create, move, delete)
    Tasks {
        #[command(subcommand)]
        command: commands::tasks::TasksCommand,
    },
    /// Manage workspaces
    Workspaces {
        #[command(subcommand)]
        command: commands::workspaces::WorkspacesCommand,
    },
    /// File operations (tree, read, write)
    Files {
        #[command(subcommand)]
        command: commands::files::FilesCommand,
    },
    /// Terminal sessions
    Terminal {
        #[command(subcommand)]
        command: commands::terminal::TerminalCommand,
    },
    /// Manage AI providers
    Providers {
        #[command(subcommand)]
        command: commands::providers::ProvidersCommand,
    },
    /// View/edit settings
    Settings {
        #[command(subcommand)]
        command: commands::settings::SettingsCommand,
    },
    /// Manage plugins
    Plugins {
        #[command(subcommand)]
        command: commands::plugins::PluginsCommand,
    },
    /// Manage extensions
    Extensions {
        #[command(subcommand)]
        command: commands::extensions::ExtensionsCommand,
    },
    /// Memory operations (search, observe)
    Memory {
        #[command(subcommand)]
        command: commands::memory::MemoryCommand,
    },
    /// Usage analytics
    Usage {
        #[command(subcommand)]
        command: commands::usage::UsageCommand,
    },
    /// Remote access management
    Remote {
        #[command(subcommand)]
        command: commands::remote::RemoteCommand,
    },
    /// Manage lifecycle hooks
    Hooks {
        #[command(subcommand)]
        command: commands::hooks::HooksCommand,
    },
    /// Manage agent teams
    Teams {
        #[command(subcommand)]
        command: commands::teams::TeamsCommand,
    },
    /// Manage CLI wrappers (health, run, chat, compare)
    Wrappers {
        #[command(subcommand)]
        command: commands::wrappers::WrappersCommand,
    },
    /// Run E2E test suite
    Test {
        #[command(flatten)]
        opts: commands::test::TestOpts,
    },
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeInfo {
    api_base_url: String,
    session_token: String,
    #[allow(dead_code)]
    pid: Option<u64>,
    #[allow(dead_code)]
    instance_id: Option<String>,
}

enum RuntimeConnection {
    /// Connected to an already-running instance (desktop app or another CLI)
    Existing { base_url: String, token: String },
    /// Started our own headless runtime — we own the lifecycle
    Headless {
        base_url: String,
        token: String,
        handle: lunaria_desktop::RuntimeHandle,
    },
}

/// Try to discover an existing runtime, or start a headless one.
async fn connect_or_start(
    url: Option<&str>,
    token: Option<&str>,
    verbose: bool,
) -> Result<RuntimeConnection> {
    // Explicit flags always win
    if let (Some(u), Some(t)) = (url, token) {
        return Ok(RuntimeConnection::Existing {
            base_url: u.to_string(),
            token: t.to_string(),
        });
    }

    // Try reading discovery file from a running desktop instance
    let runtime_path = dirs::home_dir()
        .context("cannot determine home directory")?
        .join(".lunaria")
        .join("runtime.json");

    if runtime_path.exists() {
        let content = std::fs::read_to_string(&runtime_path)
            .with_context(|| format!("failed to read {}", runtime_path.display()))?;
        if let Ok(info) = serde_json::from_str::<RuntimeInfo>(&content) {
            // Verify the process is still alive
            let base = url.map(String::from).unwrap_or(info.api_base_url);
            let tok = token.map(String::from).unwrap_or(info.session_token);

            // Quick health check
            let check = reqwest::Client::new()
                .get(format!("{base}/api/v1/health"))
                .bearer_auth(&tok)
                .timeout(std::time::Duration::from_secs(2))
                .send()
                .await;

            if check.map(|r| r.status().is_success()).unwrap_or(false) {
                if verbose {
                    eprintln!("Connected to running Lunaria instance at {base}");
                }
                return Ok(RuntimeConnection::Existing {
                    base_url: base,
                    token: tok,
                });
            }

            if verbose {
                eprintln!("Stale runtime file found — starting headless runtime...");
            }
        }
    }

    // No running instance found — start headless runtime
    if verbose {
        eprintln!("No running Lunaria instance — starting headless runtime...");
    }

    let handle = lunaria_desktop::start_runtime(lunaria_desktop::RuntimeConfig::default()).await
        .context("failed to start headless runtime")?;

    let ctx = handle.launch_context();
    let base_url = ctx.api_base_url.clone();

    // Bootstrap auth to get a session token
    let bootstrap_resp = reqwest::Client::new()
        .post(format!("{base_url}{}", ctx.bootstrap_path))
        .json(&serde_json::json!({ "token": ctx.bootstrap_token }))
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
        .context("bootstrap auth request failed")?;

    if !bootstrap_resp.status().is_success() {
        bail!("bootstrap auth failed: {}", bootstrap_resp.status());
    }

    let session: lunaria_desktop::BootstrapSession = bootstrap_resp
        .json()
        .await
        .context("failed to parse bootstrap response")?;

    if verbose {
        eprintln!("Headless runtime started at {base_url}");
    }

    Ok(RuntimeConnection::Headless {
        base_url,
        token: session.auth_token,
        handle,
    })
}

#[tokio::main]
async fn main() {
    // Suppress tracing output from the runtime unless RUST_LOG is set
    if std::env::var("RUST_LOG").is_err() {
        std::env::set_var("RUST_LOG", "off");
    }
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_writer(std::io::stderr)
        .init();

    if let Err(e) = run().await {
        output::print_error(&format!("{e:#}"));
        std::process::exit(1);
    }
}

async fn run() -> Result<()> {
    let cli = Cli::parse();
    let conn = connect_or_start(cli.url.as_deref(), cli.token.as_deref(), cli.verbose).await?;

    let (base_url, token, _headless_handle) = match conn {
        RuntimeConnection::Existing { base_url, token } => (base_url, token, None),
        RuntimeConnection::Headless { base_url, token, handle } => (base_url, token, Some(handle)),
    };

    let client = LunariaClient::new(base_url, token, cli.json, cli.verbose);

    if cli.verbose {
        eprintln!("Connecting to {}...", client.base_url);
    }

    let result = match cli.command {
        Commands::Auth { provider } => {
            let auth_url = format!("{}/auth/connect/{}", client.base_url, provider);
            output::print_success(&format!("Opening browser for {} authentication...", provider));
            output::print_detail(&format!("If it doesn't open, visit: {auth_url}"));
            let _ = std::process::Command::new("open").arg(&auth_url).spawn()
                .or_else(|_| std::process::Command::new("xdg-open").arg(&auth_url).spawn())
                .or_else(|_| std::process::Command::new("cmd").args(["/c", "start", &auth_url]).spawn());

            // Poll for auth completion
            output::print_detail("Waiting for authentication...");
            let deadline = std::time::Instant::now() + std::time::Duration::from_secs(300);
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                if std::time::Instant::now() > deadline {
                    output::print_error("Authentication timed out after 5 minutes");
                    break;
                }
                let status = client.get(&format!("/auth/connect/{provider}/status")).await?;
                let auth_status = output::json_str(&status, "authStatus").to_string();
                if auth_status == "connected" {
                    output::print_success(&format!("{} connected successfully!", provider));
                    break;
                }
            }
            Ok(())
        }
        Commands::Health => commands::health::execute(&client).await,
        Commands::Sessions { command } => commands::sessions::execute(&client, command).await,
        Commands::Queue { command } => commands::queue::execute(&client, command).await,
        Commands::Tasks { command } => commands::tasks::execute(&client, command).await,
        Commands::Workspaces { command } => commands::workspaces::execute(&client, command).await,
        Commands::Files { command } => commands::files::execute(&client, command).await,
        Commands::Terminal { command } => commands::terminal::execute(&client, command).await,
        Commands::Providers { command } => commands::providers::execute(&client, command).await,
        Commands::Settings { command } => commands::settings::execute(&client, command).await,
        Commands::Plugins { command } => commands::plugins::execute(&client, command).await,
        Commands::Extensions { command } => commands::extensions::execute(&client, command).await,
        Commands::Memory { command } => commands::memory::execute(&client, command).await,
        Commands::Usage { command } => commands::usage::execute(&client, command).await,
        Commands::Remote { command } => commands::remote::execute(&client, command).await,
        Commands::Hooks { command } => commands::hooks::execute(&client, command).await,
        Commands::Teams { command } => commands::teams::execute(&client, command).await,
        Commands::Wrappers { command } => commands::wrappers::execute(&client, command).await,
        Commands::Test { opts } => commands::test::execute(&client, opts).await,
    };

    // Shut down headless runtime if we started one
    if let Some(handle) = _headless_handle {
        if let Err(e) = handle.shutdown().await {
            eprintln!("Warning: headless runtime shutdown error: {e}");
        }
    }

    result
}
