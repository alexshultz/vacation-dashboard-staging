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
  const passcodeSection = pw.locator('#passcode-section');
  await expect(passcodeSection, 'admin.html: #passcode-section should be present').toBeVisible({ timeout: 5000 });

  // #auth-email-login starts display:none and is shown after async Supabase session check
  const authEmailLogin = pw.locator('#auth-email-login');
  await expect(
    authEmailLogin,
    'admin.html: #auth-email-login should be visible (auth gate active)'
  ).toBeVisible({ timeout: 8000 });
});
