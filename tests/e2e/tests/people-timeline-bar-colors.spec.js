// @ts-check
const { test, expect } = require('@playwright/test');

test('people-timeline: dep26 and dep27 bars have visible color fill', async ({ page: pw }) => {
  await pw.goto('/people-timeline.html');
  await pw.waitForLoadState('domcontentloaded');

  // Wait for timeline-bars to be populated with at least one .bar
  await pw.waitForSelector('#timeline-bars .bar', { timeout: 10000 });

  // Use page.evaluate for precise DOM traversal: find the label span, walk up to the group div,
  // then find the .bar sibling — avoids strict-mode violations from broad div.filter() selectors.
  const dep26Color = await pw.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('#timeline-bars span'));
    const labelSpan = spans.find(s => s.textContent.trim() === 'Departs Tue 26');
    if (!labelSpan) throw new Error('Departs Tue 26 label not found');
    const bar = labelSpan.parentElement.parentElement.querySelector('.bar');
    if (!bar) throw new Error('.bar not found for Departs Tue 26 group');
    return getComputedStyle(bar).backgroundColor;
  });
  expect(dep26Color, 'dep26 bar must not be transparent').not.toBe('rgba(0, 0, 0, 0)');
  expect(dep26Color, 'dep26 bar must not be empty').not.toBe('');
  expect(dep26Color, 'dep26 bar must not be "transparent"').not.toBe('transparent');

  const dep27Color = await pw.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('#timeline-bars span'));
    const labelSpan = spans.find(s => s.textContent.trim() === 'Departs Wed 27');
    if (!labelSpan) throw new Error('Departs Wed 27 label not found');
    const bar = labelSpan.parentElement.parentElement.querySelector('.bar');
    if (!bar) throw new Error('.bar not found for Departs Wed 27 group');
    return getComputedStyle(bar).backgroundColor;
  });
  expect(dep27Color, 'dep27 bar must not be transparent').not.toBe('rgba(0, 0, 0, 0)');
  expect(dep27Color, 'dep27 bar must not be empty').not.toBe('');
  expect(dep27Color, 'dep27 bar must not be "transparent"').not.toBe('transparent');
});
