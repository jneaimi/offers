mod pty;
mod watcher;
mod context_watcher;
mod sessions;
mod setup;

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Manager, State};

#[derive(Debug, Serialize)]
struct ImageMetadata {
    prompt: Option<String>,
    model: Option<String>,
    timestamp: Option<String>,
    aspect_ratio: Option<String>,
    size: Option<String>,
    generation_time: Option<f64>,
    reference_images: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
struct ImageFile {
    path: String,
    filename: String,
    timestamp: String,
    metadata: Option<ImageMetadata>,
}

// Global PTY manager state
struct PtyState(Mutex<pty::PtyManager>);

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Get the current working directory (where the app was launched from)
#[tauri::command]
fn get_current_dir() -> Result<String, String> {
    std::env::current_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| format!("Failed to get current directory: {}", e))
}

#[tauri::command]
fn spawn_pty(
    app: AppHandle,
    state: State<PtyState>,
    command: String,
    args: Vec<String>,
    cwd: String,
    cols: u16,
    rows: u16,
) -> Result<String, String> {
    let manager = state.0.lock().unwrap();
    manager.spawn(app, command, args, cwd, cols, rows)
}

#[tauri::command]
fn write_pty(state: State<PtyState>, id: String, data: String) -> Result<(), String> {
    let manager = state.0.lock().unwrap();
    manager.write(&id, &data)
}

#[tauri::command]
fn resize_pty(state: State<PtyState>, id: String, cols: u16, rows: u16) -> Result<(), String> {
    let manager = state.0.lock().unwrap();
    manager.resize(&id, cols, rows)
}

#[tauri::command]
fn kill_pty(state: State<PtyState>, id: String) -> Result<(), String> {
    let manager = state.0.lock().unwrap();
    manager.kill(&id)
}

#[tauri::command]
fn start_watcher(
    app: AppHandle,
    state: State<watcher::WatcherState>,
    path: String,
) -> Result<(), String> {
    state.start(&app, &path).map_err(|e| e.to_string())
}

#[tauri::command]
fn stop_watcher(state: State<watcher::WatcherState>) {
    state.stop();
}

/// Get the path where the statusline script should be installed
fn get_statusline_script_path() -> Result<PathBuf, String> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| "Could not find home directory".to_string())?;

    let claude_dir = home_dir.join(".claude");
    Ok(claude_dir.join("statusline-genimage-studio.sh"))
}

/// Install the statusline script to ~/.claude/statusline-genimage-studio.sh
#[tauri::command]
fn install_statusline() -> Result<String, String> {
    let script_path = get_statusline_script_path()?;

    // Ensure .claude directory exists
    if let Some(parent) = script_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create .claude directory: {}", e))?;
    }

    // Write the statusline script
    let script_content = r#"#!/bin/bash
# Offers Studio Statusline Script
# This script is invoked by Claude Code to write context information
cat > /tmp/genimage-studio-context.json
"#;

    fs::write(&script_path, script_content)
        .map_err(|e| format!("Failed to write statusline script: {}", e))?;

    // Make the script executable on Unix systems
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&script_path)
            .map_err(|e| format!("Failed to read script metadata: {}", e))?
            .permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&script_path, perms)
            .map_err(|e| format!("Failed to set script permissions: {}", e))?;
    }

    Ok(script_path.to_string_lossy().to_string())
}

/// Check if the statusline script is installed and executable
#[tauri::command]
fn check_statusline() -> Result<bool, String> {
    let script_path = get_statusline_script_path()?;

    if !script_path.exists() {
        return Ok(false);
    }

    // Check if executable on Unix systems
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let metadata = fs::metadata(&script_path)
            .map_err(|e| format!("Failed to read script metadata: {}", e))?;
        let permissions = metadata.permissions();
        return Ok(permissions.mode() & 0o111 != 0);
    }

    #[cfg(not(unix))]
    {
        Ok(script_path.exists())
    }
}

/// Get the statusline script path for configuration
#[tauri::command]
fn get_statusline_path() -> Result<String, String> {
    let script_path = get_statusline_script_path()?;
    Ok(script_path.to_string_lossy().to_string())
}

/// Start watching the context file for changes
#[tauri::command]
fn start_context_watcher(
    app: AppHandle,
    state: State<context_watcher::ContextWatcherState>,
    project_path: String,
) -> Result<(), String> {
    state.start(&app, &project_path).map_err(|e| e.to_string())
}

