/* Activities.jsx — Browse + QuickPick toggle. */

const { useState: useStateAct, useMemo: useMemoAct } = React;

function ActivitiesPage({ state, dispatch }) {
  const [mode, setMode] = useStateAct('browse');

  return (
    <main className="page-main">
      <div className="page-hero">
        <div className="page-hero__top">
          <h1>Activities</h1>
          <div className="seg2" role="tablist">
            <button role="tab" aria-pressed={mode === 'browse'} onClick={() => setMode('browse')}>
              📚 Browse
            </button>
            <button role="tab" aria-pressed={mode === 'quickpick'} onClick={() => setMode('quickpick')}>
              ⚡ QuickPick
            </button>
          </div>
        </div>
      </div>

      {mode === 'browse' ? (
        <BrowseView state={state} dispatch={dispatch} />
      ) : (
        <QuickPickView state={state} dispatch={dispatch} />
      )}
    </main>
  );
}

function BrowseView({ state, dispatch }) {
  const items = window.BD_ACTIVITIES;
  const [query, setQuery] = useStateAct('');

  const trimmed = query.trim();

  const filtered = useMemoAct(() => {
    if (!trimmed) return items;
    if (trimmed.toLowerCase().startsWith('tag:')) {
      const tag = trimmed.slice(4).trim().toLowerCase();
      return items.filter(a => (a.tags || []).some(t => t.toLowerCase() === tag));
    }
    const q = trimmed.toLowerCase();
    return items.filter(a => {
      const text = [a.name || '', a.hook || '', a.description || '', ...(a.tags || [])].join(' ').toLowerCase();
      return text.includes(q);
    });
  }, [trimmed, items]);

  const totalCount = items.length;
  const matchCount = filtered.length;
  const showEmpty = trimmed.length > 0 && matchCount === 0;

  function getSuggestionChips() {
    const FIXED = ['outdoor', 'music', 'family', 'ride'];
    const allTags = new Set();
    (window.BD_ACTIVITIES || []).forEach(a => (a.tags || []).forEach(t => allTags.add(t.toLowerCase())));
    const extras = [...allTags].filter(t => !FIXED.includes(t));
    extras.sort(() => Math.random() - 0.5);
    return [...FIXED, ...extras.slice(0, 4)];
  }

  return (
    <>
      <div className="search-bar">
        <div className="search-bar__inner">
          <label className="search-input">
            <svg className="search-input__icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.5" y2="16.5" />
            </svg>
            <input
              type="text"
              placeholder="Search activities"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query.length > 0 && (
              <button
                type="button"
                className="search-input__clear"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >×</button>
            )}
          </label>
        </div>
      </div>

      <div className="result-count">
        {!trimmed ? (
          <><b>{totalCount}</b> activities</>
        ) : matchCount > 0 ? (
          <><b>{matchCount}</b> of {totalCount} activities match <span className="q">{trimmed}</span></>
        ) : (
          <><b>0</b> activities match <span className="q">{trimmed}</span></>
        )}
      </div>

      {showEmpty ? (
        <div className="empty-wrap">
          <div className="empty">
            <div className="empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.5" y2="16.5" />
                <line x1="7.5" y1="11" x2="14.5" y2="11" />
              </svg>
            </div>
            <h3>Nothing matches <span className="q">{trimmed}</span></h3>
            <p>Branson isn't a lake-sports town this trip — the family voted for shows and rides. Try a broader word, or pick a starter below.</p>
            <div className="empty__suggest">
              {getSuggestionChips().map(chip => (
                <button
                  key={chip}
                  className="chip"
                  type="button"
                  onClick={() => setQuery('tag:' + chip)}
                >{chip}</button>
              ))}
            </div>
            <button
              type="button"
              className="empty__clear"
              onClick={() => setQuery('')}
            >Clear search</button>
          </div>
        </div>
      ) : (
        <div className="catalog-grid">
          {filtered.map(a => (
            <CatalogCard
              key={a.id}
              activity={a}
              userId={state.userId}
              onToggleWish={(id) => dispatch({ type: 'toggleWish', id })}
              onToggleCommit={(id) => dispatch({ type: 'toggleCommit', id })}
              onOpen={(act) => dispatch({ type: 'openDetail', id: act.id })}
            />
          ))}
        </div>
      )}
    </>
  );
}

