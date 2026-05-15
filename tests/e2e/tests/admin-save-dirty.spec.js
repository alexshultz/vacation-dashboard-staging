// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const lines = fs.readFileSync(path.join(__dirname, '..', '.env.test'), 'utf-8').split('\n');
  const env = {};
  lines.forEach(line => { const m = line.match(/^([^=]+)=(.*)$/); if (m) env[m[1].trim()] = m[2].trim(); });
  return env;
}

const { VACDASH_EMAIL, VACDASH_PASSWORD, VACDASH_STAGING_URL } = loadEnv();

async function login(page) {
  await page.goto(VACDASH_STAGING_URL + '/admin.html');
  await page.waitForSelector('#auth-email-login', { state: 'visible', timeout: 10000 });
  await page.fill('#login-email', VACDASH_EMAIL);
  await page.fill('#login-password', VACDASH_PASSWORD);
  await page.click('#login-btn');
  await page.waitForSelector('#editor-section', { state: 'visible', timeout: 10000 });
}

async function selectFirstEvent(page) {
  await page.waitForFunction(
    () => document.getElementById('event-select').options.length > 1,
    { timeout: 10000 }
  );
  await page.selectOption('#event-select', { index: 1 });
  await page.waitForSelector('#event-form', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(800);
}

// ── AC-1: series slug saved by Save Changes button ────────────────────────────

test.describe('AC-1: series slug saved by Save Changes button', () => {
  let savedEventId = null;

  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
    savedEventId = await page.evaluate(() => document.getElementById('event-select').value);
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(async (eventId) => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      if (!eventId) return;
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;
      await fetch(`${SUPABASE_URL}/rest/v1/schedule_events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ series_slug: null }),
      });
    }, savedEventId);
  });

  test('Save Changes button saves series slug without clicking Save Series', async ({ page }) => {
    const testSlug = 'test-slug-lazlo';
    await page.fill('#input-title', 'Save Dirty Test ' + Date.now());
    await page.fill('#series-slug-input', testSlug);
    await page.click('#save-btn');
    await page.waitForFunction(
      () => {
        const el = document.getElementById('toast-snackbar');
        return el && el.textContent === 'Saved' && el.style.opacity === '1';
      },
      { timeout: 8000 }
    );
    const readback = await page.evaluate(async (eventId) => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await client
        .from('schedule_events')
        .select('series_slug')
        .eq('id', eventId)
        .single();
      return { data, error: error ? error.message : null };
    }, savedEventId);
    expect(readback.error).toBeNull();
    expect(readback.data.series_slug).toBe(testSlug);
  });
});

// ── AC-2/3: save-btn visual dirty/clean state ─────────────────────────────────

test.describe('AC-2/3: save-btn dirty/clean visual state', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('AC-3: save-btn is visually muted when form is clean', async ({ page }) => {
    const opacity = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
  });

  test('AC-2: save-btn becomes highlighted when title is changed', async ({ page }) => {
    const opacityBefore = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacityBefore)).toBeLessThan(1);
    await page.fill('#input-title', 'Dirty State Test');
    await page.waitForTimeout(150);
    const opacityAfter = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacityAfter)).toBeGreaterThanOrEqual(0.99);
  });

  test('AC-2: save-btn becomes highlighted when series-slug-input is changed', async ({ page }) => {
    const opacityBefore = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacityBefore)).toBeLessThan(1);
    await page.fill('#series-slug-input', 'dirty-slug');
    await page.dispatchEvent('#series-slug-input', 'input');
    await page.waitForTimeout(150);
    const opacityAfter = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacityAfter)).toBeGreaterThanOrEqual(0.99);
  });

  test('AC-2: save-btn becomes highlighted when event type is changed', async ({ page }) => {
    const opacityBefore = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacityBefore)).toBeLessThan(1);
    // Click whichever event type differs from what's currently loaded
    await page.evaluate(() => {
      const currentVal = document.getElementById('event-type-select').value;
      const targetVal = currentVal === 'meal' ? 'open' : 'meal';
      document.querySelector(`#event-type-segmented .seg-btn[data-value="${targetVal}"]`).click();
    });
    await page.waitForTimeout(300);
    const opacityAfter = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacityAfter)).toBeGreaterThanOrEqual(0.99);
  });
});

// ── AC-4: clicking save when clean does nothing ───────────────────────────────

test.describe('AC-4: save-btn click when clean does nothing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('clicking save when nothing is dirty shows no toast', async ({ page }) => {
    await page.click('#save-btn', { force: true });
    await page.waitForTimeout(2000);
    const toastVisible = await page.evaluate(() => {
      const el = document.getElementById('toast-snackbar');
      return el && el.style.opacity === '1';
    });
    expect(toastVisible).toBe(false);
  });
});
