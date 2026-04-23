# DESIGN.md -- Branson '26 Design System Reference

> **AGENT INSTRUCTION:** This file is the primary design reference for AI coding agents working on this project. Read it before writing or modifying any CSS, HTML, or JS that affects visual output. If any value here contradicts the live CSS files, the CSS files win -- use grep to verify. See CLAUDE.md for architectural rules and forbidden operations.

**Last updated:** 2026-04-23
**Primary reader:** AI coding agents (Claude Code, codemaster)
**Secondary reader:** Alex (developer/architect)

---

## Orientation (Read First)

This file answers three questions any agent should ask before touching CSS or HTML:

1. **What is the visual contract for this element?** -- See Layer 3 (Component Catalog)
2. **Where in the CSS does it live?** -- See Layer 1 (CSS File Map) + Layer 3 (`Class(es)` field)
3. **If I change this, what breaks?** -- See Layer 1 (Impact Table) + run the grep commands in Section 1

**Drift check -- run at session start:**
```bash
wc -l web/css/tokens.css          # expect ~71
wc -l web/css/components.css      # expect ~1100; if >100 lines different, Layer 3 may be stale
grep -c 'pointerdown' web/attractions.html  # must return 0; if 1, Quick Pick code was re-introduced
ls web/css/themes/                 # expect trail.css (plus any new themes)
```

---

## Before Editing Any CSS: Run These First

```bash
grep -rn "<token-you-are-changing>" web/css/         # find all usages of a token
grep -c 'pointerdown' web/attractions.html            # Quick Pick safety check (must be 0)
grep -n "=====.*=====" web/css/components.css         # section map (find the relevant block)
grep -rn "card--light" web/*.html web/js/             # find all HTML/JS that depends on a selector
```

---

## Layer 1 -- Site-wide Design System

### Design Philosophy

"Airbnb meets National Parks." The Ozarks-inspired Trail theme is warm, natural, and readable at every age -- grandparents squinting at phones in sunlight, kids swiping on small Androids, parents reading at the cabin. The aesthetic is earned outdoors: moss green, lake blue, sand amber, clay terracotta. Never corporate, never cartoony. Playful enough to feel like a vacation, polished enough to feel trustworthy.

Accessibility is a first-class constraint, not a checkbox. Body text never falls below 16px. Color is never the only signal -- every status has an icon or label. All interactive targets are 44x44px minimum.

---

### CSS File Map

| File | Purpose | Contains | Must NEVER contain |
|---|---|---|---|
| `css/tokens.css` | Semantic token layer | All CSS custom properties: colors, spacing, type, radii, shadows | Raw palette names (`--moss`, `--lake`); component rules |
| `css/themes/trail.css` | Ozarks private palette | `--moss`, `--lake`, `--sand`, `--clay`, `--dusk`; semantic token re-assignments | Component rules; new token definitions |
| `css/components.css` | Full component library (~1103 lines) | Every UI component: cards, nav, chips, deck, modal, grid, buttons | References to `--moss`, `--lake`, etc. directly -- always use semantic tokens |

**Load order (every page `<head>`):**
```html
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/themes/trail.css">
<link rel="stylesheet" href="css/components.css">
```
The order is mandatory. Trail overrides tokens; components consume tokens.

---

### Architectural Rules (Hard Constraints)

- Components reference ONLY `--color-*`, `--status-*`, `--accent-*`, `--shadow-*`, `--radius-*`, `--font-*`, `--sp-*`, `--text-*`
- Never hardcode hex values in `components.css` -- always use a token
- Never reference `--moss`, `--lake`, `--sand`, `--clay`, or `--dusk` outside of `themes/trail.css`
- `[hidden]` + `display:flex` always requires a companion `.element[hidden] { display: none; }` rule -- browser UA `[hidden]` loses to author-level `display:flex`
- `generate_dashboard.py` is FROZEN -- never execute it (see CLAUDE.md)
- `data/attractions.json` is canonical; `web/data.json` is its runtime copy -- after editing the former, copy to the latter before deploying

---

### Design Token Inventory

> If this table disagrees with the live `css/tokens.css` file, the CSS file wins.

