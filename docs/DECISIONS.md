# DECISIONS.md — Branson 2026 Dashboard

> **ADR-lite format.** One entry per architectural decision. Entries are append-only — never delete; mark superseded entries as `[SUPERSEDED by ADR-NNN]`. Newest at bottom. Agents: add an entry here any time you make a non-trivial choice about how data flows, files are structured, or a pattern is established.

---

## ADR-001 · JSON as canonical data source (2026-04-18) [SUPERSEDED by ADR-008 re: update rule]

**Decision:** `data/attractions.json` is the single edit source of truth. HTML is generated from JSON; HTML is never the canonical record.

**Why:** Hand-editing HTML leads to drift when the generator runs. JSON is diffable, scriptable, and safe to commit.

**Consequences:** Any data change goes to JSON first. ~~The generator reads JSON.~~ (Generator is frozen per ADR-002. Use `export_data.py` per ADR-008 instead.) Direct HTML edits that must persist across generations are forbidden.

---

## ADR-002 · generate_dashboard.py frozen (2026-04-22) [SUPERSEDED by ADR-008 re: safety check file]

**Decision:** `scripts/generate_dashboard.py` must never be run in a normal workflow. It is effectively frozen. A `sys.exit(1)` guard was added -- it exits immediately with an error if run.

**Context:** The generator overwrites `web/attractions.html`, `web/wishlist.html`, and `web/suggested.html` from scratch. As of 2026-04-22, `attractions.html` contains hand-edited Quick Pick swipe mode code (deck-mode-toggle, deck-stage, full pointer-events JS) that the generator does NOT reproduce. Running the generator destroys that code. **This happened twice in one day.** Total recovery cost: one ~$6.31 rate-limit interruption + one full lazlo recovery pass.

**Also frozen:** `scripts/generate_attractions.py` -- overwrites `web/attractions.html` from scratch. Also has a `sys.exit(1)` guard. Same rationale: it would destroy the hand-edited render loop and Quick Pick integration. Never run or modify either frozen script.

**Rule:** Pre-push safety check -- see ADR-008 for correct command. (Original command below was wrong after Quick Pick moved to quick-pick.html in ADR-003.)

~~**Original (wrong after ADR-003):** `grep -c 'pointerdown' web/attractions.html` must return 1.~~

**Correct (per ADR-008):** `grep -c 'pointerdown' web/quick-pick.html` must return 1. If 0: STOP and recover before pushing.

**If regeneration is ever necessary:** Plan a lazlo pass to re-inject all Quick Pick additions afterward. Document it as a new ADR entry.

---

## ADR-003 · fetch(data.json) render loop replaces baked card HTML (2026-04-23) [SUPERSEDED by ADR-008 re: update rule]

**Decision:** `web/attractions.html` switched from ~130+ statically baked `<article>` card elements to a dynamic JavaScript `fetch('data.json')` render loop via `renderCatalog()`.

**Context:** The sync-triple-change task removed 10 stale duplicate cards and then converted the entire `#catalog-grid` from server-rendered HTML to a client-side render loop. The source data is `web/data.json` (a copy of `data/attractions.json`). ~~Blacklisted slugs are inlined as a JS array in `attractions.html` to avoid a second fetch.~~ **SUPERSEDED by ADR-008:** The inline JS blacklist was replaced by a pre-computed `visible` boolean field on each record in `web/data.json`, set by `export_data.py` from `data/blacklist.json`. No inline array exists in `attractions.html`.

**Why `web/data.json` not `../data/attractions.json`:** The `web/` directory must be self-contained for both GitHub Pages serving (no parent-traversal) and local `file://` loading. `web/data.json` is the served copy; `data/attractions.json` is the edit copy.

**Update rule:** ~~After editing data/attractions.json, copy it to web/data.json before pushing.~~ **SUPERSEDED by ADR-008:** Run `python3 scripts/export_data.py` instead. A plain copy omits `sort_key` and `visible` fields that export_data.py adds, breaking blacklist filtering and sort order.

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

**Decision:** The vault at `~/vaults/Vacation/Branson 2026/` has no git remote and is local-only. GitHub Pages deployments go through the separate clone at `~/code/vacation-dashboard/`.

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

**Rule for adding a new page:** (1) Do NOT copy-paste header/nav HTML. (2) Add `<link rel="preload" href="js/site.js" as="script">` to `<head>`. (3) Add `<script src="js/site.js"></script>` as first child of `<body>`. (4) If the page needs its own nav alias, add it to `NAV_ALIASES` in site.js. (5) Add the new filename to the `sed` path-fix list in the deploy workflow. (6) Add an ADR entry to `docs/DECISIONS.md`.

