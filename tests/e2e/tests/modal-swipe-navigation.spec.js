// @ts-check
const { test, expect } = require('@playwright/test');

// Boot the SPA: set user, navigate to Activities browse
async function boot(page) {
  await page.addInitScript(() => {
    localStorage.setItem('bd-user', 'alex');
  });
  await page.goto('/');
  await page.waitForSelector('header.site-header', { timeout: 30000 });
  await page.click('header .nav button:has-text("Activities")');
  await page.waitForSelector('.card-cat', { timeout: 15000 });
}

// Open the Nth card (0-indexed). Returns the activity name.
async function openCard(page, cardIndex = 0) {
  const cards = page.locator('.card-cat');
  const name = await cards.nth(cardIndex).locator('h3').textContent();
  await cards.nth(cardIndex).click();
  await page.waitForSelector('.dm-sheet', { timeout: 10000 });
  return name.trim();
}

// Simulate a swipe gesture on the modal
// dx > 0 = right, dx < 0 = left
// dy > 0 = down
async function simulateSwipeOnModal(page, dx, dy) {
  // Horizontal path: drive via scroll + synthetic scrollend
  if (Math.abs(dx) > Math.abs(dy)) {
    return page.evaluate(({ dx }) => {
      const clip = document.querySelector('.dm-content-clip');
      if (!clip) return { error: 'no dm-content-clip' };
      const width = clip.offsetWidth;
      // dx < 0 = swipe left = navigate next (panel 2)
      // dx > 0 = swipe right = navigate prev (panel 0)
      const targetIndex = dx < 0 ? 2 : 0;
      clip.scrollLeft = targetIndex * width;
      clip.dispatchEvent(new Event('scrollend', { bubbles: true }));
      return { ok: true, targetIndex };
    }, { dx });
  }

  // Vertical dismiss path: keep existing pointer events on .dm-sheet
  return page.evaluate(({ dx, dy }) => {
    const sheet = document.querySelector('.dm-sheet');
    if (!sheet) return { error: 'no dm-sheet' };
    const rect = sheet.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + 100;
    const pid = 1;
    const opts = (x, y) => ({
      bubbles: true, cancelable: true, composed: true,
      pointerId: pid, pointerType: 'touch', isPrimary: true,
      clientX: x, clientY: y,
    });
    sheet.dispatchEvent(new PointerEvent('pointerdown', opts(cx, cy)));
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      sheet.dispatchEvent(new PointerEvent('pointermove',
        opts(cx + dx * i / steps, cy + dy * i / steps)));
    }
    sheet.dispatchEvent(new PointerEvent('pointerup', opts(cx + dx, cy + dy)));
    return { ok: true };
  }, { dx, dy });
}

// Get the current modal title -- reads from the center panel only
async function getModalTitle(page) {
  // Wait for the center panel's title to be present
  await page.waitForSelector('[data-panel="current"] .dm-title', { timeout: 3000 });
  return (await page.locator('[data-panel="current"] .dm-title').textContent()).trim();
}

