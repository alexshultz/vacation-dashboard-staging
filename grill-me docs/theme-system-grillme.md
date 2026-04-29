# Grill-Me: Theme System Sprint
_Covers Briefs 1-4. Review by Alex before any lazlo run._
_Blank "Alex's Thoughts" = full approval on that question._

---

## Brief 1 -- Token Rename + Shadow Fix

### Q1: Token naming convention -- --accent-1/2/3 or --accent-primary/secondary/tertiary?

**My answer:** --accent-1/2/3. Shorter, ordinal. "Primary/secondary/tertiary" implies an
importance hierarchy that doesn't map cleanly to Trail's sand/clay/dusk palette or to most
new themes. The ordinal names are semantically neutral -- which is exactly what a
theme-generic token should be. All three positions are used in components.css and all
existing themes, so the rename touches components.css and all 16 CSS files regardless.

**Alex's Thoughts:**

---

### Q2: Shadow fix -- replace the Trail-green tint inline in tokens.css vs move --shadow-2 definition into each theme file?

**My answer:** Fix inline in tokens.css with neutral rgba(0,0,0,0.10). Moving the shadow
definition to each theme file would require 16+ identical declarations and every future
theme to remember to define --shadow-2. The neutral value is visually clean on all themes.

**Alex's Thoughts:**

---

## Brief 2 -- DESIGN.md Updates

### Q3: Should the 10 orphaned DESIGN.md specs (storm-watch, cabin-fire, etc.) also be
updated with the --accent-1/2/3 rename, or only the 13 active theme specs?

**My answer:** YES, update all 23 (13 active + 10 orphaned). Brief 3 reads the orphaned specs
as source of truth for color values. If they still say "accent-sand" in their tables, it
creates confusion for lazlo and anyone reading the specs later. Brief 2's update pass is the
right time to clean them all. I've scoped it this way in the brief.

**Alex's Thoughts:**

---

## Brief 3 -- New CSS Theme Files

### Q4: For the 6 catalog themes (Airbnb, Notion, etc.) -- should I load the
popular-web-designs skill to extract more precise brand colors, or is lazlo deriving them
from general knowledge sufficient?

**My answer:** General knowledge is sufficient for this project. The popular-web-designs skill
has approximations too -- none of these are licensed brand kits. The goal is an
"Airbnb-inspired" vacation aesthetic, not pixel-perfect brand replication. Lazlo's trained
knowledge of these design systems is accurate enough for the accent/bg values that matter.

**Alex's Thoughts:**

---

### Q5: The existing 13 pop-culture themes (Superman, Star Wars, etc.) have a note in the
system prompt: "pending lazlo batch review before activation." They appear to already be
active in the THEMES array per profile.html. Is a separate quality review pass still needed,
or was that superseded when they were wired in?

**My answer:** Based on reading profile.html, all 14 themes (including the 13 pop-culture
ones) are already live in the picker -- no activation gate. The "pending review" note in the
system prompt may be stale. If you want a dedicated quality/consistency review of the 13
existing themes before we add 16 more, that's a Brief 0 we can run first. Otherwise I'll
assume they're approved as-is.

**Alex's Thoughts:**

---

### Q6: 30 themes total in the picker (14 existing + 16 new) -- is that the right UX for the
family, or should we curate down to a smaller selection?

**My answer:** 30 swatches is a lot but the picker is a visual swatch grid, not a dropdown.
Scrolling through 30 small swatches is not a burden. Family members will likely pick one and
forget about it. Better to have too many options than to debate which ones to cut. We can
always remove or hide entries post-launch.

**Alex's Thoughts:**

---

### Q7: Should Bee have input on which catalog themes to include before lazlo writes them?
You mentioned this earlier -- you didn't object to moving forward, but wanted to flag it.

**My answer:** The catalog themes are additive and cheap to add or remove from the picker
array. Better to write them all and let the family explore the picker at launch. If Bee
prefers to curate first, she can review the theme-system-discussion doc and flag any she
dislikes before Brief 3 runs. Your call.

**Alex's Thoughts:** We will leave Bee out of the loop here.

---

## Brief 4 -- Profile.html Picker Update

### Q8: Should the 16 new themes be grouped separately in the picker (e.g., a "Nature" section
and a "Catalog" section) or just appended at the end of the existing list?

**My answer:** Append at end for now. The picker renders as a flat swatch grid -- grouping
would require a UI change (section headers inside the radiogroup) that isn't scoped here.
Post-launch, if the family finds 30 themes hard to browse, we can add grouping in a follow-up
brief.

**Alex's Thoughts:**

---

## General

### Q9: Brief execution sequence confirmation -- run in this order?
  Brief 1 -> Brief 2 -> Brief 3 -> Brief 4
  Each brief waits for code review clean before the next runs.

**My answer:** Yes, strict sequence. Brief 3 depends on Brief 1's renames being in place
(new CSS must use --accent-1/2/3). Brief 4 depends on Brief 3's CSS files existing
(reads color values from them). Brief 2 can technically run in parallel with Brief 3 since
it only touches .md files, but sequential is safer and easier to review.

**Alex's Thoughts:**

---
_Post a reply in #branson-2026 or leave thoughts inline above. Silence = full approval._