#### Colors -- Light Mode (tokens.css defaults)

| Token | Value | Semantic Meaning | trail.css mapping |
|---|---|---|---|
| `--color-bg` | `#FBF6EC` | Warm cream page background | -- |
| `--color-surface` | `#FFFDF7` | Card/panel background, near-white | -- |
| `--color-ink` | `#20281E` | Primary text, dark forest | -- |
| `--color-ink-dim` | `#5E6B58` | Secondary text, muted green-gray | -- |
| `--color-line` | `#E4DCC6` | Borders and dividers, warm tan | -- |
| `--status-yes` | `#3F6B3A` | Green -- wishlist / positive / "I'm in" | `var(--moss)` |
| `--status-no` | `#B83A35` | Red -- not going | -- |
| `--status-wishlist` | `#2A6A8A` | Blue -- soft pick / considering | `var(--lake)` |
| `--status-neutral` | `#8B8671` | Gray -- no response yet | -- |
| `--status-lock` | `#6B4C8F` | Purple -- committed / locked in | `var(--dusk)` |
| `--warn` | `#A86A1C` | Amber -- warnings, notes fields | -- |
| `--accent-sand` | `#D8A660` | Warm amber accent (ratings, highlights) | `var(--sand)` |
| `--accent-clay` | `#C1553B` | Terracotta accent (remove X, danger actions) | `var(--clay)` |
| `--accent-dusk` | `#6B4C8F` | Purple accent (same as status-lock) | `var(--dusk)` |
| `--shadow-1` | `0 1px 2px rgba(32,40,30,0.05), 0 6px 18px rgba(32,40,30,0.06)` | Resting card shadow | -- |
| `--shadow-2` | `0 2px 4px rgba(32,40,30,0.08), 0 20px 40px rgba(63,107,58,0.14)` | Elevated / hover shadow | -- |

#### Colors -- Dark Mode Overrides

Applied via `@media (prefers-color-scheme: dark)` AND `[data-mode="dark"]` on `<html>`. Only these tokens change:

| Token | Dark Value |
|---|---|
| `--color-bg` | `#161A14` |
| `--color-surface` | `#1F261C` |
| `--color-ink` | `#F3EEDD` |
| `--color-ink-dim` | `#ADB3A3` |
| `--color-line` | `#343C2F` |
| `--warn` | `#E0B35A` |

#### trail.css Ozarks Palette

| Variable | Hex | Wired to |
|---|---|---|
| `--moss` | `#3F6B3A` | `--status-yes` |
| `--moss-d` | `#284A26` | Darker moss (hover states; not wired to a semantic token by default) |
| `--lake` | `#2A6A8A` | `--status-wishlist` |
| `--sand` | `#D8A660` | `--accent-sand` |
| `--clay` | `#C1553B` | `--accent-clay` |
| `--dusk` | `#6B4C8F` | `--status-lock`, `--accent-dusk` |

---

### Typography

| Token | Value | When to use |
|---|---|---|
| `--font-display` | `Lexend` | Headings (h1-h3), logo, nav links, button labels, chip text -- anything identity-forward |
| `--font-body` | `Atkinson Hyperlegible` | Body copy, card descriptions, metadata, form labels -- anything for sustained reading |
| `--text-xs` | `12px` | Tags, metadata badges, timestamps |
| `--text-sm` | `14px` | Secondary info, nav links |
| `--text-base` | `17px` | Body text (NEVER below 16px) |
| `--text-lg` | `19px` | Card titles, section subheadings |
| `--text-xl` | `22px` | Page section headings |

Line height: `1.5` body, `1.1-1.25` headings. Maximum line length in prose: ~64 characters.

---

### Spacing Scale

| Token | Value | Common use |
|---|---|---|
| `--sp-1` | `4px` | Tight internal gaps (icon-to-label) |
| `--sp-2` | `8px` | Chip internal padding, small gaps |
| `--sp-3` | `12px` | Card internal padding (tight) |
| `--sp-4` | `16px` | Standard horizontal page margin |
| `--sp-5` | `24px` | Section gaps, card external margin |
| `--sp-6` | `32px` | Large section padding |
| `--sp-7` | `48px` | Hero section spacing |
| `--sp-8` | `64px` | Max content width padding |

