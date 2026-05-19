---
version: alpha
name: Branson '26 — Night Hike
description: After-dark adventure. Deep navy, steel teal, and phosphorescent cyan on cool silver-white.
colors:
  primary: "#1E5FA8"
  on-primary: "#FFFFFF"
  primary-dim: "#144080"
  secondary: "#1A7A6E"
  on-secondary: "#FFFFFF"
  tertiary: "#5B2D8E"
  on-tertiary: "#FFFFFF"
  surface: "#F4F6F9"
  surface-bg: "#EBF0F5"
  on-surface: "#0D1A2E"
  on-surface-dim: "#3A5060"
  outline: "#C8D8E8"
  error: "#B83A35"
  on-error: "#FFFFFF"
  warn: "#6B4A0A"
  on-warn: "#FFFFFF"
  accent-1: "#7EC8D4"
  accent-2: "#B83A35"
  status-neutral: "#4A5A6A"
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
  accent-1-chip:
    backgroundColor: "{colors.accent-1}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  accent-2-chip:
    backgroundColor: "{colors.accent-2}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}" 
---

## Overview

Stars through pine canopy. Moonlit trails and glowing trail markers. The Night Hike theme uses deep navy and steel teal to evoke an after-dark adventure — cool, focused, electric. Cyan replaces amber as the accent color, evoking bioluminescence and headlamp glow.

## Colors

- **Primary (#1E5FA8):** Moonlit blue. Trail marker in darkness.
- **Secondary (#1A7A6E):** Phosphorescent teal. Cool accent for secondary actions.
- **Tertiary (#5B2D8E):** Night sky purple. Committed events and banners.
- **Surface (#F4F6F9 / #EBF0F5):** Cool silver-white. Crisp and focused.
- **Accent sand (#7EC8D4):** Starlight cyan. Replaces warm amber with cool glow.
- **Accent clay (#B83A35):** Alert red. Danger and remove actions.
