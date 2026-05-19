/* Interests.jsx — Wishlisted / Committed sub-view of the user's saved activities. */

const { useState: useStateInt } = React;

function InterestsPage({ state, dispatch }) {
  const [view, setView] = useStateInt(() => localStorage.getItem('bd-interests-view') || 'wishlisted');
  function switchView(v) {
    setView(v);
    try { localStorage.setItem('bd-interests-view', v); } catch (e) {}
  }

  const { wishlisted, committed } = window.BD_GET_USER_ACTIVITIES(state.userId);
  const items = view === 'committed' ? committed : wishlisted;
  const cardState = view === 'committed' ? 'committed' : 'wishlist';

  return (
    <main className="page-main">
      <div className="page-hero">
        <div className="page-hero__top">
          <h1>Your interests</h1>
          <div className="seg2 alt" role="tablist">
            <button role="tab" aria-pressed={view === 'wishlisted'} onClick={() => switchView('wishlisted')}>
              ♥ Wishlisted · {wishlisted.length}
            </button>
            <button role="tab" aria-pressed={view === 'committed'} onClick={() => switchView('committed')}>
              ✓ Committed · {committed.length}
            </button>
          </div>
        </div>
      </div>

      {view === 'wishlisted' && wishlisted.length >= 26 && <SlotWarn count={wishlisted.length} />}

      {items.length === 0 ? (
        <div className="empty">
          <h3>{view === 'committed' ? "You haven't committed to anything yet." : 'Your wishlist is empty.'}</h3>
          <p>
            {view === 'committed'
              ? <>Move things from your wishlist into commits by hitting <b>I'm in</b> on any wishlist card.</>
              : <>Head to <b>Activities</b>, tap a heart on anything that looks interesting, and it'll show up here.</>
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {items.map(a => (
            <DenseCard
              key={a.id}
              activity={a}
              state={cardState}
              userId={state.userId}
              onToggleWish={(id) => dispatch({ type: 'toggleWish', id })}
              onToggleCommit={(id) => dispatch({ type: 'toggleCommit', id })}
            />
          ))}
        </div>
      )}
    </main>
  );
}

Object.assign(window, { InterestsPage });
