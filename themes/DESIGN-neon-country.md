---
version: alpha
name: Branson '26 -- Neon Country
description: "A honky-tonk bar at midnight -- warm wood grain meets blinking neon signs. Like the Branson strip come alive at night. Best for: Country music fans, adults who want something bold."
colors:
  primary: "#1E6830"
  on-primary: "#FFFFFF"
  primary-dim: "#144820"
  secondary: "#1A5080"
  on-secondary: "#FFFFFF"
  tertiary: "#7A2878"
  on-tertiary: "#FFFFFF"
  surface: "#FAF0D8"
  surface-bg: "#F2E6C8"
  on-surface: "#1C0C04"
  on-surface-dim: "#6B4820"
  outline: "#D4B870"
  error: "#B82820"
  on-error: "#FFFFFF"
  warn: "#7A4400"
  on-warn: "#FFFFFF"
  accent-sand: "#8B5000"
  on-accent: "#FFFFFF"
  status-neutral: "#7A6040"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Rye
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  headline:
    fontFamily: Rye
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Rye
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: Arvo
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Arvo
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Arvo
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

Sun-baked sand in light mode; honky-tonk at midnight in dark mode. Neon Country uses warm wood grain (Rye serif) and warm straw backgrounds with orange marquee neon as the accent. In light mode it's a sun-baked strip. In dark mode the neon signs blaze -- orange marquee, red cursive, ice-blue neon, hot-pink signs -- fully unexpected and totally on-brand for Branson.

## Colors

- **Primary (#1E6830):** Deep forest green -- going! (readable on tan bg)
- **Secondary (#1A5080):** Deep night-sky blue -- wishlist interest.
- **Tertiary (#7A2878):** Deep neon-purple -- locked and booked.
- **Surface (#FAF0D8 / #F2E6C8):** Sun-baked sand -- warm Branson strip by day.
- **Accent sand (#C07800):** Orange marquee neon (darkened) -- the strip at dusk.
- **Status neutral (#7A6040):** Worn leather -- neutral, undecided.
