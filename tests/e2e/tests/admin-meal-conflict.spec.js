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

// ── Fixture data ──────────────────────────────────────────────────────────────

// Meal: 12:00–13:30
const MEAL_START = '12:00';    // 24-hour HH:MM
const MEAL_DURATION = 1.5;     // hours

const SAME_DATE_EVENTS = [
  // CONFLICT: 11:00–12:30 overlaps with 12:00–13:30
  {
    id: 'ev-zipline',
    title: 'Zip Line',
    date: '2026-05-22',
    startTime: '11:00',
    duration: 1.5,
    event_type: 'commitment',
    assigned_attendees: ['Alex', 'Adrian']
  },
  // NOT CONFLICT: 11:00–12:00 — endTime equals mealStart (strict inequality fails)
  {
    id: 'ev-buggy',
    title: 'Buggy Ride',
    date: '2026-05-22',
    startTime: '11:00',
    duration: 1.0,
    event_type: 'commitment',
    assigned_attendees: ['Brian', 'Bee']
  },
  // NOT CONFLICT: starts at 13:30 — equals meal endTime (strict inequality fails)
  {
    id: 'ev-walk',
    title: 'Post-Dinner Walk',
    date: '2026-05-22',
    startTime: '13:30',
    duration: 1.0,
    event_type: 'commitment',
    assigned_attendees: ['Zach']
  }
];

// Helper: inject meal panel state bypassing network calls
async function injectMealPanels(page, mealOverrides = {}) {
  await page.evaluate(({ mealOverrides, fixture, mealStart, mealDuration }) => {
    window.currentEvent = Object.assign({}, window.currentEvent, {
      startTime: mealStart,
      duration: mealDuration,
      event_type: 'meal',
      assigned_attendees: [],
      meal_override_include: mealOverrides.meal_override_include || [],
      meal_override_exclude: mealOverrides.meal_override_exclude || []
    });
    document.getElementById('event-type-select').value = 'meal';
    window.updateEventTypeSections();
    window.populateMealPanels(window.currentEvent, fixture);
  }, { mealOverrides, fixture: SAME_DATE_EVENTS, mealStart: MEAL_START, mealDuration: MEAL_DURATION });
  await page.waitForTimeout(200);
}

// ── AC-2: Time-aware conflict detection ───────────────────────────────────────

test.describe('AC-2: time-aware conflict detection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('boundary-touch events (same date, no time overlap) are NOT conflicts', async ({ page }) => {
    await injectMealPanels(page);
    const rightNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-right-panel .chip')].map(c => c.dataset.name)
    );
    // Buggy Ride ends at 12:00 = meal start — not a conflict
    expect(rightNames).not.toContain('Brian');
    expect(rightNames).not.toContain('Bee');
    // Post-Dinner Walk starts at 13:30 = meal end — not a conflict
    expect(rightNames).not.toContain('Zach');
  });

  test('overlapping commitment events produce auto-exclusions in right panel', async ({ page }) => {
    await injectMealPanels(page);
    const rightNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-right-panel .chip')].map(c => c.dataset.name)
    );
    // Zip Line 11:00–12:30 overlaps with meal 12:00–13:30 → conflict
    expect(rightNames).toContain('Alex');
    expect(rightNames).toContain('Adrian');
  });
});

// ── AC-3: Auto-exclusions are ephemeral ──────────────────────────────────────

test.describe('AC-3: auto-exclusions are ephemeral (never saved unless manually overridden)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('auto-excluded chips have no manual border indicator (not treated as overrides)', async ({ page }) => {
    await injectMealPanels(page);
    // Alex and Adrian are auto-excluded; they should NOT have the manual override border class
    const alexBorder = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-right-panel .chip')]
        .find(c => c.dataset.name === 'Alex');
      return chip ? chip.classList.contains('meal-chip-manual') : null;
    });
    expect(alexBorder).toBe(false);
  });
});

// ── AC-4: Left panel default ──────────────────────────────────────────────────

test.describe('AC-4: non-conflicted attendees default to left panel', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('attendees with no time conflict land in left panel', async ({ page }) => {
    await injectMealPanels(page);
    const leftNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-left-panel .chip')].map(c => c.dataset.name)
    );
    // Brian and Bee are boundary-touch (not conflicted) → left panel
    expect(leftNames).toContain('Brian');
    expect(leftNames).toContain('Bee');
    // Zach same (boundary touch at 13:30) → left panel
    expect(leftNames).toContain('Zach');
  });
});

