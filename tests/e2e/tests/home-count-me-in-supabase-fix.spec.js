// @ts-check
const { test, expect } = require('@playwright/test');

// Verifies that the "Count Me In" button on the Home page persists the commit
// to Supabase, so it survives a hard reload.

const TEST_USER    = 'alex';
const TEST_USER_DB = 'Alex';
const TEST_SLUG    = 'silver-dollar-city';

async function cleanPick(page) {
  await page.evaluate(async function(args) {
    if (window.BD_SUPABASE) {
      await window.BD_SUPABASE.from('picks').delete()
        .eq('user_id', args.user)
        .eq('slug', args.slug);
    }
  }, { user: TEST_USER_DB, slug: TEST_SLUG });
  await page.waitForTimeout(800);
}

test.describe('home count-me-in Supabase persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(u => localStorage.setItem('bd-user', u), TEST_USER);
    await page.goto('/');
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    await cleanPick(page);
    // Reload so Supabase hydration starts from a clean slate
    await page.reload();
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test.afterEach(async ({ page }) => {
    try { await cleanPick(page); } catch (_) {}
  });

  test('count-me-in commit survives page reload', async ({ page }) => {
    // Find the Silver Dollar City event row — it has a catalogRef so it renders a CTA button
    const sdcRow = page.locator('.event-row').filter({
      has: page.locator('.event-row__title', { hasText: 'Silver Dollar City' }),
    });
    await expect(sdcRow).toBeVisible({ timeout: 10000 });

    const ctaBtn = sdcRow.locator('.event-row__cta');
    await expect(ctaBtn).toBeVisible({ timeout: 5000 });

    // Click "Count Me In"
    await ctaBtn.click();
    await page.waitForTimeout(4000); // allow Supabase upsert to settle

    // Hard reload — Supabase re-fetches picks from scratch
    await page.reload();
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    await page.waitForTimeout(2000);

    const sdcRowAfter = page.locator('.event-row').filter({
      has: page.locator('.event-row__title', { hasText: 'Silver Dollar City' }),
    });

    // CTA button must be gone — commit persisted so user is already in
    await expect(sdcRowAfter.locator('.event-row__cta')).not.toBeVisible({ timeout: 5000 });

    // Committed badge must be visible in that row
    await expect(sdcRowAfter.locator('.card-badge--commit')).toBeVisible({ timeout: 5000 });
  });
});
