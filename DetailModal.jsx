/* DetailModal.jsx — Virtual 3-pane transform carousel.

   Architecture (2026-05-21, replaces overflow-x scroll model):
   - Exactly 3 `.dm-pane` DOM elements always exist: prev / current / next slots.
   - A `.dm-strip` (300% wide) sits inside `.dm-pager` (overflow:hidden, clipping).
   - Strip idle position: translateX(-containerWidth px) — centers the current pane.
   - Navigation animates strip to -2W (next) or 0 (prev) via CSS transition 300ms,
     then onTransitionEnd swaps slot data and instantly resets to -W with no transition.
   - Spring back: same animation back to -W, pendingNavRef stays null.
   - Gesture model: pointer events on strip, axis-locking, setPointerCapture, velocity check.
   - Keyboard: ArrowLeft = next, ArrowRight = prev, ArrowDown/Space = dismiss, Escape = close.
   - window.__dmNavigate('next'|'prev') exposed for Playwright tests (instant, no animation).
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

  const sheetRef        = useRefDM(null);
  const backdropRef     = useRefDM(null);
  const pagerRef        = useRefDM(null);   // clipping container (.dm-pager)
  const stripRef        = useRefDM(null);   // 300%-wide strip (.dm-strip)
  const animatingRef    = useRefDM(false);  // dismiss animation guard
  const animatingNavRef = useRefDM(false);  // nav/spring animation guard
  const pendingNavRef   = useRefDM(null);   // newIdx to apply after transitionend, null = spring-back

  // gesture tracking refs
  const isTouchedRef   = useRefDM(false);
  const axisLockedRef  = useRefDM(null);  // null | 'x' | 'y'
  const startXRef      = useRefDM(0);
  const startYRef      = useRefDM(0);
  const velocityBufRef = useRefDM([]);    // rolling 3-sample [{x, time}]

  // ── Body scroll lock ────────────────────────────────────────────
  useEffectDM(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // ── Initial strip position (synchronous, before paint) ──────────
  useLayoutEffectDM(() => {
    const strip = stripRef.current;
    const pager = pagerRef.current;
    if (!strip || !pager) return;
    strip.style.transform = `translateX(${-pager.offsetWidth}px)`;
  }, []);

  // ── Gesture handler + transitionend ─────────────────────────────
  useEffectDM(() => {
    const strip = stripRef.current;
    const pager = pagerRef.current;
    if (!strip || !pager) return;

    function setTransform(px, animate) {
      if (animate) {
        strip.classList.add('dm-strip--anim');
      } else {
        strip.classList.remove('dm-strip--anim');
      }
      strip.style.transform = `translateX(${px}px)`;
    }

    function onPointerDown(e) {
      if (animatingNavRef.current) return;
      isTouchedRef.current = true;
      axisLockedRef.current = null;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      velocityBufRef.current = [{ x: e.clientX, time: Date.now() }];
    }

    function onPointerMove(e) {
      if (!isTouchedRef.current) return;
      const diffX = e.clientX - startXRef.current;
      const diffY = e.clientY - startYRef.current;

      if (axisLockedRef.current === null) {
        const total = Math.sqrt(diffX * diffX + diffY * diffY);
        if (total < 10) return;
        axisLockedRef.current = Math.abs(diffX) >= Math.abs(diffY) ? 'x' : 'y';
        if (axisLockedRef.current === 'x') {
          strip.setPointerCapture(e.pointerId);
        }
      }

      if (axisLockedRef.current === 'y') return;

      e.preventDefault();
      const w = pager.offsetWidth;
      setTransform(-w + diffX, false);

      const buf = velocityBufRef.current;
      buf.push({ x: e.clientX, time: Date.now() });
      if (buf.length > 3) buf.shift();
    }

    function onPointerEnd(e) {
      if (!isTouchedRef.current) return;
      isTouchedRef.current = false;
      if (axisLockedRef.current !== 'x') return;

      const diffX = e.clientX - startXRef.current;
      const w = pager.offsetWidth;

      const buf = velocityBufRef.current;
      let velocity = 0;
      if (buf.length >= 2) {
        const a = buf[buf.length - 2], b = buf[buf.length - 1];
        const dt = b.time - a.time;
        if (dt > 0) velocity = (b.x - a.x) / dt;
      }

      const ids = navIdsRef.current;
      const cur = currentIdxRef.current;
      let navigated = false;

      if (Math.abs(diffX) > w / 3 || Math.abs(velocity) > 0.5) {
        if (diffX < 0 && cur < ids.length - 1) {
          animatingNavRef.current = true;
          pendingNavRef.current = cur + 1;
          setTransform(-2 * w, true);
          navigated = true;
        } else if (diffX > 0 && cur > 0) {
          animatingNavRef.current = true;
          pendingNavRef.current = cur - 1;
          setTransform(0, true);
          navigated = true;
        }
      }

      if (!navigated) {
        animatingNavRef.current = true;
        // pendingNavRef stays null → spring-back path in transitionend
        setTransform(-w, true);
      }
    }

    function onTransitionEnd() {
      const newIdx = pendingNavRef.current;
      if (newIdx === null) {
        // Spring-back completed
        animatingNavRef.current = false;
        return;
      }
      pendingNavRef.current = null;
      const w = pager.offsetWidth;
      // Instant reset to center — no animation
      strip.classList.remove('dm-strip--anim');
      strip.style.transform = `translateX(${-w}px)`;
      // Update React state → re-renders slot content
      currentIdxRef.current = newIdx;
      setCurrentIdx(newIdx);
      if (onNavRef.current) onNavRef.current(navIdsRef.current[newIdx]);
      animatingNavRef.current = false;
    }

    strip.addEventListener('pointerdown', onPointerDown);
    strip.addEventListener('pointermove', onPointerMove, { passive: false });
    strip.addEventListener('pointerup',     onPointerEnd);
    strip.addEventListener('pointercancel', onPointerEnd);
    strip.addEventListener('transitionend', onTransitionEnd);
    return () => {
      strip.removeEventListener('pointerdown', onPointerDown);
      strip.removeEventListener('pointermove', onPointerMove);
      strip.removeEventListener('pointerup',     onPointerEnd);
      strip.removeEventListener('pointercancel', onPointerEnd);
      strip.removeEventListener('transitionend', onTransitionEnd);
    };
  }, []);

  // ── Expose programmatic navigation for Playwright tests ─────────
  useEffectDM(() => {
    window.__dmNavigate = (dir) => {
      const ids = navIdsRef.current;
      const cur = currentIdxRef.current;
      const newIdx = dir === 'next' ? cur + 1 : cur - 1;
      if (newIdx < 0 || newIdx >= ids.length) return;
      const strip = stripRef.current;
      const pager = pagerRef.current;
      if (!strip || !pager) return;
      // Instant navigation (no animation) for reliable test timing
      strip.classList.remove('dm-strip--anim');
      strip.style.transform = `translateX(${-pager.offsetWidth}px)`;
      currentIdxRef.current = newIdx;
      setCurrentIdx(newIdx);
      if (onNavRef.current) onNavRef.current(ids[newIdx]);
    };
    return () => { delete window.__dmNavigate; };
  }, []);

  // ── Keyboard navigation ──────────────────────────────────────────
  const navigateBy = useCallbackDM((delta) => {
    if (animatingNavRef.current) return;
    const ids = navIdsRef.current;
    const cur = currentIdxRef.current;
    const newIdx = Math.max(0, Math.min(ids.length - 1, cur + delta));
    if (newIdx === cur) return;
    const strip = stripRef.current;
    const pager = pagerRef.current;
    if (!strip || !pager) return;
    const w = pager.offsetWidth;
    animatingNavRef.current = true;
    pendingNavRef.current = newIdx;
    strip.classList.add('dm-strip--anim');
    strip.style.transform = `translateX(${delta > 0 ? -2 * w : 0}px)`;
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
          <div className="dm-strip" ref={stripRef}>
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
