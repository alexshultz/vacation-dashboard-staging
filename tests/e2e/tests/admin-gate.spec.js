// @ts-check
const { test, expect } = require('@playwright/test');

// Admin gate tests -- read-only, no auth attempted
// These tests verify the redirect/auth gate behavior only.
// admin.html shows #passcode-section with #auth-register or #auth-signin.
//
// NOTE: Supabase session check is async. The redirect fires after the async check completes.
// 3000ms wait is used per the task brief; 5000ms fallback in expect timeout.


test('admin-gate: admin.html shows auth gate (not editor)', async ({ page: pw }) => {
  await pw.goto('/admin.html');
  await pw.waitForLoadState('domcontentloaded');

  // #passcode-section contains #auth-email-login (email/password auth)
  const passcodeSection = pw.locator('#passcode-section');
  await expect(passcodeSection, 'admin.html: #passcode-section should be visible').toBeVisible({ timeout: 5000 });

  // #auth-email-login starts display:none and is shown after async Supabase session check
  const authEmailLogin = pw.locator('#auth-email-login');
  await expect(
    authEmailLogin,
    'admin.html: #auth-email-login must be visible (auth gate must be active, not editor)'
  ).toBeVisible({ timeout: 8000 });
});
