# Grill-Me: Wishlist "Mine / All" Toggle

**Task:** Add a Mine/All segmented toggle to the Wishlist page. Mine = current user's picks only. All = everything anyone in the family has wishlisted, with counts and (admin only) names.

**Affected files:** `web/wishlist.html` (primary), `web/css/components.css` (possible minor addition if toggle style needs it).  
**Unchanged:** `web/js/picks.js` already has `fetchAllWishlists()` -- no picks.js changes needed.

---

## Questions

**Q1: Which tab should be the default when the page first loads -- Mine or All?**  
Default answer: **Mine** (preserves current behavior; user sees their own list immediately).

Alex's Thoughts:

---

**Q2: Should an unidentified user (no name chosen yet) be able to browse the All tab without picking their name first?**  
Default answer: **Yes.** All tab shows family-wide data and doesn't require identity. The who-prompt only triggers if they try to heart something or switch to Mine.

Alex's Thoughts:

---

**Q3: The All view will call `picks.fetchAllWishlists()` which includes both `wishlist` and `committing` states. Should the count badge show both, or only `wishlist`?**  
Default answer: **Both.** If someone is "committing" they're clearly interested. Count = wishlist + committing.

Alex's Thoughts:

---

**Q4: In the All view, how should cards be sorted?**  
Default answer: **By count descending (most people wishlisted → top), then A-Z as tiebreaker.** This surfaces the most popular activities first, which is the useful view for planning.

Alex's Thoughts:

---

**Q5: When viewing All, if I tap the ♡ on a card I haven't wishlisted yet -- it adds it to my wishlist. But if I'm unidentified (no name chosen), does the who-prompt appear?**  
Default answer: **Yes.** Hearting anything from any view triggers the name-chooser if no user is set. Same behavior as current Mine view.

Alex's Thoughts:

---

**Q6: When viewing All, if I tap ♥ to un-wishlist something I had previously liked -- should the card disappear from the All view?**  
Default answer: **No.** The card stays in All (others still want it). Only my heart state changes. Cards only disappear from All if the total count drops to 0.

Alex's Thoughts:

---

**Q7: Toggle persistence -- should the Mine/All choice be saved in localStorage so the page reopens on whichever tab you used last?**  
Default answer: **Yes.** Key: `vacdash:v1:wishlist-tab`. Avoids re-clicking every visit.

Alex's Thoughts:

---

**Q8: For the toggle visual, should it use the existing `.seg` segmented-control component (same one used on the admin form and event timeline) or a custom style?**  
Default answer: **Use `.seg`.** Keeps it consistent with the rest of the site. Drop it inline next to the "Wish list" h1.

Alex's Thoughts:

---

**Q9: Should the page title/heading say "Wish list" (two words) or "Wishlist" (one word)?**  
Default answer: **"Wish List"** (two words, title case) -- matches your spec. The `<title>` tag stays "Wishlist -- Branson '26" since it's in the browser tab and doesn't show on the page.

Alex's Thoughts:

---

**Q10: The All view names section (admin only) should display under a "Wishlisted" label and list the names. Should it use the same CSS grid layout as the RSVP groups on the event timeline cards (4-column name grid), or a simpler inline comma list?**  
Default answer: **Inline list under a "Wishlisted" label**, same style as the event timeline cards' interested/undecided sections. No comma separator -- one name per row, muted color.

Alex's Thoughts:

---

**Q11: If `fetchAllWishlists()` fails (Supabase down, offline) while in All view, what should the page show?**  
Default answer: **Friendly error message in the All tab area:** "Could not load family wishlist. Check your connection and refresh." No crash, no empty state masquerading as "nobody has wishlisted anything."

Alex's Thoughts:

---

**Q12: The current hero subtitle says "Activities you've saved. Tap a card to see details." Should it change for the All view?**  
Default answer: **Yes -- update dynamically per tab.** Mine: "Activities you've saved." All: "Everything the family has wishlisted."

Alex's Thoughts:

---

## Implementation Notes (for lazlo)

- `fetchAllWishlists()` in `picks.js` returns `{ slug: [user_id1, user_id2, ...] }` (already includes wishlist + committing). Call it on tab switch or on first All render.
- The All render loop iterates the result object, looks up each slug in `attractionsMap`, builds cards sorted by count descending.
- Heart state in All view reads from `picks.get(slug)` (the current user's localStorage state) same as Mine view.
- Admin check: `document.body.classList.contains('is-admin')` (already used in admin.html and event-timeline.html).
- The "Wishlisted: [names]" section only renders when `is-admin` is true.
- The `.seg` toggle replaces the `<h1>My Wishlist</h1>` block -- new markup: `<h1>Wish List</h1>` + `<div class="seg two-btn" id="wishlist-tab-seg">…</div>` in the `.page-hero`.
- No changes to `picks.js`, `site.js`, `components.css` token names, or any other HTML files.
- Pre-push safety checks (from CLAUDE.md) still pass -- wishlist.html is not in any of those grep checks.

## Playwright Tests Required

- All tab renders cards from Supabase mock response
- Count badge shows correct number
- Admin sees names section; non-admin does not
- Heart in All view updates state without removing card
- Mine/All toggle persists in localStorage
- Who-prompt fires on heart tap when no user set (All view)
- Supabase failure shows error message (not empty state)
