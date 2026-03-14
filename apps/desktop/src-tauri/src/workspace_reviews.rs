use std::{collections::HashSet, fs, path::{Path, PathBuf}, sync::Arc};

use anyhow::{Context, Result};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::persistence::{
    repositories::{clock::utc_now, workspace_merge_reviews::WorkspaceMergeReviewRepository, workspaces::WorkspaceRepository},
    WorkspaceMergeReviewRecord, WorkspaceMergeReviewStatus, WorkspaceStatus,
};

pub struct WorkspaceReviewManager {
    workspaces: WorkspaceRepository,
    reviews: WorkspaceMergeReviewRepository,
    root: PathBuf,
}

pub struct OrphanReport {
    pub missing_paths: Vec<String>,
    pub untracked_paths: Vec<String>,
}

impl WorkspaceReviewManager {
    pub fn new(database: Arc<crate::persistence::Database>, root: PathBuf) -> Self {
        Self {
            workspaces: WorkspaceRepository::new(database.clone()),
            reviews: WorkspaceMergeReviewRepository::new(database),
            root,
        }
    }

    pub fn prepare_review(
        &self,
        workspace_id: &str,
        target_project_path: &Path,
        contributing_agents: serde_json::Value,
    ) -> Result<WorkspaceMergeReviewRecord> {
        let workspace = self
            .workspaces
            .get(workspace_id)?
            .ok_or_else(|| anyhow::anyhow!("workspace {} not found", workspace_id))?;
        let diff = diff_paths(Path::new(&workspace.clone_path), target_project_path)?;
        let conflicts = detect_conflicts(Path::new(&workspace.clone_path), target_project_path)? as i64;
        let team_consensus_score = consensus_score(&contributing_agents);
        let flagged_decisions = low_consensus_decisions(&workspace.run_summary, &contributing_agents);
        let status = if conflicts > 0 || !flagged_decisions.is_empty() {
            WorkspaceMergeReviewStatus::Blocked
        } else {
            WorkspaceMergeReviewStatus::Pending
        };
        let now = utc_now();
        let review = WorkspaceMergeReviewRecord {
            id: Uuid::new_v4().to_string(),
            workspace_id: workspace.id,
            source_branch: format!("lunaria/{}", workspace_id),
            target_branch: "main".to_string(),
            changed_files: diff.len() as i64,
            conflicts,
            summary: format!("{} changed files, {} conflicts", diff.len(), conflicts),
            files: serde_json::to_value(&diff).expect("diff should serialize"),
            status,
            contributing_agents,
            team_consensus_score,
            flagged_decisions: serde_json::to_value(&flagged_decisions).expect("flags should serialize"),
            acknowledged_decisions: serde_json::json!([]),
            created_at: now.clone(),
            updated_at: now,
        };
        self.reviews.upsert(&review)?;
        Ok(review)
    }

    pub fn apply_review(
        &self,
        review_id: &str,
        acknowledged_decisions: Vec<String>,
    ) -> Result<WorkspaceMergeReviewRecord> {
        let mut review = self
            .reviews
            .get(review_id)?
            .ok_or_else(|| anyhow::anyhow!("review {} not found", review_id))?;
        let flagged = review
            .flagged_decisions
            .as_array()
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .filter_map(|value| value.as_str().map(str::to_string))
            .collect::<Vec<_>>();
        if !flagged.iter().all(|flag| acknowledged_decisions.contains(flag)) {
            review.status = WorkspaceMergeReviewStatus::Blocked;
            self.reviews.upsert(&review)?;
            anyhow::bail!("low-consensus decisions must be acknowledged before apply-back");
        }
        if review.conflicts > 0 {
            review.status = WorkspaceMergeReviewStatus::Blocked;
            self.reviews.upsert(&review)?;
            anyhow::bail!("workspace conflicts block apply-back");
        }

        review.status = WorkspaceMergeReviewStatus::Applied;
        review.acknowledged_decisions = serde_json::to_value(&acknowledged_decisions)?;
        review.updated_at = utc_now();
        self.reviews.upsert(&review)?;
        Ok(review)
    }

