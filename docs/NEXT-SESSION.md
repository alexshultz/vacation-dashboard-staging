# NEXT-SESSION.md
Updated: 2026-05-06 (post-session handoff)

This document is the canonical pick-up-where-we-left-off guide for the start of each new session.
Read this first. Trust nothing else from before this date.

---

## State of the World Right Now

**Production:** https://vacation.creeperbomb.com -- commit `d968c27` -- LIVE and fully green (34/34 Playwright tests pass)
**Staging:** https://vacation-dev.creeperbomb.com -- commit `f997618` -- in sync with production

Both are stable. No pending fixes. No broken tests. No outstanding debt from this session.

---

## What We Did This Session (2026-05-05/06) -- Kept and Shipped

All of these are committed to vault, deployed to staging, and promoted to production.

### Features / Fixes Shipped to Production
1. **Quick Pick filter removal** -- removed filter button, filter popover, all chips, Back to Browse link, dead CSS, dead JS block. Deck-empty copy updated. (`05db92d`)
2. **Event timeline admin button visibility** -- moved `.admin-edit-btn` inside `<summary>` so it shows when `<details>` card is collapsed. Fixes Playwright test. (`b7e9c34`)
3. **Wishlist runtime fetch** -- replaced 2800-line hardcoded `ATTRACTIONS_DATA` snapshot with `fetch('data.json')` at runtime. Wishlist no longer renders blank. (`67416b7`)
4. **Picks upsert fix (three bugs)** -- (a) added `?on_conflict=user_id,slug` to Supabase upsert URL, (b) added `window.picks = picks` export so filter guard works, (c) suppressed redundant 409 error banner when localStorage write succeeded. (`a7da0b5`)
5. **Quick Pick shuffle** -- Fisher-Yates shuffle on `ATTRACTIONS` array after fetch. New random order every page load. (`8bdebf3`)
6. **Timeline delete button** -- admin overlay now has a Remove Event button. `window.confirm()` guard. Hard Supabase DELETE. Button disabled during request. (`e7e3196`)
7. **Admin overlay confirm deadlock fix** -- wrapped delete handler in `setTimeout(..., 0)` so Playwright's dialog interceptor can capture `window.confirm()` without deadlock. Required seeding Supabase `schedule_events` table (was empty). (`38dd41e`)

### Infrastructure Added
8. **`scripts/deploy.sh`** -- full deploy script (staging or production). Owns: safety checks, export_data.py, rsync, CNAME verify, path fix, cache bust, git commit + push. Usage: `bash scripts/deploy.sh staging "description"` or `production "description"`.
9. **`scripts/lazlo.sh`** -- fires Lazlo on a brief. Usage: `bash scripts/lazlo.sh run <brief-name>` or `review <brief-name>`. Validates brief size (stub guard). Writes output to `/tmp/lazlo-<name>.json`.
10. **`scripts/lazlo-check.sh`** -- validates Lazlo output JSON. Prints PASS/FAIL + result. Usage: `bash scripts/lazlo-check.sh <brief-name>`.
11. **`scripts/test.sh`** -- runs Playwright E2E suite. Usage: `bash scripts/test.sh` (full) or `bash scripts/test.sh <spec-name>` (single spec).
12. **`scripts/safety-check.sh`** -- runs all 6 pre-deploy safety checks standalone. Called by deploy.sh. Also usable before any Lazlo commit.
13. **`scripts/commit.sh`** -- vault git commit with correct email. Usage: `bash scripts/commit.sh "message"`.

---

## What We Decided NOT to Do (and Why)

| Decision | Reason |
|---|---|
| **Chip color system** | Council CAVEAT 2026-05-04: 8 unresolved design questions. Chip strip replaced by search bar anyway -- chip system is now irrelevant. |
| **Trail v2 Lodge redesign** | Alex: "not ready to do this yet." PARKED. Design system remains LOCKED. Handoff docs at vault root when ready. |
| **Soft-delete for timeline events** | Alex approved hard DELETE + `window.confirm()` guard. No archive/undo pattern. Simple and sufficient. |
| **DOM-based confirm dialog** | Kept native `window.confirm()`. Playwright's `page.waitForEvent('dialog')` requires a native dialog -- DOM confirm would break the test contract. |
| **Supabase Q14a unification** | Two inconsistent admin gates (site.js localStorage check vs Supabase session) remain as documented interim state (ADR-012). Post-launch cleanup. |
| **cards.js extraction** | `renderCard()` duplication across index.html and event-timeline.html not yet extracted to a shared module. Deferred sprint. |
| **Mom screen (mom.html)** | Scoped and understood, not built yet. See deferred items. |

---

## What We Changed (Notable Decisions Reversed or Updated)

