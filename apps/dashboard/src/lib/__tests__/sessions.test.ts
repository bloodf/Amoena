import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
	config: { amoenaStateDir: "/tmp/test-amoena" },
}));

vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		existsSync: vi.fn(() => false),
		readdirSync: vi.fn(() => []),
		readFileSync: vi.fn(() => "{}"),
		statSync: vi.fn(() => ({ isFile: () => false, isDirectory: () => false, mtimeMs: 0 })),
		writeFileSync: vi.fn(),
		unlinkSync: vi.fn(),
	};
});

describe("sessions", () => {
	it("invalidateSessionCache is a function", async () => {
		const { invalidateSessionCache } = await import("@/lib/sessions");
		expect(typeof invalidateSessionCache).toBe("function");
		invalidateSessionCache(); // Should not throw
	});

	it("getAllGatewaySessions returns empty when no state dir", async () => {
		const { getAllGatewaySessions } = await import("@/lib/sessions");
		const sessions = getAllGatewaySessions();
		expect(sessions).toEqual([]);
	});

	it("countStaleGatewaySessions returns 0 when no sessions", async () => {
		const { countStaleGatewaySessions } = await import("@/lib/sessions");
		const count = countStaleGatewaySessions(7);
		expect(count).toBe(0);
	});

	it("pruneGatewaySessionsOlderThan returns 0 deleted when empty", async () => {
		const { pruneGatewaySessionsOlderThan } = await import("@/lib/sessions");
		const result = pruneGatewaySessionsOlderThan(7);
		expect(result.deleted).toBe(0);
	});

	it("getAgentLiveStatuses returns empty map when no sessions", async () => {
		const { getAgentLiveStatuses } = await import("@/lib/sessions");
		const statuses = getAgentLiveStatuses();
		expect(statuses.size).toBe(0);
	});
});
