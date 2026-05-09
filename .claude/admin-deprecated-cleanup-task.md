<task>
  <role>You are a senior full-stack engineer performing a precise, scope-controlled cleanup of deprecated pages in a vacation-planning web app. You write no speculative code, remove nothing beyond what is explicitly listed, and verify your work with automated tests.</role>

  <goal>Delete two deprecated admin HTML pages and all files/references that depend on them. The project must pass its Playwright suite with fewer failures after the changes than before, and no previously-passing tests may regress.</goal>

  <background>
    <vault_root>/Users/alex/vaults/Vacation/Branson 2026/</vault_root>

    <playwright_command>cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e" && npx playwright test</playwright_command>

    <frozen_files>
      <!-- NEVER touch or execute these files under any circumstances -->
      - scripts/generate_dashboard.py
      - scripts/generate_attractions.py
    </frozen_files>

    <safety_greps>
      <!-- Run all five after every change; all must pass -->
      1. grep -c 'pointerdown' web/quick-pick.html              -- must return 1
      2. grep -c 'fetch.*data.json' web/attractions.html        -- must return >= 1
      3. grep -c 'fetch.*help.json' web/help.html               -- must return 1
      4. grep -c 'fetch.*schedule.json' web/event-timeline.html -- must return >= 1
      5. grep -c 'fetch.*schedule.json' web/index.html          -- must return >= 1
    </safety_greps>

    <known_pre_existing_failures>
      Before any changes the Playwright suite shows 8 failing tests:
        - 5 in tests/e2e/tests/schedule-create-fallback.spec.js
        - 2 in tests/e2e/tests/admin-timeline-delete.spec.js
        - 1 in tests/e2e/tests/admin-auth.spec.js
          (the "admin-event-timeline edit buttons" test)
      37 tests currently pass.
      Expected outcome after all changes: 37+ passing, 0-1 failing.
    </known_pre_existing_failures>

    <critical_preservation_rule>
      Do NOT modify any HTML element, function, or variable that is not explicitly named in this task.
      If you notice something that looks unused or redundant, flag it in your final output but do NOT remove it.
    </critical_preservation_rule>
  </background>

  <task_steps>

    <step number="0" label="Baseline test run">
      Run the full Playwright suite and capture the output.
      Record: number of passing tests, number of failing tests, names of all failing tests.
      This is your baseline. Do not proceed if the baseline differs unexpectedly from the known
      pre-existing state described above -- stop and report the discrepancy instead.
    </step>

    <step number="1" label="DELETE web/admin-event-timeline.html">
      Delete the file web/admin-event-timeline.html entirely.
    </step>

    <step number="2" label="DELETE web/admin-index.html">
      Delete the file web/admin-index.html entirely.
    </step>

    <step number="3" label="DELETE tests/e2e/tests/schedule-create-fallback.spec.js">
      Delete the entire file. It tests features that no longer exist.
    </step>

    <step number="4" label="DELETE tests/e2e/tests/admin-timeline-delete.spec.js">
      Delete the entire file. It tests a delete button that was removed.
    </step>

    <step number="5" label="MODIFY web/admin.html">
      Open web/admin.html.
      Remove ONLY the following two anchor tags (approximate locations shown for orientation):
        a) The "Edit Schedule" anchor tag linking to admin-event-timeline.html  (near line 61)
        b) The "Edit Home View" anchor tag linking to admin-index.html           (near line 65)
      Leave every other element, attribute, comment, and whitespace structure intact.
    </step>

    <step number="6" label="MODIFY web/js/admin-overlay.js">
      Open web/js/admin-overlay.js.
      Remove ONLY the "Full edit in Admin" anchor tag that links to admin-event-timeline.html
      (near line 148).
      Leave every other line intact.
    </step>

    <step number="7" label="MODIFY tests/e2e/tests/admin-gate.spec.js">
      This file contains exactly 3 tests. You must:
        a) Remove ONLY the test block named
           "admin-gate: admin-event-timeline.html redirects to admin.html when no session"
           (approximately lines 13-23). The other two test blocks must remain byte-for-byte identical.
        b) Update the comment near line 6 to remove any reference to the now-deleted pages.
           Change no other text in that comment.
    </step>

    <step number="8" label="MODIFY scripts/deploy.sh">
      Open scripts/deploy.sh.
      Locate the HTML_FILES list used for cache-busting.
      Remove admin-event-timeline.html and admin-index.html from that list.
      Leave all other entries in the list intact. Touch nothing else in the file.
    </step>

    <step number="9" label="Scope guard">
      Run: git diff --name-only
      The output MUST contain only files from this exact set:
        - web/admin-event-timeline.html     (deleted)
        - web/admin-index.html              (deleted)
        - tests/e2e/tests/schedule-create-fallback.spec.js  (deleted)
        - tests/e2e/tests/admin-timeline-delete.spec.js     (deleted)
        - web/admin.html
        - web/js/admin-overlay.js
        - tests/e2e/tests/admin-gate.spec.js
        - scripts/deploy.sh
      If ANY file outside this list appears in the diff, STOP immediately, revert all changes
      with git checkout -- . and git clean -fd, and report what went wrong. Do not continue.
    </step>

    <step number="10" label="Safety greps">
      Run all five safety greps listed in the safety_greps section above.
      All must pass. If any fails, stop and report which grep failed and why.
    </step>

    <step number="11" label="Post-change test run">
      Run the full Playwright suite again and capture the output.
      Confirm:
        a) The 5 schedule-create-fallback tests are gone (file deleted).
        b) The 2 admin-timeline-delete tests are gone (file deleted).
        c) The admin-gate test for admin-event-timeline.html is gone.
        d) No previously-passing test is now failing.
        e) Total passing count is >= 37.
      If any previously-passing test is now failing, stop and report it. Do not push or commit.
    </step>

  </task_steps>

  <hallucination_guard>
    Before modifying or deleting any file, read it from disk and confirm the content you intend
    to change is actually present. Do not act on assumed line numbers or assumed content.
    If a file does not exist, or the expected content is not found, STOP and report the
    discrepancy rather than guessing or fabricating a fix.
    The line numbers given in the steps are approximate navigation hints, not authoritative
    addresses -- always locate content by reading the file first.
  </hallucination_guard>

  <output_format>
    When complete, list every file you modified or deleted with a one-line description.
    Stop there. Do not run git, do not push, do not update logs.
  </output_format>

</task>
