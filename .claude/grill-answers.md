# Grill-Me Answers — Quick Pick + Profile
# Date: 2026-04-22

## Quick Pick Mode — Toggle & Placement

1. **Toggle placement:** Below the search/chip row as a distinct pill toggle (two options: "Browse" | "Quick Pick"). Separate from the filter chips. No mockup of this exact UI yet.
2. **Filter chip carryover:** YES -- carry over current filter chip selection into the swipe deck. The deck is "filtered cards in swipe mode."
3. **Persist mode choice:** YES -- persist Browse vs Quick Pick choice to localStorage key `vacdash:v1:browse-mode` so user lands in their last mode.
4. **Empty filtered deck:** Friendly empty state card in the stack ("No matches for this filter -- try switching to All"). NOT the end summary.
5. **Already-wishlisted items:** EXCLUDE items already marked `wishlist` from the swipe deck (no point swiping them again). Show them in Browse grid as normal.
6. **Items with other states (committing, not-going):** INCLUDE them in the swipe deck. Only `wishlist` is excluded.
7. **Left-swipe writes nothing:** CORRECT -- left-swipe writes nothing to picks.js. It's a "not right now" not a "no."
8. **Session memory via vacdash:swipe:progress:** YES -- the progress key tracks which slugs have been swiped this session so they don't re-appear. On session end it clears.
9. **Mode toggle resets progress:** NO -- switching Browse<>Quick Pick does NOT reset progress. Only changing the filter chip resets progress.
10. **vacdash:swipe:progress shape:** Array of swiped slugs: `{ filter: "all", seen: ["slug1", "slug2", ...] }`. One object, one filter key, one seen array. Reset when filter changes (seen=[] and update filter key). Keep compatible with mockup concept but can change shape since mockup was a prototype.
11. **Filter-scoped progress:** One global progress object with the current filter embedded (as in #10). If filter changes, reset seen. Not separate per-filter.
12. **Card ordering:** Same order as the grid (sorted alphabetically by name, same as current generator). No randomization -- consistency is more important than discovery for Phase 1.
13. **End state CTAs:** "Review wishlist" + "Restart deck" (restart resets vacdash:swipe:progress). Two buttons.
14. **Right-swipe toast:** YES -- show a brief toast "Wishlisted: [Name]" in addition to the WISHLIST overlay.
15. **Picks.js offline failure:** YES -- treat right-swipe as successful locally regardless. picks.js already handles this gracefully with localStorage fallback.
16. **User must be set before Quick Pick:** NO -- do not gate Quick Pick on having a name set. Picks work anonymous for now (picks.js already handles this).
17. **Image field guarantee:** Not guaranteed -- image field can be empty string or missing. Fall back to letter SVG for both cases (missing or empty).
18. **Letter fallback for digits/symbols:** Use first alphabetic character found in the name. "1 Hits of the 60s" -> "H". If no alpha found, use "?" (there is an SVG for that or use a default gradient).
19. **Card width:** Full column width up to the max-width container (640px centered). No sub-max-width cap.
20. **Stack peek effect:** YES -- keep the 3-card stack peek from the mockup (cards behind offset by translateY and scale). It's a key visual.

## Quick Pick Mode -- Components & Interaction

21. **Bottom sheet existing component:** Check components.css for a `.sheet` or `.bottom-sheet` class. If one exists, reuse it. If not, create one with prefix `.deck-sheet` added to components.css.
22. **New component class prefix:** `.deck-*` for swipe deck components, `.profile-*` for profile page components.
23. **Action buttons style:** Adapt the mockup's button styles to use token variables (`--moss`, `--clay`, `--status-wishlist` etc.) instead of hardcoded hex values. Keep the circular skip/undo/wishlist button shape from the mockup -- it works well.
24. **Keyboard support:** Keep Arrow keys + Z from mockup. Add Escape to close bottom sheet. Enter to open bottom sheet (or tap). Same as mockup plus Escape.
25. **Remove Supabase feedback form entirely:** YES -- do not replace with anything. The feedback form was a tester survey widget only.
26. **Count display:** "X remaining" where X is cards-remaining-in-deck. E.g., "24 remaining of 139." Updates as user swipes.

## Profile Page -- Identity

27. **Default name selection:** Empty placeholder ("Who are you?"). NOT pre-selecting anyone.
28. **Name picker UI:** Native `<select>` for best mobile UX and accessibility. Simple, no custom dropdown needed.
29. **Nicknames as canonical:** The 26-name list is canonical as-is. No formal name mapping needed in Phase 1.
30. **"Not on the list" stored as:** Empty string in `vacdash:v1:user`. Same as "not set."
31. **Greeting propagation:** Profile page only. Do NOT propagate into the site-header on every page (too much cross-page state for Phase 1).

## Profile Page -- Preferences

32. **Theme switch timing:** Apply IMMEDIATELY on selection (same as existing header toggle button). Consistent behavior.
33. **Theme toggle button on profile.html:** KEEP it in the header alongside the 👤 button. The Section 2 control is the "settings" version -- the header toggle remains for quick access everywhere. Slightly redundant but acceptable.
34. **Wishlist Privacy default:** `'public'` -- default assumption is family sharing.
35. **Trip date bounds:** No min/max enforcement in Phase 1. Any date is fine.
36. **Arrival/departure validation:** NO validation in Phase 1. Accept anything.
37. **Interests category list:** Use the 8 categories as listed in the spec. Do NOT derive from JSON (the JSON categories don't match cleanly). The 8 spec categories are: Shows, Adventure, Museums & Attractions, Food & Dining, Outdoors, Water, Shopping, Family-Friendly.
38. **Interests storage format:** Lowercase hyphen-slugs: `["shows", "adventure", "museums-and-attractions", "food-and-dining", "outdoors", "water", "shopping", "family-friendly"]`. Suggested page will match on these.
39. **Toast component:** If one exists in components.css, reuse it. If not, create a simple `.toast` style under the `.deck-*` or `.profile-*` namespace in components.css. Dwell: 2 seconds. Position: bottom-center (same as mockup). 
40. **Toast debounce:** YES -- debounce to one toast per interaction group. If user toggles 3 interest chips quickly, show one "Preferences saved" toast, not three.

## People Page -- Tap to Profile

41. **Attendee names location in people-timeline.html:** The roster is in one `<div id="attendee-list">` grid. Link ALL names there (it's the only location). No per-day sections to worry about.
42. **URL encoding:** YES -- use encodeURIComponent on the name. Case-sensitive match (the list is fixed so `?name=Ashlyn` must match "Ashlyn" exactly).
43. **Unknown name in URL:** Silently ignore -- fall through to empty placeholder. No error.
44. **Param persist immediately:** YES -- if `?name=Bee` loads and Bee is in the list, immediately persist it to localStorage AND pre-fill the picker. It's an implicit "this is me" gesture.

## Header 👤 Button

45. **Glyph:** Use the literal emoji 👤. Simple and universally understood. Mobile rendering inconsistency is acceptable for Phase 1 family use.
46. **Badge for no-name:** YES -- show a small amber dot badge on the 👤 when `vacdash:v1:user` is empty/unset. Nudge for first-time setup.
47. **Position relative to theme toggle:** 👤 goes to the LEFT of the theme toggle (so right side reads: 👤 ☀️). 
48. **Profile page active tab:** No bottom tab gets the "active" highlight when on profile.html. Leave tabs as-is (no active state).

## Implementation Approach

49. **Edit attractions.html directly:** Edit it directly (do NOT run generate_dashboard.py). If adding Quick Pick via generator changes is cleaner for future maintainability, you may update the generator AND regenerate -- but ONLY if you update the generator first. Declare which approach you took.
50. **If regenerating:** Only regenerate attractions.html. Do not touch other generated pages.
51. **Browser support:** Safari iOS 16+ (to support older iPhones in the family). Avoid `:has()` selector, View Transitions. Dialog element is OK if feature-detected. No exotic polyfills.
52. **Tests / linter / build:** None. Manual browser check only. "Open in browser and click around."
53. **Accessibility level:** Keyboard parity + screen-reader announcements on swipe decisions (via aria-live region, same as mockup's `#sr-announce`). Full ARIA semantics on profile form fields (labels, required, etc.).
54. **prefers-reduced-motion:** YES -- respect it. Disable swipe animation, use instant state change instead. The mockup already has this check -- keep it.
55. **Phase 2 stubs:** Minimal -- only add `// Phase 2: [description]` comments where the spec explicitly mentions Phase 2 features. No scaffolding functions. Keep it clean and simple.

---

## PROCEED
All questions answered. Please proceed with implementation.
