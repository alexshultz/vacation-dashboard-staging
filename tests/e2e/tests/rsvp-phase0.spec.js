// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';

test('Phase 0 A -- event_rsvps table reachability via anon GET', async ({ request }) => {
  const response = await request.get(
    `${SUPABASE_URL}/rest/v1/event_rsvps`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  expect(response.status()).toBe(200);
});

test('Phase 0 B -- locked_at column exists on schedule_events', async ({ request }) => {
  const response = await request.get(
    `${SUPABASE_URL}/rest/v1/schedule_events?select=locked_at&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  const body = await response.json();
  // Supabase returns {"code":"42703",...} when a column does not exist
  expect(body).not.toHaveProperty('code', '42703');
  expect(body).not.toMatchObject({ message: expect.stringContaining('does not exist') });
});

test('Phase 0 C -- admin-overlay.js payload includes undecided, notInterested, noResponse', async () => {
  const filePath = path.resolve(__dirname, '../../../web/js/admin-overlay.js');
  const content = fs.readFileSync(filePath, 'utf8');
  expect(content).toContain('undecided');
  expect(content).toContain('notInterested');
  expect(content).toContain('noResponse');
});
