#!/usr/bin/env python3
"""
Tag classifier for Branson 2026 attractions/shows using the plexpro local model.

Reads: data/attractions.json (canonical source of truth)
Writes: data/tag-proposals.csv (sorted by confidence ASC so low-confidence first)

Per Alex's loud-errors rule:
- Every non-JSON response from the model prints a WARNING and keeps going
- If >10% of rows fail validation, exits with error so Alex can decide fallback
- All raw LLM responses are logged to data/tag-proposals.raw.jsonl for audit

Does NOT modify attractions.json. Alex reviews the CSV, approves, then we merge.
"""
import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError

VAULT = Path("/Users/alex/vaults/Vacation/Branson 2026")
ATTRACTIONS_JSON = VAULT / "data" / "attractions.json"
PROPOSALS_CSV = VAULT / "data" / "tag-proposals.csv"
RAW_LOG = VAULT / "data" / "tag-proposals.raw.jsonl"

# ======== Tag vocabulary (Round 8 locked — 2026-04-21) ========
# Round 8 changes from Round 7:
#   - Added 'history' to ATTRACTION_TAGS (museums, historical tours, Titanic, Homestead)
#   - Added '2-3hr' to ATTRACTION_TAGS (was a gap between '1-2hr' and 'half-day' ~4hr)
#   - Added 'religious' to AUDIENCE_VIBE (Branson has many biblical/gospel/faith shows)
SHOW_CATEGORIES = ["music", "comedy", "magic", "variety", "drama", "tribute"]
MUSIC_SUBGENRES = ["country", "rock", "gospel", "bluegrass", "pop",
                   "oldies-50s", "oldies-60s", "oldies-70s", "oldies-80s", "classical"]
AUDIENCE_VIBE = ["family", "adult-humor", "date-night", "kid-focused", "religious"]
ATTRACTION_TAGS = ["indoor", "outdoor", "ride", "museum", "active", "relaxed",
                   "food", "shopping", "educational", "thrill", "animals",
                   "water", "history",
                   "under-1hr", "1-2hr", "2-3hr", "half-day", "all-day"]

ALL_TAGS = sorted(set(SHOW_CATEGORIES + MUSIC_SUBGENRES + AUDIENCE_VIBE + ATTRACTION_TAGS))

SYSTEM_PROMPT = f"""You are a tag classifier for Branson, Missouri vacation attractions and shows.

Your ONLY job is to output valid JSON with the selected tags and a confidence score.

The fixed tag vocabulary (use ONLY these, do not invent new tags):

SHOW categories (pick 1-2 if the attraction is a show; empty list otherwise):
{json.dumps(SHOW_CATEGORIES)}

MUSIC subgenres (pick any that apply if the show has music):
{json.dumps(MUSIC_SUBGENRES)}

AUDIENCE vibe (pick any that apply):
{json.dumps(AUDIENCE_VIBE)}

ATTRACTION tags (pick any that apply):
{json.dumps(ATTRACTION_TAGS)}

Output format - return ONLY a JSON object, no preamble, no explanation:
{{
  "show_categories": ["<0-2 from SHOW categories>"],
  "music_subgenres": ["<0-N from MUSIC subgenres>"],
  "audience_vibe": ["<0-N from AUDIENCE vibe>"],
  "attraction_tags": ["<0-N from ATTRACTION tags>"],
  "confidence": <0.0 to 1.0>,
  "reasoning": "<one short sentence why>"
}}

Confidence rules:
- 0.9-1.0: clear and unambiguous (e.g. an explicit "family bluegrass band" show)
- 0.7-0.9: reasonable inference from description
- 0.4-0.7: best guess, Alex should check
- below 0.4: you don't have enough info

If the attraction description is very sparse, prefer lower confidence and fewer tags over guessing."""


def build_user_prompt(att):
    name = att.get("name", "(unknown)")
    category = att.get("category", "")
    duration = att.get("duration_hours")
    description = (att.get("description") or "").strip()
    notes = (att.get("notes") or "").strip()
    # Trim to keep prompt focused
    if len(description) > 600:
        description = description[:600] + "..."
    parts = [f"Name: {name}"]
    if category:
        parts.append(f"Category hint: {category}")
    if duration:
        parts.append(f"Duration: ~{duration}h")
    if description:
        parts.append(f"Description: {description}")
    if notes:
        parts.append(f"Notes: {notes}")
    return "\n".join(parts) + "\n\nOutput the JSON object only."


def call_ollama(host, model, system, user, timeout=120):
    """Direct Ollama /api/chat call with JSON format enforcement."""
    url = f"http://{host}:11434/api/chat"
    payload = {
        "model": model,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.1, "num_ctx": 4096},
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    req = Request(url, data=json.dumps(payload).encode("utf-8"),
                  headers={"Content-Type": "application/json"}, method="POST")
    start = time.time()
    with urlopen(req, timeout=timeout) as resp:
        body = json.loads(resp.read())
    elapsed = time.time() - start
    content = body.get("message", {}).get("content", "")
    return content, elapsed


