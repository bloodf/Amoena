import { describe, expect, it, vi } from 'vitest';

vi.mock('./procedures/create', () => ({
  createCreateProcedures: () => ({}),
}));
vi.mock('./procedures/delete', () => ({
  createDeleteProcedures: () => ({}),
}));
vi.mock('./procedures/generate-branch-name', () => ({
  createGenerateBranchNameProcedures: () => ({}),
}));
vi.mock('./procedures/git-status', () => ({
  createGitStatusProcedures: () => ({}),
}));
vi.mock('./procedures/init', () => ({
  createInitProcedures: () => ({}),
}));
vi.mock('./procedures/query', () => ({
  createQueryProcedures: () => ({}),
}));
vi.mock('./procedures/sections', () => ({
  createSectionsProcedures: () => ({}),
}));
vi.mock('./procedures/status', () => ({
  createStatusProcedures: () => ({}),
}));

const { createWorkspacesRouter } = await import('./workspaces');

describe('workspaces router', () => {
  it('creates a merged router', () => {
    const router = createWorkspacesRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });
});
