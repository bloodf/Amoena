use std::{
    collections::{HashMap, HashSet},
    net::{IpAddr, SocketAddr},
    sync::{Arc, Mutex},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use anyhow::{anyhow, Context, Result};
use axum::Router;
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    Key, XChaCha20Poly1305, XNonce,
};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rand::{rngs::OsRng, RngCore};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use tauri::async_runtime::JoinHandle;
use tokio::{net::TcpListener, sync::oneshot};
use tracing::warn;
use uuid::Uuid;
use x25519_dalek::{EphemeralSecret, PublicKey};

use crate::persistence::{
    repositories::{clock::utc_now, devices::DeviceRepository},
    Database, DeviceRecord, DeviceStatus, DeviceType,
};

const REMOTE_AUDIENCE: &str = "lunaria-remote";
const REMOTE_ISSUER: &str = "lunaria-desktop";
const ACCESS_TOKEN_TTL_SECONDS: u64 = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS: u64 = 30 * 24 * 60 * 60;
const MAX_PAIRING_ATTEMPTS: u8 = 3;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceMetadata {
    pub name: String,
    #[serde(rename = "type", alias = "deviceType")]
    pub device_type: DeviceType,
    pub platform: Option<String>,
    #[serde(default)]
    pub metadata: Value,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PairingIntentResponse {
    pub pairing_token: String,
    pub pin: String,
    pub pin_code: String,
    pub qr_payload: String,
    pub base_url: String,
    pub server_url: String,
    pub expires_at_unix_ms: u64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PairingCompleteResponse {
    pub token_type: String,
    pub access_token: String,
    pub refresh_token: String,
    pub device_id: String,
    pub scopes: Vec<String>,
    pub base_url: String,
    pub server_url: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LanListenerStatus {
    pub enabled: bool,
    pub bind_address: String,
    pub base_url: Option<String>,
    pub lan_base_url: Option<String>,
    pub relay_endpoint: String,
    pub pairing_pin_ttl_seconds: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RelayRoomResponse {
    pub room_id: String,
    pub relay_endpoint: String,
    pub server_public_key: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RelayJoinResponse {
    pub room_id: String,
    pub server_public_key: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelayJoinRequest {
    pub client_public_key: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelayCommandRequest {
    pub request_id: String,
    pub nonce: String,
    pub ciphertext: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RelayRoomEvent {
    pub event_id: i64,
    pub request_id: String,
    pub nonce: String,
    pub ciphertext: String,
}

#[derive(Clone, Debug)]
pub struct AuthenticatedRemoteDevice {
    pub device_id: String,
    pub scopes: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct RemoteClaims {
    iss: String,
    aud: String,
    sub: String,
    exp: usize,
    iat: usize,
    jti: String,
    family_id: String,
    scopes: Vec<String>,
    kind: String,
}

#[derive(Clone)]
pub struct RemoteAccessService {
    devices: DeviceRepository,
    pairing_pin_ttl: Duration,
    relay_endpoint: String,
    secret: Arc<Vec<u8>>,
    pairings: Arc<Mutex<HashMap<String, PairingRegistration>>>,
    relay_rooms: Arc<Mutex<HashMap<String, RelayRoom>>>,
    lan_listener: Arc<Mutex<Option<LanListenerHandle>>>,
}

#[derive(Clone)]
struct PairingRegistration {
    pin: String,
    base_url: String,
    expires_at: SystemTime,
    attempts: u8,
    scopes: Vec<String>,
}

struct RelayRoom {
    server_secret: Option<EphemeralSecret>,
    server_public_key: String,
    shared_key: Option<[u8; 32]>,
    events: Vec<RelayRoomEvent>,
    seen_request_ids: HashSet<String>,
    next_event_id: i64,
}

struct LanListenerHandle {
    bind_address: String,
    base_url: String,
    shutdown_tx: Option<oneshot::Sender<()>>,
    task: JoinHandle<Result<()>>,
}

impl RemoteAccessService {
    pub fn new(database: Arc<Database>, pairing_pin_ttl: Duration, relay_endpoint: String) -> Self {
        Self {
            devices: DeviceRepository::new(database),
            pairing_pin_ttl,
            relay_endpoint,
            secret: Arc::new(issue_secret()),
            pairings: Arc::new(Mutex::new(HashMap::new())),
            relay_rooms: Arc::new(Mutex::new(HashMap::new())),
            lan_listener: Arc::new(Mutex::new(None)),
        }
    }

    pub fn relay_endpoint(&self) -> &str {
        &self.relay_endpoint
    }

    pub async fn shutdown(&self) -> Result<()> {
        self.disable_lan_listener().await.map(|_| ())
    }

    pub fn lan_status(&self) -> Result<LanListenerStatus> {
        let listener = self.lan_listener.lock().expect("lan listener mutex poisoned");
        Ok(match listener.as_ref() {
            Some(handle) => LanListenerStatus {
                enabled: true,
                bind_address: handle.bind_address.clone(),
                base_url: Some(handle.base_url.clone()),
                lan_base_url: Some(handle.base_url.clone()),
                relay_endpoint: self.relay_endpoint.clone(),
                pairing_pin_ttl_seconds: self.pairing_pin_ttl.as_secs() as i64,
            },
            None => LanListenerStatus {
                enabled: false,
                bind_address: "0.0.0.0".to_string(),
                base_url: None,
                lan_base_url: None,
                relay_endpoint: self.relay_endpoint.clone(),
                pairing_pin_ttl_seconds: self.pairing_pin_ttl.as_secs() as i64,
            },
        })
    }

    pub async fn enable_lan_listener(
        &self,
        router: Router,
        bind_address: &str,
        port: Option<u16>,
    ) -> Result<LanListenerStatus> {
        self.disable_lan_listener().await?;

        let ip: IpAddr = bind_address
            .parse()
            .with_context(|| format!("invalid bind address {bind_address}"))?;
        let listener = TcpListener::bind(SocketAddr::new(ip, port.unwrap_or(0)))
            .await
            .context("failed to bind lan listener")?;
        let addr = listener.local_addr().context("failed to read lan listener addr")?;
        let base_url = advertised_base_url(addr, bind_address);
        let (shutdown_tx, shutdown_rx) = oneshot::channel();

        let task = tauri::async_runtime::spawn(async move {
            axum::serve(listener, router)
                .with_graceful_shutdown(async move {
                    let _ = shutdown_rx.await;
                })
                .await
                .context("lan listener terminated unexpectedly")
        });

        {
            let mut guard = self.lan_listener.lock().expect("lan listener mutex poisoned");
            *guard = Some(LanListenerHandle {
                bind_address: bind_address.to_string(),
                base_url: base_url.clone(),
                shutdown_tx: Some(shutdown_tx),
                task,
            });
        }

        Ok(LanListenerStatus {
            enabled: true,
            bind_address: bind_address.to_string(),
            base_url: Some(base_url.clone()),
            lan_base_url: Some(base_url),
            relay_endpoint: self.relay_endpoint.clone(),
            pairing_pin_ttl_seconds: self.pairing_pin_ttl.as_secs() as i64,
        })
    }

    pub async fn disable_lan_listener(&self) -> Result<LanListenerStatus> {
        let handle = {
            self.lan_listener
                .lock()
                .expect("lan listener mutex poisoned")
                .take()
        };

        if let Some(mut handle) = handle {
            if let Some(tx) = handle.shutdown_tx.take() {
                let _ = tx.send(());
            }
            handle.task.await.context("lan listener join failed")??;
        }

        Ok(LanListenerStatus {
            enabled: false,
            bind_address: "0.0.0.0".to_string(),
            base_url: None,
            lan_base_url: None,
            relay_endpoint: self.relay_endpoint.clone(),
            pairing_pin_ttl_seconds: self.pairing_pin_ttl.as_secs() as i64,
        })
    }

    pub fn create_pairing_intent(&self, advertised_host: Option<&str>) -> Result<PairingIntentResponse> {
        let listener = self
            .lan_listener
            .lock()
            .expect("lan listener mutex poisoned");
        let Some(listener) = listener.as_ref() else {
            anyhow::bail!("lan listener is not enabled");
        };

        let base_url = rewrite_host(&listener.base_url, advertised_host)?;
        let pairing_token = Uuid::new_v4().to_string();
        let pin = generate_pin(&pairing_token);
        let expires_at = SystemTime::now() + self.pairing_pin_ttl;
        let qr_payload = format_pairing_url(&base_url, &pin, &pairing_token)?;

        self.pairings
            .lock()
            .expect("pairing registry poisoned")
            .insert(
                pairing_token.clone(),
                PairingRegistration {
                    pin: pin.clone(),
                    base_url: base_url.clone(),
                    expires_at,
                    attempts: 0,
                    scopes: default_remote_scopes(),
                },
            );

        Ok(PairingIntentResponse {
            pairing_token,
            pin: pin.clone(),
            pin_code: pin,
            qr_payload,
            base_url: base_url.clone(),
            server_url: base_url,
            expires_at_unix_ms: unix_millis(expires_at),
        })
    }

    pub fn set_pairing_scopes(&self, pairing_token: &str, scopes: Vec<String>) -> Result<()> {
        let mut pairings = self.pairings.lock().expect("pairing registry poisoned");
        let Some(pairing) = pairings.get_mut(pairing_token) else {
            anyhow::bail!("pairing token not found");
        };
        pairing.scopes = if scopes.is_empty() {
            default_remote_scopes()
        } else {
            scopes
        };
        Ok(())
    }

    pub fn create_relay_room(&self) -> Result<RelayRoomResponse> {
        let server_secret = EphemeralSecret::random_from_rng(OsRng);
        let server_public = PublicKey::from(&server_secret);
        let room_id = Uuid::new_v4().to_string();
        let server_public_key = B64.encode(server_public.as_bytes());

        self.relay_rooms
            .lock()
            .expect("relay room registry poisoned")
            .insert(
                room_id.clone(),
                RelayRoom {
                    server_secret: Some(server_secret),
                    server_public_key: server_public_key.clone(),
                    shared_key: None,
                    events: Vec::new(),
                    seen_request_ids: HashSet::new(),
                    next_event_id: 1,
                },
            );

        Ok(RelayRoomResponse {
            room_id,
            relay_endpoint: self.relay_endpoint.clone(),
            server_public_key,
        })
    }

    pub fn join_relay_room(
        &self,
        room_id: &str,
        request: RelayJoinRequest,
    ) -> Result<RelayJoinResponse> {
        let mut rooms = self.relay_rooms.lock().expect("relay room registry poisoned");
        let room = rooms
            .get_mut(room_id)
            .ok_or_else(|| anyhow!("relay room not found"))?;

        let client_public_key_bytes: [u8; 32] = B64
            .decode(request.client_public_key)
            .context("failed to decode client public key")?
            .try_into()
            .map_err(|_| anyhow!("invalid client public key length"))?;
        let client_public_key = PublicKey::from(client_public_key_bytes);

        let Some(server_secret) = room.server_secret.take() else {
            anyhow::bail!("relay room already joined");
        };
        let shared_secret = server_secret.diffie_hellman(&client_public_key);
        room.shared_key = Some(*shared_secret.as_bytes());

        Ok(RelayJoinResponse {
            room_id: room_id.to_string(),
            server_public_key: room.server_public_key.clone(),
        })
    }

    pub fn accept_relay_command(
        &self,
        room_id: &str,
        command: RelayCommandRequest,
    ) -> Result<Option<Value>> {
        let mut rooms = self.relay_rooms.lock().expect("relay room registry poisoned");
        let room = rooms
            .get_mut(room_id)
            .ok_or_else(|| anyhow!("relay room not found"))?;
        if room.seen_request_ids.contains(&command.request_id) {
            return Ok(None);
        }

        let plaintext = decrypt_envelope(
            room.shared_key.ok_or_else(|| anyhow!("relay room not joined"))?,
            &command.nonce,
            &command.ciphertext,
        )?;
        let payload = serde_json::from_slice::<Value>(&plaintext)
            .context("failed to deserialize relay payload")?;
        room.seen_request_ids.insert(command.request_id);
        Ok(Some(payload))
    }

    pub fn push_relay_response(
        &self,
        room_id: &str,
        request_id: &str,
        payload: &Value,
    ) -> Result<RelayRoomEvent> {
        let mut rooms = self.relay_rooms.lock().expect("relay room registry poisoned");
        let room = rooms
            .get_mut(room_id)
            .ok_or_else(|| anyhow!("relay room not found"))?;
        let shared_key = room.shared_key.ok_or_else(|| anyhow!("relay room not joined"))?;
        let (nonce, ciphertext) = encrypt_envelope(
            shared_key,
            &serde_json::to_vec(payload).context("failed to serialize relay response")?,
        )?;

        let event = RelayRoomEvent {
            event_id: room.next_event_id,
            request_id: request_id.to_string(),
            nonce,
            ciphertext,
        };
        room.next_event_id += 1;
        room.events.push(event.clone());
        Ok(event)
    }

    pub fn relay_events_since(&self, room_id: &str, last_event_id: Option<i64>) -> Result<Vec<RelayRoomEvent>> {
        let rooms = self.relay_rooms.lock().expect("relay room registry poisoned");
        let room = rooms
            .get(room_id)
            .ok_or_else(|| anyhow!("relay room not found"))?;
        Ok(room
            .events
            .iter()
            .filter(|event| event.event_id > last_event_id.unwrap_or(0))
            .cloned()
            .collect())
    }

    pub fn complete_pairing(
        &self,
        token: &str,
        pin: &str,
        metadata: DeviceMetadata,
    ) -> Result<PairingCompleteResponse> {
        let mut pairings = self.pairings.lock().expect("pairing registry poisoned");
        let pairing = pairings
            .get_mut(token)
            .ok_or_else(|| anyhow!("pairing token not found"))?;

        if SystemTime::now() > pairing.expires_at {
            pairings.remove(token);
            anyhow::bail!("pairing token expired");
        }
        if pairing.pin != pin {
            pairing.attempts += 1;
            if pairing.attempts >= MAX_PAIRING_ATTEMPTS {
                pairings.remove(token);
            }
            anyhow::bail!("pairing pin rejected");
        }

        let base_url = pairing.base_url.clone();
        let scopes = pairing.scopes.clone();
        pairings.remove(token);
        drop(pairings);

        let device_id = Uuid::new_v4().to_string();
        let token_family_id = Uuid::new_v4().to_string();
        let refresh_token = self.issue_token(
            &device_id,
            &token_family_id,
            &scopes,
            "refresh",
            REFRESH_TOKEN_TTL_SECONDS,
        )?;
        let access_token = self.issue_token(
            &device_id,
            &token_family_id,
            &scopes,
            "access",
            ACCESS_TOKEN_TTL_SECONDS,
        )?;
        let now = utc_now();

        self.devices.upsert(&DeviceRecord {
            device_id: device_id.clone(),
            name: metadata.name,
            device_type: metadata.device_type,
            platform: metadata.platform,
            paired_at: now.clone(),
            last_seen: now,
            refresh_token_hash: hash_token(&refresh_token),
            token_family_id,
            scopes: scopes.clone(),
            status: DeviceStatus::Active,
            metadata: metadata.metadata,
            revoked_at: None,
        })?;

        Ok(PairingCompleteResponse {
            token_type: "Bearer".to_string(),
            access_token,
            refresh_token,
            device_id,
            scopes,
            base_url: base_url.clone(),
            server_url: base_url,
        })
    }

    pub fn refresh(&self, refresh_token: &str) -> Result<PairingCompleteResponse> {
        let claims = self.decode_token(refresh_token, "refresh")?;
        let Some(mut device) = self.devices.get_by_token_family(&claims.family_id)? else {
            anyhow::bail!("device token family not found");
        };

        if device.status != DeviceStatus::Active || device.revoked_at.is_some() {
            anyhow::bail!("device revoked");
        }

        if hash_token(refresh_token) != device.refresh_token_hash {
            device.status = DeviceStatus::Revoked;
            device.revoked_at = Some(utc_now());
            self.devices.upsert(&device)?;
            warn!(event = "remote_refresh_reuse_detected", device_id = %device.device_id);
            anyhow::bail!("refresh token reuse detected");
        }

        let access_token = self.issue_token(
            &device.device_id,
            &device.token_family_id,
            &device.scopes,
            "access",
            ACCESS_TOKEN_TTL_SECONDS,
        )?;
        let next_refresh_token = self.issue_token(
            &device.device_id,
            &device.token_family_id,
            &device.scopes,
            "refresh",
            REFRESH_TOKEN_TTL_SECONDS,
        )?;

        device.refresh_token_hash = hash_token(&next_refresh_token);
        device.last_seen = utc_now();
        self.devices.upsert(&device)?;

        let device_id = device.device_id.clone();
        let scopes = device.scopes.clone();
        let base_url = self
            .lan_status()?
            .base_url
            .unwrap_or_else(|| "http://127.0.0.1".to_string());

        Ok(PairingCompleteResponse {
            token_type: "Bearer".to_string(),
            access_token,
            refresh_token: next_refresh_token,
            device_id,
            scopes,
            base_url: base_url.clone(),
            server_url: base_url,
        })
    }

    pub fn list_devices(&self) -> Result<Vec<DeviceRecord>> {
        self.devices.list()
    }

    pub fn get_device(&self, device_id: &str) -> Result<Option<DeviceRecord>> {
        self.devices.get(device_id)
    }

    pub fn revoke_device(&self, device_id: &str) -> Result<()> {
        let Some(mut device) = self.devices.get(device_id)? else {
            anyhow::bail!("device not found");
        };
        device.status = DeviceStatus::Revoked;
        device.revoked_at = Some(utc_now());
        self.devices.upsert(&device)
    }

    pub fn revoke_refresh_token(&self, refresh_token: &str) -> Result<()> {
        let claims = self.decode_token(refresh_token, "refresh")?;
        let Some(mut device) = self.devices.get_by_token_family(&claims.family_id)? else {
            anyhow::bail!("device token family not found");
        };
        device.status = DeviceStatus::Revoked;
        device.revoked_at = Some(utc_now());
        self.devices.upsert(&device)
    }

    pub fn authenticate_access_token(&self, token: &str) -> Result<Option<AuthenticatedRemoteDevice>> {
        let claims = match self.decode_token(token, "access") {
            Ok(claims) => claims,
            Err(_) => return Ok(None),
        };
        let Some(mut device) = self.devices.get(&claims.sub)? else {
            return Ok(None);
        };
        if device.status != DeviceStatus::Active || device.revoked_at.is_some() {
            return Ok(None);
        }
        if device.token_family_id != claims.family_id {
            return Ok(None);
        }

        device.last_seen = utc_now();
        self.devices.upsert(&device)?;

        Ok(Some(AuthenticatedRemoteDevice {
            device_id: device.device_id,
            scopes: claims.scopes,
        }))
    }

    fn issue_token(
        &self,
        device_id: &str,
        token_family_id: &str,
        scopes: &[String],
        kind: &str,
        ttl_seconds: u64,
    ) -> Result<String> {
        let now = unix_seconds(SystemTime::now()) as usize;
        encode(
            &Header::new(Algorithm::HS256),
            &RemoteClaims {
                iss: REMOTE_ISSUER.to_string(),
                aud: REMOTE_AUDIENCE.to_string(),
                sub: device_id.to_string(),
                exp: now + ttl_seconds as usize,
                iat: now,
                jti: Uuid::new_v4().to_string(),
                family_id: token_family_id.to_string(),
                scopes: scopes.to_vec(),
                kind: kind.to_string(),
            },
            &EncodingKey::from_secret(self.secret.as_slice()),
        )
        .context("failed to encode remote jwt")
    }

    fn decode_token(&self, token: &str, expected_kind: &str) -> Result<RemoteClaims> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_audience(&[REMOTE_AUDIENCE]);
        validation.set_issuer(&[REMOTE_ISSUER]);
        let claims = decode::<RemoteClaims>(
            token,
            &DecodingKey::from_secret(self.secret.as_slice()),
            &validation,
        )
        .context("failed to decode remote jwt")?
        .claims;
        if claims.kind != expected_kind {
            anyhow::bail!("unexpected remote token kind");
        }
        Ok(claims)
    }
}

fn default_remote_scopes() -> Vec<String> {
    vec![
        "sessions:read".to_string(),
        "sessions:write".to_string(),
        "agents:read".to_string(),
        "agents:control".to_string(),
        "terminal:read".to_string(),
        "terminal:write".to_string(),
        "settings:read".to_string(),
        "admin:devices".to_string(),
    ]
}

fn format_pairing_url(base_url: &str, pin: &str, pairing_token: &str) -> Result<String> {
    let url = Url::parse(base_url).with_context(|| format!("invalid listener base url: {base_url}"))?;
    let host = url.host_str().unwrap_or("127.0.0.1");
    let port = url.port_or_known_default().unwrap_or(80);
    Ok(format!(
        "lunaria://pair?host={host}&port={port}&pin={pin}&token={pairing_token}&tls=false"
    ))
}

fn rewrite_host(base_url: &str, advertised_host: Option<&str>) -> Result<String> {
    let Some(advertised_host) = advertised_host else {
        return Ok(base_url.to_string());
    };
    let mut url = Url::parse(base_url).with_context(|| format!("invalid base url: {base_url}"))?;
    url.set_host(Some(advertised_host))
        .with_context(|| format!("invalid advertised host: {advertised_host}"))?;
    Ok(url.to_string().trim_end_matches('/').to_string())
}

fn advertised_base_url(local_addr: SocketAddr, bind_address: &str) -> String {
    let host = match bind_address.parse::<IpAddr>().ok() {
        Some(IpAddr::V4(ip)) if !ip.is_unspecified() => ip.to_string(),
        Some(IpAddr::V6(ip)) if !ip.is_unspecified() => ip.to_string(),
        _ => detect_advertised_host().unwrap_or_else(|| "127.0.0.1".to_string()),
    };
    format!("http://{}:{}", host, local_addr.port())
}

fn detect_advertised_host() -> Option<String> {
    let socket = std::net::UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect("8.8.8.8:80").ok()?;
    match socket.local_addr().ok()?.ip() {
        IpAddr::V4(ip) if !ip.is_unspecified() => Some(ip.to_string()),
        IpAddr::V6(ip) if !ip.is_unspecified() => Some(ip.to_string()),
        _ => None,
    }
}

fn generate_pin(seed: &str) -> String {
    let digest = Sha256::digest(seed.as_bytes());
    let value = u32::from_be_bytes([digest[0], digest[1], digest[2], digest[3]]) % 1_000_000;
    format!("{value:06}")
}

fn hash_token(token: &str) -> String {
    format!("{:x}", Sha256::digest(token.as_bytes()))
}

fn encrypt_envelope(shared_key: [u8; 32], plaintext: &[u8]) -> Result<(String, String)> {
    let cipher = XChaCha20Poly1305::new(Key::from_slice(&shared_key));
    let mut nonce = [0u8; 24];
    OsRng.fill_bytes(&mut nonce);
    let ciphertext = cipher
        .encrypt(XNonce::from_slice(&nonce), plaintext)
        .map_err(|_| anyhow!("failed to encrypt relay payload"))?;
    Ok((B64.encode(nonce), B64.encode(ciphertext)))
}

fn decrypt_envelope(shared_key: [u8; 32], nonce_b64: &str, ciphertext_b64: &str) -> Result<Vec<u8>> {
    let cipher = XChaCha20Poly1305::new(Key::from_slice(&shared_key));
    let nonce = B64
        .decode(nonce_b64)
        .context("failed to decode relay nonce")?;
    let ciphertext = B64
        .decode(ciphertext_b64)
        .context("failed to decode relay ciphertext")?;
    cipher
        .decrypt(XNonce::from_slice(&nonce), ciphertext.as_ref())
        .map_err(|_| anyhow!("failed to decrypt relay payload"))
}

fn issue_secret() -> Vec<u8> {
    let mut secret = Vec::with_capacity(64);
    secret.extend_from_slice(Uuid::new_v4().as_bytes());
    secret.extend_from_slice(Uuid::new_v4().as_bytes());
    secret
}

fn unix_seconds(value: SystemTime) -> u64 {
    value
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_secs()
}

fn unix_millis(value: SystemTime) -> u64 {
    value
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_millis() as u64
}
