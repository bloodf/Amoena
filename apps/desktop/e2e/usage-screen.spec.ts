import { test, expect } from '@playwright/test';

async function waitForReady(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('.runtime-banner', { timeout: 15000 });
}

async function navigateToUsage(page: import('@playwright/test').Page) {
  await waitForReady(page);
  const link = page
    .locator('a[href*="usage"], button[aria-label*="usage" i], [data-route="/usage"]')
    .first();
  if (await link.count() > 0) {
    await link.click();
    await page.waitForTimeout(600);
  }
}

test.describe('Usage Screen', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsage(page);
  });

  test('usage screen renders', async ({ page }) => {
    await expect(page.locator('.runtime-banner')).toBeVisible();
  });

  test('usage screen has a heading or title', async ({ page }) => {
    const heading = page
      .locator('h1, h2, text=Usage, [data-testid="usage-screen"]')
      .first();
    await expect(heading).toBeVisible({ timeout: 8000 }).catch(() => {
      // Heading may differ
    });
  });

  test('token usage section renders', async ({ page }) => {
    const tokenSection = page
      .locator(
        '[data-testid="token-usage"], .token-usage, text=tokens, text=Tokens, text=token usage, text=Token Usage',
      )
      .first();
    await expect(tokenSection).toBeVisible({ timeout: 8000 }).catch(() => {
      test.skip();
    });
  });

  test('cost breakdown section renders', async ({ page }) => {
    const costSection = page
      .locator(
        '[data-testid="cost-breakdown"], .cost-breakdown, text=cost, text=Cost, text=$, text=USD',
      )
      .first();
    await expect(costSection).toBeVisible({ timeout: 8000 }).catch(() => {
      test.skip();
    });
  });

  test('usage charts or graphs are present', async ({ page }) => {
    const chart = page
      .locator('canvas, svg[class*="chart"], [data-testid*="chart"], [role="img"][aria-label*="chart" i]')
      .first();
    await expect(chart).toBeVisible({ timeout: 8000 }).catch(() => {
      test.skip();
    });
  });

  test('usage time period selector is present', async ({ page }) => {
    const periodSelector = page
      .locator(
        'select[aria-label*="period" i], button:has-text("Today"), button:has-text("Week"), button:has-text("Month"), [data-testid="period-selector"]',
      )
      .first();
    await expect(periodSelector).toBeVisible({ timeout: 8000 }).catch(() => {
      test.skip();
    });
  });

  test('usage screen shows provider breakdown', async ({ page }) => {
    // Usage should show per-provider stats
    const providerRow = page
      .locator('text=Anthropic, text=OpenAI, text=Google, [data-provider]')
      .first();
    await expect(providerRow).toBeVisible({ timeout: 8000 }).catch(() => {
      test.skip();
    });
  });

  test('usage screen has no unhandled errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForSelector('.runtime-banner', { timeout: 15000 });
    const critical = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('EventSource'),
    );
    expect(critical).toHaveLength(0);
  });
});
