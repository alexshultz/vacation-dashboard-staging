# Task Brief — Admin Overlay Sprint (4 Items)

```xml
<role>
You are a precise, test-aware frontend engineer implementing a pre-approved 4-item
sprint for the Branson 2026 vacation dashboard. The grill-me review is complete and
all design decisions are locked. Proceed to full implementation without seeking
clarification. Every edit is surgical: touch only what is explicitly named.
</role>

<goal>
Ship all four items in one pass:
  1. Add site.js nav injection to admin.html + add NAV_ALIASES entry in site.js
  2. Convert the INITIAL_VISIBLE display from a static span to a type-in input on admin-index.html
  3. Create web/js/admin-overlay.js (new file), hoist renderCard to module scope in
     event-timeline.html, wire edit icons, and append CSS to components.css
  4. Append ADR-010, ADR-011, ADR-012 to docs/DECISIONS.md

All 20 Playwright E2E tests must pass after the run.
</goal>

<static_background>
## Vault root
/Users/alex/vaults/Vacation/Branson 2026/

## CLAUDE.md mandatory rules (never override)
- `<script src="js/site.js"></script>` must be the FIRST child of `<body>` on every page.
- Never copy-paste static `<header class="site-header">` or `<nav class="bottom-tabs">` HTML.
- Pages not in the main nav must be added to `NAV_ALIASES` in site.js.
- Design system is locked: tokens.css + components.css + trail.css. Never use raw
  palette vars (--moss, --lake, --sand, --clay, --dusk) inside components.css.
- `components.css` is shared across all 10 pages. New CSS rules must not break any
  existing component or class defined in that file.
- **FROZEN:** `scripts/generate_dashboard.py` and `scripts/generate_attractions.py`
  must NEVER be run. They overwrite hand-edited files.
- **Do not modify any HTML element not explicitly named in this task.** If you
  encounter an element that looks unused or redundant, flag it in the handback report.
  Do not remove it.
- [hidden] + display:flex pitfall: for any element toggled via JS `.hidden = true`
  that also has `display:flex` in components.css, add an explicit
  `.element[hidden] { display: none; }` companion rule.

## Design-system token reminder
Accent tokens are `--accent-1`, `--accent-2`, `--accent-3` (NOT --accent-sand etc.).
Semantic tokens: `--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-dim`,
`--color-line`, `--status-yes`, `--status-no`, `--warn`, `--radius-btn`, `--radius-card`.

## Playwright tests
Run after completion:
  cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e"
  npx playwright test
20 tests must pass. If any fail, fix before declaring done.

## Pre-push safety checks (run before handback)
  grep -c 'pointerdown' web/quick-pick.html          # must return 1
  grep -c 'fetch.*data\.json' web/attractions.html    # must return >= 1
  grep -c 'fetch.*help\.json' web/help.html           # must return 1
  grep -c 'fetch.*schedule\.json' web/event-timeline.html  # must return >= 1 (or Supabase fetch still present — verify at least one data-load call remains)

## Supabase credentials (used across several files — do not invent new values)
  SUPABASE_URL     = 'https://quebfbvfuwbncpexlylu.supabase.co'
  SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt'
These exact strings already appear in event-timeline.html, admin-index.html, and admin.html.

## Files in scope for this sprint
  web/admin.html               ← Item 1 (add site.js, preload link)
  web/js/site.js               ← Item 1 (add NAV_ALIASES entry)
  web/admin-index.html         ← Item 2 (span→input, .textContent→.value, debounce)
  web/event-timeline.html      ← Item 3A + 3D (hoist, edit btn, overlay script tag)
  web/js/admin-overlay.js      ← Item 3B (NEW FILE)
  web/css/components.css       ← Item 3C (append CSS)
  docs/DECISIONS.md            ← Item 4 (append ADR-010/011/012)

Do NOT touch any other file.
</static_background>

<task>
## ITEM 1 — Add site.js nav to admin.html

### 1a. web/admin.html: add preload link to `<head>`

Currently `<head>` ends with the Supabase CDN script tag (line 22). Insert this line
immediately BEFORE the Supabase CDN `<script>` tag (keep Supabase CDN where it is):

```html
<link rel="preload" href="js/site.js" as="script">
```

### 1b. web/admin.html: add site.js as FIRST child of `<body>`

The `<body>` opening tag is:
```html
<body style="margin:0;background:var(--color-bg);color:var(--color-ink);font-family:var(--font-body,sans-serif);">
```

The very first content inside body is a comment:
```html
  <!-- Header: no nav, no hamburger -->