def validate_tags(parsed):
    """Check returned tags are all in vocabulary. Returns (valid, warnings)."""
    warnings = []
    for key, allowed in [
        ("show_categories", SHOW_CATEGORIES),
        ("music_subgenres", MUSIC_SUBGENRES),
        ("audience_vibe", AUDIENCE_VIBE),
        ("attraction_tags", ATTRACTION_TAGS),
    ]:
        vals = parsed.get(key, [])
        if not isinstance(vals, list):
            warnings.append(f"{key} not a list: {vals!r}")
            continue
        for v in vals:
            if v not in allowed:
                warnings.append(f"{key}: unknown tag {v!r}")
    conf = parsed.get("confidence")
    if not isinstance(conf, (int, float)) or not (0 <= conf <= 1):
        warnings.append(f"confidence out of range: {conf!r}")
    return (len(warnings) == 0, warnings)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="plexpro", help="ollama host (default plexpro)")
    ap.add_argument("--model", default="qwen2.5:14b")
    ap.add_argument("--limit", type=int, default=None, help="limit N items for testing")
    ap.add_argument("--resume", action="store_true",
                    help="skip slugs already present in tag-proposals.csv")
    args = ap.parse_args()

    print(f"Reading {ATTRACTIONS_JSON}", file=sys.stderr)
    with open(ATTRACTIONS_JSON) as f:
        data = json.load(f)
    items = data["attractions"]
    if args.limit:
        items = items[:args.limit]
    print(f"  {len(items)} attractions", file=sys.stderr)

    existing_slugs = set()
    if args.resume and PROPOSALS_CSV.exists():
        with open(PROPOSALS_CSV) as f:
            for row in csv.DictReader(f):
                existing_slugs.add(row["slug"])
        print(f"  resume: skipping {len(existing_slugs)} already-done slugs", file=sys.stderr)

    results = []
    failure_count = 0
    raw_log = open(RAW_LOG, "a")

    for i, att in enumerate(items, 1):
        slug = att["slug"]
        if slug in existing_slugs:
            continue
        name = att.get("name", "?")
        print(f"[{i}/{len(items)}] {slug} — {name[:50]}", file=sys.stderr)
        user_prompt = build_user_prompt(att)

        try:
            raw, elapsed = call_ollama(args.host, args.model, SYSTEM_PROMPT, user_prompt)
        except (URLError, TimeoutError) as e:
            print(f"  LOUD: network/timeout error: {e}", file=sys.stderr)
            failure_count += 1
            raw_log.write(json.dumps({"slug": slug, "error": str(e)}) + "\n")
            continue

        raw_log.write(json.dumps({"slug": slug, "elapsed": elapsed, "raw": raw}) + "\n")
        raw_log.flush()

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as e:
            print(f"  LOUD: non-JSON response ({elapsed:.1f}s): {raw[:120]!r}", file=sys.stderr)
            failure_count += 1
            continue

        valid, warnings = validate_tags(parsed)
        if warnings:
            for w in warnings:
                print(f"  WARN: {w}", file=sys.stderr)

        conf = parsed.get("confidence", 0)
        all_tags = (
            parsed.get("show_categories", [])
            + parsed.get("music_subgenres", [])
            + parsed.get("audience_vibe", [])
            + parsed.get("attraction_tags", [])
        )
        results.append({
            "slug": slug,
            "name": name,
            "category_hint": att.get("category", ""),
            "confidence": conf,
            "proposed_tags": ",".join(all_tags),
            "show_categories": ",".join(parsed.get("show_categories", [])),
            "music_subgenres": ",".join(parsed.get("music_subgenres", [])),
            "audience_vibe": ",".join(parsed.get("audience_vibe", [])),
            "attraction_tags": ",".join(parsed.get("attraction_tags", [])),
            "reasoning": (parsed.get("reasoning") or "")[:200],
            "elapsed_s": f"{elapsed:.1f}",
            "validation_warnings": "; ".join(warnings),
        })

    raw_log.close()

    pct_fail = (failure_count / max(1, len(items))) * 100
    print(f"\nSummary: {len(results)} rows OK, {failure_count} failed ({pct_fail:.1f}%)", file=sys.stderr)

    if pct_fail > 10:
        print("LOUD ERROR: >10% failure rate. Alex should review raw log "
              "and consider Claude Opus fallback for failed rows.", file=sys.stderr)

    # Sort by confidence ASC so Alex reviews worst first
    results.sort(key=lambda r: (r["confidence"], r["slug"]))

    # Write CSV
    mode = "a" if (args.resume and PROPOSALS_CSV.exists()) else "w"
    write_header = not (mode == "a" and PROPOSALS_CSV.exists())
    with open(PROPOSALS_CSV, mode) as f:
        if results:
            writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
            if write_header:
                writer.writeheader()
            for r in results:
                writer.writerow(r)

    print(f"\nWrote {PROPOSALS_CSV}", file=sys.stderr)
    print(f"Raw log: {RAW_LOG}", file=sys.stderr)
    print(f"Review low-confidence rows first (top of CSV).", file=sys.stderr)
    sys.exit(1 if pct_fail > 10 else 0)


if __name__ == "__main__":
    main()
