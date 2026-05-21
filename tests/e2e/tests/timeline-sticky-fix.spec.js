// @ts-check
const { test, expect } = require('@playwright/test');

// Boots the SPA on the Timeline page with a logged-in user.
// Nav is done at desktop size (header nav visible), then viewport shrinks to mobile.
async function boot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('bd-user', 'alex');
  });
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  await page.click('header .nav button:has-text("Timeline")');
  await page.waitForSelector('.day-tab', { timeout: 15000 });
}

// .day-tabs must be position:fixed so it stays pinned below the site-header
// while the user scrolls through timeline events on mobile.
// Root cause: position:sticky was anchoring to .timeline-wrap (overflow:clip creates
// a BFC that confines sticky), causing the strip to scroll away.
test('.day-tabs is position:fixed, pinned below site-header on mobile', async ({ page }) => {
  await boot(page);
  await page.setViewportSize({ width: 375, height: 812 });

  const position = await page.locator('.day-tabs').evaluate(el =>
    window.getComputedStyle(el).position
  );
  expect(position).toBe('fixed');
});
