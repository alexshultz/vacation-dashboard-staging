# Task Brief: Add Admin INITIAL_VISIBLE Control to index.html

_Generated from live file reads. All line numbers verified._

---

```xml
<brief>

<role>
You are a precise frontend developer working on the Branson '26 vacation dashboard.
You make only the changes explicitly named in this brief. You read files before
editing them. You do not remove or reorganize untouched code. When you encounter
an element that looks unused or redundant, you flag it in the handback report
rather than deleting it.
</role>

<background>
Vault root: /Users/alex/vaults/Vacation/Branson 2026/

The project is a static-ish vacation dashboard backed by Supabase. The home page
(web/index.html) shows a paginated list of schedule events. An INITIAL_VISIBLE
variable controls how many events are shown before a "Show All" button appears.
Currently only admins on admin-index.html can adjust that value. This task adds
the same control directly to index.html, gated behind the session-injected
body.is-admin class (set by js/admin-overlay.js, which is not yet loaded on
this page).

FILES TOUCHED BY THIS TASK (exactly two):
  web/index.html
  web/css/components.css

DO NOT TOUCH:
  web/admin-index.html  (reference only — do not modify)
  Any other file

GENERATOR FREEZE (from CLAUDE.md):
  Do NOT run generate_dashboard.py or generate_attractions.py under any
  circumstances.

PLAYWRIGHT TEST GATE:
  cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
  All 20 tests must pass before considering the task complete.
</background>

<task>
## CHANGE 1 — Load admin-overlay.js on index.html

In web/index.html, add the following script tag immediately before `&lt;/body&gt;`
(currently line 315):

  &lt;script src="js/admin-overlay.js"&gt;&lt;/script&gt;

Insertion point: between `&lt;/main&gt;` (line 314) and `&lt;/body&gt;` (line 315).

CONSTRAINT: Do NOT add a second Supabase CDN script tag. The CDN is already
loaded on line 17:
  &lt;script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"&gt;&lt;/script&gt;

---

## CHANGE 2a — Insert #vacdash-iv-bar HTML

In web/index.html, insert the following div immediately before `&lt;/main&gt;`
(currently line 314, which becomes line 315 after the script tag is added — insert
the div BEFORE the admin-overlay script tag, i.e. before the current line 314
`&lt;/main&gt;`):

  &lt;div id="vacdash-iv-bar"&gt;
    &lt;button id="vacdash-iv-minus" type="button"&gt;−&lt;/button&gt;
    &lt;input id="vacdash-iv-input" type="number" min="1" /&gt;
    &lt;button id="vacdash-iv-plus" type="button"&gt;+&lt;/button&gt;
    &lt;span&gt;Visible on load&lt;/span&gt;
  &lt;/div&gt;

The bar is visually fixed-position (bottom: 64px, centered) — positioning is
applied via the CSS in Change 2b, not inline styles.

Element IDs used (must match exactly — no variations):
  vacdash-iv-bar     (the container div)
  vacdash-iv-minus   (the decrement button)
  vacdash-iv-input   (the number input — NOT "iv-value")
  vacdash-iv-plus    (the increment button)

---

## CHANGE 2b — Append CSS to components.css

Append the following two rules at the END of web/css/components.css (currently
1180 lines; the current last line is `body.is-admin #vacdash-admin-badge
{ display: block; }`):

  /* ===== Admin INITIAL_VISIBLE bar ===== */
  #vacdash-iv-bar {
    display: none;
    position: fixed;
    bottom: 64px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--color-surface);
    border: 1.5px solid var(--color-line);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-2);
    z-index: 300;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
  }
  body.is-admin #vacdash-iv-bar { display: flex; }

NOTE on the hidden/flex pitfall (from CLAUDE.md): The bar is hidden via
`display: none` on the rule for `#vacdash-iv-bar` itself, shown via
`body.is-admin #vacdash-iv-bar { display: flex; }`. It does NOT use the HTML
`hidden` attribute, so the UA `[hidden]{display:none}` override pitfall does
not apply here. Do not add a `[hidden]` companion rule for this element.