---

## ADR-008 · export_data.py as data-layer -- sort + visible architecture (2026-04-24)

**Context:** Both bugs (wrong sort order, 132 vs 139 card count mismatch) had client-side JS as the single point of failure. Inline BLACKLIST in attractions.html had drifted from quick-pick.html. Sort logic would have needed to be duplicated across pages.

**Why export_data.py:** Sorting and visibility are data concerns, not rendering concerns. Pushing them to the export layer means both HTML files become dumb renderers reading pre-computed fields. Single source of logic, zero drift risk.

**New fields in web/data.json:**
- `sort_key` (string): article-stripped lowercase name for stable alphabetical sort
- `visible` (boolean): false if slug in data/blacklist.json, true otherwise

**Update rule:** After editing data/attractions.json OR data/blacklist.json, run `python3 scripts/export_data.py` from vault root before pushing. Never hand-edit web/data.json.

**Affects:** web/data.json schema, attractions.html render filter, quick-pick.html filterAttractions() and updateDeckCount(), CLAUDE.md.

**Canonical update rule (supersedes ADR-001 and ADR-003):** After editing `data/attractions.json` OR `data/blacklist.json`, run `python3 scripts/export_data.py` from vault root. Never copy attractions.json directly to data.json -- the export script adds `sort_key` and `visible` fields that a raw copy omits.

**Canonical pre-push safety check (supersedes ADR-002):** Run both before every push:
1. `grep -c 'pointerdown' web/quick-pick.html` must return 1. If 0: STOP. Quick Pick swipe code is missing.
2. `grep -c 'fetch.*data.json' web/attractions.html` must return ≥ 1. If 0: STOP. Render loop is missing.

---

## ADR-009 · help.html content sourced from runtime JSON fetch (2026-04-26)

**Decision:** `web/help.html` renders its FAQ sections from `web/help.json` via a runtime `fetch()` call, not from hard-coded HTML markup.

**Alternatives considered:**
1. **Hard-coded HTML** -- initial approach. Rejected because editing HTML is more error-prone than editing JSON, and any LLM-assisted HTML edit introduces formatting risk. Content changes require touching markup, not just text.
2. **Build-time generator script** (`export_help.py` -> `help.html`) -- rejected for the same reason `generate_dashboard.py` was frozen. A third generator that overwrites `help.html` repeats a risk pattern we have already been burned by twice. Editing a Markdown source and running a script adds steps Alex does not want.
3. **Markdown source file** -- rejected because Alex explicitly does not want to edit content files directly. A Markdown file would be too tempting to edit by hand, and converting it to JSON adds a step with no benefit over editing JSON directly.

**Why runtime fetch:**
- `web/help.json` is the sole edit surface. To update help content: edit the JSON, push, done. No HTML touched, no script run, no generator frozen.
- Consistent with the existing `data.json` pattern already established for attractions. Same `fetch()` idiom, same error handling pattern, nothing new to learn.
- Deterministic rendering -- the JS renderer in `help.html` handles all formatting. LLMs write the content tokens in JSON; the renderer applies structure uniformly. No formatting drift possible.
- Lazlo edits JSON content tokens only; formatting logic lives in the renderer and is not touched per content update.

**Consequences:**
- `web/help.json` is the canonical source for all help content. Never hand-edit the HTML sections in `help.html`.
- `help.json` must ship alongside `help.html` in the rsync deploy step (it lives under `web/` so this is automatic).
- A JS render failure (network, parse error) must show a fallback message -- do not leave `<main>` empty on error.
- Adding, removing, or reordering help sections = edit `help.json` only.
- `body` strings in `help.json` support minimal Markdown: `**bold**` -> `<strong>`, `- item` lines -> `<ul><li>`, `\n\n` -> paragraph break. No other Markdown constructs are supported or needed. The renderer in `help.html` handles these three cases only -- no external Markdown library required.

---

## ADR-010 · Supabase session as conditional admin display gate on family pages (2026-05-01)

**Decision:** `supabase.auth.onAuthStateChange()` in `web/js/admin-overlay.js` toggles
the `body.is-admin` CSS class on family-facing pages. Edit controls are hidden by
default (fail-closed) and revealed only when a confirmed Supabase session exists.

**Rationale:** Display-conditional gating on a single shared page is preferred over
maintaining a full-page clone per admin feature. Long-term, one file to maintain;
short-term, zero risk to family users who are never authenticated.

