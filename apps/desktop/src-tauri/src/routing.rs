use std::sync::Arc;

use anyhow::Result;
use thiserror::Error;

use crate::{
    config::ConfigService,
    persistence::{repositories::providers::ProviderRepository, Database, ProviderModelRecord},
    persona::PersonaProfile,
};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ReasoningMode {
    Off,
    Auto,
    On,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ReasoningEffort {
    Low,
    Medium,
    High,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RoutingAgentState {
    Active,
    Running,
    Paused,
    Stopped,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Clone, Debug)]
pub struct RoutingPersonaContext {
    pub preferred_model: Option<String>,
    pub division: String,
    pub decision_weight: f64,
}

#[derive(Clone, Debug)]
pub struct RoutingRequest {
    pub provider_id: Option<String>,
    pub model_id: Option<String>,
    pub task_type: String,
    pub agent_state: RoutingAgentState,
    pub turn_reasoning_mode: Option<ReasoningMode>,
    pub turn_reasoning_effort: Option<ReasoningEffort>,
    pub persona: RoutingPersonaContext,
}

#[derive(Clone, Debug, PartialEq)]
pub struct RoutingDecision {
    pub provider_id: String,
    pub model_id: String,
    pub reasoning_mode: ReasoningMode,
    pub reasoning_effort: Option<ReasoningEffort>,
    pub decision_weight: f64,
}

#[derive(Debug, Error)]
pub enum RoutingError {
    #[error("agent state {0:?} cannot request routing")]
    InvalidAgentState(RoutingAgentState),
    #[error("model {provider_id}/{model_id} does not support requested reasoning mode")]
    UnsupportedReasoningModel { provider_id: String, model_id: String },
    #[error("no provider models available for routing")]
    NoModelsAvailable,
}

pub struct ProviderRoutingService {
    repo: ProviderRepository,
    config: Arc<ConfigService>,
}

impl ProviderRoutingService {
    pub fn new(database: Arc<Database>, config: Arc<ConfigService>) -> Self {
        Self {
            repo: ProviderRepository::new(database),
            config,
        }
    }

    pub fn resolve(&self, request: RoutingRequest) -> std::result::Result<RoutingDecision, RoutingError> {
        if !matches!(request.agent_state, RoutingAgentState::Active | RoutingAgentState::Running) {
            return Err(RoutingError::InvalidAgentState(request.agent_state));
        }

        let models = self
            .repo
            .list_all_models()
            .map_err(|_| RoutingError::NoModelsAvailable)?;
        if models.is_empty() {
            return Err(RoutingError::NoModelsAvailable);
        }

        let selected_model = self.select_model(&models, &request)?;
        let reasoning_mode = self.resolve_reasoning_mode(&selected_model, &request)?;
        let reasoning_effort = self.resolve_reasoning_effort(&selected_model, &request, &reasoning_mode)?;

        Ok(RoutingDecision {
            provider_id: selected_model.provider_id.clone(),
            model_id: selected_model.model_id.clone(),
            reasoning_mode,
            reasoning_effort,
            decision_weight: request.persona.decision_weight,
        })
    }

    fn select_model<'a>(
        &self,
        models: &'a [ProviderModelRecord],
        request: &RoutingRequest,
    ) -> std::result::Result<&'a ProviderModelRecord, RoutingError> {
        if let Some(preferred_model) = &request.persona.preferred_model {
            if let Some(model) = models.iter().find(|model| &model.model_id == preferred_model) {
                return Ok(model);
            }
        }

        if let Some(model_id) = &request.model_id {
            if let Some(model) = models.iter().find(|model| {
                &model.model_id == model_id
                    && request
                        .provider_id
                        .as_ref()
                        .map(|provider_id| &model.provider_id == provider_id)
                        .unwrap_or(true)
            }) {
                return Ok(model);
            }
        }

        if matches!(request.persona.division.as_str(), "security" | "qa") {
            if let Some(model) = models.iter().find(|model| model.supports_reasoning) {
                return Ok(model);
            }
        }

        if let Some(provider_id) = &request.provider_id {
            if let Some(model) = models.iter().find(|model| &model.provider_id == provider_id) {
                return Ok(model);
            }
        }

        models.first().ok_or(RoutingError::NoModelsAvailable)
    }

    fn resolve_reasoning_mode(
        &self,
        model: &ProviderModelRecord,
        request: &RoutingRequest,
    ) -> std::result::Result<ReasoningMode, RoutingError> {
        if let Some(turn_override) = &request.turn_reasoning_mode {
            return self.validate_reasoning_mode(model, turn_override.clone());
        }

        let setting_key = format!(
            "providers.reasoning.{}/{}.mode",
            model.provider_id, model.model_id
        );
        let stored_mode = self
            .config
            .get_setting::<String>(&setting_key, crate::persistence::SettingScope::Global, None)
            .ok()
            .flatten()
            .and_then(|value| parse_reasoning_mode(&value).ok());
        if let Some(mode) = stored_mode {
            return self.validate_reasoning_mode(model, mode);
        }

        self.validate_reasoning_mode(model, adaptive_reasoning_mode(&request.task_type, &request.persona.division))
    }

    fn resolve_reasoning_effort(
        &self,
        model: &ProviderModelRecord,
        request: &RoutingRequest,
        reasoning_mode: &ReasoningMode,
    ) -> std::result::Result<Option<ReasoningEffort>, RoutingError> {
        if matches!(reasoning_mode, ReasoningMode::Off) {
            return Ok(None);
        }

        if let Some(turn_override) = &request.turn_reasoning_effort {
            return Ok(Some(turn_override.clone()));
        }

        let setting_key = format!(
            "providers.reasoning.{}/{}.effort",
            model.provider_id, model.model_id
        );
        let stored_effort = self
            .config
            .get_setting::<String>(&setting_key, crate::persistence::SettingScope::Global, None)
            .ok()
            .flatten()
            .and_then(|value| parse_reasoning_effort(&value).ok());
        if let Some(effort) = stored_effort {
            return Ok(Some(effort));
        }

        if model.reasoning_effort_supported {
            Ok(Some(ReasoningEffort::Medium))
        } else {
            Ok(None)
        }
    }

    fn validate_reasoning_mode(
        &self,
        model: &ProviderModelRecord,
        mode: ReasoningMode,
    ) -> std::result::Result<ReasoningMode, RoutingError> {
        if matches!(mode, ReasoningMode::Off) {
            return Ok(mode);
        }

        if !model.supports_reasoning {
            return Err(RoutingError::UnsupportedReasoningModel {
                provider_id: model.provider_id.clone(),
                model_id: model.model_id.clone(),
            });
        }

        Ok(mode)
    }
}

