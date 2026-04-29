# Grill-Me: UI Polish Batch (5 Changes)
**Files:** `web/event-timeline.html`, `web/wishlist.html`
**Date:** 2026-04-28

---

## Change 1: "No Response" chip -- match outline color to text color

**Q: What color should the "No Response" chip outline use?**

The other three chips use `color-mix(in srgb, var(--status-xxx) 35%, var(--color-line))` for their border, matching their text color. The "No Response" chip currently has no inline color at all -- it falls back to the default `minichip` which uses `--color-ink-dim` text and `--color-line` border. Alex wants the outline to match the text, like the others.

**My answer:** Apply `color:var(--color-ink-dim)` and `border-color:color-mix(in srgb,var(--color-ink-dim) 35%,var(--color-line))` to both the legend chip (line 76) and the renderCard chip (line 142). Exact pattern match to the other three.

Alex's Thoughts:

---

## **⚠ Change 2: Wishlist social count -- ARCHITECTURAL BLOCKER**

**Q: How should "how many others wishlisted this" be sourced, given the app is Phase 1 (localStorage only)?**

Cross-user wishlist counts require shared state. In Phase 1, each user's picks live only in their own browser's localStorage. There is no server-side storage of picks -- Supabase Phase 2 (picks table) has not been activated.

Three options:

**Option A -- Defer to Phase 2.** Do not build this now. Add it to the Phase 2 backlog. Family gets the count feature after Supabase picks go live. Cleanest; no workaround.

**Option B -- Activate Phase 2 picks table now.** Wire the wishlist/picks flow to Supabase before May 8 instead of after. More work but completes the feature on time. Risk: Phase 2 activation is a full task with its own grill-me already written (supabase-phase2-activation-grillme.md). It was deliberately deferred post-tester-pass.

**Option C -- Static seed counts.** Hardcode a small lookup table of counts per attraction (e.g. "Alex: 12 items, Mycah: 8 items" as pre-populated data). Fake social proof. Misleading and fragile. Not recommended.

**My answer:** Recommend Option A -- defer. This feature makes no sense without real cross-user data, and that data doesn't exist until Phase 2 is live. Flag to Alex; if he wants to accelerate Phase 2, that becomes the next task.

**Alex's Thoughts:**

---

## Change 3: Separate "undecided" and "no response" from yes/no in event cards

**Q: What visual treatment separates the two groups in the expanded card body?**

The current card body is a 4-column grid (Interested, Undecided, Not Interested, No Response). Alex wants the "decided" responses (Interested, Not Interested) visually separated from the "pending" ones (Undecided, No Response) with a bit of breathing room.

**Approach options:**
- **A:** Extra left margin or padding-left on the Undecided column (3rd column) -- creates gap between cols 2 and 3
- **B:** A thin vertical rule between cols 2 and 3 using a CSS border-left on the Undecided column
- **C:** Reorder columns: Interested | Not Interested | (divider) | Undecided | No Response -- groups decided together, pending together
- **D:** Two rows: top row = Interested + Not Interested spanning full width; bottom row = Undecided + No Response, slightly indented or muted

**My answer:** Option C + B combined is cleanest. Reorder to `Interested | Not Interested | Undecided | No Response`, then add a subtle left border (1px, `var(--color-line)`, with some padding) to the Undecided column to create a visual divider. Reordering puts the decisive answers first (positive framing), and the border makes the grouping obvious without heavy chrome. The summary chips on the card header stay in current order (✓ ? ✗ –) for consistency with the legend.

Alex's Thoughts:

---

## Change 4 & 5: Legend key -- box grouping, centering, symmetrical layout

**Q: What box style, and which layout (2x2 vs 4-in-row) for the legend chips?**

Current legend (lines 72-77) is a bare `flex-wrap` div with 4 chips. On narrow screens it can wrap 3+1 (asymmetrical). Alex wants a box drawn around the group, centered on the page, and a guaranteed symmetrical layout.

**Box style options:**
- **A:** Subtle border + surface background (matches card style -- `border: 1px solid var(--color-line); background: var(--color-surface); border-radius: var(--radius-card); padding: 10px 16px`)
- **B:** Background tint only, no border (softer, less boxed)

**Layout options:**
- **A:** CSS `grid` 2 columns x 2 rows -- guaranteed 2+2 on all screen widths
- **B:** `flex-wrap` with `width: 50%` on each chip -- also gives 2+2 but less predictable
- **C:** Single row (all 4) -- works on desktop, fails on very narrow mobile (wraps to 3+1 again)

**My answer:** Box style A (matches the card system), layout Option A (2x2 CSS grid). The container gets `display:grid; grid-template-columns: repeat(2,auto); gap:8px; justify-content:center; margin: 0 auto 16px; width: fit-content; padding: 12px 18px; border: 1px solid var(--color-line); background: var(--color-surface); border-radius: var(--radius-card);`. This guarantees perfect 2+2 symmetry at all widths, is centered, and looks polished. On very wide screens (>=600px), lazlo should switch to a 4-column grid so all 4 appear in one row.

Alex's Thoughts:

---

## Scope / file changes

| File | Changes |
|------|---------|
| `web/event-timeline.html` | Changes 1, 3, 4/5 |
| `web/wishlist.html` | Change 2 (likely deferred pending Alex decision) |

## Handback format

Lazlo lists each changed line/block per file, confirms all 6 safety checks pass, and flags any element it observed but did not touch. No commit, no push.
