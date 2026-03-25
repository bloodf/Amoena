import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/plugins", () => ({
	getPluginToolProviders: vi.fn(() => []),
}));

describe("agent-templates", () => {
	describe("AGENT_TEMPLATES", () => {
		it("exports a non-empty array of templates", async () => {
			const { AGENT_TEMPLATES } = await import("@/lib/agent-templates");
			expect(AGENT_TEMPLATES.length).toBeGreaterThan(0);
		});

		it("each template has required fields", async () => {
			const { AGENT_TEMPLATES } = await import("@/lib/agent-templates");
			for (const tpl of AGENT_TEMPLATES) {
				expect(tpl.type).toBeTruthy();
				expect(tpl.label).toBeTruthy();
				expect(tpl.description).toBeTruthy();
				expect(["opus", "sonnet", "haiku"]).toContain(tpl.modelTier);
				expect(tpl.config.model.primary).toBeTruthy();
				expect(tpl.config.identity).toBeDefined();
				expect(tpl.config.sandbox).toBeDefined();
				expect(tpl.config.tools.allow.length).toBeGreaterThan(0);
			}
		});

		it("has unique template types", async () => {
			const { AGENT_TEMPLATES } = await import("@/lib/agent-templates");
			const types = AGENT_TEMPLATES.map((t) => t.type);
			expect(new Set(types).size).toBe(types.length);
		});
	});

	describe("getTemplate", () => {
		it("finds a template by type", async () => {
			const { getTemplate } = await import("@/lib/agent-templates");
			const tpl = getTemplate("orchestrator");
			expect(tpl).toBeDefined();
			expect(tpl?.type).toBe("orchestrator");
		});

		it("returns undefined for unknown type", async () => {
			const { getTemplate } = await import("@/lib/agent-templates");
			expect(getTemplate("nonexistent")).toBeUndefined();
		});
	});

	describe("buildAgentConfig", () => {
		it("builds config from template with overrides", async () => {
			const { AGENT_TEMPLATES, buildAgentConfig } = await import("@/lib/agent-templates");
			const tpl = AGENT_TEMPLATES[0];
			const config = buildAgentConfig(tpl, {
				id: "test-agent",
				name: "Test Agent",
				workspace: "/tmp/ws",
				emoji: "🤖",
			});

			expect(config.id).toBe("test-agent");
			expect(config.name).toBe("Test Agent");
			expect(config.workspace).toBe("/tmp/ws");
			expect(config.identity.name).toBe("Test Agent");
			expect(config.identity.emoji).toBe("🤖");
		});

		it("overrides model when specified", async () => {
			const { AGENT_TEMPLATES, buildAgentConfig } = await import("@/lib/agent-templates");
			const tpl = AGENT_TEMPLATES[0];
			const config = buildAgentConfig(tpl, {
				id: "a1",
				name: "Agent",
				model: "custom/model",
			});

			expect(config.model.primary).toBe("custom/model");
		});

		it("overrides sandbox settings", async () => {
			const { AGENT_TEMPLATES, buildAgentConfig } = await import("@/lib/agent-templates");
			const tpl = AGENT_TEMPLATES[0];
			const config = buildAgentConfig(tpl, {
				id: "a1",
				name: "Agent",
				workspaceAccess: "ro",
				sandboxMode: "all",
				dockerNetwork: "none",
			});

			expect(config.sandbox.workspaceAccess).toBe("ro");
			expect(config.sandbox.mode).toBe("all");
			expect(config.sandbox.docker?.network).toBe("none");
		});

		it("does not mutate the original template", async () => {
			const { AGENT_TEMPLATES, buildAgentConfig } = await import("@/lib/agent-templates");
			const tpl = AGENT_TEMPLATES[0];
			const originalName = tpl.config.identity.name;
			buildAgentConfig(tpl, { id: "a1", name: "Modified" });
			expect(tpl.config.identity.name).toBe(originalName);
		});

		it("overrides subagent allow agents", async () => {
			const { AGENT_TEMPLATES, buildAgentConfig } = await import("@/lib/agent-templates");
			const tpl = AGENT_TEMPLATES.find((t) => t.config.subagents);
			if (!tpl) return;
			const config = buildAgentConfig(tpl, {
				id: "a1",
				name: "Agent",
				subagentAllowAgents: ["agent-a", "agent-b"],
			});
			expect(config.subagents?.allowAgents).toEqual(["agent-a", "agent-b"]);
		});
	});

	describe("getEffectiveToolGroups", () => {
		it("returns base tool groups without plugins", async () => {
			const { getEffectiveToolGroups } = await import("@/lib/agent-templates");
			const groups = getEffectiveToolGroups();
			expect(groups.coding).toBeDefined();
			expect(groups.browser).toBeDefined();
			expect(groups.memory).toBeDefined();
		});
	});

	describe("MODEL_TIERS", () => {
		it("has all three tiers", async () => {
			const { MODEL_TIERS } = await import("@/lib/agent-templates");
			expect(MODEL_TIERS.opus).toBeDefined();
			expect(MODEL_TIERS.sonnet).toBeDefined();
			expect(MODEL_TIERS.haiku).toBeDefined();
		});
	});

	describe("TOOL_GROUP_LABELS", () => {
		it("has labels for known groups", async () => {
			const { TOOL_GROUP_LABELS } = await import("@/lib/agent-templates");
			expect(TOOL_GROUP_LABELS.coding).toBeTruthy();
			expect(TOOL_GROUP_LABELS.browser).toBeTruthy();
		});
	});
});
