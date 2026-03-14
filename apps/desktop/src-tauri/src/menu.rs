use tauri::{
    menu::{Menu, MenuItem, Submenu, PredefinedMenuItem},
    AppHandle, Runtime,
};

pub fn build_menu<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<Menu<R>> {
    // File menu
    let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(app, "file_new_session", "New Session", true, Some("CmdOrCtrl+N"))?,
            &MenuItem::with_id(app, "file_open_workspace", "Open Workspace…", true, Some("CmdOrCtrl+O"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "file_settings", "Settings", true, Some("CmdOrCtrl+,"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, None)?,
        ],
    )?;

    // Edit menu
    let edit_menu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(app, None)?,
            &PredefinedMenuItem::redo(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, None)?,
            &PredefinedMenuItem::copy(app, None)?,
            &PredefinedMenuItem::paste(app, None)?,
            &PredefinedMenuItem::select_all(app, None)?,
        ],
    )?;

    // View menu
    let view_menu = Submenu::with_items(
        app,
        "View",
        true,
        &[
            &MenuItem::with_id(app, "view_toggle_sidebar", "Toggle Sidebar", true, Some("CmdOrCtrl+B"))?,
            &MenuItem::with_id(app, "view_toggle_terminal", "Toggle Terminal", true, Some("CmdOrCtrl+`"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "view_zoom_in", "Zoom In", true, Some("CmdOrCtrl+="))?,
            &MenuItem::with_id(app, "view_zoom_out", "Zoom Out", true, Some("CmdOrCtrl+-"))?,
            &MenuItem::with_id(app, "view_zoom_reset", "Actual Size", true, Some("CmdOrCtrl+0"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::fullscreen(app, None)?,
        ],
    )?;

    // Tools menu
    let tools_menu = Submenu::with_items(
        app,
        "Tools",
        true,
        &[
            &MenuItem::with_id(app, "tools_extensions", "Extensions", true, Some("CmdOrCtrl+Shift+X"))?,
            &MenuItem::with_id(app, "tools_command_palette", "Command Palette…", true, Some("CmdOrCtrl+Shift+P"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "tools_check_updates", "Check for Updates…", true, None::<&str>)?,
        ],
    )?;

    // Help menu
    let help_menu = Submenu::with_items(
        app,
        "Help",
        true,
        &[
            &MenuItem::with_id(app, "help_docs", "Documentation", true, None::<&str>)?,
            &MenuItem::with_id(app, "help_github", "GitHub Repository", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "help_about", "About Lunaria", true, None::<&str>)?,
        ],
    )?;

    let menu = Menu::with_items(
        app,
        &[&file_menu, &edit_menu, &view_menu, &tools_menu, &help_menu],
    )?;

    Ok(menu)
}
