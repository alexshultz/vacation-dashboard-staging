<task_brief>

<role_and_goal>
You are a meticulous data-entry engineer working on a family vacation planning dashboard.
Your single goal: research, verify, and append exactly 60-65 new production-ready JSON
attraction entries to the Branson 2026 dashboard's canonical data file, then regenerate
the web export. Every entry must be grounded in data fetched from the attraction's
official website -- no invented details.
</role_and_goal>

<workspace>
  <vault>/Users/alex/vaults/Vacation/Branson 2026</vault>
  <canonical_data_file>data/attractions.json</canonical_data_file>
  <export_command>python3 scripts/export_data.py</export_command>
  <frozen_scripts>
    generate_dashboard.py   <!-- has sys.exit(1) guard -- DO NOT RUN -->
    generate_attractions.py <!-- has sys.exit(1) guard -- DO NOT RUN -->
  </frozen_scripts>
  <untouchable_file_types>*.html, *.css, *.js -- DO NOT MODIFY UNDER ANY CIRCUMSTANCES</untouchable_file_types>
</workspace>

<entry_schema>
EVERY entry must contain ALL fields below. No field may be omitted.

{
  "slug":           "kebab-case-unique-name",
  "name":           "Display Name",
  "category":       "attraction" or "show",
  "price_adult":    0.0,
  "duration_hours": 2,
  "rating":         4.5,
  "description":    "2-3 sentences from official site",
  "image":          "",
  "official_url":   "https://...",
  "notes":          "Address, ~XX mi from Branson MO, ~XX min drive, hours, booking notes",
  "tags":           ["tag1", "tag2"]
}

price_adult: float; 0.0 = free; null ONLY if genuinely absent from official site after fetch
duration_hours: int or float
rating: float 1-5; use 4.0 if not found on site
image: always empty string -- thumbnails handled separately by Hermes
</entry_schema>

<valid_tags>
Use ONLY tags from this closed list. Multiple tags allowed per entry.
Duration  : "1-2hr"  "2-3hr"  "all-day"
Activity  : "active" "animals" "art" "architecture" "comedy" "country" "date-night"
            "drama" "educational" "family" "free" "hiking" "history" "indoor"
            "kid-focused" "music" "nature" "outdoor" "relaxed" "religious"
            "spiritual" "tribute" "water"
Trip type : "day-trip"
</valid_tags>

<existing_slugs>
DO NOT reuse any slug in this list. Generate a unique slug if a candidate would collide.

1-hits-of-the-60s-and-50s-too, a-garth-tribute, a-neil-diamond-tribute-ft-keith-allynn,
a-shepherds-christmas-carol, aaron-wayne-comedy-hypnosis-show,
abby-lee-miller-live-at-the-top-of-the-pyramid, absolutely-country-definitely-gospel,
adventure-seekers, americas-top-country-hits, americana-new-years-eve-show,
anthems-of-rock, aquarium-at-the-boardwalk, awesome-80s,
back-to-country-with-mark-aldred, back-to-the-bee-gees, best-of-dean-martin-tribute,
bluegrass-bbq-festival, bohemian-queen, branson-comedy-bash-dinner-show,
branson-dinosaur-museum, branson-duck-tours, branson-hills-golf-club,
branson-murder-mystery-show, branson-scenic-railway, branson-showboat,
branson-zipline-at-wolfe-mountain, bransons-wild-world, bransons-famous-baldknobbers,
brett-daniels, british-invasion, broadway-to-buble-starring-george-dyer,
butterfly-palace-rainforest-adventure, carpenters-once-more,
classic-country-and-comedy, classic-rock-icons, clay-coopers-country-express,
comedy-jamboree, copperhead-mountain-coaster, coral-reef-mini-golf, crystal-bridges,
david-sight-and-sound-theatres, dan-wagners-johnny-cash-and-friends-tribute,
darryl-worley, dean-z-the-ultimate-elvis, dogwood-canyon, dollys-stampede,
doo-wop-and-more, doug-gabriel-the-ultimate-variety-show, down-home-country,
dublins-irish-tenors-and-the-celtic-ladies, fritz-adventure, gene-watson,
george-jones-haggard-and-friends, george-strait-tribute,
golden-sounds-of-the-platters, grand-jubilee, hamners-unbelievable-variety-show,
hamners-all-american-new-years-eve-celebration, hollywood-wax-museum-entertainment-center,
hot-rods-and-high-heels, hughes-brothers-country-show, hughes-music-show,
illusionist-rick-thomas, jerry-presley-elvis-live, jimmy-fortune, joe-nichols,
josh-turner, kenny-rogers-tribute, kentucky-headhunters, legends-in-concert,
malpass-brothers-and-friends, matt-gumm-and-company, melody-hart-and-the-all-star-band,
menopause-the-musical, motown-downtown, nashville-roadhouse-live, neal-mccoy,
new-jersey-nights, new-south-gospel, orbison-still,
outpost-opry-variety-show-w-joey-garland, ozark-hills-winery-wine-tasting,
ozarks-aglow-nighttime-walk, ozarks-country, ozarks-gospel, parakeet-petes,
patsy-to-patsy, pierce-arrow-30th-anniversary, pierce-arrow-gospel, pierce-arrow-decades,
pink-jeep-tours, queens-of-soul, re-vibe-dinner-show, retromania,
reza-edge-of-illusion, rick-mcewan-presents-the-gambler,
riga-tonys-murder-mystery-dinner-show, ripleys-believe-it-or-not, rock-n-roll-sunrise,
runaway-mountain-coaster, six, separate-journeys, shanghai-circus,
shepherd-of-the-hills-north-pole-adventure,
shepherd-of-the-hills-great-woodsman-canopy-tours,
shepherd-of-the-hills-historic-homestead-tour,
shepherd-of-the-hills-inspiration-tower, shepherd-of-the-hills-outdoor-drama,
shepherd-of-the-hills-vigilante-extreme-ziprider,
shepherds-great-american-chuckwagon-dinner-show, shepherds-wild-west-showdown,
silver-dollar-city, smoke-on-the-mountain, snowflex-tubing-at-wolfe-mountain,
southern-gospel-sundays-with-the-frosts, steve-sanders-the-mind-spy,
strait-to-branson-a-george-strait-tribute, the-bellamy-brothers, the-duttons,
the-gatlin-brothers, great-passion-play, the-haygoods,
the-heatherlys-hits-on-route-66, the-momentary, the-mountain-hollers-family-band,
the-petersens, the-revollusionists, the-social-birdy-putting-golf,
the-sons-of-britches, the-sound-of-simon-and-garfunkel, the-texas-tenors,
thorncrown-chapel, titanic-museum-attraction, tracy-byrd, truth-traveler,
ultimate-70s-show, ultimate-elvis-contest-headliner-act-cote-deonath,
veterans-memorial-museum, where-jesus-walked-immersive, white-water,
whodunnit-hoedown-murder-mystery-dinner-show, wonderworks, wonders-of-wildlife,
worlds-largest-toy-museum-complex, zep-la
</existing_slugs>

