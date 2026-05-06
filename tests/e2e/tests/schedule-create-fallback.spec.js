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

const SUPABASE_EVENTS_URL = 'https://quebfbvfuwbncpexlylu.supabase.co/rest/v1/schedule_events*';

async function login(page) {
  await page.goto(VACDASH_STAGING_URL + '/admin.html');
  await page.waitForSelector('#auth-email-login', { state: 'visible', timeout: 10000 });
  await page.fill('#login-email', VACDASH_EMAIL);
  await page.fill('#login-password', VACDASH_PASSWORD);
  await page.click('#login-btn');
  await page.waitForSelector('#editor-section', { state: 'visible', timeout: 10000 });
}

test.describe('Admin event-timeline -- Create New Event', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Create New Event button is present on admin-event-timeline.html', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/admin-event-timeline.html');
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    const createBtn = page.locator('#create-new-event-btn');
    await expect(createBtn).toBeVisible({ timeout: 5000 });
  });

  test('Create New Event button opens modal with blank fields and Create label', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/admin-event-timeline.html');
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    await page.click('#create-new-event-btn');
    await page.waitForSelector('#edit-modal', { state: 'visible', timeout: 5000 });

    await expect(page.locator('#modal-title')).toContainText('Create');
    expect(await page.inputValue('#ef-title')).toBe('');
    expect(await page.inputValue('#ef-date')).toBe('');
    expect(await page.inputValue('#ef-duration')).toBe('');
    expect(await page.inputValue('#ef-priority')).toBe('');
  });

  test('Creating a new event reloads and shows the new card', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/admin-event-timeline.html');
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    const initialCount = await page.locator('details.event-card').count();

    await page.click('#create-new-event-btn');
    await page.waitForSelector('#edit-modal', { state: 'visible', timeout: 5000 });

    const uniqueTitle = `PW Test ${Date.now()}`;
    await page.fill('#ef-title', uniqueTitle);
    await page.fill('#ef-date', '2026-05-23');
    await page.fill('#ef-duration', '1');
    await page.fill('#ef-priority', 'low');

    await Promise.all([
      page.waitForEvent('framenavigated'),
      page.click('#edit-save'),
    ]);
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    await page.waitForFunction(
      (expected) => document.querySelectorAll('details.event-card').length >= expected,
      initialCount + 1,
      { timeout: 10000, polling: 300 }
    );

    const newCount = await page.locator('details.event-card').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount + 1);
  });

  test('Edit modal still shows Edit label when opened via edit button', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/admin-event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 15000 });

    await page.locator('button[data-event-id]').first().click();
    await page.waitForSelector('#edit-modal', { state: 'visible', timeout: 5000 });

    await expect(page.locator('#modal-title')).toContainText('Edit');
  });
});

test.describe('event-timeline fallback behavior', () => {
  test('empty Supabase 200 response shows empty-state, not schedule.json data', async ({ page }) => {
    await page.route(SUPABASE_EVENTS_URL, route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: '[]',
      });
    });

    await page.goto('/event-timeline.html');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(500);

    // Should NOT show schedule.json placeholder event
    const atvCard = page.locator('details.event-card').filter({ hasText: 'ATV' });
    expect(await atvCard.count()).toBe(0);

    // Should show empty-state element
    const emptyMsg = page.locator('#timeline-empty-state');
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
  });

  test('Supabase network failure falls back to schedule.json placeholder data', async ({ page }) => {
    await page.route(SUPABASE_EVENTS_URL, route => route.abort('failed'));

    await page.goto('/event-timeline.html');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    await page.waitForFunction(
      () => document.querySelectorAll('details.event-card').length > 0,
      { timeout: 10000 }
    );

    const atvCard = page.locator('details.event-card').filter({ hasText: 'ATV' });
    expect(await atvCard.count()).toBeGreaterThan(0);
  });

  test('Supabase non-200 response falls back to schedule.json placeholder data', async ({ page }) => {
    await page.route(SUPABASE_EVENTS_URL, route => {
      route.fulfill({
        status: 503,
        headers: { 'Content-Type': 'application/json' },
        body: '{"message":"Service Unavailable"}',
      });
    });

    await page.goto('/event-timeline.html');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    await page.waitForFunction(
      () => document.querySelectorAll('details.event-card').length > 0,
      { timeout: 10000 }
    );

    const atvCard = page.locator('details.event-card').filter({ hasText: 'ATV' });
    expect(await atvCard.count()).toBeGreaterThan(0);
  });
});