```

Insert the site.js script tag so it becomes the first child of `<body>`,
BEFORE that comment. Do NOT remove the comment or the static `<header>` below it —
flag them in the handback report per the mandatory constraint.

After edit, the opening of body must read:
```html
<body style="margin:0;background:var(--color-bg);color:var(--color-ink);font-family:var(--font-body,sans-serif);">
<script src="js/site.js"></script>

  <!-- Header: no nav, no hamburger -->
  <header style="background:var(--color-surface);border-bottom:1.5px solid ...
```

Do NOT add a second `<header>` or `<nav>` — site.js injects them.

### 1c. web/js/site.js: add admin.html to NAV_ALIASES

Current NAV_ALIASES block (lines 55–57):
```js
  var NAV_ALIASES = {
    'shows.html': 'attractions.html',
  };
```

Change to:
```js
  var NAV_ALIASES = {
    'shows.html': 'attractions.html',
    'admin.html': null,
  };
```

`null` prevents broken active-link detection. No other change to site.js.

---

## ITEM 2 — INITIAL_VISIBLE type-in on admin-index.html

### 2a. Replace the span with an input

Find (line 72):
```html
    <span id="iv-value" style="font-size:1.1rem;font-weight:600;min-width:2ch;text-align:center;"></span>
```

Replace with:
```html
    <input type="number" id="iv-value" min="1" style="width:3.5rem;text-align:center;font-size:1.2rem;border:1px solid var(--color-line);border-radius:4px;padding:2px 4px;">
```

Do NOT modify the `<button id="iv-minus">` or `<button id="iv-plus">` elements.

### 2b. Change all three .textContent call sites to .value

There are exactly 3 occurrences of `document.getElementById('iv-value').textContent` in
the inline `<script>`. Change each to `.value`:

  Site 1 (in window.onload, after loading from Supabase app_config):
    `document.getElementById('iv-value').textContent = INITIAL_VISIBLE;`
    → `document.getElementById('iv-value').value = INITIAL_VISIBLE;`

  Site 2 (in iv-minus click handler, after decrement):
    `document.getElementById('iv-value').textContent = INITIAL_VISIBLE;`
    → `document.getElementById('iv-value').value = INITIAL_VISIBLE;`

  Site 3 (in iv-plus click handler, after increment):
    `document.getElementById('iv-value').textContent = INITIAL_VISIBLE;`
    → `document.getElementById('iv-value').value = INITIAL_VISIBLE;`

### 2c. Add debounced input listener

After the iv-plus click handler (after its closing `});`), add the following block.
Use `sbAdmin` (the Supabase client already created at line 311 in the same script block):

```js
            let _ivDebounce = null;
            document.getElementById('iv-value').addEventListener('input', () => {
              clearTimeout(_ivDebounce);
              _ivDebounce = setTimeout(async () => {
                const raw = document.getElementById('iv-value').value;
                const parsed = parseInt(raw, 10);
                if (isNaN(parsed) || parsed < 1 || String(parsed) !== String(raw).trim()) return;
                INITIAL_VISIBLE = parsed;
                await sbAdmin.from('app_config').upsert(
                  { key: 'initial_visible', value: String(INITIAL_VISIBLE) },
                  { onConflict: 'key' }
                );
              }, 500);
            });