function QuickPickView({ state, dispatch }) {
  // Show only activities the user hasn't wishlisted or skipped yet.
  const [idx, setIdx] = useStateAct(0);
  const [history, setHistory] = useStateAct([]);
  // flying: { activity, direction, startTransform } — the card that's animating off-screen.
  const [flying, setFlying] = useStateAct(null);
  const [drag, setDrag] = useStateAct({ dx: 0, dy: 0, dragging: false });
  const dragRef = React.useRef({ startX: 0, startY: 0, pointerId: null });

  const [deck, setDeck] = useStateAct([]);
  React.useEffect(() => {
    const unseen = window.BD_ACTIVITIES.filter(
      a => !a.wish.includes(state.userId) && !a.commit.includes(state.userId)
    );
    for (let i = unseen.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
    }
    setDeck(unseen);
  }, [state.userId]);

  function decide(direction, fromTransform) {
    if (flying || idx >= deck.length) return;
    const a = deck[idx];
    // Capture the swiped card, advance idx immediately so the next card renders in center.
    setFlying({ activity: a, direction, startTransform: fromTransform || null });
    if (direction === 'right') dispatch({ type: 'toggleWish', id: a.id });
    setHistory(h => [...h, { idx, direction }]);
    setIdx(i => i + 1);
    setDrag({ dx: 0, dy: 0, dragging: false });
    // Clear flying once its fly-off animation completes.
    window.setTimeout(() => setFlying(null), 380);
  }

  function undo() {
    if (history.length === 0 || flying) return;
    const last = history[history.length - 1];
    if (last.direction === 'right') dispatch({ type: 'toggleWish', id: deck[last.idx].id });
    setHistory(h => h.slice(0, -1));
    setIdx(last.idx);
  }

  // ─── Keyboard shortcuts (Tinder-style + extras) ──────────────────
  React.useEffect(() => {
    function onKey(e) {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (idx >= deck.length) return;
      if (e.key === 'ArrowLeft')      { e.preventDefault(); decide('left'); }
      else if (e.key === 'ArrowRight'){ e.preventDefault(); decide('right'); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); dispatch({ type: 'commit', id: deck[idx].id }); decide('right'); }
      else if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undo(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, deck, flying, history]);

  // ─── Pointer / touch drag handlers ──────────────────────────────
  function onPointerDown(e) {
    if (flying || idx >= deck.length) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, pointerId: e.pointerId };
    setDrag({ dx: 0, dy: 0, dragging: true });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  }
  function onPointerMove(e) {
    const r = dragRef.current;
    if (r.pointerId == null) return;
    setDrag({ dx: e.clientX - r.startX, dy: e.clientY - r.startY, dragging: true });
  }
  function onPointerUp(e) {
    const r = dragRef.current;
    if (r.pointerId == null) return;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    const THRESH = 110;
    dragRef.current = { startX: 0, startY: 0, pointerId: null };
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    if (dx > THRESH) {
      const fromTransform = `translate(${dx}px, ${dy * 0.4}px) rotate(${dx * 0.06}deg)`;
      decide('right', fromTransform);
    } else if (dx < -THRESH) {
      const fromTransform = `translate(${dx}px, ${dy * 0.4}px) rotate(${dx * 0.06}deg)`;
      decide('left', fromTransform);
    } else {
      setDrag({ dx: 0, dy: 0, dragging: false });
    }
  }

  if (idx >= deck.length && !flying) {
    return (
      <div className="empty">
        <h3>You're caught up.</h3>
        <p>You've made a call on every activity in the deck. Head over to <b>Interests</b> to see your wishlist.</p>
      </div>
    );
  }

  const top = deck[idx]; // may be undefined if we're flying the last card
  const remaining = deck.length - idx;

  const dragStyle = drag.dragging
    ? { transform: `translate(${drag.dx}px, ${drag.dy * 0.4}px) rotate(${drag.dx * 0.06}deg)`, transition: 'none' }
    : null;
  const wishOpacity = Math.max(0, Math.min(1, drag.dx / 110));
  const skipOpacity = Math.max(0, Math.min(1, -drag.dx / 110));

  return (
    <div className="deck-wrap">
      <div className="deck-count">{remaining > 0 ? `${idx + 1} of ${deck.length}` : 'Last one done'}</div>
      <div className="deck-stage">
        {/* The new top card -- fresh mount on every idx change so it has no entry animation. */}
        {top && (
          <DeckCard
            key={`top-${top.id}-${idx}`}
            activity={top}
            className={`top ${drag.dragging ? 'dragging' : ''}`}
            style={dragStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            wishStampOpacity={wishOpacity}
            skipStampOpacity={skipOpacity}
            onCommit={() => { dispatch({ type: 'commit', id: top.id }); decide('right'); }}
            onSkip={() => decide('right')}
          />
        )}
        {/* The card that's been swiped — overlays the new top while it animates away. */}
        {flying && (
          <DeckCard
            key={`fly-${flying.activity.id}-${idx}`}
            activity={flying.activity}
            className={`flying flying--${flying.direction}`}
            style={flying.startTransform ? { transform: flying.startTransform } : null}
          />
        )}
      </div>
      <div className="deck-actions">
        <button className="deck-btn deck-btn--undo" onClick={undo} disabled={history.length === 0 || !!flying} aria-label="Undo">↶</button>
        <button className="deck-btn deck-btn--skip" onClick={() => decide('left')} aria-label="Skip">✗</button>
        <button className="deck-btn deck-btn--wish" onClick={() => decide('right')} aria-label="Add to wishlist">♥</button>
        <button className="deck-btn deck-btn--commit" onClick={() => { if (!top) return; dispatch({ type: 'commit', id: top.id }); decide('right'); }} disabled={!top} aria-label="Commit">✓</button>
      </div>
      <div className="deck-kbd">
        Swipe, tap, or use
        <span className="kbd">←</span> skip ·
        <span className="kbd">→</span> wishlist ·
        <span className="kbd">↑</span> commit ·
        <span className="kbd">Z</span> undo
      </div>
    </div>
  );
}

function DeckCard({ activity, className = '', style, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, wishStampOpacity = 0, skipStampOpacity = 0, onCommit, onSkip }) {
  return (
    <div
      className={`deck-card ${className}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="deck-card__thumb">
        <img src={activity.thumb} alt="" draggable="false" />
        {wishStampOpacity > 0 && (
          <div className="deck-card__stamp deck-card__stamp--wish" style={{ opacity: wishStampOpacity }}>WISHLIST</div>
        )}
        {skipStampOpacity > 0 && (
          <div className="deck-card__stamp deck-card__stamp--skip" style={{ opacity: skipStampOpacity }}>SKIP</div>
        )}
      </div>
      <div className="deck-card__body">
        <h3>{activity.name}</h3>
        <p className="deck-card__desc">{activity.hook}</p>
        <div className="deck-card__meta">
          <span className="minichip price">{activity.price}</span>
          <span className="minichip rating">★ {activity.rating}</span>
          <span className="minichip">{activity.drive}</span>
          <span className="minichip">♥ {activity.wish.length}</span>
          <span className="minichip">✓ {activity.commit.length}</span>
        </div>
        {(onCommit || onSkip) && (
          <div className="deck-card__actions" onPointerDown={(e) => e.stopPropagation()}>
            {onCommit && (
              <button
                className="btn btn--primary btn--small"
                disabled={activity.locked}
                onClick={(e) => { e.stopPropagation(); onCommit(); }}
              >Count me in</button>
            )}
            {onSkip && (
              <button
                className="btn btn--secondary btn--small"
                onClick={(e) => { e.stopPropagation(); onSkip(); }}
              >+ Wishlist</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ActivitiesPage });
