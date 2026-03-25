import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  UPSTREAM_REPOS,
  checkLatestRelease,
  checkAllUpstreams,
  generateMergeSummary,
  type UpstreamRepo,
  type ReleaseInfo,
} from "./sync.js";

// ---------------------------------------------------------------------------
// UPSTREAM_REPOS constants
// ---------------------------------------------------------------------------

describe("UPSTREAM_REPOS", () => {
  it("has exactly 3 entries", () => {
    expect(UPSTREAM_REPOS).toHaveLength(3);
  });

  it("every repo has a non-empty owner field", () => {
    for (const repo of UPSTREAM_REPOS) {
      expect(repo.owner.length).toBeGreaterThan(0);
    }
  });

  it("every repo has a non-empty repo field", () => {
    for (const repo of UPSTREAM_REPOS) {
      expect(repo.repo.length).toBeGreaterThan(0);
    }
  });

  it("every repo has a non-empty package field", () => {
    for (const repo of UPSTREAM_REPOS) {
      expect(repo.package.length).toBeGreaterThan(0);
    }
  });

  it("every repo has a non-empty description field", () => {
    for (const repo of UPSTREAM_REPOS) {
      expect(repo.description.length).toBeGreaterThan(0);
    }
  });

  it("contains an entry for mission-control", () => {
    const found = UPSTREAM_REPOS.find((r) => r.repo === "mission-control");
    expect(found).toBeDefined();
  });

  it("contains an entry for superset", () => {
    const found = UPSTREAM_REPOS.find((r) => r.repo === "superset");
    expect(found).toBeDefined();
  });

  it("contains an entry for claude-mem", () => {
    const found = UPSTREAM_REPOS.find((r) => r.repo === "claude-mem");
    expect(found).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// checkLatestRelease
// ---------------------------------------------------------------------------

describe("checkLatestRelease", () => {
  const testRepo: UpstreamRepo = {
    owner: "test-owner",
    repo: "test-repo",
    package: "@test/pkg",
    description: "test repo",
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when fetch throws a network error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network failure"));
    const result = await checkLatestRelease(testRepo);
    expect(result).toBeNull();
  });

  it("returns null when the response is not ok (404)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 404 }),
    );
    const result = await checkLatestRelease(testRepo);
    expect(result).toBeNull();
  });

  it("returns null when the response is not ok (500)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );
    const result = await checkLatestRelease(testRepo);
    expect(result).toBeNull();
  });

  it("returns a ReleaseInfo with the correct shape on success", async () => {
    const payload = {
      tag_name: "v1.2.3",
      published_at: "2025-01-15T10:00:00Z",
      html_url: "https://github.com/test-owner/test-repo/releases/tag/v1.2.3",
      body: "Bug fixes and performance improvements.",
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(payload), { status: 200 }),
    );

    const result = await checkLatestRelease(testRepo);

    expect(result).not.toBeNull();
    expect(result!.tag).toBe("v1.2.3");
    expect(result!.publishedAt).toBe("2025-01-15T10:00:00Z");
    expect(result!.url).toBe(payload.html_url);
    expect(result!.body).toBe(payload.body);
    expect(result!.repo).toBe(testRepo);
  });

  it("substitutes empty string for body when the API returns null", async () => {
    const payload = {
      tag_name: "v2.0.0",
      published_at: "2025-06-01T00:00:00Z",
      html_url: "https://github.com/test-owner/test-repo/releases/tag/v2.0.0",
      body: null,
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(payload), { status: 200 }),
    );

    const result = await checkLatestRelease(testRepo);

    expect(result).not.toBeNull();
    expect(result!.body).toBe("");
  });

  it("calls the GitHub releases API URL for the given repo", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 404 }),
    );
    await checkLatestRelease(testRepo);
    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain("api.github.com/repos/test-owner/test-repo/releases/latest");
  });
});

// ---------------------------------------------------------------------------
// checkAllUpstreams
// ---------------------------------------------------------------------------

describe("checkAllUpstreams", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an array of SyncStatus objects (one per repo)", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
    const statuses = await checkAllUpstreams();
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses).toHaveLength(UPSTREAM_REPOS.length);
  });

  it("each SyncStatus has the required shape fields", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
    const statuses = await checkAllUpstreams();
    for (const status of statuses) {
      expect(status).toHaveProperty("repo");
      expect(status).toHaveProperty("lastChecked");
      expect(status).toHaveProperty("latestRelease");
      expect(status).toHaveProperty("currentVersion");
      expect(status).toHaveProperty("hasUpdate");
    }
  });

  it("sets hasUpdate to false when the release endpoint returns 404", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
    const statuses = await checkAllUpstreams();
    for (const status of statuses) {
      expect(status.hasUpdate).toBe(false);
    }
  });

  it("sets hasUpdate to true when a release is found", async () => {
    const payload = {
      tag_name: "v1.0.0",
      published_at: "2025-01-01T00:00:00Z",
      html_url: "https://github.com/x/y/releases/tag/v1.0.0",
      body: "notes",
    };
    // Each call must get a fresh Response — a Response body can only be read once.
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(payload), { status: 200 })),
    );
    const statuses = await checkAllUpstreams();
    for (const status of statuses) {
      expect(status.hasUpdate).toBe(true);
    }
  });

  it("lastChecked is a valid ISO timestamp", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
    const statuses = await checkAllUpstreams();
    for (const status of statuses) {
      expect(() => new Date(status.lastChecked)).not.toThrow();
      expect(new Date(status.lastChecked).toISOString()).toBe(status.lastChecked);
    }
  });
});

// ---------------------------------------------------------------------------
// generateMergeSummary
// ---------------------------------------------------------------------------

describe("generateMergeSummary", () => {
  const repo: UpstreamRepo = {
    owner: "builderz-labs",
    repo: "mission-control",
    package: "@lunaria/dashboard",
    description: "AI agent orchestration dashboard",
  };

  const release: ReleaseInfo = {
    repo,
    tag: "v3.1.0",
    publishedAt: "2025-03-10T12:00:00Z",
    url: "https://github.com/builderz-labs/mission-control/releases/tag/v3.1.0",
    body: "Added new orchestration features.",
  };

  it("includes the repo owner and name in the summary header", () => {
    const summary = generateMergeSummary(release);
    expect(summary).toContain("builderz-labs/mission-control");
  });

  it("includes the release tag", () => {
    const summary = generateMergeSummary(release);
    expect(summary).toContain("v3.1.0");
  });

  it("includes the release URL", () => {
    const summary = generateMergeSummary(release);
    expect(summary).toContain(release.url);
  });

  it("includes the Amoena package name", () => {
    const summary = generateMergeSummary(release);
    expect(summary).toContain("@lunaria/dashboard");
  });

  it("includes the release body text", () => {
    const summary = generateMergeSummary(release);
    expect(summary).toContain("Added new orchestration features.");
  });

  it("falls back to a placeholder when body is empty", () => {
    const emptyBodyRelease: ReleaseInfo = { ...release, body: "" };
    const summary = generateMergeSummary(emptyBodyRelease);
    expect(summary).toContain("(no release notes)");
  });

  it("includes the suggested actions section", () => {
    const summary = generateMergeSummary(release);
    expect(summary).toContain("Suggested Actions");
  });
});
