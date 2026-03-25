import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Clamp a number to [min, max], falling back to `fallback` if NaN. */
function clampInt(
	value: number,
	min: number,
	max: number,
	fallback: number,
): number {
	if (Number.isNaN(value)) return fallback;
	return Math.max(min, Math.min(max, Math.floor(value)));
}

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const defaultDataDir = path.join(process.cwd(), ".data");
const configuredDataDir = process.env.AMOENA_DATA_DIR || defaultDataDir;
const buildScratchRoot =
	process.env.AMOENA_BUILD_DATA_DIR || path.join(os.tmpdir(), "amoena-build");
const resolvedDataDir = isBuildPhase
	? path.join(buildScratchRoot, `worker-${process.pid}`)
	: configuredDataDir;
const resolvedDbPath = isBuildPhase
	? process.env.AMOENA_BUILD_DB_PATH ||
		path.join(resolvedDataDir, "amoena.db")
	: process.env.AMOENA_DB_PATH || path.join(resolvedDataDir, "amoena.db");
const resolvedTokensPath = isBuildPhase
	? process.env.AMOENA_BUILD_TOKENS_PATH ||
		path.join(resolvedDataDir, "amoena-tokens.json")
	: process.env.AMOENA_TOKENS_PATH ||
		path.join(resolvedDataDir, "amoena-tokens.json");
const defaultAmoenaStateDir = path.join(os.homedir(), ".amoena");
const explicitAmoenaConfigPath =
	process.env.AMOENA_CONFIG_PATH ||
	process.env.AMOENA_AMOENA_CONFIG_PATH ||
	"";
const legacyAmoenaHome =
	process.env.AMOENA_HOME ||
	process.env.CLAWDBOT_HOME ||
	process.env.AMOENA_AMOENA_HOME ||
	"";
const amoenaStateDir =
	process.env.AMOENA_STATE_DIR ||
	process.env.CLAWDBOT_STATE_DIR ||
	legacyAmoenaHome ||
	(explicitAmoenaConfigPath
		? path.dirname(explicitAmoenaConfigPath)
		: defaultAmoenaStateDir);
const amoenaConfigPath =
	explicitAmoenaConfigPath || path.join(amoenaStateDir, "amoena.json");
const amoenaWorkspaceDir =
	process.env.AMOENA_WORKSPACE_DIR ||
	process.env.AMOENA_WORKSPACE_DIR ||
	(amoenaStateDir ? path.join(amoenaStateDir, "workspace") : "");
const defaultMemoryDir = (() => {
	if (process.env.AMOENA_MEMORY_DIR) return process.env.AMOENA_MEMORY_DIR;
	// Prefer Amoena workspace memory context (daily notes + knowledge-base)
	// when available; fallback to legacy sqlite memory path.
	if (
		amoenaWorkspaceDir &&
		(fs.existsSync(path.join(amoenaWorkspaceDir, "memory")) ||
			fs.existsSync(path.join(amoenaWorkspaceDir, "knowledge-base")))
	) {
		return amoenaWorkspaceDir;
	}
	return (
		(amoenaStateDir ? path.join(amoenaStateDir, "memory") : "") ||
		path.join(defaultDataDir, "memory")
	);
})();

const resolvedGnapRepoPath =
	process.env.GNAP_REPO_PATH || path.join(configuredDataDir, ".gnap");

export const config = {
	claudeHome: process.env.MC_CLAUDE_HOME || path.join(os.homedir(), ".claude"),
	dataDir: resolvedDataDir,
	dbPath: resolvedDbPath,
	tokensPath: resolvedTokensPath,
	// Keep amoenaHome as a legacy alias for existing code paths.
	amoenaHome: amoenaStateDir,
	amoenaStateDir,
	amoenaConfigPath,
	amoenaBin: process.env.AMOENA_BIN || "amoena",
	clawdbotBin: process.env.CLAWDBOT_BIN || "clawdbot",
	gatewayHost: process.env.AMOENA_GATEWAY_HOST || "127.0.0.1",
	gatewayPort: clampInt(
		Number(process.env.AMOENA_GATEWAY_PORT || "18789"),
		1,
		65535,
		18789,
	),
	logsDir:
		process.env.AMOENA_LOG_DIR ||
		(amoenaStateDir ? path.join(amoenaStateDir, "logs") : ""),
	tempLogsDir: process.env.CLAWDBOT_TMP_LOG_DIR || "",
	memoryDir: defaultMemoryDir,
	memoryAllowedPrefixes:
		defaultMemoryDir === amoenaWorkspaceDir
			? ["memory/", "knowledge-base/"]
			: [],
	soulTemplatesDir:
		process.env.AMOENA_SOUL_TEMPLATES_DIR ||
		(amoenaStateDir ? path.join(amoenaStateDir, "templates", "souls") : ""),
	homeDir: os.homedir(),
	gnap: {
		enabled: process.env.GNAP_ENABLED === "true",
		repoPath: resolvedGnapRepoPath,
		autoSync: process.env.GNAP_AUTO_SYNC !== "false",
		remoteUrl: process.env.GNAP_REMOTE_URL || "",
	},
	// Data retention (days). 0 = keep forever. Negative values are clamped to 0.
	retention: {
		activities: clampInt(
			Number(process.env.MC_RETAIN_ACTIVITIES_DAYS || "90"),
			0,
			3650,
			90,
		),
		auditLog: clampInt(
			Number(process.env.MC_RETAIN_AUDIT_DAYS || "365"),
			0,
			3650,
			365,
		),
		logs: clampInt(
			Number(process.env.MC_RETAIN_LOGS_DAYS || "30"),
			0,
			3650,
			30,
		),
		notifications: clampInt(
			Number(process.env.MC_RETAIN_NOTIFICATIONS_DAYS || "60"),
			0,
			3650,
			60,
		),
		pipelineRuns: clampInt(
			Number(process.env.MC_RETAIN_PIPELINE_RUNS_DAYS || "90"),
			0,
			3650,
			90,
		),
		tokenUsage: clampInt(
			Number(process.env.MC_RETAIN_TOKEN_USAGE_DAYS || "90"),
			0,
			3650,
			90,
		),
		gatewaySessions: clampInt(
			Number(process.env.MC_RETAIN_GATEWAY_SESSIONS_DAYS || "90"),
			0,
			3650,
			90,
		),
	},
};

export function ensureDirExists(dirPath: string) {
	if (!dirPath) return;
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}
