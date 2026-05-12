# Code Review -- admin-redesign

You are a cold code reviewer. No prior context. Review the changes to web/admin.html and tests/e2e/tests/admin-event-types.spec.js and return PASS, WARN, or FAIL.

## Summary of intended changes (10 patterns)

1. Event selector: sort-aware option labels (date-first vs title-first); white-space/overflow/text-overflow on select
2. Title input: real-time ✓/✗ validation indicator on input event
3. Date picker: custom scroll-snap drum (Month/Day/Year); hidden input#input-date in YYYY-MM-DD format
4. Time picker: custom scroll-snap drum (Hour/Minute/AMPM); hidden input#input-startTime in "H:MM AM" format
5. Duration: stepper [−][val][+] step 0.5; hidden input#input-duration
6. Event type: 3-button segmented control; hidden select#event-type-select kept in sync; dispatches change event
7. Attendee checklist: pill chip buttons with data-name; .chip-selected class; saveAttendees/loadEventForm updated
8. Toast snackbar: #toast-snackbar fixed bottom-center; showToast() replaces per-field saved indicators
9. Import status: inline flex row with opacity fade; no layout shift
10. Sign-out button: removed from admin-hub-nav + its addEventListener removed

## Key correctness checks

1. **Drum pickers**: Do the hidden inputs (#input-date, #input-startTime, #input-duration) get set correctly on scroll snap? Does populateField() still work -- does it call the snap functions to update the drum positions when loading a saved value?

2. **Segmented control**: When a seg button is clicked, does it dispatch a 'change' event on the hidden select so the existing PATCH-on-change listener fires? Does updateEventTypeSections() still read event-type-select.value correctly?

3. **Attendee chips**: Does saveAttendees() now read .chip-selected instead of checked checkboxes? Does loadEventForm() correctly highlight the right chips when loading saved data?

4. **Toast**: Does showToast() replace ALL per-field saved indicator writes in saveOverrides()? Are error paths also routed to showToast()?

5. **Import status**: Is the status element in the same flex row as the button? Does it use opacity not display:none to avoid layout shift?

6. **Scope**: Were any files modified beyond web/admin.html and tests/e2e/tests/admin-event-types.spec.js?

7. **Test changes**: Does admin-event-types.spec.js use the new selectEventType() helper that clicks the seg-btn? Does it use waitFor() before asserting visibility? Are all 4 tests still present (not deleted or skipped)?

8. **Dead sign-out**: Was the signout-btn addEventListener removed from the DOMContentLoaded handler in addition to the HTML button being removed?

Return PASS, WARN, or FAIL. Then specific findings. PASS = shippable. WARN = shippable with caveats. FAIL = must fix before shipping.