<candidate_list>
Research all candidates below. Verify each via its official URL before writing any entry.
Discard any candidate that: (a) you cannot load a live page for, (b) appears permanently
closed, or (c) is more than 90 miles from Branson MO by road (100 mi for NWA candidates).
Write entries for the 60-65 best-confirmed candidates.

BRANSON / NEARBY (0-15 mi):
  Talking Rocks Cavern          talkingrockscavern.com
  Table Rock State Park         mostateparks.com/park/table-rock-state-park
  Top of the Rock Big Cedar     topoftherock.com
  Ancient Ozarks Natural History Museum   topoftherock.com
  Lost Canyon Cave and Nature Trail       topoftherock.com
  Thunder Ridge Nature Arena    bigcedar.com
  Lady Liberty Lake Cruises     bigcedar.com
  Branson Helicopter Adventures bransonhelicopter.com
  Promised Land Zoo             promisedlandzoo.com
  Ozark Mountain Ziplines       ozarkmountainziplines.com
  Pirate's Cove Adventure Golf  piratesadventuregolf.com
  Branson Landing               bransonlanding.com
  Ride the Ducks Branson        ridetheducks.com
  Ruth and Paul Henning Conservation Area   mdc.mo.gov
  Big Sugar Creek State Park    mostateparks.com
  Roaring River State Park      mostateparks.com/park/roaring-river-state-park

SPRINGFIELD (40-50 mi):
  Fantastic Caverns             fantasticcaverns.com
  Dickerson Park Zoo            dickersonparkzoo.org
  Bass Pro Shops Original Store basspro.com
  Discovery Center of Springfield         discoverycenter.org
  Springfield Art Museum        sgfartmuseum.org
  Pythian Castle                pythiancastle.com
  Exotic Animal Paradise        exoticanimalparadise.com
  Missouri Sports Hall of Fame  mosportshalloffame.com
  Route 66 Car Museum           route66carmuseum.com
  Springfield History Museum on the Square  historymuseumonthesquare.org
  Wilson's Creek National Battlefield     nps.gov/wicr

LAKE OF THE OZARKS (70-90 mi):
  Ha Ha Tonka State Park        mostateparks.com/park/ha-ha-tonka-state-park
  Bridal Cave                   bridalcave.com
  Lake of the Ozarks State Park mostateparks.com/park/lake-of-the-ozarks-state-park

