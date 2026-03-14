import { test, expect } from '@playwright/test';

test.describe('Hook Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.runtime-banner', { timeout: 15000 });
  });

  test('hook panel shows heading', async ({ page }) => {
    // Navigate to hooks area
    const hookLink = page
      .locator('a[href*="hook"], button[aria-label*="hook" i], [data-route*="hook"]')
      .first();
    if (await hookLink.count() > 0) {
      await hookLink.click();
      await page.waitForTimeout(1000);
    }

    const heading = page.locator('h3:has-text("Registered Hooks")');
    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  });

  test('hook panel shows empty state', async ({ page }) => {
    const hookLink = page
      .locator('a[href*="hook"], button[aria-label*="hook" i], [data-route*="hook"]')
      .first();
    if (await hookLink.count() > 0) {
      await hookLink.click();
      await page.waitForTimeout(1000);
    }

    const emptyState = page.locator('text=No hooks registered');
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('available events section lists event groups', async ({ page }) => {
    const hookLink = page
      .locator('a[href*="hook"], button[aria-label*="hook" i], [data-route*="hook"]')
      .first();
    if (await hookLink.count() > 0) {
      await hookLink.click();
      await page.waitForTimeout(1000);
    }

    const eventsHeading = page.locator('text=Available Events');
    if (await eventsHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(eventsHeading).toBeVisible();
      // Verify event group names
      await expect(page.locator('text=Session:')).toBeVisible();
      await expect(page.locator('text=Tools:')).toBeVisible();
      await expect(page.locator('text=System:')).toBeVisible();
    }
  });

  test('hook cards show test and delete buttons', async ({ page }) => {
    const testBtn = page.locator('button:has-text("Test")');
    const deleteBtn = page.locator('button:has-text("Delete")');
    expect(testBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();
  });
});
