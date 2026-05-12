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
  // Allow loadEventForm async Supabase fetches to settle
  await page.waitForTimeout(800);
}

// ── AC-1: Date Drum ──────────────────────────────────────────────────────────

test.describe('AC-1: Date Drum', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('month column is selectable and syncs hidden input', async ({ page }) => {
    // Click "June" (index 5, 0-based) in the month drum
    await page.locator('#drum-month .drum-item').nth(5).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-date').value);
    expect(val).toMatch(/-06-/);
  });

  test('day column is selectable and syncs hidden input', async ({ page }) => {
    // Click day "15" (index 14) in the day drum
    await page.locator('#drum-day .drum-item').nth(14).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-date').value);
    // Day 15 = "15" in the date string
    expect(val).toMatch(/-15$/);
  });

  test('year column is selectable and syncs hidden input', async ({ page }) => {
    // YEARS = [2025, 2026, 2027]; click 2027 (index 2)
    await page.locator('#drum-year .drum-item').nth(2).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-date').value);
    expect(val).toMatch(/^2027-/);
  });
});

// ── AC-2: Time Drum ──────────────────────────────────────────────────────────

test.describe('AC-2: Time Drum', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('hour column is selectable and syncs hidden input', async ({ page }) => {
    // Click hour "3" (index 2, hours=[1..12]) in the hour drum
    await page.locator('#drum-hour .drum-item').nth(2).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-startTime').value);
    expect(val).toMatch(/^3:/);
  });

  test('minute column is selectable and syncs hidden input', async ({ page }) => {
    // MINUTES=[':00',':15',':30',':45']; click ':30' (index 2)
    await page.locator('#drum-minute .drum-item').nth(2).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-startTime').value);
    expect(val).toMatch(/:30 /);
  });

  test('AM/PM column syncs hidden input when PM is selected', async ({ page }) => {
    // AMPM=['AM','PM']; PM is index 1 — this is the known broken case
    await page.locator('#drum-ampm .drum-item').nth(1).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-startTime').value);
    expect(val).toMatch(/PM$/);
  });

  test('AM/PM column syncs hidden input when AM is selected', async ({ page }) => {
    // First scroll to PM, then back to AM to test round-trip
    await page.locator('#drum-ampm .drum-item').nth(1).click();
    await page.waitForTimeout(300);
    await page.locator('#drum-ampm .drum-item').nth(0).click();
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => document.getElementById('input-startTime').value);
    expect(val).toMatch(/AM$/);
  });
});

// ── AC-3: Duration Stepper ───────────────────────────────────────────────────

test.describe('AC-3: Duration Stepper', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('+ increments displayed value and updates hidden input', async ({ page }) => {
    const before = await page.evaluate(() => {
      const v = document.getElementById('input-duration').value;
      return v ? parseFloat(v) : 1;
    });
    await page.click('#dur-plus');
    const afterDisplay = await page.textContent('#dur-display');
    const afterHidden = await page.evaluate(() => document.getElementById('input-duration').value);
    const afterVal = parseFloat(afterHidden);
    expect(afterVal).toBeCloseTo(before + 0.5, 1);
    expect(parseFloat(afterDisplay)).toBeCloseTo(afterVal, 1);
  });

  test('- decrements displayed value and updates hidden input', async ({ page }) => {
    // Ensure we start at a value > 0.5 so decrement is valid
    await page.click('#dur-plus');
    await page.click('#dur-plus');
    const before = parseFloat(await page.evaluate(() => document.getElementById('input-duration').value));
    await page.click('#dur-minus');
    const afterHidden = await page.evaluate(() => document.getElementById('input-duration').value);
    const afterDisplay = await page.textContent('#dur-display');
    const afterVal = parseFloat(afterHidden);
    expect(afterVal).toBeCloseTo(before - 0.5, 1);
    expect(parseFloat(afterDisplay)).toBeCloseTo(afterVal, 1);
  });
});

// ── AC-4: Event Type Segmented Control ───────────────────────────────────────

