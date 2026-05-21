// @ts-check
const { test, expect } = require('@playwright/test');

// Search bar integration tests for the Activities Browse view.
// Covers: free-text filter, tag: prefix, clear button, empty state, chip click.

const TEST_USER = 'alex';

test.describe('activities search bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(u => localStorage.setItem('bd-user', u), TEST_USER);
    await page.goto('/');
    await page.waitForSelector('header.site-header', { timeout: 30000 });
    // Navigate to the Activities Browse tab via the desktop nav
    await page.click('nav.nav button:has-text("Activities")');
    // Wait for catalog grid to confirm BrowseView rendered
    await page.waitForSelector('.catalog-grid', { timeout: 15000 });
  });

  // TEST 1 -- Free text match
  test('free text search shows matching cards and count strip', async ({ page }) => {
    await page.fill('.search-input input', 'show');
    await expect(page.locator('.card-cat').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.result-count')).toHaveText(/\d+ of \d+ activities match show/i);
  });

  // TEST 2 -- tag: syntax
  test('tag: prefix filters by tag and count strip is not zero-match', async ({ page }) => {
    await page.fill('.search-input input', 'tag:outdoor');
    await expect(page.locator('.result-count')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.result-count')).not.toContainText('0 activities match');
  });

  // TEST 3 -- Clear button
  test('clear button resets search to full catalog count', async ({ page }) => {
    await page.fill('.search-input input', 'show');
    await page.click('.search-input__clear');
    await expect(page.locator('.search-input input')).toHaveValue('');
    await expect(page.locator('.result-count')).toHaveText(/^\d+ activities$/);
  });

  // TEST 4 -- Zero-results empty state
  test('no-match query shows empty card with at least 4 suggestion chips', async ({ page }) => {
    await page.fill('.search-input input', 'xyzzy_no_match_8675309');
    await expect(page.locator('.empty')).toBeVisible({ timeout: 5000 });
    const chipCount = await page.locator('.empty__suggest .chip').count();
    expect(chipCount).toBeGreaterThanOrEqual(4);

    await page.fill('.search-input input', 'tag:ri');
    await expect(page.locator('.empty')).toBeVisible({ timeout: 5000 });
    const chips = page.locator('.empty__suggest .chip');
    const count = await chips.count();
    let foundRi = false;
    for (let i = 0; i < count; i++) {
      const text = (await chips.nth(i).textContent() || '').toLowerCase();
      if (text.startsWith('ri')) { foundRi = true; break; }
    }
    expect(foundRi).toBe(true);
  });

  // TEST 5 -- Suggestion chip click
  test('clicking a suggestion chip sets input to tag: prefix', async ({ page }) => {
    await page.fill('.search-input input', 'xyzzy_no_match_8675309');
    await page.waitForSelector('.empty__suggest .chip', { timeout: 5000 });
    await page.locator('.empty__suggest .chip').first().click();
    await expect(page.locator('.search-input input')).toHaveValue(/^tag:/i);
    await expect(page.locator('.result-count')).toBeVisible();
  });
});
