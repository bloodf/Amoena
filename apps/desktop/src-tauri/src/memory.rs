use std::{collections::HashSet, sync::Arc};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::persistence::{
    repositories::{
        clock::utc_now, memory_tiers::MemoryTierRepository,
        observation_embeddings::ObservationEmbeddingRepository, observations::ObservationRepository,
        session_summaries::SessionSummaryRepository, sessions::SessionRepository,
    },
    Database, MemoryTierRecord, ObservationCategory, ObservationEmbeddingRecord, ObservationRecord,
    SessionSummaryRecord,
};
use crate::ai_worker::{BunWorkerBridge, EmbeddingRequest};

const EMBEDDING_PROVIDER_ID: &str = "openai";
const EMBEDDING_MODEL_ID: &str = "text-embedding-3-small";

#[derive(Clone, Debug)]
pub enum ObservationSource {
    UserPrompt,
    AssistantResponse,
    ToolResult { tool_name: String },
    Manual,
}

#[derive(Clone, Debug)]
pub struct ObservationInput {
    pub session_id: String,
    pub title: String,
    pub narrative: String,
    pub source: ObservationSource,
    pub facts: Vec<String>,
    pub files_read: Vec<String>,
    pub files_modified: Vec<String>,
    pub prompt_number: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservationSearchResult {
    pub observation: ObservationRecord,
    pub tiers: Option<MemoryTierRecord>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RetrievalScope {
    SessionLocal,
    Workspace,
    Global,
}

#[derive(Clone, Debug)]
pub struct InjectionBundle {
    pub scope: RetrievalScope,
    pub summaries: Vec<String>,
    pub token_budget_used: i64,
}

pub struct MemoryService {
    observations: ObservationRepository,
    tiers: MemoryTierRepository,
    embeddings: ObservationEmbeddingRepository,
    summaries: SessionSummaryRepository,
    sessions: SessionRepository,
}

impl MemoryService {
    pub fn new(database: Arc<Database>) -> Self {
        Self {
            observations: ObservationRepository::new(database.clone()),
            tiers: MemoryTierRepository::new(database.clone()),
            embeddings: ObservationEmbeddingRepository::new(database.clone()),
            summaries: SessionSummaryRepository::new(database.clone()),
            sessions: SessionRepository::new(database),
        }
    }

    pub fn capture(&self, input: ObservationInput) -> Result<Option<ObservationRecord>> {
        self.capture_with_category(input, None)
    }

    pub fn capture_with_category(
        &self,
        input: ObservationInput,
        category_override: Option<ObservationCategory>,
    ) -> Result<Option<ObservationRecord>> {
        let category = category_override.unwrap_or_else(|| classify_category(&input));
        let concepts = extract_concepts(&input.narrative);
        let content_hash = content_hash(&input.title, &input.narrative, &concepts, &category);

        if self
            .observations
            .latest_by_hash(&input.session_id, &content_hash)?
            .is_some()
        {
            return Ok(None);
        }

        if let Some(recent) = self
            .observations
            .list_recent_for_session(&input.session_id, 10)?
            .into_iter()
            .find(|candidate| {
                candidate.category == category
                    && semantic_similarity(
                        candidate.narrative.as_deref().unwrap_or(""),
                        &input.narrative,
                    ) >= 0.50
            })
        {
            return Ok(Some(recent));
        }

        let session = self
            .sessions
            .get(&input.session_id)?
            .ok_or_else(|| anyhow::anyhow!("session {} not found", input.session_id))?;
        let scope = session
            .workspace_id
            .clone()
            .unwrap_or_else(|| input.session_id.clone());
        let observation_id = Uuid::new_v4().to_string();
        let observation = ObservationRecord {
            id: observation_id.clone(),
            session_id: input.session_id.clone(),
            uri: format!("lunaria://memory/{scope}/{observation_id}"),
            parent_uri: format!("lunaria://memory/{scope}"),
            observation_type: observation_type_label(&input.source).to_string(),
            category,
            title: input.title,
            subtitle: Some(source_label(&input.source).to_string()),
            facts: input.facts,
            narrative: Some(input.narrative),
            concepts,
            files_read: input.files_read,
            files_modified: input.files_modified,
            content_hash,
            prompt_number: input.prompt_number,
            discovery_tokens: 0,
            created_at: utc_now(),
        };
        self.observations.insert(&observation)?;
        self.tiers.upsert(&build_tiers(&observation))?;

        Ok(Some(observation))
    }

    pub fn observe_manual(
        &self,
        session_id: &str,
        title: &str,
        narrative: &str,
        category: Option<ObservationCategory>,
    ) -> Result<Option<ObservationRecord>> {
        let input = ObservationInput {
            session_id: session_id.to_string(),
            title: title.to_string(),
            narrative: narrative.to_string(),
            source: ObservationSource::Manual,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 0,
        };
        self.capture_with_category(input, category)
    }

    pub fn search(
        &self,
        query: &str,
        category: Option<ObservationCategory>,
    ) -> Result<Vec<ObservationSearchResult>> {
        let observations = self
            .observations
            .search(query, category.as_ref().map(|value| value.as_str()))?;
        observations
            .into_iter()
            .map(|observation| {
                let tiers = self.tiers.get(&observation.id)?;
                Ok(ObservationSearchResult { observation, tiers })
            })
            .collect()
    }

    pub fn list_recent_for_session(
        &self,
        session_id: &str,
        limit: i64,
    ) -> Result<Vec<ObservationSearchResult>> {
        self.observations
            .list_recent_for_session(session_id, limit)?
            .into_iter()
            .map(|observation| {
                let tiers = self.tiers.get(&observation.id)?;
                Ok(ObservationSearchResult { observation, tiers })
            })
            .collect()
    }

    pub fn session_summary(&self, session_id: &str) -> Result<Option<SessionSummaryRecord>> {
        self.summaries.get(session_id)
    }

    pub fn upsert_session_summary(&self, summary: SessionSummaryRecord) -> Result<()> {
        self.summaries.upsert(&summary)
    }

    pub fn session_memory(
        &self,
        session_id: &str,
        limit: i64,
    ) -> Result<(Option<SessionSummaryRecord>, Vec<ObservationSearchResult>)> {
        let observations = self.observations.list_recent_for_session(session_id, limit)?;
        let entries = observations
            .into_iter()
            .map(|observation| {
                let tiers = self.tiers.get(&observation.id)?;
                Ok(ObservationSearchResult { observation, tiers })
            })
            .collect::<Result<Vec<_>>>()?;
        let summary = self.summaries.get(session_id)?;
        Ok((summary, entries))
    }

    pub async fn embed_observation(
        &self,
        worker: &BunWorkerBridge,
        observation: &ObservationRecord,
        api_key: Option<String>,
    ) -> Result<ObservationEmbeddingRecord> {
        let response = worker
            .generate_embedding(EmbeddingRequest {
                provider_id: EMBEDDING_PROVIDER_ID.to_string(),
                model_id: EMBEDDING_MODEL_ID.to_string(),
                api_key: api_key.clone(),
                input: observation
                    .narrative
                    .clone()
                    .unwrap_or_else(|| observation.title.clone()),
            })
            .await
            .map_err(|error| anyhow::anyhow!(error.to_string()))?;
        let record = ObservationEmbeddingRecord {
            observation_id: observation.id.clone(),
            vector: response.vector,
            model: EMBEDDING_MODEL_ID.to_string(),
        };
        self.embeddings.upsert(&record)?;
        Ok(record)
    }

    pub async fn hybrid_search(
        &self,
        worker: &BunWorkerBridge,
        api_key: Option<String>,
        query: &str,
        category: Option<ObservationCategory>,
    ) -> Result<Vec<ObservationSearchResult>> {
        let fts_results = self.search(query, category.clone())?;
        if fts_results.is_empty() {
            return Ok(vec![]);
        }

        let query_embedding = worker
            .generate_embedding(EmbeddingRequest {
                provider_id: EMBEDDING_PROVIDER_ID.to_string(),
                model_id: EMBEDDING_MODEL_ID.to_string(),
                api_key,
                input: query.to_string(),
            })
            .await
            .map_err(|error| anyhow::anyhow!(error.to_string()))?;

        let mut scored = fts_results
            .into_iter()
            .enumerate()
            .map(|(index, result)| {
                let vector_score = self
                    .embeddings
                    .get(&result.observation.id)
                    .ok()
                    .flatten()
                    .map(|embedding| cosine_similarity(&query_embedding.vector, &embedding.vector))
                    .unwrap_or(0.0);
                let rrf = 1.0 / (60.0 + index as f64 + 1.0) + vector_score;
                (rrf, result)
            })
            .collect::<Vec<_>>();
        scored.sort_by(|left, right| right.0.partial_cmp(&left.0).unwrap_or(std::cmp::Ordering::Equal));

        Ok(scored.into_iter().map(|(_, result)| result).collect())
    }

    pub fn classify_scope(&self, query: &str) -> RetrievalScope {
        let lower = query.to_lowercase();
        if lower.contains("workspace") || lower.contains("project") || lower.contains("codebase") {
            RetrievalScope::Workspace
        } else if lower.contains("prefer") || lower.contains("global") {
            RetrievalScope::Global
        } else {
            RetrievalScope::SessionLocal
        }
    }

    pub async fn injection_bundle(
        &self,
        worker: &BunWorkerBridge,
        api_key: Option<String>,
        query: &str,
        max_observations: usize,
    ) -> Result<InjectionBundle> {
        let scope = self.classify_scope(query);
        let results = self.hybrid_search(worker, api_key, query, None).await?;
        let summaries = results
            .into_iter()
            .take(max_observations)
            .filter_map(|result| result.tiers.map(|tiers| tiers.l0_summary))
            .collect::<Vec<_>>();
        let token_budget_used = summaries
            .iter()
            .map(|summary| token_count(summary))
            .sum();

        Ok(InjectionBundle {
            scope,
            summaries,
            token_budget_used,
        })
    }
}

fn classify_category(input: &ObservationInput) -> ObservationCategory {
    match &input.source {
        ObservationSource::ToolResult { .. } => ObservationCategory::ToolUsage,
        ObservationSource::Manual if input.title.to_lowercase().contains("skill") => ObservationCategory::Skill,
        _ => {
            let lower = input.narrative.to_lowercase();
            if lower.contains("prefer") || lower.contains("settings") {
                ObservationCategory::Preference
            } else if lower.contains("i am") || lower.contains("my role") {
                ObservationCategory::Profile
            } else if lower.contains("pattern") || lower.contains("always") {
                ObservationCategory::Pattern
            } else {
                ObservationCategory::Entity
            }
        }
    }
}

fn observation_type_label(source: &ObservationSource) -> &'static str {
    match source {
        ObservationSource::UserPrompt => "user_prompt",
        ObservationSource::AssistantResponse => "assistant_response",
        ObservationSource::ToolResult { .. } => "tool_result",
        ObservationSource::Manual => "manual",
    }
}

fn source_label(source: &ObservationSource) -> &'static str {
    match source {
        ObservationSource::UserPrompt => "user",
        ObservationSource::AssistantResponse => "assistant",
        ObservationSource::ToolResult { tool_name } if tool_name == "echo" => "tool:echo",
        ObservationSource::ToolResult { .. } => "tool",
        ObservationSource::Manual => "manual",
    }
}

