/* DetailModal.jsx — Apple-style activity detail sheet.
   Desktop: centered modal, max 640px wide.
   Mobile (<640px): bottom sheet that slides up; drag handle visible.
   Dismiss: backdrop tap, Esc key, drag-down past threshold, or Close button.
   Navigation: swipe left = next card, swipe right = previous card, first-axis-wins disambiguation. */

const { useEffect: useEffectDM, useRef: useRefDM, useState: useStateDM } = React;

function ActivityDetailModal({ activityId, navigationIds, userId, onClose, onNavigated, onToggleWish, onToggleCommit }) {
  const [currentId, setCurrentId] = useStateDM(activityId);
  const [dragging, setDragging] = useStateDM(false);
  const dragStart = useRefDM(null); // { startX, startY, t, axis, pointerId }
  const sheetRef = useRefDM(null);

  // ── Body scroll lock + Escape key ──────────────────────────────
  useEffectDM(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // ── iOS touchmove prevention ────────────────────────────────────
  useEffectDM(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    function preventTouch(e) {
      if (dragStart.current && dragStart.current.axis !== null) {
        e.preventDefault();
      }
    }
    sheet.addEventListener('touchmove', preventTouch, { passive: false });
    return () => sheet.removeEventListener('touchmove', preventTouch);
  }, []);

  const activity = currentId
    ? (window.BD_ACTIVITIES || []).find(a => a.id === currentId)
    : null;

  if (!activity) return null;

  const wished = activity.wish.includes(userId);
  const committed = activity.commit.includes(userId);
  const isLocked = activity.locked;

  // ── Navigation ──────────────────────────────────────────────────
  function navigate(dir) {
    if (!navigationIds || !navigationIds.length) return;
    const idx = navigationIds.indexOf(currentId);
    if (idx === -1) return;
    let nextId = null;
    if (dir === 'next' && idx < navigationIds.length - 1) nextId = navigationIds[idx + 1];
    if (dir === 'prev' && idx > 0) nextId = navigationIds[idx - 1];
    if (!nextId) return; // boundary no-op
    setCurrentId(nextId);
    if (onNavigated) onNavigated(nextId);
  }

  // ── Gesture handlers ─────────────────────────────────────────────
  function onPointerDown(e) {
    // Skip gestures if the target is an interactive element (button, link, input, etc.)
    const target = e.target;
    if (target.closest('button, a, input, textarea, select')) return;

    // Only start drag from the handle or hero — not from scrollable body content
    // Check if the pointer is within the hero/handle region by coordinates
    const hero = sheetRef.current?.querySelector('.dm-hero');
    const handle = sheetRef.current?.querySelector('.dm-handle');
    if (hero || handle) {
      const heroRect = hero?.getBoundingClientRect();
      const handleRect = handle?.getBoundingClientRect();
      const inHero = heroRect && e.clientY >= heroRect.top && e.clientY <= heroRect.bottom &&
                     e.clientX >= heroRect.left && e.clientX <= heroRect.right;
      const inHandle = handleRect && e.clientY >= handleRect.top && e.clientY <= handleRect.bottom &&
                       e.clientX >= handleRect.left && e.clientX <= handleRect.right;
      if (!inHero && !inHandle) return;
    }
    dragStart.current = {
      startX: e.clientX, startY: e.clientY,
      t: Date.now(), axis: null, pointerId: e.pointerId
    };
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onPointerMove(e) {
    const d = dragStart.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    // First-axis-wins: lock axis once either axis exceeds 20px
    if (d.axis === null) {
      if (Math.abs(dx) >= 20) d.axis = 'x';
      else if (Math.abs(dy) >= 20) d.axis = 'y';
    }
    if (!sheetRef.current) return;
    if (d.axis === 'x') {
      sheetRef.current.style.transform = `translateX(${dx}px)`;
      e.preventDefault();
    } else if (d.axis === 'y') {
      sheetRef.current.style.transform = `translateY(${Math.max(0, dy)}px)`;
      e.preventDefault();
    }
  }

  function onPointerUp(e) {
    const d = dragStart.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const dt = Date.now() - d.t;
    dragStart.current = null;
    setDragging(false);
    if (sheetRef.current) sheetRef.current.style.transform = '';

    if (d.axis === 'x') {
      const HTHRESH = 110;
      if (dx < -HTHRESH) navigate('next');       // swipe left = next
      else if (dx > HTHRESH) navigate('prev');   // swipe right = prev
      // else: no-op (snap back already done by clearing transform)
    } else if (d.axis === 'y') {
      const velocity = dy / dt;
      const threshold = velocity > 0.5 ? 60 : 150;
      if (dy > threshold) onClose();
      // else: snap back (transform already cleared)
    }
    // axis === null: just a tap, no action
  }

  function onPointerCancel(e) {
    dragStart.current = null;
    setDragging(false);
    if (sheetRef.current) sheetRef.current.style.transform = '';
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div
      className="dm-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${activity.name} details`}
    >
      <div
        className={`dm-sheet ${dragging ? 'is-dragging' : ''}`}
        ref={sheetRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className="dm-handle" aria-hidden="true"></div>
        <button className="dm-close-x" type="button" onClick={onClose} aria-label="Close">✕</button>

        <div className="dm-hero">
          <img src={activity.thumb} alt="" draggable="false" />
        </div>

        <div className="dm-body" style={{ overscrollBehavior: 'none' }}>
          <div className="card-dense__pills">
            <span className={`card-badge ${committed ? 'card-badge--commit' : 'card-badge--not-going'}`}>
              {committed ? "You're going" : 'Undecided'}
            </span>
            {isLocked && <span className="card-badge card-badge--lock">🔒 Locked by Alex</span>}
          </div>

          <h2 className="dm-title">{activity.name}</h2>
          <div className="dm-meta">{activity.drive} drive · {activity.price} · ★ {activity.rating}</div>

          <StatusLine activity={activity} committed={committed} />

          <p className="dm-desc">{activity.hook}</p>

          {activity.tags && activity.tags.length > 0 && (
            <div className="dm-tags">
              {activity.tags.map(t => (
                <span key={t} className="dm-tag">{t}</span>
              ))}
            </div>
          )}

          <RosterRow kind="wish"   label="wishlisted" ids={activity.wish}   userId={userId} />
          <RosterRow kind="commit" label="committed"  ids={activity.commit} userId={userId} />

          <div className="dm-actions">
            {isLocked ? (
              <>
                <button className="btn btn--locked-in" disabled aria-disabled="true">
                  🔒 {committed ? 'Locked in — text Alex to change' : 'Locked — text Alex to join'}
                </button>
                <button className="btn btn--ghost">Add to calendar</button>
              </>
            ) : (
              <>
                {committed ? (
                  <button className="btn btn--out" onClick={() => onToggleCommit && onToggleCommit(currentId)}>
                    Count me out
                  </button>
                ) : (
                  <button className="btn btn--primary" onClick={() => onToggleCommit && onToggleCommit(currentId)}>
                    Count me in
                  </button>
                )}
                <button
                  className={`btn ${wished ? 'btn--danger' : 'btn--secondary'}`}
                  onClick={() => onToggleWish && onToggleWish(currentId)}
                >
                  {wished ? 'Drop wishlist' : '+ Wishlist'}
                </button>
              </>
            )}
          </div>

          <button className="dm-close" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ActivityDetailModal });
