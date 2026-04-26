---
version: alpha
name: Branson '26 -- SpongeBob
description: "Sunny Bikini Bottom above the waves. SpongeBob yellow, Patrick pink, Sandy teal, Squidward purple on warm sandy backgrounds. Best for: Young kids, anyone who loves SpongeBob."
colors:
  primary: "#1A6B3C"
  on-primary: "#FFFFFF"
  primary-dim: "#0F4A28"
  secondary: "#0070A0"
  on-secondary: "#FFFFFF"
  tertiary: "#5A2878"
  on-tertiary: "#FFFFFF"
  surface: "#FFFEF0"
  surface-bg: "#FFF9D6"
  on-surface: "#1A1400"
  on-surface-dim: "#7B5A00"
  outline: "#FFE066"
  error: "#B83010"
  on-error: "#FFFFFF"
  warn: "#7A4800"
  on-warn: "#FFFFFF"
  accent-sand: "#7A5000"
  on-accent: "#FFFFFF"
  status-neutral: "#7B6040"
  on-neutral: "#FFFFFF"
typography:
  display:
    fontFamily: Bangers
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
  headline:
    fontFamily: Bangers
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.25
  nav-label:
    fontFamily: Bangers
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: Patrick Hand
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Patrick Hand
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Patrick Hand
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

A warm beach day at Goo Lagoon -- bright sun, white sea foam, SpongeBob and Patrick blowing bubbles in the sand. Light mode is sunny Bikini Bottom above the waves. Dark mode is the deep ocean floor at night -- lit by bioluminescent coral, SpongeBob's porch light glowing in the darkness, and character colors blazing at full saturation.

## Colors

- **Primary (#1A6B3C):** Seaweed/barnacle green -- I'm ready! Going!
- **Secondary (#0070A0):** Deep Bikini Bottom sky blue -- wishlist interest.
- **Tertiary (#5A2878):** Deep Squidward purple -- do not disturb my clarinet.
- **Surface (#FFFEF0 / #FFF9D6):** Warm sunny yellow-white -- sunlit sea foam.
- **Accent sand (#A87800):** Dark SpongeBob amber -- like a burnt krabby patty.
- **Status neutral (#7B6040):** Sea-floor sand neutral -- passive, drifting.
