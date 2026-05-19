// @ts-check
const { test, expect } = require('@playwright/test');

// Tests every wish/commit state combination with Supabase persistence.
// Each test: set state via UI -> hard reload -> assert state survives reload.

const TEST_USER    = 'alex';
const TEST_USER_DB = 'Alex';   // capitalized, as Shell.jsx writes to Supabase
const TEST_SLUG    = 'silver-dollar-city';
const TEST_NAME    = 'Silver Dollar City';

// ── helpers ──────────────────────────────────────────────────────────────────

async function boot(page) {
  // Set user BEFORE navigation so SPA boots with userId already set
  await page.addInitScript(u => localStorage.setItem('bd-user', u), TEST_USER);
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
}

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

async function goToActivities(page) {
  await page.click('header .nav button:has-text("Activities")');
  // Wait for at least one activity card to appear
  await page.waitForSelector('article.card-cat', { timeout: 15000 });
}

// Find the catalog card for the test activity.
function card(page) {
  return page.locator('article.card-cat').filter({
    has: page.locator('h3', { hasText: TEST_NAME }),
  });
}

async function tapWish(page) {
  await card(page).locator('button', { hasText: '+ Wishlist' }).click();
  await page.waitForTimeout(1500);
}

async function dropWish(page) {
  await card(page).locator('button', { hasText: 'Drop wishlist' }).click();
  await page.waitForTimeout(1500);
}

async function tapCommit(page) {
  await card(page).locator('button', { hasText: 'Count me in' }).click();
  await page.waitForTimeout(1500);
}

async function tapUncommit(page) {
  await card(page).locator('button', { hasText: 'Count me out' }).click();
  await page.waitForTimeout(1500);
}

// Hard-reload, wait for SPA boot, navigate to Interests, and check both tabs.
async function assertState(page, { wished, committed }) {
  // addInitScript persists for the page context so user is set on reload
  await page.reload();
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  await page.click('header .nav button:has-text("Interests")');
  // Wait for the Interests page to render
  await page.waitForTimeout(2000);

  // --- wishlisted tab ---
  const wishTab = page.locator('[role="tab"]', { hasText: /wishlist/i });
  if (await wishTab.count() > 0) await wishTab.click();
  const wishCards = page.locator('h3', { hasText: TEST_NAME });
  if (wished) {
    await expect(wishCards.first()).toBeVisible({ timeout: 8000 });
  } else {
    await expect(wishCards).toHaveCount(0, { timeout: 8000 });
  }

  // Navigate to committed tab
  const commitTab = page.locator('[role="tab"]', { hasText: /commit/i });
  if (await commitTab.count() > 0) await commitTab.click();
  await page.waitForTimeout(500);
  const commitCards = page.locator('h3', { hasText: TEST_NAME });
  if (committed) {
    await expect(commitCards.first()).toBeVisible({ timeout: 8000 });
  } else {
    await expect(commitCards).toHaveCount(0, { timeout: 8000 });
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

  // ── TC-3: wishlist then commit ────────────────────────────────────────────
  test('TC-3: wishlist then commit', async ({ page }) => {
    await tapWish(page);
    await tapCommit(page);
    await assertState(page, { wished: true, committed: true });
  });

  // ── TC-4: commit then wishlist ────────────────────────────────────────────
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

  // ── TC-8: commit only, then uncommit ─────────────────────────────────────
  test('TC-8: commit only then uncommit', async ({ page }) => {
    await tapCommit(page);
    await tapUncommit(page);
    await assertState(page, { wished: false, committed: false });
  });
});
