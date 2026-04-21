#!/usr/bin/env python3
"""
Tag classifier for Branson 2026 attractions using Claude Sonnet 4.6.
Reads: data/attractions.json, data/tag-teaching-examples.json
Writes: data/tag-proposals-v2.csv, data/tag-proposals-v2.meta.json, data/tag-proposals-diff.md
Also: incremental checkpointing to .partial.csv, appends to .raw.jsonl
"""
import argparse, csv, json, os, sys, time
from datetime import datetime, timezone
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("LOUD ERROR: pip install anthropic first (>=0.89.0)")

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
ATTRACTIONS_JSON = VAULT / "data" / "attractions.json"
TEACHING_JSON = VAULT / "data" / "tag-teaching-examples.json"
PROPOSALS_V1_CSV = VAULT / "data" / "tag-proposals.csv"
PROPOSALS_V2_CSV = VAULT / "data" / "tag-proposals-v2.csv"
PROPOSALS_V2_PARTIAL = VAULT / "data" / "tag-proposals-v2.partial.csv"
PROPOSALS_V2_META = VAULT / "data" / "tag-proposals-v2.meta.json"
PROPOSALS_DIFF_MD = VAULT / "data" / "tag-proposals-diff.md"
RAW_LOG = VAULT / "data" / "tag-proposals.raw.jsonl"

INPUT_COST_PER_MTOK = 3.00
OUTPUT_COST_PER_MTOK = 15.00

SHOW_CATEGORIES = ["music", "comedy", "magic", "variety", "drama", "tribute"]
MUSIC_SUBGENRES = ["country", "rock", "gospel", "bluegrass", "pop", "oldies-50s", "oldies-60s", "oldies-70s", "oldies-80s", "classical"]
AUDIENCE_VIBE = ["family", "adult-humor", "date-night", "kid-focused", "religious"]
ATTRACTION_TAGS = ["indoor", "outdoor", "ride", "museum", "active", "relaxed", "food", "shopping", "educational", "thrill", "animals", "water", "history", "under-1hr", "1-2hr", "2-3hr", "half-day", "all-day"]
ALL_TAGS = sorted(set(SHOW_CATEGORIES + MUSIC_SUBGENRES + AUDIENCE_VIBE + ATTRACTION_TAGS))


def build_system_prompt(teaching_examples):
    """Build system prompt with vocabulary and few-shot examples."""
    vocab = f"""You are a tag classifier for Branson attractions.
Your ONLY job is to output valid JSON with selected tags and confidence score.

Tag vocabulary (use ONLY these):
SHOW categories: {json.dumps(SHOW_CATEGORIES)}
MUSIC subgenres: {json.dumps(MUSIC_SUBGENRES)}
AUDIENCE vibe: {json.dumps(AUDIENCE_VIBE)}
ATTRACTION tags: {json.dumps(ATTRACTION_TAGS)}

Confidence: 0.9-1.0 clear, 0.7-0.9 reasonable, 0.4-0.7 best guess, <0.4 insufficient info.

---

TEACHING EXAMPLES (calibrate against these):
"""
    for ex in teaching_examples:
        desc = ex.get("description", "")[:200]
        before = ", ".join(ex.get("before_tags", []))
        after = ", ".join(ex.get("after_tags", []))
        vocab += f"\nExample: {ex['name']}\nDescription: {desc}\nInitial: {before}\nCorrected: {after}\nHuman edit: {ex.get('human_adjustments', '')}\n"

    vocab += """\n---

OUTPUT FORMAT (STRICT): Respond with a single JSON object and nothing else.
No code fences. No prose before or after. No markdown. Start your response with '{'.

Schema:
{
  "show_categories": ["<0-2>"],
  "music_subgenres": ["<0-N>"],
  "audience_vibe": ["<0-N>"],
  "attraction_tags": ["<0-N>"],
  "confidence": <0.0-1.0>,
  "reasoning": "<one sentence>"
}

If description is sparse, prefer lower confidence over guessing."""
    return vocab


def build_user_prompt(att):
    """Build user message for a single attraction."""
    parts = [f"Name: {att.get('name', '(unknown)')}"]
    if att.get("category"):
        parts.append(f"Category: {att['category']}")
    if att.get("duration_hours"):
        parts.append(f"Duration: {att['duration_hours']}h")
    desc = (att.get("description") or "").strip()[:600]
    if desc:
        parts.append(f"Description: {desc}")
    notes = (att.get("notes") or "").strip()
    if notes:
        parts.append(f"Notes: {notes}")
    return "\n".join(parts) + "\n\nOutput JSON only."


