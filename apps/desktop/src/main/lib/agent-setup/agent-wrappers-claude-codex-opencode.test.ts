import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import * as realOs from 'node:os';
import path from 'node:path';

const TEST_ROOT = path.join(
  realOs.tmpdir(),
  `amoena-claude-codex-oc-test-${process.pid}-${Date.now()}`,
);
const TEST_BIN_DIR = path.join(TEST_ROOT, 'amoena', 'bin');
const TEST_HOOKS_DIR = path.join(TEST_ROOT, 'amoena', 'hooks');
const TEST_ZSH_DIR = path.join(TEST_ROOT, 'amoena', 'zsh');
const TEST_BASH_DIR = path.join(TEST_ROOT, 'amoena', 'bash');
const TEST_OPENCODE_CONFIG_DIR = path.join(TEST_HOOKS_DIR, 'opencode');
const TEST_OPENCODE_PLUGIN_DIR = path.join(TEST_OPENCODE_CONFIG_DIR, 'plugin');
let mockedHomeDir = path.join(TEST_ROOT, 'home');

vi.mock('shared/env.shared', () => ({
  env: { DESKTOP_NOTIFICATIONS_PORT: 7777 },
  getWorkspaceName: () => undefined,
}));

vi.mock('./notify-hook', () => ({
  NOTIFY_SCRIPT_NAME: 'notify.sh',
  getNotifyScriptPath: () => path.join(TEST_HOOKS_DIR, 'notify.sh'),
  getNotifyScriptContent: () => '#!/bin/bash\nexit 0\n',
  createNotifyScript: () => {},
}));

vi.mock('./paths', () => ({
  BIN_DIR: TEST_BIN_DIR,
  HOOKS_DIR: TEST_HOOKS_DIR,
  ZSH_DIR: TEST_ZSH_DIR,
  BASH_DIR: TEST_BASH_DIR,
  OPENCODE_CONFIG_DIR: TEST_OPENCODE_CONFIG_DIR,
  OPENCODE_PLUGIN_DIR: TEST_OPENCODE_PLUGIN_DIR,
}));

vi.mock('node:os', () => ({
  ...realOs,
  homedir: () => mockedHomeDir,
}));

const {
  getClaudeManagedHookCommand,
  getClaudeGlobalSettingsJsonPath,
  getClaudeGlobalSettingsJsonContent,
  getCodexGlobalHooksJsonPath,
  getCodexGlobalHooksJsonContent,
  getOpenCodePluginPath,
  getOpenCodeGlobalPluginPath,
  buildCodexWrapperExecLine,
  OPENCODE_PLUGIN_MARKER,
} = await import('./agent-wrappers-claude-codex-opencode');

describe('agent-wrappers-claude-codex-opencode', () => {
  beforeEach(() => {
    mkdirSync(TEST_BIN_DIR, { recursive: true });
    mkdirSync(TEST_HOOKS_DIR, { recursive: true });
    mkdirSync(TEST_OPENCODE_PLUGIN_DIR, { recursive: true });
    mkdirSync(path.join(mockedHomeDir, '.claude'), { recursive: true });
    mkdirSync(path.join(mockedHomeDir, '.codex'), { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  describe('getClaudeManagedHookCommand', () => {
    it('returns a shell command string containing AMOENA_HOME_DIR', () => {
      const cmd = getClaudeManagedHookCommand();
      expect(cmd).toContain('AMOENA_HOME_DIR');
      expect(cmd).toContain('notify.sh');
    });
  });

  describe('getClaudeGlobalSettingsJsonPath', () => {
    it('returns path under ~/.claude/', () => {
      const p = getClaudeGlobalSettingsJsonPath();
      expect(p).toContain('.claude');
      expect(p).toContain('settings.json');
    });
  });

  describe('getClaudeGlobalSettingsJsonContent', () => {
    it('returns JSON with hooks when no existing file', () => {
      const content = getClaudeGlobalSettingsJsonContent(path.join(TEST_HOOKS_DIR, 'notify.sh'));
      expect(content).not.toBeNull();
      const parsed = JSON.parse(content!);
      expect(parsed.hooks).toBeDefined();
      expect(parsed.hooks.UserPromptSubmit).toBeArray();
      expect(parsed.hooks.Stop).toBeArray();
      expect(parsed.hooks.PostToolUse).toBeArray();
    });

    it('preserves existing user hooks', () => {
      const settingsPath = getClaudeGlobalSettingsJsonPath();
      writeFileSync(
        settingsPath,
        JSON.stringify({
          hooks: {
            UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'echo user-hook' }] }],
          },
          customSetting: true,
        }),
      );

      const content = getClaudeGlobalSettingsJsonContent(path.join(TEST_HOOKS_DIR, 'notify.sh'));
      const parsed = JSON.parse(content!);
      expect(parsed.customSetting).toBe(true);
      // User hook should be preserved along with managed hook
      const userHooks = parsed.hooks.UserPromptSubmit;
      expect(userHooks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getCodexGlobalHooksJsonPath', () => {
    it('returns path under ~/.codex/', () => {
      const p = getCodexGlobalHooksJsonPath();
      expect(p).toContain('.codex');
      expect(p).toContain('hooks.json');
    });
  });

  describe('getCodexGlobalHooksJsonContent', () => {
    it('returns JSON with SessionStart and Stop hooks', () => {
      const content = getCodexGlobalHooksJsonContent(path.join(TEST_HOOKS_DIR, 'notify.sh'));
      expect(content).not.toBeNull();
      const parsed = JSON.parse(content!);
      expect(parsed.hooks.SessionStart).toBeArray();
      expect(parsed.hooks.Stop).toBeArray();
    });
  });

  describe('getOpenCodePluginPath', () => {
    it('returns path under OPENCODE_PLUGIN_DIR', () => {
      const p = getOpenCodePluginPath();
      expect(p).toContain('opencode');
      expect(p).toContain('plugin');
    });
  });

  describe('getOpenCodeGlobalPluginPath', () => {
    it('returns path under .config/opencode', () => {
      const p = getOpenCodeGlobalPluginPath();
      expect(p).toContain('opencode');
      expect(p).toContain('plugin');
    });
  });

  describe('OPENCODE_PLUGIN_MARKER', () => {
    it('contains signature and version', () => {
      expect(OPENCODE_PLUGIN_MARKER).toContain('Amoena opencode plugin');
    });
  });
});
