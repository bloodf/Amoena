use std::path::{Path, PathBuf};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RuntimePaths {
    pub state_root: PathBuf,
    pub global_config_path: PathBuf,
    pub tui_root: PathBuf,
    pub providers_root: PathBuf,
    pub sessions_root: PathBuf,
}

impl RuntimePaths {
    pub fn new(state_root: PathBuf) -> Self {
        Self {
            global_config_path: state_root.join("config.json"),
            tui_root: state_root.join("tui"),
            providers_root: state_root.join("providers"),
            sessions_root: state_root.join("sessions"),
            state_root,
        }
    }

    pub fn from_database_path(database_path: &Path) -> Self {
        let state_root = database_path
            .parent()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| {
                std::env::current_dir().expect("current_dir should resolve for runtime paths")
            });

        Self::new(state_root)
    }

    pub fn tui_config_path(&self, tui: &str) -> PathBuf {
        self.tui_root.join(tui).join("config.json")
    }

    pub fn provider_auth_config_path(&self, provider_id: &str) -> PathBuf {
        self.providers_root.join(format!("{provider_id}.json"))
    }

    pub fn project_config_path(&self, working_dir: &Path) -> PathBuf {
        working_dir.join("lunaria.json")
    }
}
