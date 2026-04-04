import { describe, expect, test } from "vitest";

import { settingDefaults } from './setting-defaults';

describe('settingDefaults', () => {
  test('has general settings', () => {
    expect(settingDefaults['general.theme']).toBe('Dark');
    expect(settingDefaults['general.language']).toBe('English');
    expect(settingDefaults['general.confirmBeforeClose']).toBe(true);
    expect(settingDefaults['general.autoSaveSessions']).toBe(true);
  });

  test('has editor settings', () => {
    expect(settingDefaults['editor.fontSize']).toBe(13);
    expect(settingDefaults['editor.fontFamily']).toBe('JetBrains Mono');
    expect(settingDefaults['editor.wordWrap']).toBe(true);
    expect(settingDefaults['editor.lineNumbers']).toBe(true);
    expect(settingDefaults['editor.minimap']).toBe(false);
  });

  test('has terminal settings', () => {
    expect(settingDefaults['terminal.defaultShell']).toBe('zsh');
    expect(settingDefaults['terminal.fontSize']).toBe(13);
    expect(settingDefaults['terminal.scrollbackLines']).toBe(10000);
  });

  test('has session settings', () => {
    expect(settingDefaults['session.defaultModel']).toBeTruthy();
    expect(settingDefaults['session.maxContextTokens']).toBe(32000);
  });

  test('has memory settings', () => {
    expect(settingDefaults['memory.autoSummarizeSessions']).toBe(true);
    expect(settingDefaults['memory.maxInjectedTokens']).toBe(4000);
  });

  test('has permissions settings', () => {
    expect(settingDefaults['permissions.rememberApprovalChoices']).toBe(true);
    expect(settingDefaults['permissions.fileDeletion']).toBe('Always ask');
  });

  test('has privacy settings', () => {
    expect(settingDefaults['privacy.autoRedactSecrets']).toBe(true);
    expect(settingDefaults['privacy.dataRetention']).toBe('30 days');
  });

  test('has advanced settings', () => {
    expect(settingDefaults['advanced.developerMode']).toBe(false);
    expect(settingDefaults['advanced.runtimePort']).toBe(3847);
    expect(settingDefaults['advanced.maxConcurrentAgents']).toBe(4);
    expect(settingDefaults['advanced.streamingResponses']).toBe(true);
  });

  test('has notification settings', () => {
    expect(settingDefaults['notifications.showToast']).toBe(true);
    expect(settingDefaults['notifications.criticalAlerts']).toBe(true);
    expect(settingDefaults['notifications.soundEffects']).toBe(false);
  });

  test('has workspace settings', () => {
    expect(settingDefaults['workspace.autoCreateWorktree']).toBe(false);
    expect(settingDefaults['workspace.defaultBranch']).toBe('main');
    expect(settingDefaults['workspace.cleanupAfterDays']).toBe(7);
  });

  test('all keys follow category.setting pattern', () => {
    for (const key of Object.keys(settingDefaults)) {
      expect(key).toMatch(/^[a-z]+\.[a-zA-Z]+$/);
    }
  });

  test('no undefined values', () => {
    for (const [_key, value] of Object.entries(settingDefaults)) {
      expect(value).not.toBeUndefined();
    }
  });
});
