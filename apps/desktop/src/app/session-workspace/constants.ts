/** CLI wrapper providers that spawn local CLI tools (always available). */
export const CLI_WRAPPER_PROVIDERS = [
  {
    id: 'claude',
    label: 'Claude Code',
    desc: 'Anthropic CLI — deep reasoning and precise edits',
    models: ['Claude 4 Sonnet', 'Claude 4 Opus', 'Claude 3.5 Sonnet'],
    color: 'orange',
    featured: false,
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    desc: 'OpenAI CLI agent — multi-agent orchestration',
    models: ['GPT-5.4', 'GPT-5.3-Codex', 'GPT-5.2'],
    color: 'emerald',
    featured: false,
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    desc: 'OpenAI Codex — autonomous code generation',
    models: ['Codex Mini', 'Codex Standard'],
    color: 'emerald',
    featured: false,
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    desc: 'Google Gemini — large context, multi-modal',
    models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
    color: 'purple',
    featured: false,
  },
];

/** Maps CLI wrapper provider IDs to their TUI type and executable names. */
export const CLI_WRAPPER_IDS: Record<string, { tuiType: string; executable: string }> = {
  claude: { tuiType: 'claude-code', executable: 'claude' },
  opencode: { tuiType: 'opencode', executable: 'opencode' },
  codex: { tuiType: 'codex', executable: 'codex' },
  gemini: { tuiType: 'gemini', executable: 'gemini' },
};

/** Native API provider IDs (direct API calls using stored/env API keys). */
export const NATIVE_PROVIDERS = new Set(['anthropic', 'openai', 'google']);
