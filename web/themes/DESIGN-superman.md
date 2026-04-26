---
version: alpha
name: Branson '26 -- Superman
description: "Classic DC Comics Superman. Cape red, suit blue, S-shield yellow on Metropolis sky-blue white. Best for: Kids and adults who love Superman, DC fans, Jackson, David."
colors:
  primary: "#005C00"
  on-primary: "#FFFFFF"
  primary-dim: "#004000"
  secondary: "#003DA5"
  on-secondary: "#FFFFFF"
  tertiary: "#7A5000"
  on-tertiary: "#FFFFFF"
  surface: "#F8FBFF"
  surface-bg: "#EEF4FF"
  on-surface: "#0A0F1E"
  on-surface-dim: "#3A5070"
  outline: "#BDD0EE"
  error: "#9A0000"
  on-error: "#FFFFFF"
  warn: "#6A5000"
  on-warn: "#FFFFFF"
  accent-sand: "#6A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#5A6878"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Bangers
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  headline:
    fontFamily: Bangers
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Bangers
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: Oswald
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Oswald
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Oswald
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
    backgroundColor: "{colors.accent-sand}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}" 
---

## Overview

Bright morning in Metropolis -- clear sky, glass towers, hope in the air. Light mode is Metropolis daytime: sky-blue tinted whites, heroic primary colors. Dark mode is Metropolis at night: neon Kryptonite green blazes against deep navy, the S-shield spotlight burns warm ivory, and the cape red blazes bright. Truth, Justice, and the American Way.

## Colors

- **Primary (#005C00):** Deep heroic green -- confirmed going, like Superman landing.
- **Secondary (#003DA5):** Superman suit blue (deep) -- on the wishlist.
- **Tertiary (#7A5000):** S-shield gold muted -- locked and booked.
- **Surface (#F8FBFF / #EEF4FF):** Metropolis sky-blue near-white.
- **Accent sand (#AA8000):** Muted S-shield yellow -- warm gold accent.
- **Status neutral (#5A6878):** Metropolis concrete gray -- undecided.
