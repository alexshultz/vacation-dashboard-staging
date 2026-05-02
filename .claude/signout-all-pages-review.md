You are a cold code reviewer. You have NO knowledge of what the implementer intended. Your only input is the diff below and the project context. Review the changes for correctness, safety, and completeness.

## Project Context

- Branson 2026 static dashboard (GitHub Pages). All pages load `web/js/site.js` synchronously as first body script.
- `web/js/admin-overlay.js` is dynamically injected by site.js. It bails early with `if (!window.supabase) { return; }` if the Supabase SDK is not present.
- `web/admin.html` is the admin hub page with its own Supabase client (`supabaseClient`).
- The `#vacdash-signout-btn` is the canonical Sign Out button, injected into the site header by admin-overlay.js.
- Frozen files (never touch): `generate_dashboard.py`, `generate_attractions.py`.
- Design system locked: `tokens.css`, `components.css`, `trail.css`.

## Diff

### web/js/site.js (single block change)

BEFORE (lines 249-263):
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

AFTER:
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

### web/admin.html (two removals)

REMOVED HTML (was inside #admin-hub-nav alongside Edit Schedule / Edit Home View):
```html
      <button id="signout-btn"
        style="padding:14px 22px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:15px;cursor:pointer;color:var(--color-ink);">
        Sign Out
      </button>
```

REMOVED JS (was in DOMContentLoaded handler):
```js
      // Sign-out button
      document.getElementById('signout-btn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        location.reload();
      });
```

## Review Checklist

1. **Correctness** -- Does the site.js change correctly ensure Supabase CDN executes before admin-overlay.js? Is `.async = false` set on BOTH scripts? Is the `!window.supabase` guard placed correctly (before sbScript creation)?

2. **No double-load risk** -- On pages that already have the Supabase CDN as a parser-blocking `<script>` in `<head>` (index.html, event-timeline.html, admin.html, admin-event-timeline.html, admin-index.html): does the guard prevent a second CDN load?

3. **admin.html integrity** -- Is the `#signout-btn` handler removal safe? Is `supabaseClient` still used elsewhere in admin.html, so removing only the signout handler doesn't break other functionality? Is there now a dangling reference to `signout-btn` anywhere remaining in the file?

4. **Scope discipline** -- Were any files outside web/js/site.js and web/admin.html modified? Were any elements outside the specified blocks touched?

5. **Regression risk** -- Does anything in this diff risk breaking the 24 passing Playwright tests?

## Output Format

Verdict: PASS | FAIL | WARN

For each checklist item, one line: [PASS|FAIL|WARN] -- brief reason.

If FAIL: describe exactly what is wrong and what the fix should be.
If WARN: describe the concern and whether it requires action before deploy.
If PASS overall: confirm it is safe to commit and deploy to staging.
