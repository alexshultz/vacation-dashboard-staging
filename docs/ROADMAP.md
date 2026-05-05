# Branson '26 Dashboard — Phased Roadmap

> ⚠️ **ARCHITECTURE SECTIONS PARTIALLY SUPERSEDED** -- The Phase 2 architecture decisions (Vite, Alpine.js) were evaluated and rejected. The Phase 3 nav approach (Python script) was also superseded. Current stack is vanilla JS + static HTML + site.js for nav. See `docs/DECISIONS.md` and the "What We Tried" table in `VACATION-AGENT-ONBOARDING.md` for the binding decisions. Do not treat Phase 1-2 technical specs as current.


**Last updated:** 2026-04-28
**Family starts using dashboard:** ~2026-05-08
**Trip:** 2026-05-22 → 05-29

---

## Current Status (2026-04-28)

Phase 1 and Phase 2 core features are complete and live. Supabase backend IS ACTIVE in production as of 2026-04-28 (picks.js hydration from Supabase, write error banner, fetchAllWishlists expanded). admin.html is deployed to production with the upsert 409 fix (merge-duplicates header). HTTPS enforced on both custom domains. Tester pass removed from May 8 gate. Staging repo is in sync with production.

**What's done:**
- Design system (tokens.css, trail.css, components.css)
- Browse page (attractions.html) -- dynamic fetch(data.json), live search bar (phrase+tag: operators), wishlist hearts, detail modal
- Quick Pick swipe deck (quick-pick.html) -- separate page, same data source
- Wishlist, Suggested, Profile, Timeline, People pages
- Supabase Phase 2 schema written (picks table NOT YET ACTIVE -- currently Phase 1, localStorage only)
- GitHub Pages deploy pipeline established (production + staging repos in sync)
- help.html -- COMPLETE (fetches help.json, all 5 required sections present, entry point on Profile page)
- Hamburger menu, eyebrow fix, nav consolidation shipped

**Active sprint -- next up:**
- [x] Activate Supabase Phase 2 -- picks/suggestions wired to live database (schema applied 2026-04-28; picks hydration, write error banner, fetchAllWishlists query fix shipped; keepalive cron running every 3 days)
- [ ] Coordinator admin editor page -- Alex can edit schedule data, manage RSVPs, and push content live. Architecture: Council of Minds (2026-04-28) eliminated GitHub API write-back (PAT secret-scanning hard blocker). Current recommendation: Supabase-backed + JS-layer password (medium confidence). "Option Zero" (GitHub.com built-in web editor on schedule.json) also presented -- zero code, real auth. BLOCKED on Alex: (1) accept Option Zero? (2) ADR-002 ruling on Supabase write-back vs. no-automated-code intent; (3) keepalive cron sufficient to prevent auto-pause before May 22?
- [ ] INITIAL_VISIBLE setting in admin UI -- expose the home page event count as a live-configurable value (no code change needed to adjust it)
- [x] Custom domain -- `vacation.creeperbomb.com` (production) and `vacation-dev.creeperbomb.com` (staging) -- CNAME files in both repos, DNS records in Cloudflare (DNS only, no proxy), HTTPS auto-provisions via Let's Encrypt

**Tester pass -- DEFERRED:** Family unavailable for formal sign-off. Removed from May 8 gate. Dashboard ships May 8 on schedule without tester approval round.

---

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
3. **Shared nav via `web/js/site.js`** — one source of truth. Runtime injection wires in the same nav on every page load. (`generate_dashboard.py` approach evaluated and rejected -- see ADR-002, ADR-007.)
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
- [x] Changing the nav in ONE place updates it across all 10 pages
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

- **Build tool:** None. Vanilla JS + static HTML -- no build step. (Vite evaluated and rejected 2026-04-21.)
- **Front end:** Vanilla JS only. (Alpine.js evaluated and rejected 2026-04-21 -- insufficient need for a 7-day trip tool.)
- **Backend:** Supabase. 26 users is nowhere near free-tier limits. If it becomes painful, we rip it out and ship a JSON file to a Cloudflare Worker; the client doesn't care.
- **Nav dedupe:** `web/js/site.js` runtime injection (chosen). (Python generate step evaluated and rejected -- generator approach froze the codebase twice.)

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

