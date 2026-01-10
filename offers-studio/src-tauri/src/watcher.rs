use notify::{Watcher, RecursiveMode, Result, Event, EventKind};
use std::path::Path;
use std::sync::Arc;
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter};

pub struct WatcherState {
    watcher: Arc<Mutex<Option<notify::RecommendedWatcher>>>,
}

impl WatcherState {
    pub fn new() -> Self {
        Self {
            watcher: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start(&self, app: &AppHandle, path: &str) -> Result<()> {
        let images_path = Path::new(path).join("generated_images");
        let app_handle = app.clone();

        let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
            if let Ok(event) = res {
                if let EventKind::Create(_) = event.kind {
                    for path in event.paths {
                        if let Some(ext) = path.extension() {
                            let ext_lower = ext.to_string_lossy().to_lowercase();
                            if matches!(ext_lower.as_str(), "png" | "jpg" | "jpeg") {
                                let path_str = path.to_string_lossy().to_string();
                                let _ = app_handle.emit("new-image", &path_str);
                            }
                        }
                    }
                }
            }
        })?;

        watcher.watch(&images_path, RecursiveMode::NonRecursive)?;

        let mut guard = self.watcher.lock();
        *guard = Some(watcher);

        Ok(())
    }

    pub fn stop(&self) {
        let mut guard = self.watcher.lock();
        *guard = None;
    }
}
