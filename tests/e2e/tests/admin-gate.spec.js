// @ts-check
const { test, expect } = require('@playwright/test');

// Admin gate tests -- read-only, no auth attempted
// These tests verify the redirect/auth gate behavior only.
// admin-event-timeline.html and admin-index.html do a Supabase session check (async),
// then redirect via window.location.replace('admin.html') if no session.
// admin.html shows #passcode-section with #auth-register or #auth-signin.
//
// NOTE: Supabase session check is async. The redirect fires after the async check completes.
// 3000ms wait is used per the task brief; 5000ms fallback in expect timeout.

test('admin-gate: admin-event-timeline.html redirects to admin.html when no session', async ({ page: pw }) => {
  await pw.goto('/admin-event-timeline.html');

  // Wait for redirect -- Supabase session check is async
  // The page does window.location.replace('admin.html') when no session exists
  await pw.waitForURL('**/admin.html', { timeout: 8000 }).catch(() => null);

  const currentUrl = pw.url();
  expect(
    currentUrl.includes('admin.html'),
    `admin-event-timeline.html should redirect to admin.html (current URL: ${currentUrl})`
  ).toBe(true);
});

test('admin-gate: admin-index.html redirects to admin.html when no session', async ({ page: pw }) => {
  await pw.goto('/admin-index.html');

  // Wait for redirect
  await pw.waitForURL('**/admin.html', { timeout: 8000 }).catch(() => null);

  const currentUrl = pw.url();
  expect(
    currentUrl.includes('admin.html'),
    `admin-index.html should redirect to admin.html (current URL: ${currentUrl})`
  ).toBe(true);
});

test('admin-gate: admin.html shows auth gate (not editor)', async ({ page: pw }) => {
  await pw.goto('/admin.html');
  await pw.waitForLoadState('domcontentloaded');

  // #passcode-section contains #auth-register and #auth-signin
  // Only one is shown at a time depending on registration state
  const passcodeSection = pw.locator('#passcode-section');
  await expect(passcodeSection, 'admin.html: #passcode-section should be visible').toBeVisible({ timeout: 5000 });

  // Verify auth gate is showing register or signin section
  const authRegister = pw.locator('#auth-register');
  const authSignin = pw.locator('#auth-signin');

  const registerDisplayed = await authRegister.evaluate(
    el => el.style.display !== 'none'
  ).catch(() => false);

  const signinDisplayed = await authSignin.evaluate(
    el => el.style.display !== 'none'
  ).catch(() => false);

  expect(
    registerDisplayed || signinDisplayed,
    'admin.html: #auth-register or #auth-signin must be visible (auth gate must be active, not editor)'
  ).toBe(true);
});