EUREKA SPRINGS (55-65 mi):
  Crescent Hotel Ghost Tour     crescent-hotel.com
  Eureka Springs Historical Museum        eurekaspringshistoricalmuseum.org
  Turpentine Creek Wildlife Refuge        turpentinecreek.org
  Eureka Springs and North Arkansas Railway  esnarailway.com
  Onyx Cave Park                onyxcave.com
  Lake Leatherwood City Park    cityofeureka.net
  Cosmic Cavern                 cosmiccavern.com
  Pivot Rock and Natural Bridge pivotrock.com
  Blue Spring Heritage Center   bluespring.com
  Christ of the Ozarks          greatpassionplay.org/attractions/christ-of-the-ozarks

BENTONVILLE / NWA (90-100 mi -- include only if road distance <= 100 mi):
  Walmart Museum                walmartmuseum.com
  Amazeum Children's Museum     amazeum.org
  Botanical Garden of the Ozarks          bgozarks.org
  Arkansas Air and Military Museum        arkansasairandmilitary.com
  War Eagle Mill                wareaglemill.com
  Terra Studios                 terrastudios.com
  Peel Mansion                  peelmansion.org

NPS / HISTORIC:
  Pea Ridge National Military Park        nps.gov/peri  (~85 mi)
  Buffalo National River        nps.gov/buff  (~65 mi to Steel Creek area)
  George Washington Carver National Monument  nps.gov/gwca  (~75 mi)
  Blanchard Springs Caverns     fs.usda.gov   (Mountain View AR, ~90 mi)
  Mystic Caverns                mysticcaverns.com  (Harrison AR, ~65 mi)
</candidate_list>

<hallucination_guard>
RULE 1 -- FETCH BEFORE YOU WRITE.
  For every candidate you intend to include, fetch the official URL using WebFetch or
  curl. Do not write description, price, hours, or address from memory. Every field
  must come from the fetched page or be marked with the documented fallback
  (price_adult: null, rating: 4.0).

RULE 2 -- NO INVENTED FACTS.
  If the official page does not state a price, set price_adult to null.
  If hours are not published, omit them from notes rather than fabricate them.
  If an address is not found, write only the city/state.

RULE 3 -- VERIFY DISTANCE.
  Confirm road distance from Branson MO (65616) for each candidate. If you cannot
  confirm distance <= 90 mi (100 mi for NWA), skip the entry and note it.

RULE 4 -- NO SLUG COLLISIONS.
  Before writing each entry, check the slug against existing_slugs. If a collision
  would occur, derive a unique variant rather than skipping. Document any variant.

RULE 5 -- TAGS FROM CLOSED LIST ONLY.
  Every tag must appear verbatim in valid_tags. Strip any tag you invent.
</hallucination_guard>

<steps>
  1. FETCH ALL CANDIDATES.
     For each candidate, fetch the official URL. Record: name, price, description
     excerpt, hours, address. Do not batch; fetch each URL individually.

  2. BUILD VERIFICATION TABLE (internal, not written to disk).
     For each candidate: URL reachable Y/N | distance confirmed Y/N |
     permanently closed Y/N | slug collision Y/N. Mark INCLUDE or SKIP.
     Ensure INCLUDE count >= 60 before proceeding.

  3. WRITE ENTRIES TO data/attractions.json.
     Open data/attractions.json, locate the "attractions" array, and append all
     verified entries in a single atomic edit. Write all 60-65 entries at once.
     Validate JSON syntax before saving:
     python3 -c "import json,sys; json.load(open('data/attractions.json'))"

  4. RUN THE EXPORT SCRIPT.
     cd /Users/alex/vaults/Vacation/Branson 2026
     python3 scripts/export_data.py
     Confirm the output contains "Export complete". If the script errors, fix only
     data/attractions.json (JSON syntax), then re-run. DO NOT run generate_dashboard.py
     or generate_attractions.py.

  5. VERIFY FINAL STATE.
     python3 -c "import json; d=json.load(open('data/attractions.json')); print(len(d['attractions']), 'total entries')"
     Confirm count increased by the number you appended.

  6. PRODUCE HANDBACK REPORT. STOP. Do not commit, push, or modify any other file.
</steps>

<output_format>
Your ONLY output after completing all steps must be this report structure:

---HANDBACK REPORT---

EXPORT STATUS: [PASS -- "Export complete" seen in stdout] | [FAIL -- reason]
TOTAL ENTRIES BEFORE: [N]
TOTAL ENTRIES AFTER:  [N]
ENTRIES ADDED:        [N]

ADDED ENTRIES (tab-separated):
  Name | Slug | Category | price_adult | official_url
  [one row per entry]

SKIPPED CANDIDATES:
  Name | Reason
  [one row per skip, or "None"]

SLUG VARIANTS:
  Original name | Slug used | Reason
  [one row per variant, or "None"]

---END HANDBACK REPORT---
</output_format>

<handback_clause>
When the handback report has been printed, STOP. Do not commit. Do not push.
Do not open a shell or editor. Return control to Hermes by stopping.
</handback_clause>

</task_brief>
