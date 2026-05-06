---
title: Branson 2026 Dashboard Redesign - Complete History and Decision Log
created: 2026-05-05
tags: [branson-2026, design-system, redesign, ai-collaboration, history]
ai-created: true
---

# Branson 2026 Dashboard Redesign - Complete History and Decision Log

**Created by:** Hermes (main profile)  
**Date:** 2026-05-05  
**Purpose:** Single source of truth for the redesign process. Contains every idea, decision, rejection, iteration, and rationale so the brain vault maintains perfect memory.

## Project Origin

The project began with the user's request for "a short project on all my computers." It evolved into improving the existing Branson 2026 family vacation dashboard (a static multi-page web app hosted on GitHub Pages with Supabase backend).

The dashboard serves ~22 family members, with primary communication happening in iMessage. The dashboard is a supplementary planning tool for timelines, attractions, wishlist, participant availability, car capacity, and split-group scheduling.

The existing design was a "Trail" theme (Airbnb meets National Parks). The design system was previously locked per the `branson-web-pm` skill.

## Design Skills Activated

We activated and verified the full web design stack:

- **`claude-design`** — The "taste" skill. Provides design process, judgment, variants (Conservative / Strong-fit / Divergent), anti-slop rules, visual identity definition, context-first approach, and high-fidelity taste.
- **`popular-web-designs`** — 54 real design systems with exact tokens, colors, typography, components, and CSS (Linear, Notion, Vercel, Apple, Stripe, Supabase, Figma, Claude, etc.).
- **`design-md`** — Google's formal DESIGN.md token specification format with linting, WCAG checking, and export capabilities.

These three compose cleanly: `claude-design` for taste and process, `popular-web-designs` for visual vocabulary, `design-md` for formal token spec.

## Design Evolution

**Round 1 Proposal:**
- "Trail v2" direction blending Linear precision, Notion warmth, and Apple minimalism.
- Initial DESIGN.md with forest green and terracotta accent.
- Focused on mobile-first, timeline clarity, "This Week at a Glance", and admin overlay improvements.

**User Feedback (iPhone screenshot):**
- Page was too wide on mobile.
- Layout felt stretched and required horizontal scrolling.
- Overall aesthetic was "nice but not quite there yet."

**Round 2 Improvements (Current Direction - "Trail v2 – Lodge"):**
- Stronger mobile constraints (`max-w-md` on phones, scaling gracefully).
- Tighter responsive design with better padding and typography scale.
- Richer, more sophisticated nature-inspired palette (deep forest #1C2E25, warm terracotta #B84C32, soft cream #F9F6F0, warm dark mode).
- More explicit component definitions (TimelineEvent, ActivityCard, ParticipantPill).
- Stronger taste guardrails (generous whitespace, calm hierarchy, no decorative elements, purposeful motion only).
- Better visual emphasis on key events (e.g. "Highlight of the trip" card).

## Ideas Considered and Rejected

**Rejected Ideas:**
- Keeping the original locked "Trail" design system unchanged (too generic for family use).
- Heavy use of bright gradients or glassmorphism (classic AI slop).
- Dense SaaS-style dashboards with fake metrics and icon overload.
- Pure dark mode only (warm neutrals and light mode preferred for family vacation feel).
- Using cold corporate blues (conflicts with nature/lodge theme).
- Making it look like a stretched mobile app on desktop (explicitly rejected — must scale beautifully).
- Adding photographic hero images or heavy illustration (kept icon-based and typography-first).

**Accepted Direction ("Trail v2 – Lodge"):**
- Calm, warm, premium lodge aesthetic.
- Mobile-first with progressive enhancement.
- Linear precision for timelines + Notion warmth + Apple restraint.
- Strong "at a glance" hierarchy.
- Generous whitespace and clear participant indicators.
- Formal DESIGN.md as single source of truth.

## Mockup Iterations

Three high-fidelity mockups were created in `~/Projects/Branson-2026/mockups/` and served via local HTTP + Tailscale (`http://studio:8000`):

1. **index.html** — Home/Dashboard with "This Week at a Glance", quick actions, and family note.
2. **event-timeline.html** — Clean timeline with colored accent bars and participant status.
3. **attractions.html** — Card grid with strong visual hierarchy and status indicators.

All mockups were viewed on iPhone. Initial version was too wide. Second version tightened mobile constraints significantly.

## Technical Decisions

- Serving method: Local Python HTTP server on port 8000 + Tailscale (`http://studio:8000`) for reliable internal and external access.
- Design tokens: Formal `DESIGN.md` using Google's spec with linting and WCAG validation.
- Output format: Self-contained HTML with embedded CSS (Inter font via Google Fonts, Tailwind for rapid iteration).
- Constraints: Do not break existing data pipeline (`data.json`, Supabase), admin overlay (`body.is-admin`), or GitHub Pages deployment.

## Handoff Document

A separate, clean handoff document was written specifically for Vacation:

**Location:** `~/vaults/Vacation/Branson 2026/Redesign-Handoff-to-Vacation.md`

This document contains the final DESIGN.md, exact implementation steps, non-negotiable constraints, verification checklist, and success criteria. It is written so Vacation can execute autonomously.

## Current Status

The design system is now well-defined. Mockups have been created and reviewed on device. The project is ready for implementation by Vacation.

**Next Step:** Vacation should implement the redesign following the handoff document exactly.

**Links:**
- [[Redesign-Handoff-to-Vacation]]
- [[Trail v2 – Lodge]]
- [[claude-design]]
- [[popular-web-designs]]
- [[design-md]]

**Last Updated:** 2026-05-05 by Hermes
---

**This document is now saved at:** `~/vaults/Vacation/Branson 2026/Branson-2026-Dashboard-Redesign-History.md`