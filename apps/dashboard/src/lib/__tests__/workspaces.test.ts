import { describe, expect, it, vi } from "vitest";

describe("workspaces", () => {
	it("ForbiddenError extends Error", async () => {
		const { ForbiddenError } = await import("@/lib/workspaces");
		const err = new ForbiddenError("test");
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe("test");
		expect(err.name).toBe("ForbiddenError");
		expect(err.status).toBe(403);
	});

	it("getWorkspaceForTenant queries db with correct params", async () => {
		const mockGet = vi.fn(() => ({ id: 1, slug: "default", name: "Default", tenant_id: 1 }));
		const mockDb = {
			prepare: vi.fn(() => ({ get: mockGet, all: vi.fn(() => []), run: vi.fn() })),
		} as any;

		const { getWorkspaceForTenant } = await import("@/lib/workspaces");
		const ws = getWorkspaceForTenant(mockDb, 1, 1);
		expect(ws).toBeDefined();
		expect(ws?.id).toBe(1);
		expect(mockDb.prepare).toHaveBeenCalled();
	});

	it("getWorkspaceForTenant returns null when not found", async () => {
		const mockDb = {
			prepare: vi.fn(() => ({ get: vi.fn(() => undefined), all: vi.fn(() => []), run: vi.fn() })),
		} as any;

		const { getWorkspaceForTenant } = await import("@/lib/workspaces");
		const ws = getWorkspaceForTenant(mockDb, 999, 1);
		expect(ws).toBeNull();
	});

	it("listWorkspacesForTenant returns array", async () => {
		const mockDb = {
			prepare: vi.fn(() => ({ all: vi.fn(() => [{ id: 1, slug: "ws1" }]), get: vi.fn(), run: vi.fn() })),
		} as any;

		const { listWorkspacesForTenant } = await import("@/lib/workspaces");
		const result = listWorkspacesForTenant(mockDb, 1);
		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);
	});

	it("assertWorkspaceTenant throws when workspace not found", async () => {
		const mockDb = {
			prepare: vi.fn(() => ({
				get: vi.fn(() => undefined),
				run: vi.fn(),
			})),
		} as any;

		const { assertWorkspaceTenant } = await import("@/lib/workspaces");
		expect(() => assertWorkspaceTenant(mockDb, 1, 1)).toThrow("Workspace not found");
	});

	it("assertWorkspaceTenant passes on match", async () => {
		const mockDb = {
			prepare: vi.fn(() => ({
				get: vi.fn(() => ({ id: 1, tenant_id: 1 })),
				run: vi.fn(),
			})),
		} as any;

		const { assertWorkspaceTenant } = await import("@/lib/workspaces");
		expect(() => assertWorkspaceTenant(mockDb, 1, 1)).not.toThrow();
	});
});