---

## CHANGE 2c — Add JS to index.html's existing script block

The existing `&lt;script&gt;` block opens at line 89 and closes at line 313
(`&lt;/script&gt;`). All JS additions go INSIDE this block. Three insertion points:

### Insertion point A — sync input after config fetch

LOCATION: After line 295 (`} catch (e) {}`) — i.e., after the entire try/catch
that fetches app_config, which conditionally sets INITIAL_VISIBLE on line 292:
  `if (!isNaN(parsed)) INITIAL_VISIBLE = parsed;`

INSERT (one line):
  document.getElementById('vacdash-iv-input').value = INITIAL_VISIBLE;

Context for fuzzy matching (lines 291–297):
  ```
                      const parsed = parseInt(cfgArr[0].value, 10);
                      if (!isNaN(parsed)) INITIAL_VISIBLE = parsed;
                  }
              }
          } catch (e) {}
                                        ← INSERT HERE
          const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  ```

### Insertion point B — sync input in Realtime handler

LOCATION: After line 304 (`INITIAL_VISIBLE = newVal`) inside the
postgres_changes callback (lines 299–308).

Current Realtime block (lines 299–308):
  ```
          supabase
            .channel('app_config_changes')
            .on('postgres_changes', { event: '*', schema: 'public',
                table: 'app_config', filter: 'key=eq.initial_visible' },
                (payload) => {
              const newVal = parseInt(payload.new?.value, 10)
              if (!isNaN(newVal)) {
                INITIAL_VISIBLE = newVal
                applyVisibilityState(showingAll);   // line 305 — existing
              }
            })
            .subscribe()
  ```

INSERT after line 304 (`INITIAL_VISIBLE = newVal`), before the existing
`applyVisibilityState(showingAll)` call on line 305:
  document.getElementById('vacdash-iv-input').value = INITIAL_VISIBLE;

Result of the inner block:
  ```
              if (!isNaN(newVal)) {
                INITIAL_VISIBLE = newVal
                document.getElementById('vacdash-iv-input').value = INITIAL_VISIBLE;
                applyVisibilityState(showingAll);
              }
  ```

### Insertion point C — wire up -/+/input button handlers

LOCATION: After the Realtime `.subscribe()` call (line 308) and before
`await loadSchedule()` (line 310). This is after the `supabase` variable has
been declared (line 297), so it is in scope.

The `supabase` variable in index.html (line 297) is:
  `const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`

Do NOT create a second createClient call. Reuse the existing `supabase` variable.

INSERT the following block between `.subscribe()` (line 308) and
`await loadSchedule()` (line 310):

  ```javascript
  // Admin INITIAL_VISIBLE controls (visible only when body.is-admin)
  document.getElementById('vacdash-iv-minus').addEventListener('click', async () => {
    if (INITIAL_VISIBLE <= 1) return;
    INITIAL_VISIBLE -= 1;
    document.getElementById('vacdash-iv-input').value = INITIAL_VISIBLE;
    await supabase.from('app_config').upsert(
      { key: 'initial_visible', value: String(INITIAL_VISIBLE) },
      { onConflict: 'key' }
    );
    applyVisibilityState(false);
  });

  document.getElementById('vacdash-iv-plus').addEventListener('click', async () => {
    INITIAL_VISIBLE += 1;
    document.getElementById('vacdash-iv-input').value = INITIAL_VISIBLE;
    await supabase.from('app_config').upsert(
      { key: 'initial_visible', value: String(INITIAL_VISIBLE) },
      { onConflict: 'key' }
    );
    applyVisibilityState(false);
  });

  let _ivDebounce = null;
  document.getElementById('vacdash-iv-input').addEventListener('input', () => {
    clearTimeout(_ivDebounce);
    _ivDebounce = setTimeout(async () => {
      const raw = document.getElementById('vacdash-iv-input').value;
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed) || parsed < 1 || String(parsed) !== String(raw).trim()) return;
      INITIAL_VISIBLE = parsed;
      await supabase.from('app_config').upsert(
        { key: 'initial_visible', value: String(INITIAL_VISIBLE) },
        { onConflict: 'key' }
      );
      applyVisibilityState(false);
    }, 500);
  });
  ```

