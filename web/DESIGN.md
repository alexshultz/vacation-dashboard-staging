# Branson '26 Design System — Draft

**Status:** draft, pre-commit. This is a PROPOSAL, not a locked spec. Values in brackets are placeholders that get replaced by whichever mockup direction wins (see `web/mockups/`).

**Audience of this doc:**
- Humans — Alex, family members glancing at decisions
- Future Claude instances regenerating pages from `data/*.json`

---

## Goals

1. **Readable by everyone in the family.** Parents in their 70s, family members with dyslexia, kids on small Android phones.
2. **"Nintendo meets Apple."** Playful without being cartoony, modern without being corporate.
3. **Fast.** No build-in-front-of-you. Cards render immediately from generated HTML. Fonts cache on first load.
4. **Template-friendly.** Everything here must survive regeneration by `scripts/generate_dashboard.py` and the planned `scripts/generate_dashboard.py` pipeline.
5. **Themeable.** User can choose skins (Cartridge / Lakeside / Trail / colorblind / high-contrast-outdoor).

## Non-goals (Phase 1)

- Micro-animations beyond card hover + button press
- Icon set selection (using emoji + unicode glyphs in mockups as placeholders)
- Print stylesheet
- PDF export styling (Phase 3)

---

## Design tokens

Tokens are authored once in `web/css/tokens.css` and consumed via CSS custom properties. Theme skins override tokens at the `:root[data-theme="..."]` level.

### Color

Token names are semantic, not literal. The hex values below are the defaults for the **[winning mockup]** theme. Dark mode and alternate themes override at the root.

```css
--color-bg        /* page background */
--color-surface   /* card / panel background */
--color-ink       /* primary text */
--color-ink-dim   /* secondary text */
--color-line      /* borders, dividers */

--brand-1 ... --brand-4  /* brand accents (decorative) */

--status-yes        /* green — "I'm in" */
--status-no         /* red — "not for me" */
--status-maybe      /* yellow — "undecided" */
--status-norsvp     /* gray — "no response yet" */
--status-wishlist   /* blue/violet — soft pick */
--status-confirmed  /* pink/red — locked in */
```

**Contrast targets:** WCAG AA minimum across all text. Body text ≥ 4.5:1 on its background; large text (≥ 18px bold) ≥ 3:1.

**Color is never the only signal.** Every status conveyed by color also has an icon or text label. This matters for: (a) colorblind users (6% of the male family members, statistically ≈ 1 person), (b) bright outdoor phone reading.

**Themes:**
- `default` — the chosen direction from mockups
- `colorblind` — uses the Okabe–Ito 8-color palette (deuteranopia/protanopia safe)
- `high-contrast-outdoor` — pure white background, true black text, maximum legibility in sun
- `night` — dark mode pairings, auto-applied via `prefers-color-scheme: dark` unless user overrides

### Typography

```css
--font-body    'Atkinson Hyperlegible', system-ui, sans-serif
--font-display 'Lexend', system-ui, sans-serif
```

**Why these fonts:**
- **Atkinson Hyperlegible** (Braille Institute, free) — designed specifically for reading with low vision. Highly distinct letterforms reduce confusion of similar glyphs (0 vs O, 1 vs l vs I). Good for the body text that parents and dyslexic family members will read most.
- **Lexend** (Bonnie Shaver-Troup, free) — research-backed reading-proficiency gains, broader weights, better for display sizes.

**Loading:** served from Google Fonts CDN with `font-display: swap` so fallback renders immediately. After first visit, fonts are cached by the browser — no refetch on reloads or subsequent pages. If offline mid-trip (unlikely given confirmed cabin wifi), fallback system fonts take over.

**Sizes (body-first, mobile baseline):**
```
--text-xs   12px  /* tags, metadata, badges */
--text-sm   14px  /* secondary info */
--text-base 17px  /* body — NEVER below 16px */
--text-lg   19px  /* card titles */
--text-xl   22px  /* section headings */
--text-2xl  clamp(28px, 4vw, 44px)  /* hero */
```

**Line height:** 1.45 body, 1.15 headings.

**Readability rules:**
- Body text is never bold-only colored text. (Dyslexia consideration.)
- No all-caps except micro-eyebrow labels ≤ 13px.
- Line length capped at ~64ch in prose, narrower for meta rows.

### Spacing

```css
--space-1 4px   --space-2 8px   --space-3 12px   --space-4 16px
--space-5 24px  --space-6 32px  --space-7 48px   --space-8 64px
```

Use the scale. Don't introduce arbitrary values.

### Radius

```css
--radius-card 18–24px   /* varies by theme */
--radius-pill 999px
--radius-btn  10–14px
```

### Shadow

Two depths: `--shadow-1` (resting) and `--shadow-2` (hover/active). Dark mode swaps to blurred-black rather than brightening.

### Breakpoints

Mobile-first. Media queries expand up.

```css
@media (min-width: 640px)   /* small tablet / landscape phone */
@media (min-width: 900px)   /* tablet */
@media (min-width: 1200px)  /* desktop */
```

Bottom tab bar is shown below 720px; top nav is shown above.

---

## Components

### Card (attraction / show)

Structure:
```
<article class="card [wish|confirmed|untouched]">
  <img class="thumb"> | <div class="thumb-fallback">
  <div class="badges">...</div>   <!-- trending, first-pick, show -->
  <div class="card-body">
    <h3>Title</h3>
    <div class="meta-row">duration · price · rating</div>
    <div class="tags">tag tag tag</div>
    <div class="interest">avatars + count text</div>
    <div class="actions">Wishlist + Confirm buttons</div>
  </div>
</article>
```

