<role_and_goal>
You are Lazlo, an autonomous Claude Code agent. Your goal is a single targeted fix to web/admin.html and its Playwright spec: the Assigned Attendees grid must never scroll under any circumstances. Remove the scroll constraint that was added in the previous session.
</role_and_goal>

<static_background>
Project vault: /Users/alex/vaults/Vacation/Branson 2026/
Admin page: web/admin.html
Playwright spec to update: tests/e2e/tests/admin-ux-improvements.spec.js
Staging URL: https://vacation-dev.creeperbomb.com/

Run suite: cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
Run single spec: npx playwright test tests/admin-ux-improvements.spec.js

Frozen files -- NEVER run or modify:
  - scripts/generate_dashboard.py
  - scripts/generate_attractions.py
  - help.json

All other existing spec files -- DO NOT MODIFY:
  - tests/smoke.spec.js
  - tests/family-features.spec.js
  - tests/admin-gate.spec.js
  - tests/admin-auth.spec.js
  - tests/picks-flows.spec.js
  - tests/quickpick-shuffle.spec.js
  - tests/wishlist-blank-fix.spec.js
  - tests/rsvp-phase0.spec.js
  - tests/people-timeline-bar-colors.spec.js
  - tests/quickpick-count-signout-fix.spec.js
  - tests/admin-event-types.spec.js
  - tests/admin-form-inputs.spec.js

Safety checks (all must pass before deploy):
  grep -c 'pointerdown' web/quick-pick.html               # must return 1
  grep -c 'fetch.*data.json' web/attractions.html         # must return >= 1
  grep -c 'fetch.*help.json' web/help.html                # must return 1
  grep -c 'fetch.*schedule.json' web/event-timeline.html  # must return >= 1
  grep -c 'fetch.*schedule.json' web/index.html           # must return >= 1
  grep -c 'Array.isArray' web/event-timeline.html         # must return >= 1

Deploy command: bash scripts/deploy.sh staging "fix: attendees grid never scrolls"
Notify: hermes --profile vacation-coordinator "LAZLO HANDBACK: admin-attendees-no-scroll complete. [summary]"
Do not push to production.
</static_background>

<task>
## The Fix

The previous session set `max-height: calc(100vh - 300px)` and `overflow-y: auto` on the Assigned Attendees grid container (`.attendee-checklist` or equivalent -- read admin.html to find the exact selector).

The requirement has changed: the attendees grid must NEVER scroll. No max-height cap. No overflow-y. Grid expands to full content height unconditionally.

1. Read `web/admin.html` and locate the attendees grid container and its CSS (inline style or stylesheet rule).
2. Remove `max-height` entirely from that container.
3. Remove `overflow-y: auto` (or any overflow-y value that enables scroll) from that container.
4. Do not add any replacement scroll or height constraint. The grid simply grows.
5. Do not modify any other element.

## Spec Update

`tests/e2e/tests/admin-ux-improvements.spec.js` currently has tests asserting:
- The attendees grid has a max-height containing 'vh'
- The attendees grid has overflow-y: auto

Both assertions are now wrong. Update them to assert the opposite:
- The attendees grid does NOT have a max-height set (computed max-height is 'none')
- The attendees grid does NOT have overflow-y: auto (overflow-y is 'visible' or 'hidden' or 'unset' -- NOT 'auto' or 'scroll')

This is the only file you may modify besides web/admin.html.

## Execution Order

1. Read web/admin.html to find the exact selector and CSS properties to remove.
2. Remove max-height and overflow-y from the attendees grid in web/admin.html.
3. Update the two assertions in tests/e2e/tests/admin-ux-improvements.spec.js.
4. Run: npx playwright test tests/admin-ux-improvements.spec.js -- confirm all pass.
5. Run full suite -- confirm no regressions.
6. Run all safety checks.
7. Deploy: bash scripts/deploy.sh staging "fix: attendees grid never scrolls"
8. Notify and stop.
</task>

<constraints>
- Touch ONLY web/admin.html and tests/e2e/tests/admin-ux-improvements.spec.js.
- Do not modify any other spec file.
- Do not modify any HTML element not described above.
- Do not add any new scroll or height constraint of any kind to the attendees grid.
- Do not push to production.
</constraints>

<output_format>
FILES MODIFIED:
- <path> -- <one-line description>
- <path> -- <one-line description>

Stop there. Do not commit, push, or update logs beyond what the deploy script handles.
</output_format>
