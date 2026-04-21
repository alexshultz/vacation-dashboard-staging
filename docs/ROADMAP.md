# Branson '26 Dashboard — Phased Roadmap

**Today:** 2026-04-20
**Family starts using dashboard:** ~2026-05-08 (two weeks before trip)
**Trip:** 2026-05-22 → 05-29

That's **~18 calendar days** to a usable product, **~32 days** to the trip. Time is the dominant constraint. This roadmap is honest about what fits and what doesn't.

---

## Guiding principles

1. **Ship a product people USE before you ship one that's PERFECT.** Family needs to start picking by May 8.
2. **Static site first, dynamic second.** Interest/RSVP features can write to a tiny backend (Supabase) without rewriting the front end.
3. **Don't build the auto-scheduler in Phase 1 or 2.** It's a whole separate product. Defer cleanly.
4. **Hallucination defense:** at each phase, ship something you can TEST in a browser and USE. No paper-only progress.

---

## Phase 1 — Foundation (Apr 20 → Apr 27, ~7 days)

**Goal:** design system locked, one reference page polished, nav deduplicated. Family can't use it yet, but every future page snaps to this scaffold.

### Deliverables

1. **Pick a visual direction.** Alex + 1–2 design-opinion family members review `web/mockups/` and pick A/B/C or a combo.
2. **`web/css/tokens.css` + `web/css/components.css`** — extracted from the chosen mockup.
3. **Shared head + nav partial in `scripts/generate_dashboard.py`** — one source of truth. Regenerating HTML files wires in the same nav everywhere.
4. **`attractions.html` fully rebuilt** on the new system as reference implementation. Filter row, card grid, trending strip, status legend.
5. **Dark mode** via `prefers-color-scheme` with one-click override.
6. **Accessibility pass**: WCAG AA contrast, focus outlines, 44×44 tap targets.
7. **`web/DESIGN.md`** finalized (draft exists now).
8. **Hosting decision finalized:** recommend GitHub Pages + custom domain (Alex owns DNS). Free, instant deploys on push, reliable.

### Cuts if we slip

- **Theme variants** (colorblind, outdoor) — ship default only; add variants in Phase 2.
- **Trending widget on Today view** — Phase 1 ships trending on Attractions only.

### Definition of done

- [ ] `attractions.html` looks polished on iPhone 14, iPad Pro, 13" MacBook, in both light and dark mode
- [ ] Changing the nav in ONE place updates it across all 5 pages
- [ ] `DESIGN.md` describes every token, component, and rule
- [ ] No CSS warnings, no console errors, Lighthouse performance ≥ 90
- [ ] Mom test: grandmother opens the site on her iPhone, can read the cards without glasses-squinting

---

## Phase 2 — Interactive core (Apr 28 → May 7, ~10 days)

**Goal:** family can actually use the site by May 8.

### Deliverables

1. **Interest/RSVP system**
   - Each user picks: Wishlist / Confirmed (card state reflects)
   - Avatar stack on cards shows who's interested
   - Status dropdown on schedule events: Yes / No / Undecided / No Response
2. **Tiny backend** — Supabase (free tier handles 26 users forever)
   - Auth: magic link via email + Google OAuth + Apple Sign-In
   - One table `picks` (user_id, attraction_slug, status, timestamp)
   - One table `event_rsvps` (user_id, event_id, status)
3. **Passkey / WebAuthn stay-signed-in** — browser biometric (Face ID, Touch ID, Windows Hello) after first login. Supabase Auth supports this.
4. **Today view** (`index.html` rebuild) — current/next events, today's attendees, trending picks, newly-discovered first-picks
5. **Meal counter for Evie** — on each meal event, show `N people confirmed · M undecided`, live-updating from schedule RSVPs
6. **People timeline upgrade** — per-person card grid: for each person, show their confirmed + wishlisted picks. "Who's at cabin right now" (arrive/leave date-based)
7. **Shows page** on the new system with showtime display
8. **Theme picker UI** — settings screen to switch between Cartridge/Lakeside/Trail/colorblind/outdoor themes, persisted in localStorage

### Architecture decisions (no Alex input needed per his guidance)

- **Build tool:** Vite (dev server, instant rebuilds, zero config for a static site). Production builds to plain HTML + CSS + JS — no runtime framework required.
- **Front end:** Vanilla JS + tiny reactivity (Alpine.js, ~15KB) for card state transitions. NO React / Next.js / Vue.
- **Backend:** Supabase. 26 users is nowhere near free-tier limits. If it becomes painful, we rip it out and ship a JSON file to a Cloudflare Worker; the client doesn't care.
- **Nav dedupe:** Python generate step (chosen). Runtime JS for nav injection would add a flash-of-missing-nav on load — bad UX for our "fast loading" requirement.

### Cuts if we slip

