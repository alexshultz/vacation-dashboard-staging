// @ts-check
const { test, expect } = require('@playwright/test');

// Verifies that dispatching { type: 'commit' } from the Quick Pick deck persists
// the commitment to Supabase so it survives a hard reload.

const TEST_USER    = 'alex';
const TEST_USER_DB = 'Alex';

let committedSlug = null;

test.describe('quick-pick commit Supabase persistence', () => {
  test.beforeEach(async ({ page }) => {
    committedSlug = null;
    await page.addInitScript(u => localStorage.setItem('bd-user', u), TEST_USER);
    await page.goto('/');
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    // Wipe all picks for the test user so the deck starts completely fresh
    await page.evaluate(async function(user) {
      if (window.BD_SUPABASE) {
        await window.BD_SUPABASE.from('picks').delete().eq('user_id', user);
      }
    }, TEST_USER_DB);
    await page.waitForTimeout(800);
    // Reload so Supabase hydration starts from a clean slate
    await page.reload();
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test.afterEach(async ({ page }) => {
    try {
      if (committedSlug) {
        await page.evaluate(async function(args) {
          if (window.BD_SUPABASE) {
            await window.BD_SUPABASE.from('picks').delete()
              .eq('user_id', args.user)
              .eq('slug', args.slug);
          }
        }, { user: TEST_USER_DB, slug: committedSlug });
      }
    } catch (_) {}
  });

  test('commit from Quick Pick deck survives page reload', async ({ page }) => {
    // Navigate to Activities page via the desktop nav
    await page.click('nav[aria-label="Primary"] button:has-text("Activities")');
    await page.waitForSelector('.page-hero', { timeout: 10000 });

    // Switch to QuickPick mode
    await page.click('button[role="tab"]:has-text("QuickPick")');
    await page.waitForSelector('.deck-card.top', { timeout: 10000 });

    // Capture the top card's activity name, then resolve its slug from BD_ACTIVITIES
    const topName = await page.locator('.deck-card.top h3').textContent();
    committedSlug = await page.evaluate(function(name) {
      var act = window.BD_ACTIVITIES.find(function(a) { return a.name === name; });
      return act ? act.id : null;
    }, topName);
    expect(committedSlug).not.toBeNull();

    // Click the deck commit button (dispatches { type: 'commit' } then decide('right'))
    await page.click('.deck-btn--commit');
    await page.waitForTimeout(4000); // allow Supabase upsert to settle

    // Hard reload — Supabase re-fetches picks from scratch
    await page.reload();
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Query Supabase directly to verify the row persisted
    const result = await page.evaluate(async function(args) {
      if (!window.BD_SUPABASE) return null;
      var res = await window.BD_SUPABASE.from('picks')
        .select('state')
        .eq('user_id', args.user)
        .eq('slug', args.slug)
        .single();
      return res.data;
    }, { user: TEST_USER_DB, slug: committedSlug });

    expect(result).not.toBeNull();
    expect(['committing', 'both']).toContain(result.state);
  });
});
