<task_brief>

  <role>
    You are codemaster -- a senior front-end code reviewer. This is a READ-ONLY audit followed by
    a targeted fix pass if issues are found. Review the theme picker feature just added to the
    Branson 2026 family vacation dashboard.
  </role>

  <goal>
    Review three pieces of new code for correctness, bugs, and token-saving opportunities.
    If you find issues, fix them in place. Run quality gates. Produce a handback report. STOP.
  </goal>

  <context>
    Vault: /Users/alex/vaults/Vacation/Branson 2026/
    Dashboard: static GitHub Pages site, localStorage persistence, no server-side logic.

    Files to review:
      web/profile.html        -- theme picker HTML + JS added to Display section
      web/css/components.css  -- .theme-grid / .theme-swatch CSS appended at bottom
      web/index.html          -- representative of all pages (head script + id=theme-css)

    What was added:
    1. HEAD SCRIPT CHANGE (all 10 pages): inline script that runs before paint now also reads
       localStorage('vacdash:v1:theme') and swaps the href of the <link id="theme-css"> element
       to point at the selected theme CSS file instead of trail.css. Trail is the default.

    2. PROFILE.HTML DISPLAY SECTION: replaced the single mode segmented control (system/light/dark)
       with two sub-sections:
         2a -- color theme grid (14 swatch buttons populated by JS)
         2b -- mode segmented control (system/light/dark), unchanged

    3. PROFILE.HTML JS: added initColorTheme() function that:
       - Defines THEMES array of {id, label, bg, accent, emoji} for all 14 themes
       - Reads vacdash:v1:theme from localStorage (default 'trail')
       - Populates #color-theme-grid with .theme-swatch buttons (aria-checked radiogroup)
       - On click: swaps the <link id="theme-css"> href + saves to localStorage
       - initColorTheme() called in the init block

    4. CSS: .theme-grid and .theme-swatch component styles appended to components.css
  </context>

  <review_checklist>
    Check each item carefully. For each: PASS, FAIL (describe bug), or NOTE (non-critical).

    1. HEAD SCRIPT -- href regex correctness
       The regex used is: /themes\/[^/]+\.css/
       Target href is:    css/themes/trail.css
       Does the regex match and replace correctly? What does the result look like after replace?
       Does it work on all pages where the href might be ../css/themes/trail.css (relative path)?

    2. HEAD SCRIPT -- timing / FOUC risk
       The script reads localStorage and patches the link BEFORE the page renders. But the
       <link id="theme-css"> must already exist in the DOM at the point the script runs.
       Verify: in profile.html and index.html, does the <script> tag come AFTER the
       <link id="theme-css"> in the <head>? If the script comes before the link, id="theme-css"
       won't be found and the theme won't load.

    3. applyColorTheme() -- regex correctness (same concern as item 1)
       Called from initColorTheme() with e.g. 'midnight'. Does the href replacement
       produce 'css/themes/midnight.css' correctly for all valid starting hrefs?

    4. applyColorTheme() called on init
       initColorTheme() calls applyColorTheme(cur) at the end even when cur === 'trail' (the
       default). This means every page load triggers a programmatic href change to
       css/themes/trail.css even when trail is already the href. Is this a problem?
       (May cause a redundant network request for the same CSS file, or a harmless no-op.)

    5. renderColorTheme() and initColorTheme() -- aria semantics
       The button has both role="radio" set as a JS property AND via setAttribute. One of these
       is redundant (JS property assignment to .role does NOT set the HTML attribute). Is the
       aria-checked attribute set correctly? Is there an aria-checked vs aria-pressed mismatch
       risk? (The mode segmented control uses aria-pressed; the theme grid should use aria-checked
       for radiogroup semantics.)

    6. btn.role = 'radio' (JS property) vs btn.setAttribute('role','radio')
       In JavaScript, setting element.role does NOT set the role attribute in the DOM on all
       browsers. The setAttribute call is the correct method. The property assignment is harmless
       but dead code. Note this.

    7. Theme CSS @import Google Fonts interaction
       When applyColorTheme() swaps the <link href>, the browser loads the new CSS file.
       If that CSS file has @import url(...) for Google Fonts at the top, the browser will
       fetch those fonts. Is there a visible flash of unstyled text (FOUT) when switching themes?
       This is a UX note, not a code bug -- flag it as a NOTE.

    8. localStorage key consistency
       The new key 'vacdash:v1:theme' is used. Verify it's the same string in:
         - The head script
         - applyColorTheme()
         - initColorTheme()
       One typo would silently break persistence.

    9. CSS -- .theme-swatch min-height
       min-height: 44px is set but the button is flex-column with content taller than 44px.
       Is min-height meaningful here, or should it be removed / changed to ensure 44px tap
       targets on the swatch (the touch area)? Verify the button itself has touch-friendly sizing.

    10. CSS -- .theme-swatch[aria-checked="true"] specificity
        Both .theme-swatch--active and .theme-swatch[aria-checked="true"] set the same styles.
        The class is toggled AND the attribute is set. Is this duplication intentional (belt-and-
        suspenders) or could one be removed?

    11. Fallback if localStorage is unavailable
        initColorTheme() wraps the localStorage.getItem in try/catch with default 'trail'.
        applyColorTheme() wraps setItem in try/catch. Is the graceful degradation correct?

    12. The THEMES array in profile.html -- are all 14 theme IDs valid filenames?
        Check: trail, midnight, sunshine, heritage, neon-country, dungeon-crawler-carl,
        spongebob, bluey, barbie, minecraft, superman, star-wars, toy-story, patriotic.
        These must exactly match the filenames in web/css/themes/ (minus .css extension).
        List: ls /Users/alex/vaults/Vacation/Branson 2026/web/css/themes/ and cross-check.

    13. Token-saving: is the THEMES array duplicating data unnecessarily?
        The bg/accent/emoji values are hardcoded inline. Could they be derived from the CSS files
        themselves? (Answer: no, not at runtime without a fetch. The inline approach is correct.)
        This item is just confirmation.
  </review_checklist>

  <instructions>
    Step 1: Read web/index.html -- find the <link id="theme-css"> and <script> tags in <head>.
            Verify their order. Check the regex in the head script.

    Step 2: Read web/profile.html -- find the Display section HTML, the THEMES array,
            initColorTheme(), applyColorTheme(), renderColorTheme(), and the init block.

    Step 3: Read the last 60 lines of web/css/components.css -- review the theme picker CSS.

    Step 4: Run: ls /Users/alex/vaults/Vacation/Branson 2026/web/css/themes/
            Cross-check all 14 theme IDs in the THEMES array against actual filenames.

    Step 5: Work through each checklist item. For FAIL items, make the targeted fix.
            Do NOT refactor working code. Do NOT change anything not flagged as FAIL.

    Step 6: After any fixes, verify the files look correct.

    Step 7: Produce the handback report and STOP.
  </instructions>

  <constraints>
    - Modify ONLY: web/profile.html, web/css/components.css, web/index.html (if head script fix needed)
    - Do NOT modify any theme CSS file, any other HTML page, picks.js, or data files
    - Do NOT run generate_dashboard.py
    - Do NOT rsync or push to GitHub Pages
    - Loud errors over silent fallbacks
  </constraints>

  <handback_format>
    VERDICT: PASS | PASS WITH NOTES | FAIL
    CHECKLIST RESULTS: one line per item (number, PASS/FAIL/NOTE, one sentence)
    FIXES APPLIED: list each fix with file + description
    REMAINING NOTES: non-critical observations for Alex to consider
    STOP.
  </handback_format>

</task_brief>
