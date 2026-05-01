# Grill-Me: Supabase Admin Sprint
_Admin editor, schedule migration, Supabase Auth, admin pages_
_Ready for Alex review. Silence = full approval. Write overrides in "Alex's Thoughts:" sections._

---

## Scope recap

1. Supabase Auth (email/magic link) replaces the 3141 passcode as the write gate
2. Separate admin pages: admin-event-timeline.html and admin-index.html (zero admin code in family pages)
3. schedule_events Supabase table -- family pages read from Supabase with schedule.json as silent fallback
4. app_config Supabase table for INITIAL_VISIBLE
5. RLS policies: anon role read-only, authenticated (Alex's Supabase session) read-write

---

## Questions

**Q1. What fields does schedule.json have per event, and how do they map to schedule_events columns?**

Answer: 28 events. Fields: id, title, date, duration, priority, catalogRef, startTime, travelMinutes, interested, undecided, notInterested, noResponse. Flat table maps each field directly as a column. The four RSVP arrays (interested, undecided, notInterested, noResponse) stored as JSONB columns since they hold arrays of name strings.

Alex's Thoughts:

---

**Q2. What does the app_config table look like?**

Answer: app_config(key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ). INITIAL_VISIBLE stored as {key: 'initial_visible', value: '5'}.

Alex's Thoughts:

---

**Q3. RSVP data -- inline in schedule_events or separate table?**

Answer: Inline as JSONB. Coordinator-maintained, not user-generated. No separate event_rsvps table this sprint.

Alex's Thoughts:

---

**Q4 (PRIORITY). How does Alex log in to access admin pages?**

Answer: Passkey (WebAuthn). Alex registers once on admin.html -- Face ID prompt appears, biometric stored on device. Every subsequent admin login is Face ID (iPhone), Touch ID (Mac), or Windows Hello (Windows). No email, no password, no typing. Supabase supports passkeys natively. Passkeys sync across Apple devices via iCloud Keychain. On a new device, Alex registers it once.

Alex's Thoughts:

---

**Q5 (PRIORITY). Does the existing passcode (3141) on admin.html stay or get replaced?**

Answer: Replaced entirely. Passkey (WebAuthn) is the gate. 3141 removed from admin.html and all admin pages. Any user without an active Supabase session on an admin page gets redirected to admin.html to register or authenticate.

Alex's Thoughts:

---

**Q6. What happens when the Supabase Auth session expires mid-trip?**

Answer: Supabase sessions auto-refresh while the browser tab is open. On full expiry (browser closed for days), Alex sees the passkey prompt on next admin page visit -- Face ID, done, back in. No email required at any point.

Alex's Thoughts:

---

**Q7 (PRIORITY). What does the family see when Supabase is unreachable?**

Answer: Silent fallback to schedule.json with no visible error. Family sees the last-known static schedule. If both Supabase and schedule.json fail, they see an empty schedule with a "Tap to retry" button.

Alex's Thoughts:

---

**Q8. When does schedule.json get retired?**

Answer: Never deleted from git. Kept permanently as the emergency static fallback. It only gets stale when events change -- that's acceptable since it's a last-resort backup, not the primary source.

Alex's Thoughts:

---

**Q9 (PRIORITY). How are event edits structured in admin pages -- modal or inline?**

Answer: Pencil icon on each event card. Tapping it opens a modal pre-populated with the event's current data. Save button writes to Supabase, closes the modal, and re-renders the card inline without a page reload. Cancel leaves the event unchanged.

Alex's Thoughts:

---

**Q10 (PRIORITY). What fields are editable in the event edit modal?**

Answer: All coordinator-maintained fields: title, date, startTime, duration, travelMinutes, priority, catalogRef, and the four RSVP arrays (interested, undecided, notInterested, noResponse). See Q10a below for RSVP editing UI.

Alex's Thoughts:

---

**Q10a (PRIORITY, verifier-added). How are the four RSVP array fields edited in the modal?**

Answer: Each RSVP array (interested, undecided, notInterested, noResponse) gets a single comma-separated text input. Example: "Alex, Jordan, Ashlyn". On save, the JS splits on commas, trims whitespace, and writes the resulting array to Supabase. Simple and fast on mobile.

Alex's Thoughts:

---

**Q11. Where does INITIAL_VISIBLE control appear on admin-index.html?**

Answer: Admin control bar pinned above the event list. Displays current value with +/- buttons. Each tap saves to app_config immediately. Family members see the new count on their next page load.

Alex's Thoughts:

---

**Q12 (PRIORITY). Does changing INITIAL_VISIBLE take effect immediately for family members already on the page?**

Answer: Next load only. No Supabase Realtime in this sprint. If Alex wants instant propagation, that's a separate sprint item.

Alex's Thoughts: If this can be added in to take effect immediately while we're doing this, then let's do so. But if it needs to be a different project, then let's add it in as another project coming up.

---

**Q13. How does Alex navigate to the admin pages?**

Answer: admin.html is the hub. After login, it shows two large links: "Edit Schedule" (admin-event-timeline.html) and "Edit Home View" (admin-index.html). The hamburger/desktop nav still links to admin.html as the entry point.

Alex's Thoughts:

---

**Q14. Do admin pages include the full site.js nav?**

Answer: Yes. Admin pages look identical to family pages visually -- same header, same bottom tabs, same theme. The admin-specific chrome (edit buttons, INITIAL_VISIBLE control) is layered on top.

Alex's Thoughts:

---

**Q14a (verifier-added). Does the "Admin" nav link in site.js appear on family-facing pages?**

Answer: No. The Admin nav link is suppressed on family-facing pages. Specifically: site.js already gates the admin nav link on ADMIN_USERS localStorage check. Post-Supabase-Auth, that gate switches to checking for an active Supabase session. Family pages call supabase.auth.getSession() at load -- if no session, no admin link rendered. Admins who are not logged in also see no admin link until they authenticate. This keeps zero admin affordances on family pages while logged-out.

Alex's Thoughts:

---

**Q15. How is the one-time migration performed?**

Answer: "Import from schedule.json" button inside admin.html (visible only after auth). Fetches schedule.json from its GitHub Pages URL, maps fields, upserts all 28 rows into schedule_events. Idempotent -- safe to run multiple times.

Alex's Thoughts:

---

**Q16. What does migration validation look like?**

Answer: Success: "28 events imported" confirmation message. Mismatch: yellow warning showing actual vs. expected count. After first successful run, button label changes to "Re-import" to signal it has been run before.

Alex's Thoughts:

---

**Q17. RLS policy design?**

Answer: Two policies on both tables. schedule_events and app_config: anon role gets SELECT only. Authenticated role (any valid Supabase Auth session) gets SELECT + INSERT + UPDATE + DELETE. Since only Alex has login credentials, this means only Alex can write. Family reads work without auth.

Alex's Thoughts:

---

**Q18. What happens if a Supabase write fails in the edit modal?**

Answer: Error shown inside the modal in red. Modal stays open with Alex's edits intact so he can retry or cancel. No silent failure, no data lost.

Alex's Thoughts:

---

**Q19 (PRIORITY -- verifier-added). What page handles the Supabase Auth flow?**

Answer: admin.html. On first visit, admin.html shows a "Register passkey" button. Alex taps it, Face ID prompt appears, passkey registered and session established. On subsequent visits, admin.html detects no active session, shows "Sign in with passkey," Face ID, done. No redirect URL or email callback needed -- passkey auth is entirely in-browser. Other admin pages (admin-event-timeline.html, admin-index.html) check for a session on load and redirect to admin.html if none is found.

Alex's Thoughts: 

---

**Q20. Brief sequencing -- how many lazlo briefs and in what order?**

Answer: 4 briefs in dependency order.
- Brief 1: Supabase schema SQL (schedule_events table, app_config table, RLS policies). Alex runs this SQL in the Supabase dashboard manually -- lazlo writes the SQL, PM reviews it, Alex executes it. No code deployed yet.
- Brief 2: Family pages (event-timeline.html, index.html) updated to fetch from Supabase with schedule.json fallback. No auth dependency.
- Brief 3: admin.html -- Supabase Auth flow (login form, session check, redirect handling, Import button).
- Brief 4: admin-event-timeline.html and admin-index.html -- edit modals, pencil buttons, INITIAL_VISIBLE control. Depends on Brief 1 (schema live) and Brief 3 (auth pattern established).

Briefs 2 and 3 can run in parallel after Brief 1.

Alex's Thoughts:

---
