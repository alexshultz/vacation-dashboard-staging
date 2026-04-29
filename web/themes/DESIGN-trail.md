---
version: alpha
name: Branson '26 -- Trail
description: "Default Ozarks-inspired theme. Earthy moss green, Table Rock Lake blue, sandstone warm gold. Nature-trail colours grounded in the Branson landscape. Best for: everyone -- the family-default theme."
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
  warn: "#A86A1C"
  on-warn: "#FFFFFF"
  accent-1: "#D8A660"
  on-accent: "#FFFFFF"
  status-neutral: "#8B8671"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Lexend  # --font-display in tokens.css
    fontSize: 1.375rem  # --text-xl: 22px
    fontWeight: 700     # NOTE: verify -- not defined in tokens.css
    lineHeight: 1.1     # NOTE: verify -- not defined in tokens.css
  headline:
    fontFamily: Lexend  # --font-display in tokens.css
    fontSize: 1.1875rem # --text-lg: 19px
    fontWeight: 700     # NOTE: verify -- not defined in tokens.css
    lineHeight: 1.25    # NOTE: verify -- not defined in tokens.css
  nav-label:
    fontFamily: Lexend  # --font-display in tokens.css
    fontSize: 0.875rem  # --text-sm: 14px
    fontWeight: 700     # NOTE: verify -- not defined in tokens.css
    lineHeight: 1       # NOTE: verify -- not defined in tokens.css
  body:
    fontFamily: Atkinson Hyperlegible  # --font-body in tokens.css
    fontSize: 1.0625rem # --text-base: 17px
    fontWeight: 400     # NOTE: verify -- not defined in tokens.css
    lineHeight: 1.5     # NOTE: verify -- not defined in tokens.css
  body-sm:
    fontFamily: Atkinson Hyperlegible  # --font-body in tokens.css
    fontSize: 0.875rem  # --text-sm: 14px
    fontWeight: 400     # NOTE: verify -- not defined in tokens.css
    lineHeight: 1.5     # NOTE: verify -- not defined in tokens.css
  label:
    fontFamily: Atkinson Hyperlegible  # --font-body in tokens.css
    fontSize: 0.75rem   # --text-xs: 12px
    fontWeight: 400     # NOTE: verify -- not defined in tokens.css
    lineHeight: 1       # NOTE: verify -- not defined in tokens.css
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
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
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
  accent-chip:
    backgroundColor: "{colors.accent-1}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
---

## Overview

Morning light through Ozark hardwoods -- dappled greens, still lake reflections, warm sandstone bluffs. Light mode is sun-drenched trail: cream parchment backgrounds, deep moss green for confirmed plans, lake blue for the wishlist, and sand gold as the warm accent. Dark mode dims to deep forest at dusk: charcoal green backgrounds, moonlit cream ink, and forest-floor dark lines. This is the family-default theme -- accessible, earthy, and readable outdoors.

## Colors

- **Primary (#3F6B3A -- `--moss`):** Ozarks moss green -- confirmed going, ready to hike.
- **Primary dim (#284A26 -- `--moss-d`):** Deeper forest shadow -- hover and pressed states.
- **Secondary (#2A6A8A -- `--lake`):** Table Rock Lake blue -- on the wishlist.
- **Tertiary (#6B4C8F -- `--dusk`):** Ozarks twilight purple -- locked and booked.
- **Surface (#FFFDF7 / #FBF6EC):** Warm cream -- aged paper, sunlit trail guide.
- **Accent 1 (#D8A660 -- `--sand` / `--accent-1`):** Sandstone warm gold -- highlight accent.
- **Accent 2 (#C1553B -- `--clay` / `--accent-2`):** Red clay hillside -- secondary accent.
- **Accent 3 (#6B4C8F -- `--dusk` / `--accent-3`):** Twilight purple -- tertiary accent (same hue as tertiary).
- **Status neutral (#8B8671):** Weathered limestone -- undecided.
- **Error (#B83A35):** Danger red -- not going.
- **Warn (#A86A1C light / #E0B35A dark):** Amber caution.

## Dark Mode

Dark mode overrides are defined in `tokens.css` (global defaults). No trail-specific dark overrides are defined in `trail.css`.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#FBF6EC` | `#161A14` |
| `--color-surface` | `#FFFDF7` | `#1F261C` |
| `--color-ink` | `#20281E` | `#F3EEDD` |
| `--color-ink-dim` | `#5E6B58` | `#ADB3A3` |
| `--color-line` | `#E4DCC6` | `#343C2F` |
| `--warn` | `#A86A1C` | `#E0B35A` |

## Geometry

No theme-specific geometry tokens -- see tokens.css for global defaults.

| Token | Value |
|---|---|
| `--radius-card` | `18px` |
| `--radius-pill` | `999px` |
| `--radius-btn` | `10px` |
| `--shadow-1` | `0 1px 2px rgba(32,40,30,0.05), 0 6px 18px rgba(32,40,30,0.06)` |
| `--shadow-2` | `0 2px 4px rgba(32,40,30,0.08), 0 20px 40px rgba(0,0,0,0.10)` |
