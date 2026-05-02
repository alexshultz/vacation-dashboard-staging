<role>
You are a precise surgical code editor. Your goal is to apply two exact, pre-specified bug fixes to the Branson 2026 vacation dashboard -- no more, no less. Every change is fully specified; your job is faithful execution, not interpretation.
</role>

<background>
Project: Branson 2026 static dashboard, served via GitHub Pages.
Vault root: /Users/alex/vaults/Vacation/Branson 2026

Architecture facts (do not infer beyond these):
- web/js/site.js is a synchronous IIFE loaded as the first body script on every page. It currently injects admin-overlay.js dynamically.
- web/js/admin-overlay.js bails at line 4-5 with `if (!window.supabase) { return; }` -- so Sign Out never renders on pages missing the Supabase CDN tag.
- Pages WITH Supabase CDN in <head>: index.html, event-timeline.html, admin.html, admin-event-timeline.html, admin-index.html
- Pages WITHOUT Supabase CDN: attractions.html, shows.html, quick-pick.html, wishlist.html, suggested.html, people-timeline.html, profile.html, help.html
- Setting .async = false on a dynamically-appended script guarantees DOM-insertion-order execution per the HTML spec.
- web/admin.html has its own Supabase client variable (supabaseClient), separate from admin-overlay.js's internal _sb variable. Both use the same credentials.
- Playwright E2E suite location: /Users/alex/vaults/Vacation/Branson 2026/tests/e2e/
  Run command: cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test

Files you are permitted to modify:
  1. /Users/alex/vaults/Vacation/Branson 2026/web/js/site.js
  2. /Users/alex/vaults/Vacation/Branson 2026/web/admin.html

Files and systems that are PERMANENTLY OFF-LIMITS:
  - generate_dashboard.py  -- do NOT run or edit
  - generate_attractions.py -- do NOT run or edit
  - help.html -- do NOT edit directly (help.json is canonical)
  - Every other file in the vault not listed above
</background>

<task>
Apply exactly two bug fixes as specified below. Do not reformat, refactor, or touch any code outside the explicitly identified blocks.

--- BUG 1: Sign Out missing on pages without Supabase CDN ---
File: /Users/alex/vaults/Vacation/Branson 2026/web/js/site.js
Location: the IIFE block that injects admin-overlay.js (near lines 249-263)

FIND and REPLACE this exact block:

CURRENT:
```js
    // Load admin overlay on every page that uses site.js
    (function() {
      var overlayScript = document.createElement('script');
      overlayScript.src = (function() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
          if (scripts[i].src && scripts[i].src.indexOf('site.js') !== -1) {
            return scripts[i].src.replace('site.js', 'admin-overlay.js');
          }
        }
        return 'js/admin-overlay.js';
      })();
      overlayScript.async = false;
      document.head.appendChild(overlayScript);
    })();
```

REPLACEMENT:
```js
    // Load admin overlay on every page that uses site.js
    (function() {
      // Inject Supabase CDN if not already loaded (pages without CDN <script> in <head>)
      if (!window.supabase) {
        var sbScript = document.createElement('script');
        sbScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        sbScript.async = false;
        document.head.appendChild(sbScript);
      }
      var overlayScript = document.createElement('script');
      overlayScript.src = (function() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
          if (scripts[i].src && scripts[i].src.indexOf('site.js') !== -1) {
            return scripts[i].src.replace('site.js', 'admin-overlay.js');
          }
        }
        return 'js/admin-overlay.js';
      })();
      overlayScript.async = false;
      document.head.appendChild(overlayScript);
    })();
```

--- BUG 2: Redundant Sign Out button in admin.html nav ---
File: /Users/alex/vaults/Vacation/Branson 2026/web/admin.html

