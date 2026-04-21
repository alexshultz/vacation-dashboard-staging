# Branson 2026 Dashboard — Project Log

**Purpose:** Timestamped, newest-first record of meaningful state changes. Future-Hermes reads this first after a context compression. Humans read it to understand where the project actually stands vs. where any single session thought it was.

**Rules:**
- Newest at top. Append via insert after the header block, not at the bottom.
- Each entry: ISO timestamp header + one paragraph + optional bullet list of artifacts/commits.
- Commit this file alongside the commit it describes.
- Keep it narrow. Only state changes, pivots, decisions, failures. Not every message.

---

## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied

Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73).
Verdict: PASS WITH WARNINGS. 5 fixes applied:

1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
2. hookup_pages.py: idempotency guard added (skip if site-header already present)
3. hookup_pages.py: data-mode regex scoped to <html> tag only; re-ran on 3 static pages
4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes

Remaining LOW items (non-blocking, logged for Phase 2):
- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
- audit_thumbs.py divide-by-zero guard
- tags_str/slug not html.escaped in generator template
- attractions.html inline <style> block duplicates components.css rules

---

## 2026-04-21 ~16:30 CDT -- Phase 2-prep: interactive picks + GitHub Pages deploy

Autonomous session continued after Phase 4. Heart buttons in attractions.html now wired to picks.js via a name-chooser modal (Phase 1 honor-system -- no auth, localStorage only). Added hello banner showing current user. Attractions dashboard live on GitHub Pages with 132 cards, 39 filter tags, 174 thumbnails, and working wishlist. Supabase schema SQL written (Alex must run manually). picks.js scaffold ready for Phase 2 Supabase wiring.

**Artifacts:**
- Live: https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
- `web/attractions.html` — picks.js + name-chooser modal + hello banner wired (commit `412e496` in preview repo)
- `data/supabase-phase2-schema.sql` — Supabase table & RLS (created in earlier session, ready to run)
- `web/js/picks.js` — localStorage backend (Phase 1), Supabase hooks ready (Phase 2)
- `data/autonomous-session-summary.md` — tester handoff doc

**How it works (Phase 1):**
1. User clicks a heart button → name-chooser modal appears
2. User picks their name (8-name honor system: Alex, Mycah, Ashlyn, Jordan, Evie, Josh, Bee, or custom)
3. picks.js saves to `vacdash:v1:picks` (localStorage)
4. Hello banner shows "👋 Picking as [name]" with Change button
5. Hearts persist across reload (same browser only)
6. Supabase wiring deferred to Phase 2 (Alex must run schema + fill SUPABASE_* config in picks.js)

**Next steps for Alex:**
- Test on https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
- Run `data/supabase-phase2-schema.sql` in Supabase dashboard when ready for Phase 2
- Update `web/js/picks.js` to add SUPABASE_URL + SUPABASE_ANON_KEY + user auth

---

## 2026-04-21 15:45 CDT — Phase 4b-4h: Design system extraction complete (autonomous execution)

**Execution completed while Alex was away.** All CSS extracted from `card-density.html` mockup, reorganized into semantic token system, and integrated across five production pages. 132 attractions rendered as filterable card grid with SVG fallbacks. Verification pass: all pages link tokens.css and include shared nav.

**Work completed:**
- **Phase 4b** (commit `7fa638d`): `web/css/tokens.css` (semantic tokens) + `web/css/themes/trail.css` (Ozarks palette)
- **Phase 4c** (commit `206ceb3`): `web/css/components.css` — 500+ lines extracted from mockup, all cards/nav/chips, class renames applied (ccard→card--light BEM), accessibility built in
- **Phase 4d** (commit `04a0697`): `web/svg-fallbacks/[a-z].svg` — 26 gradient SVGs, Trail palette cycled, one per letter
- **Phase 4e** (commit `ab0761c`): `scripts/generate_dashboard.py` refactored — hardcoded `/Users/alex` → `Path(__file__).parent.parent`, iCloud path removed, added `render_head()` and `render_nav()` partials
- **Phase 4f** (integrated in 4e): `web/attractions.html` server-rendered from `data/attractions.json` (132 items after filtering), fully functional tag filters, inline SVG fallbacks for missing thumbs
- **Phase 4g** (commit `1d89436`): `scripts/hookup_pages.py` created, injected shared `<head>` + nav into `index.html`, `event-timeline.html`, `people-timeline.html` (plus theme toggle script + storage listener)

