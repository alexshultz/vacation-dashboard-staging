# Codemaster Task: Quick Pick Mode + Profile Page
# Branson '26 Dashboard — Phase 1 Addition
# Date: 2026-04-22

## Context

You are working inside the Branson 2026 family vacation planning dashboard.

**Vault location:** `/Users/alex/vaults/Vacation/Branson 2026/`
**Web files:** `web/` subdirectory
**Canonical data:** `data/attractions.json` (139 attractions, fields: slug, name, category, duration_hours, price_adult, family_pass, rating, description, image, official_url, notes, tags, tag_meta)
**Design system files:**
- `web/css/tokens.css` — semantic tokens only
- `web/css/themes/trail.css` — private Ozark palette (--moss, --lake, --sand, --clay, --dusk)
- `web/css/components.css` — all shared components
- `web/svg-fallbacks/[a-z].svg` — 26 letter fallback SVGs for missing thumbs
- `web/js/picks.js` — wishlist state client (localStorage + Supabase)

**Existing pages for reference:**
- `web/attractions.html` — the main browse page (3785 lines) — study its nav, header, bottom tabs, component usage
- `web/wishlist.html` — uses picks.js, dense card style
- `web/suggested.html` — swipe-to-decide card layout
- `web/mockups/swipe-browse.html` — EXISTING working swipe mockup (1257 lines) — this is the source to adapt

**localStorage keys in use:**
- `vacdash:v1:mode` — theme: 'system' | 'light' | 'dark'
- `vacdash:v1:user` — current user name (string)
- `vacdash:v1:picks` — {slug: state} wishlist state
- `vacdash:swipe:progress` — swipe session state

**Supabase config (already in picks.js):**
- URL: `https://quebfbvfuwbncpexlylu.supabase.co`
- Anon key: `sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt`

**Family attendee list (26 people):**
Adrian, Alex, Ashlyn, Bee, Brian, Bug, David, Dez, Evie, Georgie, Jackson, Jacob, Jordan, Josh, Kevin, Lucy, McKinley, Mel, Mycah, Natalie, Rachel, Ray, Simran, Skylar, Tayden, Zach

---

## GRILL ME PROTOCOL (MANDATORY FIRST STEP)

Before writing ANY code, ask me at least 40 sharp, specific questions that expose assumptions, missing requirements, edge cases, success criteria, risks, and better approaches. Cover all tasks below. Do not proceed to code until I have answered them all and explicitly said "proceed."

---

## Tasks

### Task 1: Quick Pick Mode on attractions.html

The existing mockup at `web/mockups/swipe-browse.html` is a fully functional swipe/card prototype with:
- Pointer-events drag physics (swipe left = skip, swipe right = wishlist)
- Decision overlays (WISHLIST / SKIP labels)
- Action buttons (Skip, Undo, Wishlist)
- Keyboard support (arrow keys, Z for undo)
- Bottom sheet for full details (tap card)
- Progress bar + session state (localStorage key `vacdash:swipe:progress`)
- End state with summary
- SVG gradient fallbacks for missing thumbs
- Dark mode via `prefers-color-scheme`
- Supabase feedback form (remove this -- it was for testing only)

**What needs to change on `attractions.html`:**

1. Add a **"Browse / Quick Pick" mode toggle** near the top of the filter/chip area. The toggle switches between the existing card-grid view (Browse) and the new swipe stack (Quick Pick). This is a UI-only toggle -- no page reload.

2. In Quick Pick mode, the card-grid disappears and the swipe stack appears. Cards should use **real data from the in-page `data` array** (the same 139 attractions the generator already embeds). Use the existing `image` field for thumbs (path: `../assets/thumbs/{slug}-thumb.{jpg,png,webp}`). Fall back to the SVG fallback letter tiles if the image fails to load. The letter SVGs are at `web/svg-fallbacks/{first_letter}.svg`.

3. The swipe mechanic integrates with **picks.js** -- a right-swipe calls `picks.set(slug, 'wishlist')`, a left-swipe does NOT change the pick state (it just skips for now in the card session). The existing picks system handles persistence.

4. At end-state, "Review wishlist" button navigates to `wishlist.html`.

5. The swipe session state key stays `vacdash:swipe:progress` but it should reset when the user changes the active filter chip (they are starting a new filtered deck).

6. The mode toggle and swipe stack must use the design system (tokens.css / trail.css / components.css), NOT the inline CSS from the mockup. Adapt the mockup's CSS into the existing token system.

7. Card size in swipe mode: adapt to the viewport. On mobile (< 640px), the stage should be ~480px tall. On desktop, ~560px.

8. When Quick Pick mode is active, the filter chips should still be visible and functional (they filter which cards appear in the swipe deck). Show a count: "Swiping X of 139 attractions."

9. The mode toggle button/pill should be visually consistent with the existing `.chip` components in attractions.html.

10. **Do NOT regenerate attractions.html from generate_dashboard.py.** Edit it directly since it's a generated file that we are now promoting to hand-edited status for this feature. (Or if editing the generator is cleaner, do that instead and regenerate -- your call, but declare which approach you took.)

