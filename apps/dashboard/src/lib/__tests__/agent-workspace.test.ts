import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'node:fs';

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockResolveWithin = vi.fn();

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));

vi.mock('@/lib/config', () => ({
  config: { amoenaStateDir: '/test/state' },
}));

vi.mock('@/lib/paths', () => ({
  resolveWithin: (...args: unknown[]) => mockResolveWithin(...args),
}));

describe('getAgentWorkspaceCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockResolveWithin.mockImplementation((base, candidate) => `${base}/${candidate}`);
  });

  it('returns absolute paths unchanged', async () => {
    const { getAgentWorkspaceCandidates } = await import('../agent-workspace');
    const result = getAgentWorkspaceCandidates({ workspace: '/absolute/path' }, 'test-agent');
    expect(result).toContain('/absolute/path');
  });

  it('generates candidates from agent config workspace string', async () => {
    const { getAgentWorkspaceCandidates } = await import('../agent-workspace');
    mockResolveWithin.mockImplementation((base, candidate) => `/test/state/${candidate}`);

    const result = getAgentWorkspaceCandidates({ workspace: 'my-workspace' }, 'test-agent');
    expect(result.some((p) => p.includes('my-workspace'))).toBe(true);
  });

  it('generates candidates from amoenaId', async () => {
    const { getAgentWorkspaceCandidates } = await import('../agent-workspace');
    mockResolveWithin.mockImplementation((base, candidate) => `/test/state/${candidate}`);

    const result = getAgentWorkspaceCandidates({ amoenaId: 'MyAgent' }, 'fallback-name');
    expect(result.some((p) => p.includes('myagent'))).toBe(true);
  });

  it('normalizes amoenaId to lowercase with dashes', async () => {
    const { getAgentWorkspaceCandidates } = await import('../agent-workspace');
    mockResolveWithin.mockImplementation((base, candidate) => `/test/state/${candidate}`);

    const result = getAgentWorkspaceCandidates({ amoenaId: 'My_Agent.123' }, 'agent');
    expect(result.some((p) => p.includes('my-agent-123'))).toBe(true);
  });

  it('filters out non-existent paths', async () => {
    const { getAgentWorkspaceCandidates } = await import('../agent-workspace');
    mockExistsSync.mockReturnValue(false);
    mockResolveWithin.mockImplementation((base, candidate) => `/test/state/${candidate}`);

    const result = getAgentWorkspaceCandidates({}, 'test-agent');
    expect(result).toEqual([]);
  });

  it('throws when config.amoenaStateDir is not set and relative path provided', async () => {
    vi.resetModules();
    vi.doMock('@/lib/config', () => ({
      config: { amoenaStateDir: undefined },
    }));

    const { getAgentWorkspaceCandidates } = await import('../agent-workspace');
    expect(() => getAgentWorkspaceCandidates({ workspace: 'relative/path' }, 'agent')).toThrow(
      'AMOENA_STATE_DIR not configured',
    );
  });
});

describe('readAgentWorkspaceFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns exists:false when no files found', async () => {
    mockResolveWithin.mockReturnValue('/test/path/file.txt');
    mockExistsSync.mockReturnValue(false);

    const { readAgentWorkspaceFile } = await import('../agent-workspace');
    const result = readAgentWorkspaceFile(['/workspace1'], ['file.txt']);

    expect(result.exists).toBe(false);
    expect(result.content).toBe('');
    expect(result.path).toBeNull();
  });

  it('returns exists:true with content when file found', async () => {
    mockResolveWithin.mockReturnValue('/workspace1/config.txt');
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('config content');

    const { readAgentWorkspaceFile } = await import('../agent-workspace');
    const result = readAgentWorkspaceFile(['/workspace1'], ['config.txt']);

    expect(result.exists).toBe(true);
    expect(result.content).toBe('config content');
    expect(result.path).toBe('/workspace1/config.txt');
  });

  it('searches multiple workspaces in order', async () => {
    mockResolveWithin
      .mockReturnValueOnce('/workspace1/file.txt')
      .mockReturnValueOnce('/workspace2/file.txt');
    mockExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
    mockReadFileSync.mockReturnValue('found in workspace2');

    const { readAgentWorkspaceFile } = await import('../agent-workspace');
    const result = readAgentWorkspaceFile(['/workspace1', '/workspace2'], ['file.txt']);

    expect(result.exists).toBe(true);
    expect(result.content).toBe('found in workspace2');
  });

  it('searches multiple names within each workspace', async () => {
    mockResolveWithin
      .mockReturnValueOnce('/workspace1/CLAUDE.md')
      .mockReturnValueOnce('/workspace1/AGENT.md')
      .mockReturnValueOnce('/workspace1/agent.md');
    mockExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
    mockReadFileSync.mockReturnValue('agent.md content');

    const { readAgentWorkspaceFile } = await import('../agent-workspace');
    const result = readAgentWorkspaceFile(['/workspace1'], ['CLAUDE.md', 'AGENT.md', 'agent.md']);

    expect(result.exists).toBe(true);
    expect(result.content).toBe('agent.md content');
  });
});
