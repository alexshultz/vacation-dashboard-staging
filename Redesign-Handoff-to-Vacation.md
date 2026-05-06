---
title: Branson 2026 Dashboard Redesign Handoff (v2 – Lodge)
created: 2026-05-05
tags: [branson-2026, design-system, handoff, ai-collaboration]
ai-created: true
---

# Branson 2026 Dashboard Redesign Handoff (Trail v2 – Lodge)

**From:** Hermes (main profile)  
**To:** Vacation (branson-dashboard-maintenance + branson-web-pm profile)  
**Date:** 2026-05-05

This document is written so you can execute the entire redesign **without asking any clarifying questions**. Everything you need is here.

## Strategic Direction

We are evolving the current "Trail" theme into **"Trail v2 – Lodge"** — a calm, warm, premium family vacation planning tool that feels like a thoughtful national park lodge: natural materials, generous breathing room, clear hierarchy, and quiet confidence.

**Core Influences** (use these exact templates from `popular-web-designs`):
- Linear.app — precision, clarity, beautiful timelines
- Notion — warmth, collaborative feel, approachable density
- Apple — generous whitespace, tasteful restraint, premium simplicity, exceptional mobile experience

**Design Philosophy** (apply to every decision):
- Mobile-first (family primarily uses phones via iMessage links)
- High taste, zero slop (no generic gradients, fake metrics, decorative icons, or SaaS-card overload)
- Strong visual hierarchy and glanceability — one glance should answer “What’s happening this week and who is doing what?”
- Warm, nature-inspired but refined (deep forest green, warm terracotta, soft sandstone, rich cream)
- Excellent contrast on both light and dark modes
- Respect all existing technical architecture, data pipeline, Supabase schema, admin overlay pattern (`body.is-admin`), and GitHub Pages deployment.

## Final DESIGN.md (Exact Content)

Replace `/web/DESIGN.md` with this exact file:

```yaml
---
version: alpha
name: Trail v2 – Lodge
description: Calm, warm, premium family vacation planner. Feels like a thoughtful national park lodge — natural, spacious, clear, and confident. Evolves the original Trail theme with Linear precision, Notion warmth, and Apple restraint.
colors:
  primary: "#1C2E25"           # Deep forest (headers, key actions)
  accent: "#B84C32"            # Warm terracotta (CTAs, highlights, priority items)
  secondary: "#3A5C4B"         # Mid forest green
  neutral-light: "#F9F6F0"     # Warm cream background
  neutral-dark: "#2B2824"      # Warm dark mode base
  text-primary: "#1C1C1C"
  text-secondary: "#5C574E"
  border: "#EDE6D9"
  success: "#3A5C4B"
  warning: "#B84C32"
typography:
  heading:
    fontFamily: "Inter"
    fontWeight: 600
    letterSpacing: "-0.025em"
    lineHeight: 1.1
  body:
    fontFamily: "Inter"
    fontSize: "1rem"
    lineHeight: 1.65
  mono:
    fontFamily: "JetBrains Mono"
    fontSize: "0.85rem"
rounded:
  sm: "8px"
  md: "14px"
  lg: "24px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
shadows:
  card: "0 10px 30px -10px rgba(28, 30, 27, 0.12)"
  soft: "0 4px 16px -4px rgba(28, 30, 27, 0.08)"
components:
  card:
    backgroundColor: "{colors.neutral-light}"
    borderRadius: "{rounded.md}"
    shadow: "{shadows.card}"
    padding: "28px"
  timeline-event:
    borderLeft: "5px solid {colors.accent}"
    backgroundColor: "{colors.neutral-light}"
    hoverBackground: "#F0EDE4"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    borderRadius: "{rounded.sm}"
    padding: "14px 32px"
    fontWeight: 600
---

## Overview
Trail v2 – Lodge creates a calm, spacious, and confident planning environment for the Shultz family Branson 2026 trip. It prioritizes clarity, mobile usability, and gentle hierarchy. The feeling is thoughtful lodge rather than corporate dashboard.

## Colors
Primary (#1C2E25) and Accent (#B84C32) drive the identity. All backgrounds use warm neutrals. Dark mode uses the warm dark base with light text. All interactive elements must meet WCAG AA contrast (4.5:1 minimum).

## Typography
Use **Inter** for all UI text. JetBrains Mono only for small metadata (times, codes). Headings use slight negative tracking (-0.025em). Body text is generous (1.65 line-height). Never use more than two font families.

## Layout & Spacing
Generous whitespace is mandatory. Cards must breathe. Vertical rhythm follows the spacing scale exactly. Mobile: single column with large touch targets (minimum 48px).

## Components
- Cards are the main container. They must feel substantial and calm.
- Timeline events use a thick colored left border (accent color for confirmed/high-priority items).
- Primary buttons are substantial, rounded, and use the accent color.
- Participant indicators should be clear circles or pills with initials.

## Do's and Don'ts

**Do:**
- Prioritize mobile readability and thumb comfort
- Use generous whitespace and clear hierarchy
- Make “who is doing what” visually obvious at a glance
- Use the warm, natural palette consistently
- Make admin controls feel like a natural, high-quality extension of the UI

**Don't:**
- Use bright blue gradients, glassmorphism, or generic SaaS styling
- Add decorative icons or fake metrics
- Create visually dense layouts that feel overwhelming on phones
- Break the existing data.json / Supabase fetch patterns
- Use cold corporate blues or harsh contrasts
```

## Implementation Steps (Execute in Order)

1. Write the exact `DESIGN.md` above to `/web/DESIGN.md`.

2. Update `web/css/tokens.css`, `web/css/trail.css`, and `web/css/components.css` to implement every token from the new DESIGN.md using CSS custom properties.

3. Redesign the following pages using the new design system + `claude-design` taste principles:
   - `index.html` (home/dashboard)
   - `event-timeline.html` (primary family view)
   - The admin overlay system (`admin-overlay.js` + related CSS)

4. Specific UX Requirements (non-negotiable):
   - Mobile-first, single-column layout on all main pages
   - Beautiful, scannable timeline with colored accent bars and clear participant indicators
   - Strong “This Week at a Glance” section on the home page
   - Clear visual distinction between confirmed, interested, and undecided activities
   - Generous whitespace and calm hierarchy (Linear + Apple influence)
   - Warm, natural color usage throughout (no cold blues)
   - Subtle, purposeful motion only (card hover, timeline entry, loading states)

5. Strict Constraints (do not violate):
   - Do not change the data pipeline, Supabase schema, or JSON structure
   - Do not modify the admin authentication or `body.is-admin` pattern
   - Do not touch `generate_dashboard.py`

6. Verification Checklist (you must pass all before considering complete):
   - `npx @google/design.md lint DESIGN.md` returns zero errors
   - All text meets WCAG AA contrast
   - Mobile view (iPhone-sized) is excellent — no horizontal scrolling on main pages
   - Timeline clearly communicates who is doing what and when
   - Admin overlay appears cleanly and tastefully when authenticated
   - No visual regression on existing functionality
   - Overall feeling is calm, warm, premium, and family-friendly

When complete, reply with:
- Confirmation that `DESIGN.md` was created and passes linting
- List of all changed files
- Screenshots (or direct links) of the new mobile and desktop versions of the home page and event timeline
- Any remaining blockers

This handoff is complete. You have everything needed.

**Hermes**  
(Transferred from Vacation-coordinator on 2026-05-05)
---

**This document is now saved at:** `~/vaults/Vacation/Branson 2026/Redesign-Handoff-to-Vacation.md`

You can forward it directly to Vacation. It is written to be completely self-contained.