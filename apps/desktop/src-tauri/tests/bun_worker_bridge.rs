use lunaria_desktop::ai_worker::{
    BunWorkerBridge, BunWorkerConfig, EmbeddingRequest, StreamMessage, StreamRequest,
};

#[tokio::test]
async fn bun_worker_reports_health_over_json_rpc() {
    let worker = BunWorkerBridge::new(BunWorkerConfig::default())
        .await
        .expect("worker should start");

    let health = worker.health_check().await.expect("health check should succeed");

    assert_eq!(health.status, "ok");
    assert!(health.pid > 0);
}

#[tokio::test]
async fn bun_worker_streams_mock_completion_tokens() {
    let worker = BunWorkerBridge::new(BunWorkerConfig::default())
        .await
        .expect("worker should start");

    let stream = worker
        .stream_completion(StreamRequest {
            provider_id: "mock".to_string(),
            model_id: "mock-echo".to_string(),
            session_id: "session-stream".to_string(),
            api_key: Some("test-api-key".to_string()),
            reasoning_mode: None,
            reasoning_effort: None,
            messages: vec![StreamMessage {
                role: "user".to_string(),
                content: "hello bridge".to_string(),
            }],
        })
        .await
        .expect("stream request should succeed");

    assert_eq!(stream.tokens, vec!["hello".to_string(), "bridge".to_string()]);
    assert_eq!(stream.final_text, "hello bridge");
}

#[tokio::test]
async fn bun_worker_generates_deterministic_mock_embeddings() {
    let worker = BunWorkerBridge::new(BunWorkerConfig::default())
        .await
        .expect("worker should start");

    let embedding = worker
        .generate_embedding(EmbeddingRequest {
            provider_id: "mock".to_string(),
            model_id: "mock-embed".to_string(),
            api_key: Some("test-api-key".to_string()),
            input: "abc".to_string(),
        })
        .await
        .expect("embedding request should succeed");

    assert_eq!(embedding.vector.len(), 1536);
    assert_eq!(embedding.vector[0], 3.0);
}

#[tokio::test]
async fn bun_worker_restarts_after_crash() {
    let worker = BunWorkerBridge::new(BunWorkerConfig::default())
        .await
        .expect("worker should start");
    let first_health = worker.health_check().await.expect("health check should succeed");

    worker.crash_for_test().await.expect("worker crash request should complete");

    let second_health = worker
        .health_check()
        .await
        .expect("health check should restart worker");

    assert_ne!(first_health.pid, second_health.pid);
}