- **Apple Sign-In + phone-number auth** — if hard, ship email + Google only; other options added mid-trip or post-trip
- **People timeline location tracker** — Phase 3 if Supabase integration eats the week
- **Theme picker UI** — ships default + dark mode only; multi-theme deferred
- **Shows page polish** — fallback to old `shows.html` styled with token sheet; full rebuild Phase 3

### Definition of done

- [ ] Everyone in the family can log in and pick from their phone
- [ ] Picks show up on cards within seconds (live update or refresh-to-see, either works)
- [ ] Evie sees accurate meal counts on the schedule
- [ ] Today view usable as a morning check-in
- [ ] Dashboard works offline-degraded (can view content, can't vote) if wifi drops

---

## Phase 3 — Polish + magic (May 8 → May 21, ~13 days, trip-adjacent)

**Goal:** everything works, and the "magic" features Alex cares about ship IF time allows. This is the phase where we cut aggressively.

### Probably fits

- **Custom domain live** (branson26.family or similar — Alex picks)
- **Link previews** (OpenGraph tags on every page) so texted URLs show a nice card in iMessage/WhatsApp
- **PDF export** of schedule + master checklist — use `window.print()` + a print stylesheet. Nice-to-have.
- **Remaining pages** polished: shows, event timeline
- **Colorblind + outdoor theme variants**

### Uncertain — honest assessment

- **Auto-scheduler (the "magic" feature)** — this is a genuine multi-week project on its own. It needs:
  - Travel-time graph (addresses + routing data)
  - Meal/sleep constraints per person
  - Show fixed-time windows
  - Car-seating constraints
  - A solver (constraint programming or LLM-assisted heuristic)

  **My strong recommendation:** ship Phase 3 WITHOUT the auto-scheduler. Replace it with a **"Suggested groupings"** UI — humans still pick, but we show helpful hints: "3 people want Titanic on Mon, 2 want it on Tue — book Mon?" That's 90% of the scheduler's value for 10% of the work, ships in 2-3 days, and doesn't risk the whole project on an LLM that might hallucinate a schedule.

  The full auto-scheduler becomes a post-trip "v2 wishlist" item — good to build for the NEXT vacation.

- **Location tracker** ("who's at the cabin right now") — needs either manual check-in buttons or phone geofencing. Manual check-in is trivial; geofencing is not worth the engineering effort for a 7-day trip.

### Definitely cut

- **Native app wrapper for iOS/Android** (Alex floated it) — Progressive Web App with "Add to Home Screen" gives 95% of the benefit. No app store submission, no certificates, no review delays.
- **TV casting** — already called out as unlikely by Alex; screenshots suffice.

---

## What probably WON'T fit and why

| Feature | Why cut | When it ships |
|---|---|---|
| True auto-scheduler | Multi-week R&D, LLM hallucination risk | Post-trip v2 |
| Native mobile app | PWA covers it for negligible effort | Maybe never |
| Geofence location | Overkill for 7 days | Manual check-in Phase 3 |
| Print stylesheet | No printer at the cabin per Alex | PDF export covers it |
| Full offline PWA | Good connectivity confirmed | Graceful degrade in Phase 2 |

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| **Claude hallucinates broken code** (Alex's #1 fear) | Every Phase 1 deliverable is a working HTML file you can open in a browser. No "trust me it works" — always verify visually. For Phase 2 DB work, write one test per write-path before integrating. |
| **Scope creep into auto-scheduler** | Roadmap explicitly defers; when Alex asks "can we add the scheduler", answer is "yes, after the trip, or in a feature-flagged beta page that doesn't block the main dashboard." |
| **Auth complexity blocks Phase 2** | If Supabase Auth wastes a day, fall back to "passwordless magic link only via email." 26 family members, all trusted — no need for multi-factor. |
| **Family hates the chosen visual direction** | 3 mockups ship simultaneously. If nobody loves one, we blend. Don't commit code to a direction nobody endorses. |
| **Connectivity assumption breaks** | Phase 2 ships a "last-known-good" cache via Service Worker for attraction data. Picks + RSVPs are the only calls that need the backend. |

---

## Budget (cost reality check)

Alex's line: *"if we can't complete without spending thousands of dollars or 2-3 weeks, it's a waste."*

**Actual estimated cost:**
- Domain: ~$12/year (one time)
- GitHub Pages: free
- Supabase free tier: free forever for this usage (< 500MB DB, < 50k monthly active users — we have 26 total)
- Google Fonts CDN: free
- **Total running cost: $12/year**

Time budget fits 2-3 week ceiling if we cut auto-scheduler as proposed.

---

## Open decisions blocking work

Before Phase 1 coding starts, Alex must answer:

1. **Which visual direction** (A/B/C or combo) from `web/mockups/`?
2. **Hosting:** GitHub Pages vs Netlify vs Vercel? (I recommend GitHub Pages — simplest, and the data repo already lives as a vault Alex can turn into a git repo.)
3. **Custom domain:** what's the domain? (Alex needs to buy it.)

Everything else I can make progress on without blocking.
