# Grill-Me: schedule.json -- Single Source of Truth for Trip Events

**Task:** `schedule-json-task.md`
**Date:** 2026-04-26
**Answered by:** Vacation PM (Hermes)

---

## Q1: "Dogwood" in index.html vs "Dogwood Canyon (all)" in event-timeline.html -- same event or different?

**Answer:** Different events. index.html has three Dogwood entries: "Dogwood" (the general canyon visit), "Dogwood Canyon Horse" (horseback riding sub-activity), and "Dogwood Canyon Tram" (tram sub-activity). event-timeline.html collapsed all three into "Dogwood Canyon (all)" as a single 6-hour block. These do NOT match by title. "Dogwood" in index.html has no matching duration in event-timeline.html and must be flagged as unmatched. Assign it a default duration of 6.0 (matching the canyon's full-day "Dogwood Canyon (all)" entry from event-timeline, with a note in the reconciliation that the source was cross-referenced). "Dogwood Canyon Horse" → 1.5 default. "Dogwood Canyon Tram" → 1.5 default.

**Alex's Thoughts:**

---

## Q2: Should the fetch() call include a .catch() error handler?

**Answer:** Yes. Add a minimal `.catch(err => console.error('Failed to load schedule.json:', err))`. This is not a UI behavior change -- it adds no visible output to the DOM. Without it, a network failure produces an unhandled rejection and a blank page with no console signal. The `.catch` is a zero-footprint safety net. Do NOT add any visible error UI (no error banners, no fallback arrays).

**Alex's Thoughts:**

---

## Q3: How should id slugs handle special characters? (Ripley's apostrophe, & in Sight & Sound, etc.)

**Answer:** Strip apostrophes entirely, replace `&` with `and`, replace spaces with hyphens, lowercase everything. Examples: "Ripley's" → `ripleys`, "Sight & Sound" → `sight-and-sound`, "Five & Dime" → `five-and-dime`, "Simon & Garfunkel" → `simon-and-garfunkel`, "Silver Dollar City" → `silver-dollar-city`. No trailing hyphens. No double hyphens.

**Alex's Thoughts:**

---

## Q4: Should eventsData be declared at module scope with `let` or scoped inside the fetch callback?

**Answer:** Declare `let eventsData = [];` at module scope (replacing the current `const eventsData = [...]`), then populate it inside the fetch `.then()` callback before calling `render()`. This keeps all existing function signatures unchanged -- `render()`, `toggleAll()`, and `setupMobileCollapse()` all reference `eventsData` by name and must continue to work without modification. Do not refactor any function signatures.

**Alex's Thoughts:**

---

## Q5: Should schedule.json be added to the rsync sed path-fix list in CLAUDE.md Step 3?

**Answer:** No. `schedule.json` is a data file, not an HTML file with asset paths. The `sed` path-fix in Step 3 rewrites `../assets/thumbs/` paths inside HTML files. JSON does not have these paths. Do not add schedule.json to the sed list.

**Alex's Thoughts:**

---

## Q6: event-timeline.html has "Dogwood Canyon (all)" (duration 6) which doesn't exist as a title in index.html. What happens to it?

**Answer:** It is dropped. index.html is the canonical 28-event base. event-timeline.html's "Dogwood Canyon (all)" was a collapsed view of three separate index.html events. It does not appear in schedule.json. Flag it in the reconciliation report as "unmatched from event-timeline.html (dropped -- not in canonical base)."

**Alex's Thoughts:**

---

## Q7: Should the window.addEventListener('resize', setupMobileCollapse) call stay inside or outside the fetch callback?

**Answer:** Keep it in the same position as it is now. In index.html it is inside `window.onload` but outside the fetch callback. This is correct -- the resize listener doesn't need data to be loaded, it just needs the DOM. Attach it immediately after initiating the fetch, not inside the `.then()`.

**Alex's Thoughts:**

---

## Q8: Should `fetch('schedule.json')` use a relative or absolute path?

**Answer:** Use `fetch('schedule.json')` -- a bare relative path. This resolves relative to the HTML file's location, which is consistent with how `fetch('data.json')` and `fetch('help.json')` are already used in this project (see CLAUDE.md safety checks). Do not use `./schedule.json` or an absolute path.

**Alex's Thoughts:**

---

## Q9: JSON field order in schedule.json -- strict or flexible?

**Answer:** Follow the schema order: `id`, `title`, `date`, `duration`, `priority`, `catalogRef`, `startTime`, `travelMinutes`, `interested`, `undecided`, `notInterested`, `noResponse`. This matches the updated task specification. Arrays for people fields should be in alphabetical order (preserving the sort order already in the source HTML files).

**Alex's Thoughts:**

---

## Q10: What are catalogRef, startTime, and travelMinutes for?

**Answer:** Three new nullable fields added to the schema for forward compatibility. `catalogRef` is the slug from `data/attractions.json` if this event has a catalog match (e.g., "Silver Dollar City" → `silver-dollar-city`), null otherwise -- lazlo reads the attractions catalog and reports all matches in the reconciliation report. `startTime` is an "HH:MM" 24h string for scheduled start time, null until the coordinator tool (Priority 9) populates it. `travelMinutes` is drive time in minutes from Watermill Cove, null until Priority 9. All three are null for every event in this task.

**Alex's Thoughts:**
