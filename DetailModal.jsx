/* DetailModal.jsx — Virtual 3-pane carousel.

   Architecture (2026-05-21, replaces all-panes-in-DOM scroll-snap model):
   - Exactly 3 `.dm-pane` DOM elements always exist: prev / current / next slots.
   - The pager is a plain overflow-x scroll container. NO CSS scroll-snap.
   - scrollLeft is pinned to pager.offsetWidth (middle pane = current) when idle.
   - Navigation triggers when scrollLeft crosses ±50% threshold:
       scrollLeft >= 1.5w  → advance to next card
       scrollLeft <  0.5w  → retreat to prev card
   - After threshold: swap slot data in place, instantly reset scrollLeft to w.
   - Settle timer (200ms debounce) smooth-snaps drifted scroll back to w.
   - Keyboard ArrowLeft/ArrowRight update state directly (no scrollTo).
   - Dismiss paths: ✕ button, Esc, backdrop tap, ArrowDown, Space.
*/

const {
  useEffect:       useEffectDM,
  useLayoutEffect: useLayoutEffectDM,
  useRef:          useRefDM,
  useState:        useStateDM,
  useCallback:     useCallbackDM,
} = React;

const DM_DISMISS_DURATION_MS = 280;

function ActivityDetailModal({
  activityId, navigationIds, userId,
  onClose, onNavigated, onToggleWish, onToggleCommit,
}) {
  const navIds = navigationIds || [];

  const navIdsRef      = useRefDM(navIds);      navIdsRef.current = navIds;
  const onNavRef       = useRefDM(onNavigated); onNavRef.current  = onNavigated;
  const initialIdx     = Math.max(0, navIds.indexOf(activityId));
  const currentIdxRef  = useRefDM(initialIdx);
  const [currentIdx, setCurrentIdx] = useStateDM(initialIdx);

  const sheetRef       = useRefDM(null);
  const backdropRef    = useRefDM(null);
  const pagerRef       = useRefDM(null);
  const animatingRef   = useRefDM(false);
  const skipScrollRef  = useRefDM(false);
  const settleTimerRef = useRefDM(null);
  const isDraggingRef  = useRefDM(false);

  // ── Body scroll lock ────────────────────────────────────────────
  useEffectDM(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // ── Initial scroll: show middle pane (synchronous, before paint) ─
  useLayoutEffectDM(() => {
    const pager = pagerRef.current;
    if (!pager) return;
    pager.scrollLeft = pager.offsetWidth;
  }, []);

  // ── Pager scroll → threshold navigation ─────────────────────────
  useEffectDM(() => {
    const pager = pagerRef.current;
    if (!pager) return;
    let raf = null;

    function check() {
      raf = null;
      if (skipScrollRef.current) {
        skipScrollRef.current = false;
        return;
      }
      // Finger still on screen — defer navigation until pointer is released
      if (isDraggingRef.current) return;
      const w = pager.offsetWidth;
      if (!w) return;
      const x = pager.scrollLeft;

      clearTimeout(settleTimerRef.current);

      if (x >= w * 1.5) {
        // Threshold crossed toward next pane
        const ids = navIdsRef.current;
        const cur = currentIdxRef.current;
        if (cur < ids.length - 1) {
          const newIdx = cur + 1;
          currentIdxRef.current = newIdx;
          setCurrentIdx(newIdx);
          if (onNavRef.current) onNavRef.current(ids[newIdx]);
        }
        skipScrollRef.current = true;
        pager.scrollLeft = w;
      } else if (x < w * 0.5) {
        // Threshold crossed toward prev pane
        const ids = navIdsRef.current;
        const cur = currentIdxRef.current;
        if (cur > 0) {
          const newIdx = cur - 1;
          currentIdxRef.current = newIdx;
          setCurrentIdx(newIdx);
          if (onNavRef.current) onNavRef.current(ids[newIdx]);
        }
        skipScrollRef.current = true;
        pager.scrollLeft = w;
      } else {
        // Drift without crossing threshold — smooth snap-back after settle
        settleTimerRef.current = window.setTimeout(() => {
          const pw = pager.offsetWidth;
          const px = pager.scrollLeft;
          if (Math.abs(px - pw) > 5) {
            pager.scrollTo({ left: pw, behavior: 'smooth' });
          }
        }, 200);
      }
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(check);
    }

    function onPointerDown() {
      isDraggingRef.current = true;
    }

    function onPointerUp() {
      isDraggingRef.current = false;
      check();
    }

    function onPointerCancel() {
      isDraggingRef.current = false;
    }

    pager.addEventListener('scroll', onScroll, { passive: true });
    pager.addEventListener('pointerdown', onPointerDown);
    pager.addEventListener('pointerup', onPointerUp);
    pager.addEventListener('pointercancel', onPointerCancel);
    return () => {
      pager.removeEventListener('scroll', onScroll);
      pager.removeEventListener('pointerdown', onPointerDown);
      pager.removeEventListener('pointerup', onPointerUp);
      pager.removeEventListener('pointercancel', onPointerCancel);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settleTimerRef.current);
    };
  }, []);

  // ── Keyboard navigation (direct state update, no scrollTo) ──────
  const navigateBy = useCallbackDM((delta) => {
    const ids = navIdsRef.current;
    const cur = currentIdxRef.current;
    const newIdx = Math.max(0, Math.min(ids.length - 1, cur + delta));
    if (newIdx === cur) return;
    currentIdxRef.current = newIdx;
    setCurrentIdx(newIdx);
    if (onNavRef.current) onNavRef.current(ids[newIdx]);
    const pager = pagerRef.current;
    if (pager) {
      skipScrollRef.current = true;
      pager.scrollLeft = pager.offsetWidth;
    }
  }, []);

  // ── Dismiss with slide-down animation ───────────────────────────
  const dismissWithAnimation = useCallbackDM((startDy = 0) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (sheet) {
      sheet.style.transition = `transform ${DM_DISMISS_DURATION_MS}ms cubic-bezier(0.4, 0.0, 1, 1)`;
      sheet.style.transform = `translateY(${Math.max(startDy, 0) + window.innerHeight}px)`;
    }
    if (backdrop) {
      backdrop.style.transition = `opacity ${DM_DISMISS_DURATION_MS}ms ease-out`;
      backdrop.style.opacity = '0';
    }
    window.setTimeout(() => onClose(), DM_DISMISS_DURATION_MS);
  }, [onClose]);

  // ── Keyboard handler ────────────────────────────────────────────
  useEffectDM(() => {
    function onKey(e) {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'Escape')          { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateBy(+1); /* swipe-left = advance */ }
      else if (e.key === 'ArrowRight') { e.preventDefault(); navigateBy(-1); /* swipe-right = retreat */ }
      else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        dismissWithAnimation(0);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, navigateBy, dismissWithAnimation]);

  // ── Render — always exactly 3 panes ─────────────────────────────
  const activities = window.BD_ACTIVITIES || [];
  const prevId     = navIds[currentIdx - 1] || null;
  const currentId  = navIds[currentIdx]     || null;
  const nextId     = navIds[currentIdx + 1] || null;
  const prevAct    = prevId    ? activities.find(a => a.id === prevId)    : null;
  const currentAct = currentId ? activities.find(a => a.id === currentId) : null;
  const nextAct    = nextId    ? activities.find(a => a.id === nextId)    : null;

  return (
    <div
      className="dm-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={currentAct ? `${currentAct.name} details` : 'Activity details'}
    >
      <div className="dm-sheet" ref={sheetRef}>
        <div className="dm-handle" aria-hidden="true"></div>
        <button className="dm-close-x" type="button" onClick={onClose} aria-label="Close">✕</button>

        <div className="dm-pager" ref={pagerRef}>
          <div
            className="dm-pane"
            data-panel="prev"
            data-id={prevId || undefined}
            aria-hidden={true}
          >
            {prevAct && (
              <PaneContent
                activity={prevAct}
                userId={userId}
                onClose={onClose}
                onToggleWish={onToggleWish}
                onToggleCommit={onToggleCommit}
              />
            )}
          </div>
          <div
            className="dm-pane"
            data-panel="current"
            data-id={currentId || undefined}
            aria-hidden={false}
          >
            {currentAct && (
              <PaneContent
                activity={currentAct}
                userId={userId}
                onClose={onClose}
                onToggleWish={onToggleWish}
                onToggleCommit={onToggleCommit}
              />
            )}
          </div>
          <div
            className="dm-pane"
            data-panel="next"
            data-id={nextId || undefined}
            aria-hidden={true}
          >
            {nextAct && (
              <PaneContent
                activity={nextAct}
                userId={userId}
                onClose={onClose}
                onToggleWish={onToggleWish}
                onToggleCommit={onToggleCommit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaneContent({ activity, userId, onClose, onToggleWish, onToggleCommit }) {
  const w = activity.wish.includes(userId);
  const c = activity.commit.includes(userId);
  const lk = activity.locked;
  return (
    <div className="dm-pane-inner">
      <div className="dm-hero">
        <img src={activity.thumb} alt="" draggable="false" loading="lazy" />
      </div>
      <div className="dm-body">
        <div className="card-dense__pills">
          <span className={`card-badge ${c ? 'card-badge--commit' : 'card-badge--not-going'}`}>
            {c ? "You're going" : 'Undecided'}
          </span>
          {lk && <span className="card-badge card-badge--lock">🔒 Locked by Alex</span>}
        </div>
        <h2 className="dm-title">{activity.name}</h2>
        <div className="dm-meta">{activity.drive} drive · {activity.price} · ★ {activity.rating}</div>
        <StatusLine activity={activity} committed={c} />
        <p className="dm-desc">{activity.hook}</p>
        {activity.tags && activity.tags.length > 0 && (
          <div className="dm-tags">
            {activity.tags.map(t => <span key={t} className="dm-tag">{t}</span>)}
          </div>
        )}
        <RosterRow kind="wish"   label="wishlisted" ids={activity.wish}   userId={userId} />
        <RosterRow kind="commit" label="committed"  ids={activity.commit} userId={userId} />
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
                <button className="btn btn--out" onClick={() => onToggleCommit && onToggleCommit(activity.id)}>
                  Count me out
                </button>
              ) : (
                <button className="btn btn--primary" onClick={() => onToggleCommit && onToggleCommit(activity.id)}>
                  Count me in
                </button>
              )}
              <button
                className={`btn ${w ? 'btn--danger' : 'btn--secondary'}`}
                onClick={() => onToggleWish && onToggleWish(activity.id)}
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

Object.assign(window, { ActivityDetailModal });
