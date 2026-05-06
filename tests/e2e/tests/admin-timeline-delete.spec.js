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

const { VACDASH_EMAIL, VACDASH_PASSWORD, VACDASH_STAGING_URL } = loadEnv();

async function login(page) {
  await page.goto(VACDASH_STAGING_URL + '/admin.html');
  await page.waitForSelector('#auth-email-login', { state: 'visible', timeout: 10000 });
  await page.fill('#login-email', VACDASH_EMAIL);
  await page.fill('#login-password', VACDASH_PASSWORD);
  await page.click('#login-btn');
  await page.waitForSelector('#editor-section', { state: 'visible', timeout: 10000 });
}

test.describe('Admin timeline delete', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('edit modal contains a visible delete button', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });

    await page.locator('.admin-edit-btn').first().click();
    await page.waitForSelector('#vacdash-edit-modal', { state: 'visible', timeout: 5000 });

    const deleteBtn = page.locator('#vacdash-edit-delete');
    expect(await deleteBtn.count()).toBeGreaterThan(0);
    expect(await deleteBtn.isVisible()).toBe(true);
  });

  test('delete removes event from timeline and persists on reload', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });

    const initialCount = await page.locator('details.event-card').count();
    expect(initialCount).toBeGreaterThan(0);

    await page.locator('.admin-edit-btn').first().click();
    await page.waitForSelector('#vacdash-edit-modal', { state: 'visible', timeout: 5000 });

    // Set up dialog listener before clicking delete
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('#vacdash-edit-delete');
    const dialog = await dialogPromise;

    // Accept and wait for the page reload (location.reload() fires after Supabase DELETE)
    await Promise.all([
      page.waitForEvent('framenavigated'),
      dialog.accept(),
    ]);
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Wait for async render loop (Supabase fetch → renderCard calls)
    await page.waitForFunction(
      (expected) => document.querySelectorAll('details.event-card').length === expected,
      initialCount - 1,
      { timeout: 10000, polling: 300 }
    );

    const countAfterDelete = await page.locator('details.event-card').count();
    expect(countAfterDelete).toBe(initialCount - 1);

    // Reload to confirm persistence
    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForFunction(
      (expected) => document.querySelectorAll('details.event-card').length === expected,
      initialCount - 1,
      { timeout: 10000, polling: 300 }
    );

    const countAfterReload = await page.locator('details.event-card').count();
    expect(countAfterReload).toBe(initialCount - 1);
  });
});