Context for fuzzy matching (lines 308–310):
  ```
            .subscribe()
                         ← INSERT BLOCK HERE
          await loadSchedule();
  ```

UPSERT PATTERN confirmed from admin-index.html (lines 317–320):
  `await sbAdmin.from('app_config').upsert(`
  `  { key: 'initial_visible', value: String(INITIAL_VISIBLE) },`
  `  { onConflict: 'key' }`
  `);`
  In index.html, the variable is named `supabase` not `sbAdmin`.

FUNCTION NAME confirmed from index.html line 109:
  `function applyVisibilityState(showAll) {`
  Use `applyVisibilityState(false)` in the button handlers (not `showingAll`).
  The Realtime handler already uses `applyVisibilityState(showingAll)` on line
  305 — that line is NOT changed by this task.
</task>

<order_of_analysis>
1. Read web/index.html in full before editing anything.
   Confirm: function name `applyVisibilityState` at line 109, supabase client
   variable name `supabase` at line 297, `</body>` at line 315, script block
   closes at line 313.

2. Read web/css/components.css to confirm current last line (1180:
   `body.is-admin #vacdash-admin-badge { display: block; }`).

3. Read web/admin-index.html lines 295–366 to confirm SDK upsert pattern and
   understand what id names are already in use there (`iv-value`, `iv-minus`,
   `iv-plus` — do NOT use those names in index.html).

4. Apply changes in this order:
   a. Append CSS rules to components.css (Change 2b — safe, append-only)
   b. Insert #vacdash-iv-bar HTML in index.html (Change 2a)
   c. Insert JS at three points in index.html (Change 2c — A, B, C)
   d. Add admin-overlay.js script tag in index.html (Change 1)

5. Re-read the modified sections of both files to verify correctness before
   running tests.

6. Run Playwright:
   cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
   All 20 tests must pass.
</order_of_analysis>

<hallucination_guard>
VERIFIED FROM LIVE FILE READS — DO NOT DEVIATE:

index.html confirmed facts:
  Line 17:  &lt;script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"&gt;&lt;/script&gt;
            → Supabase CDN is ALREADY LOADED. Do not add another.
  Line 67:  &lt;script src="js/site.js"&gt;&lt;/script&gt;
  Line 87:  &lt;div id="events-list"&gt;&lt;/div&gt;
  Line 89:  &lt;script&gt;  ← existing script block opens here
  Line 90:  let INITIAL_VISIBLE = 5;
  Line 109: function applyVisibilityState(showAll) {  ← CONFIRMED function name
  Line 210: applyVisibilityState(false);  ← call inside render()
  Line 241: const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
  Line 242: const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
  Line 282: window.onload = async () => {
  Line 291: const parsed = parseInt(cfgArr[0].value, 10);
  Line 292: if (!isNaN(parsed)) INITIAL_VISIBLE = parsed;
  Line 295: } catch (e) {}
  Line 297: const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
            → Variable is named `supabase` (not `sbAdmin`). Reuse it.
  Line 302: const newVal = parseInt(payload.new?.value, 10)
  Line 304: INITIAL_VISIBLE = newVal
  Line 305: applyVisibilityState(showingAll);  ← existing line; do not remove
  Line 308: .subscribe()
  Line 310: await loadSchedule();
  Line 312: };
  Line 313: &lt;/script&gt;
  Line 314: &lt;/main&gt;
  Line 315: &lt;/body&gt;
  Line 316: &lt;/html&gt;
  Total lines: 316

