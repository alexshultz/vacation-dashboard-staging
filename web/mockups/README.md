# Branson '26 — Visual Direction Mockups

Three working HTML files. Same reference page (**Attractions**), same data, same components, same accessibility baseline. Only the visual language changes.

**How to evaluate:**
1. Open each file in a browser. Best evaluated on your phone AND your laptop — the grid and nav shift between them.
2. Toggle your OS between light and dark — all three support auto-follow-OS.
3. Imagine Mom (70, needs readers) scanning the page. Imagine Bee (10, Android) tapping cards.
4. Pick the one you want to build on, OR tell me "take X's cards, Y's hero, Z's nav."

## Files

- `mockup-a.html` — **Cartridge**
- `mockup-b.html` — **Lakeside**
- `mockup-c.html` — **Trail**

## What's shared across all three

- Same 6 attraction cards showing every card state: untouched, wishlisted, confirmed, first-pick, trending
- Same avatar stack system (people who picked it)
- Same status color semantics: Green/Red/Yellow/Gray for Yes/No/Undecided/No Response, plus a distinct color each for Wishlist and Confirmed
- Same typography base: **Atkinson Hyperlegible** for body (dyslexia-friendly, designed for reading), **Lexend** for display (tuned for reading proficiency)
- Same accessibility: WCAG AA contrast on text, 16–18px body minimum, buttons at 44px tap target, color is never the only status signal (badge + text + color)
- Same layout: sticky top nav on desktop, bottom tab bar on mobile, same 300px card minimum so the grid breaks predictably
- Same dark mode support via `prefers-color-scheme`
- Same 60-KB HTML budget per mockup, Google Fonts over CDN (cached on first load, no build step)

## Direction A — Cartridge

**One-liner:** "Nintendo Switch home screen meets Apple Weather widget."

- Warm cream background, bright gradients, chunky rounded cards (24px radii)
- **Brand tile in the header** — gradient pink-to-yellow, feels like a game logo
- Tactile buttons with offset shadows ("press" down when tapped)
- Playful but uses a real grid, never cartoony
- Gradient accents on hero text and confirmed cards
- Emoji as functional microcopy (💜 wishlist, ✓ confirm) — easier for kids

**Feels like:** fun family game, celebratory. Picks feel like achievements.

**Risk:** can veer toddler-ish at small sizes — typography has to stay tight to counter it.

## Direction B — Lakeside

**One-liner:** "Apple Fitness+ meets a travel app."

- Soft blue-gray background, frosted glass nav and bottom tab bar
- Thin hairline borders, subtle shadows, no gradients except on status tints
- SF-Pro-ish tight typography, lots of whitespace
- Uses Apple's system palette (blue, pink, orange, green) so it feels native on iOS
- Cleanest, most restrained of the three
- Best choice if the grandparents will be using this — familiar iOS patterns

**Feels like:** a competent product someone shipped. "We are organized adults."

**Risk:** may feel corporate/cold to the kids. Needs the trending and avatar strips to carry the warmth.

## Direction C — Trail

**One-liner:** "Airbnb meets a National Parks app."

- Cream paper background, moss green + lake blue + sand + clay palette
- Rectangular tags (not pills) give a slightly more outdoorsy/crafty feel without being cabin-kitsch
- Underline accent on hero headline
- Stat row ("26 travelers · 14 picks so far · 7 confirmed") baked into the hero
- Nav uses underline indicators rather than filled pills
- Most "place-specific" — nods to Ozarks without costume

**Feels like:** a trip journal someone's been keeping. Warm, grounded.

**Risk:** least "modern-slick" on small phones — the paper texture and serif-display-flirtation may read as old-fashioned next to iOS native apps. Probably needs the most careful tuning on mobile.

## Things to notice when comparing

- **Confirmed vs wishlist vs untouched states** — which direction makes these differences most obvious at a glance?
- **Where your eye lands first** — countdown, today's plan, trending row, or card grid?
- **Buttons** — which style feels most tappable to you?
- **Avatars** — same system everywhere, but background color treatment differs. Which fits best?
- **Hero message tone** — Cartridge and Lakeside are action-oriented ("pick what you want"), Trail is narrative ("seven days on the lake"). Which voice fits the family?

## After you pick

Tell me which direction wins (or which bits from each). I'll:
1. Extract tokens into `web/css/tokens.css` and `web/css/components.css`
2. Refactor `generate_dashboard.py` to emit the shared nav once
3. Rebuild `attractions.html` as the fully-polished reference page
4. Ship Phase 1 before May 8, leaving two weeks for interest/RSVP + today view
