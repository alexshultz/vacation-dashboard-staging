<task>
  <role>You are a precise full-stack engineer working inside a Playwright + vanilla-JS vacation-planning web app. You write clean, minimal diffs and never touch files outside your declared scope.</role>

  <goal>Fix two independent bugs -- a flaky async timing issue in an E2E test, and a missing alphabetical sort in the wishlist renderer -- using TDD. Both fixes must be verified by running the Playwright suite before you declare completion.</goal>

  <background>
    <vault_root>/Users/alex/vaults/Vacation/Branson 2026/</vault_root>
    <playwright_command>cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test</playwright_command>
    <current_suite_status>1 failing test: "event-timeline.html shows edit buttons when logged in" in admin-auth.spec.js. All other tests pass.</current_suite_status>

    <frozen_files>
      scripts/generate_dashboard.py
      scripts/generate_attractions.py
    </frozen_files>

    <safety_greps>
      grep -c 'pointerdown' web/quick-pick.html           -- must return exactly 1
      grep -c 'fetch.*data\.json' web/attractions.html    -- must return >= 1
      grep -c 'fetch.*help\.json' web/help.html           -- must return exactly 1
      grep -c 'fetch.*schedule\.json' web/event-timeline.html  -- must return >= 1
      grep -c 'fetch.*schedule\.json' web/index.html      -- must return >= 1
    </safety_greps>

    <preservation_rule>Do NOT modify any HTML element not explicitly named in this task. If you encounter anything unused or redundant, flag it -- do not remove it.</preservation_rule>
  </background>

  <tasks>

    <task id="1" title="Fix async timing in admin-auth.spec.js edit-buttons test">
      <symptom>
        The test "event-timeline.html shows edit buttons when logged in" fails.
        After page load, .admin-edit-btn exists in the DOM but is hidden via CSS:
          body.is-admin .admin-edit-btn { display: inline-flex }
        The class is-admin is added asynchronously by onAuthStateChange in admin-overlay.js,
        so an immediate isVisible() assertion races against the auth callback.
      </symptom>
      <scope>tests/e2e/tests/admin-auth.spec.js ONLY. No production code changes.</scope>
      <steps>
        <step n="1">Read tests/e2e/tests/admin-auth.spec.js in full. Find the test named "event-timeline.html shows edit buttons when logged in".</step>
        <step n="2">Locate the exact line where editBtns.first().isVisible() is asserted.</step>
        <step n="3">Immediately BEFORE that assertion, insert:
            await page.waitForFunction(() => document.body.classList.contains('is-admin'), { timeout: 10000 });
        </step>
        <step n="4">Run the full Playwright suite. Confirm the previously failing test now passes and no previously passing tests regressed.</step>
      </steps>
      <acceptance>The test passes. Full suite is green (0 failures).</acceptance>
    </task>

    <task id="2" title="Sort wishlist items A-Z by attraction name in renderWishlist()">
      <symptom>Wishlist items render in localStorage insertion order. Should be alphabetical.</symptom>
      <scope>web/wishlist.html ONLY.</scope>
      <steps>
        <step n="1">Read web/wishlist.html in full. Find renderWishlist() (near line 302). Read it completely before writing any code.</step>
        <step n="2">Confirm the exact variable name for the wishlisted slugs array as it appears in the actual file.</step>
        <step n="3">Check whether attraction objects from slugToAttr(slug) have a sort_key field. If present and non-empty, use sort_key. Otherwise use .name. Add a one-line comment documenting which field you used.</step>
        <step n="4">After the wishlisted array is fully built and BEFORE the forEach/map that builds cards, insert an in-place sort:
            wishlisted.sort(function(a, b) {
              var attrA = slugToAttr(a);
              var attrB = slugToAttr(b);
              if (!attrA && !attrB) return 0;
              if (!attrA) return 1;
              if (!attrB) return -1;
              var keyA = (attrA.sort_key || attrA.name || '').toLowerCase();
              var keyB = (attrB.sort_key || attrB.name || '').toLowerCase();
              return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
            });
          Adapt variable names to match the actual file. Do not alter any surrounding logic.</step>
        <step n="5">Run the full Playwright suite. Confirm no tests regressed.</step>
        <step n="6">Run all five safety greps. Confirm all pass.</step>
      </steps>
      <acceptance>Wishlist cards appear in ascending alphabetical order on every render. Slugs with no matching attraction sort to the bottom.</acceptance>
    </task>

  </tasks>

  <final_reminder>
    Before writing any code: READ every file you intend to modify. Do not infer variable names or line numbers from this brief -- verify in the actual source.
    Touch ONLY: tests/e2e/tests/admin-auth.spec.js and web/wishlist.html.
    Any edit to any other file is a critical error. Run git diff --name-only after changes -- if anything outside these two files appears, STOP and revert before handing back.
    Do NOT run or reference scripts/generate_dashboard.py or scripts/generate_attractions.py.
    Run the Playwright suite and all safety greps after changes. Report actual output.
  </final_reminder>

  <output_format>
    When complete, list every file you modified with a one-line description. Stop there.
    Do not run git, do not push, do not update logs.
  </output_format>

</task>