CHANGE A -- Remove HTML block (the signout button inside #admin-hub-nav):
FIND and DELETE this exact block:
```html
      <button id="signout-btn"
        style="padding:14px 22px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:15px;cursor:pointer;color:var(--color-ink);">
        Sign Out
      </button>
```

CHANGE B -- Remove JS click handler:
FIND and DELETE this exact block (line numbers will have shifted after Change A -- search by content):
```js
      // Sign-out button
      document.getElementById('signout-btn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        location.reload();
      });
```
</task>

<constraints>
1. Touch ONLY the four code blocks explicitly identified above -- two in site.js, two in admin.html.
2. Do NOT modify any HTML element not explicitly named in this task. If you encounter any element that appears unused or redundant during your work, FLAG it in the handback report. Do not remove it.
3. Do NOT run, invoke, or modify generate_dashboard.py or generate_attractions.py.
4. Do NOT edit help.html -- help.json is the canonical source.
5. Do NOT alter indentation, whitespace, or formatting outside the replaced/deleted blocks.
6. Do NOT refactor, rename, or restructure anything beyond the specified changes.
7. If the exact text of a target block is not found, STOP and report the discrepancy. Do not apply a fuzzy or approximate match.
</constraints>

<rules>
- Perform a literal string match for each target block before editing. If the exact text is not found, report it rather than guessing.
- After each file edit, run a safety grep to confirm:
  (a) `!window.supabase` appears in the new site.js block
  (b) `sbScript` appears in site.js
  (c) `signout-btn` does NOT appear anywhere in admin.html
- Run the full safety check suite:
    grep -c 'pointerdown' "/Users/alex/vaults/Vacation/Branson 2026/web/quick-pick.html"          # must return 1
    grep -c 'fetch.*data.json' "/Users/alex/vaults/Vacation/Branson 2026/web/attractions.html"    # must return >= 1
    grep -c 'fetch.*help.json' "/Users/alex/vaults/Vacation/Branson 2026/web/help.html"           # must return 1
    grep -c 'fetch.*schedule.json' "/Users/alex/vaults/Vacation/Branson 2026/web/event-timeline.html"  # must return >= 1
- Run the Playwright E2E suite after both edits are complete:
    cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test
  If tests fail, report the failure output verbatim. Do not attempt to fix test failures unless they are a direct consequence of the two specified changes.
- Do not commit, push, copy files, or update any logs.
</rules>

<order_of_operations>
1. Read /Users/alex/vaults/Vacation/Branson 2026/web/js/site.js and locate the exact IIFE block. Confirm text match.
2. Apply the BUG 1 replacement in site.js.
3. Run safety greps on site.js: confirm `!window.supabase` and `sbScript` are present.
4. Read /Users/alex/vaults/Vacation/Branson 2026/web/admin.html and locate the `<button id="signout-btn">` block. Confirm exact match.
5. Delete the HTML block (BUG 2 Change A).
6. Locate the `signout-btn` click-handler block (line numbers shifted after step 5 -- search by content). Confirm exact match.
7. Delete the JS click-handler block (BUG 2 Change B).
8. Run safety grep on admin.html: confirm `signout-btn` does NOT appear anywhere.
9. Run the full safety check suite.
10. Run the Playwright E2E suite. Record pass/fail output.
11. Produce the handback report.
</order_of_operations>

<output_format>
Produce a handback report with these exact sections:

## Files Modified
| File | Change |
|------|--------|
| web/js/site.js | one-line description |
| web/admin.html | one-line description |

## Safety Grep Results
- site.js `!window.supabase` present: YES/NO
- site.js `sbScript` present: YES/NO
- admin.html `signout-btn` absent: YES/NO
- quick-pick.html pointerdown: YES/NO (count)
- attractions.html fetch data.json: YES/NO (count)
- help.html fetch help.json: YES/NO (count)
- event-timeline.html fetch schedule.json: YES/NO (count)

## Playwright Results
[PASS / FAIL -- paste relevant output]

## Assumptions
[List any assumptions made, or "None."]

## Flags
[List any elements that appeared unused or redundant but were NOT touched. Or "None."]

## Discrepancies
[List any text-match mismatches encountered. Or "None."]
</output_format>

<reminder>
You are applying pre-specified, exact surgical changes. Do not invent, infer, or extrapolate beyond what is written above. If any target block does not match exactly, STOP and report -- do not substitute a best guess. Every claim in your handback report must be verifiable from grep output or test runner output you actually observed. Do not fabricate grep results or test outcomes.

When complete, list every file modified and a one-line description. Note any assumptions. STOP. Do not commit, push, copy files, or update logs.
</reminder>
