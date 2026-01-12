//! First-run setup module for GenImage Studio
//! Handles copying bundled resources and API key configuration

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Manager, State};

/// Global state for the selected project path
pub struct ProjectPathState(pub Mutex<Option<String>>);

impl ProjectPathState {
    pub fn new() -> Self {
        Self(Mutex::new(None))
    }

    pub fn get(&self) -> Option<String> {
        self.0.lock().unwrap().clone()
    }

    pub fn set(&self, path: String) {
        *self.0.lock().unwrap() = Some(path);
    }
}

#[derive(Debug, Serialize)]
pub struct SetupStatus {
    pub is_complete: bool,
    pub has_claude_md: bool,
    pub has_generate_script: bool,
    pub has_env_file: bool,
    pub has_api_key: bool,
    pub has_claude_config: bool,
    pub project_path: String,
}

/// Get the standard project path for this platform
/// macOS/Linux: ~/Documents/GenImage Studio/
/// Windows: %USERPROFILE%\Documents\GenImage Studio\
#[tauri::command]
pub fn get_standard_project_path() -> Result<String, String> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| "Could not find home directory".to_string())?;

    let documents_dir = home_dir.join("Documents");
    let project_dir = documents_dir.join("GenImage Studio");

    Ok(project_dir.to_string_lossy().to_string())
}

/// Initialize the standard project directory
/// Creates the directory if it doesn't exist and returns the path
#[tauri::command]
pub fn init_standard_project_path() -> Result<String, String> {
    let project_path = get_standard_project_path()?;
    let path = PathBuf::from(&project_path);

    // Create the directory if it doesn't exist
    if !path.exists() {
        fs::create_dir_all(&path)
            .map_err(|e| format!("Failed to create project directory: {}", e))?;
    }

    Ok(project_path)
}

/// Check if UV (Python package manager) is installed
#[tauri::command]
pub fn check_uv_installed() -> Result<bool, String> {
    let output = Command::new("uv")
        .arg("--version")
        .output();

    match output {
        Ok(out) => Ok(out.status.success()),
        Err(_) => Ok(false),
    }
}

/// Get UV version if installed
#[tauri::command]
pub fn get_uv_version() -> Result<Option<String>, String> {
    let output = Command::new("uv")
        .arg("--version")
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let version = String::from_utf8_lossy(&out.stdout).trim().to_string();
            Ok(Some(version))
        }
        _ => Ok(None),
    }
}

/// Install UV using the official installer
/// On macOS/Linux: Uses curl to download and run the install script
/// On Windows: Uses PowerShell to download and run the install script
#[tauri::command]
pub fn install_uv() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        // Windows: Use PowerShell
        let output = Command::new("powershell")
            .args([
                "-ExecutionPolicy", "ByPass",
                "-Command",
                "irm https://astral.sh/uv/install.ps1 | iex"
            ])
            .output()
            .map_err(|e| format!("Failed to run PowerShell: {}", e))?;

        if output.status.success() {
            Ok("UV installed successfully. You may need to restart the terminal.".to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("UV installation failed: {}", stderr))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // macOS/Linux: Use curl and sh
        let output = Command::new("sh")
            .args([
                "-c",
                "curl -LsSf https://astral.sh/uv/install.sh | sh"
            ])
            .output()
            .map_err(|e| format!("Failed to run installer: {}", e))?;

        if output.status.success() {
            // Source the shell profile to make uv available immediately
            Ok("UV installed successfully. You may need to restart the terminal or run: source ~/.local/bin/env".to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("UV installation failed: {}", stderr))
        }
    }
}

/// Get the project path - either from parameter, state, or current directory
fn resolve_project_path(
    project_path: Option<String>,
    state: Option<&State<ProjectPathState>>,
) -> Result<PathBuf, String> {
    // Priority: parameter > state > current directory
    if let Some(path) = project_path {
        return Ok(PathBuf::from(path));
    }

    if let Some(state) = state {
        if let Some(path) = state.get() {
            return Ok(PathBuf::from(path));
        }
    }

    std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))
}

