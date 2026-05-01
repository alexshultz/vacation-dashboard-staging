<role>
You are a precise front-end engineer working on an existing Branson 2026 vacation-planning web app. Your sole job is to create two new admin HTML files by reading their source templates verbatim and then applying a strictly bounded set of additions. You never modify the source files. You never invent markup, logic, or styles not explicitly listed below.
</role>

<tone>
Methodical and literal. If the source file differs from any assumption in this brief, follow the source file and flag the discrepancy in your handback report. Do not interpret or improve -- implement exactly.
</tone>

<background>
<project>
  Vault path: /Users/alex/vaults/Vacation/Branson 2026
  Supabase project URL: https://quebfbvfuwbncpexlylu.supabase.co
  All web files live under: /Users/alex/vaults/Vacation/Branson 2026/web/
</project>

<known_state>
  - web/event-timeline.html and web/index.html BOTH have a Supabase JS CDN script tag in head (added by a prior brief).
  - Both files use raw REST for data loading -- do not change this pattern.
  - Both files declare SUPABASE_URL and SUPABASE_ANON_KEY as consts inside the inline script block in body (NOT in head).
  - web/index.html already has INITIAL_VISIBLE, applyVisibilityState(), and a Realtime subscription that uses `const supabase = window.supabase.createClient(...)`.
  - The new admin-index.html must use `sbAdmin` as its Supabase client variable name to avoid collision with the existing `supabase` variable.
</known_state>

<hard_constraints>
  - Do NOT modify web/event-timeline.html or web/index.html. Read them as source templates only.
  - Do NOT add the new pages to site.js NAV_LINKS or BOTTOM_TABS.
  - Do NOT add static header or nav elements -- site.js provides nav chrome.
  - Do NOT add new CSS style blocks or CSS classes for the modal or control bar -- ALL new styles must be inline.
  - Do NOT commit, push, or rsync.
  - Do NOT remove or alter any HTML element not explicitly named in this task. If you see an element that looks unused or redundant, flag it in the handback report but leave it untouched.
</hard_constraints>
</background>

<task>
<analysis_order>
  STEP 1 -- Read source files first. Before writing a single byte of output, read web/event-timeline.html in full, then read web/index.html in full. Identify: (a) exact location of SUPABASE_URL / SUPABASE_ANON_KEY declarations, (b) the render function that builds event cards and its exact name, (c) where INITIAL_VISIBLE is set in index.html, (d) the content container element inside main (or equivalent) in index.html, (e) whether cards already have position:relative. Record these findings before proceeding.

  STEP 2 -- Create web/admin-event-timeline.html with the additions in Section A below.

  STEP 3 -- Create web/admin-index.html with the additions in Section B below.

  STEP 4 -- Run all four safety grep checks and collect their output.

  STEP 5 -- Write the handback report.
</analysis_order>

<!-- SECTION A: web/admin-event-timeline.html -->

Start by writing the complete content of web/event-timeline.html verbatim to web/admin-event-timeline.html. Then apply ONLY the following additions -- nothing else.

ADDITION A1 -- Session guard:
Locate the inline script block in body. Immediately after the lines that declare SUPABASE_URL and SUPABASE_ANON_KEY (and any immediately adjacent const declarations that are part of the same logical block), insert the following async IIFE before any other code executes:

```js
(async () => {
  const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { session } } = await sbClient.auth.getSession();
  if (!session) window.location.replace('admin.html');
})();
```

Rationale: SUPABASE_URL and SUPABASE_ANON_KEY are declared in body's inline script, not in head, so the guard must live in that same script block where those constants are in scope.

ADDITION A2 -- Module-level events array:
At the very top of the inline script block (before all existing declarations), insert:
```js
let _allEvents = [];
let _editingId = null;
```

After every code path that loads events (Supabase fetch or fallback fetch), assign `_allEvents = eventsData` where `eventsData` is whatever variable holds the loaded array at that point. Identify the correct variable name from the source file.

ADDITION A3 -- Pencil button per event card:
Locate the render function that builds individual event card DOM nodes. For each card:
1. Ensure the card's root element has `position:relative` in its inline style (add it only if not already present; do not remove or reorder existing style properties).
2. Append the following button as the last child of that card element:
```html
<button data-event-id="${event.id}" onclick="openEditModal(this)" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;font-size:1.2rem;">✏️</button>
```
The onclick passes the button element itself; openEditModal will read data-event-id from it.

ADDITION A4 -- Edit modal HTML:
Add the following div as a direct child of body (just before the closing body tag). ALL styles must be inline:

```html
<div id="edit-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
  <div style="background:#fff;border-radius:8px;padding:24px;width:min(480px,90vw);max-height:90vh;overflow-y:auto;position:relative;">
    <form id="edit-form" onsubmit="return false;">
      <label style="display:block;margin-bottom:8px;">Title<br><input id="ef-title" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Date<br><input id="ef-date" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Start Time<br><input id="ef-startTime" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Duration<br><input id="ef-duration" type="number" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Travel Minutes<br><input id="ef-travelMinutes" type="number" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Priority<br><input id="ef-priority" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Catalog Ref<br><input id="ef-catalogRef" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Interested (comma-separated)<br><input id="ef-interested" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Undecided (comma-separated)<br><input id="ef-undecided" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">Not Interested (comma-separated)<br><input id="ef-notInterested" type="text" style="width:100%;box-sizing:border-box;"></label>
      <label style="display:block;margin-bottom:8px;">No Response (comma-separated)<br><input id="ef-noResponse" type="text" style="width:100%;box-sizing:border-box;"></label>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button id="edit-save" type="button" style="flex:1;padding:8px;cursor:pointer;">Save</button>
        <button id="edit-cancel" type="button" style="flex:1;padding:8px;cursor:pointer;">Cancel</button>
      </div>
      <div id="edit-modal-error" style="display:none;color:red;margin-top:8px;"></div>
    </form>
  </div>
</div>
```

IMPORTANT: Show the modal by setting style.display = 'flex'. Hide it by setting style.display = 'none'.

ADDITION A5 -- openEditModal function:
Add the following function inside the inline script block:

```js
function openEditModal(btn) {
  const id = btn.dataset.eventId;
  const ev = _allEvents.find(e => String(e.id) === String(id));
  if (!ev) return;
  _editingId = id;
  document.getElementById('ef-title').value = ev.title || '';
  document.getElementById('ef-date').value = ev.date || '';
  document.getElementById('ef-startTime').value = ev.startTime || '';
  document.getElementById('ef-duration').value = ev.duration ?? '';
  document.getElementById('ef-travelMinutes').value = ev.travelMinutes ?? '';
  document.getElementById('ef-priority').value = ev.priority || '';
  document.getElementById('ef-catalogRef').value = ev.catalogRef || '';
  document.getElementById('ef-interested').value = (ev.interested || []).join(', ');
  document.getElementById('ef-undecided').value = (ev.undecided || []).join(', ');
  document.getElementById('ef-notInterested').value = (ev.notInterested || []).join(', ');
  document.getElementById('ef-noResponse').value = (ev.noResponse || []).join(', ');
  document.getElementById('edit-modal-error').style.display = 'none';
  document.getElementById('edit-modal').style.display = 'flex';
}
```

ADDITION A6 -- Save and Cancel handlers:
Add the following event listener block inside the inline script block (after openEditModal):

```js
document.getElementById('edit-save').addEventListener('click', async () => {
  const title         = document.getElementById('ef-title').value.trim();
  const date          = document.getElementById('ef-date').value.trim();
  const startTime     = document.getElementById('ef-startTime').value.trim();
  const duration      = parseInt(document.getElementById('ef-duration').value, 10);
  const travelMinutes = parseInt(document.getElementById('ef-travelMinutes').value, 10);
  const priority      = document.getElementById('ef-priority').value.trim();
  const catalogRef    = document.getElementById('ef-catalogRef').value.trim();
  const interested    = document.getElementById('ef-interested').value.split(',').map(s => s.trim()).filter(Boolean);
  const undecided     = document.getElementById('ef-undecided').value.split(',').map(s => s.trim()).filter(Boolean);
  const notInterested = document.getElementById('ef-notInterested').value.split(',').map(s => s.trim()).filter(Boolean);
  const noResponse    = document.getElementById('ef-noResponse').value.split(',').map(s => s.trim()).filter(Boolean);

  const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await sbClient.from('schedule_events').upsert({
    id: _editingId, title, date, startTime, duration, travelMinutes,
    priority, catalogRef, interested, undecided, notInterested, noResponse
  });

  if (error) {
    const errDiv = document.getElementById('edit-modal-error');
    errDiv.textContent = error.message || 'Save failed.';
    errDiv.style.display = 'block';
    return;
  }

  // Update _allEvents in place
  const idx = _allEvents.findIndex(e => String(e.id) === String(_editingId));
  if (idx !== -1) {
    _allEvents[idx] = { ..._allEvents[idx], title, date, startTime, duration, travelMinutes,
      priority, catalogRef, interested, undecided, notInterested, noResponse };
  }

  // Re-render just the affected card: find the pencil button, get its parent card,
  // rebuild the card HTML using the same template string as the bulk render function,
  // and replace the old card in the DOM. Study the render function from the source
  // file and replicate the exact card template here for the single-card re-render.
  // After re-render, the new card's pencil button must have onclick="openEditModal(this)".
  const oldBtn = document.querySelector('button[data-event-id="' + _editingId + '"]');
  if (oldBtn) {
    const oldCard = oldBtn.parentElement;
    // INSERT SINGLE-CARD RE-RENDER HERE based on the actual source render template.
    // This is the MOST IMPORTANT implementation detail -- study the source file carefully.
  }

  document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('edit-cancel').addEventListener('click', () => {
  document.getElementById('edit-modal').style.display = 'none';
});
```

