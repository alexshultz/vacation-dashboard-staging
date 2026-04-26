<prompt>

<role_and_goal>
You are an expert front-end engineer making three surgical, fully-tested changes to the Branson 2026 vacation dashboard in a single session. Your goal is to: (1) remove 10 stale duplicate article cards from web/attractions.html, (2) replace all remaining baked article cards in web/attractions.html with a JavaScript fetch(data.json) render loop, and (3) insert a single prefetch link tag into web/index.html. All three changes must be verified against quality gates before you stop.
</role_and_goal>

<static_background>
VAULT ROOT: /Users/alex/vaults/Vacation/Branson 2026/

KEY FILES (do not deviate from these paths):
  - web/attractions.html   ~4003 lines, hand-edited. TARGET for Changes 1 and 2 ONLY.
  - web/index.html         ~200 lines. TARGET for Change 3 ONLY.
  - web/data.json          3492 lines. Top-level keys: title, last_updated, attendees, attractions[]. Each attraction has: slug, name, category, duration_hours, price_adult, family_pass, rating, description, image, official_url, notes, tags[].
  - web/quick-pick.html    665 lines. REFERENCE ONLY — already implements fetch(data.json). Do NOT modify.
  - data/blacklist.json    Contains a "blacklist" array of slugs to exclude from rendering. Read this file with your tools; do NOT guess at its contents.
  - web/css/components.css Do NOT modify.
  - web/js/picks.js        Do NOT modify.

HARD CONSTRAINTS:
  - Do NOT run scripts/generate_dashboard.py under any circumstances — it overwrites attractions.html and destroys all hand edits.
  - Do NOT modify quick-pick.html, any file in web/css/, or web/js/picks.js.
  - Do NOT add pointerdown event listeners anywhere in attractions.html.
  - Do NOT commit or push any changes.

EXISTING CARD FORMAT (derived from actual baked cards in attractions.html — read the file to confirm before coding):
  Outer element:
    <article class="card--light"
      data-tags="<space-separated tag list>"
      data-slug="<slug>"
      data-title="<display name, HTML-entity-encoded>"
      data-desc="<full description, HTML-entity-encoded>"
      data-price="<e.g. 'from $50' or empty string>"
      data-price-adult="<e.g. '$50' or empty string>"
      data-family-pass="<e.g. '$150' or empty string>"
      data-duration="<e.g. '2h' or empty string>"
      data-rating="<e.g. '4.7' or empty string>"
      data-img="<relative path, e.g. assets/thumbs/slug-thumb.jpg>"
      data-url="<official URL>"
      data-notes="<notes string, HTML-entity-encoded>"
      data-tags-json="[&quot;tag1&quot;, &quot;tag2&quot;]">
    Inside (in order):
      <button class="heart-overlay" aria-pressed="false" aria-label="Wishlist <name>">♡</button>
      <div class="card--light__thumb">
        <img src="<path>" alt="<name>" loading="lazy" class="card--light__img">
      </div>
      <div class="card--light__body">
        <h3><name></h3>
        <p class="card--light__hook"><truncated description with trailing ...></p>
        <div class="card--light__avatars" data-slug="<slug>"></div>
        <div class="card--light__row">
          [<span class="minichip price">from $N</span> — only if price_adult is non-null/non-empty]
          <span class="minichip"><duration></span>
          <span class="minichip rating">★ <rating></span>
        </div>
      </div>
    </article>

  PRICE FORMATTING (derive exact rules from baked cards, but observed pattern):
    price_adult (number) → data-price="from $N", data-price-adult="$N", minichip class="minichip price"
    price_adult (null)   → data-price="",         data-price-adult="",  no price minichip rendered
    family_pass (number) → data-family-pass="$N"
    family_pass (null)   → data-family-pass=""

  DURATION FORMATTING:
    duration_hours (number N) → data-duration="Nh", minichip text "Nh"

  data-tags-json: must be a JSON array string with all double-quotes replaced by &quot; entities.
    Example: [&quot;1-2hr&quot;, &quot;family&quot;, &quot;music&quot;]

  data-tags attribute: space-separated list of the same tag values (plain text, no entity encoding needed).

