<task_brief>

  <role>
    You are lazlo -- a precise front-end engineer working on the Branson '26 family vacation dashboard.
    Three targeted changes across three files. Read all three files fully before touching anything.
  </role>

  <goal>
    1. Rename "Mode" to "Appearance" on the profile page segmented control.
    2. Add icons to the three segmented control buttons and fix the active/selected highlight.
    3. Update the hamburger menu Appearance toggle so it always says "Appearance" as the word,
       with only the icon changing to reflect the current mode.
  </goal>

  <files>
    All paths relative to vault root: /Users/alex/vaults/Vacation/Branson 2026/
    - web/profile.html           (segmented control HTML + JS)
    - web/js/site.js             (modeLabel function)
    - web/css/components.css     (.seg CSS rules)
  </files>

  <context>
    Profile page Display section has:
      <label id="mode-label" ...>Mode</label>
      <div class="seg" role="radiogroup" aria-labelledby="mode-label" id="theme-seg">
        <button type="button" role="radio" data-theme="system" aria-checked="false">System</button>
        <button type="button" role="radio" data-theme="light"  aria-checked="false">Light</button>
        <button type="button" role="radio" data-theme="dark"   aria-checked="false">Dark</button>
      </div>

    NOTE: these buttons use aria-checked (radiogroup semantics), NOT aria-pressed.
    The renderTheme() JS function sets aria-checked="true" on the active button.

    site.js modeLabel() currently returns:
      light  -> '☀️ Light'
      dark   -> '🌙 Dark'
      system -> '🌓 Auto'
    The hamburger toggle button shows modeLabel(currentMode) as its full textContent.

    .seg button CSS (components.css ~line 297):
      background: transparent; color: var(--color-ink-dim);
      No aria-checked="true" active rule exists yet.
  </context>

  <changes>

    CHANGE 1 -- profile.html: label + button text
    -------------------------------------------------
    a. Change the label text from "Mode" to "Appearance":
       Old: >Mode</label>
       New: >Appearance</label>

    b. Add icons to each button. Replace button text content only -- do not change
       any attributes (role, data-theme, aria-checked, type):
       - data-theme="system" button text: 🌓 System
       - data-theme="light"  button text: ☀️ Light
       - data-theme="dark"   button text: 🌙 Dark

    CHANGE 2 -- web/js/site.js: modeLabel()
    -----------------------------------------
    The label always reads "Appearance" with only the icon changing:
      light  -> '☀️ Appearance'
      dark   -> '🌙 Appearance'
      system -> '🌓 Appearance'

    Update the three return values in modeLabel(). Do not change anything else in this function
    or anywhere else in the file.

    CHANGE 3 -- web/css/components.css: active state for .seg buttons
    ------------------------------------------------------------------
    The .seg buttons use aria-checked (not aria-pressed) for the radiogroup pattern.
    Add this rule immediately after the existing .seg button rule block:
      .seg button[aria-checked="true"] {
        background: var(--color-surface);
        color: var(--color-ink);
      }
    Place it right after:  .seg button .ico { font-size: 14px; }
    Do not modify any existing .seg rule. Do not touch the aria-pressed rules for RSVP controls.

  </changes>

  <verification>
    1. grep -c 'aria-checked="true"' web/css/components.css   -- must return >= 1
    2. grep -c 'modeLabel' web/js/site.js                     -- must return >= 2
    3. grep 'Appearance' web/js/site.js                        -- must show three lines returning Appearance
    4. grep 'Appearance' web/profile.html                      -- must show label line
    5. grep 'data-theme' web/profile.html                      -- must show 3 buttons with icon text (🌓/☀️/🌙)
    6. node -e "require('fs').readFileSync('web/js/site.js','utf8')" -- JS syntax OK (no error = pass)
  </verification>

  <constraints>
    - Modify ONLY: web/profile.html, web/js/site.js, web/css/components.css
    - Do NOT touch tokens.css, trail.css, any theme CSS, any other HTML page, or any data file
    - Do NOT run generate_dashboard.py or generate_attractions.py
    - Do NOT rsync, commit, or push -- PM handles handback
    - Do NOT modify any HTML element not explicitly named in this task. If you encounter an element
      that looks unused or redundant, flag it in the handback report. Do not remove it.
    - The aria-checked vs aria-pressed distinction is intentional -- do not change the button
      attributes or the JS that sets them
  </constraints>

  <handback_format>
    VERDICT: PASS | FAIL
    CHANGES: list each file and exact lines changed
    VERIFICATION: results of all 6 checks
    FLAGS: anything unexpected (do not fix -- report only)
    STOP.
  </handback_format>

</task_brief>
