import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { config } from "@/lib/config";
import { resolveWithin } from "@/lib/paths";

function resolvePath(candidate: string): string {
	if (isAbsolute(candidate)) return resolve(candidate);
	if (!config.lunariaStateDir)
		throw new Error("LUNARIA_STATE_DIR not configured");
	return resolveWithin(config.lunariaStateDir, candidate);
}

export function getAgentWorkspaceCandidates(
	agentConfig: any,
	agentName: string,
): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	const push = (value?: string | null) => {
		if (!value) return;
		try {
			const resolved = resolvePath(value);
			if (seen.has(resolved)) return;
			seen.add(resolved);
			out.push(resolved);
		} catch {
			// ignore invalid/out-of-bounds candidates
		}
	};

	const rawWorkspace =
		typeof agentConfig?.workspace === "string"
			? agentConfig.workspace.trim()
			: "";
	const lunariaIdRaw =
		typeof agentConfig?.lunariaId === "string" && agentConfig.lunariaId.trim()
			? agentConfig.lunariaId.trim()
			: agentName;
	const lunariaId = lunariaIdRaw.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");

	push(rawWorkspace || null);
	push(`workspace-${lunariaId}`);
	push(`agents/${lunariaId}`);
	push("workspace");

	return out.filter((value) => existsSync(value));
}

export function readAgentWorkspaceFile(
	workspaceCandidates: string[],
	names: string[],
):
	| { content: string; path: string; exists: true }
	| { content: ""; path: null; exists: false } {
	const { readFileSync } = require("node:fs") as typeof import("node:fs");
	for (const workspace of workspaceCandidates) {
		for (const name of names) {
			try {
				const fullPath = resolveWithin(workspace, name);
				if (existsSync(fullPath)) {
					return {
						content: readFileSync(fullPath, "utf-8"),
						path: fullPath,
						exists: true,
					};
				}
			} catch {
				// ignore and continue
			}
		}
	}
	return { content: "", path: null, exists: false };
}
