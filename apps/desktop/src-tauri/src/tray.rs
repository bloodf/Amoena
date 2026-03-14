use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Runtime,
};
use tracing::error;

pub fn setup_tray<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<()> {
    let show_item = MenuItem::with_id(app, "show", "Show Lunaria", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().cloned().unwrap())
        .menu(&menu)
        .tooltip("Lunaria")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(e) = window.show() {
                        error!(event = "tray_show_failed", error = %e);
                    }
                    if let Err(e) = window.set_focus() {
                        error!(event = "tray_focus_failed", error = %e);
                    }
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(e) = window.show() {
                        error!(event = "tray_click_show_failed", error = %e);
                    }
                    if let Err(e) = window.set_focus() {
                        error!(event = "tray_click_focus_failed", error = %e);
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
