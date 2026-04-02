import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for Amoena Dashboard — local mode.
 *
 * Local mode bypasses auth via AMOENA_LOCAL_MODE=true, enabling
 * headless API testing without external credentials.
 *
 * Usage:
 *   bun run --cwd apps/dashboard test:e2e:amoena:local
 *
 * Environment variables:
 *   E2E_GATEWAY_EXPECTED=0  — signals local mode (no gateway required)
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in sequence to avoid port conflicts with dev server */
  fullyParallel: false,

  /* Fail fast on first failure during development */
  forbidOnly: !!process.env.CI,

  /* Retry flaky tests in CI */
  retries: process.env.CI ? 2 : 0,

  /* Reuse existing server; do not spin up a new one */
  webServer: undefined,

  use: {
    /* Base URL for relative paths in tests */
    baseURL: 'http://localhost:3000',

    /* Trace retains snapshots + network logs on failure for debugging */
    trace: 'on-first-retry',

    /* Screenshot on failure for CI reports */
    screenshot: 'only-on-failure',
  },

  projects: [
    /* Chromium — local development and CI */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Reporter output */
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
});