---

### Task 2: Profile Page (`web/profile.html`)

Create a new standalone page `web/profile.html`.

**Navigation integration:**
- Add a 👤 icon/button to the `site-header` in **all 7 HTML pages** (attractions.html, wishlist.html, suggested.html, index.html, event-timeline.html, people-timeline.html, profile.html itself). It goes in the top-right of the header, alongside the existing theme toggle button.
- The 👤 button links to `profile.html`.
- Do NOT add a bottom-tab for Profile (tabs are already full at 6).

**Profile page sections (Phase 1 scope only -- do NOT over-build):**

**Section 1 -- Identity**
- Name picker: dropdown of the 26 family attendees + "I'm not on the list" fallback
- Reads/writes `localStorage` key `vacdash:v1:user`
- When a name is selected, show a friendly greeting: "Hi, [Name]!"
- Note: This is the same name that picks.js already uses (`vacdash:v1:user`). Changing it here changes it everywhere.

**Section 2 -- Display Preferences**
- Theme: three-way toggle (System / Light / Dark) -- reads/writes `vacdash:v1:mode` (same key the theme toggle button in every page already uses)
- Display this as radio buttons or a segmented control (not a raw dropdown)

**Section 3 -- Wishlist Privacy** (Phase 1: UI only, no backend)
- Radio: "Share my wishlist with the family" / "Keep it private (only I can see)"
- Store in `localStorage` key `vacdash:v1:wishlist-privacy` ('public' | 'private')
- Note clearly in the UI: "Privacy settings are coming in Phase 2 -- right now everyone can see everyone's picks."

**Section 4 -- My Trip Dates** (Phase 1: UI only)
- Arrival date picker
- Departure date picker
- Store in `localStorage` key `vacdash:v1:arrival` and `vacdash:v1:departure` (ISO date strings)
- These will eventually power the People/Timeline page automatically

**Section 5 -- Interests** (Phase 1: UI only, powers Suggested page hints)
- Category chip multi-select: Shows, Adventures, Museums & Attractions, Food & Dining, Outdoors, Water, Shopping, Family-Friendly
- Stored in `localStorage` key `vacdash:v1:interests` (JSON array of strings)
- Helper text: "Used to personalize your Suggested tab"

**Design rules for profile.html:**
- Must use design system (tokens.css, trail.css, components.css) -- no inline CSS block
- Standard site-header with Branson '26 logo and nav links (same as all other pages)
- Standard bottom-tabs nav (same 6 tabs as all other pages)
- max-width 640px, centered, readable on mobile
- Sections separated visually (surface cards or dividers)
- All form controls must have 44px minimum touch targets
- Save state on every change (no explicit "Save" button needed for localStorage -- just write on change)
- Show a subtle "Saved" toast confirmation on any change

---

### Task 3: people-timeline.html -- Tap Name to Profile

On `people-timeline.html`, the attendee list currently shows names as plain text divs.
Make each name a tappable link that navigates to `profile.html?name=Ashlyn` (or whichever name).

On `profile.html`, read the `?name=` query param on load. If present and valid (in the attendee list), pre-fill the name picker with that value AND scroll to Section 1. This lets family members quickly find their own profile by tapping their name on the People page.

---

## Files You Will Modify

- `web/attractions.html` -- add Quick Pick mode toggle + swipe stack
- `web/profile.html` -- CREATE new file
- `web/people-timeline.html` -- make attendee names tappable
- `web/index.html` -- add 👤 header button
- `web/wishlist.html` -- add 👤 header button
- `web/suggested.html` -- add 👤 header button
- `web/event-timeline.html` -- add 👤 header button

## Files You Will NOT Modify

- `web/js/picks.js` -- read only, do not change
- `web/css/tokens.css` -- read only
- `web/css/themes/trail.css` -- read only
- `web/css/components.css` -- read only (you may add new component classes here ONLY if absolutely necessary, and declare what you added)
- `data/attractions.json` -- read only
- `scripts/generate_dashboard.py` -- unless you decide to add Quick Pick mode via regeneration (declare upfront)

---

## Quality Gates (run before stopping)

1. Verify `profile.html` loads in the browser with no console errors
2. Verify the 👤 button appears in the header of each modified page
3. Verify Quick Pick toggle appears on attractions.html and the swipe stack initializes
4. Verify `?name=Ashlyn` on profile.html pre-fills the name picker
5. Verify all localStorage keys read/write correctly (can manually test in browser console)
6. Grep check: `grep -c "profile.html" web/attractions.html web/wishlist.html web/suggested.html web/index.html web/event-timeline.html web/people-timeline.html` -- should return > 0 for all 6

---

## Completion Report (required)

When ALL code changes are done:
1. List every file modified with a one-line description of the change.
2. List every file created with its purpose.
3. Note any assumptions or judgment calls made.
4. Note anything that could NOT be done as specified (with reason).
5. STOP. Do not commit, do not push, do not copy files, do not update PROJECT_LOG.
Hermes will handle all post-code orchestration.
