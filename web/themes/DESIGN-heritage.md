---
version: alpha
name: Branson '26 -- Heritage
description: "Warm parchment + Colonial American palette. Playfair Display headings, EB Garamond body. Best for: Grandparents, adults who prefer timeless over trendy."
colors:
  primary: "#7A5200"
  on-primary: "#FFFFFF"
  primary-dim: "#5A3C00"
  secondary: "#4A6A1A"
  on-secondary: "#FFFFFF"
  tertiary: "#5A2A6A"
  on-tertiary: "#FFFFFF"
  surface: "#FDFAF5"
  surface-bg: "#F7F0DF"
  on-surface: "#1A1208"
  on-surface-dim: "#6B4820"
  outline: "#D4C8A8"
  error: "#8B1A1A"
  on-error: "#FFFFFF"
  warn: "#7A4D0E"
  on-warn: "#FFFFFF"
  accent-sand: "#6A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#6B5A40"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Playfair Display
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  headline:
    fontFamily: Playfair Display
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Playfair Display
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: EB Garamond
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: EB Garamond
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: EB Garamond
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

Warm parchment and Colonial American dignity -- like a fine printed program from a Branson country music show. Heritage prioritizes maximum readability: Playfair Display for headings, EB Garamond for body copy. Legible, calm, and dignified. Best for grandparents and adults who want timeless over trendy.

## Colors

- **Primary (#7A5200):** Warm gold-brown -- burnished brass and old wood.
- **Secondary (#4A6A1A):** Heritage green -- traditional and grounded.
- **Tertiary (#5A2A6A):** Dignified purple -- locked and committed.
- **Surface (#FDFAF5 / #F7F0DF):** Parchment warm white -- Declaration of Independence energy.
- **Accent sand (#A07800):** Colonial gold -- candlelight and brass fixtures.
- **Status neutral (#6B5A40):** Warm brown-gray -- undecided but dignified.
