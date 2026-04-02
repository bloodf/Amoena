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

import { test, expect, type APIResponse, type Page } from '@playwright/test';

/* ---------------------------------------------------------------------------
 * Shared base URL — all tests run against the same live server.
 * The webServer is NOT launched by Playwright; the dashboard must be
 * running (bun run dev or bun run start) before executing tests.
 * --------------------------------------------------------------------------- */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const RELEASE_CRITICAL_PAGES = ['/', '/login', '/remote', '/replay', '/autopilot'] as const;

type WorkflowTemplate = {
  id: number;
  name: string;
  model: string;
  task_prompt: string;
  timeout_seconds: number;
  created_by: string;
  created_at: number;
  updated_at: number;
  use_count: number;
  last_used_at: number | null;
  tags: string[];
  description?: string | null;
  agent_role?: string | null;
};

type WorkflowPipeline = {
  id: number;
  name: string;
  description: string | null;
  steps: Array<{ template_id: number; on_failure: 'stop' | 'continue' }>;
};

type PipelineRun = {
  id: number;
  pipeline_id: number;
  status: string;
  current_step: number;
  steps_snapshot: Array<{
    step_index: number;
    template_id: number;
    template_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    spawn_id: string | null;
    started_at: number | null;
    completed_at: number | null;
    error: string | null;
  }>;
};

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

async function apiRequest<T = unknown>(
  page: Page,
  path: string,
  options?: RequestInit,
): Promise<{ response: APIResponse; body: T }> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const response = await page.request.fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.AMOENA_LOCAL_MODE === 'true' ? { 'x-amoena-local-mode': 'true' } : {}),
      ...options?.headers,
    },
  });

  return {
    response,
    body: (await response.json()) as T,
  };
}

async function gotoPage(page: Page, path: string) {
  await page.goto(path.startsWith('http') ? path : `${BASE_URL}${path}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('body')).toBeVisible();
}

async function expectNoSupersetText(page: Page) {
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toMatch(/\bSuperset\b/i);
}

async function expectAmoenaBrandVisible(page: Page) {
  await expect(page.getByRole('img', { name: /Amoena logo/i }).first()).toBeVisible();
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

  test('remote pairing page bootstraps a local PIN without Superset leakage', async ({ page }) => {
    await gotoPage(page, '/remote');

    await expect(page.getByRole('heading', { name: /Remote pairing/i })).toBeVisible();
    await expect(page.getByTestId('remote-pairing-pin')).toHaveText(/^\d{6}$/);
    await expect(page.getByRole('img', { name: /Pairing QR code/i })).toBeVisible();
    await expectAmoenaBrandVisible(page);
    await expectNoSupersetText(page);
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

  test('replay page renders the Recordings panel without Superset leakage', async ({ page }) => {
    await gotoPage(page, '/replay');

    await expect(page.getByRole('heading', { name: 'Recordings' })).toBeVisible();
    await expectAmoenaBrandVisible(page);
    await expectNoSupersetText(page);
  });
});

test.describe('Phase 6 — Autopilot Lifecycle', () => {
  test('pipeline lifecycle advances from running to completed and is visible in autopilot UI', async ({
    page,
  }) => {
    const nonce = Date.now();
    const createdTemplateIds: number[] = [];
    const createdPipelineIds: number[] = [];

    try {
      const templateBodies = await Promise.all([
        apiRequest<{ template: WorkflowTemplate }>(page, '/api/workflows', {
          method: 'POST',
          body: JSON.stringify({
            name: `Release Harness Analyze ${nonce}`,
            task_prompt: 'Summarize the active pipeline state.',
            model: 'sonnet',
            timeout_seconds: 30,
            tags: ['release-harness', 'e2e'],
          }),
        }),
        apiRequest<{ template: WorkflowTemplate }>(page, '/api/workflows', {
          method: 'POST',
          body: JSON.stringify({
            name: `Release Harness Verify ${nonce}`,
            task_prompt: 'Confirm the pipeline reached its final stage.',
            model: 'sonnet',
            timeout_seconds: 30,
            tags: ['release-harness', 'e2e'],
          }),
        }),
      ]);

      for (const template of templateBodies) {
        expect(template.response.status()).toBe(201);
        createdTemplateIds.push(template.body.template.id);
      }

      const pipeline = await apiRequest<{ pipeline: WorkflowPipeline }>(page, '/api/pipelines', {
        method: 'POST',
        body: JSON.stringify({
          name: `Release Harness Pipeline ${nonce}`,
          description: 'Deterministic two-step autopilot lifecycle regression.',
          steps: createdTemplateIds.map((templateId) => ({
            template_id: templateId,
            on_failure: 'stop',
          })),
        }),
      });

      expect(pipeline.response.status()).toBe(201);
      createdPipelineIds.push(pipeline.body.pipeline.id);

      const startedRun = await apiRequest<{ run: PipelineRun }>(page, '/api/pipelines/run', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          pipeline_id: pipeline.body.pipeline.id,
        }),
      });

      expect(startedRun.response.status()).toBe(201);
      expect(startedRun.body.run.status).toBe('running');
      expect(startedRun.body.run.steps_snapshot[0]?.status).toBe('running');
      expect(startedRun.body.run.steps_snapshot[1]?.status).toBe('pending');

      await gotoPage(page, '/autopilot');
      await expect(page.getByRole('heading', { name: /Autopilot lifecycle/i })).toBeVisible();
      await expect(page.getByText(`Release Harness Pipeline ${nonce}`)).toBeVisible();
      await expectAmoenaBrandVisible(page);
      await expectNoSupersetText(page);

      const secondStep = await apiRequest<{ run: PipelineRun }>(page, '/api/pipelines/run', {
        method: 'POST',
        body: JSON.stringify({
          action: 'advance',
          run_id: startedRun.body.run.id,
          success: true,
        }),
      });

      expect(secondStep.response.status()).toBe(200);
      expect(secondStep.body.run.status).toBe('running');
      expect(secondStep.body.run.current_step).toBe(1);
      expect(secondStep.body.run.steps_snapshot[0]?.status).toBe('completed');
      expect(secondStep.body.run.steps_snapshot[1]?.status).toBe('running');

      const completedRun = await apiRequest<{ run: PipelineRun }>(page, '/api/pipelines/run', {
        method: 'POST',
        body: JSON.stringify({
          action: 'advance',
          run_id: startedRun.body.run.id,
          success: true,
        }),
      });

      expect(completedRun.response.status()).toBe(200);
      expect(completedRun.body.run.status).toBe('completed');
      expect(completedRun.body.run.steps_snapshot[0]?.status).toBe('completed');
      expect(completedRun.body.run.steps_snapshot[1]?.status).toBe('completed');
    } finally {
      for (const pipelineId of createdPipelineIds) {
        await apiRequest(page, '/api/pipelines', {
          method: 'DELETE',
          body: JSON.stringify({ id: pipelineId }),
        });
      }

      for (const templateId of createdTemplateIds) {
        await apiRequest(page, '/api/workflows', {
          method: 'DELETE',
          body: JSON.stringify({ id: templateId }),
        });
      }
    }
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
  test('release-critical pages do not leak Superset branding', async ({ page }) => {
    for (const path of RELEASE_CRITICAL_PAGES) {
      await gotoPage(page, path);
      await expectNoSupersetText(page);
    }
  });

  test('Amoena branding stays visible on key release pages', async ({ page }) => {
    for (const path of ['/login', '/remote', '/replay', '/autopilot', '/'] as const) {
      await gotoPage(page, path);
      await expectAmoenaBrandVisible(page);
    }
  });
});
