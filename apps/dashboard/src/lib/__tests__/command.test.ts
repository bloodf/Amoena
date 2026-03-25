import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
	config: {
		amoenaBin: "/bin/echo",
		clawdbotBin: "/bin/echo",
		amoenaStateDir: "/tmp",
	},
}));

describe("command", () => {
	it("runCommand resolves with stdout on success", async () => {
		const { runCommand } = await import("@/lib/command");
		const result = await runCommand("/bin/echo", ["hello"]);
		expect(result.stdout.trim()).toBe("hello");
		expect(result.code).toBe(0);
	});

	it("runCommand rejects on failure", async () => {
		const { runCommand } = await import("@/lib/command");
		await expect(runCommand("/usr/bin/false", [])).rejects.toThrow();
	});

	it("runCommand rejects on nonexistent command", async () => {
		const { runCommand } = await import("@/lib/command");
		await expect(runCommand("nonexistent_command_12345", [])).rejects.toThrow();
	});

	it("runAmoena delegates to runCommand with config bin", async () => {
		const { runAmoena } = await import("@/lib/command");
		const result = await runAmoena(["test"]);
		expect(result.stdout.trim()).toBe("test");
	});

	it("runClawdbot delegates to runCommand with config bin", async () => {
		const { runClawdbot } = await import("@/lib/command");
		const result = await runClawdbot(["test"]);
		expect(result.stdout.trim()).toBe("test");
	});

	it("runCommand captures stderr", async () => {
		const { runCommand } = await import("@/lib/command");
		const result = await runCommand("sh", ["-c", "echo err >&2"]);
		expect(result.stderr.trim()).toBe("err");
	});
});
