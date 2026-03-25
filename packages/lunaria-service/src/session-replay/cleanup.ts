/**
 * Session replay storage cleanup.
 *
 * Recordings are stored as gzip-compressed files in `~/.amoena/recordings/`.
 * This module prunes files older than a configurable retention period.
 * It is designed to be called once on service startup.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

/** Default retention period in milliseconds (30 days). */
export const DEFAULT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** Result returned by {@link runReplayCleanup}. */
export interface CleanupResult {
  /** Number of files that were deleted. */
  deleted: number;
  /** Number of files that were kept. */
  kept: number;
  /** Absolute paths of deleted files. */
  deletedPaths: string[];
  /** Any errors encountered while deleting individual files. */
  errors: Array<{ path: string; message: string }>;
}

/**
 * Options for {@link runReplayCleanup}.
 */
export interface CleanupOptions {
  /**
   * Directory that contains recording files.
   * Defaults to `~/.amoena/recordings/`.
   */
  recordingsDir?: string;
  /**
   * Maximum age in milliseconds before a recording is deleted.
   * Defaults to {@link DEFAULT_RETENTION_MS} (30 days).
   */
  retentionMs?: number;
  /**
   * If true, log deleted and kept file counts to stderr.
   * Defaults to false.
   */
  verbose?: boolean;
}

/**
 * Returns the default recordings directory: `~/.amoena/recordings/`.
 */
export function defaultRecordingsDir(): string {
  return path.join(os.homedir(), ".amoena", "recordings");
}

/**
 * Deletes session recording files older than the retention period.
 *
 * Only files whose names end in `.gz` are considered recordings.
 * Directories inside `recordingsDir` are ignored.
 *
 * @param options - Optional configuration overrides.
 * @returns A {@link CleanupResult} summary.
 *
 * @example
 * ```ts
 * // On service startup:
 * const result = await runReplayCleanup({ verbose: true });
 * console.log(`Cleaned up ${result.deleted} old recordings.`);
 * ```
 */
export async function runReplayCleanup(
  options: CleanupOptions = {},
): Promise<CleanupResult> {
  const {
    recordingsDir = defaultRecordingsDir(),
    retentionMs = DEFAULT_RETENTION_MS,
    verbose = false,
  } = options;

  const result: CleanupResult = {
    deleted: 0,
    kept: 0,
    deletedPaths: [],
    errors: [],
  };

  // Directory may not exist yet — that is fine.
  if (!fs.existsSync(recordingsDir)) {
    return result;
  }

  const cutoff = Date.now() - retentionMs;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(recordingsDir, { withFileTypes: true });
  } catch (err) {
    result.errors.push({
      path: recordingsDir,
      message: err instanceof Error ? err.message : String(err),
    });
    return result;
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".gz")) {
      continue;
    }

    const filePath = path.join(recordingsDir, entry.name);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      // File disappeared between readdir and stat — skip it
      continue;
    }

    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs > retentionMs || stat.mtimeMs < cutoff) {
      try {
        fs.unlinkSync(filePath);
        result.deleted += 1;
        result.deletedPaths.push(filePath);
      } catch (err) {
        result.errors.push({
          path: filePath,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    } else {
      result.kept += 1;
    }
  }

  if (verbose) {
    process.stderr.write(
      `[session-replay] cleanup: deleted=${result.deleted} kept=${result.kept}\n`,
    );
  }

  return result;
}
