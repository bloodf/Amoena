import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/command", () => ({
	runCommand: vi.fn().mockResolvedValue({ stdout: "", stderr: "", code: 0 }),
}));

vi.mock("@/lib/provisioner-client", () => ({
	runProvisionerCommand: vi.fn().mockResolvedValue({ stdout: "", stderr: "", code: 0 }),
}));

describe("super-admin", () => {
	describe("buildBootstrapPlan", () => {
		it("returns expected provision steps", async () => {
			const { buildBootstrapPlan } = await import("@/lib/super-admin");
			const plan = buildBootstrapPlan(
				{
					slug: "test-tenant",
					linux_user: "oc-test",
					amoena_home: "/home/oc-test/.amoena",
					workspace_root: "/home/oc-test/workspace",
					gateway_port: 18800,
				},
				{
					templateAmoenaJsonPath: "/etc/amoena/template.json",
					gatewaySystemdTemplatePath: "/etc/systemd/lunaria-gateway@.service",
				},
			);

			expect(plan.length).toBeGreaterThan(0);
			expect(plan[0].key).toBe("create-linux-user");
			expect(plan.some((s) => s.key === "create-amoena-state")).toBe(true);
			expect(plan.some((s) => s.key === "enable-start-gateway")).toBe(true);
			expect(plan.every((s) => s.requires_root)).toBe(true);
		});

		it("includes correct linux user in commands", async () => {
			const { buildBootstrapPlan } = await import("@/lib/super-admin");
			const plan = buildBootstrapPlan(
				{
					slug: "acme",
					linux_user: "oc-acme",
					amoena_home: "/home/oc-acme/.amoena",
					workspace_root: "/home/oc-acme/workspace",
				},
				{
					templateAmoenaJsonPath: "/t.json",
					gatewaySystemdTemplatePath: "/s.service",
				},
			);

			const createUser = plan.find((s) => s.key === "create-linux-user");
			expect(createUser?.command).toContain("oc-acme");
		});
	});

	describe("buildDecommissionPlan", () => {
		it("returns minimal plan without removal flags", async () => {
			const { buildDecommissionPlan } = await import("@/lib/super-admin");
			const plan = buildDecommissionPlan({
				slug: "test",
				linux_user: "oc-test",
				amoena_home: "/home/oc-test/.amoena",
				workspace_root: "/home/oc-test/workspace",
			});

			expect(plan.length).toBe(2);
			expect(plan[0].key).toBe("disable-stop-gateway");
			expect(plan[1].key).toBe("remove-tenant-gateway-env");
		});

		it("includes state dir removal when requested", async () => {
			const { buildDecommissionPlan } = await import("@/lib/super-admin");
			const plan = buildDecommissionPlan(
				{
					slug: "test",
					linux_user: "oc-test",
					amoena_home: "/home/oc-test/.amoena",
					workspace_root: "/home/oc-test/workspace",
				},
				{ remove_state_dirs: true },
			);

			expect(plan.some((s) => s.key === "remove-amoena-state-dir")).toBe(true);
			expect(plan.some((s) => s.key === "remove-workspace-dir")).toBe(true);
		});

		it("includes linux user removal when requested", async () => {
			const { buildDecommissionPlan } = await import("@/lib/super-admin");
			const plan = buildDecommissionPlan(
				{
					slug: "test",
					linux_user: "oc-test",
					amoena_home: "/home/oc-test/.amoena",
					workspace_root: "/home/oc-test/workspace",
				},
				{ remove_linux_user: true },
			);

			expect(plan.some((s) => s.key === "remove-linux-user")).toBe(true);
		});

		it("skips state dir removal when linux user removal includes home", async () => {
			const { buildDecommissionPlan } = await import("@/lib/super-admin");
			const plan = buildDecommissionPlan(
				{
					slug: "test",
					linux_user: "oc-test",
					amoena_home: "/home/oc-test/.amoena",
					workspace_root: "/home/oc-test/workspace",
				},
				{ remove_linux_user: true, remove_state_dirs: true },
			);

			// When removing the user with -r, no need for separate dir removal
			expect(plan.some((s) => s.key === "remove-linux-user")).toBe(true);
			expect(plan.some((s) => s.key === "remove-amoena-state-dir")).toBe(false);
		});
	});
});
