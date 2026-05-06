# Grill-Me: Schedule Admin -- Create, Delete, and Fallback Fix

**Task:** Add "Create New Event" to `admin-event-timeline.html`; add bulk delete capability; fix the `event-timeline.html` fallback so an empty Supabase table is treated as authoritative (no ghost schedule.json data); clear the 28 placeholder events from `schedule_events`.

**Date:** 2026-05-07

---

## Questions

---

### Q1 (Musk Existence Check): What is the version of this task that doesn't need to exist?

Alex has `admin-event-timeline.html` with a working edit modal (upsert). The Delete button exists in `admin-overlay.js` on the family page -- one at a time. Could Alex just delete all 28 placeholder events one by one on `event-timeline.html`, then use the existing edit modal to create new events by... wait, no -- the edit modal only opens for existing cards via `openEditModal(btn)`. There is no "Create New" path.

Conclusion: we cannot avoid building Create New. The fallback fix is also unavoidable -- without it, deleting all Supabase events makes the family page fall back to the placeholder data again, defeating the whole purpose.

Alex's Thoughts:

---

### **Q2: Scope -- what three things need to ship together?**

The work is:

1. **Create New Event** button + form on `admin-event-timeline.html` -- generates a new ID (slug or UUID), inserts into `schedule_events`
2. **Fallback fix** on `event-timeline.html` -- treat HTTP 200 from Supabase as authoritative regardless of whether the array is empty, fall back to `schedule.json` only on network failure or non-200
3. **Empty-state message** on `event-timeline.html` -- when Supabase returns an empty array, show "No events yet" rather than a blank page

Optionally (discuss): bulk-clear the 28 placeholder events from Supabase directly (can be done via Supabase dashboard, no code needed -- Alex can do this manually once the fallback fix is deployed).

Alex's Thoughts: Show me the way to add an event to the timeline before we bulk delete anything.

---

### **Q3: What ID should a newly created event get?**

Current events have human-readable IDs like `"atv"`, `"branson-belle-showboat"`. Options:

- A: Auto-generate a UUID (no collision risk, but ugly in logs)
- B: Slugify the title at save time (e.g., `"Titanic Museum"` → `"titanic-museum"`), fail if duplicate
- C: Let Alex type the ID manually in the create form

My answer: **B (slugify title) with duplicate-check**. Consistent with existing convention, no extra field for Alex to fill. If a slug collision occurs (e.g., editing the same event twice), the upsert will update the existing record -- which is fine since we're using `ON CONFLICT(id) DO UPDATE`.

Alex's Thoughts: 

---

### **Q4: Does the Create form need all 11 fields, or a minimal required subset?**

Current fields: title, date, startTime, duration, travelMinutes, priority, catalogRef, interested, undecided, notInterested, noResponse.

Minimum required for a new event: **title** (required), **date** (required). Everything else can default to null / empty arrays and be filled in via the edit flow later.

My answer: Create form shows all fields (same form as edit, just blank) so Alex can fill in as much or as little as he wants at creation time. Simpler than a two-form approach.

Alex's Thoughts:

---

### **Q5: `parseInt` bug -- the admin save handler uses `parseInt` for `duration`, which truncates 1.5h to 1.**

Confirmed bug in the CLAUDE.md pitfalls. The `duration` column is NUMERIC (decimal hours). The fix is `parseFloat(document.getElementById('ef-duration').value)`. This must be in the scope of this task since we're already touching the save handler.

Alex's Thoughts:

---

### **Q6: How should the fallback behave after the fix?**

Current behavior: Supabase returns 200 with empty array → fall through to `schedule.json` (shows 28 placeholder events).

Proposed after fix:
- Supabase 200 + non-empty array → show Supabase events (unchanged)
- Supabase 200 + empty array → show empty-state message ("No events scheduled yet") -- do NOT fall back to schedule.json
- Supabase error / non-200 / network failure → try schedule.json as before

The verifier raised a caveat: if Supabase is misconfigured (wrong table name, bad RLS), an empty 200 would show blank instead of falling back. My answer: this is acceptable risk post-delete. Once we intentionally clear the 28 events, we want empty-as-authoritative. The safe guard is that we deploy and verify the empty state is correct before clearing Supabase.

