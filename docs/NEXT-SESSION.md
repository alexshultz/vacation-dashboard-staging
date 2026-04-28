# Next Session Kickoff -- Branson '26 Dashboard
**Written:** 2026-04-27 end of session
**Production:** vacation.creeperbomb.com
**Staging:** vacation-dev.creeperbomb.com

---

## Session 1 Completed (promote confirmed)

All UI polish promoted to production. No staging debt.

---

## Priority 1: help.html -- BLOCKER

Read `web/help.html` and check for the five required content sections:
1. "What is this"
2. "Setting your name"
3. "Browsing and wishlisting"
4. "Quick Pick"
5. "Privacy"

Also check: is there an entry-point link ("?" or "Help") on the Profile page and/or index.html?

If file is a stub (empty `<main>`, nav-only), invoke lazlo with `.claude/help-html-task.md` (pre-existing brief -- verify it is still current before running). This is the last blocker before testers.

---

## Priority 2: Tester pass

Once help.html is complete, send the link to:
- Ashlyn
- Jordan
- Mycah

No formal test script needed -- ask them to click around and report anything broken or confusing.

---

## Priority 3: Admin screen (coordinator tool)

Alex wants to edit trip data without touching raw files on a computer. Scope:

**Minimum viable admin:**
- Edit `web/schedule.json` (28 events) -- add/edit/delete events, RSVP data
- Edit `INITIAL_VISIBLE` (home page event count) -- currently hardcoded; wire to a config value editable in the admin UI

**Approach decision needed (grill-me before building):**
- Option A: A separate `admin.html` page, password-protected via a simple localStorage PIN, reads/writes via a GitHub API call (PAT stored in admin localStorage on first use)
- Option B: Inline edit mode on existing pages (click to edit)
- Option C: Supabase Phase 2 -- but schema not yet active; skip for now

Alex's stated preference: be able to edit on a computer with the raw files as a fallback. Admin screen is the upgrade path.

**INITIAL_VISIBLE config note (from memory):** Alex wants this wired to a config value in the admin UI so he can change it live if family asks for more/fewer events on the home page.

---

## Priority 4: Phase 2 Supabase activation (deferred)

Schema is written, not yet active. Currently Phase 1 (localStorage only). Do not start this until admin screen is working and testers have signed off.

---

## Priority 5: Theme activation (lazlo batch review)

13 themes are committed but not yet user-selectable -- pending batch review. Low priority pre-launch. Alex has not asked for this yet this session.

---

## Known open issues (non-blocking)

- "System" (hamburger) vs "Auto" (original toggle) terminology inconsistency -- profile page says "System," hamburger says "🌓 Appearance" cycling through Auto/Light/Dark. Minor. Alex has not flagged it.
- help.json: person icon reference + "several themes" copy fixes -- verify these landed in the last session or queue for next pass.
- `docs/vacation-coordinator-repair-guide.md` needs a conversation log entry from this session (Vacation to add).

---

## Pre-launch checklist status

- [x] All 10 pages exist on disk
- [x] Responsive nav v2
- [x] Appearance controls unified
- [x] Profile page polished
- [ ] help.html complete -- **NEXT ACTION**
- [ ] Tester pass (Ashlyn, Jordan, Mycah)
- [ ] Family link sent

**Target:** May 8 family launch. ~10 days out.