/// Check if the project setup is complete
#[tauri::command]
pub fn check_setup(
    project_path: Option<String>,
    state: State<ProjectPathState>,
) -> Result<SetupStatus, String> {
    let cwd = resolve_project_path(project_path, Some(&state))?;

    let claude_md = cwd.join("CLAUDE.md");
    let generate_script = cwd.join("generate-image.py");
    let env_file = cwd.join(".env");
    let claude_config = cwd.join(".claude");

    let has_claude_md = claude_md.exists();
    let has_generate_script = generate_script.exists();
    let has_env_file = env_file.exists();
    let has_claude_config = claude_config.exists() && claude_config.is_dir();

    // Check if .env has a valid API key
    let has_api_key = if has_env_file {
        fs::read_to_string(&env_file)
            .map(|content| {
                content.contains("GOOGLE_API_KEY=") &&
                !content.contains("GOOGLE_API_KEY=your_") &&
                !content.contains("GOOGLE_API_KEY=\"\"") &&
                !content.contains("GOOGLE_API_KEY=''")
            })
            .unwrap_or(false)
    } else {
        false
    };

    let is_complete = has_claude_md && has_generate_script && has_api_key && has_claude_config;

    Ok(SetupStatus {
        is_complete,
        has_claude_md,
        has_generate_script,
        has_env_file,
        has_api_key,
        has_claude_config,
        project_path: cwd.to_string_lossy().to_string(),
    })
}

/// Set the project path
#[tauri::command]
pub fn set_project_path(
    project_path: String,
    state: State<ProjectPathState>,
) -> Result<(), String> {
    let path = PathBuf::from(&project_path);

    // Verify the path exists and is a directory
    if !path.exists() {
        return Err(format!("Path does not exist: {}", project_path));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", project_path));
    }

    state.set(project_path);
    Ok(())
}

/// Get the current project path
#[tauri::command]
pub fn get_project_path(state: State<ProjectPathState>) -> Result<String, String> {
    state.get().ok_or_else(|| "No project path set".to_string())
}

