# Admin Editor (Override Architecture) -- Hermes Grill-Me

_Hermes-generated Q&A for Alex's review before lazlo is invoked._
_Blank "Alex's Thoughts:" = full approval. Any text = discuss before proceeding._

---

## Schema

Q1: The `schedule_overrides` table schema is proposed as: `id` (bigserial PK), `event_id` (text), `field` (text), `new_value` (text), `updated_by` (text), `updated_at` (timestamptz). Is `new_value` always a string sufficient, or do we need typed values?
Answer: String is sufficient. The merge logic on the client casts at render time -- e.g., `duration` is parsed as a float, `date` stays a string. Storing everything as text keeps the schema simple and avoids type mismatch errors. One row per (event_id, field) pair -- UNIQUE constraint enforces this so a second override replaces the first cleanly.

Alex's Thoughts:

---

Q2: Should there be a UNIQUE constraint on (event_id, field), so that saving a new value for the same field on the same event does an upsert (replace) rather than appending a second row?
Answer: Yes, UNIQUE (event_id, field) with `Prefer: resolution=merge-duplicates` on the POST. This means there is always at most one active override per field per event. Clean and simple.

Alex's Thoughts:

---

## Access Control

**Q3: The admin page uses a client-side passcode (3141) to show/hide the editor UI. The Supabase write path needs a server-side check so that even someone who bypasses the JS passcode can't write to `schedule_overrides`. The proposed mechanism is a Supabase RLS policy that checks a custom request header (e.g., `X-Admin-Token`) against a known value stored as a Postgres setting. Is this acceptable, or does the added complexity of a custom RLS header check push us toward "no server-side write protection, honor-system only"?**
Answer: The custom header RLS check is ~5 lines of SQL and no new infrastructure. It's worth it. The alternative (open RLS on schedule_overrides) means any family member who reads DevTools can write overrides -- acceptable for picks (low stakes) but not for authoritative schedule data (high stakes, affects everyone). Recommend the header check. The header value lives in the admin page JS (still visible to DevTools), but it raises the bar above pure accidental access.

Alex's Thoughts:

---

## Merge Logic

**Q4: When index.html and event-timeline.html merge overrides at runtime, the Supabase fetch has a timeout. What is the right timeout before falling back to schedule.json-only rendering? Too short = overrides sometimes miss. Too long = family waits on Supabase every page load.**
Answer: 800ms. This is long enough to succeed on a good mobile connection, short enough not to noticeably delay page load. Implementation: `Promise.race([supabaseFetch, new Promise(r => setTimeout(r, 800))])`. If the race times out, render from schedule.json only -- no error shown to the family.

Alex's Thoughts:

---

Q5: Should the merge happen before or after the page renders the initial view? Two options: (a) wait for both fetches before rendering anything (slight delay, always shows merged state), (b) render schedule.json immediately then patch cards when overrides arrive (fast initial render, possible visual flicker if overrides change visible fields).
Answer: Option (a) -- wait for both. The 800ms timeout means worst case is an 800ms delay before first render, which is acceptable. Option (b) risks family seeing "ATV -- May 26" flash to "ATV -- May 25" after a moment, which is confusing. Consistent first render is worth the small delay.

Alex's Thoughts:

---

Q6: If a field in `schedule_overrides` doesn't exist in the original event object in schedule.json (e.g., a typo like "titl" instead of "title"), what should happen?
Answer: Silently ignore it. The merge loop checks `if (event.hasOwnProperty(override.field))` before applying. This prevents phantom fields from appearing on rendered cards. Log a console.warn for debugging but show nothing to the family.

Alex's Thoughts:

---

## Admin Page UI

**Q7: The admin page event selector is a dropdown populated from schedule.json. Events are 28 in total. Should the dropdown show events in date order (chronological), or alphabetical by title?**
Answer: Date order. Alex is thinking in terms of "what's happening on May 24?" not "where's Silver Dollar City in the alphabet?"

Alex's Thoughts: I wouldn’t mind a way to choose how to organize. maybe some buttons where I can ask it to give me order by date/time, alphabetical, duration, number of people wanting to go

---

**Q8: When Alex selects an event, the form shows 4 editable fields: date, startTime, duration, title. Should the form show the current override value (if one exists) or always the schedule.json original value as the default?**
Answer: Show the current effective value -- i.e., the override value if one exists, otherwise the schedule.json value. Alongside each field, show the original schedule.json value in muted text so Alex can see what changed. Example: date field shows "2026-05-25" (override) with "(originally 2026-05-26)" in gray below it.

Alex's Thoughts: 

---

Q9: The "Reset to original" action deletes the override row for that specific field. Should it reset one field at a time, or should there be a "Reset all overrides for this event" button that clears all fields at once?
Answer: Both. Per-field reset next to each input. "Reset all for this event" button at the bottom of the event form. Both just delete the relevant rows from `schedule_overrides`.

Alex's Thoughts:

---

**Q10: After Alex saves an override, how does the admin page confirm success? Options: (a) inline green text under the field ("Saved"), (b) a toast notification, (c) the field value visibly updates with the new override indicator.**
Answer: Option (c) plus a brief green "Saved" under the field that fades after 2 seconds. The field already shows the current effective value, so after save it should update to reflect the new override. No toast (family pages don't use them anymore per recent cleanup).

Alex's Thoughts:

---

## Fallback and Offline

Q11: If Supabase is completely unreachable when Alex opens the admin page (e.g., mid-flight wifi), should the admin page show a visible error and block editing, or show the form with schedule.json values and let Alex attempt saves that will fail?
Answer: Show the form from schedule.json values, but display a yellow warning banner at the top: "Supabase unreachable -- saves may fail. Check connection." Do not block editing. Let Alex attempt saves; if they fail, the existing red error banner from picks.js pattern applies (same style: background #F8DDD5, etc.).

Alex's Thoughts:

---

## Navigation and Discovery

Q12: admin.html should not appear in the site nav (it's coordinator-only). Should it appear anywhere else, or is it purely accessed by direct URL?
Answer: Direct URL only. No nav link, no footer link. Alex bookmarks it. The URL can be `admin.html` -- obscurity through non-linking is sufficient given the passcode gate.

Alex's Thoughts: since the system knows i am an admin I would like to to show the admin menu items for me when I look at the menu system.

---

Q13: The site.js shared nav is injected on every page. Should admin.html use site.js (and thus get the full nav bar), or omit it and have a minimal shell (just a header with the site logo, no nav tabs)?
Answer: Minimal shell -- no site.js on admin.html. The full nav would confuse the purpose of the page and add unnecessary JS overhead. Admin page needs: a simple header, the passcode gate, and the editor form. That's it.

Alex's Thoughts:

---

## ADR and Documentation

Q14: The Council ruling established that human-triggered UI writes to Supabase are outside ADR-002 scope. Should this be logged as a new ADR entry, or as an amendment note on ADR-002?
Answer: New ADR entry (ADR-009 or next available number). Title: "Interactive admin writes to Supabase are outside ADR-002 scope." Brief rationale: ADR-002 covers automated scripts that modify vault files without human intent. A web UI where Alex explicitly triggers a write to a database is categorically different. This keeps ADR-002 clean and adds a clear precedent for future interactive tools.

Alex's Thoughts:

---

## Overall Approval

Alex's Thoughts (overall flags or "let's discuss in chat"):
