import type { SessionRecord } from "./types";

export const initialSessionRecords: SessionRecord[] = [
  { id: "1", title: "JWT Auth Refactor", model: "Claude 4 Sonnet", provider: "claude", hasActivity: true, permission: "full", continueIn: "local", branch: "main", isEmpty: false },
  { id: "2", title: "Rate Limiter Design", model: "Gemini 2.5 Pro", provider: "gemini", hasActivity: false, permission: "default", continueIn: "local", branch: "codex/desktop-gui-prompt-1", isEmpty: false },
  { id: "3", title: "API Routes", model: "GPT-5.4", provider: "opencode", hasActivity: false, permission: "full", continueIn: "worktree", branch: "main", isEmpty: false },
];
