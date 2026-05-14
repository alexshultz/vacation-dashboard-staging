# Grill-Me: Admin Save Button + Meal UI Redesign

_Written: 2026-05-14_
_Scope: web/admin.html only (single file)_

---

## What we're building

Two related changes to the admin page:

### A -- Save Changes button dirty state + series_slug folded in

Right now:
- The Save Changes button always looks the same regardless of whether anything is dirty
- Clicking it when nothing has changed silently does nothing (infuriating)
- `series_slug` is NOT included in the save -- it has its own "Save" button that must be pressed first

Fix:
- Track dirty state across all saveable fields: `title`, `date`, `startTime`, `duration`, and `series_slug`
- When any field differs from its loaded value, highlight the Save Changes button (clearly active)
- When nothing differs, dim/disable Save Changes (clearly inactive)
- `saveOverrides()` folds in `series_slug` automatically -- no separate save step
- "Save Series" standalone button can be removed or kept as a secondary convenience

### B -- Meal override UI redesign: chip-based multi-select

Right now: two dropdown selects (one for include, one for exclude) with one-at-a-time Add buttons. You can only add one person at a time.

Replace with: chip grids matching the attendee section UI -- all names shown as clickable chips, multi-select, batch move with a single button click.

Layout (two panels, side by side):

**Left panel ("Not overridden" / available pool):**
- All attendee names as chips, multi-selectable (tap to select, tap again to deselect)
- "Add to Include →" button -- moves all selected chips from left to include panel
- "Add to Exclude →" button -- moves all selected chips from left to exclude panel
- "Select All" convenience button

**Include panel ("Override: Add to count"):**
- Chips for everyone currently in meal_override_include
- "← Remove" button -- moves selected chips back to left pool

**Exclude panel ("Override: Remove from count"):**
- Chips for everyone currently in meal_override_exclude
- "← Remove" button -- moves selected chips back to left pool

Headcount line updates live as chips move. No separate Save Overrides button -- meal state is captured by Save Changes.

---

## Questions for Alex

**1. Save Changes button -- clean state behavior**
When nothing is dirty, should Save Changes be:
- (a) visually disabled (`disabled` attribute set, grey, `cursor:not-allowed`) -- prevents the click entirely
- (b) just dimmed (opacity/color reduced, still clickable but visually subdued) -- softer signal

Default answer: **(a) disabled attribute** -- prevents the frustrating silent click entirely.

Alex's Thoughts:

---

**2. Save Changes button -- dirty state highlight color**
When dirty, should the button be:
- (a) Green (`var(--status-yes)`, same as the standard "yes/go" signal in the dashboard)
- (b) Sand/accent-1 (`var(--accent-1)`) -- consistent with the dashboard's primary action color

Default answer: **(a) green** -- clear conventional signal that there's something to save.

Alex's Thoughts:

---

**3. Meal panel layout -- 2-panel or 3-panel**
~~3-panel approach~~ **RESOLVED by Alex (Discord, 2026-05-14):**

Two 2-panel units -- one for include, one for exclude. Each unit:
- Left panel: available names as chips (multi-select)
- Center: "→ Add" button (moves left-selected to right) and "← Remove" button (moves right-selected to left) stacked vertically between panels
- Right panel: overridden names as chips (multi-select)

Alex's Thoughts: "I want two panels that I can select names on, and I also want an Add and a Remove button between the panels. Whenever I click Add, it moves everything selected on the left side to the right side. When I select Remove, everything highlighted on the right side moves to the left side."

---

**4. Separate meal "Save Overrides" button -- keep or remove**
Currently there's a standalone "Save Overrides" button inside the meal section. If meal state folds into Save Changes, this button becomes redundant.

- (a) Remove it -- only one save path, less confusion
- (b) Keep it as a secondary option -- useful if Alex wants to save meal state without touching other fields

Default answer: **(a) remove** -- one save button, no ambiguity.

Alex's Thoughts:

---

**5. Series slug standalone "Save" button -- keep or remove**
Same question as above: once series_slug folds into Save Changes, the inline "Save" button next to the slug input becomes redundant.

- (a) Remove it
- (b) Keep it as a secondary inline save

Default answer: **(a) remove** -- cleaner form.

Alex's Thoughts:

---

**6. Dirty state tracking -- does event_type count?**
Event type auto-saves instantly on segmented control click (immediate PATCH, no pending state). It will never be "dirty" in the same sense as the text fields.

- (a) Leave event_type out of dirty tracking -- it saves itself immediately, no pending state
- (b) Include event_type in dirty tracking too -- require explicit Save Changes for everything

Default answer: **(a) leave event_type out** -- auto-save on click is the right UX for a segmented control. Mixing instant-save and pending-save for the same button would be confusing.

Alex's Thoughts:
