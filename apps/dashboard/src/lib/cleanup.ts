/**
 * Session replay storage info reader.
 * Provides storage metadata for diagnostics and replay APIs.
 * The actual cleanup is performed by the service at startup.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

/** Default retention period in milliseconds (30 days). */
export const DEFAULT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** Cleanup result structure */
export interface CleanupResult {
	deleted: number;
	kept: number;
	deletedPaths: string[];
	errors: Array<{ path: string; message: string }>;
}

/**
 * Returns the default recordings directory: `~/.amoena/recordings/`.
 */
export function defaultRecordingsDir(): string {
	return path.join(os.homedir(), ".amoena", "recordings");
}

/**
 * Gets storage info for the recordings directory.
 * This is a read-only operation that does NOT delete files.
 */
export async function getReplayStorageInfo(): Promise<{
	recordingsDir: string;
	retentionMs: number;
	deleted: number;
	kept: number;
}> {
	const recordingsDir = defaultRecordingsDir();
	const retentionMs = DEFAULT_RETENTION_MS;

	// If directory doesn't exist, return zeroes
	if (!fs.existsSync(recordingsDir)) {
		return { recordingsDir, retentionMs, deleted: 0, kept: 0 };
	}

	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(recordingsDir, { withFileTypes: true });
	} catch {
		return { recordingsDir, retentionMs, deleted: 0, kept: 0 };
	}

	let kept = 0;
	const cutoff = Date.now() - retentionMs;

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".gz")) {
			continue;
		}

		const filePath = path.join(recordingsDir, entry.name);
		try {
			const stat = fs.statSync(filePath);
			if (stat.mtimeMs >= cutoff) {
				kept += 1;
			}
		} catch {
			// File disappeared - skip
		}
	}

	return { recordingsDir, retentionMs, deleted: 0, kept };
}
