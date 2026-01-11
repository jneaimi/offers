use notify::{Watcher, RecursiveMode, Result, Event, EventKind};
use std::path::PathBuf;
use std::sync::Arc;
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter};
use serde::{Serialize, Deserialize};
use std::fs;
use md5;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextUsage {
    #[serde(default)]
    pub total_input_tokens: u64,
    #[serde(default)]
    pub total_output_tokens: u64,
    #[serde(default)]
    pub context_window_size: u64,
    #[serde(default)]
    pub percentage: f64,
    #[serde(default)]
    pub current_input: u64,
    #[serde(default)]
    pub current_output: u64,
    #[serde(default)]
    pub cache_creation_tokens: u64,
    #[serde(default)]
    pub cache_read_tokens: u64,
}

/// Compute the context file path for a given project
/// Uses MD5 hash of project path (first 8 chars) to match the bash script
pub fn get_context_file_path(project_path: &str) -> PathBuf {
    let hash = md5::compute(project_path.as_bytes());
    let hash_str = format!("{:x}", hash);
    let short_hash = &hash_str[..8];
    PathBuf::from(format!("/tmp/genimage-studio-context-{}.json", short_hash))
}

pub struct ContextWatcherState {
    watcher: Arc<Mutex<Option<notify::RecommendedWatcher>>>,
    current_context: Arc<Mutex<Option<ContextUsage>>>,
    project_path: Arc<Mutex<Option<String>>>,
}

impl ContextWatcherState {
    pub fn new() -> Self {
        Self {
            watcher: Arc::new(Mutex::new(None)),
            current_context: Arc::new(Mutex::new(None)),
            project_path: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start(&self, app: &AppHandle, project_path: &str) -> Result<()> {
        // Store project path
        {
            let mut guard = self.project_path.lock();
            *guard = Some(project_path.to_string());
        }

        // Compute project-specific context file path
        let context_path = get_context_file_path(project_path);
        let context_filename = context_path.file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("genimage-studio-context.json")
            .to_string();

        eprintln!("Watching for context file: {:?}", context_path);

        let app_handle = app.clone();
        let current_context = Arc::clone(&self.current_context);

        let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
            if let Ok(event) = res {
                // React to any modify or create events
                match event.kind {
                    EventKind::Modify(_) | EventKind::Create(_) => {
                        for path in event.paths {
                            // Check if this is our project's context file
                            if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
                                if filename == context_filename {
                                    // Read and parse the JSON file
                                    if let Ok(content) = fs::read_to_string(&path) {
                                        if let Ok(context) = serde_json::from_str::<ContextUsage>(&content) {
                                            // Store current context
                                            let mut guard = current_context.lock();
                                            *guard = Some(context.clone());

                                            // Emit event to frontend
                                            let _ = app_handle.emit("context-updated", &context);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        })?;

        // Watch the parent directory since the file might not exist yet
        let watch_path = context_path.parent().unwrap_or(context_path.as_path());
        watcher.watch(watch_path, RecursiveMode::NonRecursive)?;

        let mut guard = self.watcher.lock();
        *guard = Some(watcher);

        Ok(())
    }

    pub fn stop(&self) {
        let mut guard = self.watcher.lock();
        *guard = None;
    }

    pub fn get_current(&self) -> Option<ContextUsage> {
        let guard = self.current_context.lock();
        guard.clone()
    }
}
