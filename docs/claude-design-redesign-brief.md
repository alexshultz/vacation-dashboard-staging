# Claude Design Brief -- Branson '26 Family Dashboard
*Compiled 2026-05-17. PM: vacation-coordinator.*

## What This Is

A family vacation website for a multi-generational family group. Family members range from age 12 to 74, average or better tech literacy. The site lets family members browse activities, express interest, commit to things they plan to do, and see the trip schedule. The admin has full visibility and control over all of it.

You are being handed the live staging repo and URL. This is a redesign -- not a greenfield build. The existing design was made on-the-fly without formal design theory. A critical look is invited. Better holistic design decisions will be welcomed. Do not treat the existing design as a constraint.

---

## Design Philosophy

- **Simplicity first.** Both Apple and Nintendo get this right: clean, elegant, consistent, intentional, modern. Use that as your north star.
- **One theme.** No user-selectable themes. One designed theme, presented confidently.
- **System accessibility honored gracefully.** Honor CSS media queries (`prefers-contrast`, `prefers-color-scheme`, `prefers-reduced-motion`, etc.) without breaking the designed theme. The design adapts; it does not surrender.
- **Baseline must be inherently comfortable.** Do not rely on device or browser accessibility settings to make the design usable. The baseline -- before any system settings apply -- must be comfortable for a 12-year-old and a 74-year-old without adjustment.
- **Dyslexia-friendly typography.** Claude Design has full font authority. If a better choice exists than what the repo currently uses, make it.
- **Consistent across the site.** Interface element placement and style must be consistent across all pages.

---

## Platform Requirements

- The interface must work well and look fabulous on any device and any browser.
- Use what the platform provides. If a touchscreen is available, optimize for touch. If a keyboard and mouse are available, optimize for those. Many devices provide both -- handle that gracefully.
- Adapt to the browser window shape, not the device type. A narrow tall window and a wide short window each have different amounts of "extra" real estate. Controls and navigation should occupy that extra space rather than competing with content. A narrow tall window has more vertical room; a wide short window has more horizontal room. Design navigation and controls to take advantage of whichever dimension has the room to spare.
- Dyslexia-friendly typography and system accessibility queries apply on all platforms.

---

## Page Inventory

**Pages being deleted (engineering task -- not Claude Design's concern, but be aware they are gone):**
- shows.html (zombie -- was never properly deleted)
- suggested.html
- people-timeline.html
- quick-pick.html (absorbed into Activities)

**7 pages remaining:**

| Page | Name | Notes |
|---|---|---|
| index.html | Home | Keep |
| attractions.html | Activities | Redesign -- absorbs QuickPick |
| wishlist.html | Interests | Renamed and redesigned |
| event-timeline.html | Timeline | Redesign |
| profile.html | Profile | Keep |
| help.html | Help | Keep |
| admin.html | Admin | Not in family nav -- admin only |

---

## Universal Activity Card

Every activity card -- on every page, in every context -- must support:

- **Wishlist count** -- how many family members have wishlisted this
- **Commit count** -- how many family members have committed to this
- **Wishlist button** -- toggles the user's wishlist status. Always available.
- **Commit button** -- toggles the user's commit status. Becomes read-only when admin has locked the activity.
- **Locked state** -- a visible locked indicator when the admin has locked the activity. Commit is frozen. Wishlist still works.

User-facing terminology:
- "Wishlist" -- soft signal: I'm interested
- "Commit" -- strong signal: I plan to do this

---

## Activities Page (attractions.html)

- Toggle switch immediately to the right of the page name. Two modes: **Browse** and **QuickPick**.
- **Browse** -- catalog of all activities. Filter/search capabilities exist in current code.
- **QuickPick** -- one card at a time. Swipe right (or button) = wishlist. Swipe left (or button) = skip. Undo available. Keyboard shortcuts exist for desktop (arrows, Z). Both wishlist and commit controls available on each QuickPick card.
- Both modes use the universal activity card spec above.

---

## Interests Page (wishlist.html)

- The page formerly called "Wishlist."
- Toggle at the top of the page, immediately next to the page name. Two views:
  - **Wishlisted** -- activities the user has wishlisted (default)
  - **Committed** -- activities the user has committed to
- Loads with the user's last chosen view.
- Both views use the universal activity card spec.
- If "Interests" is not the best name for this page, Claude Design may propose a better one. The page purpose: a personal view of things you've flagged or committed to.

---

## Timeline Page (event-timeline.html)

This page shows the trip's scheduled events (not the attraction catalog -- these are specific things happening on specific days and times).

**Two event types:**
- **Commitment** -- admin assigns specific attendees. Those people are committed to this event.
- **Meal** -- Everyone by default. A live headcount shows how many people are expected, adjusted for anyone committed to a conflicting event at the same time.

**Timeline layout:** Claude Design's call. Apple Calendar "Day" view is a reasonable reference point. Overlapping events must be supported in the layout.

**People-picker:**
- Default: the current user's own activities are highlighted on the timeline.
- A picker allows the user to select one or more people to highlight their activities instead (a parent might want to see their children's schedules).
- A toggle to hide the full timeline and show only the selected people's activities.

**Data shown on timeline:**
- Group view: commit count per event, plus a visual indicator showing whether the current user is committed.
- Everyone sees full data -- no restricted views for family members.

**Conflicts:**
- Two committed events overlapping in time = alert. Show this to everyone.
- Meal + committed event overlap = visual indicator only, no alert.

**Interaction:**
- Clicking a timeline event opens the activity card for that event.
- From the activity card: commit/uncommit, wishlist, and -- for scheduled events -- add to device calendar.

---

## Profile Page

- User sets their name here.
- Admin access is available from the Profile page for users with admin privileges.
- Existing auth system: username entry, admin-flagged users get an additional login step (Supabase email/password). Claude Design improves the UX of this flow but does not replace the underlying system.

---

## Admin

The admin has elevated capabilities that appear throughout the site when logged in:

- **Filtered data visibility on activity cards:** show only cards that have at least one wishlist or commit. For each visible card: who wishlisted, who committed, popularity ranking by both signals.
- **Full timeline data:** all attendee data visible.
- **Event management:** create, edit, schedule, archive, restore, delete events.
- **Meal management:** manual override of who is eating at each meal.
- **Event locking:** admin can lock an activity to freeze commit responses.
- **All changes reflect immediately** -- no page refresh required.

Admin UI is integrated with the existing family pages (not a separate admin site). Admin controls appear in context when the admin is logged in.

---

## Live Data

The interface reflects live data. When any user makes a change (wishlist, commit, etc.) or when the admin makes a change, it appears immediately for everyone without a page refresh. This affects loading states, skeleton screens, and optimistic update patterns -- design accordingly.

---

## What Claude Design Has Full Authority Over

- **All navigation** -- the full nav solution across all platforms and window sizes. Bottom mobile tabs have been removed. Solve navigation well for all contexts.
- Timeline format and layout
- Font selection (dyslexia-friendly, full authority -- improve what's there)
- Any design improvement over the existing seat-of-the-pants decisions
- Browse/QuickPick integration within the Activities page
- Conflict visual design on the timeline
- People-picker UI design
- Page naming (if "Interests" has a better alternative, propose it)
- Any area where current design choices lack formal design reasoning

---

## Out of Scope for Claude Design

These are implementation concerns for the engineering team:

- Internal state naming in the codebase
- SMS/iMessage/push notifications
- Supabase schema or backend changes
- Admin authentication system replacement
- Device calendar integration mechanics
- File deletions

---

*Repo and live staging URL to be supplied by Alex.*
