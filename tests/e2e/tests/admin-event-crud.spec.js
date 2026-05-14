// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');

function loadEnv() {
  const lines = fs.readFileSync(path.join(__dirname, '..', '.env.test'), 'utf-8').split('\n');
  const env = {};
  lines.forEach(line => { const m = line.match(/^([^=]+)=(.*)$/); if (m) env[m[1].trim()] = m[2].trim(); });
  return env;
}
const { VACDASH_EMAIL, VACDASH_PASSWORD, VACDASH_STAGING_URL } = loadEnv();
const SUPABASE_URL  = 'https://quebfbvfuwbncpexlylu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';

async function login(page) {
  await page.goto(VACDASH_STAGING_URL + '/admin.html');
  await page.waitForSelector('#auth-email-login', { state: 'visible', timeout: 10000 });
  await page.fill('#login-email', VACDASH_EMAIL);
  await page.fill('#login-password', VACDASH_PASSWORD);
  await page.click('#login-btn');
  await page.waitForSelector('#editor-section', { state: 'visible', timeout: 10000 });
}

async function goToTimeline(page) {
  await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
  await page.waitForSelector('details.event-card', { timeout: 10000 });
}

// ── AC-1: New Event button ────────────────────────────────────────────────────

test.describe('AC-1 -- New Event button', () => {
  test('New Event button is in DOM but hidden for family view', async ({ page }) => {
    await goToTimeline(page);
    const btn = page.locator('#vacdash-new-event-btn');
    await expect(btn).toHaveCount(1);
    expect(await btn.isVisible()).toBe(false);
  });

  test('New Event button visible in admin mode and opens modal with blank fields', async ({ page }) => {
    await login(page);
    await goToTimeline(page);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    const btn = page.locator('#vacdash-new-event-btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator('#vacdash-edit-modal')).toBeVisible();
    expect(await page.locator('#vacdash-edit-title').inputValue()).toBe('');
    expect(await page.locator('#vacdash-edit-date').inputValue()).toBe('');
    await page.click('#vacdash-edit-cancel');
  });
});

// ── AC-2: Archive button on active cards ─────────────────────────────────────

test.describe('AC-2 -- Archive button on active cards', () => {
  test('Archive button is in DOM but hidden for family view', async ({ page }) => {
    await goToTimeline(page);
    const btns = page.locator('.admin-archive-btn');
    if (await btns.count() > 0) {
      expect(await btns.first().isVisible()).toBe(false);
    } else {
      // Selector doesn't exist yet — test fails as expected in red phase
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });

  test('Archive button visible on active card in admin mode', async ({ page }) => {
    await login(page);
    await goToTimeline(page);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    await page.locator('details.event-card').first().evaluate(el => { el.open = true; });
    await expect(page.locator('.admin-archive-btn').first()).toBeVisible();
  });
});

// ── AC-3: Delete button on active cards ──────────────────────────────────────

test.describe('AC-3 -- Delete button on active cards', () => {
  test('Delete button is in DOM but hidden for family view', async ({ page }) => {
    await goToTimeline(page);
    const btns = page.locator('.admin-delete-btn');
    if (await btns.count() > 0) {
      expect(await btns.first().isVisible()).toBe(false);
    } else {
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });

  test('Delete button visible on active card in admin mode', async ({ page }) => {
    await login(page);
    await goToTimeline(page);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    await page.locator('details.event-card').first().evaluate(el => { el.open = true; });
    await expect(page.locator('details.event-card:not(.event-card--archived) .admin-delete-btn').first()).toBeVisible();
  });
});

// ── AC-4: Archived rows filtered from family view ─────────────────────────────

test.describe('AC-4 -- Archived rows filtered', () => {
  test('window._vacdashEvents contains no archived=true events after load', async ({ page }) => {
    await goToTimeline(page);
    await page.waitForFunction(() => Array.isArray(window._vacdashEvents) && window._vacdashEvents.length > 0, { timeout: 10000 });
    const hasArchived = await page.evaluate(() =>
      (window._vacdashEvents || []).some(e => e.archived === true)
    );
    expect(hasArchived).toBe(false);
  });
});

// ── AC-5: Show archived toggle ────────────────────────────────────────────────

test.describe('AC-5 -- Show archived toggle', () => {
  test('Show archived toggle is in DOM but hidden for family view', async ({ page }) => {
    await goToTimeline(page);
    const wrap = page.locator('#vacdash-show-archived-wrap');
    if (await wrap.count() > 0) {
      expect(await wrap.isVisible()).toBe(false);
    } else {
      expect(await wrap.count()).toBeGreaterThan(0);
    }
  });

  test('Show archived toggle is visible in admin mode', async ({ page }) => {
    await login(page);
    await goToTimeline(page);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    await expect(page.locator('#vacdash-show-archived-btn')).toBeVisible();
  });
});

// ── AC-6 & AC-7: Restore and Delete on archived cards ─────────────────────────

test.describe('AC-6/7 -- Restore and Delete on archived cards', () => {
  let testEventId = null;

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Create a temporary archived event for these tests
    testEventId = await page.evaluate(async ({ url, key }) => {
      const client = window.supabase.createClient(url, key);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || key;
      const id = crypto.randomUUID();
      const resp = await fetch(`${url}/rest/v1/schedule_events`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id,
          title: '__test_archived_event__',
          date: '2026-05-23',
          duration: 1,
          priority: 'low',
          archived: true,
          interested: [],
          undecided: [],
          notInterested: [],
          noResponse: []
        })
      });
      if (!resp.ok) { console.error('insert failed', resp.status, await resp.text()); return null; }
      return id;
    }, { url: SUPABASE_URL, key: SUPABASE_ANON_KEY });
  });

  test.afterEach(async ({ page }) => {
    if (!testEventId) return;
    await page.evaluate(async ({ url, key, id }) => {
      const client = window.supabase.createClient(url, key);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || key;
      await fetch(`${url}/rest/v1/schedule_events?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${token}` }
      });
    }, { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, id: testEventId });
    testEventId = null;
  });

  test('AC-6: Restore removes the archived card from the archived list', async ({ page }) => {
    await goToTimeline(page);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    await page.click('#vacdash-show-archived-btn');
    await page.waitForSelector(`details.event-card--archived[data-event-id="${testEventId}"]`, { timeout: 10000 });
    await page.locator(`details.event-card--archived[data-event-id="${testEventId}"]`).evaluate(el => { el.open = true; });
    await page.locator(`details.event-card--archived[data-event-id="${testEventId}"] .admin-restore-btn`).click();
    await expect(page.locator(`details.event-card--archived[data-event-id="${testEventId}"]`)).toHaveCount(0, { timeout: 10000 });
  });

  test('AC-7: Delete permanently removes the archived card', async ({ page }) => {
    await goToTimeline(page);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    await page.click('#vacdash-show-archived-btn');
    await page.waitForSelector(`details.event-card--archived[data-event-id="${testEventId}"]`, { timeout: 10000 });
    await page.locator(`details.event-card--archived[data-event-id="${testEventId}"]`).evaluate(el => { el.open = true; });
    page.on('dialog', d => d.accept());
    await page.locator(`details.event-card--archived[data-event-id="${testEventId}"] .admin-delete-btn`).click();
    await expect(page.locator(`details.event-card--archived[data-event-id="${testEventId}"]`)).toHaveCount(0, { timeout: 10000 });
  });
});