// ── AC-5: Manual overrides round-trip ────────────────────────────────────────

test.describe('AC-5: manual overrides applied on load and affect save payload', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('meal_override_include (force-excluded) moves name to right panel on load', async ({ page }) => {
    // Jordan is normally in left panel (no conflict); override puts them right
    await injectMealPanels(page, { meal_override_include: ['Jordan'] });
    const rightNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-right-panel .chip')].map(c => c.dataset.name)
    );
    expect(rightNames).toContain('Jordan');
    const leftNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-left-panel .chip')].map(c => c.dataset.name)
    );
    expect(leftNames).not.toContain('Jordan');
  });

  test('meal_override_exclude (force-included) moves conflicted name to left panel on load', async ({ page }) => {
    // Alex is auto-excluded (conflict); override puts them back left
    await injectMealPanels(page, { meal_override_exclude: ['Alex'] });
    const leftNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-left-panel .chip')].map(c => c.dataset.name)
    );
    expect(leftNames).toContain('Alex');
    const rightNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-right-panel .chip')].map(c => c.dataset.name)
    );
    expect(rightNames).not.toContain('Alex');
  });
});

// ── AC-6: Single dual-panel layout ───────────────────────────────────────────

test.describe('AC-6: exactly one left panel, one right panel, one Add, one Remove', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('meal section has exactly one left panel and one right panel', async ({ page }) => {
    await injectMealPanels(page);
    const leftCount  = await page.evaluate(() => document.querySelectorAll('#meal-left-panel').length);
    const rightCount = await page.evaluate(() => document.querySelectorAll('#meal-right-panel').length);
    expect(leftCount).toBe(1);
    expect(rightCount).toBe(1);
  });

  test('meal section has exactly one move-right button and one move-left button', async ({ page }) => {
    await injectMealPanels(page);
    const rightBtnCount = await page.evaluate(() => document.querySelectorAll('#meal-move-right-btn').length);
    const leftBtnCount  = await page.evaluate(() => document.querySelectorAll('#meal-move-left-btn').length);
    expect(rightBtnCount).toBe(1);
    expect(leftBtnCount).toBe(1);
  });

  test('old second panel IDs (meal-exclude-left-panel, meal-exclude-right-panel) are absent', async ({ page }) => {
    await injectMealPanels(page);
    const oldLeft  = await page.evaluate(() => document.getElementById('meal-exclude-left-panel'));
    const oldRight = await page.evaluate(() => document.getElementById('meal-exclude-right-panel'));
    expect(oldLeft).toBeNull();
    expect(oldRight).toBeNull();
  });
});

// ── AC-7: Live headcount ──────────────────────────────────────────────────────

test.describe('AC-7: headcount equals left panel chip count and updates live', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('initial headcount matches left panel chip count', async ({ page }) => {
    await injectMealPanels(page);
    const { leftCount, displayedCount } = await page.evaluate(() => {
      const leftCount = document.querySelectorAll('#meal-left-panel .chip').length;
      const text = document.getElementById('meal-final-count').textContent;
      const m = text.match(/\d+/);
      return { leftCount, displayedCount: m ? parseInt(m[0], 10) : -1 };
    });
    expect(displayedCount).toBe(leftCount);
    expect(leftCount).toBeGreaterThan(0);
  });

  test('headcount decreases when a chip is moved to right panel', async ({ page }) => {
    await injectMealPanels(page);
    const before = await page.evaluate(() => {
      const leftCount = document.querySelectorAll('#meal-left-panel .chip').length;
      const text = document.getElementById('meal-final-count').textContent;
      const m = text.match(/\d+/);
      return { leftCount, displayedCount: m ? parseInt(m[0], 10) : -1 };
    });
    // Select a chip from left panel and move right
    await page.evaluate(() => {
      const chip = document.querySelector('#meal-left-panel .chip');
      if (chip) chip.click(); // select it
    });
    await page.click('#meal-move-right-btn');
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => {
      const leftCount = document.querySelectorAll('#meal-left-panel .chip').length;
      const text = document.getElementById('meal-final-count').textContent;
      const m = text.match(/\d+/);
      return { leftCount, displayedCount: m ? parseInt(m[0], 10) : -1 };
    });
    expect(after.leftCount).toBe(before.leftCount - 1);
    expect(after.displayedCount).toBe(before.displayedCount - 1);
  });
});

