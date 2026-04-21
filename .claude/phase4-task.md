# Phase 4 Build Task — Branson 2026 Design System Extraction

**For Claude Code (codemaster). Run autonomously. Alex is away for 2-3 hours.**

## Your mission

Extract the locked design system from the mockup files into reusable CSS, then retrofit
all production HTML pages onto that system. Commit each phase separately.

You have full authority to make judgment calls. Alex's rule: "make your best guess, alert me later."

---

## Locked design decisions (DO NOT re-open)

**Palette (private, defined in trail.css):**
- `--moss: #3F6B3A` / `--moss-d: #284A26`
- `--lake: #2A6A8A`
- `--sand: #D8A660`
- `--clay: #C1553B`
- `--dusk: #6B4C8F`
- `--warn: #A86A1C`

**Semantic tokens (in tokens.css, used by ALL components):**
- `--color-bg: #FBF6EC` / dark: `#161A14`
- `--color-surface: #FFFDF7` / dark: `#1F261C`
- `--color-ink: #20281E` / dark: `#F3EEDD`
- `--color-ink-dim: #5E6B58` / dark: `#ADB3A3`
- `--color-line: #E4DCC6` / dark: `#343C2F`
- `--status-yes: #3F6B3A` (= --moss)
- `--status-no: #B83A35`
- `--status-wishlist: #2A6A8A` (= --lake)
- `--status-neutral: #8B8671`
- `--status-lock: #6B4C8F` (= --dusk)
- `--warn: #A86A1C`

**Body background (fixed radial gradient):**
```css
background:
  radial-gradient(1000px 520px at -10% -10%, #E7EEDE 0%, transparent 55%),
  radial-gradient(900px 520px at 110% 10%, #F1DDB9 0%, transparent 55%),
  var(--color-bg);
background-attachment: fixed;
```
Dark mode background:
```css
radial-gradient(1000px 520px at -10% -10%, #1F2E1E 0%, transparent 55%),
radial-gradient(900px 520px at 110% 10%, #2B2418 0%, transparent 55%),
var(--color-bg)
```

**Typography:**
- `--font-display: 'Lexend', Georgia, 'Iowan Old Style', serif;`
- `--font-body: 'Atkinson Hyperlegible', 'Lexend', system-ui, -apple-system, sans-serif;`
- Body: 17px, line-height 1.5
- Min body text: 16px (never go below)

**Geometry (canonical = card-density.html values):**
- `--radius-card: 18px`
- `--radius-pill: 999px`
- `--radius-btn: 10px`

**Shadows:**
- `--shadow-1: 0 1px 2px rgba(32,40,30,0.05), 0 6px 18px rgba(32,40,30,0.06)`
- `--shadow-2: 0 2px 4px rgba(32,40,30,0.08), 0 20px 40px rgba(63,107,58,0.14)`

**Spacing scale:** 4/8/12/16/24/32/48/64px

---

## File layout to create

```
web/
├── css/
│   ├── tokens.css        ← semantic tokens (references palette vars but is theme-agnostic)
│   ├── components.css    ← card, badge, tag, avatar-stack, chip, button, nav
│   └── themes/
│       └── trail.css     ← defines the private Ozarks palette + full semantic tokens for Trail theme
├── js/
│   └── theme.js          ← localStorage theme/mode persistence (inline in <head> to prevent FOWT)
└── svg-fallbacks/
    └── [a-z].svg         ← 26 pre-generated letter SVGs for missing thumbs
```

---

## Phase 4b — Extract tokens.css + themes/trail.css

