# Phase 4 Plan — Extract locked design system into `web/css/`

**Created:** 2026-04-21
**Owner:** Hermes (implementation), Alex (approval gate)
**Predecessor docs (already locked):**
- `~/vaults/Alex/Vacation/Claude Design Round 7 - Locked Spec.md` — final card / tag / suggestions / vocab
- `~/vaults/Alex/Vacation/Claude Design Grill-Me.md` Q1–Q48 — Phase 1 implementation answers
- `web/DESIGN.md` — token names + a11y floor + perf budget
- `docs/ROADMAP.md` — phased plan, definition of done

**Preview URLs (live for testers):**
- https://alexshultz.github.io/vacation-dashboard-previews/
- .../button-study/
- .../card-density/
- .../swipe-browse/

---

## Scope

This phase does ONE thing: **extract the already-locked design into reusable CSS + a shared generator partial, and retrofit `attractions.html` onto it.** Nothing new is designed. No new tokens are introduced. No new decisions are made on color, density, or interaction model — those are all already locked in Round 7 + Phase 1 grill Q1–Q48.

### In-scope (Phase 4 ships)

1. `web/css/tokens.css` — all CSS custom properties (color, type, space, radii, shadow), structured as private Ozarks palette driving semantic tokens (Q1 answer).
2. `web/css/themes/trail.css` — full token sheet for the default Trail theme (Q2 answer: full sheets, not diff overrides).
3. `web/css/components.css` — card (`.card--light` + `.card--dense`), badge, tag pill, avatar stack, filter chip, button vocabulary.
4. Pre-generated SVG thumbnail fallbacks, 26 letters × 1 theme (Trail only in Phase 4; Cartridge/Lakeside deferred).
5. Shared `<head>` + nav partial inside `scripts/generate_dashboard.py` (Q7 answer: both are partials).
6. `attractions.html` fully rebuilt to consume tokens + components, server-rendered from `data/attractions.json` (Q11 resolved in favor of server-render).
7. Commit-per-file discipline, backups in `.backups/2026-04-21-pre-phase-4/`.

### Out-of-scope (not in Phase 4)

- Any Phase 2 backend / Supabase wiring (RSVP, auth, meal counter).
- `shows.html` full rebuild — receives **minimal hookup** only (Q10 answer: inline styles kept, tokens.css + new head + new nav replaced).
- `event-timeline.html` / `people-timeline.html` / `index.html` full rebuilds — same minimal hookup.
- Interactive filter row JavaScript — Phase 4 ships the chips as styled, focusable buttons; hand-off to Phase 2 for actual filtering logic.
- Trending strip + first-pick badges — hidden until Phase 2 (with a "test data" banner only during tester review, per your honesty-during-testing rule).
- Auth/localStorage-picks (Q14, Q15) — deferred to Phase 2.
- Cartridge / Lakeside / colorblind / outdoor themes — Trail only in Phase 4.
- `vacation-dashboard` repo restructure + GitHub Pages wiring — last, not first (your stated preference).
- Wordmark image generation (Q45) — parallel track.

---

## Locked decisions (reference; DO NOT re-open)

Every one of these is cited from the source docs. If you want to change one, say so before build starts.

### Token architecture
- `--moss`, `--lake`, `--sand`, `--clay`, `--dusk` are **private**. Components only touch semantic tokens. (Grill Q1)
- Non-default themes get **full token sheets** not diff overrides; selector `:root[data-theme="trail"]`. (Q2)
- Dark mode: per-theme paired blocks (`[data-theme="trail"][data-mode="dark"]`) generated from a JSON settings source. (Q3)
- Spacing / radii / shadow / type **may vary per theme** (not just color). (Q4)
- Status colors consistent across themes unless a theme makes signals ambiguous. (Q5)

### Generator
- Full regeneration every run, **no hand-edit zones**. (Q9)
- Both `<head>` and nav become shared partials in `generate_dashboard.py`. (Q7)
- Relative paths from repo root; iCloud mirror dropped in favor of GitHub Pages staging → promote. (Q8, Q32)

### attractions.html
- Server-rendered cards from JSON. (Q11 resolved by Round 7: ticket-purchased banner is view-only + cancel-by-text, so no realtime push needed in Phase 4.)
- Filters **real**, client-side chip row. (Q12)
- Trending + first-pick **hidden** in Phase 4 production; tester previews may show "TEST DATA" banner with demo values. (Q13 + your honesty-during-testing clarification)
- Wishlist button pattern: **radio group of mutually-exclusive buttons**, not tri-cycle. (Q16 + Round 7)
- Heart (wishlist) and I'm In / Not Going are **independent**. (Q18)
- Lock icon: design for it, don't ship it Phase 4. (Q17)