```

Note on validation: `parseInt` of a float string (e.g. "3.5") strips the decimal,
so the string-equality guard `String(parsed) !== String(raw).trim()` rejects
non-integers. NaN and values < 1 are also silently rejected without upsert.

---

## ITEM 3 — admin-overlay.js + event-timeline.html edit icons

### Sub-step A (PREREQUISITE — complete and verify BEFORE Sub-steps B/C/D)

#### 3A-i. Hoist 6 constants + renderCard from render() to module scope
#### in web/event-timeline.html

Inside `function render()` the following are currently declared (lines 106–119 and 128–167).
They must be moved OUT of `render()` to module (script) scope, declared BEFORE `render()`.

Constants to hoist:
```js
const maxDuration = 6;
const yesStyle = 'color:var(--status-yes);border-color:color-mix(in srgb,var(--status-yes) 35%,var(--color-line))';
const warnStyle = 'color:var(--warn);border-color:color-mix(in srgb,var(--warn) 35%,var(--color-line))';
const noStyle = 'color:var(--status-no);border-color:color-mix(in srgb,var(--status-no) 35%,var(--color-line))';
const nameCell = (n) => `<div class="event-card__name">${n}</div>`;
const noneCell = '<div class="event-card__none">(none)</div>';
```

Arrow function to hoist (currently the `const renderCard = (event) => { … };` block
starting at line 128 and ending at line 167):
```js
const renderCard = (event) => {
    const pct = Math.min((event.duration / maxDuration) * 100, 100);
    return `
        <details class="event-card">
            ...
        </details>
    `;
};
```

After hoisting, `render()` body must:
- No longer declare maxDuration, yesStyle, warnStyle, noStyle, nameCell, noneCell, or renderCard.
- Still declare `dayLabels` locally (it is NOT used by renderCard — do NOT hoist it).
- Still call `renderCard` (now module-scoped) from within the `.map()` call.

#### 3A-ii. Two changes to the renderCard template literal

Change (a) — add `style="position:relative"` to the opening `<details>` tag:

  Before: `<details class="event-card">`
  After:  `<details class="event-card" style="position:relative">`

Change (b) — add edit button as LAST child of `<details>` (immediately before `</details>`):

```html
<button class="admin-edit-btn" data-event-id="${event.id}" aria-label="Edit event" onclick="vacdashOpenEdit(this)">✏️</button>
```

The full closing region of the renderCard template literal must look like:
```
                    </div>
                </details>
            `;
```
becomes:
```
                    </div>
                    <button class="admin-edit-btn" data-event-id="${event.id}" aria-label="Edit event" onclick="vacdashOpenEdit(this)">✏️</button>
                </details>
            `;
