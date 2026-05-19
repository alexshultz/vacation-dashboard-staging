/* Timeline.jsx — Apple-Calendar day view with people-picker and conflict alerts. */

const { useState: useStateTl, useMemo: useMemoTl } = React;

// Convert "9:30" → 9.5
const t2 = s => { const [h, m] = s.split(':').map(Number); return h + m / 60; };

const DAY_START = 8;   // 8 AM
const DAY_END   = 23;  // 11 PM
const HOUR_PX   = 80;

function TimelinePage({ state, dispatch }) {
  const days = window.BD_SCHEDULE;
  const [dayIdx, setDayIdx] = useStateTl(2); // Monday — most interesting (has the locked event)
  const [picked, setPicked] = useStateTl([state.userId]); // people whose events are highlighted
  const [onlyMine, setOnlyMine] = useStateTl(false);

  const day = days[dayIdx];

  // Everyone committed to anything on this day — drives the people-picker chips.
  // Current user is always pinned to the front, even if they have no commits today.
  const dayPeopleIds = React.useMemo(() => {
    const set = new Set([state.userId]);
    day.events.forEach(ev => {
      if (!ev.activityId) return;
      const a = window.BD_ACTIVITIES.find(x => x.id === ev.activityId);
      if (a) a.commit.forEach(id => set.add(id));
    });
    return [...set];
  }, [day, state.userId]);

  function togglePerson(pid) {
    setPicked(p => p.includes(pid) ? p.filter(x => x !== pid) : [...p, pid]);
  }

  // detect commit-commit overlaps (alert) and meal-commit overlaps (info)
  const conflicts = useMemoTl(() => {
    const cs = [];
    const commits = day.events.filter(e => e.type === 'commit' || e.type === 'committed-lock');
    for (let i = 0; i < commits.length; i++) {
      for (let j = i + 1; j < commits.length; j++) {
        const a = commits[i], b = commits[j];
        if (t2(a.start) < t2(b.end) && t2(b.start) < t2(a.end)) {
          cs.push([a, b]);
        }
      }
    }
    return cs;
  }, [day]);

  function isMine(ev) {
    if (!ev.activityId) return false;
    const a = window.BD_ACTIVITIES.find(x => x.id === ev.activityId);
    if (!a) return false;
    return picked.some(pid => a.commit.includes(pid) || a.wish.includes(pid));
  }

  const visible = onlyMine ? day.events.filter(isMine) : day.events;

  return (
    <main className="page-main">
      <div className="page-hero">
        <div className="page-hero__top">
          <h1>Timeline</h1>
        </div>
      </div>

      <div className="timeline-wrap">
        <div className="timeline-toolbar">
          <div className="day-tabs">
            {days.map((d, i) => (
              <button
                key={d.date}
                className="day-tab"
                aria-current={i === dayIdx}
                onClick={() => setDayIdx(i)}
              >
                <small>{d.dayNum}</small>
                {d.day.slice(0, 3)} {d.date.slice(8)}
              </button>
            ))}
          </div>
          <div className="timeline-people">
            {dayPeopleIds.map(pid => {
              const p = window.BD_PEOPLE.find(x => x.id === pid);
              if (!p) return null;
              return (
                <button
                  key={pid}
                  className={`picker-btn ${picked.includes(pid) ? 'on' : ''}`}
                  onClick={() => togglePerson(pid)}
                >
                  {p.name}{pid === state.userId ? ' (you)' : ''}
                </button>
              );
            })}
            <button
              className={`picker-btn ${onlyMine ? 'on' : ''}`}
              onClick={() => setOnlyMine(v => !v)}
              title="Toggle filter"
            >
              {onlyMine ? '✓ Only picked' : 'Show all'}
            </button>
          </div>
        </div>

        <div style={{ padding: '14px 16px 0' }}>
          {conflicts.map(([a, b], i) => (
            <div className="conflict-banner" key={i}>
              <span className="icon">⚠️</span>
              <div className="text">
                <b>Schedule conflict</b> — <i>{a.title}</i> ({fmtTime(a.start)}–{fmtTime(a.end)}) and <i>{b.title}</i> ({fmtTime(b.start)}–{fmtTime(b.end)}) overlap. Anyone committed to both will have to choose.
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-grid" style={{ minHeight: (DAY_END - DAY_START) * HOUR_PX + 40 }}>
          <div className="timeline-hours">
            {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => i + DAY_START).map(h => (
              <div className="timeline-hour" key={h} style={{ height: HOUR_PX }}>
                {fmtHour(h)}
              </div>
            ))}
          </div>
          <div className="timeline-stage">
            {visible.map(ev => {
              const start = t2(ev.start), end = t2(ev.end);
              const top = (start - DAY_START) * HOUR_PX + 10;
              const height = Math.max(36, (end - start) * HOUR_PX - 4);
              const mine = isMine(ev);
              const cls =
                ev.type === 'meal' ? 'tl-event--meal' :
                ev.type === 'committed-lock' ? 'tl-event--committed' :
                'tl-event--commit';
              const conflictHere = conflicts.some(([a, b]) => a.id === ev.id || b.id === ev.id);
              const act = ev.activityId ? window.BD_ACTIVITIES.find(x => x.id === ev.activityId) : null;
              const committedPeople = act
                ? window.BD_PEOPLE.filter(p => act.commit.includes(p.id))
                : [];
              // Whether to render the roster row — only on tall enough cards (≥80px → ~1hr).
              const showRoster = committedPeople.length > 0 && height >= 80;
              return (
                <div
                  key={ev.id}
                  className={`tl-event ${cls} ${mine ? 'tl-event--mine' : ''} ${conflictHere && ev.type !== 'meal' ? 'tl-event--conflict' : ''}`}
                  style={{ top, height }}
                  role={ev.activityId ? 'button' : undefined}
                  tabIndex={ev.activityId ? 0 : undefined}
                  onClick={() => ev.activityId && dispatch({ type: 'openDetail', id: ev.activityId })}
                  onKeyDown={(e) => {
                    if (!ev.activityId) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      dispatch({ type: 'openDetail', id: ev.activityId });
                    }
                  }}
                >
                  <h4>
                    {ev.type === 'committed-lock' && '🔒 '}{ev.title}
                  </h4>
                  <div className="sub">{fmtTime(ev.start)}–{fmtTime(ev.end)} · {ev.sub}</div>
                  {showRoster && (
                    <div className="tl-event__roster">
                      <span className="tl-event__count">✓ {committedPeople.length} going</span>
                      <span className="tl-event__names">
                        {committedPeople.map(p => p.id === state.userId ? 'You' : p.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-dim)' }}>
        <Legend color="var(--moss)" label="Committed event" />
        <Legend color="var(--dusk)" label="Locked / paid" />
        <Legend color="var(--sand)" label="Meal" />
        <Legend color="var(--brick)" label="Conflict — choose one" />
      </div>
    </main>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: color, display: 'inline-block' }}></span>
      {label}
    </span>
  );
}

function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return m === 0 ? `${h12} ${period}` : `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}
function fmtHour(h) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12} ${period}`;
}

Object.assign(window, { TimelinePage });