Alex's Thoughts:

---

### **Q7: Where does the "Create New" button live in `admin-event-timeline.html`?**

Options:
- A: Top of the page, above the event list, alongside the existing "Expand All" toggle
- B: Floating action button (FAB), bottom right
- C: At the bottom of the event list

My answer: **A -- top of page, next to the Expand All toggle.** Consistent with the existing layout, no new design decisions. Must use existing design tokens only (design system is locked).

Alex's Thoughts: What should probably happen is to have a way for me to see the items that other people have somehow said that they want to do. They might wishlist something but once they “commit” to something then I want to see that list so that I can start working on scheduling. That’s a great place to put the controls for this. Make it extendable in case I want to add things that are not on that list, so I go to the activities section and add it from the card there.

---

### **Q8: After creating a new event, what does the UI do?**

Options:
- A: Page reloads (`location.reload()`) to show the new event in the list
- B: New event card is injected into the DOM without reload
- C: User is shown a success message and the modal closes

My answer: **A -- `location.reload()`**. Consistent with the existing delete handler pattern (`location.reload()` after delete). Simpler, less code, and functionally correct. No DOM injection to maintain.

Alex's Thoughts:

---

### **Q9: Playwright test scope -- what needs a test?**

Required (behavior changes in scope):
- New event appears on `admin-event-timeline.html` after create (check card count increases)
- Fallback behavior: mock a Supabase 200 + empty array and assert "No events yet" message appears on `event-timeline.html` (not the schedule.json data)

Existing tests to NOT break:
- `admin-timeline-delete.spec.js` -- delete flow
- `admin-auth.spec.js` -- auth guard

Alex's Thoughts: Anything that I might be able to edit (data fields), does it show up on the home page and the timeline as it should? If I edit it can I edit it again (we had the problem in the past where I could edit something once but not a second time). 

---

### **Q10: Can we decompose this into independently-verifiable chunks?**

Yes:

1. **Chunk A:** Fallback fix + empty-state on `event-timeline.html` only (no admin changes)
   - Done when: Supabase 200+empty returns "No events yet"; Supabase error still falls back to schedule.json
2. **Chunk B:** `parseInt` → `parseFloat` fix in `admin-event-timeline.html` save handler
   - Done when: Creating or editing an event with duration 1.5 saves 1.5 to Supabase (not 1)
3. **Chunk C:** Create New Event button + form on `admin-event-timeline.html`
   - Done when: Alex can create a new event from the admin page and it appears on the family timeline

Lazlo can do all three in one pass -- but should write a failing test per chunk before implementing each.

Alex's Thoughts:

---

### **Q11: File scope -- which files does Lazlo touch?**

Explicitly in scope:
- `web/event-timeline.html` -- fallback fix + empty-state
- `web/admin-event-timeline.html` -- Create New button/form + parseInt fix
- `tests/e2e/` -- new spec file for create flow + fallback test

Explicitly NOT in scope:
- `web/js/admin-overlay.js` -- has its own delete; do not modify
- `web/js/site.js` -- do not modify
- `web/js/picks.js` -- do not modify
- `web/css/` -- no CSS changes (design system locked)
- Any other HTML file

Alex's Thoughts:

---

### **Q12: Schedule.json -- what happens to it after this work?**

`schedule.json` stays as the fallback for network failures. We do NOT delete or modify it. Once Supabase has real events, the fallback will virtually never trigger. `schedule.json` should eventually be updated with real data, but that is NOT part of this task.

Alex's Thoughts:

---

### **Q13: Clearing the 28 placeholder events -- who does it and when?**

My recommendation: Alex does this manually in the Supabase dashboard (Table Editor → select all → delete) AFTER the fallback fix is deployed to staging and verified working. No code needed for this step. Lazlo does not touch this.

Alex's Thoughts: make sure I can add/delete things and then we can look at clearing the placeholders.

---

## Summary of open decisions (Alex reviews inline above)

Alex fills in "Alex's Thoughts:" under any question he disagrees with. Blank = approved.

Grill-me complete. Awaiting review.
