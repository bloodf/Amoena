export type TuiProvider = "amoena" | "claude" | "opencode" | "codex" | "gemini" | "ollama";

export interface SessionRecord {
  id: string;
  title: string;
  model: string;
  provider: TuiProvider;
  hasActivity: boolean;
  permission: string;
  continueIn: "local" | "worktree" | "cloud";
  branch: string;
  isEmpty: boolean;
}

export type WorkspaceTabItem =
  | { type: "session"; id: string }
  | { type: "file"; id: string; fileName: string };