### Missing-thumbnail fallback
- Inline SVG, theme-aware hash-from-slug, **single letter**, pre-generated 26 letters × themes at build time. (Q19, Q20, Q21)
- Runtime check for real thumb file; remove thumb-path from JSON (Q22).

### Slugs
- Clean now, in one pass (rename + JSON update + thumb rename). (Q43)

### Card geometry (resolved: use card-density.html, not swipe-browse.html)
- `card-density.html` uses `--radius-card: 18px`.
- `swipe-browse.html` uses `22px`.
- **Choice: canonical = card-density.html @ 18px** because Phase 4 ships the card grid; swipe-browse is a Phase 2 discovery mode with its own hero-card radius.

---

## Build order (commits)

Each numbered item = one commit. Each commit is independently revertable.

1. `Phase 4a: pre-flight backups of web/ into .backups/2026-04-21-pre-phase-4/`
2. `Phase 4b: extract tokens.css + themes/trail.css from card-density.html`
3. `Phase 4c: extract components.css (card--light, card--dense, badge, tag, avatar-stack, chip, button)`
4. `Phase 4d: generate SVG thumbnail fallbacks for 26 letters (Trail theme)`
5. `Phase 4e: refactor generate_dashboard.py — shared <head> + nav partial`
6. `Phase 4f: rebuild attractions.html on new system; regenerate from JSON`
7. `Phase 4g: minimal hookup of shows.html + index.html + event-timeline.html + people-timeline.html`
8. `Phase 4h: wire PROJECT_LOG.md diary entry + Phase 4 done marker`

**Estimated:** ~6 hours of Hermes wall-time across 8 commits. You review each commit's diff before the next starts. Halt-on-question default.

---

## Verification after each commit

- Open affected page(s) in the browser tool, screenshot, compare against pre-change screenshot.
- `git diff --stat` summary posted to #branson-2026.
- On Phase 4f: Lighthouse perf ≥ 90, no console errors, mobile viewport test.

---

## Three genuinely open questions for Alex

These are NOT re-opens of locked decisions. They're setup items not covered anywhere.

### Q-P4-1. Canonical card geometry

My assumption (stated above): **`card-density.html` @ 18px radius is canonical** because Phase 4 ships the grid + wishlist pages and `swipe-browse.html` is a Phase 2 discovery feature whose 22px is specific to its hero-card shape.
**Impact if wrong:** cards in browse mode look slightly too rounded/not-rounded.
**Reversal cost:** low — one token change, visual-only.
**Default if you don't answer:** proceed with 18px.

### Q-P4-2. Branch strategy

My assumption: **small commits directly on `main`, no feature branch.** Rationale:
- Every commit is independently revertable (atomic scope).
- Git log in `main` stays linear and readable (matches your pruning preference).
- You review each diff before the next commit starts, so "mistake goes live" risk is already mitigated.
- A branch adds overhead (merge commit or squash decision) without catching any class of error the per-commit review doesn't already catch.
**Impact if wrong:** if one commit turns out to break a later commit in a way review missed, you lose a small amount of rollback granularity.
**Reversal cost:** zero — I can always `git checkout -b` mid-build if you change your mind.
**Default if you don't answer:** proceed on `main`.

### Q-P4-3. Pre-Phase-4 backup location + scope

My assumption: **`.backups/2026-04-21-pre-phase-4/` containing copies of `web/attractions.html`, `web/shows.html`, `web/index.html`, `web/event-timeline.html`, `web/people-timeline.html`, and `scripts/generate_dashboard.py`.** Not backing up `web/mockups/` (those are source-of-truth we're reading from, not mutating). Not backing up `data/` (no writes to data in Phase 4). Not backing up `assets/thumbs/` (not moving existing thumbs, only adding SVG fallbacks under a new path).
**Impact if wrong:** if Phase 4 accidentally touches a file we didn't back up and you want a pre-Phase-4 version, `git checkout cd70c3e -- path/to/file` still works (initial commit has everything).
**Reversal cost:** zero — git is the real backup.
**Default if you don't answer:** proceed with the listed 6 files only, since git covers the rest.

---

## Diary / project log setup

Your idea is a good one. From this point on, Phase milestones (start, end, pivot, failure) get an entry in:

`docs/PROJECT_LOG.md`

Format: ISO timestamp + one-paragraph event, newest at top. Committed with the commit it describes. This replaces the ad-hoc "status message in #branson-2026" pattern and gives future Hermes a canonical source if context is lost.

First entry gets written as Phase 4a commit.

---

## Approval

Reply with:
- **A** — Proceed with all three assumptions above, build starts at commit 4a.
- **B** — Proceed with corrections on Qx (list them).
- **C** — Hold. Something in the locked-decisions section needs re-opening.
