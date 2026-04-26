---
version: alpha
name: Branson '26 — Sunrise
description: First light over the Ozarks. Deep crimson dawn, saddlebrown earth, pre-dawn purple on warm morning cream.
colors:
  primary: "#8B1A1A"
  on-primary: "#FFFFFF"
  primary-dim: "#6B1010"
  secondary: "#8B4513"
  on-secondary: "#FFFFFF"
  tertiary: "#6B3A8B"
  on-tertiary: "#FFFFFF"
  surface: "#FFFBF0"
  surface-bg: "#FFF5DC"
  on-surface: "#2C1810"
  on-surface-dim: "#6B4A35"
  outline: "#F5DEB3"
  error: "#8B1A1A"
  on-error: "#FFFFFF"
  warn: "#7A4D0E"
  on-warn: "#FFFFFF"
  accent-sand: "#C8860A"
  accent-clay: "#8B3A2A"
  status-neutral: "#7A6A5A"
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

Golden hour over the Ozarks before anyone else is awake. Sunrise uses deep crimson dawn and saddlebrown earth tones on a warm cream that glows like morning light through cabin windows. Energizing without being harsh.

## Colors

- **Primary (#8B1A1A):** Sunrise crimson. Deep red-dawn for primary actions.
- **Secondary (#8B4513):** Saddlebrown. Earthy terra cotta for secondary actions.
- **Tertiary (#6B3A8B):** Pre-dawn purple. The sky just before first light.
- **Surface (#FFFBF0 / #FFF5DC):** Morning cream. Warm and golden.
- **Accent sand (#C8860A):** Golden sunbeam. Bright but grounded amber.
- **Accent clay (#8B3A2A):** Deep clay. Remove actions and danger states.
