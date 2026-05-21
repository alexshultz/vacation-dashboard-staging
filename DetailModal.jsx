/* DetailModal.jsx — Apple-Photos / iCloud-Photos-style detail sheet.

   Architecture:
   - The pager is a NATIVE horizontal scroll container with scroll-snap.
     iOS owns horizontal momentum, snap, deceleration — same physics as
     the iCloud Photos viewer. We never JS-translate the horizontal
     position; we only call .scrollTo() when the user uses arrow keys.
   - Every activity in `navigationIds` is rendered as its own pane.
     Each pane has its own vertical scroller (`.dm-pane-inner`) with
     `touch-action: pan-y` so iOS does native vertical momentum on
     body content too.
   - Swipe-down-to-dismiss is JS-owned, but ONLY on `.dm-hero` and
     `.dm-handle` (the chrome zones that don't need to scroll). We
     attach pointer listeners NATIVELY with { passive: true } so iOS
     never has to wait for our JS to decide what to do — it just runs
     its own scroll pipeline. The listeners early-bail for anything
     they don't own.

   This means there is no longer a custom 3-pane carousel with data
   swap; the entire filtered list is in the DOM. With `loading="lazy"`
   on hero images and the per-pane scroller, this performs fine for
   the actual filtered sizes the app produces (typically 30–130).
*/

const {
  useEffect:       useEffectDM,
  useLayoutEffect: useLayoutEffectDM,
  useRef:          useRefDM,
  useState:        useStateDM,
  useCallback:     useCallbackDM,
} = React;

const DM_DISMISS_DURATION_MS = 280;
const DM_AXIS_LOCK_PX        = 10;
const DM_DISMISS_DISTANCE_PX = 150;
const DM_DISMISS_FAST_PX     = 60;
const DM_VELOCITY_PX_PER_MS  = 0.5;

function ActivityDetailModal({
  activityId, navigationIds, userId,
  onClose, onNavigated, onToggleWish, onToggleCommit,
}) {
  const navIds = navigationIds || [];

  // Refs that handlers read without re-binding on every render.
  const navIdsRef    = useRefDM(navIds);     navIdsRef.current = navIds;
  const onNavRef     = useRefDM(onNavigated); onNavRef.current  = onNavigated;
  const initialIdx   = Math.max(0, navIds.indexOf(activityId));
  const currentIdxRef = useRefDM(initialIdx);

  // `currentIdx` is React state ONLY so we can re-render to tag the active
  // pane with `data-panel="current"` (used by tests + a11y). It is updated
  // by the pager scroll handler.
  const [currentIdx, setCurrentIdx] = useStateDM(initialIdx);

  const sheetRef     = useRefDM(null);
  const backdropRef  = useRefDM(null);
  const pagerRef     = useRefDM(null);
  const animatingRef = useRefDM(false);

  // ── Body scroll lock ────────────────────────────────────────────
  useEffectDM(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // ── Initial pager position (synchronous, before paint) ─────────
  useLayoutEffectDM(() => {
    const pager = pagerRef.current;
    if (!pager) return;
    pager.scrollLeft = initialIdx * pager.offsetWidth;
  }, []);

  // ── Pager scroll → currentIdx + onNavigated ─────────────────────
  useEffectDM(() => {
    const pager = pagerRef.current;
    if (!pager) return;
    let raf = null;
    function check() {
      raf = null;
      const w = pager.offsetWidth;
      if (!w) return;
      const idx = Math.round(pager.scrollLeft / w);
      if (idx !== currentIdxRef.current && navIdsRef.current[idx]) {
        currentIdxRef.current = idx;
        setCurrentIdx(idx);
        if (onNavRef.current) onNavRef.current(navIdsRef.current[idx]);
      }
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(check);
    }
    pager.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      pager.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Navigate via .scrollTo (used by arrow keys) ─────────────────
  const navigateBy = useCallbackDM((delta) => {
    const pager = pagerRef.current;
    if (!pager) return;
    const w = pager.offsetWidth;
    const target = Math.max(
      0,
      Math.min(navIdsRef.current.length - 1, currentIdxRef.current + delta)
    );
    if (target === currentIdxRef.current) return;
    pager.scrollTo({ left: target * w, behavior: 'smooth' });
  }, []);

  // ── Dismiss with animation ──────────────────────────────────────
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
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateBy(+1); /* matches swipe-left = advance */ }
      else if (e.key === 'ArrowRight') { e.preventDefault(); navigateBy(-1); /* matches swipe-right = retreat */ }
      else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        dismissWithAnimation(0);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, navigateBy, dismissWithAnimation]);

  // Swipe-down-to-dismiss removed by product decision (2026-05-21).
  // Dismiss paths: ✕ button, Esc key, backdrop tap, ArrowDown, Space.

  // ── Render ──────────────────────────────────────────────────────
  const activeId = navIds[currentIdx];
  const activeActivity = activeId
    ? (window.BD_ACTIVITIES || []).find(a => a.id === activeId)
    : null;

  return (
    <div
      className="dm-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={activeActivity ? `${activeActivity.name} details` : 'Activity details'}
    >
      <div className="dm-sheet" ref={sheetRef}>
        <div className="dm-handle" aria-hidden="true"></div>
        <button className="dm-close-x" type="button" onClick={onClose} aria-label="Close">✕</button>

        <div className="dm-pager" ref={pagerRef}>
          {navIds.map((id, idx) => {
            const act = (window.BD_ACTIVITIES || []).find(a => a.id === id);
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={id}
                className="dm-pane"
                data-id={id}
                data-panel={isCurrent ? 'current' : undefined}
                aria-hidden={!isCurrent}
              >
                {act ? (
                  <PaneContent
                    activity={act}
                    userId={userId}
                    onClose={onClose}
                    onToggleWish={onToggleWish}
                    onToggleCommit={onToggleCommit}
                  />
                ) : null}
              </div>
            );
          })}
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
