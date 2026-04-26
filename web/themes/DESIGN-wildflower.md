---
version: alpha
name: Branson '26 — Wildflower
description: Ozarks spring meadow. Wild violet, sage green, and deep rose on soft petal-white.
colors:
  primary: "#5E3A8A"
  on-primary: "#FFFFFF"
  primary-dim: "#3F2060"
  secondary: "#3A6B4A"
  on-secondary: "#FFFFFF"
  tertiary: "#8B2A5A"
  on-tertiary: "#FFFFFF"
  surface: "#FDFCFF"
  surface-bg: "#F8F4FF"
  on-surface: "#1A0F2E"
  on-surface-dim: "#5A4A6A"
  outline: "#E8D8F5"
  error: "#B83A35"
  on-error: "#FFFFFF"
  warn: "#7A4D0E"
  on-warn: "#FFFFFF"
  accent-sand: "#C8A060"
  accent-clay: "#8B2A5A"
  status-neutral: "#6A5A7A"
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
---

## Overview

Redbud trees and wild violets blooming across the Ozark hillsides in April. Wildflower pairs lavender-purple with sage green for a fresh, botanical feel. Soft petal-white backgrounds and rose accents keep it warm without going precious.

## Colors

- **Primary (#5E3A8A):** Wild violet. Bold purple of Ozark wildflowers in bloom.
- **Secondary (#3A6B4A):** Sage meadow green. Grounding earthy counterpoint.
- **Tertiary (#8B2A5A):** Wildflower rose. Deep pink for committed events.
- **Surface (#FDFCFF / #F8F4FF):** Petal-white. Soft lavender-tinted near-white.
- **Accent sand (#C8A060):** Honey gold. Warm amber among the cool purples.
- **Accent clay (#8B2A5A):** Deep rose-clay. Remove and danger actions.
