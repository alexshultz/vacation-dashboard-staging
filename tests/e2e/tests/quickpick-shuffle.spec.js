// @ts-check
const { test, expect } = require('@playwright/test');

test('quick-pick: deck order differs between page loads (shuffle)', async ({ page }) => {
  async function loadDeckTitles() {
    // Wait for at least 3 deck cards to be rendered
    await page.waitForFunction(
      () => document.querySelectorAll('#deck-stage .deck-card').length >= 3,
      { timeout: 10000 }
    );
    return page.$$eval('#deck-stage .deck-card h3', els => els.map(el => el.textContent.trim()));
  }

  await page.goto('/quick-pick.html');
  const loadOne = await loadDeckTitles();

  if (loadOne.length < 3) {
    test.skip(true, `Deck has fewer than 3 cards (got ${loadOne.length}); shuffle test skipped`);
    return;
  }

  await page.reload();
  const loadTwo = await loadDeckTitles();

  expect(
    loadOne.join('|'),
    'Deck order should differ between page loads — shuffle is not working'
  ).not.toEqual(loadTwo.join('|'));
});
