# Next Session Kickoff -- Branson '26 Dashboard
**Written:** 2026-04-28 end of session (updated: docs pass before Hermes update)
**Production:** vacation.creeperbomb.com
**Staging:** vacation-dev.creeperbomb.com
**Launch target:** May 8, 2026

---

## FIRST ACTION: Promote staging to production

Staging (`2cb8a2b`) has changes that are NOT yet in production:
- event-timeline.html: legend box, chip colors, card column order fix
- index.html: same three changes

Column order in staging is correct: Interested | Not Interested | Undecided | No Response.
Production still has old order. Run production promotion from branson-lazlo-delegation skill Step 6b.

---

## Pre-launch checklist status

- [x] All 10 pages exist on disk
- [x] Responsive nav v2
- [x] Appearance controls unified
- [x] Profile page polished
- [x] help.html complete (verified 2026-04-28: fetches help.json; all 5 required sections present; entry point via site.js NAV_LINKS)
- [x] Admin screen (admin.html) -- upsert 409 bug fixed, live in production
- [ ] Tester pass (Ashlyn, Jordan, Mycah) -- DEFERRED (removed from May 8 gate per ROADMAP.md 2026-04-27). Do not block launch on this.
- [ ] Family link sent

---

## Priority 1 (admin editor): 3 decisions BLOCKED on Alex

The Council of Minds (2026-04-28 morning session) evaluated coordinator admin editor architecture. Two approaches eliminated. Three decisions outstanding:

1. **Accept "Option Zero"?** -- GitHub.com's built-in web editor (pencil icon on schedule.json in browser) is already a zero-code admin interface. Real GitHub auth, no PAT in client code, edits go live after ~60s Pages build. Zero implementation. Alex was reviewing what the raw schedule.json entry format looks like when the session ended.

2. **ADR-002 ruling** -- does a Supabase write-back via a human-triggered web form violate the "no automated code modifying vault files" intent of ADR-002? Alex needs to make a call.

3. **Keepalive cron sufficiency** -- the every-3-days keepalive cron (job ID: 4c0261d2d5bc) should prevent Supabase auto-pause. Verify it is sufficient before May 22 trip start.

**Eliminated:**
- GitHub API write-back (PAT auto-revoked by GitHub secret scanning on any public repo)
- Hybrid Supabase + GitHub (split-truth, event ID drift)

---

## Priority 2: Phase 2 Supabase -- wishlist social counts

When wishlist.html is wired to Supabase picks table, add "X others also wishlisted this" count to each wishlisted card. Feature deferred from prior session -- localStorage has no cross-user state. Requires Phase 2 picks activation first.

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
- help.html cosmetic issue (WARN-12): `<script>` renderer block sits after `</main>` rather than inside `<main>`. Functionally correct. Fix on next help.html touch.

---

## Session summary (2026-04-28)

Key accomplishments across sessions today:

1. **Admin upsert 409 fixed** -- T3 Council identified missing `Prefer: resolution=merge-duplicates` header. One-line fix, shipped to production.
2. **Stale web/mockups/ cleaned** -- T2 verified safe, deleted from production, rsync warning eliminated.
3. **UI polish batch (event-timeline + index)** -- legend boxed + centered + symmetrical; "No Response" chip outline fixed; card body column order corrected. In staging, pending production promotion.
4. **Admin editor architecture Council** -- 5-role Council ran, two options eliminated, three blocking decisions surfaced for Alex.
5. **Supabase Phase 2 activated** -- picks hydration, write error banner, fetchAllWishlists fix shipped to production.
6. **Notes sync** -- "Ideas for Changes.md" confirmed received from Obsidian. All 5 items addressed (wishlist social counts deferred to Phase 2).

---

## Vault commits this session

- `a1c9c8b` -- fix: admin save -- add resolution=merge-duplicates to Prefer header for upsert
- `ea92f71` -- feat: event-timeline UI polish -- legend box, chip colors, card column grouping
- `6ea423e` -- feat: index.html UI polish -- legend box, chip colors, card column grouping