- ~~**Custom domain live**~~ -- not pursued; GitHub Pages URL used directly.
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

## Phase: Help Page (target ~May 1-7, before family onboarding)

**Goal:** A single in-app page (`web/help.html`) that answers every question a family member might have without needing to ask Alex.

**Audience:** Non-technical family members on phones. Parents, teens, anyone. Assume zero familiarity with the app.

**Format:** Same nav, same design system as every other page. Accessible from the Profile page (👤 button). Five sections max, plain English, no jargon.

**Content to cover (draft topics -- Alex reviews final copy):**
1. **What is this?** One paragraph. "This is our trip planning board for Branson. Use it to mark what you want to do so we can coordinate."
2. **Setting your name** -- tap 👤, pick your name from the list. This is how the app knows whose picks are whose.
3. **Browsing and wishlisting** -- what the heart does, what Browse shows, how to filter by type.
4. **Quick Pick** -- what the swipe deck is and when to use it vs Browse.
5. **Privacy** -- who can see your picks (honest answer: everyone, Phase 1 is honor-system).

**Who writes it:** Hermes drafts, Alex reviews tone and adjusts for family voice. One lazlo pass to build the page.

**When to ship:** No later than May 7 (one day before family onboarding). Earlier is fine.

**Entry point:** Add a "?" or "Help" link to the Profile page and/or the home page index.html.

## Budget (cost reality check)

Alex's line: *"if we can't complete without spending thousands of dollars or 2-3 weeks, it's a waste."*

**Actual estimated cost:**
- ~~Domain: ~$12/year (one time)~~ -- custom domain not pursued; using GitHub Pages URL directly.
- GitHub Pages: free
- Supabase free tier: free forever for this usage (< 500MB DB, < 50k monthly active users — we have 26 total)
- Google Fonts CDN: free
- **Total running cost: $0/year** (domain not pursued; GitHub Pages + Supabase free tier + Google Fonts CDN all free)

Time budget fits 2-3 week ceiling if we cut auto-scheduler as proposed.

---

## Open decisions (resolved)

These decisions were open before Phase 1 coding started and are now resolved:

1. **Visual direction:** Trail theme (Airbnb meets National Parks, dark green / charcoal / sand) -- chosen and locked.
2. **Hosting:** GitHub Pages -- deployed and live at https://vacation.creeperbomb.com/
3. **Custom domain:** Not pursued. GitHub Pages URL is used directly.

Everything else I can make progress on without blocking.

---

## Post-Launch Documentation Tasks (after May 8)

Low-priority doc work that does not affect user-visible behavior. Do not pull into the pre-launch sprint.

### Dark Mode Tokens in DESIGN.md

**Current state:** Dark mode is handled exclusively via CSS (`prefers-color-scheme` + `data-mode` attribute on `<html>`). The `web/DESIGN.md` spec intentionally omits dark palette values (line 192, line 427). The 23 companion `DESIGN-*.md` files are also light-theme-only.

**Decision deferred:** The Google DESIGN.md spec has no formal dark mode section. A custom convention must be defined before implementation.

**Proposed approach (ready to execute post-launch):**
1. Decide on YAML convention -- e.g., a `colors-dark:` parallel block in the frontmatter. One decision, Alex approves.
2. Update the `design-md-theme-system` Hermes skill with the convention so lazlo knows the format.
3. Lazlo updates `web/DESIGN.md` (Trail, active theme) first as the canonical template.
4. Lazlo batch-updates the 23 companion `web/themes/DESIGN-*.md` files, extracting dark palette values from paired CSS files and validating accuracy.

**Files affected:** `web/DESIGN.md` + all 23 `web/themes/DESIGN-*.md` files.  
**Blocking anything?** No. CSS dark mode is fully functional. This is documentation completeness only.  
**Owner:** Lazlo (batch task). Alex approves the YAML convention in step 1 before any file is touched.
