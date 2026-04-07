import {
  Brain,
  FolderOpen,
  Key,
  Layers,
  ScanSearch,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

export const setupWizardSteps = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'provider', label: 'Provider', icon: Key },
  { id: 'model', label: 'Model', icon: FolderOpen },
  { id: 'backend', label: 'Backend', icon: Layers },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'profile', label: 'Profile', icon: SlidersHorizontal },
  { id: 'compat', label: 'Compat', icon: ScanSearch },
] as const;

export const setupWizardWelcomeFeatures = [
  { label: 'Native agents', desc: 'Direct provider access' },
  { label: 'Wrapper mode', desc: 'Claude Code, OpenCode, Codex' },
  { label: 'Memory system', desc: 'Persistent context' },
] as const;

export const setupWizardProviders = [
  { name: 'Anthropic', providerId: 'claude' },
  { name: 'OpenAI', providerId: 'opencode' },
  { name: 'Google', providerId: 'gemini' },
] as const;

export const setupWizardModels = [
  { value: 'claude-4-sonnet', label: 'Claude 4 Sonnet' },
  { value: 'claude-4-opus', label: 'Claude 4 Opus' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gemini-2', label: 'Gemini 2.0' },
] as const;

export const setupWizardThemes = ['dark', 'light', 'system'] as const;
export const setupWizardReasoningModes = ['off', 'auto', 'on'] as const;
export const setupWizardKeybindingPresets = ['Default', 'Vim', 'Emacs'] as const;
export const setupWizardModes = ['native', 'wrapper'] as const;
export const setupWizardBackends = [
  { id: 'claude-code', label: 'Claude Code', status: 'installed' },
  { id: 'opencode', label: 'OpenCode', status: 'installed' },
  { id: 'codex', label: 'Codex CLI', status: 'optional' },
  { id: 'gemini', label: 'Gemini CLI', status: 'optional' },
] as const;