Use only these values. Do not introduce arbitrary pixel values.

---

### Geometry

| Token | Value | Use |
|---|---|---|
| `--radius-card` | `18px` | Cards (`.card--light`, `.card--dense`), panels |
| `--radius-pill` | `999px` | Chips, badges, pill buttons |
| `--radius-btn` | `10px` | Square-ish buttons, nav links |

---

### Theming -- How to Add a New Theme

To create a new theme (e.g. an "Easter" or "Night Hike" skin):

1. **Create** `web/css/themes/<theme-name>.css`
2. **Override** the semantic tokens you want to change at `:root` level:
   ```css
   :root {
     --color-bg: #FFF0F5;
     --status-yes: #8BBF4D;
     /* ...only tokens that differ from the base */
   }
   ```
3. **Optionally** define private palette names (like `--moss`) and wire them:
   ```css
   :root {
     --clover: #8BBF4D;
     --status-yes: var(--clover);
   }
   ```
4. **Load** the new theme file in `<head>` instead of (or after) `trail.css`
5. **Do not** touch `tokens.css` or `components.css` -- the new file is the only change

**Constraint:** A theme file may only assign values to tokens already defined in `tokens.css`. It must not add new tokens or component rules.

---

### Dark Mode Mechanism

- The `<html>` element carries `data-mode` attribute: `"system"` | `"light"` | `"dark"`
- `localStorage` key: `vacdash:v1:mode` stores the user's choice
- An inline `<script>` in `<head>` (before any CSS) reads localStorage and sets `data-mode` -- this prevents flash-of-wrong-theme
- `tokens.css` handles `[data-mode="dark"]` and `@media (prefers-color-scheme: dark) :root[data-mode="system"]` via CSS selectors
- A storage event listener at end of `<body>` syncs theme changes across open tabs in real time
- The theme toggle button (`.theme-toggle` in `.site-header__inner`) cycles: system -> light -> dark -> system

---

### Site Chrome (Present on Every Page)

Every page shares these elements, defined in `components.css`:

| Element | Selector | Behavior |
|---|---|---|
| Site header | `.site-header` | Sticky, top 0, `z-index: 100`, `backdrop-filter: blur(12px)`, `height: 56px` |
| Inner layout | `.site-header__inner` | `max-width: 1100px`, flex row, `height: 56px` |
| Logo | `.site-logo` | "Branson '26" text, Lexend 800, `color: var(--status-yes)`, links to `index.html` |
| Desktop nav | `.site-nav .nav-link` | Lexend 700 14px, `min-height: 44px`, active state via `aria-current="page"` |
| Theme toggle | `.theme-toggle` | 44x44px circle button, top-right of header |
| Profile button | `.header-profile-btn` | 👤 emoji button, links to `profile.html`, amber dot badge when name not set |
| Bottom tabs | `.bottom-tabs` | Fixed bottom, 6 emoji tabs, hidden on desktop (>=720px) |
| Page main | `.page-main` | `max-width: 1100px`, `padding-bottom: 120px` (clears bottom tab bar) |

---

### Accessibility Floor

- WCAG AA minimum: body text >=4.5:1 contrast ratio, large text >=3:1
- All interactive elements: `min-width: 44px; min-height: 44px` tap target
- Color is never the sole signal -- every status has an icon or text label alongside the color
- Focus-visible outline on every interactive element: at least 2px, 3:1 contrast
- `aria-current="page"` on the active nav link on every page
- Images: meaningful `alt` attribute OR empty `alt` with `aria-label` on parent

---

## Layer 2 -- Per-Page Layout Specs

### index.html

**File:** `web/index.html`
**Purpose:** Trip home screen -- countdown to departure, quick orientation, and entry point to all other pages.
**Data source:** None -- fully static content, no fetch calls.
**Unique layout elements:** Countdown timer or date display; prominent navigation tiles to key pages; prefetch hint for `data.json` (`<link rel="prefetch" href="data.json">` in `<head>`).
**Key JS behavior:** Inline theme loader in `<head>`; storage event listener for cross-tab theme sync; no data-dependent scripts.

