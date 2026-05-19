// @ts-check
const { test, expect } = require('@playwright/test');

// Tests every wish/commit state combination with Supabase persistence.
// Each test: set state via UI → hard reload → assert state survives reload.
// These tests MUST FAIL against pre-fix code for TC-3, TC-4, TC-8,
// then PASS after the 'both' state fix is deployed to staging.

const TEST_USER    = 'testuser';
const TEST_USER_DB = 'Testuser';   // capitalized, as Shell.jsx writes to Supabase
const TEST_SLUG    = 'silver-dollar-city';
const TEST_NAME    = 'Silver Dollar City';

// ── helpers ──────────────────────────────────────────────────────────────────

async function boot(page) {
  await page.goto('/');
  await page.evaluate(u => localStorage.setItem('bd-user', u), TEST_USER);
  await page.reload();
  await page.waitForSelector('header.site-header', { timeout: 15000 });
}

async function cleanPick(page) {
  await page.evaluate(async args => {
    if (window.BD_SUPABASE) {
      await window.BD_SUPABASE.from('picks').delete()
        .eq('user_id', args.user)
        .eq('slug', args.slug);
    }
  }, { user: TEST_USER_DB, slug: TEST_SLUG });
  await page.waitForTimeout(600);
}

async function goToActivities(page) {
  await page.click('header .nav button:has-text("Activities")');
  await page.waitForSelector('.catalog-grid', { timeout: 10000 });
}

// Find the catalog card for the test activity.
function card(page) {
  return page.locator('article.card-cat').filter({
    has: page.locator('h3', { hasText: TEST_NAME }),
  });
}

async function tapWish(page) {
  await card(page).locator('.card-cat__actions button', { hasText: '+ Wishlist' }).click();
  await page.waitForTimeout(1500);
}

async function dropWish(page) {
  await card(page).locator('.card-cat__actions button', { hasText: 'Drop wishlist' }).click();
  await page.waitForTimeout(1500);
}

async function tapCommit(page) {
  await card(page).locator('.card-cat__actions button', { hasText: 'Count me in' }).click();
  await page.waitForTimeout(1500);
}

async function tapUncommit(page) {
  await card(page).locator('.card-cat__actions button', { hasText: 'Count me out' }).click();
  await page.waitForTimeout(1500);
}

// Hard-reload, wait for SPA boot, navigate to Interests, and check both tabs.
async function assertState(page, { wished, committed }) {
  await page.reload();
  await page.waitForSelector('header.site-header', { timeout: 15000 });
  await page.click('header .nav button:has-text("Interests")');
  await page.waitForSelector('.page-hero', { timeout: 8000 });

  // --- wishlisted tab ---
  await page.locator('[role="tab"]', { hasText: 'Wishlisted' }).click();
  const wishCards = page.locator('.card-dense').filter({
    has: page.locator('h3', { hasText: TEST_NAME }),
  });
  if (wished) {
    await expect(wishCards.first()).toBeVisible();
  } else {
    await expect(wishCards).toHaveCount(0);
  }

  // --- committed tab ---
  await page.locator('[role="tab"]', { hasText: 'Committed' }).click();
  const commitCards = page.locator('.card-dense').filter({
    has: page.locator('h3', { hasText: TEST_NAME }),
  });
  if (committed) {
    await expect(commitCards.first()).toBeVisible();
  } else {
    await expect(commitCards).toHaveCount(0);
  }
}

// ── setup / teardown ─────────────────────────────────────────────────────────

test.describe('picks state matrix', () => {
  test.beforeEach(async ({ page }) => {
    await boot(page);
    await cleanPick(page);
    await goToActivities(page);
  });

  test.afterEach(async ({ page }) => {
    try { await cleanPick(page); } catch (_) {}
  });

  // ── TC-1: wishlist only ───────────────────────────────────────────────────
  test('TC-1: wishlist only', async ({ page }) => {
    await tapWish(page);
    await assertState(page, { wished: true, committed: false });
  });

  // ── TC-2: commit only (no prior wishlist) ─────────────────────────────────
  test('TC-2: commit only', async ({ page }) => {
    await tapCommit(page);
    await assertState(page, { wished: false, committed: true });
  });

  // ── TC-3: wishlist then commit -- FAILS before fix ────────────────────────
  test('TC-3: wishlist then commit', async ({ page }) => {
    await tapWish(page);
    await tapCommit(page);
    await assertState(page, { wished: true, committed: true });
  });

  // ── TC-4: commit then wishlist -- FAILS before fix ────────────────────────
  test('TC-4: commit then wishlist', async ({ page }) => {
    await tapCommit(page);
    await tapWish(page);
    await assertState(page, { wished: true, committed: true });
  });

  // ── TC-5: wishlist + commit, then unwishlist ──────────────────────────────
  test('TC-5: wishlist + commit then unwishlist', async ({ page }) => {
    await tapWish(page);
    await tapCommit(page);
    await dropWish(page);
    await assertState(page, { wished: false, committed: true });
  });

  // ── TC-6: wishlist + commit, then uncommit ────────────────────────────────
  test('TC-6: wishlist + commit then uncommit', async ({ page }) => {
    await tapWish(page);
    await tapCommit(page);
    await tapUncommit(page);
    await assertState(page, { wished: true, committed: false });
  });

  // ── TC-7: wishlist only, then unwishlist ──────────────────────────────────
  test('TC-7: wishlist only then unwishlist', async ({ page }) => {
    await tapWish(page);
    await dropWish(page);
    await assertState(page, { wished: false, committed: false });
  });

  // ── TC-8: commit only, then uncommit -- FAILS before fix ─────────────────
  test('TC-8: commit only then uncommit', async ({ page }) => {
    await tapCommit(page);
    await tapUncommit(page);
    await assertState(page, { wished: false, committed: false });
  });
});
