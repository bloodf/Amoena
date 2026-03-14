use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
    sync::Arc,
};

use anyhow::{Context, Result};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::persistence::{
    repositories::{clock::utc_now, workspaces::WorkspaceRepository},
    CloneType, Database, WorkspaceRecord, WorkspaceStatus,
};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum WorkspaceCapability {
    Cow,
    Worktree,
    Full,
}

#[derive(Clone, Debug)]
pub struct WorkspaceCreateRequest {
    pub project_path: PathBuf,
    pub agent_id: Option<String>,
    pub persona_name: Option<String>,
}

pub struct WorkspaceManager {
    repo: WorkspaceRepository,
    root: PathBuf,
}

impl WorkspaceManager {
    pub fn new(database: Arc<Database>, root: PathBuf) -> Self {
        Self {
            repo: WorkspaceRepository::new(database),
            root,
        }
    }

    pub fn detect_capability(&self, project_path: &Path) -> WorkspaceCapability {
        if cfg!(target_os = "macos") && supports_cow(project_path) {
            WorkspaceCapability::Cow
        } else if is_git_repository(project_path) {
            WorkspaceCapability::Worktree
        } else {
            WorkspaceCapability::Full
        }
    }

    pub fn create(&self, request: WorkspaceCreateRequest) -> Result<WorkspaceRecord> {
        fs::create_dir_all(&self.root)
            .with_context(|| format!("failed to create workspace root {}", self.root.display()))?;

        let capability = self.detect_capability(&request.project_path);
        let workspace_id = Uuid::new_v4().to_string();
        let clone_path = self.root.join(&workspace_id);
        match capability {
            WorkspaceCapability::Cow => cow_clone(&request.project_path, &clone_path)?,
            WorkspaceCapability::Worktree => git_worktree_clone(&request.project_path, &clone_path)?,
            WorkspaceCapability::Full => full_clone(&request.project_path, &clone_path)?,
        }

        let record = WorkspaceRecord {
            id: workspace_id,
            project_id: project_id(&request.project_path),
            agent_id: request.agent_id,
            persona_name: request.persona_name,
            clone_path: clone_path.display().to_string(),
            clone_type: match capability {
                WorkspaceCapability::Cow => CloneType::Cow,
                WorkspaceCapability::Worktree => CloneType::Worktree,
                WorkspaceCapability::Full => CloneType::Full,
            },
            status: WorkspaceStatus::Active,
            created_at: utc_now(),
            run_summary: serde_json::json!({}),
        };
        self.repo.insert(&record)?;
        Ok(record)
    }

    pub fn list(&self) -> Result<Vec<WorkspaceRecord>> {
        self.repo.list()
    }

    pub fn inspect(&self, id: &str) -> Result<Option<WorkspaceRecord>> {
        self.repo.get(id)
    }

    pub fn archive(&self, id: &str, run_summary: serde_json::Value) -> Result<WorkspaceRecord> {
        let mut workspace = self
            .repo
            .get(id)?
            .ok_or_else(|| anyhow::anyhow!("workspace {} not found", id))?;
        workspace.status = WorkspaceStatus::Archived;
        workspace.run_summary = run_summary;
        self.repo.update(&workspace)?;
        Ok(workspace)
    }

    pub fn destroy(&self, id: &str) -> Result<WorkspaceRecord> {
        let mut workspace = self
            .repo
            .get(id)?
            .ok_or_else(|| anyhow::anyhow!("workspace {} not found", id))?;
        let path = PathBuf::from(&workspace.clone_path);
        if path.exists() {
            fs::remove_dir_all(&path)
                .with_context(|| format!("failed to remove workspace {}", path.display()))?;
        }
        workspace.status = WorkspaceStatus::Deleted;
        self.repo.update(&workspace)?;
        Ok(workspace)
    }
}

fn supports_cow(project_path: &Path) -> bool {
    let target = project_path
        .parent()
        .unwrap_or(project_path)
        .join(format!(".lunaria-cow-test-{}", Uuid::new_v4()));
    let status = Command::new("cp")
        .arg("-cR")
        .arg(project_path)
        .arg(&target)
        .status();
    let supported = status.map(|status| status.success()).unwrap_or(false);
    let _ = fs::remove_dir_all(&target);
    supported
}

fn is_git_repository(project_path: &Path) -> bool {
    Command::new("git")
        .arg("-C")
        .arg(project_path)
        .arg("rev-parse")
        .arg("--is-inside-work-tree")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

fn cow_clone(source: &Path, dest: &Path) -> Result<()> {
    let status = Command::new("cp")
        .arg("-cR")
        .arg(source)
        .arg(dest)
        .status()
        .context("failed to execute cp -cR")?;
    if !status.success() {
        anyhow::bail!("cp -cR failed with status {}", status);
    }
    Ok(())
}

fn git_worktree_clone(source: &Path, dest: &Path) -> Result<()> {
    let status = Command::new("git")
        .arg("-C")
        .arg(source)
        .arg("worktree")
        .arg("add")
        .arg("--detach")
        .arg(dest)
        .status()
        .context("failed to execute git worktree add")?;
    if !status.success() {
        anyhow::bail!("git worktree add failed with status {}", status);
    }
    Ok(())
}

fn full_clone(source: &Path, dest: &Path) -> Result<()> {
    copy_dir_recursive(source, dest)
}

fn copy_dir_recursive(source: &Path, dest: &Path) -> Result<()> {
    fs::create_dir_all(dest)
        .with_context(|| format!("failed to create {}", dest.display()))?;
    for entry in fs::read_dir(source)
        .with_context(|| format!("failed to read directory {}", source.display()))?
    {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let target = dest.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_recursive(&entry.path(), &target)?;
        } else {
            fs::copy(entry.path(), &target)
                .with_context(|| format!("failed to copy into {}", target.display()))?;
        }
    }
    Ok(())
}

fn project_id(project_path: &Path) -> String {
    format!("{:x}", Sha256::digest(project_path.display().to_string().as_bytes()))
}
