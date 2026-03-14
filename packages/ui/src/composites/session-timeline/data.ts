import type { CheckpointRecord, TimelineChangedFile } from "./types";

export const sessionTimelineCheckpoints: CheckpointRecord[] = [
  { id: "cp1", label: "Session start", timestamp: "3:42 PM", tokensUsed: "0", filesChanged: 0, isCurrent: false },
  { id: "cp2", label: "Initial auth scaffold", timestamp: "3:45 PM", tokensUsed: "2.1k", filesChanged: 4, isCurrent: false },
  {
    id: "cp3",
    label: "JWT token rotation",
    timestamp: "3:52 PM",
    tokensUsed: "5.8k",
    filesChanged: 3,
    isCurrent: false,
    children: [{ id: "cp3b", label: "Alt: Session-based auth", timestamp: "3:53 PM", tokensUsed: "3.2k", filesChanged: 2, isCurrent: false, branch: "experiment/session-auth" }],
  },
  { id: "cp4", label: "Middleware integration", timestamp: "3:58 PM", tokensUsed: "8.4k", filesChanged: 6, isCurrent: false },
  { id: "cp4c", label: "Context compacted", timestamp: "4:00 PM", tokensUsed: "8.4k", filesChanged: 0, isCurrent: false, compaction: { observationCount: 12 } },
  { id: "cp5", label: "Error handling + tests", timestamp: "4:05 PM", tokensUsed: "12.4k", filesChanged: 8, isCurrent: true },
];

export const sessionTimelineChangedFiles: TimelineChangedFile[] = [
  { path: "src/auth/jwt.rs", additions: 142, deletions: 23, status: "modified" },
  { path: "src/auth/middleware.rs", additions: 89, deletions: 0, status: "added" },
  { path: "src/auth/mod.rs", additions: 12, deletions: 4, status: "modified" },
  { path: "src/config/auth.toml", additions: 28, deletions: 8, status: "modified" },
  { path: "tests/auth_test.rs", additions: 156, deletions: 0, status: "added" },
];

export const sessionTimelineDiffLines = [
  { type: "context", line: 14, content: "use jsonwebtoken::{encode, decode, Header, Algorithm};" },
  { type: "context", line: 15, content: "use chrono::{Utc, Duration};" },
  { type: "deletion", line: 16, content: "const TOKEN_EXPIRY: i64 = 3600; // 1 hour" },
  { type: "addition", line: 16, content: "const ACCESS_TOKEN_EXPIRY: i64 = 900;  // 15 minutes" },
  { type: "addition", line: 17, content: "const REFRESH_TOKEN_EXPIRY: i64 = 604800; // 7 days" },
  { type: "context", line: 18, content: "" },
  { type: "deletion", line: 19, content: "pub fn create_token(user_id: &str) -> Result<String> {" },
  { type: "addition", line: 19, content: "pub fn create_token_pair(user_id: &str) -> Result<TokenPair> {" },
  { type: "addition", line: 20, content: "    let access = create_access_token(user_id)?;" },
  { type: "addition", line: 21, content: "    let refresh = create_refresh_token(user_id)?;" },
  { type: "addition", line: 22, content: "    Ok(TokenPair { access, refresh })" },
  { type: "context", line: 23, content: "}" },
] as const;
