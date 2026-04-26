# Task Brief: help.html -- Branson '26 Dashboard User Guide

**READ CLAUDE.md IN FULL BEFORE WRITING A SINGLE LINE OF CODE.**

---

## What You Are Building

A completed `web/help.html` page for the Branson '26 family vacation dashboard.

The stub already exists and has the correct `<head>`, theme loader script, and opening `<body>` tag with `<script src="js/site.js"></script>`. You are filling in the `<main>` body content only. You are writing a friendly, plain-English user guide for non-technical family members who will read it on their phones.

**This is a static HTML content page. Zero JavaScript required or allowed.**

---

## The Family Reading This

Family members ranging from kids (Mycah, Bee, McKinley) to grandparents. They are on phones. They are NOT tech people. They just want to know: "what does this button do?" Write like you are explaining the app to your Aunt who has never used a web app.

Warm, friendly, brief. Do not be condescending. Do not be technical.

---

## Existing Page Structure to Follow

Model your markup structure on `profile.html`:

```html
<main class="page-main">
  <div class="page-hero">
    <h1>Page Title</h1>
    <p class="hero-sub">One sentence describing the page.</p>
  </div>

  <section class="profile-section" id="section-id" aria-labelledby="h-id">
    <h2 id="h-id">Section Heading</h2>
    <p class="help">Explanatory body text. Use Atkinson Hyperlegible font via CSS (already in tokens.css). Body paragraphs are just <p> tags with class="help".</p>
  </section>
</main>
```

You may also use:
- `<ul>` / `<li>` inside a section for step lists
- `<strong>` for emphasis
- HTML entities for emoji where needed (or actual Unicode emoji -- both are fine)

Do NOT add any `<style>` block unless it is a micro-fix for a documented layout issue in CLAUDE.md. The design system handles everything.

Do NOT use any component class that isn't already used in other pages (wishlist.html, profile.html, attractions.html). Read those pages before writing help.html.

---

## Content To Write

The page title should be: **Help**  
The hero subtitle should be: **How to use the Branson '26 dashboard.**

Write a section for each of the following. Keep each section SHORT -- 2-4 sentences max per section. Family members will skim this, not read every word.

### Section 1: "Get started" (id: section-start)
First thing: set your name. Tap the person icon in the top-right corner (or go to Profile in the menu). Pick your name from the list. The dashboard remembers you and saves your picks automatically.

### Section 2: "Activities" (id: section-activities)  
Tap Activities to browse everything to do in Branson. You can filter by type (shows, outdoors, food, etc.) using the chips at the top. Tap the heart on any card to save it to your Wishlist.

### Section 3: "Quick Pick" (id: section-quickpick)
A fast way to sort through activities without reading every one. Swipe right (or tap ✓) if you're interested -- swipe left (or tap ✕) to skip. Find it via the Quick Pick button inside Activities.

### Section 4: "Wishlist" (id: section-wishlist)
Everything you've hearted shows up here. Tap the heart again to remove something. You can see other family members' wishlists too -- which is a great way to find out what everyone wants to do.

### Section 5: "Suggested" (id: section-suggested)
The dashboard looks at the interests you set in Profile and suggests activities you haven't seen yet. Set your interests in Profile to get better suggestions.

### Section 6: "Timeline" (id: section-timeline)
See what's scheduled for each day of the trip. Tap a day to expand it. Great for planning which days are already packed.

### Section 7: "People" (id: section-people)
Shows when each family member is in Branson. If you set your arrival and departure dates in Profile, you'll show up on this chart.

### Section 8: "Profile" (id: section-profile)
Your settings home base. Set your name, pick a color theme (there are 14 to choose from!), choose light or dark mode, set your trip dates, and choose your interests. Everything saves automatically -- no sign-in needed.

### Section 9: "Questions or problems?" (id: section-contact)
Ask Alex. He built this and is happy to help.

---

## File to Edit

`web/help.html`

The stub currently ends at `<main class="page-main">` with nothing inside. Fill in the `<main>` content only. Do not touch anything before `<main>` or after `</main>`.

Close the `<main>` with `</main>` and close `<body>` and `</html>` properly.

Final structure must be:
```
<body>
<script src="js/site.js"></script>
<main class="page-main">
  ... your content here ...
</main>
</body>
</html>
```

---

## What You Must NOT Do

- Do NOT run `generate_dashboard.py` under any circumstances
- Do NOT touch any other HTML file
- Do NOT touch `web/data.json`, `data/attractions.json`, or `data/blacklist.json`
- Do NOT run `export_data.py` (data hasn't changed)
- Do NOT run the GitHub Pages sync / rsync
- Do NOT commit or push anything
- Do NOT add a `<style>` block unless there is a documented bug you are fixing
- Do NOT add any JavaScript
- Do NOT copy-paste a static `<header>` or `<nav class="bottom-tabs">` -- site.js handles this

---

## Handback

When done, produce the three-section handback report required by CLAUDE.md (files changed, architectural choices, invariants affected), then STOP.

Do not push. Do not commit. Do not rsync. Hermes reads the handback and handles deployment.
