import type { FileNode } from "./types";

export const mockFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "auth",
        type: "folder",
        children: [
          {
            name: "tokens.rs",
            type: "file",
            content: `use jsonwebtoken::{encode, decode, Header, Validation};
use chrono::{Utc, Duration};

pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

impl AuthService {
    pub fn issue_tokens(&self, user_id: &str) -> Result<TokenPair> {
        let access_claims = Claims {
            sub: user_id.to_string(),
            exp: (Utc::now() + Duration::minutes(15)).timestamp() as usize,
            iat: Utc::now().timestamp() as usize,
        };
        let access_token = encode(&Header::default(), &access_claims, &self.key)?;
        Ok(TokenPair { access_token, refresh_token: "...".into(), expires_in: 900 })
    }
}`,
          },
          {
            name: "middleware.rs",
            type: "file",
            content: `use axum::{middleware::Next, http::Request, response::Response};

pub async fn auth_middleware<B>(req: Request<B>, next: Next<B>) -> Response {
    let token = req.headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));
    
    match token {
        Some(t) => {
            // Validate JWT
            next.run(req).await
        }
        None => Response::builder().status(401).body("Unauthorized".into()).unwrap(),
    }
}`,
          },
          {
            name: "rate_limit.rs",
            type: "file",
            content: `pub struct RateLimiter {
    window_ms: u64,
    max_requests: u32,
}

impl RateLimiter {
    pub async fn check(&self, key: &str) -> Result<bool> {
        let count = self.redis.incr(key).await?;
        if count == 1 {
            self.redis.expire(key, self.window_ms / 1000).await?;
        }
        Ok(count <= self.max_requests)
    }
}`,
          },
        ],
      },
      {
        name: "handlers",
        type: "folder",
        children: [
          {
            name: "api.rs",
            type: "file",
            content: `use axum::{Router, routing::{get, post}};

pub fn api_routes() -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/auth/login", post(login))
        .route("/auth/refresh", post(refresh_token))
}

async fn health_check() -> &'static str { "OK" }`,
          },
          {
            name: "websocket.rs",
            type: "file",
            content: `use axum::extract::ws::{WebSocket, WebSocketUpgrade};

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        // Handle incoming messages
    }
}`,
          },
        ],
      },
      {
        name: "main.rs",
        type: "file",
        content: `mod auth;
mod handlers;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .merge(handlers::api::api_routes())
        .layer(middleware::from_fn(auth::middleware::auth_middleware));

    let addr = "0.0.0.0:3000".parse().unwrap();
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}`,
      },
      {
        name: "config.rs",
        type: "file",
        content: `use serde::Deserialize;

#[derive(Deserialize)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub redis_url: String,
}

impl Config {
    pub fn from_env() -> Self {
        envy::from_env().expect("Missing env vars")
    }
}`,
      },
    ],
  },
  {
    name: "Cargo.toml",
    type: "file",
    content: `[package]
name = "amoena-backend"
version = "0.3.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
jsonwebtoken = "9"
chrono = "0.4"
serde = { version = "1", features = ["derive"] }`,
  },
];
