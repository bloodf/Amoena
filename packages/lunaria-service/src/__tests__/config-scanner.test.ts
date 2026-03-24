import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ConfigScanner } from '../config-recognition/config-scanner.js';

function mkdir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

describe('ConfigScanner', () => {
  let tmpDir: string;
  let scanner: ConfigScanner;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lunaria-cfg-test-'));
    scanner = new ConfigScanner();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('scan', () => {
    it('returns empty scoped config for empty directory', () => {
      const result = scanner.scan(tmpDir);
      expect(result.workspace.agents).toBeUndefined();
      expect(result.workspace.claude).toBeUndefined();
    });

    it('detects .agents/AGENTS.md in workspace', () => {
      writeFile(path.join(tmpDir, '.agents', 'AGENTS.md'), '# Agents\nBe helpful.');
      const result = scanner.scan(tmpDir);
      expect(result.workspace.agents).toBeDefined();
      expect(result.workspace.agents!.raw).toContain('Be helpful.');
    });

    it('detects .claude/CLAUDE.md in workspace', () => {
      writeFile(path.join(tmpDir, '.claude', 'CLAUDE.md'), '# Claude\nContext rules.');
      const result = scanner.scan(tmpDir);
      expect(result.workspace.claude).toBeDefined();
      expect(result.workspace.claude!.raw).toContain('Context rules.');
    });

    it('detects both .agents and .claude directories', () => {
      writeFile(path.join(tmpDir, '.agents', 'AGENTS.md'), '# Agents');
      writeFile(path.join(tmpDir, '.claude', 'CLAUDE.md'), '# Claude');
      const result = scanner.scan(tmpDir);
      expect(result.workspace.agents).toBeDefined();
      expect(result.workspace.claude).toBeDefined();
    });

    it('user scope is always scanned (returns object even if empty)', () => {
      const result = scanner.scan(tmpDir);
      expect(result.user).toBeDefined();
    });
  });

  describe('readAgentsMd', () => {
    it('returns undefined when no AGENTS.md exists', () => {
      const result = scanner.readAgentsMd(tmpDir);
      expect(result).toBeUndefined();
    });

    it('reads AGENTS.md from .agents/ subdirectory', () => {
      const content = '# Agents directive\nDo not break production.';
      writeFile(path.join(tmpDir, '.agents', 'AGENTS.md'), content);
      const result = scanner.readAgentsMd(tmpDir);
      expect(result).toBeDefined();
      expect(result!.raw).toBe(content);
      expect(result!.filePath).toContain('AGENTS.md');
    });

    it('reads root AGENTS.md as fallback', () => {
      const content = '# Root Agents';
      writeFile(path.join(tmpDir, 'AGENTS.md'), content);
      const result = scanner.readAgentsMd(tmpDir);
      expect(result).toBeDefined();
      expect(result!.raw).toBe(content);
    });

    it('prefers .agents/AGENTS.md over root AGENTS.md', () => {
      writeFile(path.join(tmpDir, '.agents', 'AGENTS.md'), '# Nested');
      writeFile(path.join(tmpDir, 'AGENTS.md'), '# Root');
      const result = scanner.readAgentsMd(tmpDir);
      expect(result!.raw).toBe('# Nested');
    });
  });

  describe('readClaudeMd', () => {
    it('returns undefined when no CLAUDE.md exists', () => {
      const result = scanner.readClaudeMd(tmpDir);
      expect(result).toBeUndefined();
    });

    it('reads CLAUDE.md from .claude/ subdirectory', () => {
      const content = '# Claude directive\nUse context-mode.';
      writeFile(path.join(tmpDir, '.claude', 'CLAUDE.md'), content);
      const result = scanner.readClaudeMd(tmpDir);
      expect(result).toBeDefined();
      expect(result!.raw).toBe(content);
    });

    it('reads root CLAUDE.md as fallback', () => {
      const content = '# Root Claude';
      writeFile(path.join(tmpDir, 'CLAUDE.md'), content);
      const result = scanner.readClaudeMd(tmpDir);
      expect(result).toBeDefined();
      expect(result!.raw).toBe(content);
    });

    it('prefers .claude/CLAUDE.md over root CLAUDE.md', () => {
      writeFile(path.join(tmpDir, '.claude', 'CLAUDE.md'), '# Nested Claude');
      writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Root Claude');
      const result = scanner.readClaudeMd(tmpDir);
      expect(result!.raw).toBe('# Nested Claude');
    });
  });
});
