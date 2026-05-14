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

async function switchToMealEvent(page) {
  await page.waitForFunction(
    () => document.getElementById('event-select').options.length > 1,
    { timeout: 10000 }
  );
  await page.selectOption('#event-select', { index: 1 });
  await page.waitForSelector('#event-form', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(800);
  await page.click('#event-type-segmented .seg-btn[data-value="meal"]');
  await page.locator('#meal-section').waitFor({ state: 'visible', timeout: 5000 });
}

// ── AC-5: two panels side by side using .meal-panels / .meal-panel ────────────

test.describe('AC-5: two panels in .meal-panels structure', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('meal-available-panel and meal-assigned-panel exist within .meal-panels', async ({ page }) => {
    const result = await page.evaluate(() => {
      const avail = document.getElementById('meal-available-panel');
      const assign = document.getElementById('meal-assigned-panel');
      const mealPanels = document.querySelector('.meal-panels');
      return {
        availExists: avail !== null,
        assignExists: assign !== null,
        availInPanels: mealPanels !== null && mealPanels.contains(avail),
        assignInPanels: mealPanels !== null && mealPanels.contains(assign),
      };
    });
    expect(result.availExists).toBe(true);
    expect(result.assignExists).toBe(true);
    expect(result.availInPanels).toBe(true);
    expect(result.assignInPanels).toBe(true);
  });
});

// ── AC-6: left panel chips for names not in right panel ──────────────────────

test.describe('AC-6: available panel has chips with data-name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('chips in #meal-available-panel have data-name and class chip', async ({ page }) => {
    const result = await page.evaluate(() => {
      const chips = document.querySelectorAll('#meal-available-panel .chip');
      if (chips.length === 0) return { ok: true, message: 'no chips (all in assigned)' };
      for (const chip of chips) {
        if (!chip.dataset.name) return { ok: false, message: 'chip missing data-name: ' + chip.textContent };
        if (!chip.classList.contains('chip')) return { ok: false, message: 'chip missing chip class' };
      }
      return { ok: true, message: 'all valid' };
    });
    expect(result.ok).toBe(true);
  });
});

// ── AC-7: right panel has chips for names in meal_override_include ────────────

test.describe('AC-7: assigned panel has chips with data-name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('chips in #meal-assigned-panel have data-name and class chip', async ({ page }) => {
    const result = await page.evaluate(() => {
      const chips = document.querySelectorAll('#meal-assigned-panel .chip');
      if (chips.length === 0) return { ok: true, message: 'no chips (none assigned)' };
      for (const chip of chips) {
        if (!chip.dataset.name) return { ok: false, message: 'chip missing data-name' };
        if (!chip.classList.contains('chip')) return { ok: false, message: 'chip missing chip class' };
      }
      return { ok: true, message: 'all valid' };
    });
    expect(result.ok).toBe(true);
  });
});

// ── AC-8: Add and Remove buttons ─────────────────────────────────────────────

test.describe('AC-8: Add/Remove buttons between panels', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('#meal-add-btn and #meal-remove-btn exist in the DOM', async ({ page }) => {
    const result = await page.evaluate(() => ({
      addExists: document.getElementById('meal-add-btn') !== null,
      removeExists: document.getElementById('meal-remove-btn') !== null,
    }));
    expect(result.addExists).toBe(true);
    expect(result.removeExists).toBe(true);
  });
});

// ── AC-9: Add → moves selected chips left→right ───────────────────────────────

