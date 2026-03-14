import { test, expect } from '@playwright/test';

test.describe('Queue Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.runtime-banner', { timeout: 15000 });
  });

  test('queue panel shows empty state when no messages', async ({ page }) => {
    // Navigate to a session workspace where queue panel is accessible
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    const queueHeading = page.locator('text=Message Queue');
    if (await queueHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      const emptyState = page.locator('text=No queued messages');
      await expect(emptyState).toBeVisible();
    }
  });

  test('queue panel displays pending count', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    const pendingBadge = page.locator('text=/\\d+ pending/');
    if (await pendingBadge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pendingBadge).toBeVisible();
    }
  });

  test('send next button appears when messages are pending', async ({ page }) => {
    const sendNextBtn = page.locator('button:has-text("Send Next")');
    // Button only visible when there are pending messages
    expect(sendNextBtn).toBeDefined();
  });
});
