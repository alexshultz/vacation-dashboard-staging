---
version: alpha
name: Branson '26 — Trail
description: Ozarks-inspired Trail theme for the Shultz family Branson 2026 vacation dashboard. Warm cream, moss green, lake blue, dusk purple. Agent-readable canonical spec.
colors:
  primary: "#3F6B3A"
  on-primary: "#FFFFFF"
  primary-dim: "#284A26"
  secondary: "#2A6A8A"
  on-secondary: "#FFFFFF"
  tertiary: "#6B4C8F"
  on-tertiary: "#FFFFFF"
  surface: "#FFFDF7"
  surface-bg: "#FBF6EC"
  on-surface: "#20281E"
  on-surface-dim: "#5E6B58"
  outline: "#E4DCC6"
  error: "#B83A35"
  on-error: "#FFFFFF"
  warn: "#7A4D0E"
  on-warn: "#FFFFFF"
  accent-sand: "#D8A660"
  accent-clay: "#8B3A2A"
  status-neutral: "#5A5646"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Lexend
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  headline:
    fontFamily: Lexend
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Lexend
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: Atkinson Hyperlegible
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Atkinson Hyperlegible
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Atkinson Hyperlegible
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1
rounded:
  sm: 4px
  md: 10px
  lg: 18px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  max: 64px
components:
  card-catalog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card-wishlist:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card-committed:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-primary-hover:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-heart:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  button-suggest:
    backgroundColor: transparent
    textColor: "{colors.on-surface-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-dim}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  chip-filter-active:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  tag-chip:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  badge-warning:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.on-warn}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  badge-neutral:
    backgroundColor: "{colors.status-neutral}"
    textColor: "{colors.on-neutral}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  committed-banner:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  wishlist-slot-warning:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.on-warn}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  surface-page:
    backgroundColor: "{colors.surface-bg}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "{spacing.base}"
  error-inline:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  accent-sand-chip:
    backgroundColor: "{colors.accent-sand}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  accent-clay-chip:
    backgroundColor: "{colors.accent-clay}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  chip-rsvp-interested:
    backgroundColor: "var(--status-yes)"
    textColor: white
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  chip-rsvp-undecided:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.on-warn}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  chip-rsvp-not-going:
    backgroundColor: "var(--status-no)"
    textColor: white
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  chip-rsvp-no-response:
    backgroundColor: transparent
    textColor: "var(--color-ink-dim)"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
---

## Overview

Airbnb meets National Parks. The Ozarks-inspired Trail theme is warm, natural, and readable at every age. Moss green drives positive actions. Lake blue handles consideration states. Dusk purple marks committed events. Warm cream backgrounds feel like a vacation, not a spreadsheet.

Design philosophy: decisions over discovery. Every screen should move a family member closer to either committing to an activity or removing it from consideration. There is no passive browsing mode — every surface surfaces choices explicitly.

The dashboard must be legible and operable by all family members, from children tapping through the activity catalog to older adults reviewing committed plans. Font choices, contrast ratios, and touch-target sizes are selected for broad, multi-generational accessibility.

Dark mode is handled exclusively via CSS (`prefers-color-scheme` media query and `data-mode` attribute). It is not a DESIGN.md concern. This spec defines Trail light-theme values only.

## Colors

All foreground/background pairs used in production meet WCAG AA (4.5:1 minimum for normal text, 3:1 for large text and UI component boundaries). All values are defined in the YAML front matter. Component logic must always reference tokens by name — never embed raw hex values in component code.

### Three Primary Semantic Colors

The three primary hues map directly onto the three activity states. They are hue-distinct so that state is perceivable at a glance, including by users with common forms of color vision deficiency, when combined with card label and shape cues.

