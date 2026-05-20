/* DetailModal.jsx — Apple-style activity detail sheet.
   Desktop: centered modal, max 640px wide.
   Mobile (<640px): bottom sheet that slides up; drag handle visible.
   Dismiss: backdrop tap, Esc key, drag-down past threshold, or Close button.
   Navigation: swipe left = next, swipe right = prev.
              Apple Photos model: 3-panel strip, both cards move live during drag.
              Vertical dismiss: sheet follows finger, backdrop fades, springs back on release. */

const { useEffect: useEffectDM, useRef: useRefDM, useState: useStateDM } = React;

function ActivityDetailModal({ activityId, navigationIds, userId, onClose, onNavigated, onToggleWish, onToggleCommit }) {
  const [currentId, setCurrentId] = useStateDM(activityId);
  const [dragging, setDragging] = useStateDM(false);
  const dragStart = useRefDM(null); // { startX, startY, t, axis, pointerId, inDismissZone }
  const sheetRef = useRefDM(null);
  const stripRef = useRefDM(null);
  const backdropRef = useRefDM(null);

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

  // ── iOS touchmove prevention (x-axis drag only) ─────────────────
  useEffectDM(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    function preventTouch(e) {
      if (dragStart.current && dragStart.current.axis === 'x') {
        e.preventDefault();
      }
    }
    sheet.addEventListener('touchmove', preventTouch, { passive: false });
    return () => sheet.removeEventListener('touchmove', preventTouch);
  }, []);

  // ── Compute adjacent activities ──────────────────────────────────
  const navIds = navigationIds || [];
  const currentIdx = navIds.indexOf(currentId);
  const prevCardId = currentIdx > 0 ? navIds[currentIdx - 1] : null;
  const nextCardId = currentIdx !== -1 && currentIdx < navIds.length - 1 ? navIds[currentIdx + 1] : null;

  const activity     = currentId  ? (window.BD_ACTIVITIES || []).find(a => a.id === currentId)  : null;
  const prevActivity = prevCardId ? (window.BD_ACTIVITIES || []).find(a => a.id === prevCardId) : null;
  const nextActivity = nextCardId ? (window.BD_ACTIVITIES || []).find(a => a.id === nextCardId) : null;

  if (!activity) return null;

  const wished    = activity.wish.includes(userId);
  const committed = activity.commit.includes(userId);
  const isLocked  = activity.locked;

  // ── Strip helpers ────────────────────────────────────────────────
  // Strip is 300% wide; -33.333% shows center panel.
  function setStrip(transform, transition) {
    const s = stripRef.current;
    if (!s) return;
    s.style.transition = transition || 'none';
    s.style.transform  = transform;
  }

  function springStrip() {
    setStrip('translateX(-33.333%)', 'transform 300ms var(--ease-out)');
    window.setTimeout(() => setStrip('translateX(-33.333%)', 'none'), 310);
  }

  // ── Navigation ──────────────────────────────────────────────────
  function navigate(dir) {
    const idx = navIds.indexOf(currentId);
    if (idx === -1) return;
    let nextId = null;
    if (dir === 'next' && idx < navIds.length - 1) nextId = navIds[idx + 1];
    if (dir === 'prev' && idx > 0) nextId = navIds[idx - 1];
    if (!nextId) return;
    setCurrentId(nextId);
    if (onNavigated) onNavigated(nextId);
  }

  // ── Gesture handlers ─────────────────────────────────────────────
  function onPointerDown(e) {
    if (e.target.closest('button, a, input, textarea, select')) return;

    const hero   = sheetRef.current?.querySelector('.dm-hero');
    const handle = sheetRef.current?.querySelector('.dm-handle');
    const hr = hero?.getBoundingClientRect();
    const ha = handle?.getBoundingClientRect();
    const inHero   = hr && e.clientY >= hr.top && e.clientY <= hr.bottom && e.clientX >= hr.left && e.clientX <= hr.right;
    const inHandle = ha && e.clientY >= ha.top && e.clientY <= ha.bottom && e.clientX >= ha.left && e.clientX <= ha.right;

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

    // Lock axis on first 20px of movement
    if (d.axis === null) {
      if (Math.abs(dx) >= 20) d.axis = 'x';
      else if (Math.abs(dy) >= 20) d.axis = 'y';
    }

    if (d.axis === 'x') {
      // Live strip tracking: center is -33.333%, dx shifts it pixel-for-pixel
      setStrip(`translateX(calc(-33.333% + ${dx}px))`);
    } else if (d.axis === 'y') {
      const clampedDy = Math.max(0, dy);
      // Sheet follows finger down
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${clampedDy}px)`;
      }
      // Backdrop fades progressively (background-color so sheet stays opaque)
      if (backdropRef.current) {
        const progress = Math.min(1, clampedDy / 320);
        const alpha = (0.55 * (1 - progress)).toFixed(3);
        backdropRef.current.style.background = `rgba(0,0,0,${alpha})`;
      }
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

    if (d.axis === 'x') {
      const HTHRESH = 110;
      if (dx < -HTHRESH && nextActivity) {
        // Commit left → animate strip to next panel, then navigate
        setStrip('translateX(-66.667%)', 'transform 270ms var(--ease-out)');
        window.setTimeout(() => {
          setStrip('translateX(-33.333%)', 'none');
          navigate('next');
        }, 275);
      } else if (dx > HTHRESH && prevActivity) {
        // Commit right → animate strip to prev panel, then navigate
        setStrip('translateX(0%)', 'transform 270ms var(--ease-out)');
        window.setTimeout(() => {
          setStrip('translateX(-33.333%)', 'none');
          navigate('prev');
        }, 275);
      } else {
        springStrip(); // not enough -- snap back
      }
    } else if (d.axis === 'y') {
      const restoreSheet = () => {
        if (sheetRef.current) {
          sheetRef.current.style.transition = 'transform 280ms var(--ease-out)';
          sheetRef.current.style.transform  = 'translateY(0)';
          window.setTimeout(() => {
            if (sheetRef.current) { sheetRef.current.style.transition = ''; sheetRef.current.style.transform = ''; }
          }, 290);
        }
        if (backdropRef.current) {
          backdropRef.current.style.transition = 'background 280ms var(--ease-out)';
          backdropRef.current.style.background = '';
          window.setTimeout(() => {
            if (backdropRef.current) backdropRef.current.style.transition = '';
          }, 290);
        }
      };

      if (!d.inDismissZone) { restoreSheet(); return; }
      const velocity  = dy / dt;
      const threshold = velocity > 0.5 ? 60 : 150;
      if (dy > threshold) {
        onClose();
      } else {
        restoreSheet(); // not enough -- spring back
      }
    } else {
      // Tap -- clear any partial transforms
      if (sheetRef.current) { sheetRef.current.style.transform = ''; sheetRef.current.style.transition = ''; }
    }
  }

  function onPointerCancel(e) {
    dragStart.current = null;
    setDragging(false);
    springStrip();
    if (sheetRef.current) { sheetRef.current.style.transform = ''; sheetRef.current.style.transition = ''; }
    if (backdropRef.current) { backdropRef.current.style.background = ''; }
  }

  // ── Card content renderer ────────────────────────────────────────
  function renderCard(act, uid, isActive) {
    if (!act) return null;
    const w = act.wish.includes(uid);
    const c = act.commit.includes(uid);
    const lk = act.locked;
    return (
      <div className="dm-hero-body">
        <div className="dm-hero">
          <img src={act.thumb} alt="" draggable="false" />
        </div>
        <div className="dm-body">
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
          {isActive && (
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
          )}
          {isActive && <button className="dm-close" type="button" onClick={onClose}>Close</button>}
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div
      className="dm-backdrop"
      ref={backdropRef}
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

        {/* 3-panel carousel strip: prev | current | next */}
        <div className="dm-content-clip">
          <div className="dm-content-strip" ref={stripRef}>
            <div className="dm-content-panel">{renderCard(prevActivity, userId, false)}</div>
            <div className="dm-content-panel" data-panel="current">{renderCard(activity, userId, true)}</div>
            <div className="dm-content-panel">{renderCard(nextActivity, userId, false)}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { ActivityDetailModal });
