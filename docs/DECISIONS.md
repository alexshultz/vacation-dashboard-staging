# DECISIONS.md — Branson 2026 Dashboard

> **ADR-lite format.** One entry per architectural decision. Entries are append-only — never delete; mark superseded entries as `[SUPERSEDED by ADR-NNN]`. Newest at bottom. Agents: add an entry here any time you make a non-trivial choice about how data flows, files are structured, or a pattern is established.

---

## ADR-001 · JSON as canonical data source (2026-04-18)

**Decision:** `data/attractions.json` is the single edit source of truth. HTML is generated from JSON; HTML is never the canonical record.

**Why:** Hand-editing HTML leads to drift when the generator runs. JSON is diffable, scriptable, and safe to commit.

**Consequences:** Any data change goes to JSON first. The generator reads JSON. Direct HTML edits that must persist across generations are forbidden (or must be handled by a post-generation injection step).

---

## ADR-002 · generate_dashboard.py frozen (2026-04-22)

**Decision:** `scripts/generate_dashboard.py` must never be run in a normal workflow. It is effectively frozen.

**Context:** The generator overwrites `web/attractions.html`, `web/wishlist.html`, and `web/suggested.html` from scratch. As of 2026-04-22, `attractions.html` contains hand-edited Quick Pick swipe mode code (deck-mode-toggle, deck-stage, full pointer-events JS) that the generator does NOT reproduce. Running the generator destroys that code. **This happened twice in one day.** Total recovery cost: one ~$6.31 rate-limit interruption + one full codemaster recovery pass.

**Rule:** Pre-push safety check `grep -c 'pointerdown' web/attractions.html` must return 1. If 0: STOP and recover before pushing.

**If regeneration is ever necessary:** Plan a codemaster pass to re-inject all Quick Pick additions afterward. Document it as a new ADR entry.

---

## ADR-003 · fetch(data.json) render loop replaces baked card HTML (2026-04-23)

**Decision:** `web/attractions.html` switched from ~130+ statically baked `<article>` card elements to a dynamic JavaScript `fetch('data.json')` render loop via `renderCatalog()`.

**Context:** The sync-triple-change task removed 10 stale duplicate cards and then converted the entire `#catalog-grid` from server-rendered HTML to a client-side render loop. The source data is `web/data.json` (a copy of `data/attractions.json`). Blacklisted slugs are inlined as a JS array in `attractions.html` to avoid a second fetch.

**Why `web/data.json` not `../data/attractions.json`:** The `web/` directory must be self-contained for both GitHub Pages serving (no parent-traversal) and local `file://` loading. `web/data.json` is the served copy; `data/attractions.json` is the edit copy.

**Update rule:** After editing `data/attractions.json`, copy it to `web/data.json` before pushing. Do not use the generator.

**Consequences:**
- Card HTML lives in a JS template literal inside `renderCatalog()` in `attractions.html`. To change card layout: edit that template literal directly.
- Quick Pick deck and filter chips must wait for `renderCatalog()` to complete before querying DOM cards.
- Filter chip integration: Quick Pick chip listener reads `aria-selected` with a 50ms setTimeout to let the existing chip handler run first.
- Pre-push check now validates both `pointerdown` (Quick Pick preserved) and `fetch.*data\.json` (render loop present).

---

## ADR-004 · CSS token architecture (2026-04-21)

**Decision:** Two-layer token system. Private palette (`--moss`, `--lake`, `--sand`, `--clay`, `--dusk`) lives in `css/themes/trail.css` only. Components reference semantic tokens only (`--color-bg`, `--accent-sand`). To expose a palette color to components, add a passthrough token in `tokens.css`.

**Why:** Prevents components from coupling directly to the Ozarks theme. Future theme support (e.g. Cartridge, Lakeside) only requires a new `themes/*.css` file.

**Companion rule:** Any element toggled with `.hidden = true` in JS that also has `display: flex` in `components.css` must have an explicit `.element[hidden] { display: none; }` rule added to `components.css`. Browser UA `[hidden]` defaults lose to author-level `display:flex`.