---

### attractions.html

**File:** `web/attractions.html`
**Purpose:** Browse all 139 attractions via a filterable card grid -- the main discovery surface.
**Data source:** `fetch('data.json')` at page load via `renderCatalog()`. Blacklisted slugs (24 total) are inlined as a JS array; they are NOT fetched separately. `picks.js` loaded for wishlist heart state.
**Unique layout elements:** Filter row (`.filter-strip` with `.chip` buttons above the grid); live count text (`.live-count`); `.catalog-grid` card grid; detail modal (`.detail-modal`) that opens on card tap; Quick Pick nav button (`<a class="qp-nav-btn" href="quick-pick.html">`).
**Key JS behavior:**
- `renderCatalog()` -- fetches `data.json`, filters blacklist, renders `.card--light` articles into `#catalog-grid`, dispatches `catalog-rendered` event
- Filter IIFE -- listens for `catalog-rendered`, captures cards via `querySelectorAll`, handles chip toggle and grid filtering
- Heart handler -- listens for `catalog-rendered`, wires `.heart-overlay` buttons to `picks.js`
- Detail modal IIFE -- listens for `catalog-rendered`, wires card click to open modal
- Avatar stack IIFE -- listens for `catalog-rendered`, populates `.card--light__avatars` divs

**CRITICAL:** All scripts that query `.card--light` must wait for the `catalog-rendered` event. Cards are not present in DOM at parse time.

---

### shows.html

**File:** `web/shows.html`
**Purpose:** Browse ticketed shows with showtime information.
**Data source:** Static baked-in cards (NOT yet converted to `fetch(data.json)` -- this is a known divergence from attractions.html).
**Unique layout elements:** Showtime display chips; show-specific filter tags (country, comedy, magic, etc.).
**Key JS behavior:** Filter chip handling (similar to attractions but driven by baked DOM cards); no async render loop.

---

### quick-pick.html

**File:** `web/quick-pick.html`
**Purpose:** Swipe-to-decide deck -- a Tinder-style experience for quickly wishlisting attractions.
**Data source:** `fetch('data.json')` at page load. Blacklist slugs are inlined as a JS array (same 24 slugs as attractions.html). `picks.js` loaded.
**Unique layout elements:** `.deck-stage` containing stacked `.deck-card` elements; action buttons (Skip / Wishlist / Undo); progress bar; end-state screen with "Review Wishlist" CTA. No `.catalog-grid`, no baked article cards.
**Key JS behavior:** Full pointer-events drag physics (pointerdown / pointermove / pointerup) for swipe; fly-off animation on decision; keyboard support (arrow keys, Z for undo); localStorage session state at key `vacdash:swipe:progress`; right-swipe calls `picks.set(slug, 'wishlist')`.

**Note:** quick-pick.html is a STANDALONE PAGE. The "Quick Pick" button on attractions.html is a plain `<a href="quick-pick.html">` link, not a mode toggle.

---

### wishlist.html

**File:** `web/wishlist.html`
**Purpose:** Shows the current user's wishlisted attractions in a dense card layout.
**Data source:** `picks.js` state (localStorage + Supabase Phase 2). No `fetch(data.json)`.
**Unique layout elements:** `.dense-stack` grid of `.card--dense` cards; each card has a two-button segmented control (`.seg`) for Wishlist / Committing / Not Going state; remove X button (`.remove-x`).
**Key JS behavior:** `picks.js` drives all content; card state reflects `data-state` attribute; animated removal on "Not Going" selection.

---

### suggested.html

**File:** `web/suggested.html`
**Purpose:** Shows attractions suggested by other family members for the current user.
**Data source:** `picks.js` (for current user identity) + Supabase `suggestions` table (for suggestion records).
**Unique layout elements:** Suggestion cards with "from [Name]" attribution and optional note; accept/dismiss actions; swipe-to-decide layout similar to quick-pick.
**Key JS behavior:** Reads current user from `vacdash:v1:user` localStorage key; fetches suggestions from Supabase where `to_user` matches; renders results.

---

### profile.html

