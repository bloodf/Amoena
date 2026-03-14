use std::time::Duration;

use anyhow::{Context, Result};
use async_trait::async_trait;
use reqwest::Client;
use serde::Deserialize;

use crate::providers::service::{DetectedProvider, DetectedProviderModel, ProviderDiscoveryStatus};

#[async_trait]
pub trait LocalProviderDetector: Send + Sync {
    async fn detect(&self) -> Result<Option<DetectedProvider>>;
}

pub struct OllamaDetector {
    client: Client,
    base_url: String,
}

pub struct LmStudioDetector {
    client: Client,
    base_url: String,
}

pub struct LlamaCppDetector {
    client: Client,
    base_url: String,
}

impl OllamaDetector {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            client: default_client(),
            base_url: base_url.into(),
        }
    }
}

impl LmStudioDetector {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            client: default_client(),
            base_url: base_url.into(),
        }
    }
}

impl LlamaCppDetector {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            client: default_client(),
            base_url: base_url.into(),
        }
    }
}

#[async_trait]
impl LocalProviderDetector for OllamaDetector {
    async fn detect(&self) -> Result<Option<DetectedProvider>> {
        #[derive(Deserialize)]
        struct OllamaResponse {
            models: Vec<OllamaModel>,
        }
        #[derive(Deserialize)]
        struct OllamaModel {
            name: String,
        }

        let response = match self
            .client
            .get(format!("{}/api/tags", self.base_url.trim_end_matches('/')))
            .send()
            .await
        {
            Ok(response) => response,
            Err(_) => return Ok(None),
        };

        let response = match response.error_for_status() {
            Ok(response) => response,
            Err(_) => return Ok(None),
        };
        let payload: OllamaResponse = response
            .json()
            .await
            .context("failed to decode ollama tags response")?;

        Ok(Some(DetectedProvider {
            id: "local-ollama".to_string(),
            name: "Ollama".to_string(),
            npm_package: Some("@ai-sdk/ollama".to_string()),
            base_url: self.base_url.clone(),
            discovery_status: ProviderDiscoveryStatus::Reachable,
            models: payload
                .models
                .into_iter()
                .map(|model| DetectedProviderModel {
                    model_id: model.name.clone(),
                    display_name: model.name,
                })
                .collect(),
        }))
    }
}

#[async_trait]
impl LocalProviderDetector for LmStudioDetector {
    async fn detect(&self) -> Result<Option<DetectedProvider>> {
        detect_openai_compatible(
            &self.client,
            &self.base_url,
            "local-lm-studio",
            "LM Studio",
        )
        .await
    }
}

#[async_trait]
impl LocalProviderDetector for LlamaCppDetector {
    async fn detect(&self) -> Result<Option<DetectedProvider>> {
        detect_openai_compatible(
            &self.client,
            &self.base_url,
            "local-llama-cpp",
            "llama.cpp",
        )
        .await
    }
}

#[derive(Deserialize)]
struct OpenAiCompatibleModelsResponse {
    data: Vec<OpenAiCompatibleModel>,
}

#[derive(Deserialize)]
struct OpenAiCompatibleModel {
    id: String,
}

async fn detect_openai_compatible(
    client: &Client,
    base_url: &str,
    provider_id: &str,
    provider_name: &str,
) -> Result<Option<DetectedProvider>> {
    let response = match client
        .get(format!("{}/v1/models", base_url.trim_end_matches('/')))
        .send()
        .await
    {
        Ok(response) => response,
        Err(_) => return Ok(None),
    };

    let response = match response.error_for_status() {
        Ok(response) => response,
        Err(_) => return Ok(None),
    };
    let payload: OpenAiCompatibleModelsResponse = response
        .json()
        .await
        .context("failed to decode openai-compatible model list")?;

    Ok(Some(DetectedProvider {
        id: provider_id.to_string(),
        name: provider_name.to_string(),
        npm_package: Some("@ai-sdk/openai".to_string()),
        base_url: base_url.to_string(),
        discovery_status: ProviderDiscoveryStatus::Reachable,
        models: payload
            .data
            .into_iter()
            .map(|model| DetectedProviderModel {
                display_name: model.id.clone(),
                model_id: model.id,
            })
            .collect(),
    }))
}

fn default_client() -> Client {
    Client::builder()
        .timeout(Duration::from_millis(500))
        .build()
        .expect("local detector client should build")
}
