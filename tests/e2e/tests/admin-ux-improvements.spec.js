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

// ── Feature A: Date preview label ─────────────────────────────────────────────

test.describe('Feature A -- date preview label', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('date preview element exists and matches DATE pattern', async ({ page }) => {
    const el = page.locator('#date-preview-label');
    await expect(el).toBeVisible();
    const text = await el.textContent();
    expect(text).toMatch(/^DATE \w{3}, \w+ \d{1,2}, \d{4}$/);
  });

  test('date preview is immediately before the date drum-picker-wrap', async ({ page }) => {
    const isAbove = await page.evaluate(() => {
      const preview = document.getElementById('date-preview-label');
      const next = preview?.nextElementSibling;
      return next?.classList.contains('drum-picker-wrap') ?? false;
    });
    expect(isAbove).toBe(true);
  });

  test('date preview updates when month drum changes', async ({ page }) => {
    const before = await page.locator('#date-preview-label').textContent();
    // Click January (index 0) -- events are in May so this forces a real change
    await page.locator('#drum-month .drum-item').nth(0).click();
    await page.waitForTimeout(300);
    const after = await page.locator('#date-preview-label').textContent();
    expect(after).toMatch(/^DATE \w{3}, \w+ \d{1,2}, \d{4}$/);
    expect(after).not.toBe(before);
  });
});

// ── Feature A: Time preview label ─────────────────────────────────────────────

test.describe('Feature A -- time preview label', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('time preview element exists and matches TIME pattern', async ({ page }) => {
    const el = page.locator('#time-preview-label');
    await expect(el).toBeVisible();
    const text = await el.textContent();
    expect(text).toMatch(/^TIME \d{1,2}:\d{2} (AM|PM)$/);
  });

  test('time preview is immediately before the start time drum-picker-wrap', async ({ page }) => {
    const isAbove = await page.evaluate(() => {
      const preview = document.getElementById('time-preview-label');
      const next = preview?.nextElementSibling;
      return next?.classList.contains('drum-picker-wrap') ?? false;
    });
    expect(isAbove).toBe(true);
  });

  test('time preview updates to PM when PM drum item clicked', async ({ page }) => {
    await page.locator('#drum-ampm .drum-item').nth(1).click(); // PM
    await page.waitForTimeout(300);
    const text = await page.locator('#time-preview-label').textContent();
    expect(text).toMatch(/^TIME \d{1,2}:\d{2} PM$/);
  });

  test('time preview updates to AM when AM drum item clicked after PM', async ({ page }) => {
    await page.locator('#drum-ampm .drum-item').nth(1).click(); // PM first
    await page.waitForTimeout(150);
    await page.locator('#drum-ampm .drum-item').nth(0).click(); // AM
    await page.waitForTimeout(300);
    const text = await page.locator('#time-preview-label').textContent();
    expect(text).toMatch(/^TIME \d{1,2}:\d{2} AM$/);
  });
});

// ── Feature B: Attendees grid CSS ─────────────────────────────────────────────

test.describe('Feature B -- attendees grid CSS', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('attendee checklist has no max-height set', async ({ page }) => {
    const maxHeight = await page.evaluate(() => {
      const el = document.getElementById('attendee-checklist');
      return el ? getComputedStyle(el).maxHeight : null;
    });
    expect(maxHeight).toBe('none');
  });

  test('attendee checklist does not have overflow-y auto or scroll', async ({ page }) => {
    const overflowY = await page.evaluate(() => {
      const el = document.getElementById('attendee-checklist');
      return el ? getComputedStyle(el).overflowY : null;
    });
    expect(overflowY).not.toBe('auto');
    expect(overflowY).not.toBe('scroll');
  });
});

// ── Feature B: Save Changes merges attendees save ─────────────────────────────

test.describe('Feature B -- Save Changes merges attendees save', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('saveOverrides function body includes a call to saveAttendees', async ({ page }) => {
    const fnSource = await page.evaluate(() => saveOverrides.toString());
    expect(fnSource).toMatch(/saveAttendees/);
  });

  test('standalone Save Attendees button coexists with the merged save in saveOverrides', async ({ page }) => {
    // saveOverrides must include the saveAttendees call (Feature B), so this test
    // fails before implementation and acts as a regression guard after.
    const fnSource = await page.evaluate(() => saveOverrides.toString());
    expect(fnSource).toMatch(/saveAttendees/);

    await page.click('#event-type-segmented .seg-btn[data-value="commitment"]');
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    const btn = page.locator('#attendee-section button', { hasText: 'Save Attendees' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    // Restore event_type
    await page.evaluate(async () => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      const eventId = document.getElementById('event-select').value;
      if (!eventId) return;
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;
      await fetch(`${SUPABASE_URL}/rest/v1/schedule_events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ event_type: null }),
      });
    });
  });

  test('clicking Save Changes triggers attendees PATCH before overrides POST', async ({ page }) => {
    await page.click('#event-type-segmented .seg-btn[data-value="commitment"]');
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    // Wait for event_type PATCH to settle before starting network listener
    await page.waitForTimeout(1500);

    const requestOrder = [];
    page.on('request', req => {
      const url = req.url();
      if (url.includes('schedule_events') && req.method() === 'PATCH') {
        requestOrder.push('attendees');
      } else if (url.includes('schedule_overrides') && req.method() === 'POST') {
        requestOrder.push('overrides');
      }
    });

    // Give Save Changes something to do by changing title
    await page.fill('#input-title', 'Test Save ' + Date.now());
    await page.click('#save-btn');

    // Wait for toast Saved
    await page.waitForFunction(
      () => {
        const el = document.getElementById('toast-snackbar');
        return el && el.textContent === 'Saved' && el.style.opacity === '1';
      },
      { timeout: 10000 }
    );

    expect(requestOrder).toContain('attendees');
    expect(requestOrder).toContain('overrides');
    expect(requestOrder.indexOf('attendees')).toBeLessThan(requestOrder.indexOf('overrides'));

    // Restore staging data
    await page.evaluate(async () => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      const eventId = document.getElementById('event-select').value;
      if (!eventId) return;
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;
      await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/schedule_events?id=eq.${eventId}`, {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ event_type: null }),
        }),
        fetch(`${SUPABASE_URL}/rest/v1/schedule_overrides?event_id=eq.${eventId}&field=eq.title`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
        }),
      ]);
    });
  });
});