**File:** `web/profile.html`
**Purpose:** User identity and preference settings -- name picker, theme, interests, trip dates.
**Data source:** All `localStorage` -- no fetch calls. localStorage keys used: `vacdash:v1:user`, `vacdash:v1:mode`, `vacdash:v1:arrival`, `vacdash:v1:departure`, `vacdash:v1:interests`, `vacdash:v1:wishlist-privacy`.
**Unique layout elements:** Native `<select>` for 26-person name picker; three-way segmented theme control; interest chip multi-select; date inputs for arrival/departure.
**Key JS behavior:** URL param `?name=Ashlyn` auto-fills and persists name on load; all form controls write to localStorage on change with debounced "Saved" toast; no explicit Save button.

---

### event-timeline.html

**File:** `web/event-timeline.html`
**Purpose:** Gantt-style trip timeline showing scheduled events across the vacation days.
**Data source:** Static schedule data baked into the page (no fetch).
**Unique layout elements:** Day-column Gantt grid; event blocks with time and attendee overlap indicators.
**Key JS behavior:** Minimal -- primarily CSS-driven layout with JS for interactive hover/tap details.

---

### people-timeline.html

**File:** `web/people-timeline.html`
**Purpose:** Per-person attendance overview -- who's at the cabin when, and their wishlisted picks.
**Data source:** Static people data baked into the page (no fetch).
**Unique layout elements:** Attendee list with arrival/departure dates; each name is a tappable link to `profile.html?name=[Name]`.
**Key JS behavior:** Name links navigate to profile.html with `?name=` query param.

---

## Layer 3 -- Component Catalog

### card--light (Browse Card)

**Class(es):** `article.card--light`
**Visual description:** Vertical card with a 16:10 image thumbnail on top, card title (Lexend 700 16px) below, a 2-line hook description in dim text, an avatar stack row, and a minichip row (price, duration, rating). On hover: lifts 2px, shadow deepens to `--shadow-2`. Heart button (`.heart-overlay`) sits in the top-right corner of the thumbnail.
**Use when:** Displaying an attraction in the Browse grid. This is the primary discovery card.
**Do NOT use when:** Showing a detailed/selected attraction (use `card--dense`) or in the swipe deck (use `deck-card`).
**CSS custom properties:** `--radius-card`, `--shadow-1`, `--shadow-2`, `--color-surface`, `--color-ink`, `--color-ink-dim`, `--color-line`
**Variants / states:** No explicit variant classes. State is conveyed via the `.heart-overlay` button's `aria-pressed` attribute (filled = wishlisted).
**Pitfalls for AI agents:**
- Cards are generated at RUNTIME by `renderCatalog()` in `attractions.html` -- they are NOT baked into the HTML. Do not add or edit article cards directly in the HTML source.
- The card template lives in a JS template literal inside `renderCatalog()`. To change card layout, edit that function -- not the HTML.
- All filter chips, the detail modal, and picks.js heart wiring listen for the `catalog-rendered` event before querying `.card--light` elements. If you restructure the render loop, ensure the event still fires after all cards are inserted.
- `data-tags-json` attribute must use HTML-entity-encoded quotes (`&quot;`) because it is embedded inside an HTML attribute.

---

### card--dense (Wishlist/Detail Card)

**Class(es):** `article.card--dense` with `data-state="wishlist"` | `"committing"` | `"not-going"`
**Visual description:** Horizontal card with a square thumbnail on the left and metadata on the right. Three background color states driven by `data-state`. A two-button segmented control (`.seg`) below the metadata for state selection. A small remove button (`.remove-x`) in the top right.
**Use when:** Wishlist page or anywhere a selected/committed attraction needs full metadata visible.
**Do NOT use when:** In a browse grid (too tall) or in the swipe deck.
**CSS custom properties:** `--radius-card`, `--color-surface`, `--color-line`, `--status-yes`, `--status-lock`, `--status-no`, `--accent-clay`
**Variants / states:**
- `[data-state="wishlist"]` -- blue tint background
- `[data-state="committing"]` -- green tint background
- `[data-state="not-going"]` -- red tint, `.removing` animation class triggers slide-out
**Pitfalls for AI agents:**
- Always update the `data-state` attribute AND the `.seg button[aria-pressed]` states together -- they must stay in sync.
- The `.removing` class triggers a CSS animation. Do not remove the element from the DOM before the animation completes.