```

#### 3A-iii. Expose window._vacdashEvents in loadSchedule()

In `loadSchedule()` there are two places where `eventsData` is assigned:

  Path 1 (Supabase REST, ~line 267):
  ```js
                      eventsData = data;
                      loaded = true;
  ```
  After `eventsData = data;`, insert: `window._vacdashEvents = eventsData;`

  Path 2 (fallback schedule.json, ~line 277):
  ```js
                  eventsData = json.events;
                  loaded = true;
  ```
  After `eventsData = json.events;`, insert: `window._vacdashEvents = eventsData;`

Both paths must set the global so admin-overlay.js can look up events by id.

#### 3A verification
After making all 3A edits, mentally trace: `render()` is called from `loadSchedule()`,
which calls `render()` which uses the now-module-scoped `renderCard`, `maxDuration`,
`yesStyle`, `warnStyle`, `noStyle`, `nameCell`, `noneCell`. No reference to those names
should remain inside `render()`'s function body. `dayLabels` stays inside `render()`.

---

### Sub-step B — Create web/js/admin-overlay.js (NEW FILE)

Create the file `/Users/alex/vaults/Vacation/Branson 2026/web/js/admin-overlay.js`.

The file is a self-contained IIFE. Full specification:

```js
(function () {
  'use strict';

  /* ── Supabase credentials (same values as event-timeline.html) ─────────── */
  var SUPABASE_URL      = 'https://quebfbvfuwbncpexlylu.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';

  /* ── Supabase client ───────────────────────────────────────────────────── */
  // window.supabase is the Supabase JS SDK loaded from CDN before this script.
  var _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ── Module state ──────────────────────────────────────────────────────── */
  var _editingId = null;

  /* ── Inject sign-out badge (synchronously on script load) ─────────────── */
  // Injected before session resolves; hidden by default via CSS.
  var _badge = document.createElement('div');
  _badge.id = 'vacdash-admin-badge';
  _badge.setAttribute('style',
    'display:none;position:fixed;top:12px;right:12px;z-index:500;' +
    'background:var(--warn,#e67e22);color:#fff;padding:6px 12px;' +
    'border-radius:var(--radius-btn,6px);font-size:13px;cursor:pointer;font-weight:600;'
  );
  _badge.textContent = '🔒 Admin — Sign Out';
  _badge.addEventListener('click', function () {
    _sb.auth.signOut().then(function () { location.reload(); });
  });
  document.body.appendChild(_badge);

  /* ── Inject edit modal (synchronously on script load) ──────────────────── */
  var _modalEl = document.createElement('div');
  _modalEl.id = 'vacdash-edit-modal';
  _modalEl.setAttribute('style',
    'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);' +
    'z-index:1000;align-items:center;justify-content:center;'
  );
  _modalEl.innerHTML = [
    '<div style="background:var(--color-surface);border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-card,12px);padding:24px 20px;max-width:460px;',
    'width:calc(100% - 32px);max-height:90vh;overflow-y:auto;">',
    '<h2 style="font-family:var(--font-display);font-weight:800;font-size:18px;',
    'margin:0 0 16px;">Edit Event</h2>',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Title</label>',
    '<input id="vacdash-edit-title" type="text" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;margin-bottom:12px;">',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Date</label>',
    '<input id="vacdash-edit-date" type="date" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;margin-bottom:12px;">',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Start Time</label>',
    '<input id="vacdash-edit-startTime" type="time" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;margin-bottom:12px;">',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Duration (hours)</label>',
    '<input id="vacdash-edit-duration" type="number" step="0.25" min="0.25" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;margin-bottom:12px;">',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Priority</label>',
    '<select id="vacdash-edit-priority" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;margin-bottom:12px;">',
    '<option value="low">Low</option>',
    '<option value="medium">Medium</option>',
    '<option value="high">High</option>',
    '</select>',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Catalog Ref</label>',
    '<input id="vacdash-edit-catalogRef" type="text" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;margin-bottom:12px;">',

    '<label style="display:block;font-size:12px;font-weight:700;',
    'text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);',
    'margin-bottom:4px;">Interested (comma-sep)</label>',
    '<textarea id="vacdash-edit-interested" ',
    'style="width:100%;padding:8px 10px;border:1.5px solid var(--color-line);',
    'border-radius:var(--radius-btn,6px);background:var(--color-bg);',
    'color:var(--color-ink);font-size:14px;box-sizing:border-box;',
    'min-height:60px;resize:vertical;margin-bottom:12px;"></textarea>',

    '<div id="vacdash-edit-error" style="display:none;color:#c0392b;',
    'font-size:13px;margin-bottom:10px;"></div>',

    '<div style="display:flex;gap:10px;margin-bottom:12px;">',
    '<button id="vacdash-edit-save" ',
    'style="flex:1;padding:10px;border-radius:var(--radius-btn,6px);',
    'background:var(--status-yes,#27ae60);color:#fff;border:none;',
    'font-family:var(--font-display);font-weight:700;font-size:14px;cursor:pointer;">',
    'Save</button>',
    '<button id="vacdash-edit-cancel" ',
    'style="flex:1;padding:10px;border-radius:var(--radius-btn,6px);',
    'background:var(--color-bg);border:1.5px solid var(--color-line);',
    'font-family:var(--font-display);font-weight:700;font-size:14px;cursor:pointer;',
    'color:var(--color-ink);">Cancel</button>',
    '</div>',

    '<a href="admin-event-timeline.html" ',
    'style="font-size:13px;color:var(--color-ink-dim);text-decoration:none;">',
    'Full edit in Admin →</a>',

    '</div>'
  ].join('');
  document.body.appendChild(_modalEl);

  /* ── Admin state functions ─────────────────────────────────────────────── */
  function _activateAdmin() {
    document.body.classList.add('is-admin');
    document.getElementById('vacdash-admin-badge').style.display = 'block';
  }

  function _deactivateAdmin() {
    document.body.classList.remove('is-admin');
    document.getElementById('vacdash-admin-badge').style.display = 'none';
  }

  /* ── Auth subscription ─────────────────────────────────────────────────── */
  _sb.auth.onAuthStateChange(function (event, session) {
    if (session) { _activateAdmin(); } else { _deactivateAdmin(); }
  });

  /* ── Save handler ──────────────────────────────────────────────────────── */
  document.getElementById('vacdash-edit-save').addEventListener('click', async function () {
    var errEl = document.getElementById('vacdash-edit-error');
    errEl.style.display = 'none';

    var title      = document.getElementById('vacdash-edit-title').value.trim();
    var date       = document.getElementById('vacdash-edit-date').value;
    var startTime  = document.getElementById('vacdash-edit-startTime').value;
    var durationRaw = document.getElementById('vacdash-edit-duration').value;
    var priority   = document.getElementById('vacdash-edit-priority').value;
    var catalogRef = document.getElementById('vacdash-edit-catalogRef').value.trim();
    var interestedRaw = document.getElementById('vacdash-edit-interested').value;

    // Validation
    if (!title) { errEl.textContent = 'Title is required.'; errEl.style.display = 'block'; return; }
    if (!date)  { errEl.textContent = 'Date is required.';  errEl.style.display = 'block'; return; }
    var duration = parseFloat(durationRaw);   // parseFloat, NOT parseInt per spec
    if (isNaN(duration) || duration < 0.25) {
      errEl.textContent = 'Duration must be a number ≥ 0.25.';
      errEl.style.display = 'block';
      return;
    }

    // Parse interested from comma-separated string to array
    var interested = interestedRaw
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    var _saveBtn = document.getElementById('vacdash-edit-save');
    _saveBtn.disabled = true;
    _saveBtn.textContent = 'Saving…';

    var payload = {
      id: _editingId,
      title: title,
      date: date,
      startTime: startTime,
      duration: duration,
      priority: priority,
      catalogRef: catalogRef,
      interested: interested
    };

    var result = await _sb.from('schedule_events').upsert(payload);
    _saveBtn.disabled = false;
    _saveBtn.textContent = 'Save';

    if (result.error) {
      errEl.textContent = 'Save failed: ' + result.error.message;
      errEl.style.display = 'block';
      return;
    }

    // Close modal and reload page (V1 approach; renderCard() in-place deferred to V2)
    _modalEl.style.display = 'none';
    location.reload();
  });

  /* ── Cancel handler ────────────────────────────────────────────────────── */
  document.getElementById('vacdash-edit-cancel').addEventListener('click', function () {
    _modalEl.style.display = 'none';
  });

  /* ── Public API ────────────────────────────────────────────────────────── */
  window._vacdashEvents = window._vacdashEvents || [];

  window.vacdashOpenEdit = function (btn) {
    var eventId = btn.dataset.eventId;
    var events  = window._vacdashEvents || [];
    var event   = null;
    for (var i = 0; i < events.length; i++) {
      if (String(events[i].id) === String(eventId)) { event = events[i]; break; }
    }

    _editingId = eventId;

    // Populate form (gracefully handle missing fields with empty string)
    document.getElementById('vacdash-edit-title').value      = event ? (event.title      || '') : '';
    document.getElementById('vacdash-edit-date').value       = event ? (event.date       || '') : '';
    document.getElementById('vacdash-edit-startTime').value  = event ? (event.startTime  || '') : '';
    document.getElementById('vacdash-edit-duration').value   = event ? (event.duration   != null ? event.duration : '') : '';
    document.getElementById('vacdash-edit-priority').value   = event ? (event.priority   || 'medium') : 'medium';
    document.getElementById('vacdash-edit-catalogRef').value = event ? (event.catalogRef || '') : '';
    document.getElementById('vacdash-edit-interested').value =
      event && Array.isArray(event.interested) ? event.interested.join(', ') : '';

    document.getElementById('vacdash-edit-error').style.display = 'none';
    _modalEl.style.display = 'flex';
  };

})();
```

Exact file path: `web/js/admin-overlay.js`

---

### Sub-step C — Append CSS to web/css/components.css

Append the following block at the very end of the file (after the closing `}` of the
`@media (max-width: 719px)` block at current line 1162):

```css

/* Admin overlay -- session-gated edit controls */
.admin-edit-btn {
  display: none;
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px;
  line-height: 1;
}
.admin-edit-btn[hidden] { display: none; }
body.is-admin .admin-edit-btn { display: inline-flex; }
#vacdash-admin-badge { display: none; }
body.is-admin #vacdash-admin-badge { display: block; }
```

No other change to components.css. These selectors are additive and scoped to
`.admin-edit-btn` and `#vacdash-admin-badge` — they must not affect any existing rule.

---

### Sub-step D — Add admin-overlay.js script tag to web/event-timeline.html

Add `<script src="js/admin-overlay.js"></script>` immediately before the closing
`</body>` tag (which is currently at line 235).

The Supabase JS SDK CDN tag is already at line 16 (`<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`).
Do NOT add it again. admin-overlay.js assumes `window.supabase` is already available.

After edit, the bottom of event-timeline.html must look like:
```html
    </script>
</main>

<script src="js/admin-overlay.js"></script>
</body>
</html>
```

---

## ITEM 4 — Append ADR entries to docs/DECISIONS.md

Read `docs/DECISIONS.md` first to confirm the current ADR format. The last entry is
ADR-009. Append three new entries, separated by `---`, matching the format of existing
entries. Use today's date (2026-05-01) for all three.

