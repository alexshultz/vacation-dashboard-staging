// @ts-check
const { test, expect } = require('@playwright/test');

const PICKS_KEY = 'vacdash:v1:picks';

// Minimal Supabase SDK mock: immediately fires SIGNED_IN so _activateAdmin() runs.
const SUPABASE_MOCK_JS = `
window.supabase = {
  createClient: function() {
    return {
      auth: {
        onAuthStateChange: function(cb) {
          Promise.resolve().then(function() { cb('SIGNED_IN', { user: { id: 'test-user' } }); });
          return { data: { subscription: { unsubscribe: function(){} } } };
        },
        signOut: function() { return Promise.resolve(); }
      },
      from: function() {
        return { upsert: function() { return Promise.resolve({ error: null }); } };
      }
    };
  }
};
`;

async function waitForDeckCount(page) {
  await page.waitForFunction(() => {
    const el = document.getElementById('deck-count');
    return el && el.textContent && !el.textContent.includes('Loading');
  }, { timeout: 10000 });
}

function parseDeckCount(text) {
  const m = text.match(/(\d+) remaining of (\d+)/);
  return m ? { remaining: parseInt(m[1]), total: parseInt(m[2]) } : null;
}

// Bug 1: deck count denominator must exclude wishlisted items
test('quick-pick: deck count denominator excludes wishlisted items', async ({ page }) => {
  // Baseline: load with no picks seeded
  await page.goto('/quick-pick.html');
  await waitForDeckCount(page);

  const initialText = await page.locator('#deck-count').textContent();
  const initial = parseDeckCount(initialText);
  expect(initial).not.toBeNull();

  // Get a real slug from the deck
  const slug = await page.evaluate(() => {
    const card = document.querySelector('#deck-stage .deck-card[data-slug]');
    return card ? card.dataset.slug : null;
  });
  expect(slug).toBeTruthy();

  // Seed that slug as wishlisted, then reload
  await page.evaluate(([key, s]) => {
    localStorage.setItem(key, JSON.stringify({ [s]: 'wishlist' }));
  }, [PICKS_KEY, slug]);

  await page.reload();
  await waitForDeckCount(page);

  const newText = await page.locator('#deck-count').textContent();
  const updated = parseDeckCount(newText);
  expect(updated).not.toBeNull();

  // Denominator must drop by exactly 1 (the wishlisted item is excluded)
  expect(updated.total).toBe(initial.total - 1);
});

// Bug 2: sign-out button appears on pages that don't load the Supabase CDN.
// Intercepts the dynamic CDN load and returns a mock that fires SIGNED_IN immediately.
test('quick-pick: sign-out button visible when authenticated', async ({ page }) => {
  // Return mock SDK for any request to the supabase-js CDN
  await page.route('**/@supabase/supabase-js**', async route => {
    await route.fulfill({ body: SUPABASE_MOCK_JS, contentType: 'application/javascript' });
  });

  await page.goto('/quick-pick.html');
  await page.waitForLoadState('domcontentloaded');

  // Allow time for dynamic CDN load and onAuthStateChange to fire
  const signoutBtn = page.locator('#vacdash-signout-btn');
  await expect(signoutBtn).toBeVisible({ timeout: 10000 });
});