test.describe('AC-4: Event Type Segmented Control', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test.afterEach(async ({ page }) => {
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
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ event_type: null }),
      });
    });
  });

  test('commitment button becomes selected and shows attendee section', async ({ page }) => {
    await page.click('#event-type-segmented .seg-btn[data-value="commitment"]');
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    const isActive = await page.evaluate(() =>
      document.querySelector('#event-type-segmented .seg-btn[data-value="commitment"]')
        .classList.contains('seg-active')
    );
    expect(isActive).toBe(true);
    expect(await page.isVisible('#attendee-section')).toBe(true);
    expect(await page.isVisible('#meal-section')).toBe(false);
  });

  test('open button becomes selected and hides both sections', async ({ page }) => {
    // First set commitment so we have something to hide
    await page.click('#event-type-segmented .seg-btn[data-value="commitment"]');
    await page.locator('#attendee-section').waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#event-type-segmented .seg-btn[data-value="open"]');
    await page.locator('#attendee-section').waitFor({ state: 'hidden', timeout: 5000 });
    const isActive = await page.evaluate(() =>
      document.querySelector('#event-type-segmented .seg-btn[data-value="open"]')
        .classList.contains('seg-active')
    );
    expect(isActive).toBe(true);
    expect(await page.isVisible('#attendee-section')).toBe(false);
    expect(await page.isVisible('#meal-section')).toBe(false);
  });

  test('meal button becomes selected and shows meal section', async ({ page }) => {
    await page.click('#event-type-segmented .seg-btn[data-value="meal"]');
    await page.locator('#meal-section').waitFor({ state: 'visible', timeout: 5000 });
    const isActive = await page.evaluate(() =>
      document.querySelector('#event-type-segmented .seg-btn[data-value="meal"]')
        .classList.contains('seg-active')
    );
    expect(isActive).toBe(true);
    expect(await page.isVisible('#meal-section')).toBe(true);
    expect(await page.isVisible('#attendee-section')).toBe(false);
  });
});

// ── AC-5: Title Inline Validation ────────────────────────────────────────────

test.describe('AC-5: Title Inline Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('valid text shows checkmark indicator', async ({ page }) => {
    await page.fill('#input-title', 'Zip Line Adventure');
    // input event fires updateTitleValidation synchronously
    const text = await page.textContent('#title-validation-indicator');
    expect(text).toBe('✓');
  });

  test('empty text shows X indicator', async ({ page }) => {
    await page.fill('#input-title', '');
    const text = await page.textContent('#title-validation-indicator');
    expect(text).toBe('✗');
  });
});

// ── AC-6: Series Slug ────────────────────────────────────────────────────────

test.describe('AC-6: Series Slug', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('lowercase letters and hyphens are preserved as-entered', async ({ page }) => {
    await page.fill('#series-slug-input', 'escape-room');
    const val = await page.inputValue('#series-slug-input');
    expect(val).toBe('escape-room');
  });

  test('characters that are not lowercase letters or hyphens are stripped', async ({ page }) => {
    await page.fill('#series-slug-input', '');
    // Type mixed content: valid chars interleaved with invalid chars
    await page.type('#series-slug-input', 'Abc123!escape-room');
    const val = await page.inputValue('#series-slug-input');
    // Only lowercase letters and hyphens should remain
    expect(val).toMatch(/^[a-z-]*$/);
    expect(val).not.toMatch(/[A-Z0-9!]/);
  });
});

// ── AC-7: Save Changes ───────────────────────────────────────────────────────

test.describe('AC-7: Save Changes', () => {
  let savedEventId = null;

  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
    savedEventId = await page.evaluate(() => document.getElementById('event-select').value);
  });

  test.afterEach(async ({ page }) => {
    // Reset the title override written during this test
    await page.evaluate(async (eventId) => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      if (!eventId) return;
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;
      await fetch(
        `${SUPABASE_URL}/rest/v1/schedule_overrides?event_id=eq.${eventId}&field=eq.title`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    }, savedEventId);
  });

  test('save sends data to Supabase and read-back matches submitted value', async ({ page }) => {
    const uniqueTitle = 'Test Save ' + Date.now();

    // Modify title to a unique value (different from loadedValues.title)
    await page.fill('#input-title', uniqueTitle);

    // Click Save Changes
    await page.click('#save-btn');

    // Wait for toast "Saved" to appear (opacity becomes '1')
    await page.waitForFunction(
      () => {
        const el = document.getElementById('toast-snackbar');
        return el && el.textContent === 'Saved' && el.style.opacity === '1';
      },
      { timeout: 8000 }
    );

    // Read back from Supabase to verify the override was persisted
    const readback = await page.evaluate(async (eventId) => {
      const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await client
        .from('schedule_overrides')
        .select('new_value')
        .eq('event_id', eventId)
        .eq('field', 'title')
        .single();
      return { data, error: error ? error.message : null };
    }, savedEventId);

    expect(readback.error).toBeNull();
    expect(readback.data.new_value).toBe(uniqueTitle);
  });
});

