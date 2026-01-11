use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub id: String,
    pub project_path: String,
    pub timestamp: String,
    pub first_message: String,
    pub message_count: u32,
    pub custom_name: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SessionMessage {
    role: String,
    content: Vec<MessageContent>,
}

#[derive(Debug, Deserialize)]
struct MessageContent {
    #[serde(rename = "type")]
    content_type: String,
    text: Option<String>,
}

/// Get the Claude projects directory
fn get_claude_projects_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    Ok(home.join(".claude").join("projects"))
}

/// Encode project path to Claude's format (dash-separated)
/// Claude Code uses paths like: -Users-jneaimimacmini-dev-apps-offers
fn encode_project_path(path: &str) -> String {
    // Replace path separators with dashes, keep leading dash
    path.replace('/', "-")
}

/// Find the project directory for a given project path
fn find_project_dir(project_path: &str) -> Result<PathBuf, String> {
    let projects_dir = get_claude_projects_dir()?;
    let encoded = encode_project_path(project_path);

    let project_dir = projects_dir.join(&encoded);
    if project_dir.exists() {
        Ok(project_dir)
    } else {
        Err(format!("Project directory not found: {}", project_dir.display()))
    }
}

/// Summary entry in JSONL file
#[derive(Debug, Deserialize)]
struct SummaryEntry {
    #[serde(rename = "type")]
    entry_type: String,
    summary: Option<String>,
}

/// User message entry in JSONL file (type: "user" with message.content)
#[derive(Debug, Deserialize)]
struct UserMessageEntry {
    #[serde(rename = "type")]
    entry_type: String,
    message: Option<MessageWrapper>,
    #[serde(rename = "isMeta")]
    is_meta: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct MessageWrapper {
    role: Option<String>,
    content: Option<String>,
}

/// Parse a session JSONL file (optimized to only read first 50 lines)
fn parse_session_file(path: &Path) -> Result<SessionInfo, String> {
    use std::io::{BufRead, BufReader};

    let file = fs::File::open(path)
        .map_err(|e| format!("Failed to open session file: {}", e))?;
    let reader = BufReader::new(file);

    let mut first_preview = String::from("(no preview)");
    let mut message_count = 0u32;
    let max_lines_to_scan = 50; // Only scan first 50 lines for preview

    // Parse JSONL (one JSON object per line) - only first N lines
    for line_result in reader.lines().take(max_lines_to_scan) {
        let line = match line_result {
            Ok(l) => l,
            Err(_) => continue,
        };

        if line.trim().is_empty() {
            continue;
        }

        message_count += 1;

        // Try to get first preview text
        if first_preview == "(no preview)" {
            // Try parsing as summary entry first
            if let Ok(entry) = serde_json::from_str::<SummaryEntry>(&line) {
                if entry.entry_type == "summary" {
                    if let Some(summary) = entry.summary {
                        first_preview = if summary.len() > 100 {
                            format!("{}...", &summary[..100])
                        } else {
                            summary
                        };
                        // Found preview, can stop scanning for it
                        continue;
                    }
                }
            }

            // Try parsing as user message entry (type: "user" with message.content)
            if let Ok(entry) = serde_json::from_str::<UserMessageEntry>(&line) {
                // Skip meta messages and non-user entries
                if entry.entry_type == "user" && entry.is_meta != Some(true) {
                    if let Some(msg) = entry.message {
                        if msg.role == Some("user".to_string()) {
                            if let Some(text) = msg.content {
                                // Skip XML command messages (start with <)
                                if !text.starts_with('<') && !text.is_empty() {
                                    first_preview = if text.len() > 100 {
                                        format!("{}...", &text[..100])
                                    } else {
                                        text
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Get approximate message count from file size (avoid reading entire file)
    // Estimate ~500 bytes per message on average
    if let Ok(metadata) = path.metadata() {
        let file_size = metadata.len();
        message_count = std::cmp::max(message_count, (file_size / 500) as u32);
    }

    // Extract metadata from filename (UUID.jsonl format)
    let filename = path.file_name()
        .and_then(|s| s.to_str())
        .ok_or("Invalid filename")?;

    let id = filename.replace(".jsonl", "");

    // Get timestamp from file metadata
    let timestamp = path.metadata()
        .and_then(|m| m.modified())
        .map(|t| {
            let datetime: chrono::DateTime<chrono::Local> = t.into();
            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        })
        .unwrap_or_else(|_| "unknown".to_string());

    let project_path = path.parent()
        .and_then(|p| p.to_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(SessionInfo {
        id,
        project_path,
        timestamp,
        first_message: first_preview,
        message_count,
        custom_name: None,
    })
}

/// List all sessions for a project
pub fn list_sessions(project_path: &str) -> Result<Vec<SessionInfo>, String> {
    let project_dir = find_project_dir(project_path)?;

    let mut sessions = Vec::new();

    // Read all .jsonl files in the project directory
    let entries = fs::read_dir(&project_dir)
        .map_err(|e| format!("Failed to read project directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        // Only process .jsonl files (session files are UUID.jsonl)
        if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
            if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
                match parse_session_file(&path) {
                    Ok(info) => sessions.push(info),
                    Err(e) => eprintln!("Failed to parse session {}: {}", filename, e),
                }
            }
        }
    }

    // Sort by timestamp (newest first)
    sessions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    Ok(sessions)
}

/// Get custom session names from persistent storage
fn get_session_names_file() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    Ok(home.join(".claude").join("genimage-studio-session-names.json"))
}

/// Load custom session names
pub fn get_session_names() -> Result<HashMap<String, String>, String> {
    let names_file = get_session_names_file()?;

    if !names_file.exists() {
        return Ok(HashMap::new());
    }

    let content = fs::read_to_string(&names_file)
        .map_err(|e| format!("Failed to read session names: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse session names: {}", e))
}

/// Save a custom session name
pub fn set_session_name(session_id: &str, name: &str) -> Result<(), String> {
    let names_file = get_session_names_file()?;

    // Load existing names
    let mut names = get_session_names().unwrap_or_default();

    // Update
    names.insert(session_id.to_string(), name.to_string());

    // Save
    let content = serde_json::to_string_pretty(&names)
        .map_err(|e| format!("Failed to serialize session names: {}", e))?;

    // Ensure parent directory exists
    if let Some(parent) = names_file.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(&names_file, content)
        .map_err(|e| format!("Failed to write session names: {}", e))?;

    Ok(())
}

/// Get first few messages from a session (for preview)
pub fn get_session_preview(project_path: &str, session_id: &str) -> Result<Vec<String>, String> {
    let project_dir = find_project_dir(project_path)?;
    let session_file = project_dir.join(format!("{}.jsonl", session_id));

    if !session_file.exists() {
        return Err(format!("Session file not found: {}", session_id));
    }

    let content = fs::read_to_string(&session_file)
        .map_err(|e| format!("Failed to read session file: {}", e))?;

    let mut messages = Vec::new();
    let max_preview = 5;

    for line in content.lines().take(max_preview) {
        if line.trim().is_empty() {
            continue;
        }

        if let Ok(msg) = serde_json::from_str::<SessionMessage>(line) {
            for content_item in msg.content {
                if content_item.content_type == "text" {
                    if let Some(text) = content_item.text {
                        messages.push(format!("{}: {}", msg.role, text));
                    }
                }
            }
        }
    }

    Ok(messages)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_project_path() {
        let path = "/Users/test/dev/apps/offers";
        let encoded = encode_project_path(path);
        // Should be dash-separated
        assert_eq!(encoded, "-Users-test-dev-apps-offers");
    }
}
