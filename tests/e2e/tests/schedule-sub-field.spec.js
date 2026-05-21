// @ts-check
const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('bd-user', 'alex');
  });
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  await page.click('header .nav button:has-text("Timeline")');
  await page.waitForSelector('.day-tab', { timeout: 15000 });
}

test('sub text renders for sup-22', async ({ page }) => {
  await boot(page);

  // Friday is index 0 (May 22 = first day of trip)
  await page.locator('.day-tab').nth(0).click();
  await page.waitForSelector('.tl-event', { timeout: 10000 });

  // Find the Supper card on Friday and assert sub text
  const supperCard = page.locator('.tl-event').filter({ hasText: 'Supper' }).first();
  const subEl = supperCard.locator('p.tl-event__sub');
  await expect(subEl).toBeVisible();
  await expect(subEl).toHaveText('Pizza · Let Evie Know About Special Requests');
});

test('sub element absent for events without sub', async ({ page }) => {
  await boot(page);

  // Saturday is index 1 — no events have a sub field
  await page.locator('.day-tab').nth(1).click();
  await page.waitForSelector('.tl-event', { timeout: 10000 });

  const subEls = page.locator('.tl-event__sub');
  await expect(subEls).toHaveCount(0);
});
