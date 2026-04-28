# Grill-Me: Admin Editor Override Build
**Session:** admin-editor-override-task  
**Date:** 2026-04-28  
**Agent:** lazlo

---

## Phase 0 Self-Interrogation

**Q1: What are the exact variable names for SUPABASE_URL and SUPABASE_ANON_KEY, and where are they defined?**  
A1: Neither `index.html` nor `event-timeline.html` currently define these variables — neither file has any Supabase integration. The canonical variable names and values are found in `web/js/picks.js` lines 18–19:  
- `const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';`  
- `const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';`  
These exact names (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) will be used when adding constants to index.html and event-timeline.html.

**Q2: Where exactly in index.html is schedule.json fetched, and where is render() called?**  
A2: `web/index.html` lines 239–251. Inside `window.onload = () => {`, a `fetch('schedule.json')` chain runs. The `.then(data => {` callback at line 242 sets `eventsData = data.events;` (line 243) and immediately calls `render();` (line 244). The overrides fetch must be injected between those two lines.

**Q3: Where exactly in event-timeline.html is schedule.json fetched, and where is render() called?**  
A3: `web/event-timeline.html` lines 187–197. Inside `window.onload = () => {`, a `fetch('schedule.json')` chain runs. The `.then(data => {` callback sets `eventsData = data.events;` (line 191) and immediately calls `render();` (line 192). Same injection pattern as index.html.

**Q4: What is the exact function name in site.js that builds the hamburger panel?**  
A4: `buildHamburgerPanel()` — defined at line 107 of `web/js/site.js`. It returns a complete HTML string for `#hamburger-panel`.

**Q5: What class and element tag are used on hamburger panel links in site.js?**  
A5: `<a>` tags with `class="hamburger-link"`. Links inside the panel use the pattern:  
```js
'<a href="' + l.href + '" class="hamburger-link"' + cur + '>' +
  '<span class="nav-icon">' + l.icon + '</span>' +
  '<span class="nav-label">' + l.label + '</span>' +
  '</a>'
```
The last item in the panel is the Profile `<a class="hamburger-link" href="profile.html" ...>` at line 121. The admin link must follow this same pattern.

**Q6: What USER_KEY variable is available in site.js scope for the Alex check?**  
A6: `var USER_KEY = 'vacdash:v1:user';` — defined at line 33 of site.js, in the IIFE scope. The admin link conditional can use `localStorage.getItem(USER_KEY)` instead of the literal string.

**Q7: What is the SQL trigger pattern from supabase-phase2-schema.sql?**  
A7: Lines 82–92 of `data/supabase-phase2-schema.sql`:
- Function: `CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;`
- Drop + create pattern: `DROP TRIGGER IF EXISTS <name> ON public.<table>; CREATE TRIGGER <name> BEFORE UPDATE ON public.<table> FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`
- Timing: `BEFORE UPDATE`, `FOR EACH ROW`
- The function `set_updated_at()` is shared across tables (already created by Phase 2 schema); using `CREATE OR REPLACE` in admin-schema.sql makes it standalone/safe.

**Q8: What are the confirmed event field names in schedule.json? Is it `startTime` or `start_time`?**  
A8: Confirmed from `web/schedule.json` lines 1–80 (first 5 events):
- `id` — string (e.g. `"atv"`)
- `title` — string
- `date` — string, YYYY-MM-DD format
- `duration` — number, can be whole (`4`, `1`) or decimal (`2.5`, `1.5`)
- `priority` — string (`"high"`, `"medium"`, `"low"`)
- `catalogRef` — null (in all seen records)
- `startTime` — **camelCase**, null in all seen records
- `travelMinutes` — null in all seen records
- `interested` — array of strings
- `undecided` — array of strings
- `notInterested` — **camelCase**, array of strings
- `noResponse` — **camelCase**, array of strings

**Q9: Is there any existing override-related code in any of the 6 files?**  
A9: No. Searched all 6 files: no `schedule_overrides`, no `override`, no admin-related fetch calls in index.html, event-timeline.html, site.js, picks.js, supabase-phase2-schema.sql, or schedule.json. The feature is net-new.

**Q10: What is the structure of buildHamburgerPanel()'s return string — where does the closing `</div>` appear?**  
A10: The return string (lines 117–123 of site.js) ends with:
```js
'<a class="hamburger-link" href="profile.html" id="profile-btn-hamburger" aria-label="Profile"' + profCur + '>\uD83D\uDC64 Profile<span class="profile-nudge-dot" aria-hidden="true"></span></a>' +
'</div>'
```
The admin link string will be inserted between the profile `</a>` and the closing `</div>`.

**Q11: Does the `.then(data => {` callback in index.html or event-timeline.html need to become async?**  
A11: Yes. Both files use a synchronous `.then(data => {...})` callback. To use `await` (for `Promise.race`) inside the callback, it must become `.then(async data => {...})`. This is the minimal change required.

**Q12: For numeric field casting — should duration use parseFloat or parseInt?**  
A12: `parseFloat`. The `duration` field in schedule.json is the only numeric field in the admin form, and it can be `2.5`, `1.5`, or whole numbers like `4` and `1`. `parseFloat` handles both correctly. `travelMinutes` is null in all observed records and is not exposed in the admin form. `parseFloat` is used uniformly for all `typeof === 'number'` fields.

---

## Mismatches / Flags

**FLAG 1 (minor, no action needed):** site.js header comment (line 10) says "7-link desktop nav" but `NAV_LINKS` has 8 entries (Home, Activities, Quick Pick, Wishlist, Suggested, Timeline, People, Help). The comment is stale. Does not affect this build.

**FLAG 2 (minor, no action needed):** site.js header comment (line 12) says "Hamburger panel injection (7-link mobile dropdown)" — same stale count issue. Actual panel has 8 NAV_LINKS + Profile link + theme toggle = 10 items. Does not affect this build.

**FLAG 3 (expected, by design):** SUPABASE_URL and SUPABASE_ANON_KEY do not exist in index.html or event-timeline.html. This is expected — the brief is adding Supabase integration to those pages. Values confirmed from picks.js.

**NO MISMATCHES** in: event field names, SQL trigger pattern, hamburger link class, USER_KEY variable name, fetch locations, render call positions.

---

## Confirmed Values (for use in implementation)

| Item | Value | Source |
|------|-------|--------|
| SUPABASE_URL | `'https://quebfbvfuwbncpexlylu.supabase.co'` | picks.js:18 |
| SUPABASE_ANON_KEY | `'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt'` | picks.js:19 |
| Admin passcode | `'3141'` | task brief |
| Admin token | `'override-token-3141'` | task brief |
| Hamburger link class | `hamburger-link` | site.js:110 |
| Hamburger link tag | `<a>` | site.js:110 |
| Icon span class | `nav-icon` | site.js:112 |
| Label span class | `nav-label` | site.js:113 |
| USER_KEY | `'vacdash:v1:user'` | site.js:33 |
| schedule.json event field (time) | `startTime` (camelCase) | schedule.json:7 |
| schedule.json event field (not-interested) | `notInterested` (camelCase) | schedule.json:13 |
| Trigger function name | `public.set_updated_at()` | supabase-phase2-schema.sql:82 |
| Trigger timing | `BEFORE UPDATE ... FOR EACH ROW` | supabase-phase2-schema.sql:88 |

---

## Implementation Status

Phase 0 (grill-me) — COMPLETE. Proceeding to Phase 1 immediately.