Create `web/css/tokens.css`:
```css
/*
 * tokens.css — Branson '26 Design System
 * Semantic tokens only. The palette values are defined by the active theme (trail.css).
 * Components ONLY reference vars from this file, never the private palette vars.
 */
:root {
  /* Layout */
  --radius-card: 18px;
  --radius-pill: 999px;
  --radius-btn: 10px;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

  /* Typography */
  --font-display: 'Lexend', Georgia, 'Iowan Old Style', serif;
  --font-body: 'Atkinson Hyperlegible', 'Lexend', system-ui, -apple-system, sans-serif;
  --text-xs: 12px; --text-sm: 14px; --text-base: 17px;
  --text-lg: 19px; --text-xl: 22px; --text-2xl: clamp(28px, 4vw, 44px);

  /* Colors (values injected by theme; defaults = Trail) */
  --color-bg:      #FBF6EC;
  --color-surface: #FFFDF7;
  --color-ink:     #20281E;
  --color-ink-dim: #5E6B58;
  --color-line:    #E4DCC6;

  --status-yes:      #3F6B3A;
  --status-no:       #B83A35;
  --status-wishlist: #2A6A8A;
  --status-neutral:  #8B8671;
  --status-lock:     #6B4C8F;
  --warn:            #A86A1C;

  /* Shadows */
  --shadow-1: 0 1px 2px rgba(32,40,30,0.05), 0 6px 18px rgba(32,40,30,0.06);
  --shadow-2: 0 2px 4px rgba(32,40,30,0.08), 0 20px 40px rgba(63,107,58,0.14);
}

/* System dark mode — overrides color vars only */
@media (prefers-color-scheme: dark) {
  :root[data-mode="system"],
  :root:not([data-mode]) {
    --color-bg:      #161A14;
    --color-surface: #1F261C;
    --color-ink:     #F3EEDD;
    --color-ink-dim: #ADB3A3;
    --color-line:    #343C2F;
    --warn:          #E0B35A;
  }
}
/* Explicit dark mode override */
:root[data-mode="dark"] {
  --color-bg:      #161A14;
  --color-surface: #1F261C;
  --color-ink:     #F3EEDD;
  --color-ink-dim: #ADB3A3;
  --color-line:    #343C2F;
  --warn:          #E0B35A;
}
/* Explicit light override */
:root[data-mode="light"] {
  --color-bg:      #FBF6EC;
  --color-surface: #FFFDF7;
  --color-ink:     #20281E;
  --color-ink-dim: #5E6B58;
  --color-line:    #E4DCC6;
  --warn:          #A86A1C;
}
```

Create `web/css/themes/trail.css` — the full private palette (not referenced by components):
```css
/*
 * trail.css — Trail theme (default, Ozarks-inspired)
 * Defines private palette vars. Overrides semantic tokens for Trail personality.
 * Future themes (cartridge, lakeside) override these same vars.
 */
:root {
  --moss:   #3F6B3A;
  --moss-d: #284A26;
  --lake:   #2A6A8A;
  --sand:   #D8A660;
  --clay:   #C1553B;
  --dusk:   #6B4C8F;

  /* Trail semantic overrides (matches tokens.css defaults, listed here for explicitness) */
  --status-yes:      var(--moss);
  --status-wishlist: var(--lake);
  --status-lock:     var(--dusk);
}
```

Commit: `Phase 4b: tokens.css + themes/trail.css`

---

## Phase 4c — Extract components.css

Create `web/css/components.css`. Extract ALL shared component styles from card-density.html.
Include:

