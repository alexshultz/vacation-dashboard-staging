---
version: alpha
name: Branson '26 -- Toy Story
description: "Andy's room come to life. Woody's hat gold, Buzz's purple, Rex green on Andy's sky-blue wallpaper white. Best for: Kids and nostalgic adults -- Georgie, Adrian, Jackson, McKinley."
colors:
  primary: "#1A6B30"
  on-primary: "#FFFFFF"
  primary-dim: "#0F4A20"
  secondary: "#1A5A9A"
  on-secondary: "#FFFFFF"
  tertiary: "#5A2878"
  on-tertiary: "#FFFFFF"
  surface: "#F8FDFF"
  surface-bg: "#EEF6FF"
  on-surface: "#1A0C00"
  on-surface-dim: "#5A3A20"
  outline: "#BBDDF5"
  error: "#9A2018"
  on-error: "#FFFFFF"
  warn: "#8A6800"
  on-warn: "#FFFFFF"
  accent-1: "#6A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#6A5A40"
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
    backgroundColor: "{colors.accent-1}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}" 
---

## Overview

Andy's room, warm and sunny like a childhood bedroom -- the sky wallpaper glowing, toys arranged on shelves, sunlight through curtains. Light mode is Andy's room at daytime. Dark mode is toys coming alive at night -- warm lamp glow from the hallway, blue moonlight through the window, every color a little more electric. To infinity and beyond.

## Colors

- **Primary (#1A6B30):** Buzz Lightyear green trim -- I'm going! To infinity!
- **Secondary (#1A5A9A):** Woody's blue shirt -- on my list.
- **Tertiary (#5A2878):** Pizza Planet purple -- locked and booked.
- **Surface (#F8FDFF / #EEF6FF):** Andy's sky wallpaper tint -- dreamy light blue.
- **Accent sand (#A08000):** Woody's hat gold (darkened) -- warm lamp glow.
- **Status neutral (#6A5A40):** Woody brown neutral -- undecided, partner.
