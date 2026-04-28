<task_brief>

  <role>
    You are lazlo -- a precise front-end engineer working on the Branson '26 family vacation dashboard.
    This is a targeted single-file change to web/js/site.js only.
  </role>

  <goal>
    Add a Profile link to the desktop header nav so it appears when the full nav bar is visible
    (not just inside the hamburger panel). The profile link must carry the nudge dot badge and
    must work correctly with the existing syncBadge() function.
  </goal>

  <context>
    Vault: /Users/alex/vaults/Vacation/Branson 2026/
    File to edit: web/js/site.js (326 lines -- read it fully before starting)

    How the nav currently works:
    - buildHeader() renders: logo | NAV_LINKS as .nav-link anchors | hamburger button
    - buildHamburgerPanel() renders: NAV_LINKS as .hamburger-link anchors | hr | Appearance toggle | Profile link
    - Profile link in hamburger panel: id="profile-btn", class="hamburger-link", has nudge dot span
    - When body.nav-fits: .site-nav shows, .hamburger-btn hides, bottom-tabs hide
    - When NOT body.nav-fits: .site-nav hides, hamburger shows

    The bug: when the full desktop nav is visible, Profile is completely absent because it is
    only in the hamburger panel (which is hidden). Users cannot reach Profile from the desktop bar.

    syncBadge() uses getElementById('profile-btn') -- finds exactly ONE element.
    Having two elements with the same id is invalid HTML and will break getElementById behavior.
  </context>

  <implementation>
    Make these targeted changes to web/js/site.js:

    1. MODIFY buildHeader() -- add a profile link at the right end of the <nav class="site-nav">,
       AFTER all NAV_LINKS and BEFORE the closing </nav>. Use:
         <a href="profile.html" id="profile-btn-nav" class="nav-link" aria-label="Profile">
           👤 Profile<span class="profile-nudge-dot" aria-hidden="true"></span>
         </a>
       Add aria-current="page" if isProfile is true (same pattern as the hamburger panel version).

    2. MODIFY buildHamburgerPanel() -- change the profile link's id from "profile-btn" to
       "profile-btn-hamburger". Keep everything else on that element identical.

    3. MODIFY syncBadge() -- replace getElementById('profile-btn') with
       querySelectorAll('#profile-btn-nav, #profile-btn-hamburger') and apply the data-unset
       attribute to ALL found elements:
         var btns = document.querySelectorAll('#profile-btn-nav, #profile-btn-hamburger');
         var u = '';
         try { u = localStorage.getItem(USER_KEY) || ''; } catch (e) {}
         btns.forEach(function(btn) { btn.setAttribute('data-unset', u ? 'false' : 'true'); });
       Remove the early return guard (if (!btn) return) -- btns.forEach handles empty NodeList safely.

    No other changes. Do not touch the Appearance toggle, NAV_LINKS array, CSS, or any other file.
    Do not modify any HTML element not explicitly named in this task. If you encounter an element
    that looks unused or redundant, flag it in the handback report. Do not remove it.
  </implementation>

  <verification>
    After changes:
    1. Confirm id="profile-btn" does NOT appear anywhere in site.js (grep check)
    2. Confirm id="profile-btn-nav" appears exactly once in buildHeader()
    3. Confirm id="profile-btn-hamburger" appears exactly once in buildHamburgerPanel()
    4. Confirm querySelectorAll('#profile-btn-nav, #profile-btn-hamburger') appears in syncBadge()
    5. Run: node --input-type=module < web/js/site.js 2>&1 || node -e "require('fs').readFileSync('web/js/site.js','utf8')" -- to check for JS syntax errors
  </verification>

  <constraints>
    - Modify ONLY web/js/site.js
    - Do NOT run generate_dashboard.py or generate_attractions.py
    - Do NOT rsync, commit, or push -- PM handles handback
    - Do NOT add new CSS files or modify components.css, tokens.css, or any theme CSS
    - .profile-nudge-dot CSS already exists -- do not re-add it
    - Loud errors over silent fallbacks
  </constraints>

  <handback_format>
    VERDICT: PASS | FAIL
    CHANGES: list each function modified and exactly what changed
    VERIFICATION: results of each check above
    FLAGS: anything that looked wrong or unexpected (do not fix -- just report)
    STOP.
  </handback_format>

</task_brief>
