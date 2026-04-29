# Theme System -- Discussion Brief (2026-04-29)

> **READ THIS FIRST -- NO ACTION**
>
> This note is Alex thinking out loud. I want to have a conversation about these ideas
> before anything is designed, specced, or built. Do not open a grill-me, do not draft
> a task brief, do not touch any CSS or tokens. Just read this and be ready to discuss.

---

## What I discovered today

There is a Hermes skill called `popular-web-designs` -- a catalog of 54 real-world design
systems (Airbnb, Notion, Stripe, Linear, Airtable, etc.) stored as detailed markdown
templates. Each one has exact color palettes, typography hierarchies, component styles,
shadows, and font stacks -- all the tokens an agent needs to faithfully reproduce the look.

I also found out that there is a related skill called `design-md`, which wraps Google's
open-sourced DESIGN.md spec (Apache 2.0, released April 21, 2026). It is a machine-readable
YAML + markdown format that codifies a design system as formal tokens any agent can lint,
diff, and export to Tailwind or W3C token JSON.

I built a visual catalog browser at `/Users/alex/design-catalog.html` on the main machine --
54 cards, each showing the real background color, accent bar, palette swatches, and a sample
button. You can filter by Light/Dark. Worth looking at to understand the scope.

---

## The idea I am mulling over

When I started the dashboard I had vague ideas about the look and never seriously evaluated
real options. The "Trail" theme works but I built it without much reference. Now that I know
this catalog exists, I am wondering whether it is worth:

1. Picking 4-6 designs from the catalog that feel right for a family vacation app
2. Refactoring the dashboard CSS to use CSS custom properties (`var(--bg)`, `var(--accent)`,
   etc.) instead of whatever is currently hardcoded
3. Generating a `DESIGN.md` for the chosen default theme as a formal source of truth
4. Adding a small theme switcher in the header -- sets `data-theme="airbnb"` on `<html>`,
   everything changes instantly

The theme switch itself is trivial at runtime. The real question is whether the CSS
refactor is worth the effort and whether it fits within the current sprint.

---

## Candidate designs I am curious about

These are rough impressions from looking at the catalog -- I have not dug into any of them:

- **Airbnb** -- warm coral, photography-forward, literally a travel app aesthetic
- **Notion** -- warm minimalism, soft surfaces, very readable
- **Airtable** -- colorful, structured data, friendly
- **Mintlify** -- clean, green-accented, good for content/lists
- **Clay** -- organic shapes, soft gradients, warm
- **Wise** -- bright green accent, clear and friendly

---

## What I want to discuss first

Before anything happens I want answers to these questions:

- How far is the current dashboard from using CSS vars? How much refactor is actually needed?
- Does the current Trail theme already map cleanly to a DESIGN.md structure, or would that
  require significant work to codify?
- Are there content areas (photo galleries, map embeds, timeline) that would not theme
  cleanly and need separate treatment?
- Given the May 8 deadline -- is this even the right time to be thinking about this, or
  should it go on a post-launch list?
- Bee has opinions on aesthetics. Should she see the catalog before we pick candidates?

---

## Resources

- Visual catalog: `/Users/alex/design-catalog.html`
- Skill with all 54 templates: `popular-web-designs` (load via `skill_view`)
- Google DESIGN.md spec skill: `design-md`
- Current design system: `web/DESIGN.md` and `web/css/tokens.css` in the vault

---

*Authored by Hermes on behalf of Alex -- 2026-04-29*