### ADR-010

```markdown
## ADR-010 · Supabase session as conditional admin display gate on family pages (2026-05-01)

**Decision:** `supabase.auth.onAuthStateChange()` in `web/js/admin-overlay.js` toggles
the `body.is-admin` CSS class on family-facing pages. Edit controls are hidden by
default (fail-closed) and revealed only when a confirmed Supabase session exists.

**Rationale:** Display-conditional gating on a single shared page is preferred over
maintaining a full-page clone per admin feature. Long-term, one file to maintain;
short-term, zero risk to family users who are never authenticated.

**Consequences:**
- Any family page that wants admin controls: add `<script src="js/admin-overlay.js">`,
  expose `window._vacdashEvents`, and emit `.admin-edit-btn` buttons with `data-event-id`.
- Buttons are invisible to unauthenticated visitors — no CSS specificity war needed.
- Fail-open risk is eliminated: default CSS is `display:none` at the rule level.

---
```

### ADR-011

```markdown
## ADR-011 · admin-overlay.js as canonical reusable admin-edit-in-place module (2026-05-01)

**Decision:** `web/js/admin-overlay.js` is the single reusable module for session-gated
inline editing on family pages. It owns: auth state subscription, sign-out badge, edit
modal injection, and `window.vacdashOpenEdit`.

**Contract for adopting pages:**
1. Load Supabase JS SDK CDN before this script.
2. Add `<script src="js/admin-overlay.js"></script>` before `</body>`.
3. Populate `window._vacdashEvents` with the page's loaded events array.
4. Emit `.admin-edit-btn` buttons with `data-event-id="${event.id}"` and
   `onclick="vacdashOpenEdit(this)"` inside `<details class="event-card">` elements.

**Scope limitation:** This module is an authoring idiom for schedule-event pages only.
It is NOT a universal drop-in for pages with different data shapes (attractions, picks,
etc.). Those pages would require their own overlay module with a different schema.

---
```

