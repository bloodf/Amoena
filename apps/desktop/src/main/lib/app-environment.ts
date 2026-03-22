import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { LUNARIA_DIR_NAME } from "shared/constants";

const LUNARIA_HOME_DIR_ENV = "LUNARIA_HOME_DIR";

export const LUNARIA_HOME_DIR =
	process.env[LUNARIA_HOME_DIR_ENV] || join(homedir(), LUNARIA_DIR_NAME);
process.env[LUNARIA_HOME_DIR_ENV] = LUNARIA_HOME_DIR;

export const LUNARIA_HOME_DIR_MODE = 0o700;
export const LUNARIA_SENSITIVE_FILE_MODE = 0o600;

export function ensureSupersetHomeDirExists(): void {
	if (!existsSync(LUNARIA_HOME_DIR)) {
		mkdirSync(LUNARIA_HOME_DIR, {
			recursive: true,
			mode: LUNARIA_HOME_DIR_MODE,
		});
	}

	// Best-effort repair if the directory already existed with weak permissions.
	try {
		chmodSync(LUNARIA_HOME_DIR, LUNARIA_HOME_DIR_MODE);
	} catch (error) {
		console.warn(
			"[app-environment] Failed to chmod Superset home dir (best-effort):",
			LUNARIA_HOME_DIR,
			error,
		);
	}
}

// For lowdb - use our own path instead of app.getPath("userData")
export const APP_STATE_PATH = join(LUNARIA_HOME_DIR, "app-state.json");

// Window geometry state (separate from UI state - main process only, sync I/O)
export const WINDOW_STATE_PATH = join(LUNARIA_HOME_DIR, "window-state.json");
