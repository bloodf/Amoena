export interface CliWrapperProvider {
  id: string;
  label: string;
  desc: string;
  models: string[];
  color: string;
  featured: boolean;
}

export interface CliWrapperId {
  tuiType: string;
  executable: string;
}

export const CLI_WRAPPER_PROVIDERS: CliWrapperProvider[] = [
  {
    id: 'claude',
    label: 'Claude',
    desc: "Anthropic's Claude with Code",
    models: ['claude-4-sonnet', 'claude-4-opus', 'claude-3-5-sonnet', 'claude-3-opus'],
    color: '#CC785C',
    featured: true,
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    desc: 'OpenCode CLI agent',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-5'],
    color: '#5B5B5B',
    featured: true,
  },
  {
    id: 'codex',
    label: 'Codex',
    desc: "OpenAI's Codex CLI",
    models: ['codex-mini', 'codex'],
    color: '#00A67E',
    featured: false,
  },
  {
    id: 'gemini',
    label: 'Gemini',
    desc: "Google's Gemini CLI agent",
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0'],
    color: '#4285F4',
    featured: false,
  },
];

export const CLI_WRAPPER_IDS: Record<string, CliWrapperId> = {
  claude: { tuiType: 'claude-code', executable: 'claude' },
  opencode: { tuiType: 'opencode', executable: 'opencode' },
  codex: { tuiType: 'codex', executable: 'codex' },
  gemini: { tuiType: 'gemini', executable: 'gemini' },
};

export const NATIVE_PROVIDERS = new Set<string>(['anthropic', 'openai', 'google']);