impl From<&PersonaProfile> for RoutingPersonaContext {
    fn from(persona: &PersonaProfile) -> Self {
        Self {
            preferred_model: persona.preferred_model.clone(),
            division: persona.division.clone(),
            decision_weight: persona.decision_weight,
        }
    }
}

pub fn adaptive_reasoning_mode(task_type: &str, division: &str) -> ReasoningMode {
    let auto_enabled_tasks = [
        "planning",
        "architecture",
        "debugging",
        "code-review",
        "security-review",
        "complex-refactor",
    ];
    let auto_disabled_tasks = [
        "system.title",
        "system.compaction",
        "system.observation",
        "commit-message",
        "small-rename",
    ];

    if matches!(division, "security" | "qa") {
        return ReasoningMode::On;
    }

    if auto_enabled_tasks.iter().any(|candidate| task_type.contains(candidate)) {
        ReasoningMode::On
    } else if auto_disabled_tasks.iter().any(|candidate| task_type.contains(candidate)) {
        ReasoningMode::Off
    } else {
        ReasoningMode::Auto
    }
}

fn parse_reasoning_mode(value: &str) -> Result<ReasoningMode> {
    match value {
        "off" => Ok(ReasoningMode::Off),
        "auto" => Ok(ReasoningMode::Auto),
        "on" => Ok(ReasoningMode::On),
        _ => anyhow::bail!("invalid reasoning mode: {value}"),
    }
}

fn parse_reasoning_effort(value: &str) -> Result<ReasoningEffort> {
    match value {
        "low" => Ok(ReasoningEffort::Low),
        "medium" => Ok(ReasoningEffort::Medium),
        "high" => Ok(ReasoningEffort::High),
        _ => anyhow::bail!("invalid reasoning effort: {value}"),
    }
}
