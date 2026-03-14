use std::sync::Arc;

use anyhow::{Context, Result};
use rusqlite::{params, OptionalExtension, Row};

use crate::persistence::{
    database::Database,
    models::{TaskRecord, TaskStatus},
    repositories::clock::{sqlite_text_conversion_error, utc_now},
};

pub struct TaskRepository {
    db: Arc<Database>,
}

impl TaskRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn insert(&self, record: &TaskRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "INSERT INTO tasks (id, session_id, agent_id, title, description, status, priority, order_index, parent_task_id, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                params![
                    record.id,
                    record.session_id,
                    record.agent_id,
                    record.title,
                    record.description,
                    record.status.as_str(),
                    record.priority,
                    record.order_index,
                    record.parent_task_id,
                    record.created_at,
                    record.updated_at,
                ],
            )
            .context("failed to insert task")?;
            Ok(())
        })
    }

    pub fn list_by_session(&self, session_id: &str) -> Result<Vec<TaskRecord>> {
        self.db.read(|connection| {
            let mut statement = connection
                .prepare(
                    "SELECT id, session_id, agent_id, title, description, status, priority, order_index, parent_task_id, created_at, updated_at
                     FROM tasks WHERE session_id = ?1 ORDER BY order_index ASC",
                )
                .context("failed to prepare task list query")?;
            let records = statement
                .query_map(params![session_id], map_task)
                .context("failed to query tasks")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect task rows")?;
            Ok(records)
        })
    }

    pub fn get(&self, id: &str) -> Result<Option<TaskRecord>> {
        self.db.read(|connection| {
            connection
                .query_row(
                    "SELECT id, session_id, agent_id, title, description, status, priority, order_index, parent_task_id, created_at, updated_at
                     FROM tasks WHERE id = ?1",
                    params![id],
                    map_task,
                )
                .optional()
                .context("failed to load task")
        })
    }

    pub fn update(&self, record: &TaskRecord) -> Result<()> {
        self.db.write(|connection| {
            connection.execute(
                "UPDATE tasks SET title = ?2, description = ?3, status = ?4, priority = ?5, order_index = ?6, parent_task_id = ?7, updated_at = ?8 WHERE id = ?1",
                params![
                    record.id,
                    record.title,
                    record.description,
                    record.status.as_str(),
                    record.priority,
                    record.order_index,
                    record.parent_task_id,
                    record.updated_at,
                ],
            )
            .context("failed to update task")?;
            Ok(())
        })
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.db.write(|connection| {
            connection
                .execute("DELETE FROM tasks WHERE id = ?1", params![id])
                .context("failed to delete task")?;
            Ok(())
        })
    }

    pub fn reorder(&self, session_id: &str, ordered_ids: &[String]) -> Result<()> {
        self.db.write(|connection| {
            for (index, id) in ordered_ids.iter().enumerate() {
                connection.execute(
                    "UPDATE tasks SET order_index = ?2, updated_at = ?3 WHERE id = ?1 AND session_id = ?4",
                    params![id, index as i64, utc_now(), session_id],
                )
                .context("failed to reorder task")?;
            }
            Ok(())
        })
    }
}

fn map_task(row: &Row<'_>) -> rusqlite::Result<TaskRecord> {
    Ok(TaskRecord {
        id: row.get(0)?,
        session_id: row.get(1)?,
        agent_id: row.get(2)?,
        title: row.get(3)?,
        description: row.get(4)?,
        status: row
            .get::<_, String>(5)?
            .parse::<TaskStatus>()
            .map_err(|error| sqlite_text_conversion_error(5, error))?,
        priority: row.get(6)?,
        order_index: row.get(7)?,
        parent_task_id: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}