**States:**
- `.untouched` — transparent background, dashed border, low opacity (nobody picked)
- `.wish` — tinted background (status-wishlist), solid border (someone wishlisted)
- `.confirmed` — warmer tint (status-confirmed), stronger border (someone locked in)

The three states form a clear visual progression: gray/faded → tinted → vivid.

### Badge

Small pill overlay on thumb. Variants: default, `.trending`, `.first`, `.show`.

### Tag

Lightweight chip inside card body. Plain text classification (Indoor, Family, Evening, etc.). **Tag strategy:**
- Keep to ≤ 4 per card, rendered in priority order
- Wrap to second line on narrow cards, do not truncate
- Standard tag vocabulary (proposed): `indoor | outdoor | family | evening | morning | under-30 | kid-favorite | rainy-day | dinner-show | theme-park | museum | music | comedy`

### Avatar stack

Overlapping 26–28px circles, 2px surface-color border, initial inside. Max 5 visible; `+N` bubble for overflow.

Colors are assigned per-person from the theme palette and remain stable across all views (a person's color is their identity). This is defined once in data, not per-card.

### Status legend

Small row on each page showing swatch + meaning. Persistent reminder for color-coded statuses.

### Buttons

- **Primary** — solid brand color, white text
- **Secondary** — surface background, ink border, ink text
- **Ghost** — transparent, for tertiary actions
- Min tap target: 44×44px
- Always pair icon + text label

### Top nav / bottom tabs

- **Desktop** (≥ 720px): top bar with brand + inline nav + theme toggle
- **Mobile** (< 720px): compact top bar (brand + toggle only) + fixed bottom tab bar
- Exactly one source of truth. **Nav markup lives in `scripts/generate_dashboard.py` as a template partial.** Every generated HTML file gets the same block inserted; no per-file duplication.

### Filter row

Horizontal chip row above card grid. Active chip inverts colors. Chips are buttons, keyboard-focusable.

### Trending strip

`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` of mini-cards. Each shows thumb + title + meta (count/status). Max 6 items; if more, show "See all →" link.

### Hero

Per-page but same skeleton: eyebrow + headline + supporting line + stat row or pill row. Scripts generate with per-page copy variables.

---

## Pages (Phase 1 scope)

1. **`index.html` (Today view)** — countdown, today's events, trending strip, "first picks" callout
2. **`attractions.html`** — filter row + card grid (REFERENCE PAGE, first polished)
3. **`shows.html`** — same skeleton as attractions; cards surface showtimes
4. **`event-timeline.html`** — Gantt; rewritten later, Phase 2
5. **`people-timeline.html`** — per-person status + "who's at the cabin right now"; Phase 2

---

## Accessibility floor

- Semantic HTML: `<header> <nav> <main> <section> <article>` for structure
- `aria-current="page"` on active nav link
- Focus-visible outline on every interactive element, at least 2px and 3:1 contrast
- Images have meaningful alt OR empty alt + aria-label on parent
- No motion > 200ms unless user-requested; respect `prefers-reduced-motion`
- Color never sole signal (icon + text + color always)
- Body text ≥ 16px, line-height ≥ 1.4
- Target size 44×44px minimum

---

## Performance budget

- **HTML per page:** ≤ 80 KB generated
- **CSS total:** ≤ 40 KB across tokens + components
- **JS total:** ≤ 30 KB (Phase 1 is static; interactivity in Phase 2 uses a small vanilla-JS file)
- **Images:** WebP preferred; thumbs ≤ 60 KB each, lazy-loaded with `loading="lazy"`
- **Fonts:** loaded with `font-display: swap`; max 2 families, 3 weights each

Target: First Contentful Paint < 1.5s on a 4G phone, interactive < 2.5s.

---

## Browser support floor

- iOS Safari 16+ (iPhone 14 shipped on iOS 16)
- Chrome 108+ (covers modern Android flagships including Pixel, Flip)
- macOS Safari 16+
- Firefox 110+ (rare in this family but kept as tertiary)

This unlocks: `:has()`, `container queries`, `color-mix()`, `backdrop-filter`, `aspect-ratio`. No polyfills needed.

---

## File layout

```
web/
├── index.html
├── attractions.html
├── shows.html
├── event-timeline.html
├── people-timeline.html
├── css/
│   ├── tokens.css         ← colors, type, space, radii (per theme)
│   ├── components.css     ← card, badge, nav, etc.
│   └── themes/            ← alternate skins as overrides
│       ├── cartridge.css
│       ├── lakeside.css
│       ├── trail.css
│       ├── colorblind.css
│       └── outdoor.css
├── js/
│   └── theme.js           ← persists theme choice in localStorage
├── mockups/               ← visual exploration; not shipped to prod
└── assets/
    ├── thumbs/
    ├── banners/
    └── logos/
```

Nav + head + theme-loader live in `scripts/generate_dashboard.py` as Python string templates so every page gets identical markup.

---

## How this doc stays alive

- When a token changes, update this file AND `tokens.css` in the same commit.
- When a new component enters the system, add a section here.
- This doc is markdown on purpose: readable in Obsidian, on GitHub, and inlinable into AI context.

Last updated: 2026-04-20