fn extract_concepts(text: &str) -> Vec<String> {
    let mut seen = HashSet::new();
    text.split(|ch: char| !ch.is_alphanumeric() && ch != '-' && ch != '.')
        .filter(|token| token.len() > 2)
        .filter_map(|token| {
            let normalized = token.to_lowercase();
            if seen.insert(normalized.clone()) {
                Some(normalized)
            } else {
                None
            }
        })
        .take(12)
        .collect()
}

fn content_hash(title: &str, narrative: &str, concepts: &[String], category: &ObservationCategory) -> String {
    format!(
        "{:x}",
        Sha256::digest(
            format!("{title}\n{narrative}\n{}\n{}", concepts.join(","), category.as_str()).as_bytes(),
        )
    )
}

fn build_tiers(observation: &ObservationRecord) -> MemoryTierRecord {
    let l0 = format!(
        "{} [{}] {}",
        observation.title,
        observation.category.as_str(),
        observation.created_at
    );
    let l1 = truncate(
        &format!(
            "{}\n{}\n{}",
            observation.title,
            observation.subtitle.clone().unwrap_or_default(),
            observation.narrative.clone().unwrap_or_default()
        ),
        320,
    );
    let l2 = truncate(
        &serde_json::to_string_pretty(&json!({
            "title": observation.title,
            "category": observation.category.as_str(),
            "facts": observation.facts,
            "narrative": observation.narrative,
            "concepts": observation.concepts,
            "uri": observation.uri,
            "parentUri": observation.parent_uri
        }))
        .expect("tier l2 should serialize"),
        2000,
    );
    MemoryTierRecord {
        observation_id: observation.id.clone(),
        l0_tokens: token_count(&l0),
        l1_tokens: token_count(&l1),
        l2_tokens: token_count(&l2),
        l0_summary: l0,
        l1_summary: l1,
        l2_content: l2,
        generated_at: utc_now(),
        model: "deterministic-fallback".to_string(),
    }
}