// ── AC-8: Import Button ──────────────────────────────────────────────────────

test.describe('AC-8: Import Button', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('status message appears in same flex row as button without layout shift', async ({ page }) => {
    // Measure button bounding box before click
    const boxBefore = await page.locator('#import-btn').boundingBox();
    expect(boxBefore).not.toBeNull();

    await page.click('#import-btn');

    // Wait for the status span to become visible (opacity transitions from 0 to 1)
    await page.waitForFunction(
      () => {
        const el = document.getElementById('import-status');
        return el && el.style.opacity === '1' && el.textContent.trim().length > 0;
      },
      { timeout: 10000 }
    );

    // Measure button bounding box after status appears
    const boxAfter = await page.locator('#import-btn').boundingBox();
    expect(boxAfter).not.toBeNull();

    // Button must not shift more than 1px in any direction
    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.y - boxBefore.y)).toBeLessThanOrEqual(1);

    // Confirm the status element is in the same flex row (same parent div as import-btn)
    const sameParent = await page.evaluate(() => {
      const btn = document.getElementById('import-btn');
      const status = document.getElementById('import-status');
      return btn.parentElement === status.parentElement;
    });
    expect(sameParent).toBe(true);
  });

  test('status message disappears without layout shift', async ({ page }) => {
    const boxBefore = await page.locator('#import-btn').boundingBox();

    await page.click('#import-btn');

    // Wait for status to appear
    await page.waitForFunction(
      () => {
        const el = document.getElementById('import-status');
        return el && el.style.opacity === '1' && el.textContent.trim().length > 0;
      },
      { timeout: 10000 }
    );

    // The status uses opacity (not display:none), so the element stays in the layout.
    // Wait for it to potentially fade — but even while fading, button must not shift.
    await page.waitForTimeout(300);
    const boxAfter = await page.locator('#import-btn').boundingBox();

    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.y - boxBefore.y)).toBeLessThanOrEqual(1);
  });
});

// ── AC-9: Event Selector Labels ──────────────────────────────────────────────

test.describe('AC-9: Event Selector Labels', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForFunction(
      () => document.getElementById('event-select').options.length > 1,
      { timeout: 10000 }
    );
  });

  test('sort by date: labels use "MMM D \u2014 Title" format', async ({ page }) => {
    // date sort is the default; click it explicitly to be sure
    await page.click('.sort-btn[data-sort="date"]');
    await page.waitForTimeout(100);

    const labels = await page.evaluate(() => {
      const sel = document.getElementById('event-select');
      return Array.from(sel.options)
        .filter(o => o.value !== '')
        .map(o => o.text);
    });

    expect(labels.length).toBeGreaterThan(0);
    // Each label must match: "Mon D \u2014 Title text" (em dash)
    for (const label of labels) {
      expect(label).toMatch(/^[A-Z][a-z]+ \d+ \u2014 .+/);
    }
  });

  test('sort by name: labels use "Title (MMM D)" format', async ({ page }) => {
    await page.click('.sort-btn[data-sort="title"]');
    await page.waitForTimeout(100);

    const labels = await page.evaluate(() => {
      const sel = document.getElementById('event-select');
      return Array.from(sel.options)
        .filter(o => o.value !== '')
        .map(o => o.text);
    });

    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label).toMatch(/^.+ \([A-Z][a-z]+ \d+\)$/);
    }
  });

  test('sort by duration: labels use "Title (MMM D)" format', async ({ page }) => {
    await page.click('.sort-btn[data-sort="duration"]');
    await page.waitForTimeout(100);

    const labels = await page.evaluate(() => {
      const sel = document.getElementById('event-select');
      return Array.from(sel.options)
        .filter(o => o.value !== '')
        .map(o => o.text);
    });

    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label).toMatch(/^.+ \([A-Z][a-z]+ \d+\)$/);
    }
  });

  test('sort by interest: labels use "Title (MMM D)" format', async ({ page }) => {
    await page.click('.sort-btn[data-sort="interest"]');
    await page.waitForTimeout(100);

    const labels = await page.evaluate(() => {
      const sel = document.getElementById('event-select');
      return Array.from(sel.options)
        .filter(o => o.value !== '')
        .map(o => o.text);
    });

    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label).toMatch(/^.+ \([A-Z][a-z]+ \d+\)$/);
    }
  });
});
