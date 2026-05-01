// @ts-check
const { test, expect } = require('@playwright/test');

// All 10 family pages to smoke-test
const FAMILY_PAGES = [
  { path: '/', name: 'index' },
  { path: '/attractions.html', name: 'attractions' },
  { path: '/shows.html', name: 'shows' },
  { path: '/quick-pick.html', name: 'quick-pick' },
  { path: '/wishlist.html', name: 'wishlist' },
  { path: '/suggested.html', name: 'suggested' },
  { path: '/profile.html', name: 'profile' },
  { path: '/event-timeline.html', name: 'event-timeline' },
  { path: '/people-timeline.html', name: 'people-timeline' },
  { path: '/help.html', name: 'help' },
];

for (const page of FAMILY_PAGES) {
  test(`smoke: ${page.name} -- loads, has Branson title, site-header present, no Uncaught JS errors`, async ({ page: pw }) => {
    const consoleErrors = [];
    pw.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Uncaught')) {
        consoleErrors.push(msg.text());
      }
    });

    await pw.goto(page.path);
    await pw.waitForLoadState('domcontentloaded');

    // Title check
    const title = await pw.title();
    expect(title, `Page ${page.name} title should contain "Branson"`).toContain('Branson');

    // site.js injects <header class="site-header"> dynamically -- wait for it
    await expect(pw.locator('.site-header'), `${page.name}: site-header should be injected by site.js`).toBeVisible({ timeout: 5000 });

    // No uncaught JS errors
    // Small settle time for JS execution
    await pw.waitForTimeout(1000);
    expect(consoleErrors, `${page.name}: should have no Uncaught JS errors`).toHaveLength(0);
  });
}

test('smoke: admin.html -- auth gate is present (not editor)', async ({ page: pw }) => {
  await pw.goto('/admin.html');
  await pw.waitForLoadState('domcontentloaded');

  // Should show #passcode-section (the auth container)
  // Either #auth-register or #auth-signin will be visible inside it
  const passcodeSection = pw.locator('#passcode-section');
  await expect(passcodeSection, 'admin.html: #passcode-section should be present').toBeVisible({ timeout: 5000 });

  // Verify we are NOT seeing the editor section (should not be authenticated)
  // The editor is hidden behind authentication -- verify the auth register OR signin is visible
  const authRegister = pw.locator('#auth-register');
  const authSignin = pw.locator('#auth-signin');

  // At least one of register/signin must be displayed (not display:none)
  const registerDisplayed = await authRegister.evaluate(el => el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none').catch(() => false);
  const signinDisplayed = await authSignin.evaluate(el => el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none').catch(() => false);

  expect(
    registerDisplayed || signinDisplayed,
    'admin.html: #auth-register or #auth-signin should be visible (auth gate active)'
  ).toBe(true);
});