- **Primary (#3F6B3A) — Moss green.** Ozarks forest canopy. Signals the primary interactive action: primary buttons, heart icon in wishlisted state, confirmation affordances. `on-primary` (#FFFFFF) contrast: 6.3:1 vs AA 4.5:1.
- **Secondary (#2A6A8A) — Lake blue.** Lake Taneycomo and Table Rock Lake. Signals active consideration: wishlist card backgrounds, secondary actions. `on-secondary` (#FFFFFF) contrast: 6.0:1.
- **Tertiary (#6B4C8F) — Dusk purple.** Reserved exclusively for the committed card state and `committed-banner`. No other component may use it as a background or accent. `on-tertiary` (#FFFFFF) contrast: 6.9:1.

### Surface and Text

- **Surface (#FFFDF7):** Warm cream. Catalog card backgrounds. Lifts off the page background without requiring a shadow.
- **Surface-bg (#FBF6EC):** Linen. Page and canvas background. The lowest tonal layer.
- **On-surface (#20281E):** Near-black with a green undertone. Primary text on all light surfaces. Contrast vs. surface: 13.5:1.
- **On-surface-dim (#5E6B58):** Muted moss. Secondary text, metadata, placeholder hints, ghost button labels. Contrast vs. surface: 5.7:1.
- **Outline (#E4DCC6):** Warm sand. Card borders, tag chip fill, dividers.

### Feedback and Status

- **Error (#B83A35):** Deep brick red. Destructive actions, inline error messages. `on-error` white at 5.7:1.
- **Warn (#7A4D0E):** Dark amber. Wishlist slot warnings and capacity-caution badges. `on-warn` white at 7.2:1.
- **Accent-sand (#D8A660):** Golden sand. Decorative venue/category chips and rating glyphs only. **Must not be used as a text color on surface or surface-bg** — contrast is only 2.2:1, which fails WCAG AA for text.
- **Accent-clay (#8B3A2A):** Fired clay. Destructive accent borders and remove-action icon strokes. Contrast vs. on-primary: 7.6:1.
- **Status-neutral (#5A5646):** Warm charcoal. Neutral status badges (TBD, No time set). `on-neutral` white at 7.3:1.

## Typography

The dashboard uses exactly two typefaces. Both are free and served from Google Fonts CDN with `font-display: swap` to prevent invisible text during font load.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Lexend:wght@700;800&family=Atkinson+Hyperlegible:wght@400&display=swap">
```

### Lexend — Display, Headlines, Navigation

**Lexend** (weights 700 and 800) is used for all display text, page headlines, and navigation labels. Lexend was developed through evidence-based research into reading proficiency: its letter shapes and inter-glyph spacing reduce visual crowding and decoding effort, which benefits users with dyslexia and visual tracking difficulties.

| Token | fontSize | fontWeight | lineHeight | Use |
|---|---|---|---|---|
| `display` | 2rem / 32px | 800 | 1.1 | Page titles, hero headings |
| `headline` | 1.375rem / 22px | 700 | 1.25 | Card titles, section headings |
| `nav-label` | 0.875rem / 14px | 700 | 1 | Nav items, button labels |

### Atkinson Hyperlegible — Body and Labels

**Atkinson Hyperlegible** (weight 400) is used for all body copy, descriptions, and label-scale text inside chips, badges, and banners. It was commissioned by the Braille Institute specifically for low-vision readers: each letterform is carefully disambiguated (l, 1, and I are visually distinct; 0 and O are visually distinct).

| Token | fontSize | fontWeight | lineHeight | Use |
|---|---|---|---|---|
| `body` | 1.0625rem / 17px | 400 | 1.5 | Card descriptions, body copy |
| `body-sm` | 0.875rem / 14px | 400 | 1.5 | Secondary metadata, timestamps |
| `label` | 0.75rem / 12px | 400 | 1 | Tag chips, badges, banners |

**Hard rule: primary reading text is never rendered below 16px (1rem).** `body` at 17px is the minimum for any prose or card description. `body-sm` (14px) is permitted only for supplementary metadata that is not the primary content of a surface. `label` (12px) is permitted only inside bounded components where the component border and color provide sufficient context.

## Layout

The layout is mobile-first. Base CSS targets small-screen viewports; breakpoints add structure as width increases.

| Breakpoint | Width | Navigation | Catalog grid |
|---|---|---|---|
| Mobile | < 720px | Fixed bottom tab bar (56px) | 2 columns |
| Tablet | >= 720px | Top navigation bar | 3 columns |
| Desktop | >= 1200px | Top navigation bar (wider gutters) | 3 columns |

**Catalog view:** Responsive CSS grid. Mobile: 2-column, `spacing.md` (12px) gap. Tablet+: 3-column, `spacing.lg` (24px) gap. Card description text clamped to 3 lines via `-webkit-line-clamp: 3` in grid view; full description shown in detail sheet.

**Wishlist view:** Always single-column at all breakpoints. Wishlist cards span full content width. The wishlist is a deliberation space, not a browse space — full-width cards encourage reading and deciding rather than scrolling past.

**Spacing scale:** 8px base unit. Complete scale: xs=4px, sm=8px, md=12px, base=16px, lg=24px, xl=32px, xxl=48px, max=64px. Do not introduce arbitrary values between tokens.

**Prose max-width:** Long-form description text capped at 64ch to maintain comfortable line length for reading.

**Browser support floor:** iOS Safari 16+, Chrome 108+, macOS Safari 16+, Firefox 110+. These unlock `:has()`, container queries, `color-mix()`, `backdrop-filter`, `aspect-ratio`. No polyfills needed.

**Performance targets:** HTML per page <= 80KB; CSS bundle <= 40KB; JS bundle <= 30KB; images WebP <= 60KB each, `loading="lazy"`; fonts use `font-display: swap`.

## Elevation & Depth

This is a light theme. Depth is communicated through tonal layering — progressively lighter backgrounds as elements rise toward the user — not through heavy drop shadows.

**Tonal layer stack (back to front):**

1. **`surface-bg` (#FBF6EC) — Page canvas.** The lowest layer. The scrollable page background.
2. **`surface` (#FFFDF7) — Card layer.** Catalog cards sit here. Perceptibly lighter than `surface-bg`, creating card lift without any shadow.
3. **`outline` (#E4DCC6) — Bordered elements.** Tag chips and card borders when explicit separation is needed.

**Shadow policy:** Catalog cards require no drop shadow — the tonal step provides sufficient lift. Wishlist and committed cards carry distinct background hues and naturally stand off the canvas. Bottom sheets and modals may use a single subtle shadow: `box-shadow: 0 2px 12px rgba(32, 40, 30, 0.10)`. This is the maximum permitted shadow weight. Do not use colored shadows, multiple layered shadows, or inset shadows.

**Committed card override:** `card-committed` (background `tertiary: #6B4C8F`) intentionally breaks the tonal hierarchy — it is darker than both `surface-bg` and `surface`. This is by design. Committed activities are decided; they should feel visually settled and clearly distinct from open decisions. Do not attempt to lighten the committed card background to match the surface stack.

## Shapes

Shape language communicates interaction affordance and element type. The vocabulary is limited to four tokens. Every component uses one of these values uniformly on all four corners — no asymmetric or per-corner overrides except bottom sheets (top corners only at `rounded.lg`, bottom corners flush).

| Token | Value | Applied to |
|---|---|---|
| `rounded.sm` | 4px | Page-level surface containers (`surface-page`) |
| `rounded.md` | 10px | All button types; `committed-banner`; `wishlist-slot-warning`; `error-inline` |
| `rounded.lg` | 18px | All activity cards (catalog, wishlist, committed) |
| `rounded.pill` | 999px | Tag chips; filter chips; `button-heart`; warning and neutral badges; accent chips |

Nothing is sharp except dividers. Horizontal rule dividers use `border-radius: 0`. Every other element uses a token from the rounded scale. Cards (18px) are the most organic. Buttons (10px) are purposeful and direct. Pills (999px) convey "label" or "small interactive affordance."

## Components

### Activity Cards

Cards are the primary UI atom. Every activity exists in exactly one of three mutually exclusive states. State transitions are atomic — update the data model before re-rendering. A single activity must never visually appear in two states simultaneously.

#### `card-catalog` — Browsing State

Background `{colors.surface}` (#FFFDF7), text `{colors.on-surface}`, `{rounded.lg}`, `{spacing.md}` padding.

- Heart icon (`button-heart`) = wishlist toggle. Tapping moves the activity to wishlist state. Unfilled = not wishlisted (`on-surface-dim` stroke). Filled = wishlisted (`primary` fill). Always include `aria-label="Add to wishlist"` / `"Remove from wishlist"`.
- Drive time from Watermill Cove shown as a secondary label below the activity name. Required on every catalog card. Never hidden behind a toggle or accordion.
- Tag chips in a horizontal row, truncated after 3 with "+N more" text in `on-surface-dim`. No overflow chips rendered.
- No RSVP buttons on catalog cards.

#### `card-wishlist` — Under Consideration

Background `{colors.secondary}` (#2A6A8A), text `{colors.on-secondary}` (#FFFFFF), `{rounded.lg}`, `{spacing.md}` padding.

The lake blue background (`colors.secondary`) is non-negotiable and distinguishes wishlist from catalog state. Using `colors.surface` for wishlist is a known prior bug and must not be reintroduced.

- `button-primary` = "I'm In" (commit action). Transitions activity to committed state.
- `button-danger` = "Remove" (return to catalog). Label must always be visible text, never icon-only.
- `button-suggest` always visible. Opens recipient picker with optional note field.
- Drive time shown (same requirement as catalog).
- Tag chips: same 3-max + "+N more" rule as catalog.
- No heart icon — being on the wishlist implies wishlisted.
- At 25+ wishlist items: `wishlist-slot-warning` banner appears (soft cap). At 30 items, adding further is blocked.

#### `card-committed` — Decided

Background `{colors.tertiary}` (#6B4C8F), text `{colors.on-tertiary}` (#FFFFFF), `{rounded.lg}`, `{spacing.md}` padding.

- `committed-banner` pinned to top of card. Background `{colors.tertiary}`, text `{colors.on-tertiary}`.
- **Locked committed banner copy format:** `[Status] — Leaving at [TIME] — You + [N] others`
  Example: `Ticket Purchased — Leaving at 5:45 PM — You + 4 others`
- Visible to ALL family members regardless of their own commitment state.
- No heart icon, no trash icon. Cancel by texting the organizer (Alex) only.
- `{colors.tertiary}` is exclusively for this state. No other component may use it as a background or accent.

### Buttons

**`button-primary`:** Moss green, white text, `nav-label` typography, `rounded.md`, `spacing.sm` padding. The single highest-priority action per card. Never use more than one per card.

**`button-primary-hover`:** Dimmed moss (`primary-dim`). Applied on `:hover` and `:active`. Inherits all other tokens from `button-primary`; only `backgroundColor` changes.

**`button-secondary`:** Lake blue, white text, `nav-label` typography, `rounded.md`. Secondary actions alongside a primary button.

**`button-danger`:** Brick red (`error`), white text, `nav-label` typography, `rounded.md`. Exclusively for destructive actions (Remove from wishlist, Remove from committed). Label must always include a visible text string — "Remove" is required. An icon may accompany the text but must never replace it.

**`button-heart`:** Transparent background, `{colors.primary}` icon color, `rounded.pill`, `spacing.xs` padding. Never disabled — if wishlisting is blocked, surface `wishlist-slot-warning` instead.

**`button-suggest`:** Transparent background, `on-surface-dim` text, `label` typography, `rounded.md`. Low-emphasis exploratory actions. Does not trigger state transitions.

All interactive buttons require a minimum 44x44px touch target.

### Tag Chips

Tags appear in a horizontal row on every card variant. Style: `tag-chip` tokens — `{colors.outline}` background, `{colors.on-surface}` text, `{typography.label}`, `{rounded.pill}`, `{spacing.xs}` padding.

**Locked tag vocabulary — do not improvise or abbreviate:**

| Category | Tags |
|---|---|
| Show categories (pick 1-2) | music, comedy, magic, variety, drama, tribute |
| Music subgenres | country, rock, gospel, bluegrass, pop, oldies-50s, oldies-60s, oldies-70s, oldies-80s, classical |
| Audience vibe | family, adult-humor, date-night, kid-focused |
| Attraction tags | indoor, outdoor, ride, museum, active, relaxed, food, shopping, educational, thrill, animals, water, all-day, under-1hr, 1-2hr, half-day |

**Accent chips** (`accent-sand-chip`, `accent-clay-chip`) are venue/category labels, not tag chips. They appear in a dedicated row above the tag chip row on a card and must never be mixed into the tag chip row.

### Filter Chips

**`chip-filter` (inactive):** `{colors.surface}` background, `{colors.on-surface-dim}` text, `{rounded.pill}`.

**`chip-filter-active`:** `{colors.on-surface}` background (near-black), `{colors.surface}` text (cream), `{rounded.pill}`. The inversion provides high-contrast toggle feedback without a separate indicator element.

Filters reset on every session load. No filter, sort, or search state is persisted.

### Badges

**`badge-warning`:** `{colors.warn}` background, white text, `{typography.label}`, `{rounded.pill}`. Used for: "Almost full", "Limited slots", "Booking deadline today".

**`badge-neutral`:** `{colors.status-neutral}` background, white text, `{typography.label}`, `{rounded.pill}`. Used for: "TBD", "No time set", "Check availability".

Every badge must include a visible text label — never icon-only.

### RSVP Chips

RSVP state chips appear on event cards to communicate each family member's response to a scheduled event. Written by `rsvp.js` to the `event_rsvps` table (not the `schedule_events` arrays). All four variants use `{typography.label}`, `{rounded.pill}`, and `{spacing.xs}` padding.

**`chip-rsvp-interested`:** `var(--status-yes)` background, white text, `{typography.label}`, `{rounded.pill}`, `{spacing.xs}` padding.

**`chip-rsvp-undecided`:** `{colors.warn}` background, `{colors.on-warn}` text, `{typography.label}`, `{rounded.pill}`, `{spacing.xs}` padding.

**`chip-rsvp-not-going`:** `var(--status-no)` background, white text, `{typography.label}`, `{rounded.pill}`, `{spacing.xs}` padding.

**`chip-rsvp-no-response`:** transparent background, `var(--color-ink-dim)` text, `{typography.label}`, `{rounded.pill}`, `{spacing.xs}` padding.

All four state tokens (`--status-yes`, `--warn`, `--status-no`, `--color-ink-dim`) already exist in `tokens.css`. Do not substitute raw hex values.

### Wishlist Slot Warning

`wishlist-slot-warning` appears inline when a wishlist conflict or capacity constraint exists. Must appear inline below the triggering action — never a silent block. `{colors.warn}` background, `{colors.on-warn}` text.

**Locked copy format:** `[Reason]. [Action suggestion].`
Example: `Your wishlist is getting long — 26 of 30 slots used. Commit or remove some activities to make room.`

### Surface and Error Components

**`surface-page`:** `{colors.surface-bg}` background, `{colors.on-surface}` text. The scrollable content canvas for each view. Not a card.

**`error-inline`:** `{colors.error}` background, `{colors.on-error}` text, `{typography.label}`, `{rounded.md}`. Appears inline within a form row or action area. Never overlays the card or appears as a toast.

## Do's and Don'ts

- **Do** show drive time from Watermill Cove on every catalog card and every wishlist card. It is never optional.
- **Do** use `card-wishlist` with `backgroundColor: {colors.secondary}` (lake blue). The catalog-vs-wishlist distinction is non-negotiable. Using `colors.surface` for wishlist is a corrected prior bug.
- **Do** use the locked tag vocabulary. No improvised tags. If a new tag is genuinely required, update this spec first.
- **Do** allow multi-recipient suggestions in a single action.
- **Do** use Lexend exclusively for `display`, `headline`, and `nav-label` roles. Use Atkinson Hyperlegible for `body`, `body-sm`, and `label` roles. Do not substitute or mix in other typefaces.
- **Do** maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text and UI boundaries). Re-validate if any hex value is substituted.
- **Do** keep all primary reading text at or above 16px (1rem).
- **Do** pair every color signal with a supporting icon or text label. Never use color as the sole indicator of state (WCAG SC 1.4.1).
- **Do** set minimum touch targets to 44x44px for all interactive elements.
- **Do** apply `aria-current="page"` on the active nav link. Apply `focus-visible` styles on all interactive elements.
- **Do** render committed banner copy in the exact locked format: `[Status] — Leaving at [TIME] — You + [N] others`.
- **Do** surface `wishlist-slot-warning` with a specific reason and actionable suggestion whenever a wishlist action is blocked. Never silently prevent the action.
- **Do** serve fonts from Google Fonts CDN with `font-display: swap`. Load Lexend weights 700 and 800; Atkinson Hyperlegible weight 400.
- **Do** respect `prefers-reduced-motion`. Suppress all transitions and entrance animations when the OS motion preference is reduced. Provide an equivalent instant visual swap for state changes.
- **Don't** put a trash icon on committed cards. Cancel a committed activity by texting the organizer (Alex) only.
- **Don't** use `{colors.tertiary}` (dusk purple, #6B4C8F) for any purpose other than the committed card state and `committed-banner`.
- **Don't** persist filter, sort, or search state between sessions. All controls must initialize to their unfiltered default on every page load.
- **Don't** reference resale ticketing sites anywhere in the UI or data layer (StubHub, Viagogo, SeatGeek, VividSeats, or similar). All ticketing information must originate from official or direct venue sources.
- **Don't** use `accent-sand` (#D8A660) as a text color on `surface` or `surface-bg` — contrast is 2.2:1, which fails WCAG AA for text. Use it only for decorative graphical elements where the value is also conveyed by an adjacent text label.
- **Don't** apply drop shadows heavier than `box-shadow: 0 2px 12px rgba(32, 40, 30, 0.10)`. No colored shadows, multiple shadow layers, or inset shadows.
- **Don't** render body prose or card description text below 16px. `body-sm` (14px) is permitted only for supplementary metadata. `label` (12px) is permitted only inside chips, badges, and banners.
- **Don't** embed dark-mode hex values in this file or in component token definitions. Dark mode is CSS-only.
- **Don't** place more than one `button-primary` on a single card. Demote the secondary action to `button-secondary`.
- **Don't** use icon-only destructive buttons. A visible "Remove" text label is always required.