test.describe('AC-9: Add button moves selected chips to assigned panel', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('selecting available chip and clicking Add moves it to assigned panel', async ({ page }) => {
    // Ensure a chip is in the available panel; if not, remove one from assigned first
    let availName = await page.evaluate(() => {
      const chip = document.querySelector('#meal-available-panel .chip');
      return chip ? chip.dataset.name : null;
    });

    if (!availName) {
      const assignedName = await page.evaluate(() => {
        const chip = document.querySelector('#meal-assigned-panel .chip');
        return chip ? chip.dataset.name : null;
      });
      if (!assignedName) { test.skip(); return; }
      await page.locator(`#meal-assigned-panel .chip[data-name="${assignedName}"]`).click();
      await page.click('#meal-remove-btn');
      availName = assignedName;
    }

    await page.locator(`#meal-available-panel .chip[data-name="${availName}"]`).click();
    const isSelected = await page.evaluate(n =>
      document.querySelector(`#meal-available-panel .chip[data-name="${n}"]`)?.classList.contains('chip-selected'),
      availName
    );
    expect(isSelected).toBe(true);

    await page.click('#meal-add-btn');

    const inAssigned = await page.evaluate(n =>
      document.querySelector(`#meal-assigned-panel .chip[data-name="${n}"]`) !== null, availName);
    const inAvailable = await page.evaluate(n =>
      document.querySelector(`#meal-available-panel .chip[data-name="${n}"]`) !== null, availName);
    expect(inAssigned).toBe(true);
    expect(inAvailable).toBe(false);
  });
});

// ── AC-10: Remove moves selected chips right→left ────────────────────────────

test.describe('AC-10: Remove button moves selected chips to available panel', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('selecting assigned chip and clicking Remove moves it to available panel', async ({ page }) => {
    let assignedName = await page.evaluate(() => {
      const chip = document.querySelector('#meal-assigned-panel .chip');
      return chip ? chip.dataset.name : null;
    });

    if (!assignedName) {
      const availName = await page.evaluate(() => {
        const chip = document.querySelector('#meal-available-panel .chip');
        return chip ? chip.dataset.name : null;
      });
      if (!availName) { test.skip(); return; }
      await page.locator(`#meal-available-panel .chip[data-name="${availName}"]`).click();
      await page.click('#meal-add-btn');
      assignedName = availName;
    }

    await page.locator(`#meal-assigned-panel .chip[data-name="${assignedName}"]`).click();
    const isSelected = await page.evaluate(n =>
      document.querySelector(`#meal-assigned-panel .chip[data-name="${n}"]`)?.classList.contains('chip-selected'),
      assignedName
    );
    expect(isSelected).toBe(true);

    await page.click('#meal-remove-btn');

    const inAvailable = await page.evaluate(n =>
      document.querySelector(`#meal-available-panel .chip[data-name="${n}"]`) !== null, assignedName);
    const inAssigned = await page.evaluate(n =>
      document.querySelector(`#meal-assigned-panel .chip[data-name="${n}"]`) !== null, assignedName);
    expect(inAvailable).toBe(true);
    expect(inAssigned).toBe(false);
  });
});

// ── AC-11: chip visual design ─────────────────────────────────────────────────

test.describe('AC-11: chip uses .chip class and clicking toggles .chip-selected', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await switchToMealEvent(page);
  });

  test('clicking a chip in available panel toggles chip-selected class', async ({ page }) => {
    const chipName = await page.evaluate(() => {
      const chip = document.querySelector('#meal-available-panel .chip') ||
                   document.querySelector('#meal-assigned-panel .chip');
      return chip ? chip.dataset.name : null;
    });
    if (!chipName) { test.skip(); return; }

    const panelId = await page.evaluate(n => {
      if (document.querySelector(`#meal-available-panel .chip[data-name="${n}"]`)) return 'meal-available-panel';
      return 'meal-assigned-panel';
    }, chipName);

    const beforeSelected = await page.evaluate(({ n, pid }) =>
      document.querySelector(`#${pid} .chip[data-name="${n}"]`)?.classList.contains('chip-selected'),
      { n: chipName, pid: panelId }
    );
    expect(beforeSelected).toBe(false);

    await page.locator(`#${panelId} .chip[data-name="${chipName}"]`).click();

    const afterSelected = await page.evaluate(({ n, pid }) =>
      document.querySelector(`#${pid} .chip[data-name="${n}"]`)?.classList.contains('chip-selected'),
      { n: chipName, pid: panelId }
    );
    expect(afterSelected).toBe(true);
  });
});
