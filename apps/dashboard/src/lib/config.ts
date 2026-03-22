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
const configuredDataDir = process.env.LUNARIA_DATA_DIR || defaultDataDir;
const buildScratchRoot =
	process.env.LUNARIA_BUILD_DATA_DIR || path.join(os.tmpdir(), "lunaria-build");
const resolvedDataDir = isBuildPhase
	? path.join(buildScratchRoot, `worker-${process.pid}`)
	: configuredDataDir;
const resolvedDbPath = isBuildPhase
	? process.env.LUNARIA_BUILD_DB_PATH ||
		path.join(resolvedDataDir, "lunaria.db")
	: process.env.LUNARIA_DB_PATH || path.join(resolvedDataDir, "lunaria.db");
const resolvedTokensPath = isBuildPhase
	? process.env.LUNARIA_BUILD_TOKENS_PATH ||
		path.join(resolvedDataDir, "lunaria-tokens.json")
	: process.env.LUNARIA_TOKENS_PATH ||
		path.join(resolvedDataDir, "lunaria-tokens.json");
const defaultLunariaStateDir = path.join(os.homedir(), ".lunaria");
const explicitLunariaConfigPath =
	process.env.LUNARIA_CONFIG_PATH ||
	process.env.LUNARIA_LUNARIA_CONFIG_PATH ||
	"";
const legacyLunariaHome =
	process.env.LUNARIA_HOME ||
	process.env.CLAWDBOT_HOME ||
	process.env.LUNARIA_LUNARIA_HOME ||
	"";
const lunariaStateDir =
	process.env.LUNARIA_STATE_DIR ||
	process.env.CLAWDBOT_STATE_DIR ||
	legacyLunariaHome ||
	(explicitLunariaConfigPath
		? path.dirname(explicitLunariaConfigPath)
		: defaultLunariaStateDir);
const lunariaConfigPath =
	explicitLunariaConfigPath || path.join(lunariaStateDir, "lunaria.json");
const lunariaWorkspaceDir =
	process.env.LUNARIA_WORKSPACE_DIR ||
	process.env.LUNARIA_WORKSPACE_DIR ||
	(lunariaStateDir ? path.join(lunariaStateDir, "workspace") : "");
const defaultMemoryDir = (() => {
	if (process.env.LUNARIA_MEMORY_DIR) return process.env.LUNARIA_MEMORY_DIR;
	// Prefer Lunaria workspace memory context (daily notes + knowledge-base)
	// when available; fallback to legacy sqlite memory path.
	if (
		lunariaWorkspaceDir &&
		(fs.existsSync(path.join(lunariaWorkspaceDir, "memory")) ||
			fs.existsSync(path.join(lunariaWorkspaceDir, "knowledge-base")))
	) {
		return lunariaWorkspaceDir;
	}
	return (
		(lunariaStateDir ? path.join(lunariaStateDir, "memory") : "") ||
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
	// Keep lunariaHome as a legacy alias for existing code paths.
	lunariaHome: lunariaStateDir,
	lunariaStateDir,
	lunariaConfigPath,
	lunariaBin: process.env.LUNARIA_BIN || "lunaria",
	clawdbotBin: process.env.CLAWDBOT_BIN || "clawdbot",
	gatewayHost: process.env.LUNARIA_GATEWAY_HOST || "127.0.0.1",
	gatewayPort: clampInt(
		Number(process.env.LUNARIA_GATEWAY_PORT || "18789"),
		1,
		65535,
		18789,
	),
	logsDir:
		process.env.LUNARIA_LOG_DIR ||
		(lunariaStateDir ? path.join(lunariaStateDir, "logs") : ""),
	tempLogsDir: process.env.CLAWDBOT_TMP_LOG_DIR || "",
	memoryDir: defaultMemoryDir,
	memoryAllowedPrefixes:
		defaultMemoryDir === lunariaWorkspaceDir
			? ["memory/", "knowledge-base/"]
			: [],
	soulTemplatesDir:
		process.env.LUNARIA_SOUL_TEMPLATES_DIR ||
		(lunariaStateDir ? path.join(lunariaStateDir, "templates", "souls") : ""),
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
