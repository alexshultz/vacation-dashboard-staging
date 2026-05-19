---
version: alpha
name: Branson '26 -- Midnight
description: "Electric dark -- neon-infused like Ozarks midnight sky meets gaming HUD. Best for: Teenagers, gamers, night owls, anyone who thinks the default is too earthy."
colors:
  primary: "#2A45C8"
  on-primary: "#FFFFFF"
  primary-dim: "#1A30A0"
  secondary: "#1A7A44"
  on-secondary: "#FFFFFF"
  tertiary: "#5830B0"
  on-tertiary: "#FFFFFF"
  surface: "#F8F9FF"
  surface-bg: "#ECEEF8"
  on-surface: "#0B0D17"
  on-surface-dim: "#4A5178"
  outline: "#CDD0E3"
  error: "#B82050"
  on-error: "#FFFFFF"
  warn: "#8C6C00"
  on-warn: "#FFFFFF"
  accent-1: "#8C7200"
  on-accent: "#FFFFFF"
  status-neutral: "#5A6080"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Orbitron
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
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
    fontFamily: Exo 2
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Exo 2
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Exo 2
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

Electric dark meets cool indigo. The Midnight CSS theme uses readable muted neon in light mode and unleashes the full plasma palette in dark mode -- neon teal-green, hot magenta, electric indigo, and neon amber. Light mode is cool blue-tinted near-white (a gaming HUD in daylight). Dark mode is the real Midnight experience.

## Colors

- **Primary (#2A45C8):** Deep electric blue -- readable on light, blazing in dark.
- **Secondary (#1A7A44):** Deep emerald -- going! Readable on both modes.
- **Tertiary (#5830B0):** Deep violet -- locked and booked.
- **Surface (#F8F9FF / #ECEEF8):** Cool indigo-tinted near-white.
- **Accent sand (#8C7200):** Dark amber -- muted in light, full #FFD426 neon in dark.
- **Status neutral (#5A6080):** Cool slate gray -- calm indecision.
