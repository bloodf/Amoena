pub mod ai_worker;
pub mod config;
pub mod extensions;
pub mod hooks;
mod logging;
pub mod memory;
pub mod menu;
pub mod orchestration;
pub mod persona;
pub mod persistence;
pub mod plugins;
pub mod providers;
pub mod remote;
pub mod routing;
mod terminal;
pub mod tools;
pub mod tray;
pub mod workspaces;
pub mod workspace_reviews;
pub mod wrappers;
mod runtime;

use std::sync::Arc;

use tauri::Manager;
use tracing::{error, info};

pub use runtime::{
    start_runtime, BootstrapSession, EventEnvelope, LaunchContext, RuntimeConfig, RuntimeHandle,
};

struct DesktopRuntimeState {
    runtime: Arc<RuntimeHandle>,
}

mod commands {
    use super::{DesktopRuntimeState, LaunchContext};

    #[tauri::command]
    pub fn desktop_launch_context(state: tauri::State<'_, DesktopRuntimeState>) -> LaunchContext {
        state.runtime.launch_context().clone()
    }
}

pub fn run() {
    logging::init_logging();

    if let Err(error) = run_app() {
        error!(event = "desktop_startup_failed", error = %error);
        eprintln!("failed to start Lunaria desktop: {error}");
        std::process::exit(1);
    }
}

fn run_app() -> anyhow::Result<()> {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                if let Err(e) = window.show() {
                    error!(event = "single_instance_show_failed", error = %e);
                }
                if let Err(e) = window.set_focus() {
                    error!(event = "single_instance_focus_failed", error = %e);
                }
            }
        }))
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_stronghold::Builder::new(|password| {
            use sha2::Digest;
            let mut hasher = sha2::Sha256::new();
            hasher.update(password);
            hasher.finalize().to_vec()
        }).build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let app_handle = app.handle();

            // System tray
            if let Err(e) = tray::setup_tray(app_handle) {
                error!(event = "tray_setup_failed", error = %e);
            }

            // Native menu bar
            match menu::build_menu(app_handle) {
                Ok(menu) => {
                    if let Err(e) = app.set_menu(menu) {
                        error!(event = "menu_set_failed", error = %e);
                    }
                }
                Err(e) => {
                    error!(event = "menu_build_failed", error = %e);
                }
            }

            let runtime = tauri::async_runtime::block_on(start_runtime(RuntimeConfig::default()))?;
            let launch_context = runtime.launch_context().clone();

            info!(
                event = "desktop_runtime_ready",
                api_base_url = %launch_context.api_base_url,
                bootstrap_path = %launch_context.bootstrap_path,
                instance_id = %launch_context.instance_id
            );

            app.manage(DesktopRuntimeState {
                runtime: Arc::new(runtime),
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Hide to tray on close instead of quitting
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    if let Err(e) = window.hide() {
                        error!(event = "window_hide_failed", error = %e);
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![commands::desktop_launch_context])
        .build(tauri::generate_context!())?
        .run(|app_handle, event| {
            if matches!(
                event,
                tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit
            ) {
                let state = app_handle.state::<DesktopRuntimeState>();
                if let Err(error) = tauri::async_runtime::block_on(state.runtime.shutdown()) {
                    error!(event = "desktop_runtime_shutdown_failed", error = %error);
                } else {
                    info!(event = "desktop_runtime_shutdown_complete");
                }
            }
        });

    Ok(())
}
