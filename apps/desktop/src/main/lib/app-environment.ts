import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { AMOENA_DIR_NAME } from "shared/constants";

const AMOENA_HOME_DIR_ENV = "AMOENA_HOME_DIR";

export const AMOENA_HOME_DIR =
	process.env[AMOENA_HOME_DIR_ENV] || join(homedir(), AMOENA_DIR_NAME);
process.env[AMOENA_HOME_DIR_ENV] = AMOENA_HOME_DIR;

export const AMOENA_HOME_DIR_MODE = 0o700;
export const AMOENA_SENSITIVE_FILE_MODE = 0o600;

export function ensureAmoenaHomeDirExists(): void {
	if (!existsSync(AMOENA_HOME_DIR)) {
		mkdirSync(AMOENA_HOME_DIR, {
			recursive: true,
			mode: AMOENA_HOME_DIR_MODE,
		});
	}

	// Best-effort repair if the directory already existed with weak permissions.
	try {
		chmodSync(AMOENA_HOME_DIR, AMOENA_HOME_DIR_MODE);
	} catch (error) {
		console.warn(
			"[app-environment] Failed to chmod Amoena home dir (best-effort):",
			AMOENA_HOME_DIR,
			error,
		);
	}
}

// For lowdb - use our own path instead of app.getPath("userData")
export const APP_STATE_PATH = join(AMOENA_HOME_DIR, "app-state.json");

// Window geometry state (separate from UI state - main process only, sync I/O)
export const WINDOW_STATE_PATH = join(AMOENA_HOME_DIR, "window-state.json");
