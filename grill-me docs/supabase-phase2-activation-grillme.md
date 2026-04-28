# Supabase Phase 2 Activation -- Hermes Grill-Me

_Hermes-generated Q&A for Alex's review before lazlo is invoked._
_Blank "Alex's Thoughts:" = full approval. Any text = discuss before proceeding._

---

## picks.js -- init() Hydration

**Q1: When Supabase returns picks for the current user, what happens to local picks that Supabase does NOT have a row for?**
Answer: Keep them. Additive merge -- Supabase wins only for slugs it explicitly returns. Local-only picks survive. Deleting them would be destructive and unexpected on first sync from a new device.

Alex's Thoughts:

---

**Q2: Should the init() hydration show any loading indicator or block the page from rendering?**
Answer: No. Fire-and-forget. localStorage data renders immediately. Supabase data updates state silently when it arrives. No spinner, no toast, no delay.

Alex's Thoughts:

---

## picks.js -- sbSet() Error Banner

**Q3: Should the error banner auto-dismiss after a timeout, or persist until the user takes action?**
Answer: Persist. Auto-dismiss risks the user missing the error entirely. Banner stays visible until Retry succeeds or user navigates away.

Alex's Thoughts:

---

Q4: The Retry button will re-attempt the failed Supabase write once. If the retry also fails, the banner text updates to say the retry failed. Should we offer a second retry or stop there?
Answer: Stop at one retry. One visible failure message is enough. If the network is down, retrying twice without user action changes nothing useful.

Alex's Thoughts: 

---

## attractions.html -- Who-Wishlisted Badges

**Q5: Should badges appear on cards immediately at page load, or only after fetchAllWishlists() resolves (async)?**
Answer: Async. Cards render immediately from data.json. Badges are appended silently when fetchAllWishlists() returns. No placeholder, no loading state for badges specifically.

Alex's Thoughts:

---

**Q6: Where on the card should the badges appear? Below the filter chip row? Above the title? As an overlay?**
Answer: Below the existing chip row (`.card--light__row`). Subtle addition at the bottom of the card body. No overlay, no prominent placement -- this is supporting info, not primary.

Alex's Thoughts:

---

**Q7: Should "who else wishlisted this" badges also appear in the detail modal, or cards only for now?**
Answer: Cards only for now. The detail modal already has `#dm-avatars` for this purpose, but wiring it is post-launch scope. Not needed for May 8.

Alex's Thoughts:

---

Q8: fetchAllWishlists() will be updated to include both 'wishlist' AND 'committing' states. Should a user with state='committing' get a differently-styled badge vs 'wishlist'?
Answer: No. Same badge style for both. The distinction between wishlist and committing is subtle enough that a visual difference would add noise, not clarity. Both mean "this person wants to go."

Alex's Thoughts:

---

## suggested.html -- Known Discovery

Q9: suggested.html already has `var SB_URL` and `var SB_KEY` hardcoded at lines 180-181, duplicating picks.js constants. Should lazlo clean this up or leave it?
Answer: Leave it. The anon key is safe for client code (designed for this use). Cleaning it up risks breaking its existing fetch logic. Lazlo flags it in the handback report only.

Alex's Thoughts:

---

**Q10: suggested.html has functional CSS for suggestion display (`.btn-add-wish`, `.btn-no-thanks`, `.suggestion-from`) suggesting it may already attempt to fetch from the Supabase suggestions table. Should lazlo wire it fully in this pass, or defer to a separate task?**
Answer: Defer. This pass is assessment-only for suggested.html. Wiring the full suggestion workflow is a separate, scoped task. Lazlo documents the current state and makes zero changes.

Alex's Thoughts:

---

## wishlist.html -- Read-Only Assessment

Q11: wishlist.html loads picks.js and has an embedded ATTRACTIONS_DATA array. The expectation is that it uses picks.getAll() to filter which slugs to display. If lazlo confirms this, does anything else need to change?
Answer: Nothing. If wishlist.html calls picks.getAll(), then the init() hydration from step 1 is sufficient -- Supabase data will be in localStorage before the page renders the wishlist. No changes to wishlist.html in this pass.

Alex's Thoughts:

---

## Cross-Cutting

Q12: Badge inline styling (no new CSS classes) means lazlo will use style="" attributes. Is this acceptable given the locked CSS system?
Answer: Yes. The design system lock means no changes to tokens.css, components.css, or trail.css. Inline styles are the correct mechanism for one-off per-component additions that don't warrant a new CSS class. If the badge style needs refinement post-launch, it can be elevated to a component class then.

Alex's Thoughts:

---

Q13: The brief specifies that SUPABASE_ANON_KEY must not be copied to any new file. suggested.html already has it. This is pre-existing, not introduced by this task. Lazlo documents it; we're not removing it. Is this the right call?
Answer: Yes. The key was already public (GitHub Pages repo). Removing it from suggested.html would require understanding its full fetch logic -- out of scope for this pass. Document and move on.

Alex's Thoughts:

---

## Overall Approval

Alex's Thoughts (overall flags or "let's discuss in chat"):

