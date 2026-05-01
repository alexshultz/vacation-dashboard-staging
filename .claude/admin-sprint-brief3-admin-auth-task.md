<role>
You are a senior front-end engineer specialising in Supabase Auth and WebAuthn. You write clean, minimal JavaScript -- no frameworks, no unnecessary abstractions. You read existing code carefully before touching anything, and you flag ambiguities rather than guess.
</role>

<goal>
Rewrite the authentication gate in web/admin.html to use Supabase Auth passkeys (WebAuthn) instead of the hardcoded 3141 passcode. Add an import button that upserts schedule.json to Supabase. Make admin.html the post-login hub with two navigation links. Do not touch any other file unless explicitly listed below.
</goal>

<background>
Project root: /Users/alex/vaults/Vacation/Branson 2026
Supabase project URL: https://quebfbvfuwbncpexlylu.supabase.co
The Supabase anon key is already present in web/admin.html -- read it from the file. Do not hardcode a placeholder.
The Supabase JS client (v2) is already loaded via CDN in web/admin.html.
web/admin.html already contains: a passcode section (#passcode-section), an editor section (#editor-section), and nav chrome wired through web/js/site.js.
Admin pages share the same site.js nav chrome as family-facing pages -- do not duplicate or replace nav elements.
The schedule data file is at web/schedule.json relative to the project root.
</background>

<analysis_order>
Before writing a single line of code, perform these steps IN ORDER and reason through each one:

1. Read web/admin.html in full. Identify:
   - The exact CDN URL and version of the Supabase JS client being loaded.
   - Every element with an id or class related to auth, passcode, or editor sections.
   - Any existing ADMIN_TOKEN variable or auth header construction.
   - Every HTML element NOT named in the task below -- list them; do not touch them.

2. Check the Supabase JS v2 client API against the CDN version you found. Confirm the exact method signature for passkey sign-in (expected: supabase.auth.signInWithPasskey() but verify). If the loaded version does not expose that method, note the discrepancy in your handback report and use the closest correct alternative.

3. Read web/schedule.json. Count the top-level event objects. The task expects 28. If the count differs, note it -- do not hardcode 28 blindly; use the actual count from the file but flag the discrepancy.

4. Identify all event fields in schedule.json and map each one to its corresponding schedule_events column. If a field has no obvious column match, flag it in the handback and skip that field rather than guess.

5. Only after completing steps 1-4 should you begin editing files.
</analysis_order>

<task>
Make ALL of the following changes to web/admin.html ONLY. No other file may be modified.

--- AUTH GATE REPLACEMENT ---

Change 1 -- Remove passcode gate:
Remove the hardcoded '3141' check and the JavaScript that shows/hides #passcode-section vs #editor-section based on passcode input. Remove the passcode input field and its submit button. Do NOT remove the #passcode-section or #editor-section elements themselves -- change their contents and visibility logic only.

Change 2 -- Session check on page load:
On DOMContentLoaded, call supabase.auth.getSession(). If a valid session is returned, immediately hide the auth UI and show #editor-section. If no session, show the auth UI inside (or replacing the content of) #passcode-section.

Change 3 -- Auth UI (two states):
Inside #passcode-section render two mutually exclusive states:

State A -- Registration (id="auth-register"):
  A single button labelled 'Set up Face ID / Touch ID'.
  On click: call supabase.auth.signUp() with a WebAuthn/passkey credential option.
  Show this state when no passkey has been registered yet (first visit).

State B -- Sign-in (id="auth-signin"):
  A single button labelled 'Sign in with Face ID / Touch ID'.
  On click: call the verified passkey sign-in method from your analysis step.
  Show this state on subsequent visits (passkey already registered).

Detection logic: use localStorage key 'branson_passkey_registered'. If absent → show State A. After successful registration, set the key and switch to State B. On successful sign-in, proceed to Change 4.

Change 4 -- Post-auth reveal:
On successful auth (registration or sign-in): hide #passcode-section, show #editor-section. Store nothing sensitive in localStorage beyond the 'branson_passkey_registered' flag.

--- EDITOR SECTION ADDITIONS ---

Change 5 -- Import button:
Inside #editor-section, add a clearly labelled block (id="import-block") containing:
  - A button (id="import-btn") labelled 'Import schedule from file'.
  - A status message area (id="import-status"), initially empty.

On click:
  1. fetch('schedule.json') (relative path).
  2. Parse JSON. Count event objects.
  3. Map all event fields to schedule_events columns per your analysis.
  4. Call supabase.from('schedule_events').upsert(mappedRows, { onConflict: 'id' }).
  5. If upserted count === expected count: set #import-status text to '[N] events imported' in green.
  6. If count differs: set #import-status text to 'Warning: expected [expected] events, got [actual]' with yellow background.
  7. On any error: set #import-status to the error message in red.
  8. After first successful import: change #import-btn label to 'Re-import'. Persist this label via localStorage key 'branson_import_done'.

Change 6 -- Hub navigation links:
Inside #editor-section, above #import-block, add a nav block (id="admin-hub-nav") containing exactly two links:
  - 'Edit Schedule' → href="admin-event-timeline.html"
  - 'Edit Home View' → href="admin-index.html"
Style them as prominent buttons -- inline style only, no new CSS classes.

Change 7 -- Replace ADMIN_TOKEN:
Find any existing ADMIN_TOKEN variable or Authorization header construction that uses '3141'. Replace it with the JWT from the active Supabase session: retrieve via (await supabase.auth.getSession()).data.session.access_token. If no such variable exists in the file, note that in the handback.

--- STRICT DO-NOT-TOUCH LIST ---

Do NOT modify:
- web/event-timeline.html
- web/index.html
- web/attractions.html
- Any other family-facing HTML page
- web/js/site.js
- web/js/picks.js
- Any .css file
- Any HTML element in web/admin.html that is not explicitly named in Changes 1-7 above

If you encounter any element that appears unused or redundant, DO NOT remove it. List it in your handback report under "Flagged elements -- not modified".
</task>

<hallucination_guard>
You must not invent Supabase method names. You must not assume the schedule.json field-to-column mapping -- derive it from the actual file. You must not hardcode the event count as 28 without verifying it in the file. If any method, field, or count differs from what the task states, use what the file actually contains and flag the discrepancy. When in doubt, flag and skip rather than guess.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.

Additionally include a "Handback Report" with:
- Exact Supabase Auth methods used (with full method signatures as called)
- Supabase JS client version found in admin.html
- Actual event count found in schedule.json (and whether it matched 28)
- Field-to-column mapping used for the upsert
- Any flagged elements not modified
- Any assumptions made about passkey API availability
</output_format>
