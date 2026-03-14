export const providerIdentityTokens = {
  claude: "hsl(var(--tui-claude))",
  opencode: "hsl(var(--tui-opencode))",
  codex: "hsl(var(--tui-codex))",
  gemini: "hsl(var(--tui-gemini))",
  anthropic: "hsl(var(--tui-claude))",
  openai: "hsl(var(--tui-codex))",
  google: "hsl(var(--tui-gemini))",
  ollama: "hsl(var(--green))",
} as const;

export const stateTokens = {
  streaming: "hsl(var(--magenta))",
  thinking: "hsl(var(--purple))",
  reasoning: "hsl(var(--deep-purple))",
  active: "hsl(var(--success))",
  idle: "hsl(var(--muted-foreground))",
  blocked: "hsl(var(--destructive))",
  waitingApproval: "hsl(var(--warning))",
  reviewing: "hsl(var(--rose))",
  success: "hsl(var(--success))",
  error: "hsl(var(--destructive))",
  disconnected: "hsl(var(--muted-foreground))",
} as const;

export const rateLimitPressureTokens = {
  safe: "hsl(var(--success))",
  caution: "hsl(var(--warning))",
  warning: "hsl(var(--rose))",
  exhausted: "hsl(var(--destructive))",
} as const;

export const permissionStateTokens = {
  ask: "hsl(var(--warning))",
  acceptEdits: "hsl(var(--success))",
  fullAccess: "hsl(var(--magenta))",
  denied: "hsl(var(--destructive))",
  pending: "hsl(var(--warning))",
} as const;

export const workspaceMergeStateTokens = {
  pending: "hsl(var(--warning))",
  approved: "hsl(var(--success))",
  blocked: "hsl(var(--destructive))",
  applied: "hsl(var(--success))",
  dismissed: "hsl(var(--muted-foreground))",
  conflicted: "hsl(var(--destructive))",
} as const;

export const statusBarTokens = {
  runtimeLocal: "hsl(var(--success))",
  runtimeRelay: "hsl(var(--deep-purple))",
  runtimeOffline: "hsl(var(--muted-foreground))",
  runtimeDegraded: "hsl(var(--warning))",
  contextSafe: "hsl(var(--success))",
  contextWarn: "hsl(var(--warning))",
  contextCritical: "hsl(var(--destructive))",
} as const;