    pub fn scan_orphans(&self) -> Result<OrphanReport> {
        let tracked = self.workspaces.list()?;
        let tracked_paths = tracked
            .iter()
            .map(|workspace| workspace.clone_path.clone())
            .collect::<HashSet<_>>();

        let missing_paths = tracked
            .iter()
            .filter(|workspace| workspace.status == WorkspaceStatus::Active)
            .filter(|workspace| !Path::new(&workspace.clone_path).exists())
            .map(|workspace| workspace.clone_path.clone())
            .collect::<Vec<_>>();

        let mut untracked_paths = Vec::new();
        if self.root.exists() {
            for entry in fs::read_dir(&self.root)
                .with_context(|| format!("failed to read workspace root {}", self.root.display()))?
            {
                let entry = entry?;
                let path = entry.path().display().to_string();
                if !tracked_paths.contains(&path) {
                    untracked_paths.push(path);
                }
            }
        }

        Ok(OrphanReport {
            missing_paths,
            untracked_paths,
        })
    }
}

fn diff_paths(source: &Path, target: &Path) -> Result<Vec<serde_json::Value>> {
    let source_files = walk_files(source)?;
    let target_files = walk_files(target)?;
    let mut all_paths = source_files
        .keys()
        .chain(target_files.keys())
        .cloned()
        .collect::<HashSet<_>>()
        .into_iter()
        .collect::<Vec<_>>();
    all_paths.sort();

    let mut diff = Vec::new();
    for path in all_paths {
        let source_hash = source_files.get(&path);
        let target_hash = target_files.get(&path);
        let status = match (source_hash, target_hash) {
            (Some(source_hash), Some(target_hash)) if source_hash == target_hash => None,
            (Some(_), Some(_)) => Some("modified"),
            (Some(_), None) => Some("added"),
            (None, Some(_)) => Some("deleted"),
            (None, None) => None,
        };
        if let Some(status) = status {
            diff.push(serde_json::json!({ "path": path, "status": status }));
        }
    }
    Ok(diff)
}

fn detect_conflicts(source: &Path, target: &Path) -> Result<usize> {
    let mut conflicts = 0usize;
    for file in walk_files(source)?.keys() {
        let source_content = fs::read_to_string(source.join(file)).unwrap_or_default();
        let target_content = fs::read_to_string(target.join(file)).unwrap_or_default();
        if source_content.contains("<<<<<<<") || target_content.contains("<<<<<<<") {
            conflicts += 1;
        }
    }
    Ok(conflicts)
}

fn walk_files(root: &Path) -> Result<std::collections::HashMap<String, String>> {
    let mut files = std::collections::HashMap::new();
    if !root.exists() {
        return Ok(files);
    }

    fn visit(base: &Path, current: &Path, files: &mut std::collections::HashMap<String, String>) -> Result<()> {
        for entry in fs::read_dir(current)
            .with_context(|| format!("failed to read directory {}", current.display()))?
        {
            let entry = entry?;
            let path = entry.path();
            if entry.file_type()?.is_dir() {
                visit(base, &path, files)?;
            } else {
                let relative = path
                    .strip_prefix(base)
                    .expect("path should be under base")
                    .display()
                    .to_string();
                let hash = format!("{:x}", Sha256::digest(fs::read(&path)?.as_slice()));
                files.insert(relative, hash);
            }
        }
        Ok(())
    }

    visit(root, root, &mut files)?;
    Ok(files)
}

fn consensus_score(contributing_agents: &serde_json::Value) -> f64 {
    let agents = contributing_agents.as_array().cloned().unwrap_or_default();
    if agents.is_empty() {
        return 0.0;
    }
    let total: f64 = agents
        .iter()
        .filter_map(|agent| agent.get("decisionWeight").and_then(serde_json::Value::as_f64))
        .sum();
    (total / agents.len() as f64).clamp(0.0, 1.0)
}

fn low_consensus_decisions(
    run_summary: &serde_json::Value,
    contributing_agents: &serde_json::Value,
) -> Vec<String> {
    let low_consensus = contributing_agents
        .as_array()
        .cloned()
        .unwrap_or_default()
        .into_iter()
        .any(|agent| agent.get("decisionWeight").and_then(serde_json::Value::as_f64).unwrap_or(0.0) < 0.6);
    if !low_consensus {
        return vec![];
    }

    run_summary
        .get("keyDecisions")
        .and_then(serde_json::Value::as_array)
        .cloned()
        .unwrap_or_default()
        .into_iter()
        .filter_map(|value| value.as_str().map(str::to_string))
        .collect()
}
