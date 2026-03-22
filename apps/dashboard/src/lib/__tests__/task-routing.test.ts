import { describe, expect, it } from "vitest";
import { resolveTaskImplementationTarget } from "@/lib/task-routing";

describe("resolveTaskImplementationTarget", () => {
	it("returns explicit implementation target metadata when present", () => {
		const result = resolveTaskImplementationTarget({
			metadata: {
				implementation_repo: "LunariaAi/lunaria",
				code_location: "/apps/api",
			},
		});

		expect(result).toEqual({
			implementation_repo: "LunariaAi/lunaria",
			code_location: "/apps/api",
		});
	});

	it("supports legacy metadata keys for backward compatibility", () => {
		const result = resolveTaskImplementationTarget({
			metadata: {
				github_repo: "LunariaAi/lunaria",
				path: "/packages/core",
			},
		});

		expect(result).toEqual({
			implementation_repo: "LunariaAi/lunaria",
			code_location: "/packages/core",
		});
	});

	it("prefers explicit implementation target metadata over legacy fallback keys", () => {
		const result = resolveTaskImplementationTarget({
			metadata: {
				implementation_repo: "LunariaAi/lunaria",
				github_repo: "legacy/repo",
				code_location: "/apps/api",
				path: "/legacy/path",
			},
		});

		expect(result).toEqual({
			implementation_repo: "LunariaAi/lunaria",
			code_location: "/apps/api",
		});
	});

	it("returns empty object for missing metadata", () => {
		expect(resolveTaskImplementationTarget({ metadata: null })).toEqual({});
	});
});