IMPLEMENTATION NOTE: The single-card re-render placeholder above must be replaced with real code. After reading the source render function in Step 1, implement the re-render by: (a) reconstructing the card's outerHTML using the same template literal used in the bulk render, referencing `_allEvents[idx]`, then (b) calling `oldCard.outerHTML = newCardHTML` or equivalent DOM replacement. The new card must include the pencil button with `onclick="openEditModal(this)"` and `data-event-id`.

<!-- SECTION B: web/admin-index.html -->

Start by writing the complete content of web/index.html verbatim to web/admin-index.html. Then apply ONLY the following additions -- nothing else.

ADDITION B1 -- Session guard:
Same placement rule as A1: locate the inline script block in body. Immediately after SUPABASE_URL and SUPABASE_ANON_KEY are declared, insert:

```js
(async () => {
  const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { session } } = await sbClient.auth.getSession();
  if (!session) window.location.replace('admin.html');
})();
```

ADDITION B2 -- Admin control bar HTML:
Read the source file and identify the main element (or equivalent top-level content container). Insert the following div as its FIRST child, before any existing child elements:

```html
<div id="admin-control-bar" style="background:var(--color-surface);padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--color-border);position:sticky;top:0;z-index:10;">
  <span style="font-weight:600;">Initially shown:</span>
  <button id="iv-minus" style="width:2rem;height:2rem;font-size:1.2rem;background:none;border:1px solid var(--color-border);border-radius:4px;cursor:pointer;">−</button>
  <span id="iv-value" style="font-size:1.1rem;font-weight:600;min-width:2ch;text-align:center;"></span>
  <button id="iv-plus" style="width:2rem;height:2rem;font-size:1.2rem;background:none;border:1px solid var(--color-border);border-radius:4px;cursor:pointer;">+</button>
</div>
```

ADDITION B3 -- Control bar logic:
In the inline script block, locate where INITIAL_VISIBLE is set. If it is declared as `const`, change it to `let` in the admin copy only (flag this in handback). Immediately after the INITIAL_VISIBLE initialization and BEFORE the call to loadSchedule() (or equivalent), insert:

```js
document.getElementById('iv-value').textContent = INITIAL_VISIBLE;

const sbAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('iv-minus').addEventListener('click', async () => {
  if (INITIAL_VISIBLE <= 1) return;
  INITIAL_VISIBLE -= 1;
  document.getElementById('iv-value').textContent = INITIAL_VISIBLE;
  await sbAdmin.from('app_config').upsert(
    { key: 'initial_visible', value: String(INITIAL_VISIBLE) },
    { onConflict: 'key' }
  );
});

document.getElementById('iv-plus').addEventListener('click', async () => {
  INITIAL_VISIBLE += 1;
  document.getElementById('iv-value').textContent = INITIAL_VISIBLE;
  await sbAdmin.from('app_config').upsert(
    { key: 'initial_visible', value: String(INITIAL_VISIBLE) },
    { onConflict: 'key' }
  );
});
```

CRITICAL: `sbAdmin` is a separate client instance from the existing `supabase` variable already in the file. Do NOT rename or remove the existing `supabase` variable. Do NOT reload the page or re-render events on +/- clicks.

<!-- SAFETY CHECKS -->

After writing both files, run these four shell commands from the project root and record each numeric result:

1. grep -c 'fetch.*schedule.json' web/admin-event-timeline.html   -- must be >= 1
2. grep -c 'fetch.*schedule.json' web/admin-index.html            -- must be >= 1
3. grep -c 'schedule_events' web/admin-event-timeline.html        -- must be >= 1
4. grep -c 'app_config' web/admin-index.html                      -- must be >= 1

If any check returns 0, stop and diagnose before continuing.

</task>

<hallucination_guard>
- Every structural decision (card element tag name, render function name, INITIAL_VISIBLE line location, content container element) must be derived from reading the actual source files. Do not assume or invent structure from the brief descriptions alone.
- If a detail in this brief conflicts with what you see in the source file, follow the source file and note the discrepancy in the handback report.
- Do not add any feature, helper function, CSS class, script tag, import, or markup element that is not explicitly specified above.
- INITIAL_VISIBLE must be mutable (let, not const) in admin-index.html because the +/- handlers mutate it. Flag any const-to-let change in the handback.
- Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.
</hallucination_guard>

<output_format>
Handback report must cover, in order:
1. Files created (paths).
2. Session guard placement for each file (exact surrounding lines from source).
3. Re-render strategy used for the single-card update in admin-event-timeline.html.
4. Modal save flow (brief prose, 4 sentences max).
5. +/- save flow (brief prose, 3 sentences max).
6. All four safety grep results (command + number).
7. Any discrepancies between this brief and the actual source files.
8. Any elements flagged as potentially unused/redundant (do not remove them).

When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
</output_format>
