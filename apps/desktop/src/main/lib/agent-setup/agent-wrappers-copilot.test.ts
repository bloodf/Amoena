import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import * as realOs from 'node:os';
import path from 'node:path';

const TEST_ROOT = path.join(realOs.tmpdir(), `amoena-copilot-test-${process.pid}-${Date.now()}`);
const TEST_HOOKS_DIR = path.join(TEST_ROOT, 'amoena', 'hooks');
const TEST_BIN_DIR = path.join(TEST_ROOT, 'amoena', 'bin');

vi.mock('shared/env.shared', () => ({
  env: { DESKTOP_NOTIFICATIONS_PORT: 7777 },
  getWorkspaceName: () => undefined,
}));

vi.mock('./paths', () => ({
  BIN_DIR: TEST_BIN_DIR,
  HOOKS_DIR: TEST_HOOKS_DIR,
}));

vi.mock('./agent-wrappers-common', () => ({
  buildWrapperScript: vi.fn((name: string, exec: string) => `#!/bin/bash\n${exec}`),
  createWrapper: vi.fn(() => {}),
  writeFileIfChanged: vi.fn(() => true),
}));

// Create a template for getCopilotHookScriptContent
const TEMPLATES_DIR = path.join(TEST_ROOT, 'templates');

const {
  getCopilotHookScriptPath,
  getCopilotHooksJsonContent,
  buildCopilotWrapperExecLine,
  COPILOT_HOOK_MARKER,
  COPILOT_HOOK_SCRIPT_NAME,
} = await import('./agent-wrappers-copilot');

describe('agent-wrappers-copilot', () => {
  beforeEach(() => {
    mkdirSync(TEST_HOOKS_DIR, { recursive: true });
    mkdirSync(TEST_BIN_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  describe('getCopilotHookScriptPath', () => {
    it('returns path under HOOKS_DIR', () => {
      const p = getCopilotHookScriptPath();
      expect(p).toContain(COPILOT_HOOK_SCRIPT_NAME);
      expect(p).toContain('hooks');
    });
  });

  describe('getCopilotHooksJsonContent', () => {
    it('returns JSON with copilot hook structure', () => {
      const content = getCopilotHooksJsonContent('/path/to/hook.sh');
      const parsed = JSON.parse(content);
      expect(parsed.version).toBe(1);
      expect(parsed.hooks).toBeDefined();
      expect(parsed.hooks.sessionStart).toBeInstanceOf(Array);
      expect(parsed.hooks.sessionEnd).toBeInstanceOf(Array);
      expect(parsed.hooks.userPromptSubmitted).toBeInstanceOf(Array);
      expect(parsed.hooks.postToolUse).toBeInstanceOf(Array);
    });

    it('includes the hook script path in commands', () => {
      const hookPath = '/my/custom/hook.sh';
      const content = getCopilotHooksJsonContent(hookPath);
      expect(content).toContain(hookPath);
    });
  });

  describe('buildCopilotWrapperExecLine', () => {
    it('returns a shell script with copilot hooks injection', () => {
      const exec = buildCopilotWrapperExecLine();
      expect(exec).toContain('AMOENA_TAB_ID');
      expect(exec).toContain('COPILOT_HOOKS_DIR');
      expect(exec).toContain('exec "$REAL_BIN" "$@"');
    });
  });

  describe('COPILOT_HOOK_MARKER', () => {
    it('contains signature and version', () => {
      expect(COPILOT_HOOK_MARKER).toContain('Amoena copilot hook');
    });
  });
});
