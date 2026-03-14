use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    repositories::clock::{parse_json_value, sqlite_text_conversion_error},
    WorkspaceMergeReviewRecord, WorkspaceMergeReviewStatus,
};

pub struct WorkspaceMergeReviewRepository {
    db: Arc<Database>,
}

impl WorkspaceMergeReviewRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn upsert(&self, record: &WorkspaceMergeReviewRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO workspace_merge_reviews (id, workspace_id, source_branch, target_branch, changed_files, conflicts, summary, files, status, contributing_agents, team_consensus_score, flagged_decisions, acknowledged_decisions, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
                 ON CONFLICT(id) DO UPDATE SET
                   workspace_id = excluded.workspace_id,
                   source_branch = excluded.source_branch,
                   target_branch = excluded.target_branch,
                   changed_files = excluded.changed_files,
                   conflicts = excluded.conflicts,
                   summary = excluded.summary,
                   files = excluded.files,
                   status = excluded.status,
                   contributing_agents = excluded.contributing_agents,
                   team_consensus_score = excluded.team_consensus_score,
                   flagged_decisions = excluded.flagged_decisions,
                   acknowledged_decisions = excluded.acknowledged_decisions,
                   updated_at = excluded.updated_at",
                params![
                    record.id,
                    record.workspace_id,
                    record.source_branch,
                    record.target_branch,
                    record.changed_files,
                    record.conflicts,
                    record.summary,
                    serde_json::to_string(&record.files)?,
                    record.status.as_str(),
                    serde_json::to_string(&record.contributing_agents)?,
                    record.team_consensus_score,
                    serde_json::to_string(&record.flagged_decisions)?,
                    serde_json::to_string(&record.acknowledged_decisions)?,
                    record.created_at,
                    record.updated_at,
                ],
            ).context("failed to upsert workspace merge review")?;
            Ok(())
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<WorkspaceMergeReviewRecord>> {
        self.db.read(|connection| {
            connection.query_row(
                "SELECT id, workspace_id, source_branch, target_branch, changed_files, conflicts, summary, files, status, contributing_agents, team_consensus_score, flagged_decisions, acknowledged_decisions, created_at, updated_at
                 FROM workspace_merge_reviews WHERE id = ?1",
                params![id],
                map_review,
            ).optional().context("failed to load workspace merge review")
        })
    }
}

fn map_review(row: &Row<'_>) -> rusqlite::Result<WorkspaceMergeReviewRecord> {
    Ok(WorkspaceMergeReviewRecord {
        id: row.get(0)?,
        workspace_id: row.get(1)?,
        source_branch: row.get(2)?,
        target_branch: row.get(3)?,
        changed_files: row.get(4)?,
        conflicts: row.get(5)?,
        summary: row.get(6)?,
        files: parse_json_value(row.get(7)?).map_err(|error| sqlite_text_conversion_error(7, error))?,
        status: row
            .get::<_, String>(8)?
            .parse::<WorkspaceMergeReviewStatus>()
            .map_err(|error| sqlite_text_conversion_error(8, error))?,
        contributing_agents: parse_json_value(row.get(9)?)
            .map_err(|error| sqlite_text_conversion_error(9, error))?,
        team_consensus_score: row.get(10)?,
        flagged_decisions: parse_json_value(row.get(11)?)
            .map_err(|error| sqlite_text_conversion_error(11, error))?,
        acknowledged_decisions: parse_json_value(row.get(12)?)
            .map_err(|error| sqlite_text_conversion_error(12, error))?,
        created_at: row.get(13)?,
        updated_at: row.get(14)?,
    })
}