---

### heart-overlay (Wishlist Button)

**Class(es):** `button.heart-overlay` with `aria-pressed="true"` | `"false"`
**Visual description:** Small circular button, absolute-positioned in the top-right corner of a `.card--light__thumb`. Shows ♡ (unfilled) or ♥ (filled, `--status-yes` color) based on `aria-pressed`.
**Use when:** On every `.card--light` card to allow wishlisting.
**Do NOT use when:** On `.card--dense` cards (which use the `.seg` control instead).
**CSS custom properties:** `--status-yes`, `--color-surface`
**Variants / states:** `aria-pressed="true"` = wishlisted (filled heart, green). `aria-pressed="false"` = not wishlisted (outline heart).
**Pitfalls for AI agents:**
- The `aria-pressed` attribute is the source of truth for visual state. Always toggle it in JS alongside `picks.set()`. Do not rely on class toggling alone.
- The click handler is wired by the heart handler script in `attractions.html`, which listens for the `catalog-rendered` event. If cards are re-rendered without re-dispatching the event, hearts will be inert.

---

### chip (Filter Chip)

**Class(es):** `button.chip` with `aria-pressed="true"` | `"false"` and `data-tag="tagname"`
**Visual description:** Pill-shaped button (radius-pill). Inverts colors when active (`aria-pressed="true"`): background becomes `--color-ink`, text becomes `--color-surface`. Inactive state: surface background, muted ink text, line border.
**Use when:** Filter rows on Browse and Quick Pick pages to narrow the visible card set by tag.
**Do NOT use when:** For navigation actions (use nav links) or for binary on/off toggles with two explicit states (use `.seg`).
**CSS custom properties:** `--radius-pill`, `--color-surface`, `--color-ink`, `--color-ink-dim`, `--color-line`
**Variants / states:** `aria-pressed="true"` = active filter (inverted colors). `aria-pressed="false"` = inactive. The "All" chip has `data-tag=""`.
**Pitfalls for AI agents:**
- The filter IIFE on attractions.html reads `aria-pressed` state synchronously on chip click to determine the active filter. On quick-pick.html, there is a 50ms `setTimeout` before reading `aria-selected` to allow the existing handler to run first.
- Do NOT change the chip element type away from `<button>` -- the filter script queries `button.chip`.

---

### minichip (Price/Duration/Rating Pill)

**Class(es):** `span.minichip` with optional `.price` or `.rating` modifier
**Visual description:** Tiny inline pill (radius-pill) inside `.card--light__row`. Shows formatted text: "from $50", "2h", "★ 4.7". Price chip uses `--status-yes` text; rating chip uses `--accent-sand` text.
**Use when:** Inside `.card--light__row` only, for the three card metadata fields.
**Do NOT use when:** For interactive elements (minichips are display-only spans).
**CSS custom properties:** `--radius-pill`, `--color-line`, `--status-yes` (price), `--accent-sand` (rating)
**Variants / states:** `.minichip` (neutral), `.minichip.price` (green text), `.minichip.rating` (amber text)
**Pitfalls for AI agents:**
- If `price_adult` is null, omit the price minichip entirely -- do not render an empty span.
- The price format is "from $N" with no decimal for whole numbers.

---

### site-header + bottom-tabs (Navigation)

**Class(es):** `.site-header`, `.site-header__inner`, `.site-logo`, `.site-nav`, `.site-nav .nav-link`, `.bottom-tabs`, `.bottom-tabs .tab`
**Visual description:** Sticky top bar (56px tall) with blurred background (backdrop-filter: blur 12px). Logo on the left (moss green), nav links in the middle-right, theme toggle + profile button on the far right. On mobile (<720px), the site nav collapses and a fixed 6-tab bottom bar replaces it with emoji icons.
**Use when:** Every page. Copy from an existing page -- do not build from scratch.
**Do NOT use when:** N/A -- required on all pages.
**CSS custom properties:** `--color-surface`, `--color-line`, `--color-ink`, `--color-ink-dim`, `--status-yes`, `--radius-btn`, `--sp-2`, `--sp-4`, `--font-display`
**Variants / states:** `.nav-link[aria-current="page"]` = active page (green tint background, green text). `.header-profile-btn[data-unset="true"]` = amber nudge dot shown.
**Pitfalls for AI agents:**
- `padding-bottom: 120px` on `.page-main` is required to prevent content from being hidden behind the fixed bottom tab bar on mobile. Do not remove it.
- `aria-current="page"` must be set on the correct nav link AND the correct bottom tab for every page -- both independently.
- When adding a new page, add it to the `<nav class="site-nav">` block AND the `<nav class="bottom-tabs">` block on EVERY existing page. (Currently 9 pages total.)

