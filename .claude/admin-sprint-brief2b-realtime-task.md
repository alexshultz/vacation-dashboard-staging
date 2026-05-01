<role_and_goal>
You are a precise front-end integration engineer. Your goal is to make two surgical edits to an existing Branson 2026 web project: (1) add the Supabase JS SDK CDN script tag to both `index.html` and `event-timeline.html`, and (2) add a Realtime subscription block to `index.html` only. No other files may be touched.
</role_and_goal>

<tone>
Methodical and conservative. Read before you write. Replicate existing patterns exactly. Leave everything not explicitly named completely untouched.
</tone>

<background>
The project lives at `/Users/alex/vaults/Vacation/Branson 2026`. The web files are under `web/`.

Both `web/index.html` and `web/event-timeline.html` already contain:
- `SUPABASE_URL` -- a `const` declared in an inline `<script>` block
- `SUPABASE_ANON_KEY` -- a `const` declared in the same inline `<script>` block
- A 3-tier `loadSchedule()` function that uses raw `fetch()` REST calls (do not alter this)

`web/index.html` additionally contains:
- A `let INITIAL_VISIBLE` declaration
- A raw `fetch()` block that loads `INITIAL_VISIBLE` from `app_config` via Supabase REST
- A `loadSchedule()` call that follows those blocks

The Supabase JS SDK (`window.supabase`) is NOT yet loaded in either file -- that is the sole reason this brief exists. Data fetching stays on raw REST. The SDK is needed only for auth + Realtime.
</background>

<task>
Perform exactly the following three edits and nothing else:

**Edit 1 -- `web/index.html` (CDN tag)**
Locate the closing `</head>` tag. Insert the following line immediately before it:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

**Edit 2 -- `web/index.html` (Realtime subscription)**
Read the file carefully and identify:
- The exact end of the `INITIAL_VISIBLE` fetch block (the block that uses raw `fetch()` to read `key=eq.initial_visible` from `app_config`)
- The existing DOM show/hide pattern used to apply the `INITIAL_VISIBLE` gate (look for whatever method hides or shows schedule rows/cards based on `INITIAL_VISIBLE` -- do not invent a new one)

Immediately after the closing brace/statement of that fetch block and BEFORE the `loadSchedule()` call, insert:

```js
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

supabase
  .channel('app_config_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config', filter: 'key=eq.initial_visible' }, (payload) => {
    const newVal = parseInt(payload.new?.value, 10)
    if (!isNaN(newVal)) {
      INITIAL_VISIBLE = newVal
      // Re-apply the SAME show/hide DOM pattern already present in the file for INITIAL_VISIBLE
      // Read the file and copy it verbatim here -- do not invent a new pattern
    }
  })
  .subscribe()
```

Where the comment indicates, substitute the real existing show/hide logic you read from the file -- copy it verbatim, do not paraphrase or rewrite it.

Do NOT add `createClient()` anywhere else in `index.html`.

**Edit 3 -- `web/event-timeline.html` (CDN tag only)**
Locate the closing `</head>` tag. Insert the following line immediately before it:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Do NOT add `createClient()`, a Realtime subscription, or any other JS to `event-timeline.html`.
</task>

<analysis_order>
Follow this sequence exactly:
1. Read `web/index.html` in full. Locate and note: (a) the closing `</head>` tag, (b) the `SUPABASE_ANON_KEY` value as declared, (c) the exact end of the `INITIAL_VISIBLE` fetch block, (d) the existing DOM show/hide logic that gates on `INITIAL_VISIBLE`, (e) the `loadSchedule()` call position.
2. Read `web/event-timeline.html` in full. Locate the closing `</head>` tag.
3. Apply Edit 1 to `web/index.html`.
4. Apply Edit 2 to `web/index.html`, using the real show/hide logic you found in step 1d.
5. Apply Edit 3 to `web/event-timeline.html`.
6. Run the safety grep checks:
   ```
   grep -c 'fetch.*schedule.json' web/event-timeline.html
   grep -c 'fetch.*schedule.json' web/index.html
   ```
   Both must return a number >= 1. If either returns 0, you broke something -- stop, report the failure, and do not proceed.
7. If you notice any HTML element or JS block that appears unused or redundant, note it in your handback report. Do not remove it.
</analysis_order>

<hallucination_guard>
- Do NOT hardcode any value for `SUPABASE_ANON_KEY`. Read the file and use the exact string already declared there.
- Do NOT invent a show/hide DOM pattern. Read the file and copy the exact existing logic.
- Do NOT add `createClient()` to `event-timeline.html`.
- Do NOT modify `picks.js`, `site.js`, any CSS, or any file other than the two named above.
- Do NOT alter any existing HTML structure, attributes, or JS logic beyond the three insertions described.
- The Supabase CDN `<script>` tag must go immediately before `</head>` -- not after it, not inside a `<script>` block, not at the bottom of `<body>`.
- Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.
</hallucination_guard>

<output_format>
When complete, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.

Additionally include:
- Safety grep results: exact output of both grep commands run after editing.
- Realtime subscription placement: describe exactly where the subscription block was inserted relative to surrounding code (one sentence per anchor point).
- Flagged elements -- not modified: any elements encountered that appeared unused or redundant. If none, write "None."
</output_format>
