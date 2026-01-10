use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

type PtyId = String;

/// Find the last position in a byte slice that ends on a valid UTF-8 boundary.
/// This prevents splitting multi-byte UTF-8 characters across emissions.
fn find_utf8_boundary(bytes: &[u8]) -> usize {
    let len = bytes.len();
    if len == 0 {
        return 0;
    }

    // Start from the end and look for the start of a potentially incomplete character
    for i in (0..len).rev() {
        let byte = bytes[i];

        // ASCII or start of a multi-byte sequence
        if byte < 0x80 {
            // ASCII byte - valid boundary after this
            return i + 1;
        } else if byte >= 0xC0 {
            // Start of a multi-byte sequence (110xxxxx, 1110xxxx, 11110xxx)
            let expected_len = if byte >= 0xF0 {
                4
            } else if byte >= 0xE0 {
                3
            } else {
                2
            };

            let remaining = len - i;
            if remaining >= expected_len {
                // Complete character - boundary is after it
                return i + expected_len;
            } else {
                // Incomplete character - boundary is before it
                return i;
            }
        }
        // Continuation byte (10xxxxxx) - keep looking backwards
    }

    // All continuation bytes or empty - return 0
    0
}

pub struct PtyManager {
    ptys: Arc<Mutex<HashMap<PtyId, PtyHandle>>>,
}

struct PtyHandle {
    #[allow(dead_code)]
    master: Box<dyn portable_pty::MasterPty + Send>,
    writer: Box<dyn Write + Send>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            ptys: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn spawn(
        &self,
        app: AppHandle,
        command: String,
        args: Vec<String>,
        cwd: String,
        cols: u16,
        rows: u16,
    ) -> Result<PtyId, String> {
        let pty_system = native_pty_system();

        // Create PTY with specified dimensions
        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        // Build command
        let mut cmd = CommandBuilder::new(command);
        cmd.args(args);
        cmd.cwd(cwd);

        // Set terminal environment variables for proper escape sequence handling
        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");
        cmd.env("LANG", "en_US.UTF-8");

        // Spawn the child process
        let mut child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {}", e))?;

        // Get reader and writer
        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {}", e))?;
        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {}", e))?;

        // Generate unique ID
        let pty_id = uuid::Uuid::new_v4().to_string();
        let pty_id_clone = pty_id.clone();

        // Store PTY handle
        {
            let mut ptys = self.ptys.lock().unwrap();
            ptys.insert(
                pty_id.clone(),
                PtyHandle {
                    master: pair.master,
                    writer,
                },
            );
        }

        // Spawn thread to read PTY output and emit events
        let app_clone = app.clone();
        thread::spawn(move || {
            let mut buf = [0u8; 8192];
            let mut pending_bytes: Vec<u8> = Vec::new();

            loop {
                match reader.read(&mut buf) {
                    Ok(0) => {
                        // EOF - flush any remaining bytes and exit
                        if !pending_bytes.is_empty() {
                            let data = String::from_utf8_lossy(&pending_bytes).to_string();
                            let _ = app_clone.emit(&format!("pty-data:{}", pty_id_clone), data);
                        }
                        let _ = app_clone.emit(&format!("pty-exit:{}", pty_id_clone), ());
                        break;
                    }
                    Ok(n) => {
                        // Append new data to pending bytes
                        pending_bytes.extend_from_slice(&buf[..n]);

                        // Find the last valid UTF-8 boundary
                        let valid_up_to = find_utf8_boundary(&pending_bytes);

                        if valid_up_to > 0 {
                            // Extract valid UTF-8 portion and emit
                            let valid_bytes: Vec<u8> = pending_bytes.drain(..valid_up_to).collect();
                            if let Ok(data) = String::from_utf8(valid_bytes) {
                                let _ = app_clone.emit(&format!("pty-data:{}", pty_id_clone), data);
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("PTY read error: {}", e);
                        break;
                    }
                }
            }
        });

        // Spawn thread to monitor child process
        thread::spawn(move || {
            let _ = child.wait();
        });

        Ok(pty_id)
    }

    pub fn write(&self, pty_id: &str, data: &str) -> Result<(), String> {
        let mut ptys = self.ptys.lock().unwrap();
        if let Some(pty) = ptys.get_mut(pty_id) {
            pty.writer
                .write_all(data.as_bytes())
                .map_err(|e| format!("Failed to write to PTY: {}", e))?;
            pty.writer
                .flush()
                .map_err(|e| format!("Failed to flush PTY: {}", e))?;
            Ok(())
        } else {
            Err(format!("PTY not found: {}", pty_id))
        }
    }

    pub fn resize(&self, pty_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let ptys = self.ptys.lock().unwrap();
        if let Some(pty) = ptys.get(pty_id) {
            pty.master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| format!("Failed to resize PTY: {}", e))?;
            Ok(())
        } else {
            Err(format!("PTY not found: {}", pty_id))
        }
    }

    pub fn kill(&self, pty_id: &str) -> Result<(), String> {
        let mut ptys = self.ptys.lock().unwrap();
        if ptys.remove(pty_id).is_some() {
            Ok(())
        } else {
            Err(format!("PTY not found: {}", pty_id))
        }
    }
}