### ADR-012

```markdown
## ADR-012 · Q14a deferred — dual admin gate acknowledged as interim inconsistency (2026-05-01)

**Decision:** Two separate admin gates co-exist as of this sprint and are intentional:
1. `site.js` nav shows the Admin link based on a `localStorage` `vacdash:v1:user` name
   check against `ADMIN_USERS`.
2. `admin-overlay.js` edit icons are gated on a live Supabase session via
   `onAuthStateChange`.

**Why intentional:** Unifying these gates (Q14a) requires either making the nav gate
async (flash-of-wrong-nav risk) or making the edit-icon gate localStorage-only (weaker
security, no server confirmation). Neither tradeoff is acceptable pre-launch.

**Consequences:**
- A family member named Alex will see the Admin nav link but NOT the edit icons (they
  have no Supabase session). This is acceptable — the Admin link leads to an auth wall.
- Alex-with-session will see both the nav link and the edit icons. Correct.
- Resolution deferred to post-launch cleanup sprint.

---
```
</task>

<analysis_order>
Execute in this exact order. Do not skip steps or reorder.

1. **Read web/admin.html** — confirm the exact body opening tag text and that site.js
   is NOT yet present. Note the static `<header>` comment at the top of body.

2. **Read web/js/site.js lines 54–57** — confirm NAV_ALIASES contains only
   `'shows.html': 'attractions.html'` and that `admin.html` is absent.

3. **Apply Item 1** (admin.html preload + script tag, site.js NAV_ALIASES).
   Verify: site.js is first child of body; NAV_ALIASES has both entries.

4. **Read web/admin-index.html lines 70–75** — confirm `<span id="iv-value">` is
   still a span (not yet an input). Confirm the 3 `.textContent` call sites at
   approximately lines 309, 316, 325.

5. **Apply Item 2** (span→input, 3 × .textContent→.value, debounced listener).

6. **Read web/event-timeline.html** — confirm:
   - `renderCard` is currently a `const` INSIDE `function render()` (~line 128)
   - `maxDuration`, `yesStyle`, `warnStyle`, `noStyle`, `nameCell`, `noneCell` are
     declared inside `render()` and before `renderCard`
   - `dayLabels` is also inside `render()` and is NOT used by `renderCard`
   - `loadSchedule()` has two `eventsData =` assignment sites
   - `window._vacdashEvents` is NOT yet set anywhere

7. **Apply Item 3 Sub-step A** (hoist constants + renderCard, add position:relative,
   add edit button, add window._vacdashEvents assignments). Verify after edit:
   - `maxDuration`, `yesStyle`, `warnStyle`, `noStyle`, `nameCell`, `noneCell`,
     `renderCard` are all declared at script/module scope BEFORE `render()`.
   - `render()` body no longer contains any of those declarations.
   - `dayLabels` remains inside `render()`.
   - `<details class="event-card" style="position:relative">` appears in renderCard.
   - `.admin-edit-btn` button with `data-event-id` is last child before `</details>`.
   - Both `eventsData =` sites are followed by `window._vacdashEvents = eventsData;`.

8. **Create web/js/admin-overlay.js** (Item 3 Sub-step B). Verify file exists and is
   a well-formed IIFE with no syntax errors. Confirm `window.vacdashOpenEdit` and
   `window._vacdashEvents` initialization are both present.

9. **Read web/css/components.css — last 10 lines** to confirm current end of file,
   then **append Item 3 Sub-step C CSS**.

10. **Apply Item 3 Sub-step D** — add `<script src="js/admin-overlay.js"></script>`
    before `</body>` in event-timeline.html. Verify Supabase CDN tag is NOT duplicated.

11. **Read docs/DECISIONS.md** — confirm last entry is ADR-009, note exact heading
    format and separator style (`---`). Then **append ADR-010, ADR-011, ADR-012**.