components.css confirmed facts:
  Total lines: 1180
  Line 1164: /* Admin overlay -- session-gated edit controls */
  Line 1165: .admin-edit-btn {
  Line 1178: body.is-admin .admin-edit-btn { display: inline-flex; }
  Line 1179: #vacdash-admin-badge { display: none; }
  Line 1180: body.is-admin #vacdash-admin-badge { display: block; }
             → CURRENT LAST LINE. Append new rules after this.

admin-index.html confirmed facts (lines 295–366, reference only):
  Line 309: document.getElementById('iv-value').value = INITIAL_VISIBLE;
            → admin-index.html uses id 'iv-value'. index.html uses 'vacdash-iv-input'.
  Line 311: const sbAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  Lines 313–320: minus handler (uses 'iv-minus', 'iv-value')
  Lines 323–330: plus handler (uses 'iv-plus', 'iv-value')
  Lines 332–345: input handler, 500ms debounce (uses 'iv-value')
            → None of the admin-index.html handlers call applyVisibilityState —
              that page propagates via Realtime only. index.html DOES call it per spec.
  Line 344: }, 500);  ← confirmed 500ms debounce timeout
  Line 347: const supabase = window.supabase.createClient(...)  ← second client on that page
  Lines 349–358: Realtime subscription on admin-index.html (separate from index.html)

GUARD RAILS:
  ✗ Do not add &lt;script src="https://cdn.jsdelivr.net/.../supabase..."&gt; — already on line 17
  ✗ Do not touch admin-index.html
  ✗ Do not use id="iv-value" — use id="vacdash-iv-input"
  ✗ Do not use id="iv-minus" — use id="vacdash-iv-minus"
  ✗ Do not use id="iv-plus" — use id="vacdash-iv-plus"
  ✗ Do not call applyVisibilityState with any name other than applyVisibilityState
  ✗ Do not create a second supabase.createClient call in index.html
  ✗ Do not run generate_dashboard.py or generate_attractions.py
  ✗ Do not remove, rename, or reformat any HTML element not named in this task
  ✗ Do not add inline styles for positioning — put layout CSS in components.css
</hallucination_guard>

<output_format>
Exact file edits using targeted find-and-replace (patch tool or equivalent).
No full-file rewrites unless absolutely unavoidable.

After all edits, re-read the affected line ranges to confirm correctness before
running the Playwright suite.

Playwright invocation:
  cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test

Expected result: 20/20 tests pass. If any test fails, diagnose and fix before
completing the handback.
</output_format>

<handback>
When all code changes are complete:

(1) List every file you modified with a one-line description.
(2) Note any assumptions or judgment calls.
(3) STOP. Do not commit, push, copy files, or update logs.

SUGGESTED FLAGS FOR HANDBACK REPORT (items noticed during file reads that were
NOT changed per the "do not remove unused elements" constraint):

- admin-index.html creates TWO supabase clients in its window.onload: one named
  `sbAdmin` (line 311, for DB writes) and one named `supabase` (line 347, for
  Realtime). index.html uses a single `supabase` client for both. This is an
  architectural asymmetry worth noting but was not changed.

- The admin-index.html button/input handlers (lines 313–345) do NOT call
  applyVisibilityState — they rely on the Realtime subscription to pick up the
  change and re-render. The index.html handlers added by this task DO call
  applyVisibilityState(false) directly (per task spec), providing immediate
  visual feedback without waiting for the Realtime round-trip.

- The `applyVisibilityState(false)` call in the new button handlers will reset
  showingAll-style visibility (i.e., collapse back to INITIAL_VISIBLE cards)
  even if the user had previously clicked "Show All." If this behaviour is
  undesirable, the call could be changed to applyVisibilityState(showingAll);
  — but that change is outside the scope of this task and should be a separate
  decision.
</handback>

</brief>
```
