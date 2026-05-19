---
version: alpha
name: Branson '26 — Desert Sky
description: High desert horizon. Deep turquoise sky, terra cotta earth, and warm sand on desert cream.
colors:
  primary: "#1A7A8A"
  on-primary: "#FFFFFF"
  primary-dim: "#0F5A66"
  secondary: "#8B4513"
  on-secondary: "#FFFFFF"
  tertiary: "#6B3A0A"
  on-tertiary: "#FFFFFF"
  surface: "#FFFCF0"
  surface-bg: "#FFF8E0"
  on-surface: "#1E1408"
  on-surface-dim: "#5A3A1A"
  outline: "#F0E0C0"
  error: "#B83A35"
  on-error: "#FFFFFF"
  warn: "#7A4D0E"
  on-warn: "#FFFFFF"
  accent-1: "#C89A10"
  accent-2: "#8B4513"
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

The infinite turquoise sky above a high desert mesa. Desert Sky pairs vivid teal with warm saddlebrown earth tones. Sand-cream backgrounds and desert gold accents feel like afternoon heat and red rock canyon walls. Unexpected and striking.

## Colors

- **Primary (#1A7A8A):** Turquoise sky. The color of desert sky at noon.
- **Secondary (#8B4513):** Terra cotta earth. Saddlebrown soil and canyon walls.
- **Tertiary (#6B3A0A):** Desert brown. Deep earth for committed events.
- **Surface (#FFFCF0 / #FFF8E0):** Desert cream. Dry heat and warm sand.
- **Accent sand (#C89A10):** Desert gold. Sunbaked sandstone shimmer.
- **Accent clay (#8B4513):** Terra cotta. Remove and danger actions.
