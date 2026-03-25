import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  runReplayCleanup,
  DEFAULT_RETENTION_MS,
  defaultRecordingsDir,
} from "./cleanup.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "amoena-replay-test-"));
}

function writeFile(dir: string, name: string, mtimeMs: number): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, "data");
  fs.utimesSync(p, mtimeMs / 1000, mtimeMs / 1000);
  return p;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("defaultRecordingsDir", () => {
  it("returns a path under the home directory", () => {
    const dir = defaultRecordingsDir();
    expect(dir).toContain(os.homedir());
    expect(dir).toContain(".amoena");
    expect(dir).toContain("recordings");
  });
});

describe("runReplayCleanup", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns zeroes when the directory does not exist", async () => {
    const result = await runReplayCleanup({
      recordingsDir: path.join(tmpDir, "nonexistent"),
    });
    expect(result.deleted).toBe(0);
    expect(result.kept).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("deletes .gz files older than the retention period", async () => {
    const OLD = Date.now() - DEFAULT_RETENTION_MS - 1000;
    const p = writeFile(tmpDir, "old.gz", OLD);

    const result = await runReplayCleanup({ recordingsDir: tmpDir });

    expect(result.deleted).toBe(1);
    expect(result.deletedPaths).toContain(p);
    expect(fs.existsSync(p)).toBe(false);
  });

  it("keeps .gz files within the retention period", async () => {
    const RECENT = Date.now() - 1000; // 1 second ago
    writeFile(tmpDir, "new.gz", RECENT);

    const result = await runReplayCleanup({ recordingsDir: tmpDir });

    expect(result.deleted).toBe(0);
    expect(result.kept).toBe(1);
  });

  it("ignores non-.gz files", async () => {
    const OLD = Date.now() - DEFAULT_RETENTION_MS - 1000;
    const p = writeFile(tmpDir, "old.json", OLD);

    const result = await runReplayCleanup({ recordingsDir: tmpDir });

    expect(result.deleted).toBe(0);
    expect(fs.existsSync(p)).toBe(true);
  });

  it("handles a mix of old and new recordings", async () => {
    const OLD = Date.now() - DEFAULT_RETENTION_MS - 1000;
    const RECENT = Date.now() - 1000;
    writeFile(tmpDir, "a-old.gz", OLD);
    writeFile(tmpDir, "b-old.gz", OLD);
    writeFile(tmpDir, "c-new.gz", RECENT);

    const result = await runReplayCleanup({ recordingsDir: tmpDir });

    expect(result.deleted).toBe(2);
    expect(result.kept).toBe(1);
  });

  it("respects a custom retentionMs", async () => {
    const ONE_HOUR = 60 * 60 * 1000;
    // File is 2 hours old
    const TWO_HOURS_AGO = Date.now() - 2 * ONE_HOUR;
    const p = writeFile(tmpDir, "two-hours.gz", TWO_HOURS_AGO);

    const result = await runReplayCleanup({
      recordingsDir: tmpDir,
      retentionMs: ONE_HOUR,
    });

    expect(result.deleted).toBe(1);
    expect(result.deletedPaths).toContain(p);
  });

  it("returns empty result for an empty directory", async () => {
    const result = await runReplayCleanup({ recordingsDir: tmpDir });
    expect(result.deleted).toBe(0);
    expect(result.kept).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});
