use std::collections::HashMap;
use std::sync::OnceLock;
use anyhow::{Context, Result};
use serde::Deserialize;
use tracing::{info, debug};

#[derive(Debug, Clone)]
pub struct ModelPricing {
    pub prompt_cost: f64,      // per token
    pub completion_cost: f64,  // per token
}

#[derive(Deserialize)]
struct OpenRouterResponse {
    data: Vec<OpenRouterModel>,
}

#[derive(Deserialize)]
struct OpenRouterModel {
    id: String,
    pricing: OpenRouterPricing,
}

#[derive(Deserialize)]
struct OpenRouterPricing {
    prompt: String,
    completion: String,
}

static PRICING_CACHE: OnceLock<HashMap<String, ModelPricing>> = OnceLock::new();

// Known model ID mappings from CLI tool names to OpenRouter IDs
const MODEL_ALIASES: &[(&str, &str)] = &[
    // Claude models
    ("claude-sonnet-4-5-20250514", "anthropic/claude-sonnet-4-5"),
    ("claude-sonnet-4-6", "anthropic/claude-sonnet-4-6"),
    ("claude-opus-4-5-20250514", "anthropic/claude-opus-4-5"),
    ("claude-opus-4-6", "anthropic/claude-opus-4-6"),
    ("claude-haiku-4-5-20251001", "anthropic/claude-haiku-4-5"),
    ("claude", "anthropic/claude-sonnet-4-6"),
    // OpenAI models
    ("gpt-5.4", "openai/gpt-5.4"),
    ("gpt-4o", "openai/gpt-4o"),
    ("o3-mini", "openai/o3-mini"),
    ("o4-mini", "openai/o4-mini"),
    // Gemini models
    ("gemini-3-flash-preview", "google/gemini-3-flash-preview"),
    ("gemini-2.5-pro", "google/gemini-2.5-pro-preview"),
    ("gemini-2.5-flash", "google/gemini-2.5-flash-preview"),
];

/// Fetch pricing from OpenRouter and cache it. Call once at startup.
pub fn init_pricing_cache() {
    let result = fetch_pricing();
    match result {
        Ok(map) => {
            let count = map.len();
            let _ = PRICING_CACHE.set(map);
            info!(models = count, "initialized model pricing cache from OpenRouter");
        }
        Err(err) => {
            debug!(?err, "failed to fetch pricing from OpenRouter, using fallback rates");
            let _ = PRICING_CACHE.set(HashMap::new());
        }
    }
}

fn fetch_pricing() -> Result<HashMap<String, ModelPricing>> {
    let response = ureq::get("https://openrouter.ai/api/v1/models")
        .call()
        .context("failed to fetch OpenRouter models")?;

    let body: OpenRouterResponse = response
        .into_body()
        .read_json()
        .context("failed to parse OpenRouter response")?;

    let mut map = HashMap::new();
    for model in body.data {
        let prompt_cost: f64 = model.pricing.prompt.parse().unwrap_or(0.0);
        let completion_cost: f64 = model.pricing.completion.parse().unwrap_or(0.0);

        if prompt_cost > 0.0 || completion_cost > 0.0 {
            map.insert(model.id, ModelPricing { prompt_cost, completion_cost });
        }
    }

    Ok(map)
}

/// Calculate cost for a given model and token counts.
/// Falls back to provider-level estimates if model not found.
pub fn calculate_cost(model_name: &str, provider: &str, input_tokens: i64, output_tokens: i64) -> f64 {
    static EMPTY_MAP: std::sync::LazyLock<HashMap<String, ModelPricing>> =
        std::sync::LazyLock::new(HashMap::new);

    let cache = PRICING_CACHE.get().unwrap_or(&EMPTY_MAP);

    // Try exact match first
    if let Some(pricing) = cache.get(model_name) {
        return (input_tokens as f64 * pricing.prompt_cost) + (output_tokens as f64 * pricing.completion_cost);
    }

    // Try with provider prefix
    let provider_lower = provider.to_lowercase();
    let provider_prefix = match provider_lower.as_str() {
        "anthropic" | "claude" => "anthropic",
        "openai" | "gpt" => "openai",
        "google" | "gemini" => "google",
        other => other,
    };
    let prefixed = format!("{}/{}", provider_prefix, model_name);
    if let Some(pricing) = cache.get(&prefixed) {
        return (input_tokens as f64 * pricing.prompt_cost) + (output_tokens as f64 * pricing.completion_cost);
    }

    // Try aliases
    let model_lower = model_name.to_lowercase();
    for (alias, canonical) in MODEL_ALIASES {
        if model_lower.contains(alias) {
            if let Some(pricing) = cache.get(*canonical) {
                return (input_tokens as f64 * pricing.prompt_cost) + (output_tokens as f64 * pricing.completion_cost);
            }
        }
    }

    // Try partial match: find any model in cache whose ID contains parts of our model name
    let model_parts: Vec<&str> = model_lower
        .split(|c: char| !c.is_alphanumeric())
        .filter(|s| s.len() > 3)
        .collect();
    for (id, pricing) in cache.iter() {
        let id_lower = id.to_lowercase();
        if model_parts.iter().any(|part| id_lower.contains(part)) && id_lower.contains(provider_prefix) {
            return (input_tokens as f64 * pricing.prompt_cost) + (output_tokens as f64 * pricing.completion_cost);
        }
    }

    // Fallback to hardcoded provider-level estimates
    fallback_cost(input_tokens, output_tokens, provider)
}

fn fallback_cost(input_tokens: i64, output_tokens: i64, provider: &str) -> f64 {
    let (input_rate, output_rate) = match provider.to_lowercase().as_str() {
        "anthropic" | "claude" => (3.0 / 1_000_000.0, 15.0 / 1_000_000.0),
        "openai" | "gpt" => (2.5 / 1_000_000.0, 10.0 / 1_000_000.0),
        "google" | "gemini" => (0.15 / 1_000_000.0, 0.60 / 1_000_000.0),
        _ => (2.0 / 1_000_000.0, 8.0 / 1_000_000.0),
    };
    (input_tokens as f64 * input_rate) + (output_tokens as f64 * output_rate)
}
