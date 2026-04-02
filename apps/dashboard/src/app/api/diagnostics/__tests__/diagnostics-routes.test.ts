import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ requireRole: vi.fn() }));
vi.mock("@/lib/command", () => ({
	runAmoena: vi.fn(() =>
		Promise.resolve({ stdout: "1.0.0", stderr: "" }),
	),
}));
vi.mock("@/lib/config", () => ({
	config: {
		dbPath: "/tmp/mc.db",
		gatewayHost: "127.0.0.1",
		gatewayPort: 18789,
		retention: {
			activities: 30,
			auditLog: 90,
			logs: 14,
			notifications: 30,
			pipelineRuns: 30,
			tokenUsage: 30,
			gatewaySessions: 7,
		},
	},
}));
vi.mock("@/lib/db", () => ({
	getDatabase: vi.fn(() => ({
		prepare: vi.fn(() => ({
			all: vi.fn(() => []),
			get: vi.fn(() => ({ c: 0, journal_mode: "wal" })),
		})),
	})),
}));
vi.mock("@/lib/logger", () => ({
	logger: { error: vi.fn() },
}));
vi.mock("@/lib/version", () => ({
	APP_VERSION: "0.1.0-test",
}));
vi.mock("node:fs", () => ({
	existsSync: vi.fn(() => false),
	statSync: vi.fn(() => ({ size: 1024 })),
}));
vi.mock("node:net", () => ({
	default: {
		Socket: vi.fn(() => ({
			setTimeout: vi.fn(),
			once: vi.fn((event: string, cb: () => void) => {
				if (event === "error") cb();
			}),
			connect: vi.fn(),
			destroy: vi.fn(),
		})),
	},
}));
// Mock the local cleanup module
vi.mock("@/lib/cleanup", () => ({
	getReplayStorageInfo: vi.fn(() =>
		Promise.resolve({ recordingsDir: "/fake/recordings", retentionMs: 2592000000, deleted: 2, kept: 3 }),
	),
	DEFAULT_RETENTION_MS: 30 * 24 * 60 * 60 * 1000,
	defaultRecordingsDir: vi.fn(() => "/fake/recordings"),
}));

import { requireRole } from "@/lib/auth";
import { GET } from "../../diagnostics/route";

function makeRequest(url: string): Request & { nextUrl: URL } {
	const req = new Request(url) as Request & { nextUrl: URL };
	req.nextUrl = new URL(url);
	return req;
}

function mockAuth() {
	vi.mocked(requireRole).mockReturnValue({
		user: { id: 1, username: "admin", role: "admin", workspace_id: 1 },
	} as any);
}

function mockAuthError() {
	vi.mocked(requireRole).mockReturnValue({
		error: "Unauthorized",
		status: 401,
	} as any);
}

describe("GET /api/diagnostics", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns 401 when unauthenticated", async () => {
		mockAuthError();
		const res = await GET(
			makeRequest("http://localhost/api/diagnostics") as any,
		);
		expect(res.status).toBe(401);
	});

	it("returns diagnostics data", async () => {
		mockAuth();
		const res = await GET(
			makeRequest("http://localhost/api/diagnostics") as any,
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty("system");
		expect(body).toHaveProperty("version");
		expect(body).toHaveProperty("security");
		expect(body).toHaveProperty("database");
		expect(body).toHaveProperty("gateway");
	});

	// ---------------------------------------------------------------------------
	// TDD: Failing tests for replayStorage
	// ---------------------------------------------------------------------------

	it("diagnostics returns replayStorage with recordingsDir, retentionMs, deleted, kept", async () => {
		mockAuth();
		const res = await GET(
			makeRequest("http://localhost/api/diagnostics") as any,
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty("replayStorage");
		expect(body.replayStorage).toHaveProperty("recordingsDir");
		expect(body.replayStorage).toHaveProperty("retentionMs");
		expect(body.replayStorage).toHaveProperty("deleted");
		expect(body.replayStorage).toHaveProperty("kept");
	});

	it("missing recordings dir → diagnostics still returns 200", async () => {
		mockAuth();
		const res = await GET(
			makeRequest("http://localhost/api/diagnostics") as any,
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty("replayStorage");
		// Values from the mock
		expect(body.replayStorage.deleted).toBe(2);
		expect(body.replayStorage.kept).toBe(3);
	});
});