---

### catalog-grid (Card Grid Layout)

**Class(es):** `div.catalog-grid#catalog-grid`
**Visual description:** CSS grid with `auto-fill minmax(280px, 1fr)` columns. Cards flow automatically into as many columns as the viewport allows.
**Use when:** The Browse page card grid. Only one instance per page.
**Do NOT use when:** On pages where cards are displayed in a single column (use `.dense-stack` for wishlist cards).
**CSS custom properties:** `--sp-3` (gap)
**Variants / states:** `[hidden]` -- hide the grid (e.g., when switching to Quick Pick mode). Companion rule `.catalog-grid[hidden] { display: none; }` exists in components.css to override the grid display value.
**Pitfalls for AI agents:**
- The grid is initially empty -- populated by `renderCatalog()` after `fetch(data.json)` resolves. Never add `<article>` elements directly to the HTML inside this div.
- The `#live-count` element (above the grid) is updated by `renderCatalog()` after insertion. Do not manually set its text content.

---

### deck-card (Quick Pick Swipe Card)

**Class(es):** `.deck-card`, `.deck-card.stack-2`, `.deck-card.stack-3`
**Visual description:** Large portrait-oriented card in the swipe deck stage. The top card is the active swipe target. `.stack-2` and `.stack-3` are visual offset layers behind it showing depth. Cards fly off-screen on swipe with a rotation animation.
**Use when:** Quick Pick swipe deck only (`quick-pick.html`).
**Do NOT use when:** Anywhere on `attractions.html` (which uses `.card--light` in browse mode).
**CSS custom properties:** `--radius-card`, `--color-surface`, `--shadow-2`
**Variants / states:** `.deck-card.stack-2` (second card in stack, scaled and offset), `.deck-card.stack-3` (third card, further offset)
**Pitfalls for AI agents:**
- The top card selector for programmatic decisions (button clicks, keyboard) is: `deckStage.querySelector('.deck-card:not(.stack-2):not(.stack-3)')`
- Image paths in `data-img` on `.card--light` store `assets/thumbs/...` (relative to `web/`). The deck JS normalizes these to `../assets/thumbs/...` for use in quick-pick.html. Do not skip this normalization.
- Do NOT add `.deck-card` or swipe JS to `attractions.html`. Quick Pick lives exclusively on `quick-pick.html`.

---

### seg (Segmented Control)

**Class(es):** `.seg`, `.seg.two-btn`, `button[aria-pressed][data-v]`
**Visual description:** A two-button pill toggle (full-width of its container). Buttons share a surface-color border. The active button turns solid green (`--status-yes`) when `data-v="committing"`, with other states mapped to their status colors.
**Use when:** `.card--dense` state selection (Wishlist / Committing / Not Going) on the Wishlist page. Also used for theme switching on the Profile page.
**Do NOT use when:** For navigation (use nav links). For single on/off toggles (use `aria-pressed` on a single button).
**CSS custom properties:** `--color-surface`, `--color-line`, `--status-yes`, `--status-no`, `--radius-pill`
**Variants / states:** `button[aria-pressed="true"][data-v="committing"]` = green. `button[aria-pressed="true"][data-v="not-going"]` = red. `button[aria-pressed="true"][data-v="wishlist"]` = blue.
**Pitfalls for AI agents:**
- Always set `aria-pressed="false"` on the inactive button when setting `aria-pressed="true"` on the active one -- both attributes must be present and accurate.

---

### modal (Detail Modal)