// ── AC-8: Manual override visual indicator ────────────────────────────────────

test.describe('AC-8: manually moved chips get accent-2 border', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('force-excluded chip (meal_override_include) has meal-chip-manual class when no AC-9 alert applies', async ({ page }) => {
    // Alex IS auto-excluded (conflict), so force-excluding is redundant but not stale → no AC-9, only AC-8
    await injectMealPanels(page, { meal_override_include: ['Alex'] });
    const hasManual = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-right-panel .chip')]
        .find(c => c.dataset.name === 'Alex');
      return chip ? chip.classList.contains('meal-chip-manual') : null;
    });
    expect(hasManual).toBe(true);
  });

  test('force-included chip (meal_override_exclude) has meal-chip-manual class when no AC-9 alert applies', async ({ page }) => {
    // Jordan has no conflict, so force-including is redundant but not stale → no AC-9, only AC-8
    await injectMealPanels(page, { meal_override_exclude: ['Jordan'] });
    const hasManual = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-left-panel .chip')]
        .find(c => c.dataset.name === 'Jordan');
      return chip ? chip.classList.contains('meal-chip-manual') : null;
    });
    expect(hasManual).toBe(true);
  });
});

// ── AC-9: Conflict-state change alert ────────────────────────────────────────

test.describe('AC-9: conflict-change alert on stale manual overrides', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('force-excluded name with no current conflict gets meal-chip-warn class', async ({ page }) => {
    // Jordan has no conflict but is in meal_override_include (was force-excluded)
    await injectMealPanels(page, { meal_override_include: ['Jordan'] });
    const hasWarn = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-right-panel .chip')]
        .find(c => c.dataset.name === 'Jordan');
      return chip ? chip.classList.contains('meal-chip-warn') : null;
    });
    expect(hasWarn).toBe(true);
  });

  test('force-excluded name with no conflict shows tooltip describing discrepancy', async ({ page }) => {
    await injectMealPanels(page, { meal_override_include: ['Jordan'] });
    const title = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-right-panel .chip')]
        .find(c => c.dataset.name === 'Jordan');
      return chip ? chip.title : null;
    });
    expect(title).toMatch(/manually excluded/i);
    expect(title).toMatch(/no longer has a time conflict/i);
  });

  test('force-included name that now has a conflict gets meal-chip-warn class', async ({ page }) => {
    // Alex has a conflict (Zip Line) but is in meal_override_exclude (was force-included)
    await injectMealPanels(page, { meal_override_exclude: ['Alex'] });
    const hasWarn = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-left-panel .chip')]
        .find(c => c.dataset.name === 'Alex');
      return chip ? chip.classList.contains('meal-chip-warn') : null;
    });
    expect(hasWarn).toBe(true);
  });

  test('force-included name with conflict shows tooltip naming the conflicting event', async ({ page }) => {
    await injectMealPanels(page, { meal_override_exclude: ['Alex'] });
    const title = await page.evaluate(() => {
      const chip = [...document.querySelectorAll('#meal-left-panel .chip')]
        .find(c => c.dataset.name === 'Alex');
      return chip ? chip.title : null;
    });
    expect(title).toMatch(/manually included/i);
    expect(title).toMatch(/Zip Line/i);
  });
});

// ── AC-10: Alert does not auto-resolve ────────────────────────────────────────

test.describe('AC-10: conflict-change alert does not auto-move the chip', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEvent(page);
  });

  test('force-excluded name with stale alert stays in right panel (not auto-moved)', async ({ page }) => {
    await injectMealPanels(page, { meal_override_include: ['Jordan'] });
    const rightNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-right-panel .chip')].map(c => c.dataset.name)
    );
    // Jordan should still be in right panel despite alert
    expect(rightNames).toContain('Jordan');
    const leftNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-left-panel .chip')].map(c => c.dataset.name)
    );
    expect(leftNames).not.toContain('Jordan');
  });

  test('force-included name with stale alert stays in left panel (not auto-moved)', async ({ page }) => {
    await injectMealPanels(page, { meal_override_exclude: ['Alex'] });
    const leftNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-left-panel .chip')].map(c => c.dataset.name)
    );
    expect(leftNames).toContain('Alex');
    const rightNames = await page.evaluate(() =>
      [...document.querySelectorAll('#meal-right-panel .chip')].map(c => c.dataset.name)
    );
    expect(rightNames).not.toContain('Alex');
  });
});
