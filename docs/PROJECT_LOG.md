# Branson 2026 Dashboard — Project Log

**Purpose:** Timestamped, newest-first record of meaningful state changes. Future-Hermes reads this first after a context compression. Humans read it to understand where the project actually stands vs. where any single session thought it was.

**Rules:**
- Newest at top. Append via insert after the header block, not at the bottom.
- Each entry: ISO timestamp header + one paragraph + optional bullet list of artifacts/commits.
- Commit this file alongside the commit it describes.
- Keep it narrow. Only state changes, pivots, decisions, failures. Not every message.

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