**Class(es):** `.detail-modal`, `.modal-backdrop`
**Visual description:** A full-screen overlay panel that slides up or fades in when a `.card--light` is tapped. Shows the attraction's full image, name, description, tags, price, duration, RSVP/picks controls, and a link to the official URL. The backdrop (`.modal-backdrop`) is a semi-opaque overlay behind the panel.
**Use when:** Detail view of any attraction card on the Browse page.
**Do NOT use when:** On Quick Pick (which uses a bottom sheet instead).
**CSS custom properties:** `--color-surface`, `--color-bg`, `--radius-card`, `--shadow-2`
**Variants / states:** `.detail-modal.is-open` = visible. Closed by default.
**Pitfalls for AI agents:**
- The modal IIFE queries all `.card--light` elements and wires click handlers. It must listen for `catalog-rendered` before initializing, since cards are rendered asynchronously.
- Closing the modal on `Escape` keypress is wired in the same IIFE -- do not add a duplicate listener.

---

### page-hero (Page Title Section)

**Class(es):** `.page-hero`
**Visual description:** The top content section below the header on each page. Contains the page `<h1>` title and optionally a subheading (`.hero-sub`). No background color -- sits on the page background.
**Use when:** At the top of every page's `<main>` content area.
**Do NOT use when:** As a full-bleed banner with background image (this project does not use hero images).
**CSS custom properties:** `--font-display`, `--text-xl`, `--color-ink-dim`, `--sp-2`, `--sp-5`
**Variants / states:** None. Simple block.
**Pitfalls for AI agents:**
- Do NOT include `<p class="eyebrow">Branson '26</p>` inside `.page-hero` -- this was removed in 2026-04-23 as redundant with the site-header logo.

---

### filter-strip (Horizontal Filter Row)

**Class(es):** `.filter-strip` inside `.filter-popover`, toggled by `.filter-toggle-btn`
**Visual description:** A horizontally scrollable row of `.chip` buttons for filtering by tag. Hidden behind a "Filter ▾" toggle button on mobile (`.filter-popover-wrap`). The Quick Pick nav button (`<a class="qp-nav-btn">`) sits in the same row as the filter toggle on the Browse page.
**Use when:** Above the card grid on attractions.html and quick-pick.html.
**Do NOT use when:** On pages without a filterable card collection.
**CSS custom properties:** `--sp-2`, `--sp-3`, `--color-surface`, `--color-line`, `--radius-btn`
**Variants / states:** `.filter-popover` has `aria-expanded="true"/"false"` on the toggle button to control visibility.
**Pitfalls for AI agents:**
- Filter chips must have `data-tag=""` for the "All" chip and `data-tag="tagname"` for all others -- the filter IIFE reads this attribute.
- The filter IIFE on attractions.html is wrapped in a `catalog-rendered` event listener. Do not move it outside that listener.

---

## Agent Notes (Cross-Cutting Rules)

- **Never hardcode hex values** in any CSS file. Always use a token (`--color-bg`, `--status-yes`, etc.).
- **Never reference `--moss`, `--lake`, `--sand`, `--clay`, or `--dusk`** outside of `css/themes/trail.css`. These are private palette names. Use the semantic token names in components.
- **Always check `data-state` attribute** before assuming a `.card--dense` card's color -- the CSS is data-attribute-driven, not class-driven.
- **Always verify `aria-pressed` is toggled in JS** alongside any visual state change on chips, heart buttons, and seg buttons. The CSS uses attribute selectors -- if `aria-pressed` is not set, the visual state will not update.
- **Before any CSS change**, run `grep -rn "<token-or-selector>" web/css/ web/*.html` to find all usages. CSS custom properties propagate across all three CSS files and into inline JS that reads them.
- **When adding a new HTML page**, add it to: (1) the `<nav class="site-nav">` block on all existing pages, (2) the `<nav class="bottom-tabs">` block on all existing pages, (3) the `sed` path-fix command in the GitHub Pages deploy workflow (CLAUDE.md, GitHub Pages Sync section).
- **`generate_dashboard.py` is FROZEN.** See CLAUDE.md for details. Running it destroys hand-edited code.
