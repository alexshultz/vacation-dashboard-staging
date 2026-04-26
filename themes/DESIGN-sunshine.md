---
version: alpha
name: Branson '26 -- Sunshine
description: "Summer carnival, candy-bright. Lemon yellow, coral orange, sky blue on warm cotton-candy white. Maximum happiness. Best for: Young kids (5-10) and anyone who wants pure summer energy."
colors:
  primary: "#1A7A08"
  on-primary: "#FFFFFF"
  primary-dim: "#0F5A04"
  secondary: "#005A8A"
  on-secondary: "#FFFFFF"
  tertiary: "#9A28C0"
  on-tertiary: "#FFFFFF"
  surface: "#FFFDF0"
  surface-bg: "#FFF8D6"
  on-surface: "#261800"
  on-surface-dim: "#6B4820"
  outline: "#FFDC60"
  error: "#CC3010"
  on-error: "#FFFFFF"
  warn: "#8A6000"
  on-warn: "#FFFFFF"
  accent-sand: "#7A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#5A5030"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Fredoka One
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  headline:
    fontFamily: Fredoka One
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Fredoka One
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: Nunito
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Nunito
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Nunito
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

Pure summer vacation happy energy. Sunshine uses vivid lime green (going!), bright sky blue (wishlist), and grape purple (committed) against warm lemon cotton-candy backgrounds. Maximum brightness -- designed to make kids smile. Dark mode is warm and cozy, not harsh: warm dark chocolate backgrounds with lemon-cream text.

## Colors

- **Primary (#2AAA18):** Vivid lime green -- going! Pure joy.
- **Secondary (#0090CC):** Bright sky blue -- on the wishlist.
- **Tertiary (#9A28C0):** Grape purple -- locked and booked.
- **Surface (#FFFDF0 / #FFF8D6):** Warm lemon cotton candy white.
- **Accent sand (#B88000):** Dark lemon amber -- warm and bright.
- **Status neutral (#888060):** Warm olive-gray -- undecided.
