# NEXT-SESSION handoff -- 2026-05-12

## Current state

**Production:** https://vacation.creeperbomb.com/ -- LIVE, commit 0d13c62
**Staging:** https://vacation-dev.creeperbomb.com/ -- in sync with production
**Playwright suite:** 75/75 passing (13 spec files)
**Vault HEAD:** c43594a (uncommitted changes pending -- see below)

**Pre-launch checklist:**
- [x] help.html -- COMPLETE (fetches help.json, all 5+ required sections present, profile.html has entry-point link)
- [ ] tester pass -- Ashlyn, Jordan, Mycah (not yet started)
- [ ] send family the link
- [x] admin form fully tested (75/75 Playwright)

---

## Uncommitted vault changes

The vault has uncommitted changes (git status shows M on 4 files). These correspond to the last two features from the 2026-05-11 session that were applied after c43594a but before production deploy:

- `web/admin.html` -- attendees-no-scroll fix (removed max-height/overflow-y) + save-changes-merge-attendee-save
- `tests/e2e/tests/admin-ux-improvements.spec.js` -- updated assertions for above
- `docs/PROJECT_LOG.md` -- session log entry for 2026-05-11 full sprint
- `docs/NEXT-SESSION.md` -- this file

**Action required:** commit these changes to vault before starting new work.

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"
git add -A && git commit -m "docs: session log 2026-05-11 admin sprint; fix attendees-no-scroll + save-merge handback"
```

---

## Open items

### Pre-launch (do in order before May 13 link send)

**1. Pre-launch data cleanup sequence** (Alex does steps 1, 3, 4, 5 -- step 2 is a Supabase SQL run)
1. Fix "Bug" -> "Buggy" in schedule.json RSVP arrays (already done in 2afd30d -- verify)
2. Run `data/schedule-event-types-migration.sql` in Supabase SQL editor
3. Alex sets event_type on all 28 events via admin.html
4. Alex assigns attendees to all commitment events via admin.html
5. Clear sample RSVP data (backup event_rsvps table first)

**2. Tester pass**
Send staging link to Ashlyn, Jordan, and Mycah. Collect feedback. Report completions in #branson-2026 as they come in. (Removed from hard gate per 2026-05-09 decision, but still desirable before link send.)

**3. AC-9 label format (minor, Alex decides)**
Event selector labels in production use em dash (`—`): `May 13 — Silver Dollar City`.
Original spec said `--` (double hyphen). Tests match actual behavior (em dash).
One-line fix if Alex wants `--`. Decide and close.

### Post-launch / low priority

- Coordinator stats view (Panel A + Panel B) -- ADRs 14-16 approved 2026-05-09, implementation queued
- `buildTabs()` and `BOTTOM_TABS` dead code in site.js -- flagged WARN by cold reviewer 2026-05-10, safe to remove
- DESIGN.md dark mode token documentation (post-launch doc task, non-blocking)

---

## Key technical facts

- **Playwright spec path:** all specs at `tests/e2e/tests/<name>.spec.js` -- one level above is silently excluded
- **Spec count:** 75 tests / 13 files as of session end 2026-05-11 -- verify with `npx playwright test --list` before claiming a number
- **Drum picker architecture:** `data-drum-idx` attribute is ground truth; scrollTop is visual-only. `getDrumSelectedIndex` reads the attribute.
- **AC-9 em dash:** event selector labels use `—` (U+2014), not `--`. Tests match this.
- **help.html:** runtime-fetched from help.json (DO NOT hand-edit sections in help.html; edit help.json only)
- **deploy.sh:** staging first, production only on explicit "ship it" from Alex
- **Frozen:** generate_dashboard.py, generate_attractions.py -- never run. help.json sections -- never hand-edit HTML directly.
- **Supabase Anon RLS:** anon users cannot write to schedule_events (policy removed 2026-05-09)

---

*Written: 2026-05-12*
