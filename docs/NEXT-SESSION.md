# NEXT-SESSION.md
Updated: 2026-05-04 (pre-reboot handoff)

## Immediate: Confirm on Arrival

1. **Chip color mockup** -- did Alex see it and approve the proposals?
   - URL: https://vacation-dev.creeperbomb.com/chip-color-mockup.html
   - specialty-food: diagonal split Food(#C4601A) / Shopping(#7A4A8A)
   - outdoor: #3A7A5A forest green (replaces moss/active collision)
   - If approved: proceed to lazlo brief `.claude/category-chip-system-task.md`
   - If not seen: ask Alex to review before any brief is written

2. **Unidentified cron job** -- Alex asked to fix, test, and schedule a cron job
   but session ended before identifying which one.
   - Candidates: Playwright e2e suite (against staging), Supabase keepalive
   - Ask Alex which one before touching any code

---

## Chip Color System -- NOT Implemented (8 blocking conditions)

Council result 2026-05-04: CAVEAT. Do not implement until all resolved.

Alex must answer each before a lazlo brief is written:
1. **Replaces or augments?** -- Does the category chip strip REPLACE the existing
   filter popover, or sit above it? Determines HTML structure and JS arch.
2. **CSS color sourcing** -- Hardcoded hex in components.css (violates token-only
   rule) OR add 8 new tokens to tokens.css? Needs explicit documented exception
   if hex is chosen.
3. **Dark mode variants** -- 8 new chip colors need dark mode overrides. Who
   defines them and when?
4. **outdoor green** -- pending mockup review (see above)
5. **indoor + relaxed** -- 228 and 93 attractions respectively. Assign to a
   category or explicitly deprecate (they become unreachable with category chips).
6. **at-downtown-bentonville** -- include or exclude from @-prefix area tag rename?
7. **free tag** -- Duration or price/status? Determines which chip category it lives in.
8. **quick-pick.html parity** -- must be updated in parallel with attractions.html.

---

## Pre-launch Checklist (May 8 target)

- [ ] Chip color mockup reviewed and approved (or rejected)
- [x] Search bar on attractions.html -- SHIPPED TO STAGING (2026-05-05, commit 664e5c3). Say "ship it" to promote.
- [ ] help.html entry-point link on profile.html -- still missing
- [ ] help.html -- completion state UNKNOWN -- verify before invoking lazlo
      check: `grep -c 'fetch.*help.json' web/help.html` -- must return 1
- [ ] Tester pass: Ashlyn, Jordan, Mycah (none confirmed yet)
- [ ] Family link sent

---

## Staging State (as of 2026-05-04)

- vacation-dev.creeperbomb.com: chip-color-mockup.html at root (review file only)
- Data sprint (82 new entries, 317 total) staged but NOT promoted to production
  - All 82 entries carry training-knowledge caveat -- verify before promoting
  - Flea markets NOT researched (web tools were down that session)
- Admin sprint (Supabase auth, event editor, index admin) staged but NOT promoted
- Production is clean at the 2026-05-03 state

---

## Deferred Items

- Flea markets near Branson (May 23-28 dates) -- need web research
- Production promotion of data sprint -- waiting for "ship it"
- Production promotion of admin sprint -- waiting for "ship it"
- Star Wars theme font (Star Jedi) -- approved, not implemented
- Dark mode chip tokens -- post-launch
- Supabase Q14a (site.js admin nav gate to Supabase session) -- post-launch cleanup
