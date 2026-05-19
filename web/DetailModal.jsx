/* DetailModal.jsx — Apple-style activity detail sheet.
   Desktop: centered modal, max 640px wide.
   Mobile (<640px): bottom sheet that slides up; drag handle visible.
   Dismiss: backdrop tap, Esc key, drag-down past threshold, or Close button. */

const { useEffect: useEffectDM, useRef: useRefDM, useState: useStateDM } = React;

function ActivityDetailModal({ activityId, userId, onClose, onToggleWish, onToggleCommit }) {
  const activity = activityId
    ? (window.BD_ACTIVITIES || []).find(a => a.id === activityId)
    : null;
  const [dragY, setDragY] = useStateDM(0);
  const [dragging, setDragging] = useStateDM(false);
  const dragStart = useRefDM(null);
  const sheetRef = useRefDM(null);

  // Lock scroll while open + Escape to dismiss
  useEffectDM(() => {
    if (!activity) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activity, onClose]);

  if (!activity) return null;

  const wished = activity.wish.includes(userId);
  const committed = activity.commit.includes(userId);
  const isLocked = activity.locked;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Drag-to-dismiss (mobile bottom sheet only)
  function onPointerDown(e) {
    if (!isMobile) return;
    // Only start drag from the handle or the hero — not from the buttons/inputs in body
    const target = e.target.closest('button, a, input, textarea, select');
    if (target) return;
    dragStart.current = { y: e.clientY, t: Date.now() };
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function onPointerMove(e) {
    if (dragStart.current == null) return;
    const dy = Math.max(0, e.clientY - dragStart.current.y);
    setDragY(dy);
  }
  function onPointerUp(e) {
    if (dragStart.current == null) return;
    const dy = e.clientY - dragStart.current.y;
    const dt = Date.now() - dragStart.current.t;
    const velocity = dy / dt; // px/ms
    const threshold = velocity > 0.5 ? 60 : 150;
    dragStart.current = null;
    setDragging(false);
    if (dy > threshold) onClose();
    else setDragY(0);
  }

  const transform = dragY > 0 ? `translateY(${dragY}px)` : '';

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
        style={transform ? { transform } : null}
        ref={sheetRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="dm-handle" aria-hidden="true"></div>
        <button className="dm-close-x" type="button" onClick={onClose} aria-label="Close">✕</button>

        <div className="dm-hero">
          <img src={activity.thumb} alt="" draggable="false" />
        </div>

        <div className="dm-body">
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
                  <button className="btn btn--out" onClick={() => onToggleCommit && onToggleCommit(activity.id)}>
                    Count me out
                  </button>
                ) : (
                  <button className="btn btn--primary" onClick={() => onToggleCommit && onToggleCommit(activity.id)}>
                    Count me in
                  </button>
                )}
                <button
                  className={`btn ${wished ? 'btn--danger' : 'btn--secondary'}`}
                  onClick={() => onToggleWish && onToggleWish(activity.id)}
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