---

## ADR-005 · Supabase picks backend — Phase 1 localStorage only (2026-04-21)

**Decision:** Phase 1 wishlist uses localStorage (`vacdash:v1:picks`) only. Supabase wiring deferred to Phase 2.

**Schema:** `data/supabase-phase2-schema.sql` is written and ready. Alex must paste it into the Supabase SQL editor and fill `SUPABASE_URL` + `SUPABASE_ANON_KEY` in `web/js/picks.js` to activate Phase 2.

**Idempotency rule:** All SQL for this project uses `DROP POLICY IF EXISTS / CREATE POLICY` and `DROP TRIGGER IF EXISTS / CREATE TRIGGER` patterns. Postgres has no `IF NOT EXISTS` for these object types.

---

## ADR-006 · GitHub Pages preview repo is separate from vault (2026-04-21)

**Decision:** The vault at `~/vaults/Vacation/Branson 2026/` has no git remote and is local-only. GitHub Pages deployments go through the separate clone at `~/code/vacation-dashboard-previews/`.

**Sync workflow:** rsync from `vault/web/` → preview repo root, then path-fix `../assets/thumbs/` → `assets/thumbs/` across all HTML files, then commit + push.

**Critical:** Always include `--exclude=".git"` in the rsync command. Omitting it silently deletes `.git/` from the preview repo, breaking all future git commands. If `.git/` is destroyed: `git init && git remote add origin … && git fetch && git checkout -b main && git add -A && git commit && git push --force`.

---

## ADR-007 · Shared site chrome via site.js (2026-04-24)

**Decision:** All 10 dashboard pages share a single `web/js/site.js` for nav, dark mode toggle, and badge sync. Static per-page `<header>` and `<nav class="bottom-tabs">` HTML has been removed from every page.

**Context:** The nav bar was copy-pasted across all 10 HTML pages as raw static HTML. This caused visible inconsistencies (help.html had a 7th nav link others lacked; attractions.html/wishlist.html/suggested.html were missing the profile button entirely; shows.html and quick-pick.html had no aria-current; badge sync was broken on multiple pages). Any nav change required updating 10 files.

**Mechanism:** site.js is loaded as a synchronous `<script>` as the first child of `<body>`. It uses `document.currentScript.insertAdjacentHTML('afterend', html)` to inject the header and bottom-tabs nav into the DOM during body parsing, before any `<main>` content renders. Active page detection uses `window.location.pathname.split('/').pop()` with a NAV_ALIASES map for sub-pages.

**Why synchronous (not async/defer):** The script must run before `<main>` content parses so the nav appears without flash. A `<link rel="preload" href="js/site.js" as="script">` in `<head>` ensures it is fetched in parallel with CSS, eliminating extra round-trip cost.

**Canonical nav definition:** `NAV_LINKS` (7 items) and `BOTTOM_TABS` (6 items) in site.js are the single source of truth for nav structure. To add, remove, or rename a nav item: edit site.js only.

**Site name:** `SITE_NAME` constant in site.js drives the logo text. Page `<title>` tags remain per-page static HTML.

**Bugs fixed by this change:**
- help.html no longer has an extra 7th nav link that others lacked
- attractions.html, wishlist.html, suggested.html now have the profile button
- shows.html and quick-pick.html now highlight the correct nav item
- Badge sync (profile nudge dot) now works consistently on all 10 pages
- Dark mode toggle handler is a single implementation instead of 10 inline onclick strings

**Failure mode:** If site.js fails to load, every page renders without a nav bar. Mitigation: `<link rel="preload">` reduces this risk; site is a private family tool on GitHub Pages where this scenario is extremely unlikely.

**Rule for adding a new page:** (1) Do NOT copy-paste header/nav HTML. (2) Add `<link rel="preload" href="js/site.js" as="script">` to `<head>`. (3) Add `<script src="js/site.js"></script>` as first child of `<body>`. (4) If the page needs its own nav alias, add it to `NAV_ALIASES` in site.js.

---