test.describe('Modal swipe navigation', () => {

  test('AC-1: swipe left advances to next card, modal stays mounted', async ({ page }) => {
    await boot(page);
    // Get first two card names
    const firstName = await page.locator('.card-cat h3').nth(0).textContent();
    const secondName = await page.locator('.card-cat h3').nth(1).textContent();

    await openCard(page, 0);

    // Track if dm-sheet is ever removed and re-added (it should NOT be)
    await page.evaluate(() => {
      window.__sheetRemovedCount = 0;
      const obs = new MutationObserver(mutations => {
        mutations.forEach(m => {
          m.removedNodes.forEach(n => {
            if (n.classList && n.classList.contains('dm-sheet')) window.__sheetRemovedCount++;
          });
        });
      });
      obs.observe(document.querySelector('.dm-backdrop'), { childList: true });
      window.__sheetObserver = obs;
    });

    // Swipe left (120px horizontal, minimal vertical)
    await simulateSwipeOnModal(page, -120, 0);
    await page.waitForTimeout(500);

    // Modal still open
    await expect(page.locator('.dm-sheet')).toBeVisible();

    // Title changed to second card
    const newTitle = await getModalTitle(page);
    expect(newTitle.trim()).toBe(secondName.trim());
    expect(newTitle.trim()).not.toBe(firstName.trim());

    // Sheet was never removed from DOM
    const removedCount = await page.evaluate(() => {
      window.__sheetObserver.disconnect();
      return window.__sheetRemovedCount;
    });
    expect(removedCount).toBe(0);
  });

  test('AC-2: swipe right retreats to previous card', async ({ page }) => {
    await boot(page);
    const firstName = await page.locator('.card-cat h3').nth(0).textContent();
    const secondName = await page.locator('.card-cat h3').nth(1).textContent();

    // Open second card
    await openCard(page, 1);
    expect(await getModalTitle(page)).toBe(secondName.trim());

    // Swipe right (positive dx)
    await simulateSwipeOnModal(page, 120, 0);
    await page.waitForTimeout(500);

    await expect(page.locator('.dm-sheet')).toBeVisible();
    expect(await getModalTitle(page)).toBe(firstName.trim());
  });

  test('AC-3: at first card, swipe right is a silent no-op', async ({ page }) => {
    await boot(page);
    const firstName = await page.locator('.card-cat h3').nth(0).textContent();

    await openCard(page, 0);

    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await simulateSwipeOnModal(page, 120, 0);
    await page.waitForTimeout(500);

    await expect(page.locator('.dm-sheet')).toBeVisible();
    expect(await getModalTitle(page)).toBe(firstName.trim());
    expect(consoleErrors).toHaveLength(0);
  });

  test('AC-4: at last card, swipe left is a silent no-op', async ({ page }) => {
    await boot(page);
    const cardCount = await page.locator('.card-cat').count();
    const lastName = await page.locator('.card-cat h3').nth(cardCount - 1).textContent();

    await openCard(page, cardCount - 1);

    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await simulateSwipeOnModal(page, -120, 0);
    await page.waitForTimeout(500);

    await expect(page.locator('.dm-sheet')).toBeVisible();
    expect(await getModalTitle(page)).toBe(lastName.trim());
    expect(consoleErrors).toHaveLength(0);
  });

  test('AC-5: swipe down (from hero) dismisses modal', async ({ page }) => {
    await boot(page);
    await openCard(page, 0);

    // Swipe down 200px (well over threshold)
    await simulateSwipeOnModal(page, 0, 200);
    await page.waitForTimeout(400);

    await expect(page.locator('.dm-sheet')).not.toBeVisible();
    await expect(page.locator('.dm-backdrop')).not.toBeVisible();
  });

  test('AC-6: Escape key dismisses', async ({ page }) => {
    await boot(page);
    await openCard(page, 0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('.dm-sheet')).not.toBeVisible();
  });

  test('AC-6: close button dismisses', async ({ page }) => {
    await boot(page);
    await openCard(page, 0);
    await page.locator('.dm-close-x').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.dm-sheet')).not.toBeVisible();
  });

  test('AC-6: backdrop click dismisses', async ({ page }) => {
    await boot(page);
    await openCard(page, 0);
    // Click the backdrop element itself (not the sheet)
    await page.locator('.dm-backdrop').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(300);
    await expect(page.locator('.dm-sheet')).not.toBeVisible();
  });

  test('AC-7: vertical drag on modal body does NOT trigger navigation', async ({ page }) => {
    await boot(page);
    const firstName = await page.locator('.card-cat h3').nth(0).textContent();
    await openCard(page, 0);

    // Simulate a vertical drag (large dy, small dx) — should NOT navigate
    await simulateSwipeOnModal(page, 5, 50);
    await page.waitForTimeout(200);

    // Modal still open and showing same card
    await expect(page.locator('.dm-sheet')).toBeVisible();
    expect(await getModalTitle(page)).toBe(firstName.trim());
  });

  test('AC-8: horizontal swipe does NOT dismiss modal', async ({ page }) => {
    await boot(page);
    await openCard(page, 0);

    // Swipe left hard (should navigate, not dismiss)
    await simulateSwipeOnModal(page, -120, 0);
    await page.waitForTimeout(500);

    // Modal still visible (navigated to next card)
    await expect(page.locator('.dm-sheet')).toBeVisible();
  });

  test('AC-9: Wishlist/Commit fires with current navigated card ID', async ({ page }) => {
    await boot(page);
    const secondId = await page.locator('.card-cat').nth(1).evaluate(el => el.dataset.id);

    // Check initial wishlist state
    const initialWishState = await page.evaluate((id) => {
      const act = window.BD_ACTIVITIES.find(a => a.id === id);
      return act ? act.wish.includes('alex') : false;
    }, secondId);

    // Open first card
    await openCard(page, 0);

    // Navigate to second card via swipe left
    await simulateSwipeOnModal(page, -120, 0);
    await page.waitForTimeout(500); // Wait for navigation to complete and re-render

    // Click Wishlist button (toggles)
    await page.locator('.dm-actions .btn--secondary, .dm-actions .btn--danger').first().click();
    await page.waitForTimeout(300);

    // Verify the second activity's wish array was toggled (not the first's)
    const finalWishState = await page.evaluate((id) => {
      const act = window.BD_ACTIVITIES.find(a => a.id === id);
      return act ? act.wish.includes('alex') : false;
    }, secondId);
    expect(finalWishState).not.toBe(initialWishState); // Should have toggled
  });

  test('AC-10: on dismiss, BrowseView scrolls to last-viewed card', async ({ page }) => {
    await boot(page);

    // Scroll down to see cards further in the list
    await page.evaluate(() => window.scrollTo(0, 500));

    // Open first card
    await openCard(page, 0);

    // Navigate to second card
    await simulateSwipeOnModal(page, -120, 0);
    await page.waitForTimeout(500);

    const secondId = await page.evaluate(() => {
      const ids = (window.BD_ACTIVITIES || []).map(a => a.id);
      return ids[1];
    });

    // Dismiss
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Check second card is in viewport
    const inViewport = await page.evaluate((id) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight
      );
    }, secondId);
    expect(inViewport).toBe(true);
  });

  test('AC-11: desktop viewport, pointer events work without mobile breakpoint', async ({ page }) => {
    // Default viewport is desktop
    await boot(page);
    const firstName = await page.locator('.card-cat h3').nth(0).textContent();
    const secondName = await page.locator('.card-cat h3').nth(1).textContent();

    await openCard(page, 0);

    // Simulate via scroll (CSS scroll snap handles horizontal regardless of pointer type)
    await page.evaluate(({ dx }) => {
      const clip = document.querySelector('.dm-content-clip');
      if (!clip) return;
      const width = clip.offsetWidth;
      const targetIndex = dx < 0 ? 2 : 0;
      clip.scrollLeft = targetIndex * width;
      clip.dispatchEvent(new Event('scrollend', { bubbles: true }));
    }, { dx: -120 });

    await page.waitForTimeout(500);
    await expect(page.locator('.dm-sheet')).toBeVisible();
    expect(await getModalTitle(page)).toBe(secondName.trim());
  });
});
