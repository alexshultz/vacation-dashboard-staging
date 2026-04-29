# Next Session Kickoff -- Branson '26 Dashboard
**Written:** 2026-04-28 end of session
**Production:** vacation.creeperbomb.com
**Staging:** vacation-dev.creeperbomb.com
**Launch target:** May 8, 2026

---

## FIRST ACTION: Promote staging to production

Staging (`2cb8a2b`) has changes that are NOT yet in production:
- event-timeline.html: legend box, chip colors, card column order fix
- index.html: same three changes

Column order in staging is correct: Interested | Not Interested | Undecided | No Response.
Production still has old order. This is the first thing to do next session -- run production promotion from branson-lazlo-delegation skill Step 6b.

---

## Pre-launch checklist status

- [x] All 10 pages exist on disk
- [x] Responsive nav v2
- [x] Appearance controls unified
- [x] Profile page polished
- [x] help.html complete (verified earlier this session)
- [x] Admin screen (admin.html) -- upsert 409 bug fixed, live in production
- [ ] Tester pass (Ashlyn, Jordan, Mycah) -- **NEXT BLOCKER after promotion**
- [ ] Family link sent

---

## Priority 1: Tester pass

Send to Ashlyn, Jordan, Mycah. No formal script -- ask them to click around and report anything broken or confusing. URL: https://vacation.creeperbomb.com/

When testers report completion, Alex relays it in #branson-2026. Acknowledge and note it.

---

## Priority 2: Phase 2 Supabase -- wishlist social counts

When wishlist.html is wired to Supabase picks table, add "X others also wishlisted this" count to each wishlisted card. Feature deferred from this session -- localStorage has no cross-user state. Requires Phase 2 picks activation first.

Phase 2 schema is written (data/supabase-phase2-schema.sql). Grill-me docs already exist (grill-me docs/supabase-phase2-activation-grillme.md, supabase-phase2-lazlo-grillme.md). Review before proceeding.

---

## Priority 3: Admin INITIAL_VISIBLE config (coordinator tool)

Alex wants to adjust the home page "show N events" count (currently hardcoded as INITIAL_VISIBLE = 6 in index.html) via the admin UI without touching code. Wire it to a config value editable in admin.html so he can change it live if family asks for more/fewer events.

---

## Priority 4: Theme activation

13 themes committed but not yet user-selectable -- pending lazlo batch review. Low priority pre-launch.

---

## Known open issues (non-blocking)

- "System" (hamburger) vs "Auto" (original toggle) terminology inconsistency -- minor, Alex has not flagged it
- Wishlist page social counts -- deferred to Phase 2 (noted above)
- `web/mockups/README.md` still exists in the vault (not the production repo) -- harmless, vault-only

---

## Session summary (2026-04-28)

Key accomplishments this session:

1. **Admin upsert 409 fixed** -- T3 Council of Minds identified missing Prefer: resolution=merge-duplicates header. One-line fix, shipped to production.
2. **Stale web/mockups/ cleaned** -- T2 verified safe, deleted from production, rsync warning eliminated.
3. **UI polish batch (event-timeline + index)** -- legend boxed + centered + symmetrical; "No Response" chip outline fixed; card body column order corrected (Interested / Not Interested / Undecided / No Response). In staging, pending production promotion.
4. **Notes sync** -- "Ideas for Changes.md" note confirmed received from Obsidian (was a sync delay, not missing). All 5 items addressed (item 2 / wishlist social counts deferred to Phase 2).

---

## Vault commits this session

- `a1c9c8b` -- fix: admin save -- add resolution=merge-duplicates to Prefer header for upsert
- `ea92f71` -- feat: event-timeline UI polish -- legend box, chip colors, card column grouping
- `6ea423e` -- feat: index.html UI polish -- legend box, chip colors, card column grouping
