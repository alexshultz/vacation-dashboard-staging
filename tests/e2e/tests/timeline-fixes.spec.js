// @ts-check
const { test, expect } = require('@playwright/test');

// Boots the SPA on the Timeline page with a logged-in user.
// Uses .tab-bar (always in DOM) so it works at any viewport width.
async function boot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('bd-user', 'alex');
  });
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  await page.click('header .nav button:has-text("Timeline")');
  await page.waitForSelector('.day-tab', { timeout: 15000 });
}

// Bug 1 — Full day names visible at 375px without clipping
// Current broken state: d.day.slice(0,3) abbreviates names to 3 chars ("Fri", "Sat", …)
// and .day-tabs has no overflow-x, so names are clipped at narrow widths.
test('Bug 1 – full day names visible at 375px without clipping', async ({ page }) => {
  await boot(page);
  await page.setViewportSize({ width: 375, height: 812 });

  // .day-tabs must scroll horizontally (overflow-x: auto or scroll)
  const overflowX = await page.locator('.day-tabs').evaluate(el =>
    window.getComputedStyle(el).overflowX
  );
  expect(['auto', 'scroll']).toContain(overflowX);

  // First tab must contain the full day name, not the 3-char abbreviation.
  // May 22 2026 = Friday; .slice(0,3) produces "Fri", full name is "Friday".
  const firstTabText = await page.locator('.day-tab').first().textContent();
  expect(firstTabText).toContain('Friday');
});

// Bug 2 — Default tab is index 0 when today is before the trip
// Current broken state: useStateTl(2) hardcodes Monday (index 2).
// Today (2026-05-19) < trip start (2026-05-22+), so index 0 must be active.
test('Bug 2 – default tab is index 0 when today is before trip start', async ({ page }) => {
  await boot(page);

  // Exactly one tab must be active
  const activeTabs = await page.locator('.day-tab[aria-current="true"]').count();
  expect(activeTabs).toBe(1);

  // That active tab must be the first one (index 0)
  const firstTab = page.locator('.day-tab').first();
  await expect(firstTab).toHaveAttribute('aria-current', 'true');
});

// Bug 3 — .day-tabs must have position:fixed so it stays pinned while scrolling (sticky replaced with fixed 2026-05-19)
// Current broken state: no sticky styling; strip scrolls away with content.
test('Bug 3 – .day-tabs has position:fixed', async ({ page }) => {
  await boot(page);
  const position = await page.evaluate(() => {
    const el = document.querySelector('.day-tabs');
    return el ? getComputedStyle(el).position : null;
  });
  expect(position).toBe('fixed');
});
