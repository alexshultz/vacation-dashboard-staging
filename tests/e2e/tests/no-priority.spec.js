// @ts-check
const { test, expect } = require('@playwright/test');

// These tests assert that the word "priority" does not appear as visible text
// on any family-facing page that renders event data.
// They must FAIL before the priority removal is applied, and PASS after.

const EVENT_PAGES = [
  { path: '/', name: 'index' },
  { path: '/event-timeline.html', name: 'event-timeline' },
];

for (const pg of EVENT_PAGES) {
  test(`no-priority: ${pg.name} -- "priority" does not appear in visible body text`, async ({ page: pw }) => {
    await pw.goto(pg.path);
    // Wait for event cards to render before checking
    await pw.waitForSelector('details.event-card', { timeout: 10000 });
    await expect(pw.locator('body')).not.toContainText('priority', { ignoreCase: true });
  });
}
