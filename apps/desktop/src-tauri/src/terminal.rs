use std::{
    collections::HashMap,
    io::{Read, Write},
    path::PathBuf,
    sync::{Arc, Mutex},
    thread,
};

use anyhow::{anyhow, Context, Result};
use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use serde::Serialize;
use tokio::task;
use uuid::Uuid;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSessionCreated {
    pub terminal_session_id: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalOutputEvent {
    pub event_id: i64,
    pub data: String,
    pub stream: String,
}

#[derive(Clone)]
pub struct RemoteTerminalManager {
    sessions: Arc<Mutex<HashMap<String, Arc<TerminalSession>>>>,
}

struct TerminalSession {
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    child: Arc<Mutex<Box<dyn portable_pty::Child + Send>>>,
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    events: Arc<Mutex<Vec<TerminalOutputEvent>>>,
    next_event_id: Arc<Mutex<i64>>,
}

impl RemoteTerminalManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn create(
        &self,
        shell: Option<String>,
        cwd: Option<String>,
        cols: Option<u16>,
        rows: Option<u16>,
    ) -> Result<TerminalSessionCreated> {
        let shell = shell.unwrap_or_else(|| "/bin/sh".to_string());
        let pty_system = native_pty_system();
        let pty_pair = pty_system
            .openpty(pty_size(cols, rows))
            .context("failed to open pty")?;

        let mut command = CommandBuilder::new(shell);
        if let Some(cwd) = cwd {
            command.cwd(PathBuf::from(cwd));
        }

        let child = pty_pair
            .slave
            .spawn_command(command)
            .context("failed to spawn remote terminal")?;
        let reader = pty_pair
            .master
            .try_clone_reader()
            .context("failed to clone pty reader")?;
        let writer = pty_pair
            .master
            .take_writer()
            .context("failed to take pty writer")?;

        let session_id = Uuid::new_v4().to_string();
        let session = Arc::new(TerminalSession {
            writer: Arc::new(Mutex::new(writer)),
            child: Arc::new(Mutex::new(child)),
            master: Arc::new(Mutex::new(pty_pair.master)),
            events: Arc::new(Mutex::new(Vec::new())),
            next_event_id: Arc::new(Mutex::new(1)),
        });

        self.sessions
            .lock()
            .expect("terminal session registry poisoned")
            .insert(session_id.clone(), session.clone());

        spawn_reader(reader, "stdout", session.events.clone(), session.next_event_id.clone());

        Ok(TerminalSessionCreated {
            terminal_session_id: session_id,
        })
    }

    pub async fn input(&self, session_id: &str, data: &str) -> Result<()> {
        let session = self
            .sessions
            .lock()
            .expect("terminal session registry poisoned")
            .get(session_id)
            .cloned()
            .ok_or_else(|| anyhow!("terminal session not found"))?;
        let bytes = data.as_bytes().to_vec();

        task::spawn_blocking(move || -> Result<()> {
            let mut writer = session.writer.lock().expect("terminal writer mutex poisoned");
            writer
                .write_all(&bytes)
                .context("failed to write remote terminal input")?;
            writer
                .flush()
                .context("failed to flush remote terminal input")?;
            Ok(())
        })
        .await
        .context("terminal input task failed")??;

        Ok(())
    }

    pub fn events_since(&self, session_id: &str, last_event_id: Option<i64>) -> Result<Vec<TerminalOutputEvent>> {
        let session = self
            .sessions
            .lock()
            .expect("terminal session registry poisoned")
            .get(session_id)
            .cloned()
            .ok_or_else(|| anyhow!("terminal session not found"))?;
        let events = session.events.lock().expect("terminal event history poisoned");
        Ok(events
            .iter()
            .filter(|event| event.event_id > last_event_id.unwrap_or(0))
            .cloned()
            .collect())
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<()> {
        let session = self
            .sessions
            .lock()
            .expect("terminal session registry poisoned")
            .get(session_id)
            .cloned()
            .ok_or_else(|| anyhow!("terminal session not found"))?;
        let master = session.master.lock().expect("terminal pty mutex poisoned");
        master
            .resize(pty_size(Some(cols), Some(rows)))
            .context("failed to resize remote terminal")
    }

    pub async fn close(&self, session_id: &str) -> Result<()> {
        let session = self
            .sessions
            .lock()
            .expect("terminal session registry poisoned")
            .remove(session_id)
            .ok_or_else(|| anyhow!("terminal session not found"))?;

        task::spawn_blocking(move || -> Result<()> {
            let mut child = session.child.lock().expect("terminal child mutex poisoned");
            child.kill().context("failed to kill remote terminal")?;
            Ok(())
        })
        .await
        .context("terminal close task failed")??;

        Ok(())
    }
}

fn pty_size(cols: Option<u16>, rows: Option<u16>) -> PtySize {
    PtySize {
        cols: cols.unwrap_or(80).max(1),
        rows: rows.unwrap_or(24).max(1),
        pixel_width: 0,
        pixel_height: 0,
    }
}

fn spawn_reader<R>(
    mut reader: R,
    stream_name: &'static str,
    events: Arc<Mutex<Vec<TerminalOutputEvent>>>,
    next_event_id: Arc<Mutex<i64>>,
) where
    R: Read + Send + 'static,
{
    thread::spawn(move || {
        let mut buffer = [0u8; 1024];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(bytes_read) => {
                    let data = String::from_utf8_lossy(&buffer[..bytes_read]).to_string();
                    let mut event_id = next_event_id.lock().expect("terminal event id mutex poisoned");
                    let current_id = *event_id;
                    *event_id += 1;
                    drop(event_id);

                    events
                        .lock()
                        .expect("terminal event history poisoned")
                        .push(TerminalOutputEvent {
                            event_id: current_id,
                            data,
                            stream: stream_name.to_string(),
                        });
                }
                Err(_) => break,
            }
        }
    });
}