| Change | Previous State | New State |
|---|---|---|
| **Deploy process** | Hand-typed 8-step bash block every time | `bash scripts/deploy.sh staging/production "desc"` -- one call |
| **Lazlo invocation** | Hand-typed 6-line bash block 16+ times | `bash scripts/lazlo.sh run/review <brief-name>` |
| **Safety checks** | Inlined in deploy.sh AND hand-run separately | Centralized in `safety-check.sh`, called by deploy.sh |
| **CNAME handling** | Blindly overwritten with echo (introduced typo) | `deploy.sh` reads, compares, only writes if wrong |
| **Playwright** | Ran by hand with long path | `bash scripts/test.sh` |
| **PM role boundary** | PM was pre-diagnosing root cause and prescribing fixes | PM gives problem + constraints only. Lazlo owns engineering. |
| **TDD** | Optional / inconsistent | Mandatory for every fix. Failing test before fix, always. |

---

## What We Have Left to Do (Pre-Launch Checklist)

Launch target: May 13, 2026 -- https://vacation.creeperbomb.com

### Hard Gates (must complete before May 13)

- [ ] **help.html entry-point** -- a "?" or "Help" link added to profile.html and/or index.html pointing to help.html. The link was added to profile.html (`ea7cfcb`) but needs verification it is actually visible and tapping it opens help.html correctly. Check live on staging before marking done.
- [ ] **help.html content** -- verify the page has all 5 required sections: "What is this", "Setting your name", "Browsing and wishlisting", "Quick Pick", "Privacy". Read `web/help.html` before assuming -- the file exists but completion status was UNKNOWN at session start and was not verified this session.
- [ ] **Supabase RLS tightening** -- write policy on `schedule_events` is currently `WITH CHECK (true)` (any authenticated user). Must be `WITH CHECK (auth.uid() = '<alex-uid>')` before family launch. Alex's UID: Supabase dashboard → Authentication → Users → click user. This is a hard blocker.

### Soft Gates (nice to have, not blocking)

- [ ] Tester pass (Ashlyn, Jordan, Mycah) -- deferred from May 13 gate (family unavailable). Still worth asking if any of them want to take a look.

---

## What We're Getting Ready to Do (Next Session Priority Order)

1. **Verify help.html** -- read `web/help.html` and check for the 5 required content sections. If any are missing or the page is a stub, run Lazlo with `.claude/help-html-task.md`. Check the entry-point link on profile.html works on mobile.
2. **Tighten Supabase RLS** -- change `schedule_events` write policy from `WITH CHECK (true)` to `WITH CHECK (auth.uid() = '<alex-uid>')`. This requires Alex's Supabase UID. If Alex has it handy, do it first thing -- it's a one-SQL-statement fix.
3. **Supabase `schedule_events` table keep-alive** -- the delete test drained one event per run. 27 events remain. If tests run repeatedly, the table may drain and the delete test will fail. Re-seed with `schedule.json` via upsert if needed (Lazlo has the recipe in the e2e-staging-fix handback).
4. **Test gap backlog** (post-launch, no urgency):
   - Attractions search bar regression test (new feature, zero Playwright coverage)
   - Cross-page flow test (wishlist on Activities → appears on Wishlist page)
   - Profile name persists to localStorage
   - Quick Pick explicitly excludes wishlisted items (window.picks fix should handle -- not yet formally tested)

---

## Currently Unfinished (Started But Not Complete)

Nothing is actively broken. However, these items were scoped or started and not yet closed:

- **Supabase RLS** -- the SQL is written in `branson-2026-project.md` lazlo skill reference. Just needs to be executed in the Supabase dashboard SQL editor. Not a lazlo task -- Alex runs it directly.
- **help.html completion** -- status genuinely unknown. The file exists (committed). Whether it has all 5 sections is unverified. Must read the file before assuming anything.
- **`docs/lessons.md`** -- Lazlo created this file (out of scope) during a session. It was not reverted -- it exists in the vault as untracked. Harmless, but it should either be incorporated into PROJECT_LOG.md or deleted. Low priority.

---

## Infrastructure Reference (For Next Agent)

### Scripts (all in `scripts/`, all chmod +x)
```bash
bash scripts/deploy.sh staging "description"     # deploy to vacation-dev.creeperbomb.com
bash scripts/deploy.sh production "description"  # deploy to vacation.creeperbomb.com (prompts Enter)
bash scripts/lazlo.sh run <brief-name>            # fire Lazlo on .claude/<brief>-task.md
bash scripts/lazlo.sh review <brief-name>         # fire Lazlo on .claude/<brief>-review.md
bash scripts/lazlo-check.sh <brief-name>          # validate Lazlo output: PASS/FAIL + result
bash scripts/test.sh                              # full Playwright suite (34 tests)
bash scripts/test.sh <spec-name>                  # single spec e.g. admin-auth
bash scripts/safety-check.sh                      # 6 pre-deploy checks standalone
bash scripts/commit.sh "message"                  # vault git commit with correct email
```