SCRIPT INIT SEQUENCE IN attractions.html (read the file to confirm line numbers):
  Line ~116:  <div class="catalog-grid" id="catalog-grid">
  Lines ~117–3401: all baked <article class="card--light"> blocks
  Line ~3402:  </div>  (closes #catalog-grid)
  Line ~3403:  </main>
  Lines ~3405–3502: Filter-chip + refilter IIFE — captures
                    var cards = document.querySelectorAll('.catalog-grid .card--light')
                    at init time; uses cards in refilter()
  Line ~3503:  Storage sync script
  Lines ~3504–3553: Name-chooser modal HTML
  Line ~3554:  <script src="js/picks.js"></script>
  Lines ~3555–3637: Heart/wishlist handler script
  Lines ~3638–3689: Avatar stack script
  Lines ~3690–4001: Detail-modal script — at line ~3979:
                    document.querySelectorAll('.card--light').forEach(function(card){...})
  Line ~4002–4003: </body></html>

  CRITICAL SEQUENCING CONSTRAINT: The filter script (captures cards via querySelectorAll at init),
  the heart handler, the avatar stack, and the detail-modal card-click wiring ALL query
  .card--light elements. Every one of these scripts must find the dynamically-rendered cards
  already present in #catalog-grid when it runs. Since fetch() is asynchronous, you MUST
  ensure the cards are inserted into the DOM before any of these scripts execute.
  Recommended approach: dispatch a custom event (e.g. 'catalog-rendered') from the render
  script after populating #catalog-grid, and wrap each downstream script's initialization
  body inside a document.addEventListener('catalog-rendered', ...) listener. Study the
  actual order carefully before deciding on the exact injection strategy.
</static_background>

<dynamic_task>
Execute the three changes below in numbered order. Read each referenced file with your tools before writing any code. If anything you observe in the actual files contradicts these instructions, trust the files and note the discrepancy.

1. READ PHASE — Before touching anything, read and record:
   a. Open web/attractions.html. Note the exact line numbers for:
      - The opening <div id="catalog-grid"> tag
      - The first <article class="card--light"> element
      - The last </article> closing the final card
      - The closing </div> of #catalog-grid
      - Each distinct <script> block after </main>, noting what it initializes and whether it queries .card--light or .catalog-grid .card--light
   b. Open data/blacklist.json. Record every slug in the blacklist array exactly as written.
   c. Open web/data.json. Confirm the top-level structure, the attractions array location, and verify the field names (slug, name, category, duration_hours, price_adult, family_pass, rating, description, image, official_url, notes, tags).
   d. Open web/quick-pick.html. Note the fetch pattern, how it reads data.json, how it builds card HTML, and how it handles the blacklist (if at all).
   e. Open web/index.html. Confirm the last <link rel="stylesheet"> tag in <head> so you know the exact insertion point.

2. CHANGE 1 — Remove 10 stale duplicate article cards from web/attractions.html.

   SLUGS TO REMOVE (these have no corresponding entry in data.json):
     americas-top-country-hits
     awesome-80s
     bransons-wild-world
     clay-coopers-country-express
     dolly-partons-stampede
     dublins-irish-tenors-the-celtic-ladies
     fritzs-adventure
     parakeet-petes
     ripleys-believe-it-or-not
     worlds-largest-toy-museum-complex

   SLUGS TO KEEP (apostrophe-encoded versions — do NOT remove these):
     america-s-top-country-hits
     awesome-80-s
     branson-s-wild-world
     clay-cooper-s-country-express
     dolly-parton-s-stampede
     dublin-s-irish-tenors-the-celtic-ladies
     fritz-s-adventure
     parakeet-pete-s
     ripley-s-believe-it-or-not
     world-s-largest-toy-museum-complex

   For each slug in the REMOVE list: locate the entire <article> block whose data-slug attribute
   exactly matches that slug (e.g. data-slug="americas-top-country-hits") and delete from the
   opening <article tag through its matching </article>. Do not touch any other article block.
   Verify after removal that all 10 KEEP slugs are still present.

3. CHANGE 2 — Convert #catalog-grid from baked HTML to a dynamic fetch(data.json) render loop.

   3a. Delete every remaining <article class="card--light"> block from inside #catalog-grid.
       After deletion, #catalog-grid must be an empty <div class="catalog-grid" id="catalog-grid"></div>.

   3b. Insert a <script> block immediately after the closing </div> of #catalog-grid (before </main>).
       This script must:

       i.  Fetch data.json (relative path — same directory as the HTML file).
       ii. Read the blacklist slugs from the blacklist array you recorded in step 1b.
           Inline these slugs as a hardcoded JS array in the script — do NOT attempt to
           fetch ../data/blacklist.json at runtime (it is not reliably accessible from the web/ folder).
       iii. Filter out any attraction whose slug is in the blacklist array.
       iv. For each remaining attraction, build an <article class="card--light"> element using
           exactly the attribute names and inner HTML structure documented in STATIC BACKGROUND
           above. Derive the exact description truncation character count by reading 3–5 baked
           cards from the file before you delete them (note the character count at the "..."
           cutoff in the card--light__hook paragraph). Use that same count in the render loop.
           Set data-tags-json with &quot; entity-encoded quotes as observed in baked cards.
       v.  Append all rendered articles into document.getElementById('catalog-grid').
       vi. After insertion, dispatch a custom event on document:
             document.dispatchEvent(new Event('catalog-rendered'));
           Then update #live-count text to reflect the actual rendered count.

   3c. Wrap each downstream init script that queries .card--light in a
       document.addEventListener('catalog-rendered', function(){ ... }) handler so it runs
       only after cards exist in the DOM. The scripts requiring this treatment are:
         - The filter-chip + refilter IIFE (currently lines ~3405–3502): its
           var cards = querySelectorAll line and everything that depends on cards.
         - The heart/wishlist handler (currently lines ~3555–3637).
         - The detail-modal IIFE (currently lines ~3690–4001): its
           document.querySelectorAll('.card--light').forEach(...) wiring at line ~3979.
       The picks.js <script src> tag does not query .card--light directly; leave its placement
       as-is unless you discover otherwise when reading the file.
       The avatar stack script does NOT query cards at init; leave it as-is unless you discover
       otherwise when reading the file.
       Do NOT add any pointerdown event listeners.
       Do NOT modify quick-pick.html, picks.js, or any CSS file.

4. CHANGE 3 — Add prefetch hint to web/index.html.

   Inside the <head> of web/index.html, immediately after the last existing
   <link rel="stylesheet"> tag (which is <link rel="stylesheet" href="css/components.css">),
   insert exactly this one line:
     <link rel="prefetch" href="data.json">
   No other changes to index.html.

5. QUALITY GATE VERIFICATION — Run all six checks from the vault root directory
   (/Users/alex/vaults/Vacation/Branson 2026/) and confirm each expected result:

   Gate 1 — Zero baked article cards remain:
     python3 -c 'import re; html=open("web/attractions.html").read(); print(len(re.findall(r"<article class=\"card--light\"", html)))'
     MUST PRINT: 0

   Gate 2 — Stale slug strings are absent:
     grep -c 'americas-top-country-hits\|awesome-80s\|bransons-wild-world' web/attractions.html
     MUST RETURN: 0

   Gate 3 — fetch(data.json) is present:
     grep -c 'fetch.*data\.json' web/attractions.html
     MUST RETURN: 1 or more

   Gate 4 — Apostrophe-encoded KEEP slugs are present:
     grep -c 'america-s-top-country-hits\|awesome-80-s' web/attractions.html
     MUST RETURN: 1 or more

   Gate 5 — No pointerdown listeners introduced:
     grep -c 'pointerdown' web/attractions.html
     MUST RETURN: 0

   Gate 6 — Prefetch hint exists in index.html:
     grep -c 'prefetch' web/index.html
     MUST RETURN: 1

   If any gate fails, diagnose and fix before proceeding to the handback step.
</dynamic_task>

<uncertainty_handling>
- If the actual line numbers you find differ from the estimates in these instructions, trust the file. Update your mental model and proceed.
- If a baked article card for one of the REMOVE slugs cannot be found (e.g., it was already deleted), skip that slug and note the discrepancy — do not abort.
- If the blacklist.json file contains more or fewer slugs than referenced in this brief, use the actual file contents. Do not assume a specific count.
- If any downstream script already uses event delegation or DOMContentLoaded in a way that makes it safe with async-rendered cards, you do not need to restructure it — document your reasoning.
- If the description truncation length is inconsistent across baked cards, use the most common value you observe across at least three cards.
- If data.json returns an unexpected top-level structure when you read it, inspect it fully before writing the render loop. Do not assume the attractions array is at the top level — confirm its path.
- If any quality gate returns an unexpected result after your changes, stop and fix before continuing. Do not declare success until all six gates pass.
</uncertainty_handling>

<hallucination_guard>
DERIVE EVERYTHING FROM THE ACTUAL FILES. Do not invent:
  - Line numbers. Read the file; do not cite line numbers you have not verified.
  - Card HTML structure. Read at least three baked article.card--light blocks before writing the render function.
  - Blacklist slugs. Read data/blacklist.json with your tools; do not guess at slugs.
  - data.json field names. Read at least one full attraction object before referencing field names.
  - The filter script's variable names. Read the actual IIFE before deciding what to wrap in the catalog-rendered listener.
  - The description truncation length. Read actual hook paragraph text in baked cards and count characters.
  - The path to data.json from attractions.html. Confirm both files are in web/ so the relative path is 'data.json'.
If you are uncertain about any structural detail, re-read the relevant file section before writing code.
</hallucination_guard>

<output_format>
Produce your work in this exact sequence — no other format is acceptable:

1. READ PHASE SUMMARY
   A concise bullet list of everything you confirmed from the files:
   - Exact catalog-grid open/close line numbers
   - Exact line numbers for each downstream script block
   - The full blacklist slug list (copy-pasted from the file)
   - Confirmed data.json top-level structure
   - Confirmed description truncation length with example
   - Confirmed last stylesheet link in index.html

2. CHANGE 1 EXECUTION
   Apply the 10 article block deletions. After applying, confirm each KEEP slug is still present.

3. CHANGE 2 EXECUTION
   (a) Show the empty #catalog-grid after all baked cards are deleted.
   (b) Show the full text of the inserted render <script> block.
   (c) Show each downstream script block as it appears after wrapping in the catalog-rendered listener.

4. CHANGE 3 EXECUTION
   Show the relevant <head> snippet from index.html with the prefetch line inserted.

5. QUALITY GATE RESULTS
   Show the exact command run and exact output for all six gates.
   If any gate initially fails, show the fix applied and the re-run output.

6. HANDBACK
   (See next section.)
</output_format>

<handback>
When all six quality gates pass, stop work and report:

FILES MODIFIED:
  - web/attractions.html  (Changes 1 and 2 applied)
  - web/index.html        (Change 3 applied)

FILES READ BUT NOT MODIFIED:
  - web/data.json
  - web/quick-pick.html
  - data/blacklist.json

FILES NOT TOUCHED:
  - web/css/components.css
  - web/js/picks.js
  - scripts/generate_dashboard.py (not run, not read)
  - All other files in the vault

Do NOT commit. Do NOT push. Do NOT run generate_dashboard.py. Do NOT open a browser or serve the files. Your session ends after reporting the above.
</handback>

</prompt>
