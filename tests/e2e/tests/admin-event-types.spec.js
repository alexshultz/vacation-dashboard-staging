// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.test');
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  lines.forEach(line => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
  return env;
}
const { VACDASH_EMAIL, VACDASH_PASSWORD } = loadEnv();
// Allow local server override via VACDASH_URL env var for local testing
const VACDASH_STAGING_URL = process.env.VACDASH_URL || loadEnv().VACDASH_STAGING_URL;

async function login(page) {
  await page.goto(VACDASH_STAGING_URL + '/admin.html');
  await page.waitForSelector('#auth-email-login', { state: 'visible', timeout: 10000 });
  await page.fill('#login-email', VACDASH_EMAIL);
  await page.fill('#login-password', VACDASH_PASSWORD);
  await page.click('#login-btn');
  await page.waitForSelector('#editor-section', { state: 'visible', timeout: 10000 });
}

async function selectFirstEvent(page) {
  // Wait for event-select to have real options (schedule.json loaded)
  await page.waitForFunction(
    () => document.getElementById('event-select').options.length > 1,
    { timeout: 10000 }
  );
  await page.selectOption('#event-select', { index: 1 });
  await page.waitForSelector('#event-form', { state: 'visible', timeout: 10000 });
}

test.describe('Admin event-types -- coordinator UI', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  // Reset event_type to null after each test to avoid dirty staging data across CI runs.
  // Uses the already-authenticated page context so the PATCH has the user's session token.
  test.afterEach(async ({ page }) => {
    await page.evaluate(async () => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      const eventId = document.getElementById('event-select').value;
      if (!eventId) return;
      // Create a client in the page context — it reads the existing session from localStorage.
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;
      await fetch(
        `${SUPABASE_URL}/rest/v1/schedule_events?id=eq.${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ event_type: null }),
        }
      );
    });
  });

  // Segmented control replaces the visible select; wait for the seg-ctrl to be ready.
  async function selectEventType(page, value) {
    await page.waitForSelector('#event-type-segmented', { state: 'visible', timeout: 5000 });
    await page.click(`#event-type-segmented .seg-btn[data-value="${value}"]`);
  }

  test('shows attendee checklist when event_type is set to commitment', async ({ page }) => {
    await selectEventType(page, 'commitment');
    // updateEventTypeSections fires synchronously on click; PATCH is async but section shows immediately.
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    const visible = await page.isVisible('#attendee-section');
    expect(visible).toBe(true);
  });

  test('hides attendee checklist when event_type is set to open', async ({ page }) => {
    // First set to commitment to ensure section was potentially shown.
    await selectEventType(page, 'commitment');
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    // Then switch to open.
    await selectEventType(page, 'open');
    await page.locator('#attendee-section').waitFor({ state: 'hidden', timeout: 5000 });
    const visible = await page.isVisible('#attendee-section');
    expect(visible).toBe(false);
  });

  test('shows meal headcount section when event_type is set to meal', async ({ page }) => {
    await selectEventType(page, 'meal');
    // updateEventTypeSections fires synchronously; section visible immediately.
    await page.locator('#meal-section').waitFor({ state: 'visible', timeout: 5000 });
    const visible = await page.isVisible('#meal-section');
    expect(visible).toBe(true);
  });

  test('attendee checklist contains at least 26 chips', async ({ page }) => {
    await selectEventType(page, 'commitment');
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    const count = await page.locator('#attendee-checklist .chip').count();
    expect(count).toBeGreaterThanOrEqual(26);
  });
});