fn truncate(text: &str, max_chars: usize) -> String {
    if text.len() <= max_chars {
        text.to_string()
    } else {
        format!("{}...", &text[..max_chars])
    }
}

fn token_count(text: &str) -> i64 {
    text.split_whitespace().count() as i64
}

fn semantic_similarity(left: &str, right: &str) -> f64 {
    let left = token_set(left);
    let right = token_set(right);
    if left.is_empty() || right.is_empty() {
        return 0.0;
    }
    let intersection = left.intersection(&right).count() as f64;
    let union = left.union(&right).count() as f64;
    intersection / union
}

fn token_set(text: &str) -> HashSet<String> {
    text.split(|ch: char| !ch.is_alphanumeric())
        .filter(|token| token.len() > 2)
        .map(|token| token.to_lowercase())
        .collect()
}

fn cosine_similarity(left: &[f32], right: &[f32]) -> f64 {
    let len = left.len().min(right.len());
    if len == 0 {
        return 0.0;
    }

    let mut dot = 0.0f64;
    let mut left_norm = 0.0f64;
    let mut right_norm = 0.0f64;
    for index in 0..len {
        let left_value = left[index] as f64;
        let right_value = right[index] as f64;
        dot += left_value * right_value;
        left_norm += left_value * left_value;
        right_norm += right_value * right_value;
    }
    if left_norm == 0.0 || right_norm == 0.0 {
        0.0
    } else {
        dot / (left_norm.sqrt() * right_norm.sqrt())
    }
}
