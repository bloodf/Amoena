use anyhow::{bail, Context, Result};
use reqwest::{Client, Response};
use serde::Serialize;
use serde_json::Value;

pub struct LunariaClient {
    pub base_url: String,
    pub token: String,
    pub json_output: bool,
    pub verbose: bool,
    http: Client,
}

impl LunariaClient {
    pub fn new(base_url: String, token: String, json_output: bool, verbose: bool) -> Self {
        let http = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("failed to build HTTP client");

        Self {
            base_url,
            token,
            json_output,
            verbose,
            http,
        }
    }

    pub async fn get(&self, path: &str) -> Result<Value> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → GET {}", url);
        }
        let resp = self
            .http
            .get(&url)
            .bearer_auth(&self.token)
            .send()
            .await
            .with_context(|| format!("GET {path} failed"))?;
        self.handle_response(resp, path).await
    }

    pub async fn post<B: Serialize>(&self, path: &str, body: &B) -> Result<Value> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → POST {}", url);
        }
        let resp = self
            .http
            .post(&url)
            .bearer_auth(&self.token)
            .json(body)
            .send()
            .await
            .with_context(|| format!("POST {path} failed"))?;
        self.handle_response(resp, path).await
    }

    pub async fn put<B: Serialize>(&self, path: &str, body: &B) -> Result<Value> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → PUT {}", url);
        }
        let resp = self
            .http
            .put(&url)
            .bearer_auth(&self.token)
            .json(body)
            .send()
            .await
            .with_context(|| format!("PUT {path} failed"))?;
        self.handle_response(resp, path).await
    }

    pub async fn delete(&self, path: &str) -> Result<Value> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → DELETE {}", url);
        }
        let resp = self
            .http
            .delete(&url)
            .bearer_auth(&self.token)
            .send()
            .await
            .with_context(|| format!("DELETE {path} failed"))?;
        self.handle_response(resp, path).await
    }

    pub async fn get_streaming(&self, path: &str) -> Result<Response> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → GET (stream) {}", url);
        }
        self.http
            .get(&url)
            .bearer_auth(&self.token)
            .send()
            .await
            .with_context(|| format!("GET {path} stream failed"))
    }

    pub async fn get_with_status(&self, path: &str) -> Result<(u16, Value)> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → GET {}", url);
        }
        let resp = self
            .http
            .get(&url)
            .bearer_auth(&self.token)
            .send()
            .await
            .with_context(|| format!("GET {path} failed"))?;
        let status = resp.status().as_u16();
        let body = resp.text().await.unwrap_or_default();
        let value = serde_json::from_str(&body).unwrap_or(Value::Null);
        Ok((status, value))
    }

    pub async fn post_with_status<B: Serialize>(&self, path: &str, body: &B) -> Result<(u16, Value)> {
        let url = format!("{}{}", self.base_url, path);
        if self.verbose {
            eprintln!("  → POST {}", url);
        }
        let resp = self
            .http
            .post(&url)
            .bearer_auth(&self.token)
            .json(body)
            .send()
            .await
            .with_context(|| format!("POST {path} failed"))?;
        let status = resp.status().as_u16();
        let body = resp.text().await.unwrap_or_default();
        let value = serde_json::from_str(&body).unwrap_or(Value::Null);
        Ok((status, value))
    }

    async fn handle_response(&self, resp: Response, path: &str) -> Result<Value> {
        let status = resp.status();
        if self.verbose {
            eprintln!(
                "  ← {} {}",
                status.as_u16(),
                status.canonical_reason().unwrap_or("")
            );
        }
        let body = resp.text().await.unwrap_or_default();
        if !status.is_success() {
            let detail = serde_json::from_str::<Value>(&body)
                .ok()
                .and_then(|v| v.get("error").and_then(|e| e.as_str()).map(String::from))
                .unwrap_or_else(|| body.clone());
            bail!("{path} → {} {}", status.as_u16(), detail);
        }
        if body.is_empty() {
            return Ok(Value::Null);
        }
        serde_json::from_str(&body)
            .with_context(|| format!("invalid JSON from {path}: {}", &body[..body.len().min(200)]))
    }
}