**Consequences:**
- Any family page that wants admin controls: add `<script src="js/admin-overlay.js">`,
  expose `window._vacdashEvents`, and emit `.admin-edit-btn` buttons with `data-event-id`.
- Buttons are invisible to unauthenticated visitors — no CSS specificity war needed.
- Fail-open risk is eliminated: default CSS is `display:none` at the rule level.

---

## ADR-011 · admin-overlay.js as canonical reusable admin-edit-in-place module (2026-05-01)

**Decision:** `web/js/admin-overlay.js` is the single reusable module for session-gated
inline editing on family pages. It owns: auth state subscription, sign-out badge, edit
modal injection, and `window.vacdashOpenEdit`.

**Contract for adopting pages:**
1. Load Supabase JS SDK CDN before this script.
2. Add `<script src="js/admin-overlay.js"></script>` before `</body>`.
3. Populate `window._vacdashEvents` with the page's loaded events array.
4. Emit `.admin-edit-btn` buttons with `data-event-id="${event.id}"` and
   `onclick="vacdashOpenEdit(this)"` inside `<details class="event-card">` elements.

**Scope limitation:** This module is an authoring idiom for schedule-event pages only.
It is NOT a universal drop-in for pages with different data shapes (attractions, picks,
etc.). Those pages would require their own overlay module with a different schema.

---

## ADR-012 · Q14a deferred — dual admin gate acknowledged as interim inconsistency (2026-05-01)

**Decision:** Two separate admin gates co-exist as of this sprint and are intentional:
1. `site.js` nav shows the Admin link based on a `localStorage` `vacdash:v1:user` name
   check against `ADMIN_USERS`.
2. `admin-overlay.js` edit icons are gated on a live Supabase session via
   `onAuthStateChange`.

**Why intentional:** Unifying these gates (Q14a) requires either making the nav gate
async (flash-of-wrong-nav risk) or making the edit-icon gate localStorage-only (weaker
security, no server confirmation). Neither tradeoff is acceptable pre-launch.

**Consequences:**
- A family member named Alex will see the Admin nav link but NOT the edit icons (they
  have no Supabase session). This is acceptable — the Admin link leads to an auth wall.
- Alex-with-session will see both the nav link and the edit icons. Correct.
- Resolution deferred to post-launch cleanup sprint.

---

---

## ADR-010 · Supabase session as conditional admin display gate on family pages (2026-05-01)

**Decision:** `supabase.auth.onAuthStateChange()` in `web/js/admin-overlay.js` toggles
the `body.is-admin` CSS class on family-facing pages. Edit controls are hidden by
default (fail-closed) and revealed only when a confirmed Supabase session exists.

**Rationale:** Display-conditional gating on a single shared page is preferred over
maintaining a full-page clone per admin feature. Long-term, one file to maintain;
short-term, zero risk to family users who are never authenticated.

**Consequences:**
- Any family page that wants admin controls: add `<script src="js/admin-overlay.js">`,
  expose `window._vacdashEvents`, and emit `.admin-edit-btn` buttons with `data-event-id`.
- Buttons are invisible to unauthenticated visitors — no CSS specificity war needed.
- Fail-open risk is eliminated: default CSS is `display:none` at the rule level.

---

## ADR-011 · admin-overlay.js as canonical reusable admin-edit-in-place module (2026-05-01)

**Decision:** `web/js/admin-overlay.js` is the single reusable module for session-gated
inline editing on family pages. It owns: auth state subscription, sign-out badge, edit
modal injection, and `window.vacdashOpenEdit`.

**Contract for adopting pages:**
1. Load Supabase JS SDK CDN before this script.
2. Add `<script src="js/admin-overlay.js"></script>` before `</body>`.
3. Populate `window._vacdashEvents` with the page's loaded events array.
4. Emit `.admin-edit-btn` buttons with `data-event-id="${event.id}"` and
   `onclick="vacdashOpenEdit(this)"` inside `<details class="event-card">` elements.

**Scope limitation:** This module is an authoring idiom for schedule-event pages only.
It is NOT a universal drop-in for pages with different data shapes (attractions, picks,
etc.). Those pages would require their own overlay module with a different schema.

---

## ADR-012 · Q14a deferred — dual admin gate acknowledged as interim inconsistency (2026-05-01)

**Decision:** Two separate admin gates co-exist as of this sprint and are intentional:
1. `site.js` nav shows the Admin link based on a `localStorage` `vacdash:v1:user` name
   check against `ADMIN_USERS`.
