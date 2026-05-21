// @ts-check
const { test, expect } = require('@playwright/test');

// Regression: day-section h2 must show "FRIDAY · May 22" — no leading date number.
// FAILING before fix — day header currently begins with a date number

test.describe('home page day-section headers', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bd-user', 'alex'));
    await page.goto('/');
    await page.waitForSelector('header.site-header', { timeout: 30000 });
  });

  test('first day-section h2 has no leading date number', async ({ page }) => {
    const h2 = page.locator('.day-section h2').first();
    await expect(h2).toBeVisible({ timeout: 10000 });
    const text = await h2.textContent();

    // Must NOT start with a digit (e.g. "22 22 · FRIDAY · …")
    expect(text).not.toMatch(/^\d/);

    // Must match "FRIDAY · May 22" pattern (day · month-short day-of-month)
    // Note: monthLabel returns title-case month (e.g. "May"), not "MAY"
    expect(text).toMatch(/^[A-Z]+ · [A-Za-z]+ \d+$/);
  });
});
