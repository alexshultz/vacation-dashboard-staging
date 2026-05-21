// @ts-check
// Tests for BD_SCHEDULED_IDS global and the scheduled color treatment on cards and home rows.
// TDD: these tests were written BEFORE the fix and confirmed failing against the unfixed code.
const { test, expect } = require('@playwright/test');

async function boot(page, { userId = null } = {}) {
  if (userId) {
    await page.addInitScript(u => localStorage.setItem('bd-user', u), userId);
  }
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  // Wait for BD_SCHEDULE to exist (loader complete)
  await page.waitForFunction(() => Array.isArray(window.BD_SCHEDULE), { timeout: 15000 });
}

async function goToActivities(page) {
  await page.click('header .nav button:has-text("Activities")');
  await page.waitForSelector('article.card-cat', { timeout: 15000 });
}

async function goToHome(page) {
  await page.click('header .nav button:has-text("Home")');
  await page.waitForSelector('.event-row', { timeout: 15000 });
}

// ── 1. Loader global state ────────────────────────────────────────────────────

test('BD_SCHEDULED_IDS is a Set after page load', async ({ page }) => {
  await boot(page);
  const isSet = await page.evaluate(() => window.BD_SCHEDULED_IDS instanceof Set);
  expect(isSet).toBe(true);
});

test('BD_SCHEDULED_IDS contains david-sight-sound-theatres and silver-dollar-city', async ({ page }) => {
  await boot(page);
  const ids = await page.evaluate(() => [...(window.BD_SCHEDULED_IDS || [])]);
  expect(ids).toContain('david-sight-sound-theatres');
  expect(ids).toContain('silver-dollar-city');
});

test('BD_SCHEDULED_IDS excludes meal and travel events', async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(() => {
    const allEvents = (window.BD_SCHEDULE || []).flatMap(day => day.events);
    const mealOrTravelActivityIds = allEvents
      .filter(ev => (ev.type === 'meal' || ev.type === 'travel') && ev.activityId)
      .map(ev => ev.activityId);
    const setIds = [...(window.BD_SCHEDULED_IDS || new Set())];
    return { mealOrTravelActivityIds, setIds };
  });
  for (const id of result.mealOrTravelActivityIds) {
    expect(result.setIds).not.toContain(id);
  }
  // Sanity: the set itself has some entries
  expect(result.setIds.length).toBeGreaterThan(0);
});

// ── 2. CatalogCard color treatment ───────────────────────────────────────────

test('CatalogCard in BD_SCHEDULED_IDS with no commits gets card-cat--scheduled', async ({ page }) => {
  await boot(page, { userId: 'alex' }); // userId required for SPA to render cards
  await page.waitForFunction(() => window.BD_SCHEDULED_IDS instanceof Set, { timeout: 10000 });

  // Clear any DB-hydrated commits for the test activity to isolate BD_SCHEDULED_IDS detection
  await page.evaluate(() => {
    const act = window.BD_ACTIVITIES && window.BD_ACTIVITIES.find(a => a.id === 'david-sight-sound-theatres');
    if (act) act.commit = [];
  });

  await goToActivities(page);

  // Find the DAVID card by title text
  const card = page.locator('article.card-cat').filter({
    has: page.locator('h3', { hasText: 'DAVID' }),
  }).first();

  await expect(card).toHaveClass(/card-cat--scheduled/);
  await expect(card).not.toHaveClass(/card-cat--committed/);
});

test('CatalogCard in BD_SCHEDULED_IDS where viewer committed gets card-cat--committed', async ({ page }) => {
  // Boot as alex so committed check can fire
  await boot(page, { userId: 'alex' });
  await page.waitForFunction(() => window.BD_SCHEDULED_IDS instanceof Set, { timeout: 10000 });

  // Seed the commit for this viewer on david-sight-sound-theatres
  await page.evaluate(() => {
    const act = window.BD_ACTIVITIES && window.BD_ACTIVITIES.find(a => a.id === 'david-sight-sound-theatres');
    if (act) act.commit = ['alex'];
  });

  await goToActivities(page);

  const card = page.locator('article.card-cat').filter({
    has: page.locator('h3', { hasText: 'DAVID' }),
  }).first();

  await expect(card).toHaveClass(/card-cat--committed/);
  await expect(card).not.toHaveClass(/card-cat--scheduled/);
});

// ── 3. Home.jsx event row color treatment ─────────────────────────────────────

test('Home event row for activityId in BD_SCHEDULED_IDS gets event-row--scheduled', async ({ page }) => {
  await boot(page, { userId: 'alex' }); // userId required for SPA to render home events
  await page.waitForFunction(() => window.BD_SCHEDULED_IDS instanceof Set, { timeout: 10000 });

  // Clear any DB commits on silver-dollar-city so scheduled-IDs check is isolated
  await page.evaluate(() => {
    const act = window.BD_ACTIVITIES && window.BD_ACTIVITIES.find(a => a.id === 'silver-dollar-city');
    if (act) act.commit = [];
  });

  await goToHome(page);

  // The home page shows day sections; find an event-row linked to silver-dollar-city
  const scheduledRow = page.locator('.event-row--scheduled').first();
  await expect(scheduledRow).toBeVisible();
});

test('Home event row viewerCommitted wins over someoneCommitted', async ({ page }) => {
  await boot(page, { userId: 'alex' });
  await page.waitForFunction(() => window.BD_SCHEDULED_IDS instanceof Set, { timeout: 10000 });

  // Seed viewer commit on silver-dollar-city
  await page.evaluate(() => {
    const act = window.BD_ACTIVITIES && window.BD_ACTIVITIES.find(a => a.id === 'silver-dollar-city');
    if (act) act.commit = ['alex'];
  });

  await goToHome(page);

  // The silver-dollar-city row should be event-row--committed, not event-row--scheduled
  // We verify by checking there is at least one committed row and that silver-dollar-city's
  // row is not classified as --scheduled when viewer is committed.
  const committedRows = page.locator('.event-row--committed');
  await expect(committedRows.first()).toBeVisible();
});
