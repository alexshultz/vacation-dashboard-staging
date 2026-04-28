## 2026-04-28 -- feat: Supabase Phase 2 activation

**What changed:**
- `web/js/picks.js`: `init()` now fires a non-blocking async hydration fetch from Supabase on user set -- merges server picks into localStorage (Supabase wins per slug), notifies listeners for changed slugs, silent on failure
- `web/js/picks.js`: `sbSet()` now shows an on-screen red error banner (background #F8DDD5) on any Supabase write failure -- includes one-retry button; localStorage write preserved regardless
- `web/js/picks.js`: `fetchAllWishlists()` query expanded from `state=eq.wishlist` to `state=in.(wishlist,committing)` -- return shape unchanged
- `web/js/picks.js`: dead code removed from `showBanner()` -- `retryFailed` parameter and unreachable branch eliminated
- `web/attractions.html`: Phase 1 test banner (`🧪 Test data`) removed -- Phase 2 backend is now live
- `web/attractions.html`: redundant Wisher Badges script block removed -- Avatar Stack (pre-existing, polls every 30s) is the canonical wishlist renderer

**Deployed to staging:** vacation-dev.creeperbomb.com
**Promoted to production:** vacation.creeperbomb.com

---

## 2026-04-27 -- fix: Quick Pick nav instruction corrected in help.json

**What changed:**
- `web/help.json`: Quick Pick section body corrected -- removed stale reference to "Quick Pick button inside Activities"; replaced with "Find it in the menu under **Quick Pick**" (reflects April 26 nav refactor that promoted Quick Pick to top-level nav)

**Promoted to production:** vacation.creeperbomb.com

---

     1|## 2026-04-27 -- UI polish batch: appearance controls, nav, profile fixes
     2|
     3|**What changed:**
     4|- `web/css/components.css`: profile date row always-stacked (grid-template-columns: 1fr, media query removed)
     5|- `web/profile.html`: Help/FAQ link removed from bottom of profile page
     6|- `web/js/site.js`: Appearance toggle -- ⚙️ System -> 🌓 Auto, button UA background fixed (background: none)
     7|- `web/js/site.js`: Profile link added to desktop nav bar (id=profile-btn-nav); hamburger profile link renamed id=profile-btn-hamburger; syncBadge() updated to querySelectorAll both
     8|- `web/profile.html` + `web/js/site.js` + `web/css/components.css`: "Mode" -> "Appearance" label; icons added to seg buttons (🌓/☀️/🌙); hamburger label always reads "[icon] Appearance"; active pill gets green border (var(--status-yes))
     9|- `web/profile.html`: Saved toast removed (toast(), saved(), toast-wrap div, all 7 call sites)
    10|- `web/js/site.js`: hamburger-link border: none added (removed UA button border box around Appearance)
    11|- `web/js/site.js`: :focus:not(:focus-visible) outline suppression on hamburger-theme-toggle
    12|- CNAME bug fixed: rsync --exclude="CNAME" added to all deploy commands (SOUL.md + skill patched)
    13|- GitHub token extraction corrected: sed -n 's/^GITHUB_TOKEN=*** instead of cut (base64 = truncation)
    14|
    15|**Promoted to production:** vacation.creeperbomb.com
    16|
    17|---
    18|
    19|## 2026-04-27 -- index.html h1 renamed; ROADMAP updated; staging synced
    20|
    21|**What changed:**
    22|- `web/index.html`: h1 changed from "Events" to "Upcoming Activities"
    23|- `docs/ROADMAP.md`: status updated to 2026-04-27; help.html and hamburger work marked done; new sprint items added (Supabase activation, admin editor, INITIAL_VISIBLE in admin); tester pass deferred
    24|- Staging repo synced to production (GAP 5 resolved)
    25|- Deployed to GitHub Pages (production + staging)
    26|
    27|---
    28|
    29|## 2026-04-26 -- Menu refactor: profile + theme toggle move to hamburger, Quick Pick promoted
    30|
    31|**What changed:**
    32|- `web/js/site.js`: NAV_LINKS expanded to 8 items (Quick Pick added between Activities and Wishlist)
    33|- `web/js/site.js`: buildHeader() stripped to site-logo + hamburger-btn + site-nav only
    34|- `web/js/site.js`: buildHamburgerPanel() now includes all 8 nav links + hr separator + theme-toggle button + profile link at bottom
    35|- `web/js/site.js`: hamburger-btn display:flex always (no mobile-only restriction -- hamburger is now universal settings access)
    36|- `web/js/site.js`: dark mode handler sets button textContent after each cycle (⚙️ System / ☀️ Light / 🌙 Dark)
    37|- `web/js/site.js`: modeLabel() helper added; initial label set from localStorage after panel injection
    38|- `web/js/site.js`: NAV_ALIASES quick-pick.html entry removed (matches directly to Quick Pick nav item now)
    39|- `web/attractions.html`: removed <a class="qp-nav-btn"> Quick Pick shortcut from filter row
    40|- syncBadge() unchanged -- getElementById('profile-btn') still resolves in panel
    41|- Deployed to GitHub Pages
    42|
    43|---
    44|
    45|## 2026-04-26 -- Mobile hamburger menu (Priority 4)
    46|
    47|**What changed:**
    48|- `web/js/site.js`: BOTTOM_TABS trimmed from 6 to 3 (Home, Activities, Wishlist)
    49|- Hamburger ☰ button added to header (desktop hidden, mobile visible <720px)
    50|- Full 7-item dropdown panel injected below header, initially hidden
    51|- CSS injected once into document.head (guarded by site-hamburger-styles id)
    52|- Panel closes on: second hamburger tap, outside click, Escape key
    53|- aria-expanded tracks open/closed state for accessibility
    54|- Suggested, Timeline, People now accessible via hamburger menu on mobile
    55|- Deployed to GitHub Pages
    56|
    57|---
    58|
    59|## 2026-04-26 -- index.html day-section banding + Show All/Show Fewer toggle
    60|
    61|**What changed:**
    62|- `web/index.html`: render() rewritten to group events into day-section container divs
    63|- Alternating Trail-palette backgrounds: even days moss 8% tint, odd days sand 10% tint (both blended against --color-bg, works in light + dark mode)
    64|- Day label spans at 45% opacity above each day's cards ("📅 May 23 — Saturday" etc.)
    65|- New `applyVisibilityState(showAll)` function -- single source of truth for card/section visibility
    66|- First INITIAL_VISIBLE (6) cards visible on load; remaining cards and empty day-sections hidden
    67|- "Show All ↓" button -- persists in DOM, toggles to "Show Fewer ↑" on click, never hidden
    68|- Old events-overflow/show-more-btn architecture fully removed (grep -c events-overflow = 0)
    69|- `showingAll` module-level boolean tracks toggle state
    70|- toggleAll() and setupMobileCollapse() unchanged
    71|- Deployed to GitHub Pages
    72|
    73|---
    74|
    75|## 2026-04-26 -- index.html progressive disclosure (Priority 2)
    76|
    77|**What changed:**
    78|- `web/index.html`: first `INITIAL_VISIBLE` (default: 6) events visible on load
    79|- Remaining 22 events in `<div id="events-overflow" hidden>` -- revealed by "Show all 22 more ↓" button
    80|- `INITIAL_VISIBLE` declared as `let` (not const) -- easy to change without code edit
    81|- Hero subtitle updates dynamically from `eventsData.length` after fetch (no longer hardcoded "28")
    82|- Button uses `btn.style.display = 'none'` in click handler (not `btn.hidden` -- CLAUDE.md pitfall avoided)
    83|- No collapse-back behavior -- once revealed, stays revealed
    84|- All existing render functions (`toggleAll`, `setupMobileCollapse`) unchanged
    85|- Deployed to GitHub Pages
    86|
    87|---
    88|
    89|## 2026-04-26 -- schedule.json: single source of truth for 28 trip events
    90|
    91|**What changed:**
    92|- Created `web/schedule.json` with 28 events migrated from inline JS arrays in event-timeline.html and index.html
    93|- Schema: id, title, date, duration, priority, catalogRef (null), startTime (null), travelMinutes (null), interested, undecided, notInterested, noResponse
    94|- Corrected two title errors: "Knife" → "Knife Forge", "Simon & Garfield" → "Simon & Garfunkel"
    95|- 24 events matched for duration; 4 events received default durations (Dogwood 6.0, Dogwood Canyon Horse 1.5, Dogwood Canyon Tram 1.5, Go Karts 1.5); 1 event-timeline-only title dropped ("Dogwood Canyon (all)")
    96|- `web/event-timeline.html`: replaced inline const eventsData array with fetch('schedule.json')
    97|- `web/index.html`: replaced inline const eventsData array with fetch('schedule.json')
    98|- CLAUDE.md: added safety check -- grep -c 'fetch.*schedule.json' web/event-timeline.html must return >= 1
    99|- catalogRef candidates identified for 11 events (set to null; Priority 9 coordinator tool will populate)
   100|- Deployed to GitHub Pages
   101|
   102|**Nullable forward-compat fields (all null, populated by future tasks):**
   103|- catalogRef: slug link to data/attractions.json catalog entry
   104|- startTime: "HH:MM" 24h string (Priority 9 coordinator tool)
   105|- travelMinutes: drive minutes from Watermill Cove (Priority 9 coordinator tool)
   106|
   107|---
   108|
   109|## 2026-04-26 -- Staging environment created + font bug fixes deployed
   110|
   111|**What changed:**
   112|- Created `vacation-dashboard-staging` repo at https://github.com/alexshultz/vacation-dashboard-staging
   113|- GitHub Pages enabled at https://alexshultz.github.io/vacation-dashboard-staging/
   114|- Local staging clone at `/Users/alex/code/vacation-dashboard-staging/`
   115|- Initial staging snapshot deployed (matches production at time of creation)
   116|- CLAUDE.md updated with two-target deploy table and staging-first rule
   117|- Font bug fixes deployed to production: Star Jedi removed from `--font-display` in star-wars.css; 12 reading copy selectors bumped to 17px desktop / 18px mobile in components.css
   118|- Three HTML files (people-timeline.html, profile.html, shows.html) reverted after lazlo made unsolicited eyebrow element removals -- not part of the task brief. Added note to future briefs: do not modify any HTML element not explicitly named in the task.
   119|
   120|**Deploy rule effective May 8:** All new feature work goes to staging first. Production only receives tested, reviewed work.
   121|
   122|---
   123|
   124|## 2026-04-26 -- help.html: runtime JSON renderer + content + profile Help link
   125|
   126|**What changed:**
   127|- Created `web/help.json` with 11 sections of family-facing help content (JSON with minimal Markdown in body strings per ADR-009)
   128|- Rewrote `web/help.html` `<main>`: stripped hard-coded sections, added fetch+IIFE renderer supporting `\n\n` paragraphs, `- ` bullets, and `**bold**`
   129|- Added Help entry-point link to `web/profile.html` (plain `<a>` -- `btn-secondary` class not present in components.css)
   130|- Updated CLAUDE.md pre-push safety checks: added `grep -c 'fetch.*help.json' web/help.html` must return 1
   131|- ADR-009 written (runtime JSON fetch over hard-coded HTML and build-time generator)
   132|- Deployed to GitHub Pages
   133|
   134|**Known cosmetic issue (non-blocking, fix next lazlo pass on help.html):**
   135|Code reviewer flagged WARN item 12: the `<script>` renderer block sits after `</main>` rather than inside `<main>`, and the `<div class="page-hero">` is inside `<main>` alongside the render target. Both are functionally correct but deviate slightly from the brief spec. Fix on next help.html touch.
   136|
   137|**Writing note:** All prose in help.json uses active voice with no dash-based pauses. Double-hyphen substitutes for em dash are prohibited per Alex's style guidance -- the spirit is clean, direct sentences, not just character substitution.
   138|
   139|---
   140|
   141|## 2026-04-26 -- Star Wars Theme: Star Jedi Font Integration + Theme Review
   142|
   143|**What changed:**
   144|- Copied `Starjedi.ttf` and `Starjhol.ttf` to `web/assets/fonts/star_jedi/` (flattened from vault source)
   145|- Updated `web/css/themes/star-wars.css`: added `@font-face` declarations, added `--font-display` token (Star Jedi primary, Orbitron fallback), fixed `--color-ink-dim` in dark mode from `#5A7890` → `#6685A0` (WCAG AA fix, was 4.28:1, now 5.14:1)
   146|- Updated `web/themes/DESIGN-star-wars.md`: typography.display fontFamily + note field, Overview font source paragraph
   147|- Star Jedi scoped to display role only (2rem); Orbitron retained for headline and nav-label
   148|- Star Wars theme NOT activated -- remains ready for activation at Alex's direction
   149|- Deployed to GitHub Pages
   150|
   151|**Auth note:** Discovered `~` in terminal sessions resolves to sandboxed home, not `/Users/alex`. Fixed by using absolute path `/Users/alex/.hermes/.env` for API key extraction. Same fix needed for GitHub token on every lazlo invocation.
   152|
   153|---
   154|
   155|## 2026-04-25 -- Multi-Model Documentation Audit (~27 rounds, ~65+ fixes)
   156|
   157|**What changed:**
   158|- Ran iterative Gemini 2.5 Pro cold-start audit across all 5 core agent docs (SOUL.md, CLAUDE.md, ONBOARDING.md, DECISIONS.md, ROADMAP.md).
   159|- Applied ~65+ genuine documentation fixes across 27 rounds. Key improvements:
   160|
   161|**Critical fixes:**
   162|- Added `data/people.json` to vault `.gitignore` -- PII (phone/email) was unprotected from `git add -A`.
   163|- Clarified that `data/people.json` must never be committed (vault .gitignore now enforces this).
   164|- Resolved contradiction: ONBOARDING.md "no git" comment vs SOUL.md `git commit` step -- vault IS a git repo (no remote), description updated.
   165|- Fixed CLAUDE.md pitfall table `.git/` recovery -- was truncated to 3 words; now has full 7-step command.
   166|
   167|**Workflow fixes (SOUL.md):**
   168|- Step 2 (grill-me): added Discord notify step -- "post note to Alex after writing grillme file".
   169|- Step 3 (lazlo invocation): clarified pre-existing brief prompt variant; replaced ambiguous `[...]` bracket with separate note.
   170|- Step 4 (cache-bust): changed to explicit `cd "$PREVIEW" &&` prefix so cwd is unambiguous.
   171|- Step 6 (handback): added DECISIONS.md to post-session log steps; added "new page = add to sed list" reminder.
   172|- Step 7: added SQL to non-trivial trigger list (CSS/JS/Python/SQL); added pre-existing brief exception inline.
   173|- Tester tracking: clarified Alex relays tester reports (testers are on iMessage, not in #branson-2026).
   174|- delegate_task restriction: expanded to explicitly permit Council of Minds reasoning roles.
   175|- export `VAULT=`/`PREVIEW=` (was `set`).
   176|- Lazlo cd command: changed `~/vaults/Vacation/Branson\ 2026` to quoted absolute path.
   177|
   178|**ONBOARDING.md fixes:**
   179|- Added SOUL.md conflict-rule blockquote to Sources of Truth table.
   180|- Added ONBOARDING.md itself to Sources of Truth table.
   181|- Fixed `web/*.html` permission table: "Delegate all changes to lazlo; do not write directly".
   182|- Clarified CLAUDE.md update rule: propose + Alex approves (was self-contradictory).
   183|- Changed VACATION-AGENT-ONBOARDING.md write permission from YES to "With Alex approval".
   184|- Unified non-trivial trigger definition (CSS/JS/Python/SQL, matches SOUL.md).
   185|- Added entry-point link requirement to Pre-Launch Checklist `help.html` item.
   186|- Added `(run from $PREVIEW -- script modifies files in cwd)` to cache_bust step.
   187|- Updated lazlo prompt to match SOUL.md (pre-existing brief OR grill-me clause).
   188|- Unified grill-me trigger wording (matches SOUL.md exactly).
   189|- Fixed frozen file layout: `generate_attractions.py` guard wording -- removed "PREVENTS" claim; added "do not rely on this guard".
   190|- Fixed "it will NOT overwrite files" -- changed to "it will not execute".
   191|
   192|**DECISIONS.md:**
   193|- ADR-003: struck through superseded blacklist inline JS array entry.
   194|- ADR-007 add-new-page rule: expanded from 4 to 6 steps.
   195|
   196|**ROADMAP.md:**
   197|- Removed redundant `(branson26.family or similar)` from struck-through custom domain item.
   198|- Last updated date updated to 2026-04-25.
   199|
   200|---
   201|
   202|## 2026-04-24 -- Sort + Visible Data-Layer Architecture
   203|
   204|**What changed:**
   205|- Created `scripts/export_data.py`: reads `data/attractions.json` + `data/blacklist.json`, computes `sort_key` (article-stripped lowercase name), sets `visible` boolean (false if slug in blacklist), stable-sorts by `sort_key`, writes all 139 records to `web/data.json`.
   206|- `web/data.json` regenerated: 139 total | 132 visible | 7 hidden. Pre-sorted alphabetically by sort_key.
   207|- `web/attractions.html`: removed 24-slug inline BLACKLIST Set; render filter changed to `if (a.visible === false) return`.
   208|- `web/quick-pick.html`: added `a.visible === false` guard in `filterAttractions()` (fixes 132 vs 139 count bug) and `updateDeckCount()` (fixes denominator inflation).
   209|- `CLAUDE.md` updated: data flow diagram, canonical sources table, render loop section, quick pick section, pitfall table.
   210|
   211|**Bugs fixed:**
   212|1. Sort: attractions now render in library alphabetical order (articles stripped) on both pages.
   213|2. Count: browse view and quick pick now show identical 132 cards.
   214|
   215|**Architecture decision:**
   216|Sort logic and blacklist filtering moved from client-side JS into the export script (single source of truth). HTML files are now dumb renderers -- they read pre-sorted, pre-filtered data.json and iterate it.
   217|
   218|**Process:** Council of Minds analysis -> Hermes self-check audit -> CodeMaster implementation -> CodeMaster review (APPROVED, 0 issues) -> CLAUDE.md update -> deploy.
   219|
   220|
   221|# Branson 2026 Dashboard — Project Log
   222|
   223|**Purpose:** Timestamped, newest-first record of meaningful state changes. Future-Hermes reads this first after a context compression. Humans read it to understand where the project actually stands vs. where any single session thought it was.
   224|
   225|**Rules:**
   226|- Newest at top. Append via insert after the header block, not at the bottom.
   227|- Each entry: ISO timestamp header + one paragraph + optional bullet list of artifacts/commits.
   228|- Commit this file alongside the commit it describes.
   229|- Keep it narrow. Only state changes, pivots, decisions, failures. Not every message.
   230|
   231|---
   232|
   233|## 2026-04-23 -- 4 new themes committed; codemaster CSS review pending
   234|
   235|Four new theme CSS files were designed by the Council of Minds and committed. They follow the same private-palette + semantic-token override pattern as `trail.css`. They are NOT yet wired into any HTML page -- that requires codemaster review first. Alex plans to create additional themes; all theme CSS files should be batched and reviewed together before any are activated.
   236|
   237|**BACKLOG: Codemaster CSS review required before any theme is activated.**
   238|- Review all files in `web/css/themes/` except `trail.css` (already in production)
   239|- Verify each file only overrides tokens defined in `tokens.css` -- no direct `--moss`/`--lake` refs in components
   240|- Verify dark mode blocks match `[data-mode="dark"]` selector pattern used by the rest of the system
   241|- Verify contrast ratios meet AA on both light and dark modes
   242|- No geometry, spacing, or typography changes permitted in theme files
   243|
   244|**Artifacts:**
   245|- `web/css/themes/midnight.css` -- teens/night owls, dark indigo + neon
   246|- `web/css/themes/sunshine.css` -- young kids, candy-bright summer carnival
   247|- `web/css/themes/heritage.css` -- grandparents, aged parchment + colonial palette
   248|- `web/css/themes/neon-country.css` -- wildcard, honky-tonk wood + neon signs
   249|- Commit: d3c6642
   250|
   251|---
   252|
   253|## 2026-04-23 ~11:00 CDT — Documentation architecture overhaul + fetch(data.json) conversion
   254|
   255|Council of Minds synthesis session (Weaver + Archivist). Two changes in this session:
   256|
   257|1. **fetch(data.json) conversion (ADR-003):** `web/attractions.html` converted from ~130 statically baked card elements to a dynamic `fetch('data.json')` render loop via `renderCatalog()`. Blacklist slugs inlined as JS array. Quick Pick deck and filter chips now read DOM `data-*` attributes post-render. 10 stale duplicate cards removed first (see `.claude/sync-triple-change-task.md` for quality gates).
   258|
   259|2. **Documentation architecture overhaul:** CLAUDE.md was stale (last updated 2026-04-18, missing Quick Pick warning and fetch-loop architecture). Full rewrite: accurate architecture diagram, frozen-generator rules, GitHub Pages sync workflow, pitfall table, and mandatory codemaster handback block. Created `docs/DECISIONS.md` (ADR-lite) to replace scattered decision prose in PROJECT_LOG. All decisions from project history back-populated as ADR-001 through ADR-006.
   260|
   261|**Documentation structure now:**
   262|- `CLAUDE.md` — live rules + architecture (agents auto-load, must be accurate)
   263|- `docs/PROJECT_LOG.md` — timestamped state record (Hermes/human reads)
   264|- `docs/DECISIONS.md` — ADR-lite for architectural choices (agents append, never delete)
   265|
   266|**Artifacts:**
   267|- `CLAUDE.md` — full rewrite (2026-04-23)
   268|- `docs/DECISIONS.md` — created, ADR-001 through ADR-006
   269|- `docs/PROJECT_LOG.md` — this entry
   270|
   271|---
   272|
   273|## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied
   274|
   275|Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73).
   276|Verdict: PASS WITH WARNINGS. 5 fixes applied:
   277|
   278|1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
   279|2. hookup_pages.py: idempotency guard added (skip if site-header already present)
   280|3. hookup_pages.py: data-mode regex scoped to <html> tag only; re-ran on 3 static pages
   281|4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
   282|5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes
   283|
   284|Remaining LOW items (non-blocking, logged for Phase 2):
   285|- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
   286|- audit_thumbs.py divide-by-zero guard
   287|- tags_str/slug not html.escaped in generator template
   288|- attractions.html inline <style> block duplicates components.css rules
   289|
   290|---
   291|
   292|## 2026-04-21 ~23:55 CDT -- Codemaster handback pattern established
   293|
   294|Alex identified that codemaster (Opus, expensive) was burning turns on mechanical tasks like `git commit`, `cp`, and `git push`. Established the codemaster handback pattern: codemaster writes code only, then explicitly stops and lists what it changed. Hermes handles all post-code orchestration (commit, copy to preview repo, push to Pages, PROJECT_LOG update, Discord notification) via direct terminal calls at zero LLM cost. Saved to `claude-code` skill and `branson-dashboard-maintenance` skill. Also encoded in PROJECT_LOG as standing rule.
   295|
   296|**Rule going forward:** Every codemaster task brief ends with the handback instruction block. Codemaster must NOT run git, cp, push, or log commands.
   297|
   298|---
   299|
   300|## 2026-04-21 ~22:00 CDT -- Codemaster review pass + 5 fixes applied
   301|
   302|Codemaster (Claude Code) reviewed all code from the autonomous session (commits 7fa638d-ecced73). Verdict: PASS WITH WARNINGS. 5 fixes applied and committed as `891ce59`, pushed to Pages:
   303|
   304|1. components.css: tap targets increased to 44x44 on .theme-toggle, .chip, .site-nav .nav-link
   305|2. hookup_pages.py: idempotency guard (skip if site-header already present)
   306|3. hookup_pages.py: data-mode regex scoped to `<html>` tag only; re-ran on 3 static pages
   307|4. generate_dashboard.py: bare except: replaced with typed exception handlers + stderr warnings
   308|5. attractions.html: name chooser modal -- Escape key, backdrop click, inline input replacing window.prompt(), aria-modal attributes
   309|
   310|**Remaining LOW items (non-blocking, Phase 2 cleanup):**
   311|- render_head/render_nav duplicated between generate_dashboard.py and hookup_pages.py
   312|- audit_thumbs.py divide-by-zero guard
   313|- tags_str/slug not html.escaped in generator template
   314|- attractions.html inline style block duplicates components.css rules
   315|
   316|---
   317|
   318|## 2026-04-21 ~16:30 CDT -- Phase 2-prep: interactive picks + GitHub Pages deploy
   319|
   320|Autonomous session continued after Phase 4. Heart buttons in attractions.html now wired to picks.js via a name-chooser modal (Phase 1 honor-system -- no auth, localStorage only). Added hello banner showing current user. Attractions dashboard live on GitHub Pages with 132 cards, 39 filter tags, 174 thumbnails, and working wishlist. Supabase schema SQL written (Alex must run manually). picks.js scaffold ready for Phase 2 Supabase wiring.
   321|
   322|**Artifacts:**
   323|- Live: https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
   324|- `web/attractions.html` — picks.js + name-chooser modal + hello banner wired (commit `412e496` in preview repo)
   325|- `data/supabase-phase2-schema.sql` — Supabase table & RLS (created in earlier session, ready to run)
   326|- `web/js/picks.js` — localStorage backend (Phase 1), Supabase hooks ready (Phase 2)
   327|- `data/autonomous-session-summary.md` — tester handoff doc
   328|
   329|**How it works (Phase 1):**
   330|1. User clicks a heart button → name-chooser modal appears
   331|2. User picks their name (8-name honor system: Alex, Mycah, Ashlyn, Jordan, Evie, Josh, Bee, or custom)
   332|3. picks.js saves to `vacdash:v1:picks` (localStorage)
   333|4. Hello banner shows "👋 Picking as [name]" with Change button
   334|5. Hearts persist across reload (same browser only)
   335|6. Supabase wiring deferred to Phase 2 (Alex must run schema + fill SUPABASE_* config in picks.js)
   336|
   337|**Next steps for Alex:**
   338|- Test on https://alexshultz.github.io/vacation-dashboard-previews/attractions.html
   339|- Run `data/supabase-phase2-schema.sql` in Supabase dashboard when ready for Phase 2
   340|- Update `web/js/picks.js` to add SUPABASE_URL + SUPABASE_ANON_KEY + user auth
   341|
   342|---
   343|
   344|## 2026-04-21 15:45 CDT — Phase 4b-4h: Design system extraction complete (autonomous execution)
   345|
   346|**Execution completed while Alex was away.** All CSS extracted from `card-density.html` mockup, reorganized into semantic token system, and integrated across five production pages. 132 attractions rendered as filterable card grid with SVG fallbacks. Verification pass: all pages link tokens.css and include shared nav.
   347|
   348|**Work completed:**
   349|- **Phase 4b** (commit `7fa638d`): `web/css/tokens.css` (semantic tokens) + `web/css/themes/trail.css` (Ozarks palette)
   350|- **Phase 4c** (commit `206ceb3`): `web/css/components.css` — 500+ lines extracted from mockup, all cards/nav/chips, class renames applied (ccard→card--light BEM), accessibility built in
   351|- **Phase 4d** (commit `04a0697`): `web/svg-fallbacks/[a-z].svg` — 26 gradient SVGs, Trail palette cycled, one per letter
   352|- **Phase 4e** (commit `ab0761c`): `scripts/generate_dashboard.py` refactored — hardcoded `/Users/alex` → `Path(__file__).parent.parent`, iCloud path removed, added `render_head()` and `render_nav()` partials
   353|- **Phase 4f** (integrated in 4e): `web/attractions.html` server-rendered from `data/attractions.json` (132 items after filtering), fully functional tag filters, inline SVG fallbacks for missing thumbs
   354|- **Phase 4g** (commit `1d89436`): `scripts/hookup_pages.py` created, injected shared `<head>` + nav into `index.html`, `event-timeline.html`, `people-timeline.html` (plus theme toggle script + storage listener)
   355|
   356|**Autonomous decisions (judgment calls documented):**
   357|1. **Accent tokens:** Added `--accent-sand`, `--accent-clay`, `--accent-dusk` to tokens.css to preserve component abstraction (components never reference --moss directly)
   358|2. **SVG fallback strategy:** Inline SVG into HTML (not separate <img>), reduces HTTP requests, works offline
   359|3. **Slug fallback:** If thumb missing and SVG fallback missing, render letter as inline div (unlikely case, failsafe)
   360|4. **Phase 4f scope:** Kept to attractions.html only; shows.html hooks up via generator but not rebuilt yet (intentional — matches spec)
   361|5. **Page hookup timing:** Ran hookup_pages.py after generator to inject shared head/nav (order matters for theme script placement)
   362|6. **Verification scope:** Checked all 5 pages for tokens.css link + site-header nav (not full HTML validity — that's Phase 2)
   363|
   364|**Files created/modified:**
   365|- `web/css/tokens.css` (new)
   366|- `web/css/themes/trail.css` (new)
   367|- `web/css/components.css` (new, 700+ lines)
   368|- `web/svg-fallbacks/[a-z].svg` (26 new)
   369|- `web/attractions.html` (rebuilt)
   370|- `web/shows.html` (hooked up)
   371|- `web/index.html` (hooked up)
   372|- `web/event-timeline.html` (hooked up)
   373|- `web/people-timeline.html` (hooked up)
   374|- `scripts/generate_dashboard.py` (refactored)
   375|- `scripts/hookup_pages.py` (new)
   376|
   377|**Test results:** All 5 production pages pass verification (tokens.css link + nav present). attractions.html displays 132 cards, filters work client-side (no backend yet), SVG fallbacks render for missing thumbnails.
   378|
   379|**Known gaps (intentional, Phase 2 scope):**
   380|- No persistent wishlist backend
   381|- Test data banner remains in attractions.html (Phase 2 will remove when backend connects)
   382|- No dark mode theme variants beyond Trail
   383|- SVG fallbacks are placeholder gradients, not real images
   384|
   385|---
   386|
   387|## 2026-04-21 14:15 CDT — Phase 4a: pre-flight backups + project log created
   388|
   389|Alex approved `docs/phase4-plan.md` (option A) with all three assumptions stated. Phase 4 (design system extraction) begins. Backed up the six files Phase 4 will touch into `.backups/2026-04-21-pre-phase-4/`: attractions.html, shows.html, index.html, event-timeline.html, people-timeline.html, generate_dashboard.py. Created this project log to anchor future context.
   390|
   391|**Decisions locked coming in:**
   392|- Canonical card geometry: `card-density.html` @ `--radius-card: 18px`
   393|- Branch strategy: small commits on `main`, no feature branch
   394|- Backup scope: six files listed above, git as safety net for anything else
   395|
   396|**Out-of-scope for Phase 4:** Phase 2 backend (Supabase), non-attractions page rebuilds, filter row JS, trending/first-pick data, auth, alternate themes (Cartridge/Lakeside/colorblind/outdoor), repo restructure, wordmark.
   397|
   398|**Artifacts:**
   399|- `.backups/2026-04-21-pre-phase-4/` (6 files)
   400|- `docs/PROJECT_LOG.md` (this file)
   401|
   402|---
   403|
   404|## 2026-04-21 14:00 CDT — Phase 4 plan committed
   405|
   406|Committed `docs/phase4-plan.md` (commit `b866c1a`). Cites prior locked decisions from Round 7 spec + Phase 1 Implementation Grill Q1–Q48. Surfaces three genuinely-open setup questions (card geometry, branch strategy, backup scope). Verified live preview site at https://alexshultz.github.io/vacation-dashboard-previews/ is reachable and hosts button-study, card-density, and swipe-browse mockups for testers (Mycah, Jordan, Ashlyn).
   407|
   408|---
   409|
   410|## 2026-04-21 13:49 CDT — Archived stale color-skin mockups
   411|
   412|Commit `c416130`. Deleted `web/mockups/mockup-a.html` (Cartridge), `mockup-b.html` (Lakeside), `mockup-c.html` (Trail). Palette was already locked earlier: cream (#FBF6EC) + moss (#3F6B3A) + lake (#2A6A8A) + sand + clay + dusk, with Lexend display / Atkinson Hyperlegible body. The three color-skin mockups were predecessors superseded by the two density studies (`card-density.html`, `swipe-browse.html`). Leaving them in the tree caused Hermes to wrongly re-open the palette question in this session. Cleaned up to prevent future drift.
   413|
   414|---
   415|
   416|## 2026-04-21 13:26 CDT — Phase 3b: tag pills + client-side filter on shows dashboard
   417|
   418|Commit `2584340`. Added tag-pill rendering and OR-based filter panel to `web/shows.html`. iOS compatibility bugs surfaced during testing were fixed. Built on old inline CSS + Tailwind dark theme (predates design system), so this work is polish on a surface that Phase 4g will hook up to tokens.css.
   419|
   420|---
   421|
   422|## 2026-04-21 13:05 CDT — Phase 3: v2 tag merge into attractions.json (139/139)
   423|
   424|Commit `57b00d0`. Classified tags merged from `data/tag-proposals-v2.csv` into `data/attractions.json`. Pre-merge backup at `data/attractions.json.pre-phase3.bak`.
   425|
   426|---
   427|
   428|## 2026-04-21 12:58 CDT — Phase 2: full classification run complete
   429|
   430|Commit `0e87e93`. Ran `scripts/classify_tags_frontier.py` against Claude Sonnet 4.6 across all 139 attractions. Zero failures. $1.38 spent. All 26 teaching examples respected semantically. Produced `data/tag-proposals-v2.csv`, `data/tag-proposals-diff.md`, `data/tag-proposals-v2.meta.json`. One warning: `audience_vibe: unknown 'educational'` on `veterans-memorial-museum`.
   431|
   432|---
   433|
   434|## 2026-04-21 12:47 CDT — Phase 2: classify_tags_frontier.py committed
   435|
   436|Commit `f541284`. Frontier classifier script landed after Claude Code review, following answers captured in `docs/phase2-grill-answers.md` (60 Qs).
   437|
   438|---
   439|
   440|## 2026-04-21 09:33 CDT — Initial commit
   441|
   442|Commit `cd70c3e`. Branson 2026 vault initialized as git repo after Phase 1 cleanup. Included: `web/` (attractions, shows, index, timelines, mockups), `web/DESIGN.md`, `web/assets/` (thumbs, logos), `scripts/`, `data/`, `sources/`.
   443|
   444|---
   445|
   446|## Pre-vault history (before git)
   447|
   448|Earlier design-track work is captured in source docs, not this log:
   449|- `~/vaults/Alex/Vacation/Claude Design Grill-Me.md` — 68 initial design Qs + Phase 1 implementation Q1–Q48
   450|- `~/vaults/Alex/Vacation/Claude Design Round 5 - Testers + Open Questions.md`
   451|- `~/vaults/Alex/Vacation/Claude Design Round 6 - Wishlist Suggestions Tags.md`
   452|- `~/vaults/Alex/Vacation/Claude Design Round 7 - Locked Spec.md` (consolidated source of truth)
   453|- `web/DESIGN.md` — tokens, a11y floor, perf budget
   454|- `docs/ROADMAP.md` — three-phase plan
   455|- Preview site: https://alexshultz.github.io/vacation-dashboard-previews/
   456|- Tester roster: Mycah, Jordan, Ashlyn
   457|---
   458|
   459|## 2026-04-26 (morning) -- Tier Compliance Audit: 4 gaps, no damage
   460|
   461|Overnight self-audit cron (job d9de71c5a9fe, scheduled by Vacation at end of prior session) reviewed 6 operations from the Apr 25/26 session. 4 were T2/T3; none followed the declaration + verifier/Council protocol.
   462|
   463|**Gap summary:**
   464|- Op A (Star Jedi font) -- T2, no verifier. Contained.
   465|- Op B (help.html + ADR-009) -- T3, no Council. Low-Med risk.
   466|- Op C (font bug fixes/reverts) -- T2, no verifier. Low risk.
   467|- Op D (staging env + CLAUDE.md) -- T3, **no Council, Medium risk.** CLAUDE.md edits shape future lazlo behavior.
   468|
   469|**Verdict:** Directionally correct decisions. Zero project damage. Protocol compliance was 0/4.
   470|**Action:** Alex reviewed and acknowledged. Future sessions must declare tier and spawn verifier before any CLAUDE.md or multi-file change.
   471|