2. `admin-overlay.js` edit icons are gated on a live Supabase session via
   `onAuthStateChange`.

**Why intentional:** Unifying these gates (Q14a) requires either making the nav gate
async (flash-of-wrong-nav risk) or making the edit-icon gate localStorage-only (weaker
security, no server confirmation). Neither tradeoff is acceptable pre-launch.

**Consequences:**
- A family member named Alex will see the Admin nav link but NOT the edit icons (they
  have no Supabase session). This is acceptable — the Admin link leads to an auth wall.
- Alex-with-session will see both the nav link and the edit icons. Correct.
- Resolution deferred to post-launch cleanup sprint.

---

## ADR-013 · rsvp.js as family-facing RSVP write module (2026-05-06)

**Decision:** A new module `web/js/rsvp.js` handles family-facing RSVP state for schedule events. It writes individual RSVP records to the `event_rsvps` table created in the Phase 0 migration (`data/rsvp-migration.sql`).

**Why:** Family members need an unauthenticated write path for their own RSVP status that does not require a Supabase session. `rsvp.js` uses the same localStorage `display_name` pattern established for picks in ADR-005, giving each family member a consistent identity across features without credentials.

**Consequences:**
- Family RSVPs write to `event_rsvps` (event_id + user_id + status), NOT the `schedule_events.interested/undecided/notInterested/noResponse` arrays.
- `admin-overlay.js` continues to own writes to `schedule_events` via Supabase session auth and is not modified by this pattern.
- User identity for RSVP follows the localStorage display_name convention from ADR-005.
- RLS on `event_rsvps` uses the `locked_at` column on `schedule_events` to block writes after the lock timestamp, enforcing an edit deadline without server-side code.
- `rsvp.js` is distinct from `admin-overlay.js` and must not be used as a drop-in replacement for either direction.

---

## ADR-014 · admin.html is a privileged coordinator surface with no privacy restrictions (2026-05-09)

**Decision:** The admin user (Alex) can see all data in the coordinator view with no restrictions -- real pick counts, "I'm in" counts, wishlist counts, and "not interested" counts per attraction and per event. No privacy filter applies to admin-gated surfaces.

**Why:** Alex stated explicitly: "there are no secrets from me. I get to see everything. There are no privacy settings that will keep things from me seeing them, but only if you are an admin do you get to see those things."

**Consequences:**
- Any coordinator-facing page or section gated behind admin auth must show raw, unfiltered data.
- Family-facing pages are governed separately; this ADR does not change their privacy behavior.
- Future coordinator features default to full data visibility unless Alex explicitly restricts a specific field.

---

## ADR-015 · "Conflict-free schedule" scoped to demand-coverage gap detection for coordinator stats v1 (2026-05-09)

**Decision:** The coordinator stats view does not attempt time-overlap conflict detection. "Conflict-free" for v1 means surfacing high-demand wishlist attractions that are not yet represented in the schedule, so Alex can prioritize scheduling them.

**Why:** `startTime` is null on all current schedule events. Precise time-overlap detection (does event A end before event B starts?) requires `startTime` and is currently impossible. Demand-coverage gap detection (which popular attractions have no scheduled slot?) is fully computable from existing data and is the more immediately useful coordinator signal.

**Consequences:**
- Time-overlap conflict detection is not built in v1. It becomes possible once `startTime` is populated on schedule events.
- The stats view shows: which attractions the group wants (from picks) and which schedule events have the most RSVPs -- two independent signals, not joined.

---

## ADR-016 · Coordinator stats v1 uses two independent single-table panels; cross-table join deferred (2026-05-09)

**Decision:** v1 coordinator stats has two independent panels -- Panel A (wishlist/pick demand from the picks table) and Panel B (RSVP commitment from schedule events). These panels are not joined or cross-referenced in v1.

**Why:** The join between picks slugs and schedule event identifiers requires either (a) `catalogRef` to be populated on schedule event rows, or (b) slug namespace equivalence between `picks.slug` and `schedule_events.id` to be verified. Currently `catalogRef` is null on all schedule events and namespace equivalence is unverified. A cross-reference view built without a confirmed join key would produce silent incorrect results.

**Consequences:**
- Panel A reads from the picks table via `fetchAllWishlists()`.
- Panel B reads from schedule events RSVP data.
- Cross-reference view ("wishlist items not yet scheduled") is deferred until condition (a) or (b) above is met.
- Once a join key is confirmed, the cross-reference view can be added as Panel C without redesigning the existing panels.

---
