---
version: alpha
name: Branson '26 -- Dungeon Crawler Carl
description: "LitRPG System UI meets grimy dungeon crawl. Electric cyan System glow, bioluminescent teal, gold loot, arcane purple on stone gray. Best for: DCC fans, gamers, Mycah."
colors:
  primary: "#0076AA"
  on-primary: "#FFFFFF"
  primary-dim: "#005580"
  secondary: "#007744"
  on-secondary: "#FFFFFF"
  tertiary: "#6820C0"
  on-tertiary: "#FFFFFF"
  surface: "#F4F5FA"
  surface-bg: "#ECEEF4"
  on-surface: "#0D1017"
  on-surface-dim: "#4A4A58"
  outline: "#C8CAD8"
  error: "#C42010"
  on-error: "#FFFFFF"
  warn: "#8B4400"
  on-warn: "#FFFFFF"
  accent-1: "#7A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#545868"
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

The SYSTEM's signature color is #00D4FF -- electric cyan-blue. But in light mode, we use readable muted versions for legibility on stone-gray backgrounds. The real DCC experience is dark mode -- full midnight dungeon with neon System notifications and bioluminescent cave teal-cyan. Light mode is the dungeon lit by warm amber torches -- desaturated stone, readable ink.

## Colors

- **Primary (#0076AA):** Muted System cyan -- readable on stone bg. Goes full #00D4FF in dark mode.
- **Secondary (#007744):** Deep dungeon green -- merchant confirmed, going.
- **Tertiary (#6820C0):** Muted arcane purple -- achievement unlocked, locked and booked.
- **Surface (#F4F5FA / #ECEEF4):** Cool stone-gray parchment -- dungeon by torchlight.
- **Accent sand (#B07820):** Torchlight amber -- gold loot warmth.
- **Status neutral (#545868):** Stone gray -- calm indecision.