12. **Run pre-push safety checks:**
    ```bash
    grep -c 'pointerdown' web/quick-pick.html
    grep -c 'fetch.*data\.json' web/attractions.html
    grep -c 'fetch.*help\.json' web/help.html
    ```
    All must return the expected values. If any return 0, STOP — you have touched a
    file you should not have, or a safety-check file was affected as a side effect.

13. **Run Playwright tests:**
    ```bash
    cd "/Users/alex/vaults/Vacation/Branson 2026/tests/e2e"
    npx playwright test
    ```
    All 20 tests must pass. Fix any failures before declaring done.
</analysis_order>

<hallucination_guard>
## What NOT to do — read these before writing any code

1. **Do NOT remove the existing static `<header>` from admin.html.** The mandatory
   constraint prohibits removing unnamed elements. Flag it in the handback report.

2. **Do NOT add a second Supabase CDN `<script>` tag to event-timeline.html.**
   It is already at line 16. admin-overlay.js assumes `window.supabase` is loaded.

3. **Do NOT hoist `dayLabels` out of `render()`.** It is only used in the outer
   `.map()` inside `render()`, not by `renderCard`. Only hoist the 6 named constants
   and `renderCard`.

4. **Do NOT use `parseInt` for the duration validation in the save handler.**
   The spec explicitly requires `parseFloat`. Using parseInt would silently accept
   "1.5" as 1, corrupting the data.

5. **Do NOT modify admin-index.html's existing Supabase upsert logic** in the minus/
   plus handlers (lines 317–320 and 326–329). Only add the debounced input listener
   after the iv-plus handler block. The minus/plus handlers already upsert correctly.

6. **Do NOT use raw palette tokens (`--moss`, `--sand`, etc.) in any CSS you write.**
   Use only semantic tokens (`--color-line`, `--color-bg`, `--status-yes`, `--warn`,
   `--radius-btn`, `--radius-card`, etc.).

7. **Do NOT add `admin.html` to `NAV_LINKS` or `BOTTOM_TABS` in site.js.** The admin
   link is already conditionally shown in the hamburger/desktop nav by existing
   ADMIN_USERS logic. Only add the NAV_ALIASES entry.

8. **Do NOT touch any HTML element in any file that is not explicitly named in the
   task.** If something looks wrong or unused (like admin.html's static header),
   flag it in the handback report — never silently fix it.

9. **Do NOT add a `<link rel="preload" href="js/site.js" as="script">` to
   event-timeline.html.** It already has one (line 12). Only add it to admin.html.

10. **Do NOT use `textContent` for the iv-value element after Item 2.** All three
    sites must be changed to `.value`. Leaving even one as `.textContent` means the
    displayed value will not update correctly on an `<input>`.

11. **Do NOT invent new ADR numbers or dates.** Use ADR-010, ADR-011, ADR-012
    exactly. Use date 2026-05-01.

12. **Do NOT run `generate_dashboard.py` or `generate_attractions.py`.** They are
    frozen and will destroy hand-edited files.
</hallucination_guard>

<output_format>
Produce actual file edits (not a plan, not pseudocode). After all edits:

1. Print a **COMPLETED ITEMS** checklist confirming each numbered sub-step is done.
2. Print the **Playwright test result** (pass count / fail count).
3. Print the **pre-push safety check outputs** (4 grep counts).
4. Include a **FLAGGED ITEMS** section listing any elements encountered but not
   modified per the mandatory constraint (e.g., the static `<header>` in admin.html).
5. Include the standard handback clause below.
</output_format>

<handback>
## Handback

When all items are complete and all 20 Playwright tests pass:

1. Confirm the completed-items checklist (all items checked).
2. State the Playwright result: "20/20 tests pass" or list failures.
3. State pre-push safety check outputs.
4. List any flagged-but-not-modified elements.
5. Note any deviation from this brief (none expected — grill-me is complete).

This task is self-contained. No follow-up clarification pass is needed.
The brief file lives at: `.claude/admin-overlay-sprint-task.md`
</handback>
```
