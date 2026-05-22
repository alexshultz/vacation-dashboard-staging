/* DetailModal.jsx — Swiper.js 3-pane virtual carousel.

   Architecture (2026-05-21, replaces custom transform-based pager):
   - Exactly 3 `.swiper-slide.dm-pane` DOM elements always: prev / current / next slots.
   - Swiper is initialized at initialSlide:1 (center) with these 3 static slides.
   - Swiper owns all touch/gesture physics (iOS-quality, no custom pointer code).
   - On slideChange: state updates; useLayoutEffect resets Swiper to center via
     slideTo(1, 0, false) before the browser paints — zero flash.
   - Keyboard: custom handler (ArrowLeft=next, ArrowRight=prev, ArrowDown/Space=dismiss).
   - window.__dmNavigate('next'|'prev') exposed for Playwright tests (instant state, no anim).
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

  const sheetRef           = useRefDM(null);
  const backdropRef        = useRefDM(null);
  const swiperContainerRef = useRefDM(null);  // .swiper DOM element
  const swiperRef          = useRefDM(null);  // Swiper instance
  const animatingRef       = useRefDM(false); // dismiss animation guard
  const needsResetRef      = useRefDM(false); // flag: slideTo(1) needed after React render
  const suppressNavRef     = useRefDM(false); // suppress slideChange during programmatic reset

  // ── Body scroll lock ────────────────────────────────────────────
  useEffectDM(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // ── Swiper initialization ────────────────────────────────────────
  useEffectDM(() => {
    if (!window.Swiper) {
      console.error('DetailModal: Swiper not loaded');
      return;
    }
    const swiper = new window.Swiper(swiperContainerRef.current, {
      initialSlide: 1,
      slidesPerView: 1,
      loop: false,
      keyboard: { enabled: false },     // custom keyboard handler below
      allowSlidePrev: currentIdxRef.current > 0,
      allowSlideNext: currentIdxRef.current < navIdsRef.current.length - 1,
      resistance: true,
      resistanceRatio: 0.85,
      on: {
        slideChange: (sw) => {
          // Suppress when we're doing a programmatic reset to center
          if (suppressNavRef.current) return;

          const delta = sw.activeIndex - 1; // -1 = went to prev pane, +1 = went to next pane
          const ids = navIdsRef.current;
          const cur = currentIdxRef.current;
          const newIdx = cur + delta;

          if (newIdx < 0 || newIdx >= ids.length) {
            // Boundary guard — snap back to center without triggering nav
            suppressNavRef.current = true;
            sw.slideTo(1, 0, false);
            suppressNavRef.current = false;
            return;
          }

          currentIdxRef.current = newIdx;
          if (onNavRef.current) onNavRef.current(ids[newIdx]);
          needsResetRef.current = true;
          setCurrentIdx(newIdx);
        },
      },
    });
    swiperRef.current = swiper;
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true);
        swiperRef.current = null;
      }
    };
  }, []);

  // ── Reset Swiper to center BEFORE paint, after React commits DOM ─
  // slideChange moves Swiper to slide 0 or 2; this snaps it back to 1
  // (center) and updates boundary flags so the user sees the correct
  // new current slide without a flash.
  useLayoutEffectDM(() => {
    if (!needsResetRef.current) return;
    needsResetRef.current = false;
    const swiper = swiperRef.current;
    if (!swiper) return;
    suppressNavRef.current = true;
    swiper.slideTo(1, 0, false);
    suppressNavRef.current = false;
    swiper.allowSlidePrev = currentIdxRef.current > 0;
    swiper.allowSlideNext = currentIdxRef.current < navIdsRef.current.length - 1;
  }, [currentIdx]);

  // ── Keep boundary flags current for non-swipe navigation (keyboard, tests) ──
  useEffectDM(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.allowSlidePrev = currentIdx > 0;
    swiper.allowSlideNext = currentIdx < navIds.length - 1;
  }, [currentIdx, navIds.length]);

  // ── Programmatic navigation for Playwright tests ─────────────────
  useEffectDM(() => {
    window.__dmNavigate = (dir) => {
      const ids = navIdsRef.current;
      const cur = currentIdxRef.current;
      const newIdx = dir === 'next' ? cur + 1 : cur - 1;
      if (newIdx < 0 || newIdx >= ids.length) return;
      currentIdxRef.current = newIdx;
      setCurrentIdx(newIdx);
      if (onNavRef.current) onNavRef.current(ids[newIdx]);
    };
    return () => { delete window.__dmNavigate; };
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

  // ── Keyboard navigation ──────────────────────────────────────────
  const navigateBy = useCallbackDM((delta) => {
    const ids = navIdsRef.current;
    const cur = currentIdxRef.current;
    const newIdx = Math.max(0, Math.min(ids.length - 1, cur + delta));
    if (newIdx === cur) return;
    currentIdxRef.current = newIdx;
    setCurrentIdx(newIdx);
    if (onNavRef.current) onNavRef.current(ids[newIdx]);
  }, []);

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

        <div className="dm-pager">
          <div className="swiper" ref={swiperContainerRef}>
            <div className="swiper-wrapper">
              <div
                className="swiper-slide dm-pane"
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
                className="swiper-slide dm-pane"
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
                className="swiper-slide dm-pane"
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
