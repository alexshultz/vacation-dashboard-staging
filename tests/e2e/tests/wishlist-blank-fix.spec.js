// @ts-check
const { test, expect } = require('@playwright/test');

// Regression test: wishlist.html must render cards for slugs that exist in data.json
// even when they were absent from the old hardcoded ATTRACTIONS_DATA snapshot (~132 items).
// Root cause: wishlist.html had a stale 132-item array; data.json has 323 visible items.
// Any Quick Pick wishlist created after the snapshot was baked in would render blank.
//
// The fix: wishlist.html fetches data.json at runtime (same as attractions.html / quick-pick.html).
//
// Test slug 'crescent-hotel-ghost-tour' was verified absent from the old snapshot
// but present in data.json -- it will reproduce the blank-page bug on unpatched code.

const MISSING_SLUG = 'crescent-hotel-ghost-tour';

test('wishlist: renders card for slug absent from old ATTRACTIONS_DATA snapshot', async ({ page: pw }) => {
  // Seed localStorage before navigation so picks.js finds existing state immediately
  await pw.addInitScript(({ slug }) => {
    localStorage.setItem('vacdash:v1:user', 'Alex');
    localStorage.setItem('vacdash:v1:picks', JSON.stringify({ [slug]: 'wishlist' }));
  }, { slug: MISSING_SLUG });

  await pw.goto('/wishlist.html');
  await pw.waitForLoadState('domcontentloaded');

  // The card must be visible. On broken code: slugToAttr returns null, card never built.
  // On fixed code: data.json is fetched, all slugs resolved, card renders.
  const card = pw.locator(`.card--light[data-slug="${MISSING_SLUG}"]`);
  await expect(
    card,
    `wishlist.html: card for "${MISSING_SLUG}" (was missing from old snapshot) must render`
  ).toBeVisible({ timeout: 10000 });
});