def get_api_key():
    """Get ANTHROPIC_API_KEY from env or ~/.hermes/.env."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    try:
        with open(Path.home() / ".hermes" / ".env") as f:
            for line in f:
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    except:
        pass
    sys.exit("LOUD ERROR: ANTHROPIC_API_KEY not in env or ~/.hermes/.env")


def smoke_test(client):
    """Verify model works with 1-token call."""
    try:
        client.messages.create(model="claude-sonnet-4-6", max_tokens=10, temperature=0.0, messages=[{"role": "user", "content": "x"}])
        print("  Smoke test OK (claude-sonnet-4-6)", file=sys.stderr)
        return True
    except Exception as e:
        print(f"LOUD ERROR: Model smoke test failed: {e}", file=sys.stderr)
        return False


def call_claude(client, system, user):
    """Call Claude API with exponential backoff retry on 429/5xx. Returns (text, elapsed, attempts, usage).
    
    Note: Sonnet 4.6 does not support assistant message prefill, so we rely on a
    strong JSON-only instruction in the system/user prompt plus a robust parser
    that extracts the first {...} block from the response.
    """
    for attempt in range(1, 4):
        try:
            start = time.time()
            resp = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=600,
                temperature=0.0,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            elapsed = time.time() - start
            usage = {"input_tokens": resp.usage.input_tokens, "output_tokens": resp.usage.output_tokens}
            return (resp.content[0].text or ""), elapsed, attempt, usage
        except anthropic.APIStatusError as e:
            if e.status_code in (429, 500, 502, 503, 504) and attempt < 3:
                backoff = 2 ** (attempt - 1)
                print(f"  WARN: API {e.status_code}, retry {attempt}/3 in {backoff}s", file=sys.stderr)
                time.sleep(backoff)
            else:
                print(f"  LOUD: API error after {attempt} attempts: {e}", file=sys.stderr)
                return None, 0, attempt, None
        except Exception as e:
            print(f"  LOUD: Network error: {e}", file=sys.stderr)
            return None, 0, attempt, None
    return None, 0, 3, None


def extract_json(text):
    """Extract the first top-level {...} JSON object from a model response.
    Returns None if no balanced braces found.
    """
    if not text:
        return None
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if escape:
            escape = False
            continue
        if ch == "\\":
            escape = True
            continue
        if ch == '"' and not escape:
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start:i+1]
    return None


def validate_tags(parsed):
    """Check tags in vocabulary. Returns (valid, warnings, clean_parsed)."""
    warnings = []
    clean = {"show_categories": [], "music_subgenres": [], "audience_vibe": [], "attraction_tags": [], "confidence": 0.0, "reasoning": ""}
    
    for key, allowed in [("show_categories", SHOW_CATEGORIES), ("music_subgenres", MUSIC_SUBGENRES), ("audience_vibe", AUDIENCE_VIBE), ("attraction_tags", ATTRACTION_TAGS)]:
        vals = parsed.get(key, [])
        if not isinstance(vals, list):
            warnings.append(f"{key} not a list")
            continue
        for v in vals:
            if v not in allowed:
                warnings.append(f"{key}: unknown '{v}'")
            else:
                clean[key].append(v)
    
    conf = parsed.get("confidence", 0)
    if not isinstance(conf, (int, float)):
        warnings.append(f"confidence not a number")
    else:
        clean["confidence"] = max(0.0, min(1.0, conf))
    
    reasoning = parsed.get("reasoning", "")
    clean["reasoning"] = (reasoning if isinstance(reasoning, str) else "")[:200]
    
    return (len(warnings) == 0, warnings, clean)


def load_data():
    """Load attractions and teaching examples. Loud error if problems."""
    print("Loading data...", file=sys.stderr)
    try:
        with open(ATTRACTIONS_JSON) as f:
            attractions = json.load(f).get("attractions", [])
        if not attractions:
            sys.exit(f"LOUD ERROR: {ATTRACTIONS_JSON} has no attractions")
        print(f"  {len(attractions)} attractions", file=sys.stderr)
    except Exception as e:
        sys.exit(f"LOUD ERROR: Failed to load {ATTRACTIONS_JSON}: {e}")
    
    try:
        with open(TEACHING_JSON) as f:
            teaching = json.load(f).get("examples", [])
        print(f"  {len(teaching)} teaching examples", file=sys.stderr)
    except Exception as e:
        sys.exit(f"LOUD ERROR: Failed to load {TEACHING_JSON}: {e}")
    
    att_slugs = {a["slug"] for a in attractions}
    for ex in teaching:
        if ex["slug"] not in att_slugs:
            sys.exit(f"LOUD ERROR: Teaching slug '{ex['slug']}' not in attractions.json")
        for tag_list in [ex.get("before_tags", []), ex.get("after_tags", [])]:
            for tag in tag_list:
                if tag not in ALL_TAGS:
                    sys.exit(f"LOUD ERROR: Teaching '{ex['slug']}' has unknown tag '{tag}'")
    
    return attractions, teaching


def load_v1():
    """Load v1 CSV for diff. Returns dict slug -> row."""
    v1 = {}
    if PROPOSALS_V1_CSV.exists():
        try:
            with open(PROPOSALS_V1_CSV) as f:
                for row in csv.DictReader(f):
                    v1[row["slug"]] = row
        except:
            pass
    return v1


def load_done():
    """Load partial CSV if resuming. Returns set of done slugs."""
    done = set()
    if PROPOSALS_V2_PARTIAL.exists():
        try:
            with open(PROPOSALS_V2_PARTIAL) as f:
                for row in csv.DictReader(f):
                    done.add(row["slug"])
        except:
            pass
    return done


def process_one(client, system_prompt, att, teaching_map):
    """Classify one attraction. Returns (result_row, is_failure, usage_dict, raw_text)."""
    slug = att["slug"]
    name = att.get("name", "?")
    user_prompt = build_user_prompt(att)
    
    raw_text, elapsed, attempts, usage = call_claude(client, system_prompt, user_prompt)
    
    if raw_text is None:
        return None, True, None, None
    
    json_blob = extract_json(raw_text)
    if json_blob is None:
        print(f"  LOUD: No JSON object in response ({elapsed:.1f}s): {raw_text[:120]!r}", file=sys.stderr)
        return None, True, usage, raw_text
    try:
        parsed = json.loads(json_blob)
    except json.JSONDecodeError as e:
        print(f"  LOUD: Invalid JSON ({elapsed:.1f}s): {e}; blob={json_blob[:120]!r}", file=sys.stderr)
        return None, True, usage, raw_text
    
    valid, warnings, clean = validate_tags(parsed)
    if warnings:
        for w in warnings:
            print(f"  WARN: {w}", file=sys.stderr)
    
    all_tags = clean["show_categories"] + clean["music_subgenres"] + clean["audience_vibe"] + clean["attraction_tags"]
    agrees = ""
    if slug in teaching_map:
        agrees = "yes" if set(all_tags) == set(teaching_map[slug]) else "no"
    
    return {
        "slug": slug, "name": name, "category_hint": att.get("category", ""), "confidence": clean["confidence"],
        "proposed_tags": ",".join(all_tags), "show_categories": ",".join(clean["show_categories"]),
        "music_subgenres": ",".join(clean["music_subgenres"]), "audience_vibe": ",".join(clean["audience_vibe"]),
        "attraction_tags": ",".join(clean["attraction_tags"]), "reasoning": clean["reasoning"],
        "elapsed_s": f"{elapsed:.1f}", "validation_warnings": "; ".join(warnings) if warnings else "",
        "agrees_with_teaching": agrees
    }, False, usage, raw_text


def write_v2_csv(results):
    """Write results to v2 CSV."""
    if not results:
        return
    with open(PROPOSALS_V2_CSV, "w") as f:
        writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
        writer.writeheader()
        for r in results:
            writer.writerow(r)


def append_partial(result):
    """Append a result to partial CSV."""
    exists = PROPOSALS_V2_PARTIAL.exists()
    with open(PROPOSALS_V2_PARTIAL, "a") as f:
        writer = csv.DictWriter(f, fieldnames=list(result.keys()))
        if not exists:
            writer.writeheader()
        writer.writerow(result)


def write_meta(num_att, failures, cost, in_toks, out_toks):
    """Write metadata sidecar."""
    meta = {
        "vocabulary_round": 8, "model": "claude-sonnet-4-6", "temperature": 0.0,
        "timestamp": datetime.now(timezone.utc).isoformat(), "cost_usd": round(cost, 2),
        "input_tokens": in_toks, "output_tokens": out_toks, "attractions_count": num_att, "failures": failures
    }
    with open(PROPOSALS_V2_META, "w") as f:
        json.dump(meta, f, indent=2)


def write_diff(results, v1_map, cost, in_toks, out_toks):
    """Write diff document."""
    teach = {r["slug"]: r for r in results if r["agrees_with_teaching"]}
    teach_agree = sum(1 for r in teach.values() if r["agrees_with_teaching"] == "yes")
    
    unchanged = sum(1 for r in results if r["slug"] in v1_map and 
                    set((v1_map[r["slug"]].get("proposed_tags") or "").split(",")) - {""} == 
                    set(r["proposed_tags"].split(",")) - {""})
    changed = len(results) - unchanged
    
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    md = f"""# Tag classification diff - v2 (claude-sonnet-4-6)

