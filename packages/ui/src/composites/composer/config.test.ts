import { describe, expect, test } from "vitest";

import {
  composerBranches,
  composerBuiltinCommands,
  composerContinueInOptions,
  composerFiles,
  composerPermissionOptions,
  composerProviderAgents,
  composerProviderModels,
  composerReasoningLevels,
  composerSkills,
  type ComposerProvider,
} from './config';

describe('composerBuiltinCommands', () => {
  test('each command has name, desc, and Icon', () => {
    for (const cmd of composerBuiltinCommands) {
      expect(cmd.name).toBeTruthy();
      expect(cmd.desc).toBeTruthy();
      expect(cmd.Icon).toBeDefined();
    }
  });

  test('includes essential commands', () => {
    const names = composerBuiltinCommands.map((c) => c.name);
    expect(names).toContain('edit');
    expect(names).toContain('new');
    expect(names).toContain('test');
    expect(names).toContain('clear');
    expect(names).toContain('help');
  });
});

describe('composerSkills', () => {
  test('each skill has name, desc, Icon, and source', () => {
    for (const skill of composerSkills) {
      expect(skill.name).toBeTruthy();
      expect(skill.desc).toBeTruthy();
      expect(skill.Icon).toBeDefined();
      expect(['project', 'builtin']).toContain(skill.source);
    }
  });

  test('includes both project and builtin skills', () => {
    const sources = new Set(composerSkills.map((s) => s.source));
    expect(sources.has('project')).toBe(true);
    expect(sources.has('builtin')).toBe(true);
  });
});

describe('composerFiles', () => {
  test('each file has name, path, and type', () => {
    for (const file of composerFiles) {
      expect(file.name).toBeTruthy();
      expect(file.path).toBeTruthy();
      expect(['file', 'folder']).toContain(file.type);
    }
  });

  test('includes both files and folders', () => {
    const types = new Set(composerFiles.map((f) => f.type));
    expect(types.has('file')).toBe(true);
    expect(types.has('folder')).toBe(true);
  });
});

describe('composerProviderModels', () => {
  const providers: ComposerProvider[] = [
    'amoena',
    'claude',
    'opencode',
    'codex',
    'gemini',
    'ollama',
  ];

  test('every provider has a name and at least one model', () => {
    for (const p of providers) {
      const entry = composerProviderModels[p];
      expect(entry.name).toBeTruthy();
      expect(entry.models.length).toBeGreaterThan(0);
    }
  });

  test('every model has id and label', () => {
    for (const p of providers) {
      for (const model of composerProviderModels[p].models) {
        expect(model.id).toBeTruthy();
        expect(model.label).toBeTruthy();
      }
    }
  });
});

describe('composerProviderAgents', () => {
  const providers: ComposerProvider[] = [
    'amoena',
    'claude',
    'opencode',
    'codex',
    'gemini',
    'ollama',
  ];

  test('every provider has at least one agent variant', () => {
    for (const p of providers) {
      expect(composerProviderAgents[p].length).toBeGreaterThan(0);
    }
  });

  test('every agent variant has id, name, role, and color', () => {
    for (const p of providers) {
      for (const agent of composerProviderAgents[p]) {
        expect(agent.id).toBeTruthy();
        expect(agent.name).toBeTruthy();
        expect(agent.role).toBeTruthy();
        expect(agent.color).toBeTruthy();
      }
    }
  });
});

describe('composerReasoningLevels', () => {
  test('has 4 levels', () => {
    expect(composerReasoningLevels).toHaveLength(4);
  });

  test('each level has id, label, and desc', () => {
    for (const level of composerReasoningLevels) {
      expect(level.id).toBeTruthy();
      expect(level.label).toBeTruthy();
      expect(level.desc).toBeTruthy();
    }
  });

  test('includes low through extra-high', () => {
    const ids = composerReasoningLevels.map((l) => l.id);
    expect(ids).toEqual(['low', 'medium', 'high', 'extra-high']);
  });
});

describe('composerContinueInOptions', () => {
  test('has local, worktree, and cloud options', () => {
    const ids = composerContinueInOptions.map((o) => o.id);
    expect(ids).toContain('local');
    expect(ids).toContain('worktree');
    expect(ids).toContain('cloud');
  });
});

describe('composerPermissionOptions', () => {
  test('has default, full, plan-only, and read-only', () => {
    const ids = composerPermissionOptions.map((o) => o.id);
    expect(ids).toContain('default');
    expect(ids).toContain('full');
    expect(ids).toContain('plan-only');
    expect(ids).toContain('read-only');
  });

  test('each option has desc', () => {
    for (const opt of composerPermissionOptions) {
      expect(opt.desc).toBeTruthy();
    }
  });
});

describe('composerBranches', () => {
  test('includes main branch', () => {
    expect(composerBranches).toContain('main');
  });

  test('has multiple branches', () => {
    expect(composerBranches.length).toBeGreaterThan(1);
  });
});