### Key Variables (all in deploy.sh)
```
VAULT          = /Users/alex/vaults/Vacation/Branson 2026
STAGING_LOCAL  = /Users/alex/code/vacation-dashboard-dev
PRODUCTION_LOCAL = /Users/alex/code/vacation-dashboard
STAGING_CNAME  = vacation-dev.creeperbomb.com
PRODUCTION_CNAME = vacation.creeperbomb.com
GIT_EMAIL      = alexshultz@users.noreply.github.com
```

### Playwright
- Suite: 8 spec files, 34 tests
- Target: https://vacation-dev.creeperbomb.com (default)
- Override: `BASE_URL=http://localhost:PORT bash scripts/test.sh`
- Credentials: `tests/e2e/.env.test` (gitignored)
- All 34 tests GREEN as of 2026-05-06

### Frozen Files (never run, never modify)
- `scripts/generate_dashboard.py` -- has `sys.exit(1)` guard, would overwrite attractions.html
- `scripts/generate_attractions.py` -- has `sys.exit(1)` guard, would overwrite attractions.html
- `web/help.html` HTML sections -- edit `help.json` only, never the HTML directly

### Parked (do not touch without explicit Alex unlock)
- Trail v2 Lodge redesign -- files at vault root, design system remains LOCKED

---

## Post-Launch Engineering Backlog

### `schedule_overrides` RLS tightening (low risk, no urgency)
`admin.html` writes to `schedule_overrides` using the anon key + a client-side token (`X-Admin-Token: override-token-3141`). The Supabase policies allow the `anon` role to insert/update/delete. This was intentional at build time (acknowledged in grill-me docs) but weaker than the `schedule_events` protection now in place.

**Fix (Lazlo task, post-launch):** Migrate `admin.html`'s `schedule_overrides` writes to use the authenticated Supabase session, then replace the three anon write policies with a single UID-locked policy matching `schedule_events` (`auth.uid() = '8d266838-80da-406d-98cb-97387394b564'`).

**Risk:** Low. Table only controls schedule display overrides -- not picks, not personal data. Safe to defer past May 13 launch.

---

## Queued Feature: Coordinator Stats View (admin.html)

**What it is:** Two panels added to `admin.html` (auth-gated -- Alex only) showing group wishlist demand and schedule commitment. Helps Alex build a conflict-free trip schedule.

**ADRs governing this feature:** ADR-014 (admin sees everything), ADR-015 (conflict-free = demand-coverage gap), ADR-016 (two independent panels, no join in v1).

### Panel A -- Wishlist Demand
- Source: `picks` table via `fetchAllWishlists()`
- Shows: each attraction slug, total pick count, ranked by popularity
- Group denominator: 26 (confirmed from RSVP name count in schedule.json)
- Includes: "I'm in" (committing) + wishlist counts combined (state distinction deferred -- fetchAllWishlists() discards state)
- Known limitation: "not interested" picks are NOT in fetchAllWishlists() -- needs a second query or function patch to surface them
- Display: attraction name | bar | "N picked"

### Panel B -- Schedule Commitment
- Source: `schedule_events` RSVP arrays (interested, undecided, notInterested, noResponse) from schedule.json at runtime
- NOTE: `event_rsvps` Supabase table (ADR-013) is the family write path for RSVPs. Panel B reads from `schedule.json` arrays which are the CURRENT authoritative RSVP state (admin-edited). These may diverge from `event_rsvps` -- clarify with Alex before brief.
- Shows: each event title, interested count, undecided count, notInterested count
- Display: event title | date | I'm in: N | Undecided: N | Not interested: N

### Known preconditions before Lazlo brief
- [ ] Confirm which RSVP source is authoritative for Panel B: `schedule.json` arrays or `event_rsvps` Supabase table (ADR-013 writes to event_rsvps, but schedule.json arrays are admin-edited -- may be out of sync)
- [ ] Confirm admin.html auth pattern covers new stats section (no second auth gate)
- [ ] fetchAllWishlists() needs to be importable/callable from admin.html (currently no picks.js reference in admin.html)
- [ ] "Not interested" signal: needs fetchAllWishlists() patch or separate query to expose this state

### Deferred (post-v1)
- Cross-reference view (Panel C): wishlist picks vs scheduled events -- blocked until catalogRef populated OR slug namespace equivalence confirmed
- State breakdown (wishlist vs committing): blocked until fetchAllWishlists() preserves state field
- Time-overlap conflict detection: blocked until startTime populated on schedule events

