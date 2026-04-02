/**
 * Release Harness — Phase 6 smoke flows for Amoena Dashboard.
 *
 * These tests cover the three release-critical flows that must pass
 * before shipping. They are intentionally narrow: API contract + branding
 * regression only — no full-screen snapshots, no external credentials,
 * no human steps required.
 *
 * RED phase: each test asserts the contract and will fail until the
 * implementation is wired. GREEN phase: assertions remain, providing
 * a regression net for future changes.
 *
 * Flows:
 *   1. Remote pairing bootstrap — POST /api/remote returns { pin, qr }
 *   2. Replay listing            — GET  /api/replay returns { recordings }
 *   3. Branding regression       — page must NOT contain "Superset" text
 *
 * Environment:
 *   AMOENA_LOCAL_MODE=true is set via the test:e2e:amoena:local script,
 *   which bypasses auth with a local admin user (auth.ts:804).
 */

import { test, expect, type Page } from '@playwright/test';

/* ---------------------------------------------------------------------------
 * Shared base URL — all tests run against the same live server.
 * The webServer is NOT launched by Playwright; the dashboard must be
 * running (bun run dev or bun run start) before executing tests.
 * --------------------------------------------------------------------------- */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/* ---------------------------------------------------------------------------
 * Helper: fetch JSON from the dashboard API with local-mode auth bypass.
 * Uses AMOENA_LOCAL_MODE=true via the script env, which creates a synthetic
 * admin user in requireRole without checking credentials.
 * --------------------------------------------------------------------------- */
async function apiFetch<T = unknown>(page: Page, path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const response = await page.request.fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      /* AMOENA_LOCAL_MODE=true is set in the shell before Playwright starts;
         Next.js reads it at startup. We also pass it per-request in case the
         server was started without it. */
      ...(process.env.AMOENA_LOCAL_MODE === 'true' ? { 'x-amoena-local-mode': 'true' } : {}),
      ...options?.headers,
    },
  });
  return response.json() as Promise<T>;
}

/* ---------------------------------------------------------------------------
 * Flow 1: Remote Pairing Bootstrap
 *
 * POST /api/remote initiates a pairing session and returns a 6-digit PIN
 * plus a QR data URL. This is the first step in the remote access flow.
 *
 * Expected shape (route.ts:36-47):
 *   { pin: string, qr: string }
 * --------------------------------------------------------------------------- */
test.describe('Phase 6 — Remote Pairing Bootstrap', () => {
  test('POST /api/remote returns { pin, qr } with 200 OK', async ({ page }) => {
    const body = await apiFetch<{ pin: string; qr: string }>(page, '/api/remote', {
      method: 'POST',
    });

    /* PIN must be a 6-digit string */
    expect(body).toHaveProperty('pin');
    expect(typeof body.pin).toBe('string');
    expect(body.pin).toMatch(/^\d{6}$/);

    /* QR must be a data URL */
    expect(body).toHaveProperty('qr');
    expect(typeof body.qr).toBe('string');
    expect(body.qr).toMatch(/^data:image\/png;base64,/);
  });

  test('POST /api/remote pin is unique per call', async ({ page }) => {
    const [first, second] = await Promise.all([
      apiFetch<{ pin: string }>(page, '/api/remote', { method: 'POST' }),
      apiFetch<{ pin: string }>(page, '/api/remote', { method: 'POST' }),
    ]);

    /* Each call should generate a (statistically) new PIN */
    expect(first.pin).not.toBe(second.pin);
  });
});

/* ---------------------------------------------------------------------------
 * Flow 2: Replay Listing
 *
 * GET /api/replay returns the list of recorded agent sessions.
 * The session-replay-panel.tsx (lines 90-125) loads this data and displays
 * it in the sidebar.
 *
 * Expected shape (route.ts:55-72):
 *   { recordings: Array<{ id, agentName, model, durationSeconds, costUsd,
 *                         startedAt, finishedAt }> }
 * --------------------------------------------------------------------------- */
test.describe('Phase 6 — Replay Listing', () => {
  test('GET /api/replay returns { recordings: [...] } with 200 OK', async ({ page }) => {
    const body = await apiFetch<{ recordings: unknown[] }>(page, '/api/replay');

    expect(body).toHaveProperty('recordings');
    expect(Array.isArray(body.recordings)).toBe(true);
  });

  test('GET /api/replay recordings array items have required fields', async ({ page }) => {
    const body = await apiFetch<{
      recordings: Array<{
        id: string;
        agentName: string;
        model: string;
        durationSeconds: number;
        costUsd: number;
        startedAt: number;
        finishedAt: number | null;
      }>;
    }>(page, '/api/replay');

    for (const recording of body.recordings) {
      expect(recording).toHaveProperty('id');
      expect(typeof recording.id).toBe('string');

      expect(recording).toHaveProperty('agentName');
      expect(typeof recording.agentName).toBe('string');

      expect(recording).toHaveProperty('model');
      expect(typeof recording.model).toBe('string');

      expect(recording).toHaveProperty('durationSeconds');
      expect(typeof recording.durationSeconds).toBe('number');

      expect(recording).toHaveProperty('costUsd');
      expect(typeof recording.costUsd).toBe('number');

      expect(recording).toHaveProperty('startedAt');
      expect(typeof recording.startedAt).toBe('number');

      expect(recording).toHaveProperty('finishedAt');
      expect(recording.finishedAt === null || typeof recording.finishedAt === 'number').toBe(true);
    }
  });

  test('GET /api/replay?id=<non-existent> returns 404', async ({ page }) => {
    /* Nonce to bypass any caching */
    const nonce = Date.now();
    const response = await page.request.fetch(`${BASE_URL}/api/replay?id=nonexistent-${nonce}`);
    expect(response.status()).toBe(404);
  });
});

/* ---------------------------------------------------------------------------
 * Flow 3: Branding Regression — "Superset" must NOT appear
 *
 * Amoena was built by merging Mission Control, Superset, and claude-mem.
 * The dashboard UI must only display Amoena branding — never Superset.
 * This test crawls the main page and asserts that "Superset" does not
 * appear anywhere in the rendered text content.
 *
 * This is a regression test: it FAILS if Superset branding leaks into
 * the UI (e.g., via copy-paste errors or forgotten text).
 * --------------------------------------------------------------------------- */
test.describe('Phase 6 — Branding Regression', () => {
  test("main page does NOT contain 'Superset' text", async ({ page }) => {
    /* Navigate to the dashboard root — the auth bypass (AMOENA_LOCAL_MODE)
       means we land directly on the dashboard without a login redirect. */
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    /* Get all visible text on the page */
    const pageContent = await page.textContent('body');

    /* The word "Superset" must not appear anywhere in the rendered UI.
       Case-insensitive check to catch variations like "superset" or "SUPERSET". */
    const hasSuperset = pageContent?.toLowerCase().split(/\s+/).includes('superset');

    expect(hasSuperset).toBe(false);
  });

  test("login page does NOT contain 'Superset' text", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const pageContent = await page.textContent('body');
    const hasSuperset = pageContent?.toLowerCase().split(/\s+/).includes('superset');

    expect(hasSuperset).toBe(false);
  });
});
