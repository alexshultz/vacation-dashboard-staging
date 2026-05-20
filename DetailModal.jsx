/* DetailModal.jsx — Apple-style activity detail sheet.
   Desktop: centered modal, max 640px wide.
   Mobile (<640px): bottom sheet that slides up; drag handle visible.
   Dismiss: backdrop tap, Esc key, drag-down past threshold, or Close button.
   Navigation: swipe left = next card, swipe right = previous card, first-axis-wins.
              Apple Photos model: both cards slide together -- old exits, new enters. */

const { useEffect: useEffectDM, useRef: useRefDM, useState: useStateDM } = React;

function ActivityDetailModal({ activityId, navigationIds, userId, onClose, onNavigated, onToggleWish, onToggleCommit }) {
  const [currentId, setCurrentId] = useStateDM(activityId);
  const [prevId, setPrevId] = useStateDM(null);       // card being slid out
  const [slideDir, setSlideDir] = useStateDM(null);   // 'left' | 'right' | null
  const [dragging, setDragging] = useStateDM(false);
  const dragStart = useRefDM(null);
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

  // Clear slide state after animation completes (300ms matches CSS)
  useEffectDM(() => {
    if (!slideDir) return;
    const timer = window.setTimeout(() => {
      setSlideDir(null);
      setPrevId(null);
    }, 310);
    return () => window.clearTimeout(timer);
  }, [slideDir, currentId]);

  const activity = currentId
    ? (window.BD_ACTIVITIES || []).find(a => a.id === currentId)
    : null;

  const prevActivity = prevId
    ? (window.BD_ACTIVITIES || []).find(a => a.id === prevId)
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
    if (!nextId) return;
    setPrevId(currentId);
    setSlideDir(dir === 'next' ? 'left' : 'right');
    setCurrentId(nextId);
    if (onNavigated) onNavigated(nextId);
  }

  // ── Gesture handlers ─────────────────────────────────────────────
  function onPointerDown(e) {
    const target = e.target;
    if (target.closest('button, a, input, textarea, select')) return;

    const hero = sheetRef.current?.querySelector('.dm-hero');
    const handle = sheetRef.current?.querySelector('.dm-handle');
    const heroRect = hero?.getBoundingClientRect();
    const handleRect = handle?.getBoundingClientRect();
    const inHero = heroRect && e.clientY >= heroRect.top && e.clientY <= heroRect.bottom &&
                   e.clientX >= heroRect.left && e.clientX <= heroRect.right;
    const inHandle = handleRect && e.clientY >= handleRect.top && e.clientY <= handleRect.bottom &&
                     e.clientX >= handleRect.left && e.clientX <= handleRect.right;

    dragStart.current = {
      startX: e.clientX, startY: e.clientY,
      t: Date.now(), axis: null, pointerId: e.pointerId,
      inDismissZone: !!(inHero || inHandle)
    };
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onPointerMove(e) {
    const d = dragStart.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.axis === null) {
      if (Math.abs(dx) >= 20) d.axis = 'x';
      else if (Math.abs(dy) >= 20) d.axis = 'y';
    }
    if (!sheetRef.current) return;
    if (d.axis === 'y') {
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
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
      sheetRef.current.style.transition = '';
    }
    if (d.axis === 'x') {
      const HTHRESH = 110;
      if (dx < -HTHRESH) navigate('next');
      else if (dx > HTHRESH) navigate('prev');
    } else if (d.axis === 'y') {
      if (!d.inDismissZone) return;
      const velocity = dy / dt;
      const threshold = velocity > 0.5 ? 60 : 150;
      if (dy > threshold) onClose();
    }
  }

  function onPointerCancel(e) {
    dragStart.current = null;
    setDragging(false);
    if (sheetRef.current) sheetRef.current.style.transform = '';
  }

  // ── Card content renderer (shared for current and prev) ──────────
  function renderCardContent(act, uid) {
    const w = act.wish.includes(uid);
    const c = act.commit.includes(uid);
    const lk = act.locked;
    return (
      <div className="dm-hero-body">
        <div className="dm-hero">
          <img src={act.thumb} alt="" draggable="false" />
        </div>
        <div className="dm-body" style={{ overscrollBehavior: 'none' }}>
          <div className="card-dense__pills">
            <span className={`card-badge ${c ? 'card-badge--commit' : 'card-badge--not-going'}`}>
              {c ? "You're going" : 'Undecided'}
            </span>
            {lk && <span className="card-badge card-badge--lock">🔒 Locked by Alex</span>}
          </div>
          <h2 className="dm-title">{act.name}</h2>
          <div className="dm-meta">{act.drive} drive · {act.price} · ★ {act.rating}</div>
          <StatusLine activity={act} committed={c} />
          <p className="dm-desc">{act.hook}</p>
          {act.tags && act.tags.length > 0 && (
            <div className="dm-tags">
              {act.tags.map(t => <span key={t} className="dm-tag">{t}</span>)}
            </div>
          )}
          <RosterRow kind="wish"   label="wishlisted" ids={act.wish}   userId={uid} />
          <RosterRow kind="commit" label="committed"  ids={act.commit} userId={uid} />
          <div className="dm-actions">
            {lk ? (
              <>
                <button className="btn btn--locked-in" disabled aria-disabled="true">
                  🔒 {c ? 'Locked in — text Alex to change' : 'Locked — text Alex to join'}
                </button>
                <button className="btn btn--ghost">Add to calendar</button>
              </>
            ) : (
              <>
                {c ? (
                  <button className="btn btn--out" onClick={() => onToggleCommit && onToggleCommit(currentId)}>
                    Count me out
                  </button>
                ) : (
                  <button className="btn btn--primary" onClick={() => onToggleCommit && onToggleCommit(currentId)}>
                    Count me in
                  </button>
                )}
                <button
                  className={`btn ${w ? 'btn--danger' : 'btn--secondary'}`}
                  onClick={() => onToggleWish && onToggleWish(currentId)}
                >
                  {w ? 'Drop wishlist' : '+ Wishlist'}
                </button>
              </>
            )}
          </div>
          <button className="dm-close" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  // During a slide transition: render a 2-panel strip inside dm-content-clip.
  // The strip is 200% wide. For slide-left: prev panel is left, current is right.
  // For slide-right: current panel is left, prev panel is right.
  // CSS animates the strip translateX so both panels move together.
  const isSliding = !!(slideDir && prevActivity);

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

        <div className="dm-content-clip">
          {isSliding ? (
            <div className={`dm-slide-strip dm-slide-strip--${slideDir}`}>
              {slideDir === 'left' ? (
                <>
                  <div className="dm-slide-panel">{renderCardContent(prevActivity, userId)}</div>
                  <div className="dm-slide-panel">{renderCardContent(activity, userId)}</div>
                </>
              ) : (
                <>
                  <div className="dm-slide-panel">{renderCardContent(activity, userId)}</div>
                  <div className="dm-slide-panel">{renderCardContent(prevActivity, userId)}</div>
                </>
              )}
            </div>
          ) : (
            renderCardContent(activity, userId)
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ActivityDetailModal });