/// Copy bundled resources to the project directory
#[tauri::command]
pub fn copy_bundled_resources(
    app: AppHandle,
    project_path: Option<String>,
    state: State<ProjectPathState>,
) -> Result<(), String> {
    let cwd = resolve_project_path(project_path, Some(&state))?;

    // Get the path to bundled resources
    // Try multiple locations: resource_dir (production) and dev paths

    // Primary: Tauri's resource_dir (production apps)
    // On macOS: GenImage Studio.app/Contents/Resources/bundled-resources
    // On Windows: {exe_dir}/bundled-resources
    // On Linux: {exe_dir}/bundled-resources
    let resource_dir = app.path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;
    let resource_path = resource_dir.join("bundled-resources");

    // Dev mode: relative to current working directory (src-tauri)
    let dev_resource_path = std::env::current_dir()
        .map(|p| p.join("../bundled-resources"))
        .unwrap_or_default();

    // macOS bundle fallback: Resources directory relative to executable
    // Executable is at: App.app/Contents/MacOS/app-name
    // Resources are at: App.app/Contents/Resources/bundled-resources
    let macos_resource_path = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.join("../Resources/bundled-resources")))
        .unwrap_or_default();

    // Log paths for debugging
    eprintln!("Looking for bundled resources:");
    eprintln!("  - resource_dir: {:?} (exists: {})", resource_path, resource_path.exists());
    eprintln!("  - dev_path: {:?} (exists: {})", dev_resource_path, dev_resource_path.exists());
    eprintln!("  - macos_path: {:?} (exists: {})", macos_resource_path, macos_resource_path.exists());

    let final_resource_path = if resource_path.exists() {
        eprintln!("Using resource_dir path");
        resource_path
    } else if dev_resource_path.exists() {
        eprintln!("Using dev path");
        dev_resource_path
    } else if macos_resource_path.exists() {
        eprintln!("Using macOS bundle path");
        macos_resource_path
    } else {
        return Err(format!(
            "Bundled resources not found. Checked:\n- {:?}\n- {:?}\n- {:?}\nPlease reinstall the application.",
            resource_path, dev_resource_path, macos_resource_path
        ));
    };

    let resource_path = final_resource_path;

    // Copy CLAUDE.md if it doesn't exist
    let claude_md_src = resource_path.join("CLAUDE.md");
    let claude_md_dst = cwd.join("CLAUDE.md");
    if !claude_md_dst.exists() && claude_md_src.exists() {
        fs::copy(&claude_md_src, &claude_md_dst)
            .map_err(|e| format!("Failed to copy CLAUDE.md: {}", e))?;
    }

    // Copy generate-image.py if it doesn't exist
    let script_src = resource_path.join("generate-image.py");
    let script_dst = cwd.join("generate-image.py");
    if !script_dst.exists() && script_src.exists() {
        fs::copy(&script_src, &script_dst)
            .map_err(|e| format!("Failed to copy generate-image.py: {}", e))?;
    }

    // Copy .env.example if .env doesn't exist
    let env_example_src = resource_path.join(".env.example");
    let env_dst = cwd.join(".env");
    if !env_dst.exists() && env_example_src.exists() {
        fs::copy(&env_example_src, &env_dst)
            .map_err(|e| format!("Failed to copy .env.example: {}", e))?;
    }

    // Copy .claude directory recursively
    let claude_src = resource_path.join(".claude");
    let claude_dst = cwd.join(".claude");
    if claude_src.exists() {
        copy_dir_recursive(&claude_src, &claude_dst)
            .map_err(|e| format!("Failed to copy .claude directory: {}", e))?;
    }

    // Create generated_images directory if it doesn't exist
    let images_dir = cwd.join("generated_images");
    if !images_dir.exists() {
        fs::create_dir_all(&images_dir)
            .map_err(|e| format!("Failed to create generated_images directory: {}", e))?;
    }

    Ok(())
}

/// Save the API key to .env file
#[tauri::command]
pub fn save_api_key(
    api_key: String,
    project_path: Option<String>,
    state: State<ProjectPathState>,
) -> Result<(), String> {
    let cwd = resolve_project_path(project_path, Some(&state))?;
    let env_path = cwd.join(".env");

    // Read existing content or start fresh
    let mut content = if env_path.exists() {
        fs::read_to_string(&env_path).unwrap_or_default()
    } else {
        String::new()
    };

    // Update or add GOOGLE_API_KEY
    if content.contains("GOOGLE_API_KEY=") {
        // Replace existing key
        let lines: Vec<&str> = content.lines().collect();
        let new_lines: Vec<String> = lines
            .iter()
            .map(|line| {
                if line.starts_with("GOOGLE_API_KEY=") {
                    format!("GOOGLE_API_KEY={}", api_key)
                } else {
                    line.to_string()
                }
            })
            .collect();
        content = new_lines.join("\n");
    } else {
        // Add new key
        if !content.is_empty() && !content.ends_with('\n') {
            content.push('\n');
        }
        content.push_str(&format!("GOOGLE_API_KEY={}\n", api_key));
    }

    fs::write(&env_path, content)
        .map_err(|e| format!("Failed to write .env file: {}", e))?;

    Ok(())
}

/// Recursively copy a directory
fn copy_dir_recursive(src: &Path, dst: &Path) -> std::io::Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let dest_path = dst.join(entry.file_name());

        if path.is_dir() {
            copy_dir_recursive(&path, &dest_path)?;
        } else {
            // Only copy if destination doesn't exist (don't overwrite user files)
            if !dest_path.exists() {
                fs::copy(&path, &dest_path)?;
            }
        }
    }

    Ok(())
}