- Generated: {now}
- Model: claude-sonnet-4-6 @ temperature=0
- Vocabulary: Round 8
- Total rows: {len(results)}
- Unchanged: {unchanged}
- Changed: {changed}
- Teaching agreement: {teach_agree}/{len(teach)} ({100*teach_agree//max(1,len(teach))}%)
- Cost: ${cost:.2f} (in={in_toks}, out={out_toks} tokens)

---

## Teaching-set consistency check

| slug | name | v2 output | agrees? |
|------|------|-----------|---------|
"""
    for slug in sorted(teach.keys()):
        r = teach[slug]
        md += f"| {slug} | {r['name']} | {r['proposed_tags']} | {r['agrees_with_teaching']} |\n"
    
    md += "\n---\n\n## All 139 rows - change detail\n\n| slug | name | v1 tags | v2 tags | change_type |\n|------|------|---------|---------|-------------|\n"
    
    for r in results:
        slug = r["slug"]
        v2_tags = r["proposed_tags"]
        if slug in v1_map:
            v1_tags = v1_map[slug].get("proposed_tags", "")
            v1_set = set(v1_tags.split(",")) - {""}
            v2_set = set(v2_tags.split(",")) - {""}
            if v1_set == v2_set:
                md += f"| {slug} | {r['name']} | (same) | (same) | unchanged |\n"
            else:
                change_type = "tags-added" if v1_set < v2_set else ("tags-removed" if v1_set > v2_set else "tags-both")
                md += f"| {slug} | {r['name']} | {v1_tags} | {v2_tags} | {change_type} |\n"
        else:
            md += f"| {slug} | {r['name']} | (no v1) | {v2_tags} | new-row |\n"
    
    with open(PROPOSALS_DIFF_MD, "w") as f:
        f.write(md)


def main():
    ap = argparse.ArgumentParser(description="Classify Branson attractions with Claude Sonnet 4.6")
    ap.add_argument("--dry-run", type=int, nargs="?", const=3, metavar="N", help="Classify first N, print to stdout, exit")
    ap.add_argument("--resume", action="store_true", help="Skip slugs in .partial.csv")
    args = ap.parse_args()
    
    attractions, teaching = load_data()
    teaching_map = {ex["slug"]: ex.get("after_tags", []) for ex in teaching}
    
    api_key = get_api_key()
    client = anthropic.Anthropic(api_key=api_key)
    
    print("Starting smoke test...", file=sys.stderr)
    if not smoke_test(client):
        sys.exit(1)
    
    sorted_teaching = sorted(teaching, key=lambda x: x["slug"])
    system_prompt = build_system_prompt(sorted_teaching)
    
    items = attractions[:args.dry_run] if args.dry_run is not None else attractions
    is_dry_run = args.dry_run is not None
    
    done_slugs = set()
    if args.resume and not is_dry_run:
        done_slugs = load_done()
        print(f"Resuming: skipping {len(done_slugs)} already-done", file=sys.stderr)
    
    est_cost = (len(items) * 600 * INPUT_COST_PER_MTOK / 1e6) + (len(items) * 200 * OUTPUT_COST_PER_MTOK / 1e6)
    full_cost = (len(attractions) * 600 * INPUT_COST_PER_MTOK / 1e6) + (len(attractions) * 200 * OUTPUT_COST_PER_MTOK / 1e6)
    print(f"Cost estimate ({len(items)} items): ${est_cost:.2f}, full run: ${full_cost:.2f}", file=sys.stderr)
    
    results = []
    failures = 0
    total_cost = 0.0
    total_input = 0
    total_output = 0
    
    for i, att in enumerate(items, 1):
        slug = att["slug"]
        if slug in done_slugs:
            continue
        
        name = att.get("name", "?")[:40]
        print(f"[{i}/{len(items)}] {slug} - {name}", end="", file=sys.stderr)
        
        result, is_failure, usage, raw_text = process_one(client, system_prompt, att, teaching_map)
        
        if is_failure:
            failures += 1
            print(f" FAILED", file=sys.stderr)
            # Even on failure, log raw attempt for forensics
            if raw_text is not None:
                with open(RAW_LOG, "a") as rf:
                    rf.write(json.dumps({"slug": slug, "elapsed": 0, "raw": raw_text[:2000], "parsed": None,
                                          "attempt_count": 0, "timestamp": datetime.now(timezone.utc).isoformat(),
                                          "failed": True}) + "\n")
        else:
            elapsed = float(result["elapsed_s"])
            # Use ACTUAL token counts from the API response
            in_tok = usage["input_tokens"] if usage else 0
            out_tok = usage["output_tokens"] if usage else 0
            cost = (in_tok * INPUT_COST_PER_MTOK / 1e6) + (out_tok * OUTPUT_COST_PER_MTOK / 1e6)
            total_cost += cost
            total_input += in_tok
            total_output += out_tok
            results.append(result)
            
            # Append raw response to audit log (spec requirement)
            if not is_dry_run:
                with open(RAW_LOG, "a") as rf:
                    rf.write(json.dumps({
                        "slug": slug, "elapsed": elapsed, "raw": raw_text[:2000],
                        "parsed": {"tags": result["proposed_tags"], "confidence": result["confidence"]},
                        "cost_usd": round(cost, 6), "input_tokens": in_tok, "output_tokens": out_tok,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }) + "\n")
                append_partial(result)
            
            print(f" {cost:.4f}$ (running: {total_cost:.2f}$, {in_tok}/{out_tok} tok)", file=sys.stderr)
    
    num_processed = len(items) - len(done_slugs)
    pct_fail = (failures / max(1, num_processed)) * 100
    
    if is_dry_run:
        print(f"\n--- DRY RUN ({len(items)} items) ---", file=sys.stderr)
        for r in results:
            print(f"\n{r['slug']}:")
            print(f"  Confidence: {r['confidence']}")
            print(f"  Tags: {r['proposed_tags']}")
            print(f"  Reasoning: {r['reasoning']}")
        print(f"\nFull run estimate: ${full_cost:.2f}\nRun: python3 scripts/classify_tags_frontier.py", file=sys.stderr)
        sys.exit(0)
    
    print(f"\nProcessed {num_processed}, {failures} failures ({pct_fail:.1f}%)", file=sys.stderr)
    
    if pct_fail > 10:
        print(f"LOUD ERROR: >10% failure rate. Review raw log.", file=sys.stderr)
        sys.exit(1)
    
    v1_map = load_v1()
    
    if PROPOSALS_V2_CSV.exists():
        PROPOSALS_V2_CSV.unlink()
    if PROPOSALS_V2_PARTIAL.exists():
        PROPOSALS_V2_PARTIAL.rename(PROPOSALS_V2_CSV)
    
    write_v2_csv(results)
    write_meta(len(attractions), failures, total_cost, total_input, total_output)
    write_diff(results, v1_map, total_cost, total_input, total_output)
    
    print(f"Wrote: {PROPOSALS_V2_CSV}", file=sys.stderr)
    print(f"Wrote: {PROPOSALS_DIFF_MD}", file=sys.stderr)
    print(f"Wrote: {PROPOSALS_V2_META}", file=sys.stderr)
    
    print(f"\n✓ Classified {len(results)}/139, {failures} failures, ${total_cost:.2f} spent, wrote v2.csv + diff.md", file=sys.stderr)
    sys.exit(0)


if __name__ == "__main__":
    main()
