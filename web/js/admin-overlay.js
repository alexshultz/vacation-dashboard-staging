(function () {
  'use strict';

  // Bail out gracefully on pages that don't load the Supabase CDN
  if (!window.supabase) { return; }

  /* ── Supabase credentials (same values as event-timeline.html) ─────────── */
  var SUPABASE_URL      = 'https://quebfbvfuwbncpexlylu.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';

  /* ── Supabase client ───────────────────────────────────────────────────── */
  // window.supabase is the Supabase JS SDK loaded from CDN before this script.
  var _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ── Module state ──────────────────────────────────────────────────────── */
  var _editingId = null;

  /* ── Inject sign-out button into site header (synchronously on script load) */
  var _btn = document.createElement('button');
  _btn.id = 'vacdash-signout-btn';
  _btn.textContent = '🔒 Sign Out';
  _btn.addEventListener('click', function() {
    _sb.auth.signOut().then(function() { location.reload(); });
  });
  document.body.appendChild(_btn); // fallback -- will be moved to header
  // Try to place in site header
  var headerInner = document.querySelector('.site-header__inner');
  if (headerInner) { headerInner.appendChild(_btn); }

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

    '<button id="vacdash-edit-delete" ',
    'style="width:100%;padding:10px;border-radius:var(--radius-btn,6px);',
    'background:var(--status-no,#c0392b);color:#fff;border:none;',
    'font-family:var(--font-display);font-weight:700;font-size:14px;cursor:pointer;',
    'margin-bottom:12px;">Remove Event</button>',

    '<a href="admin-event-timeline.html" ',
    'style="font-size:13px;color:var(--color-ink-dim);text-decoration:none;">',
    'Full edit in Admin →</a>',

    '</div>'
  ].join('');
  document.body.appendChild(_modalEl);

  /* ── Admin state functions ─────────────────────────────────────────────── */
  function _activateAdmin() {
    document.body.classList.add('is-admin');
    document.getElementById('vacdash-signout-btn').style.display = 'inline-flex';
  }

  function _deactivateAdmin() {
    document.body.classList.remove('is-admin');
    document.getElementById('vacdash-signout-btn').style.display = 'none';
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

  /* ── Delete handler ─────────────────────────────────────────────────────── */
  document.getElementById('vacdash-edit-delete').addEventListener('click', function () {
    var id = _editingId;
    // Defer confirm to next tick so page.click() resolves before the dialog fires
    // (synchronous window.confirm inside a click handler deadlocks Playwright)
    setTimeout(async function () {
      if (!window.confirm('Remove this event permanently? This cannot be undone.')) { return; }
      var deleteBtn = document.getElementById('vacdash-edit-delete');
      var errEl = document.getElementById('vacdash-edit-error');
      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Removing…';
      errEl.style.display = 'none';

      var result = await _sb.from('schedule_events').delete().eq('id', id);
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Remove Event';

      if (result.error) {
        errEl.textContent = 'Delete failed: ' + result.error.message;
        errEl.style.display = 'block';
        return;
      }

      _modalEl.style.display = 'none';
      location.reload();
    }, 0);
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