/// Stop watching the context file
#[tauri::command]
fn stop_context_watcher(state: State<context_watcher::ContextWatcherState>) {
    state.stop();
}

/// Get the current context usage
#[tauri::command]
fn get_current_context(
    state: State<context_watcher::ContextWatcherState>,
) -> Option<context_watcher::ContextUsage> {
    state.get_current()
}

/// List all sessions for a project
#[tauri::command]
fn list_sessions(project_path: String) -> Result<Vec<sessions::SessionInfo>, String> {
    sessions::list_sessions(&project_path)
}

/// Get preview of first few messages from a session
#[tauri::command]
fn get_session_preview(project_path: String, session_id: String) -> Result<Vec<String>, String> {
    sessions::get_session_preview(&project_path, &session_id)
}

/// Get all custom session names
#[tauri::command]
fn get_session_names() -> Result<std::collections::HashMap<String, String>, String> {
    sessions::get_session_names()
}

/// Set a custom name for a session
#[tauri::command]
fn set_session_name(session_id: String, name: String) -> Result<(), String> {
    sessions::set_session_name(&session_id, &name)
}

#[tauri::command]
fn list_images(project_path: String) -> Result<Vec<ImageFile>, String> {
    let images_dir = Path::new(&project_path).join("generated_images");

    if !images_dir.exists() {
        // Return empty list if directory doesn't exist yet
        return Ok(Vec::new());
    }

    let mut images = Vec::new();

    let entries = fs::read_dir(&images_dir)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();

        // Only process PNG and JPG files
        if let Some(ext) = path.extension() {
            let ext_lower = ext.to_string_lossy().to_lowercase();
            if !matches!(ext_lower.as_str(), "png" | "jpg" | "jpeg") {
                continue;
            }
        } else {
            continue;
        }

        let filename = path.file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        // Get file modification time as timestamp
        let metadata = fs::metadata(&path)
            .map_err(|e| format!("Failed to read metadata: {}", e))?;

        let timestamp = metadata.modified()
            .map(|t| {
                let duration = t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default();
                chrono::DateTime::from_timestamp(duration.as_secs() as i64, 0)
                    .map(|dt| dt.to_rfc3339())
                    .unwrap_or_default()
            })
            .unwrap_or_default();

        // Try to load metadata from companion JSON file
        let json_path = path.with_extension("json");
        let image_metadata = if json_path.exists() {
            fs::read_to_string(&json_path)
                .ok()
                .and_then(|content| {
                    serde_json::from_str::<serde_json::Value>(&content).ok()
                })
                .map(|json| ImageMetadata {
                    prompt: json.get("prompt").and_then(|v| v.as_str()).map(String::from),
                    model: json.get("model").and_then(|v| v.as_str()).map(String::from),
                    timestamp: json.get("timestamp").and_then(|v| v.as_str()).map(String::from),
                    aspect_ratio: json.get("aspect_ratio").and_then(|v| v.as_str()).map(String::from),
                    size: json.get("size").and_then(|v| v.as_str()).map(String::from),
                    generation_time: json.get("generation_time").and_then(|v| v.as_f64()),
                    reference_images: json.get("reference_images")
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.iter()
                            .filter_map(|v| v.as_str().map(String::from))
                            .collect()),
                })
        } else {
            None
        };

        images.push(ImageFile {
            path: path.to_string_lossy().to_string(),
            filename,
            timestamp,
            metadata: image_metadata,
        });
    }

    Ok(images)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(PtyState(Mutex::new(pty::PtyManager::new())))
        .manage(watcher::WatcherState::new())
        .manage(context_watcher::ContextWatcherState::new())
        .manage(setup::ProjectPathState::new())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_current_dir,
            spawn_pty,
            write_pty,
            resize_pty,
            kill_pty,
            start_watcher,
            stop_watcher,
            list_images,
            install_statusline,
            check_statusline,
            get_statusline_path,
            start_context_watcher,
            stop_context_watcher,
            get_current_context,
            list_sessions,
            get_session_preview,
            get_session_names,
            set_session_name,
            setup::check_setup,
            setup::copy_bundled_resources,
            setup::save_api_key,
            setup::set_project_path,
            setup::get_project_path
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                if let Some(state) = window.try_state::<watcher::WatcherState>() {
                    state.stop();
                }
                if let Some(state) = window.try_state::<context_watcher::ContextWatcherState>() {
                    state.stop();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