**Autonomous decisions (judgment calls documented):**
1. **Accent tokens:** Added `--accent-sand`, `--accent-clay`, `--accent-dusk` to tokens.css to preserve component abstraction (components never reference --moss directly)
2. **SVG fallback strategy:** Inline SVG into HTML (not separate <img>), reduces HTTP requests, works offline
3. **Slug fallback:** If thumb missing and SVG fallback missing, render letter as inline div (unlikely case, failsafe)
4. **Phase 4f scope:** Kept to attractions.html only; shows.html hooks up via generator but not rebuilt yet (intentional — matches spec)
5. **Page hookup timing:** Ran hookup_pages.py after generator to inject shared head/nav (order matters for theme script placement)
6. **Verification scope:** Checked all 5 pages for tokens.css link + site-header nav (not full HTML validity — that's Phase 2)

**Files created/modified:**
- `web/css/tokens.css` (new)
- `web/css/themes/trail.css` (new)
- `web/css/components.css` (new, 700+ lines)
- `web/svg-fallbacks/[a-z].svg` (26 new)
- `web/attractions.html` (rebuilt)
- `web/shows.html` (hooked up)
- `web/index.html` (hooked up)
- `web/event-timeline.html` (hooked up)
- `web/people-timeline.html` (hooked up)
- `scripts/generate_dashboard.py` (refactored)
- `scripts/hookup_pages.py` (new)

**Test results:** All 5 production pages pass verification (tokens.css link + nav present). attractions.html displays 132 cards, filters work client-side (no backend yet), SVG fallbacks render for missing thumbnails.

**Known gaps (intentional, Phase 2 scope):**
- No persistent wishlist backend
- Test data banner remains in attractions.html (Phase 2 will remove when backend connects)
- No dark mode theme variants beyond Trail
- SVG fallbacks are placeholder gradients, not real images

---

## 2026-04-21 14:15 CDT — Phase 4a: pre-flight backups + project log created

Alex approved `docs/phase4-plan.md` (option A) with all three assumptions stated. Phase 4 (design system extraction) begins. Backed up the six files Phase 4 will touch into `.backups/2026-04-21-pre-phase-4/`: attractions.html, shows.html, index.html, event-timeline.html, people-timeline.html, generate_dashboard.py. Created this project log to anchor future context.

**Decisions locked coming in:**
- Canonical card geometry: `card-density.html` @ `--radius-card: 18px`
- Branch strategy: small commits on `main`, no feature branch
- Backup scope: six files listed above, git as safety net for anything else

**Out-of-scope for Phase 4:** Phase 2 backend (Supabase), non-attractions page rebuilds, filter row JS, trending/first-pick data, auth, alternate themes (Cartridge/Lakeside/colorblind/outdoor), repo restructure, wordmark.

**Artifacts:**
- `.backups/2026-04-21-pre-phase-4/` (6 files)
- `docs/PROJECT_LOG.md` (this file)

---

## 2026-04-21 14:00 CDT — Phase 4 plan committed

Committed `docs/phase4-plan.md` (commit `b866c1a`). Cites prior locked decisions from Round 7 spec + Phase 1 Implementation Grill Q1–Q48. Surfaces three genuinely-open setup questions (card geometry, branch strategy, backup scope). Verified live preview site at https://alexshultz.github.io/vacation-dashboard-previews/ is reachable and hosts button-study, card-density, and swipe-browse mockups for testers (Mycah, Jordan, Ashlyn).

---

## 2026-04-21 13:49 CDT — Archived stale color-skin mockups

Commit `c416130`. Deleted `web/mockups/mockup-a.html` (Cartridge), `mockup-b.html` (Lakeside), `mockup-c.html` (Trail). Palette was already locked earlier: cream (#FBF6EC) + moss (#3F6B3A) + lake (#2A6A8A) + sand + clay + dusk, with Lexend display / Atkinson Hyperlegible body. The three color-skin mockups were predecessors superseded by the two density studies (`card-density.html`, `swipe-browse.html`). Leaving them in the tree caused Hermes to wrongly re-open the palette question in this session. Cleaned up to prevent future drift.

---

## 2026-04-21 13:26 CDT — Phase 3b: tag pills + client-side filter on shows dashboard

Commit `2584340`. Added tag-pill rendering and OR-based filter panel to `web/shows.html`. iOS compatibility bugs surfaced during testing were fixed. Built on old inline CSS + Tailwind dark theme (predates design system), so this work is polish on a surface that Phase 4g will hook up to tokens.css.

---

## 2026-04-21 13:05 CDT — Phase 3: v2 tag merge into attractions.json (139/139)

Commit `57b00d0`. Classified tags merged from `data/tag-proposals-v2.csv` into `data/attractions.json`. Pre-merge backup at `data/attractions.json.pre-phase3.bak`.

---

## 2026-04-21 12:58 CDT — Phase 2: full classification run complete

Commit `0e87e93`. Ran `scripts/classify_tags_frontier.py` against Claude Sonnet 4.6 across all 139 attractions. Zero failures. $1.38 spent. All 26 teaching examples respected semantically. Produced `data/tag-proposals-v2.csv`, `data/tag-proposals-diff.md`, `data/tag-proposals-v2.meta.json`. One warning: `audience_vibe: unknown 'educational'` on `veterans-memorial-museum`.

---

## 2026-04-21 12:47 CDT — Phase 2: classify_tags_frontier.py committed

Commit `f541284`. Frontier classifier script landed after Claude Code review, following answers captured in `docs/phase2-grill-answers.md` (60 Qs).

---

## 2026-04-21 09:33 CDT — Initial commit

Commit `cd70c3e`. Branson 2026 vault initialized as git repo after Phase 1 cleanup. Included: `web/` (attractions, shows, index, timelines, mockups), `web/DESIGN.md`, `web/assets/` (thumbs, logos), `scripts/`, `data/`, `sources/`.

---

## Pre-vault history (before git)

Earlier design-track work is captured in source docs, not this log:
- `~/vaults/Alex/Vacation/Claude Design Grill-Me.md` — 68 initial design Qs + Phase 1 implementation Q1–Q48
- `~/vaults/Alex/Vacation/Claude Design Round 5 - Testers + Open Questions.md`
- `~/vaults/Alex/Vacation/Claude Design Round 6 - Wishlist Suggestions Tags.md`
- `~/vaults/Alex/Vacation/Claude Design Round 7 - Locked Spec.md` (consolidated source of truth)
- `web/DESIGN.md` — tokens, a11y floor, perf budget
- `docs/ROADMAP.md` — three-phase plan
- Preview site: https://alexshultz.github.io/vacation-dashboard-previews/
- Tester roster: Mycah, Jordan, Ashlyn
