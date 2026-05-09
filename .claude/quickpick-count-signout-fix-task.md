<task>
  <role>You are a senior full-stack engineer performing disciplined TDD bug fixes on a production web application.</role>

  <goal>Fix exactly two bugs in the Branson 2026 vacation-planner app. Each fix must follow strict TDD: write a failing test, confirm it fails, implement the fix, confirm it passes, verify no regressions. Touch only the two files named. Ship nothing else.</goal>

  <background>
    <vault_root>/Users/alex/vaults/Vacation/Branson 2026/</vault_root>

    <playwright>
      Run suite: cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test
      Known pre-existing failure: admin-auth.spec.js "edit buttons" test. Do NOT fix it. All other tests must remain green.
    </playwright>

    <frozen_files>
      scripts/generate_dashboard.py
      scripts/generate_attractions.py
    </frozen_files>

    <safety_greps>
      grep -c 'pointerdown' web/quick-pick.html                   -- must equal 1
      grep -c 'fetch.*data.json' web/attractions.html             -- must be >= 1
      grep -c 'fetch.*help.json' web/help.html                    -- must equal 1
      grep -c 'fetch.*schedule.json' web/event-timeline.html      -- must be >= 1
      grep -c 'fetch.*schedule.json' web/index.html               -- must be >= 1
    </safety_greps>

    <preservation_rule>
      Do NOT modify any HTML element not explicitly named in this task.
      If you spot anything that looks unused or redundant, flag it in your final file list but leave it untouched.
    </preservation_rule>
  </background>

  <bugs>

    <bug id="1">
      <symptom>
        The deck count displays "11 remaining of 235" but should show something like
        "11 remaining of 37". The denominator must equal the count of visible
        attractions that are NOT yet wishlisted -- the same pool filterAttractions()
        builds. updateDeckCount() currently counts all visible attractions regardless
        of wishlist state.
      </symptom>

      <code_facts>
        Read web/quick-pick.html before writing a single line of code and confirm:
        - filterAttractions() near line 200 already contains the wishlist guard:
              try { if (window.picks && picks.get && picks.get(a.slug) === 'wishlist') return; } catch(e){}
        - updateDeckCount() near line 334 computes `total` WITHOUT that guard -- that is the bug.
        - picks module is injected via web/js/picks.js (script tag near line 91).
        - window.picks may not be available synchronously; always wrap access in try/catch.
      </code_facts>

      <fix>
        In updateDeckCount(), apply the identical guard to the `total` calculation:
            try { if (window.picks && picks.get && picks.get(a.slug) === 'wishlist') return false; } catch(e){}
        so `total` counts only visible attractions that are NOT wishlisted.
      </fix>

      <acceptance>
        - 0 items wishlisted: denominator equals visible count.
        - N items wishlisted: denominator equals visible count minus N.
        - Remaining count (numerator) is unaffected.
      </acceptance>

      <tdd_steps>
        1. Read web/quick-pick.html in full. Confirm exact line numbers of filterAttractions() and updateDeckCount().
        2. Write a Playwright test that:
           a. Seeds the picks store with at least one 'wishlist' slug.
           b. Loads /quick-pick.html.
           c. Asserts the denominator in the deck-count element equals (visible count minus wishlisted count), NOT total visible count.
        3. Run the test. Confirm it FAILS. Record the failure output.
        4. Apply the fix to updateDeckCount() in web/quick-pick.html.
        5. Run the test again. Confirm it PASSES.
        6. Run the full Playwright suite. Confirm no regressions beyond the known pre-existing failure.
        7. Run all five safety greps. Confirm all pass.
      </tdd_steps>
    </bug>

    <bug id="2">
      <symptom>
        admin-overlay.js bails immediately when window.supabase is absent.
        Only event-timeline.html, index.html, and admin.html load the Supabase CDN.
        On every other page the Sign Out button never appears, even when the user is authenticated.
      </symptom>

      <code_facts>
        Read web/js/admin-overlay.js before writing a single line of code and confirm:
        - The bail is the very first conditional inside the IIFE:
              if (!window.supabase) { return; }
        - All code that creates the _sb client and subscribes to auth events depends on window.supabase.
        - The Sign Out button injection and modal injection are synchronous DOM operations that do NOT require the Supabase client.
      </code_facts>

      <fix>
        Remove the `if (!window.supabase) { return; }` bail entirely.
        Instead:
        1. Keep all synchronous DOM operations (button injection, modal injection) where they are.
        2. Replace the bail with a conditional CDN loader:
               if (!window.supabase) {
                 const s = document.createElement('script');
                 s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                 s.onload = initSupabase;
                 document.head.appendChild(s);
               } else {
                 initSupabase();
               }
        3. Extract all logic that creates _sb and subscribes to onAuthStateChange into a named function initSupabase() that runs inside onload.
        This prevents double-loading on pages that already have the CDN while ensuring every other page gets it dynamically.
      </fix>

      <acceptance>
        - Sign Out button appears on EVERY page when authenticated.
        - Sign Out button absent on EVERY page when not authenticated.
        - No duplicate Supabase script tags on event-timeline.html, index.html, or admin.html.
      </acceptance>

      <tdd_steps>
        1. Read web/js/admin-overlay.js in full. Confirm exact location of the bail and the initialization block.
        2. Write a Playwright test targeting a page that does NOT load the Supabase CDN (e.g., quick-pick.html). The test:
           a. Sets a valid auth session (mock or real -- use whatever pattern the existing admin-auth.spec.js uses).
           b. Navigates to the page.
           c. Asserts the Sign Out button (#vacdash-signout-btn) is visible.
        3. Run the test. Confirm it FAILS. Record the failure output.
        4. Apply the fix to web/js/admin-overlay.js.
        5. Run the test again. Confirm it PASSES.
        6. Run the full Playwright suite. Confirm no regressions beyond the known pre-existing failure.
        7. Run all five safety greps. Confirm all pass.
      </tdd_steps>
    </bug>

  </bugs>

  <reminder>
    Before writing any code, READ the actual file contents and verify every stated fact (function names, line numbers, guard patterns, variable names). If anything differs from what is described, use what the file actually contains -- not what this brief says. Never invent function names, variable names, or code patterns not present in the real file. If a discrepancy would change the fix strategy, stop and report it before proceeding.
  </reminder>

  <output_format>
    When complete, list every file you modified with a one-line description.
    Stop there. Do not run git, do not push, do not update logs.
  </output_format>

</task>
