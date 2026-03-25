import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockGetEffectiveEnvValue = vi.fn();

vi.mock('@/lib/runtime-env', () => ({
  getEffectiveEnvValue: (...args: unknown[]) => mockGetEffectiveEnvValue(...args),
}));

describe('getGitHubToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns token from getEffectiveEnvValue', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken123');
    const { getGitHubToken } = await import('../github');
    const token = await getGitHubToken();
    expect(token).toBe('ghp_testtoken123');
  });

  it('returns null when no token found', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue(null);
    const { getGitHubToken } = await import('../github');
    const token = await getGitHubToken();
    expect(token).toBeNull();
  });
});

describe('githubFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('throws when no token configured', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue(null);
    const { githubFetch } = await import('../github');
    await expect(githubFetch('/test')).rejects.toThrow('GITHUB_TOKEN not configured');
  });

  it('constructs full URL for relative paths', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, json: async () => ({}) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { githubFetch } = await import('../github');
    await githubFetch('/repos/test');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.github.com/repos/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer ghp_testtoken',
        }),
      }),
    );
  });

  it('uses absolute URLs directly', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, json: async () => ({}) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { githubFetch } = await import('../github');
    await githubFetch('https://other-api.example.com/endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://other-api.example.com/endpoint',
      expect.any(Object),
    );
  });

  it('includes default headers', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, json: async () => ({}) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { githubFetch } = await import('../github');
    await githubFetch('/test');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Amoena/1.0',
        }),
      }),
    );
  });

  it('adds Content-Type for requests with body', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, json: async () => ({}) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { githubFetch } = await import('../github');
    await githubFetch('/test', { body: JSON.stringify({ key: 'value' }) });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });
});

describe('fetchIssues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('returns issues array without pull requests', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockIssues = [
      { number: 1, title: 'Bug', pull_request: undefined },
      { number: 2, title: 'PR', pull_request: { url: '...' } },
    ];
    const mockResponse = {
      ok: true,
      json: async () => mockIssues,
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { fetchIssues } = await import('../github');
    const issues = await fetchIssues('owner/repo');

    expect(issues).toHaveLength(1);
    expect(issues[0].number).toBe(1);
  });

  it('passes query parameters correctly', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, json: async () => [] };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { fetchIssues } = await import('../github');
    await fetchIssues('owner/repo', { state: 'closed', labels: 'bug', per_page: 50 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('state=closed'),
      expect.any(Object),
    );
  });
});

describe('fetchIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('fetches single issue by number', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockIssue = { number: 42, title: 'Issue', body: 'Description' };
    const mockResponse = {
      ok: true,
      json: async () => mockIssue,
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { fetchIssue } = await import('../github');
    const issue = await fetchIssue('owner/repo', 42);

    expect(issue.number).toBe(42);
    expect(issue.title).toBe('Issue');
  });

  it('throws on API error', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: false, status: 404, text: async () => 'Not Found' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { fetchIssue } = await import('../github');
    await expect(fetchIssue('owner/repo', 999)).rejects.toThrow('GitHub API error 404');
  });
});

describe('createIssueComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('posts comment successfully', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, status: 201 };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createIssueComment } = await import('../github');
    await expect(createIssueComment('owner/repo', 1, 'Test comment')).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: false, status: 500, text: async () => 'Error' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createIssueComment } = await import('../github');
    await expect(createIssueComment('owner/repo', 1, 'Test')).rejects.toThrow();
  });
});

describe('createLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('creates label without error', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, status: 201 };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createLabel } = await import('../github');
    await expect(
      createLabel('owner/repo', { name: 'bug', color: 'ff0000' }),
    ).resolves.toBeUndefined();
  });

  it('ignores 422 (label already exists)', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: false, status: 422 };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createLabel } = await import('../github');
    await expect(
      createLabel('owner/repo', { name: 'bug', color: 'ff0000' }),
    ).resolves.toBeUndefined();
  });

  it('throws on unexpected error', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: false, status: 500, text: async () => 'Error' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createLabel } = await import('../github');
    await expect(createLabel('owner/repo', { name: 'bug', color: 'ff0000' })).rejects.toThrow();
  });
});

describe('ensureLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('creates multiple labels', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true, status: 201 };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { ensureLabels } = await import('../github');
    await ensureLabels('owner/repo', [
      { name: 'bug', color: 'ff0000' },
      { name: 'enhancement', color: '00ff00' },
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('updateIssueLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('replaces all labels on issue', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { updateIssueLabels } = await import('../github');
    await expect(updateIssueLabels('owner/repo', 1, ['bug', 'priority'])).resolves.toBeUndefined();
  });
});

describe('createRef', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('creates git ref successfully', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = { ok: true };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createRef } = await import('../github');
    await expect(createRef('owner/repo', 'refs/heads/feature', 'sha123')).resolves.toBeUndefined();
  });
});

describe('getRef', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('returns ref sha', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = {
      ok: true,
      json: async () => ({ object: { sha: 'abc123' } }),
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { getRef } = await import('../github');
    const result = await getRef('owner/repo', 'refs/heads/main');
    expect(result.sha).toBe('abc123');
  });
});

describe('fetchPullRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('fetches pull requests', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockResponse = {
      ok: true,
      json: async () => [{ number: 1, title: 'PR' }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { fetchPullRequests } = await import('../github');
    const prs = await fetchPullRequests('owner/repo');
    expect(prs).toHaveLength(1);
  });
});

describe('createPullRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('creates pull request', async () => {
    mockGetEffectiveEnvValue.mockResolvedValue('ghp_testtoken');
    const mockPR = { number: 1, title: 'New PR' };
    const mockResponse = {
      ok: true,
      json: async () => mockPR,
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { createPullRequest } = await import('../github');
    const pr = await createPullRequest('owner/repo', {
      title: 'New PR',
      head: 'feature',
      base: 'main',
    });
    expect(pr.title).toBe('New PR');
  });
});
