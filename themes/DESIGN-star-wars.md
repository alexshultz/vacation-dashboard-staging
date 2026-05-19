---
version: alpha
name: Branson '26 -- Star Wars
description: "A galaxy far, far away. Title-crawl yellow, lightsaber accents, deep space or Rebel briefing room. Best for: Everyone. Tayden, Jacob, Josh, Brian, Ray."
colors:
  primary: "#006600"
  on-primary: "#FFFFFF"
  primary-dim: "#004400"
  secondary: "#0055AA"
  on-secondary: "#FFFFFF"
  tertiary: "#7A6000"
  on-tertiary: "#FFFFFF"
  surface: "#F5F5F0"
  surface-bg: "#EEEEE8"
  on-surface: "#0A0A0F"
  on-surface-dim: "#4A4A5A"
  outline: "#D0D0C8"
  error: "#AA1100"
  on-error: "#FFFFFF"
  warn: "#7A5000"
  on-warn: "#FFFFFF"
  accent-1: "#6A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#505050"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: "Star Jedi, Orbitron, Eurostile, sans-serif"
    fontSize: 2rem
    fontWeight: 400
    lineHeight: 1.1
    note: "Local @font-face font. Served from web/assets/fonts/star_jedi/Starjedi.ttf"
  headline:
    fontFamily: Orbitron
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Orbitron
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: Share Tech Mono
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Share Tech Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Share Tech Mono
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

Light mode is the Rebel Alliance briefing room -- warm stone walls, tactical holodisplays. Dark mode is the Death Star control room -- space black with green saber glow, Sith red danger, title-crawl yellow for locked events, and rebel orange warnings. The Force is strong in both modes.

**Fonts:** `Star Jedi` (display role only, ≥2rem page titles) is served locally from `web/assets/fonts/star_jedi/Starjedi.ttf` via `@font-face` in `star-wars.css`. `Orbitron` (headlines, nav labels) and `Share Tech Mono` (body) are loaded from Google Fonts. `Star Jedi Hollow` is also bundled (`Starjhol.ttf`) but not applied in CSS -- reserved for future decorative use.

## Colors

- **Primary (#006600):** Endor forest green -- confirmed, may the Force be with you.
- **Secondary (#0055AA):** R2-D2 blue (muted) -- on the wishlist.
- **Tertiary (#7A6000):** C-3PO gold muted -- locked and booked.
- **Surface (#F5F5F0 / #EEEEE8):** Rebel briefing room warm gray-white.
- **Accent sand (#A08020):** C-3PO gold (darkened) -- protocol droid accent.
- **Status neutral (#505050):** Imperial gray -- neutral, neither Rebel nor Empire.
