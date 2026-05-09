// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Load credentials from .env.test (gitignored -- never commit credentials)
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

test.describe('Admin overlay -- authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('index.html shows admin controls when logged in', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/index.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    // body.is-admin should be present
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(true);
    // Sign-out button visible in header
    const signoutVisible = await page.isVisible('#vacdash-signout-btn');
    expect(signoutVisible).toBe(true);
    // At least one edit button visible
    const editBtns = await page.locator('.admin-edit-btn').filter({ hasText: '✏️' });
    expect(await editBtns.count()).toBeGreaterThan(0);
    const firstVisible = await editBtns.first().isVisible();
    expect(firstVisible).toBe(true);
    // IV bar visible
    const ivBarVisible = await page.isVisible('#vacdash-iv-bar');
    expect(ivBarVisible).toBe(true);
  });

  test('event-timeline.html shows edit buttons when logged in', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(true);
    const signoutVisible = await page.isVisible('#vacdash-signout-btn');
    expect(signoutVisible).toBe(true);
    const editBtns = page.locator('.admin-edit-btn');
    expect(await editBtns.count()).toBeGreaterThan(0);
    await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
    // Edit buttons live inside closed <details> elements; open one to expose it for visibility check
    await page.locator('details.event-card').first().evaluate(el => { el.open = true; });
    expect(await editBtns.first().isVisible()).toBe(true);
  });

  test('sign-out removes admin controls', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/index.html');
    await page.waitForSelector('#vacdash-signout-btn', { state: 'visible', timeout: 10000 });
    await page.click('#vacdash-signout-btn');
    // After reload triggered by signOut
    await page.waitForLoadState('networkidle');
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(false);
  });
});

test.describe('Admin overlay -- unauthenticated family view', () => {
  test('index.html hides admin controls for family', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/index.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    const isAdmin = await page.evaluate(() => document.body.classList.contains('is-admin'));
    expect(isAdmin).toBe(false);
    const signoutVisible = await page.isVisible('#vacdash-signout-btn');
    expect(signoutVisible).toBe(false);
    // Edit buttons exist in DOM but must not be visible
    const editBtns = page.locator('.admin-edit-btn');
    if (await editBtns.count() > 0) {
      expect(await editBtns.first().isVisible()).toBe(false);
    }
  });

  test('event-timeline.html hides edit buttons for family', async ({ page }) => {
    await page.goto(VACDASH_STAGING_URL + '/event-timeline.html');
    await page.waitForSelector('details.event-card', { timeout: 10000 });
    const editBtns = page.locator('.admin-edit-btn');
    if (await editBtns.count() > 0) {
      expect(await editBtns.first().isVisible()).toBe(false);
    }
  });
});
