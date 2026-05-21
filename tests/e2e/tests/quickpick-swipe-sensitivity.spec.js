// @ts-check
const { test, expect } = require('@playwright/test');

const PROGRESS_KEY = 'vacdash:swipe:progress';

async function waitForDeck(page) {
  await page.waitForFunction(
    () => document.querySelectorAll('#deck-stage .deck-card').length >= 1,
    { timeout: 10000 }
  );
}

/**
 * Dispatch PointerEvents directly on the top card element.
 * Playwright's page.mouse API does not reliably deliver pointerup after
 * setPointerCapture in headless Chromium, so we drive events from JS.
 */
async function simulateSwipe(page, deltaX, deltaY) {
  return page.evaluate(({ dx, dy }) => {
    const card = document.querySelector(
      '#deck-stage .deck-card:not(.stack-2):not(.stack-3)'
    );
    if (!card) return { error: 'no top card' };

    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const pid = 1;

    const opts = (x, y) => ({
      bubbles: true, cancelable: true, composed: true,
      pointerId: pid, pointerType: 'mouse', isPrimary: true,
      clientX: x, clientY: y,
    });

    card.dispatchEvent(new PointerEvent('pointerdown', opts(cx, cy)));

    // Fire several intermediate pointermove events so curX/curY accumulate
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      card.dispatchEvent(new PointerEvent('pointermove',
        opts(cx + dx * i / steps, cy + dy * i / steps)));
    }

    card.dispatchEvent(new PointerEvent('pointerup', opts(cx + dx, cy + dy)));

    return { slug: card.dataset.slug, width: card.offsetWidth };
  }, { dx: deltaX, dy: deltaY });
}

async function getSeenSlugs(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
      const obj = JSON.parse(raw);
      return Array.isArray(obj.seen) ? obj.seen : [];
    } catch (e) { return []; }
  }, PROGRESS_KEY);
}

// Test A -- Tap guard: negligible horizontal movement (<10 px) must snap back
test('quick-pick swipe: tap (<10px horizontal) snaps back, does not commit', async ({ page }) => {
  await page.goto('/quick-pick.html');
  await waitForDeck(page);

  const result = await simulateSwipe(page, 5, 0);
  expect(result.error, 'deck must have a top card').toBeUndefined();

  // Allow snap-back animation (260ms) to settle
  await page.waitForTimeout(400);

  const seen = await getSeenSlugs(page);
  expect(seen, `"${result.slug}" must NOT be committed after a 5px tap`).not.toContain(result.slug);

  const stillThere = await page.evaluate((slug) =>
    !!document.querySelector(`#deck-stage .deck-card[data-slug="${slug}"]`)
  , result.slug);
  expect(stillThere, 'card must remain in deck after tap').toBe(true);
});

// Test B -- Diagonal gesture guard: vertical travel > horizontal travel must snap back.
// deltaX=110 intentionally exceeds the old hardcoded COMMIT_THRESHOLD of 100, so
// the old code commits while the new diagonal guard snaps back.
test('quick-pick swipe: diagonal drag (deltaX=110, deltaY=130) snaps back, does not commit', async ({ page }) => {
  await page.goto('/quick-pick.html');
  await waitForDeck(page);

  const result = await simulateSwipe(page, 80, 130);
  expect(result.error, 'deck must have a top card').toBeUndefined();

  await page.waitForTimeout(400);

  const seen = await getSeenSlugs(page);
  expect(seen, `"${result.slug}" must NOT be committed after diagonal drag (|Y|>|X|)`).not.toContain(result.slug);

  const stillThere = await page.evaluate((slug) =>
    !!document.querySelector(`#deck-stage .deck-card[data-slug="${slug}"]`)
  , result.slug);
  expect(stillThere, 'card must remain in deck after diagonal drag').toBe(true);
});

// Test D -- Near-vertical gesture: deltaX=80, deltaY=200 must snap back (X < 1.5 * Y).
test('near-vertical gesture (deltaX=80, deltaY=200) snaps back and does not commit', async ({ page }) => {
  await page.goto('/quick-pick.html');
  await waitForDeck(page);

  const result = await simulateSwipe(page, 80, 200);
  expect(result.error, 'deck must have a top card').toBeUndefined();

  await page.waitForTimeout(400);

  const seen = await getSeenSlugs(page);
  expect(seen, `"${result.slug}" must NOT be committed after near-vertical gesture (deltaX=80, deltaY=200)`).not.toContain(result.slug);

  const stillThere = await page.evaluate((slug) =>
    !!document.querySelector(`#deck-stage .deck-card[data-slug="${slug}"]`)
  , result.slug);
  expect(stillThere, 'card must remain in deck after near-vertical gesture').toBe(true);
});

// Test C -- Deliberate horizontal swipe: 50% of card width must commit.
// Uses card.offsetWidth so the assertion scales correctly with any card size.
test('quick-pick swipe: deliberate horizontal drag (50% of card width) commits', async ({ page }) => {
  await page.goto('/quick-pick.html');
  await waitForDeck(page);

  // Read card width first so we can compute deltaX
  const preInfo = await page.evaluate(() => {
    const card = document.querySelector(
      '#deck-stage .deck-card:not(.stack-2):not(.stack-3)'
    );
    return card ? { slug: card.dataset.slug, width: card.offsetWidth } : null;
  });
  expect(preInfo, 'deck must have a top card').not.toBeNull();
  expect(preInfo.width, 'card must have a positive rendered width').toBeGreaterThan(0);

  const deltaX = Math.round(preInfo.width * 0.50);
  const result = await simulateSwipe(page, deltaX, 0);
  expect(result.error, 'swipe helper must find a card').toBeUndefined();

  // Wait for flyOff animation (280ms) + deck re-render
  await page.waitForTimeout(700);

  const seen = await getSeenSlugs(page);
  expect(
    seen,
    `"${preInfo.slug}" must be committed after ${deltaX}px horizontal drag (50% of ${preInfo.width}px card)`
  ).toContain(preInfo.slug);
});
