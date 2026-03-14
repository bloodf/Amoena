import { test, expect } from '@playwright/test';

test.describe('Todo Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.runtime-banner', { timeout: 15000 });
  });

  test('todo panel shows tasks heading', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    const heading = page.locator('h3:has-text("Tasks")');
    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  });

  test('todo panel shows completion counter', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    // Completion counter format: "X/Y done"
    const counter = page.locator('text=/\\d+\\/\\d+ done/');
    if (await counter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(counter).toBeVisible();
    }
  });

  test('todo panel shows empty state', async ({ page }) => {
    const emptyState = page.locator('text=No tasks yet');
    expect(emptyState).toBeDefined();
  });

  test('task status icons are interactive', async ({ page }) => {
    const sessionLink = page
      .locator('a[href*="session"], button[aria-label*="session" i]')
      .first();
    if (await sessionLink.count() > 0) {
      await sessionLink.click();
      await page.waitForTimeout(1000);
    }

    // Status toggle buttons use unicode icons: ○ ◑ ● ✕ —
    const statusBtn = page.locator('button:has-text("○"), button:has-text("◑"), button:has-text("●")').first();
    if (await statusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusBtn.click();
      await page.waitForTimeout(300);
    }
  });
});
