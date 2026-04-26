# Task: help.html -- Runtime JSON Renderer + help.json Content

**Date:** 2026-04-26
**Requestor:** Alex (via Vacation PM)
**ADR reference:** ADR-009
**Grill-Me:** Complete -- proceed to full implementation.

---

## Context

`web/help.html` currently has hard-coded HTML sections. Per ADR-009, help content must be sourced from `web/help.json` via a runtime `fetch()` call. The HTML sections must be stripped and replaced with a JS renderer. A new `web/help.json` file must be created with all content. A "Help" entry-point link must be added to `web/profile.html`.

**READ CLAUDE.md IN FULL BEFORE WRITING A SINGLE LINE OF CODE.**

---

## Deliverables

1. **`web/help.json`** -- NEW file. Canonical content source.
2. **`web/help.html`** -- REWRITE `<main>` content only. Strip all hard-coded sections. Add fetch + renderer JS.
3. **`web/profile.html`** -- ADD one Help link in the page footer or below the last section.

---

## Deliverable 1: `web/help.json`

Schema:

```json
{
  "sections": [
    {
      "id": "section-whatisthis",
      "heading": "What is this?",
      "body": "..."
    }
  ]
}
```

### Section content (exact -- do not paraphrase or rewrite)

Include ALL sections in this exact order:

```json
{
  "sections": [
    {
      "id": "section-whatisthis",
      "heading": "What is this?",
      "body": "This is the Shultz family's planning board for the Branson trip. Browse shows, attractions, and activities, then mark what you want so we can figure out what to book and when.\n\nNo account or password needed. Just pick your name and you're in."
    },
    {
      "id": "section-start",
      "heading": "Get started",
      "body": "First thing: set your name:\n\n- Tap the **person icon** in the top-right corner (or go to **Profile** in the menu)\n- Pick your name from the list\n- The dashboard remembers you and saves your picks automatically"
    },
    {
      "id": "section-activities",
      "heading": "Activities",
      "body": "Tap **Activities** to browse everything to do in Branson. Use the chips at the top to filter by type (shows, outdoors, food, and more). Tap the heart on any card to save it to your Wishlist."
    },
    {
      "id": "section-quickpick",
      "heading": "Quick Pick",
      "body": "A fast way to sort through activities without reading every one. Swipe right (or tap ✓) if you're interested. Swipe left (or tap ✕) to skip. You'll find it via the **Quick Pick** button inside Activities."
    },
    {
      "id": "section-wishlist",
      "heading": "Wishlist",
      "body": "Everything you've hearted shows up here. Tap the heart again to remove something. You can also see other family members' wishlists. It's a great way to find out what everyone wants to do."
    },
    {
      "id": "section-suggested",
      "heading": "Suggested",
      "body": "The dashboard looks at the interests you set in Profile and suggests activities you haven't seen yet. Set your interests in **Profile** to get better suggestions."
    },
    {
      "id": "section-timeline",
      "heading": "Timeline",
      "body": "See what's scheduled for each day of the trip. Tap a day to expand it. Great for spotting which days are already packed."
    },
    {
      "id": "section-people",
      "heading": "People",
      "body": "Shows when each family member is in Branson. If you set your arrival and departure dates in **Profile**, you'll show up on this chart too."
    },
    {
      "id": "section-profile",
      "heading": "Profile",
      "body": "Your settings home base. Set your name, pick a color theme (there are 14 to choose from!), choose light or dark mode, set your trip dates, and choose your interests. Everything saves automatically. No sign-in needed."
    },
    {
      "id": "section-privacy",
      "heading": "Privacy",
      "body": "Right now, everyone in the family can see everyone else's wishlist. That's on purpose. It's the easiest way to spot when a bunch of people want the same thing. Think of it like a shared whiteboard, not a private diary. If you heart something embarrassing, own it. 😄"
    },
    {
      "id": "section-contact",
      "heading": "Questions or problems?",
      "body": "Ask Alex. He built this and is happy to help."
    }
  ]
}
```

---

## Deliverable 2: `web/help.html` -- rewrite `<main>` only

**Do NOT touch anything before `<body>` or the `<script src="js/site.js">` line.**

Replace the entire `<main class="page-main">...</main>` block with this structure:

```html
<main class="page-main" id="help-main">
  <div class="page-hero">
    <h1>Help</h1>
    <p class="hero-sub">How to use the Branson '26 dashboard.</p>
  </div>
  <div id="help-sections"></div>
</main>

<script>
(function () {
  function parseBody(text) {
    // Split on double newline for paragraphs
    var parts = text.split(/\n\n+/);
    return parts.map(function (part) {
      var lines = part.split('\n');
      // Detect bullet list block
      var isList = lines.every(function (l) { return l.trim() === '' || l.startsWith('- '); });
      if (isList) {
        var items = lines.filter(function (l) { return l.startsWith('- '); });
        return '<ul>' + items.map(function (l) {
          return '<li>' + inlineMd(l.slice(2)) + '</li>';
        }).join('') + '</ul>';
      }
      return '<p class="help">' + inlineMd(part) + '</p>';
    }).join('');
  }

  function inlineMd(text) {
    // **bold** only
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function render(data) {
    var container = document.getElementById('help-sections');
    if (!container) return;
    container.innerHTML = data.sections.map(function (s) {
      return '<section class="profile-section" id="' + s.id + '" aria-labelledby="h-' + s.id + '">'
        + '<h2 id="h-' + s.id + '">' + s.heading + '</h2>'
        + parseBody(s.body)
        + '</section>';
    }).join('');
  }

  function showError() {
    var container = document.getElementById('help-sections');
    if (container) {
      container.innerHTML = '<section class="profile-section"><p class="help">Help content could not be loaded. Ask Alex for assistance.</p></section>';
    }
  }

  fetch('help.json')
    .then(function (r) { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
    .then(render)
    .catch(showError);
})();
</script>
```

**Copy rule:** The JSON content above is verbatim-approved copy. Lazlo must not rewrite or paraphrase any section. However, if lazlo notices that a structural or architectural choice (e.g., a JSON field name, a rendering approach) would produce a better result if content were structured differently, it should flag the suggestion in the handback report under "Suggestions for PM review" -- not implement it silently. Content changes require PM + Alex approval.

**Notes:**
- The renderer is a plain IIFE -- no modules, no imports, no external libraries.
- `aria-labelledby` on each section uses `"h-" + s.id` -- verify the generated IDs don't collide with anything else on the page.
- On fetch failure, a friendly error paragraph is shown. `<main>` is never left empty.
- No `var` to `let`/`const` upgrade needed -- keep `var` for broadest iOS Safari compatibility (our floor is iOS Safari 16+ but conservative is fine here).

---

## Deliverable 3: `web/profile.html` -- Help entry-point link

Add a Help link in the final section of profile.html (after the last `<section>` block, before `</main>`). Exact markup:

```html
  <div class="profile-section" style="text-align:center; padding-top: 0;">
    <a href="help.html" class="btn-secondary" style="display:inline-block;">❓ Help &amp; FAQ</a>
  </div>
```

**Before adding, read profile.html in full** to confirm:
- The class `btn-secondary` exists in components.css (grep for it)
- There is no existing help link already present
- The placement (after last section, before `</main>`) doesn't break any existing JS that scans sections

If `btn-secondary` does not exist in components.css, use `<a href="help.html">Help &amp; FAQ</a>` as a plain link instead -- do not invent a class.

---

## Hard Constraints

- `web/css/tokens.css` -- LOCKED, do not touch
- `web/css/components.css` -- LOCKED, do not touch
- `web/css/themes/trail.css` -- LOCKED, do not touch
- `web/DESIGN.md` -- not relevant, do not touch
- `scripts/generate_dashboard.py` -- FROZEN, do not run
- `scripts/generate_attractions.py` -- FROZEN, do not run
- `web/data.json` -- do not touch
- All other HTML files except `help.html` and `profile.html` -- do not touch

---

## Verification

Before handback, verify:
1. `fetch('help.json')` path is correct relative to `help.html` (both in `web/` root -- no path prefix needed)
2. All 11 sections render with correct `id` attributes
3. `**bold**` renders as `<strong>` in browser
4. `- bullet` lines render as `<ul><li>`
5. `\n\n` produces a paragraph break
6. Fetch failure shows the error message, not a blank page
7. `grep -c 'fetch.*help.json' web/help.html` returns 1

---

## Handback

Produce the standard three-section handback report (files changed, architectural choices, invariants affected), then STOP. Do not commit, push, or rsync.
