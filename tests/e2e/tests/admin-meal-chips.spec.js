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

async function setMealType(page) {
  await page.click('#event-type-segmented .seg-btn[data-value="meal"]');
  await page.locator('#meal-section').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#meal-available-panel .chip').first().waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('admin-meal-chips: Meal override chip-based dual-panel transfer UI', () => {
  let savedEventId = null;

  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
    savedEventId = await page.evaluate(() => document.getElementById('event-select').value);
    await setMealType(page);
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
        body: JSON.stringify({
          event_type: null,
          meal_override_include: [],
          meal_override_exclude: []
        }),
      });
    }, savedEventId);
  });

  test('both transfer units render panels and Add/Remove buttons', async ({ page }) => {
    const struct = await page.evaluate(() => ({
      includeLeft: !!document.getElementById('meal-available-panel'),
      includeRight: !!document.getElementById('meal-assigned-panel'),
      excludeLeft: !!document.getElementById('meal-exclude-left-panel'),
      excludeRight: !!document.getElementById('meal-exclude-right-panel'),
      includeAdd: !!document.getElementById('meal-add-btn'),
      includeRemove: !!document.getElementById('meal-remove-btn'),
      excludeAdd: !!document.getElementById('meal-exclude-add-btn'),
      excludeRemove: !!document.getElementById('meal-exclude-remove-btn'),
      leftChips: document.querySelectorAll('#meal-available-panel .chip').length,
      rightChips: document.querySelectorAll('#meal-assigned-panel .chip').length,
    }));
    expect(struct.includeLeft).toBe(true);
    expect(struct.includeRight).toBe(true);
    expect(struct.excludeLeft).toBe(true);
    expect(struct.excludeRight).toBe(true);
    expect(struct.includeAdd).toBe(true);
    expect(struct.includeRemove).toBe(true);
    expect(struct.excludeAdd).toBe(true);
    expect(struct.excludeRemove).toBe(true);
    expect(struct.leftChips).toBeGreaterThan(0);
    expect(struct.rightChips).toBe(0);
  });

  test('clicking a left-panel chip toggles .chip-selected', async ({ page }) => {
    const firstChip = page.locator('#meal-available-panel .chip').first();
    await firstChip.click();
    await expect(firstChip).toHaveClass(/chip-selected/);
    await firstChip.click();
    await expect(firstChip).not.toHaveClass(/chip-selected/);
  });

  test('"Add" button moves selected left chips to right panel', async ({ page }) => {
    const firstName = await page.locator('#meal-available-panel .chip').first().getAttribute('data-name');
    await page.locator('#meal-available-panel .chip').first().click();
    await page.click('#meal-add-btn');
    await page.waitForTimeout(150);
    const result = await page.evaluate((name) => ({
      inRight: !!document.querySelector(`#meal-assigned-panel .chip[data-name="${name}"]`),
      inLeft: !!document.querySelector(`#meal-available-panel .chip[data-name="${name}"]`),
    }), firstName);
    expect(result.inRight).toBe(true);
    expect(result.inLeft).toBe(false);
  });

  test('"Remove" button moves selected right chips back to left panel', async ({ page }) => {
    const firstName = await page.locator('#meal-available-panel .chip').first().getAttribute('data-name');
    await page.locator('#meal-available-panel .chip').first().click();
    await page.click('#meal-add-btn');
    await page.waitForTimeout(150);
    await page.locator(`#meal-assigned-panel .chip[data-name="${firstName}"]`).click();
    await page.click('#meal-remove-btn');
    await page.waitForTimeout(150);
    const result = await page.evaluate((name) => ({
      inLeft: !!document.querySelector(`#meal-available-panel .chip[data-name="${name}"]`),
      inRight: !!document.querySelector(`#meal-assigned-panel .chip[data-name="${name}"]`),
    }), firstName);
    expect(result.inLeft).toBe(true);
    expect(result.inRight).toBe(false);
  });

  test('multi-select: multiple chips can be selected before transfer', async ({ page }) => {
    const names = await page.evaluate(() => {
      const chips = document.querySelectorAll('#meal-available-panel .chip');
      return [chips[0]?.dataset.name, chips[1]?.dataset.name, chips[2]?.dataset.name];
    });
    for (const n of names) {
      await page.locator(`#meal-available-panel .chip[data-name="${n}"]`).click();
    }
    await page.click('#meal-add-btn');
    await page.waitForTimeout(150);
    const result = await page.evaluate((ns) => ns.map(n =>
      !!document.querySelector(`#meal-assigned-panel .chip[data-name="${n}"]`)), names);
    expect(result).toEqual([true, true, true]);
  });

  test('after transfers, #save-btn becomes visually active (opacity=1)', async ({ page }) => {
    await page.locator('#meal-available-panel .chip').first().click();
    await page.click('#meal-add-btn');
    await page.waitForTimeout(200);
    const opacity = await page.evaluate(() => document.getElementById('save-btn').style.opacity);
    expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0.99);
  });

  test('saving via #save-btn captures right-panel names for include and exclude', async ({ page }) => {
    const incName = await page.locator('#meal-available-panel .chip').first().getAttribute('data-name');
    await page.locator('#meal-available-panel .chip').first().click();
    await page.click('#meal-add-btn');
    await page.waitForTimeout(120);

    const excCandidates = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#meal-exclude-left-panel .chip')).map(c => c.dataset.name)
    );
    const excName = excCandidates.find(n => n !== incName) || excCandidates[0];
    await page.locator(`#meal-exclude-left-panel .chip[data-name="${excName}"]`).click();
    await page.click('#meal-exclude-add-btn');
    await page.waitForTimeout(120);

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
      const { data } = await client
        .from('schedule_events')
        .select('meal_override_include,meal_override_exclude')
        .eq('id', eventId)
        .single();
      return data;
    }, savedEventId);

    expect(readback.meal_override_include).toContain(incName);
    expect(readback.meal_override_exclude).toContain(excName);
  });

});

test.describe('admin-meal-chips: absence checks (no meal mode required)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('standalone "Save Overrides" button does not exist in the DOM', async ({ page }) => {
    const count = await page.locator('button:has-text("Save Overrides")').count();
    expect(count).toBe(0);
  });

  test('populateMealSelects is not callable on the page', async ({ page }) => {
    const isFn = await page.evaluate(() => typeof window.populateMealSelects === 'function');
    expect(isFn).toBe(false);
  });
});
