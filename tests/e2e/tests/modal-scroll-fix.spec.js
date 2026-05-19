// @ts-check
const { test, expect } = require('@playwright/test');

// Boot the SPA with a logged-in user and navigate to the Activities browse view.
async function boot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('bd-user', 'alex');
  });
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  await page.click('header .nav button:has-text("Activities")');
  await page.waitForSelector('.card-cat', { timeout: 15000 });
}

test('modal scroll – body scroll lock and iOS scroll container properties', async ({ page }) => {
  await boot(page);

  // Open the detail modal by clicking the first activity card
  await page.locator('.card-cat').first().click();
  await page.waitForSelector('.dm-sheet', { timeout: 10000 });

  // 1. Body scroll must be locked while the modal is open
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  expect(bodyOverflow).toBe('hidden');

  // 2. Scroll container must allow vertical scroll
  const overflowY = await page.locator('.dm-sheet').evaluate(el =>
    window.getComputedStyle(el).overflowY
  );
  expect(['auto', 'scroll']).toContain(overflowY);

  // 3. The .dm-sheet CSS rule must declare -webkit-overflow-scrolling: touch for iOS Safari.
  //    Chromium 107+ drops this from its CSS engine entirely, so we verify via the
  //    stylesheet source text rather than computed or inline style.
  const cssHasIOSScrolling = await page.evaluate(async () => {
    const link = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(l => l.href.includes('styles.css'));
    if (!link) return false;
    const css = await fetch(link.href).then(r => r.text());
    return css.includes('-webkit-overflow-scrolling: touch');
  });
  expect(cssHasIOSScrolling).toBe(true);
});