1. **Reset + base** (box-sizing, body font stack, heading styles)
2. **Body background** (the two radial gradients + fixed attachment + dark-mode variant)
3. **Catalog card** (`.card--light` = the sparse browse card, was `.ccard` in mockup)
4. **Wishlist card** (`.card--dense` = the full detail card, was `.dcard` in mockup)
5. **Card states** (`.card--dense[data-state="wishlist|committing|not-going|removing"]`)
6. **Heart overlay button** (`.heart-overlay`)
7. **Remove X button** (`.remove-x`)
8. **RSVP button group** (`.seg`, `.seg.two-btn`, the I'm-In / Not-Going buttons)
9. **Tag chips** (`.tag`, `.minichip`, `.minichip.price`, `.minichip.rating`)
10. **Avatar stack** (`.avatars`, `.avatar`)
11. **Who-row** (`.who-row`)
12. **Reservation block** (`.reservation-block`, `.reservation-block .pill`)
13. **KV row** (`.kv-row`, `.kv`)
14. **Filter chip row** (`.filter-strip`, `.chip`, `.chip[aria-pressed="true"]`)
15. **Nav** (top bar desktop + bottom tab bar mobile)
16. **Section headers** (`.section-head`, `.eyebrow`)
17. **Intro block** (`.intro`)
18. **Trash row** (`.trash-row` — collapsible inline at bottom of wishlist)
19. **Focus visible** outline (2px solid --moss, offset 2px, on all interactive elements)
20. **Reduced motion** (`prefers-reduced-motion: reduce` kills all transitions)

Rename classes from mockup originals to system names:
- `.ccard` → `.card--light`
- `.dcard` → `.card--dense`
- `.ccard .body` → `.card--light__body`
- `.dcard .body` → `.card--dense__body`
- `.dcard .top` → `.card--dense__top`
- Keep `.seg`, `.tag`, `.minichip`, `.avatar`, `.avatars`, `.who-row` (already clean)

Commit: `Phase 4c: components.css — all shared components`

---

## Phase 4d — Generate 26 SVG thumbnail fallbacks

Create `web/svg-fallbacks/` directory with one SVG per letter (a.svg through z.svg).

Each SVG is a 16:10 aspect ratio placeholder (e.g., viewBox="0 0 320 200") with:
- Background: a gradient derived from the letter's position in the alphabet
  - Use the Trail palette: cycle through moss, lake, sand, clay, dusk across the 26 letters
  - Formula: `palette_index = letter_index % 5` → picks one of 5 palette colors
  - Background gradient: `linear-gradient(135deg, <palette_color_at_30%_opacity>, <palette_color_dark_at_60%_opacity>)`
- Centered letter in uppercase, white, Lexend-like font (use `font-family="system-ui, sans-serif"` since SVG can't load Google Fonts), font-size="80", font-weight="700"
- `aria-hidden="true"` (decorative)

**Write a Python script** `scripts/generate_svg_fallbacks.py` that generates all 26 SVGs
and save to `web/svg-fallbacks/`. Then run it.

Palette for the 5 cycle positions:
```python
PALETTE = [
    ("#3F6B3A", "#284A26"),  # moss
    ("#2A6A8A", "#1A4A6A"),  # lake
    ("#D8A660", "#A87840"),  # sand
    ("#C1553B", "#913525"),  # clay
    ("#6B4C8F", "#4B2C6F"),  # dusk
]
```

Commit: `Phase 4d: 26 SVG thumbnail fallbacks + generator script`

---

## Phase 4e — Refactor generate_dashboard.py with shared partials

The generator currently only produces `shows.html`. Expand it to be a multi-page generator.

**Key changes:**

1. **Shared `<head>` partial** — a Python function `render_head(page_title, page_description)` that returns:
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>{page_title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="../css/themes/trail.css">
<link rel="stylesheet" href="../css/components.css">
<script>
/* Theme loader — inline to prevent flash-of-wrong-theme */
(function(){
  var m=localStorage.getItem('vacdash:v1:mode')||'system';
  document.documentElement.setAttribute('data-mode',m);
})();
</script>
```
Note: `../css/` because pages live in `web/` and CSS lives in `web/css/`. Adjust path
for any page that lives in a subdirectory.

2. **Shared nav partial** — a Python function `render_nav(active_page)` that returns
the nav HTML. `active_page` is one of: `'home'`, `'attractions'`, `'shows'`, `'timeline'`, `'people'`.

Nav structure (desktop top bar + mobile bottom tabs):
```html
<header class="site-header">
  <div class="site-header__inner">
    <a class="site-logo" href="index.html">Branson '26</a>
    <nav class="site-nav" aria-label="Main">
      <a href="index.html" class="nav-link {active if home}">Home</a>
      <a href="attractions.html" class="nav-link {active if attractions}">Attractions</a>
      <a href="shows.html" class="nav-link {active if shows}">Shows</a>
      <a href="event-timeline.html" class="nav-link {active if timeline}">Timeline</a>
      <a href="people-timeline.html" class="nav-link {active if people}">People</a>
    </nav>
    <button class="theme-toggle" aria-label="Toggle dark mode" onclick="toggleMode()">☀️</button>
  </div>
</header>
<nav class="bottom-tabs" aria-label="Main (mobile)">
  <a href="index.html" class="tab {active if home}" aria-label="Home">🏠</a>
  <a href="attractions.html" class="tab {active if attractions}" aria-label="Attractions">🎡</a>
  <a href="shows.html" class="tab {active if shows}" aria-label="Shows">🎭</a>
  <a href="event-timeline.html" class="tab {active if timeline}" aria-label="Timeline">📅</a>
  <a href="people-timeline.html" class="tab {active if people}" aria-label="People">👥</a>
</nav>
```

3. **Add a `theme.js`** inline function `toggleMode()` in the shared head that cycles light → dark → system and saves to `vacdash:v1:mode`. Also add a `storage` event listener to sync mode across tabs.

4. **Remove the iCloud path** — `ICLOUD_HTML_PATH` is gone. Only write to `web/`.

5. **Remove absolute path** — derive `VAULT` from `Path(__file__).parent.parent` so it works from any machine.

6. **Keep existing shows.html generation logic intact** — just wrap it with the new head/nav.

Commit: `Phase 4e: generate_dashboard.py — shared head + nav partials, relative paths`

---

## Phase 4f — Rebuild attractions.html

This is the main deliverable. Fully regenerate `web/attractions.html` from `data/attractions.json`
using the new CSS system.

**Extend generate_dashboard.py** with a `generate_attractions_page()` function.

### Page structure:
```html
<!doctype html>
<html lang="en" data-mode="system">
<head>
  {render_head("Attractions — Branson '26", "Browse all Branson attractions")}
</head>
<body>
  {render_nav("attractions")}
  <main class="page-main">
    <div class="page-hero">
      <p class="eyebrow">Branson '26</p>
      <h1>Attractions & Shows</h1>
      <p class="hero-sub">Browse {N} things to do. Heart anything that looks fun.</p>
    </div>

    <!-- TEST DATA BANNER (remove in Phase 2) -->
    <div class="test-banner" role="status">
      🧪 Test data — interest counts and picks are not real family data
    </div>

    <!-- Filter chip row -->
    <div class="filter-strip" role="group" aria-label="Filter by tag">
      <button class="chip" aria-pressed="false" data-tag="">All</button>
      <!-- one chip per unique tag, sorted -->
    </div>

    <!-- Card grid -->
    <div class="catalog-grid" id="catalog-grid">
      <!-- one .card--light per attraction -->
    </div>
  </main>
  <script>/* filter JS — minimal, vanilla */<script>
</body>
</html>
```

### Each `.card--light` renders:
```html
<article class="card--light" data-tags="{space-separated tags}" data-slug="{slug}">
  <button class="heart-overlay" aria-pressed="false" aria-label="Wishlist {name}">♡</button>
  <div class="card--light__thumb">
    <!-- If thumb file exists: <img src="../assets/thumbs/{slug}-thumb.jpg" alt="{name}" loading="lazy"> -->
    <!-- Else: inline the matching svg-fallbacks/{first_letter}.svg content -->
  </div>
  <div class="card--light__body">
    <h3>{name}</h3>
    <p class="card--light__hook">{description[:120]}…</p>
    <div class="row">
      {if price_adult: <span class="minichip price">from ${price_adult}</span>}
      {if duration_hours: <span class="minichip">{duration_str}</span>}
      {if rating: <span class="minichip rating">★ {rating}</span>}
    </div>
  </div>
</article>
```

### Thumb detection logic:
- Check if `web/assets/thumbs/{slug}-thumb.jpg`, `-thumb.png`, `-thumb.webp` exists
- If yes: use `<img>` with `loading="lazy"` and `alt="{name}"`
- If no: inline the SVG from `web/svg-fallbacks/{first_letter_of_name}.svg`

### Filter JS (vanilla, ~50 lines):
- Active tags stored in a `Set`
- Click chip: toggle tag in set, update `aria-pressed`, re-filter
- "All" chip: clear set
- Re-filter: iterate `.card--light[data-tags]`, show if `dataTagsSet` intersects `activeSet` (or activeSet empty)
- Live counter: "Showing N of M"

### Attractions to include:
- Read `data/attractions.json`
- Read `data/blacklist.json` (if exists) and skip blacklisted slugs
- Sort by `library_sort_key` (existing logic in generate_dashboard.py — copy it)
- Include ALL non-blacklisted attractions regardless of category

Commit: `Phase 4f: rebuild attractions.html — server-rendered card grid from JSON`

---

## Phase 4g — Minimal hookup of remaining pages

For each of `shows.html`, `index.html`, `event-timeline.html`, `people-timeline.html`:

1. Replace the existing `<head>` content (from `<head>` to `</head>`) with `{render_head(...)}`
2. Remove any existing nav/header markup and replace with `{render_nav(...)}`
3. Keep all existing body content intact (inline styles, old CSS, JS all stay)
4. Add `<link rel="stylesheet" href="../css/tokens.css">` etc. at HEAD if render_head isn't used for some reason

This is a minimal hookup — the pages will look mixed but they'll share the font stack + nav.

**Special case for shows.html**: The generator already produces shows.html. Update `generate_dashboard.py`
so it also injects the shared head/nav into shows.html output. The existing card + filter logic stays.

Commit: `Phase 4g: minimal hookup — shared head + nav injected into all 5 pages`

---

## Phase 4h — PROJECT_LOG update + verification

1. Update `docs/PROJECT_LOG.md` with Phase 4b-4h completion entries (ISO timestamp, one paragraph each).

2. **Self-verify** by opening each page in bash (check for syntax errors):
   ```bash
   python3 -c "
   import sys
   for f in ['web/attractions.html','web/shows.html','web/index.html',
             'web/event-timeline.html','web/people-timeline.html']:
       with open(f) as fp:
           content = fp.read()
       if '<head>' not in content or 'tokens.css' not in content:
           print(f'FAIL: {f} missing tokens.css link')
           sys.exit(1)
       if 'site-header' not in content and 'site-nav' not in content:
           print(f'FAIL: {f} missing shared nav')
           sys.exit(1)
       print(f'OK: {f}')
   "
   ```

3. Run the generator to ensure it produces valid output:
   ```bash
   cd "/Users/alex/vaults/Vacation/Branson 2026"
   python3 scripts/generate_dashboard.py
   echo "Exit: $?"
   ```

4. Git add everything and commit:
   `Phase 4h: verification pass + PROJECT_LOG updated`

---

## Hard rules (non-negotiable)

1. **No new pip dependencies** unless truly unavoidable (and even then, raise loudly in commit message)
2. **Loud errors over silent fallbacks** — if a JSON field is missing, print WARNING to stderr, do not silently use a default
3. **All filenames kebab-case** — no spaces, no special characters
4. **Body text never below 16px** — check every new CSS rule
5. **All interactive elements get** `focus-visible` outline: `2px solid var(--moss)` at minimum
6. **Min tap target 44x44px** on all buttons
7. **Git commit after each phase** — never bundle phases into one commit
8. **Never write to the iCloud path** — removed from generate_dashboard.py
9. **Derive VAULT from __file__** — not from a hardcoded absolute path

---

## File locations

- Source CSS to extract from: `web/mockups/card-density.html` (canonical, 18px radius)
- Secondary reference: `web/mockups/swipe-browse.html` (22px radius, Phase 2 only)
- Data: `data/attractions.json` (139 entries)
- Blacklist: `data/blacklist.json` (may not exist — check first, silently skip if absent)
- Existing generator: `scripts/generate_dashboard.py` (452 lines — read before touching)
- Design reference: `web/DESIGN.md`
- Project log: `docs/PROJECT_LOG.md`

---

## When done

Post a summary to this file (`phase4-task.md`) under a `## Completion report` header:
- Commits made (hash + message)
- Decisions you made autonomously (for Alex to review)
- Anything that deviated from the plan and why
- Any items that need Alex's attention on return

Alex will read this on return. Send a Discord message if possible (not required).
