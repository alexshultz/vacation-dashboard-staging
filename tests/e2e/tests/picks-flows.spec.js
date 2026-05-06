// @ts-check
const { test, expect } = require('@playwright/test');

const PICKS_KEY = 'vacdash:v1:picks';
const USER_KEY  = 'vacdash:v1:user';

// (a) Quick Pick write — wishlist button saves slug to localStorage
test('picks: quick-pick wishlist button saves slug to localStorage', async ({ page }) => {
  await page.goto('/quick-pick.html');
  await page.waitForLoadState('domcontentloaded');

  const topCard = page.locator('#deck-stage .deck-card:not(.stack-2):not(.stack-3)').first();
  await expect(topCard).toBeVisible({ timeout: 10000 });

  const slug = await topCard.getAttribute('data-slug');
  expect(slug).toBeTruthy();

  await page.click('#deck-wishlist');

  const picks = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), PICKS_KEY);
  expect(picks[slug]).toBe('wishlist');
});

// (b) Quick Pick filter — already-wishlisted slug does not appear in the deck
test('picks: quick-pick deck excludes already-wishlisted slugs', async ({ page }) => {
  // First load: grab any real slug from the live deck
  await page.goto('/quick-pick.html');
  await page.waitForLoadState('domcontentloaded');

  const topCard = page.locator('#deck-stage .deck-card:not(.stack-2):not(.stack-3)').first();
  await expect(topCard).toBeVisible({ timeout: 10000 });

  const slug = await topCard.getAttribute('data-slug');
  expect(slug).toBeTruthy();

  // Seed that slug as wishlisted, then reload
  await page.evaluate(([key, s]) => {
    localStorage.setItem(key, JSON.stringify({ [s]: 'wishlist' }));
  }, [PICKS_KEY, slug]);

  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Wait for deck to render (at least one card, or empty state)
  await page.waitForTimeout(3000);

  // The seeded slug must not be in the deck stage at all
  const seedCard = page.locator(`#deck-stage .deck-card[data-slug="${slug}"]`);
  await expect(seedCard).not.toBeAttached();
});

// (c) Activities write — heart button saves slug to localStorage
test('picks: activities heart button saves slug to localStorage', async ({ page }) => {
  // Pre-seed user so heart click goes straight to applyPick() without the name modal
  await page.addInitScript(([key, name]) => localStorage.setItem(key, name), [USER_KEY, 'Alex']);

  await page.goto('/attractions.html');
  await page.waitForLoadState('domcontentloaded');

  const firstCard = page.locator('#catalog-grid .card--light').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  const slug = await firstCard.getAttribute('data-slug');
  expect(slug).toBeTruthy();

  await firstCard.locator('.heart-overlay').click();

  const picks = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), PICKS_KEY);
  expect(picks[slug]).toBe('wishlist');
});

// (d) Cross-page persistence — wishlisted slug renders on wishlist.html
test('picks: wishlisted slug appears on wishlist.html', async ({ page }) => {
  // Get a real slug from the live deck
  await page.goto('/quick-pick.html');
  await page.waitForLoadState('domcontentloaded');

  const topCard = page.locator('#deck-stage .deck-card:not(.stack-2):not(.stack-3)').first();
  await expect(topCard).toBeVisible({ timeout: 10000 });
  const slug = await topCard.getAttribute('data-slug');
  expect(slug).toBeTruthy();

  // Seed picks + user (wishlist.html renders a "who are you?" prompt without a user)
  await page.evaluate(([picksKey, userKey, s]) => {
    localStorage.setItem(picksKey, JSON.stringify({ [s]: 'wishlist' }));
    localStorage.setItem(userKey, 'Alex');
  }, [PICKS_KEY, USER_KEY, slug]);

  await page.goto('/wishlist.html');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // allow fetch + render

  const wishCard = page.locator(`.card--light[data-slug="${slug}"]`);
  await expect(wishCard).toBeVisible({ timeout: 5000 });
});

// (e) Graceful Supabase degradation — 409 does not block localStorage or show error banner
test('picks: 409 from Supabase does not block localStorage write or show error banner', async ({ page }) => {
  // Intercept POST to Supabase picks endpoint and return 409
  await page.route('**/rest/v1/picks**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 409, body: '{"message":"Conflict"}', contentType: 'application/json' });
    } else {
      await route.continue();
    }
  });

  // Pre-seed user so sbEnabled() returns true and the POST is attempted
  await page.addInitScript(([key, name]) => localStorage.setItem(key, name), [USER_KEY, 'Alex']);

  await page.goto('/quick-pick.html');
  await page.waitForLoadState('domcontentloaded');

  const topCard = page.locator('#deck-stage .deck-card:not(.stack-2):not(.stack-3)').first();
  await expect(topCard).toBeVisible({ timeout: 10000 });
  const slug = await topCard.getAttribute('data-slug');
  expect(slug).toBeTruthy();

  await page.click('#deck-wishlist');
  await page.waitForTimeout(2000); // allow async sbSet() to resolve

  // (1) localStorage write must have succeeded
  const picks = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), PICKS_KEY);
  expect(picks[slug]).toBe('wishlist');

  // (2) no error banner should be visible
  const errorBanner = page.locator('#sb-error-banner');
  await expect(errorBanner).not.toBeVisible();
});
