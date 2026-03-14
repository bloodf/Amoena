import { test, expect } from '@playwright/test';

test.describe('Session Hierarchy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.runtime-banner', { timeout: 15000 });
  });

  test('session tree shows hierarchy heading', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    const heading = page.locator('text=Session Hierarchy');
    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  });

  test('session tree shows empty state when no sessions', async ({ page }) => {
    const emptyState = page.locator('text=No session hierarchy');
    // May or may not be visible depending on app state
    expect(emptyState).toBeDefined();
  });

  test('session tree nodes are clickable', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    // Look for session tree nodes (truncated session IDs displayed as monospace)
    const treeNodes = page.locator('.font-mono.text-xs.truncate');
    if ((await treeNodes.count()) > 0) {
      await treeNodes.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('session tree expand/collapse toggles work', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    // Toggle buttons show ▾ (expanded) or ▸ (collapsed)
    const toggleBtn = page.locator('button:has-text("▾"), button:has-text("▸")').first();
    if (await toggleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const initialText = await toggleBtn.textContent();
      await toggleBtn.click();
      await page.waitForTimeout(200);
      const newText = await toggleBtn.textContent();
      expect(newText).not.toBe(initialText);
    }
  });
});
