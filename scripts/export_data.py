#!/usr/bin/env python3
"""Export data/attractions.json + data/blacklist.json -> web/data.json.

Adds two computed fields per attraction:
  - sort_key: lowercased name with leading article ("the ", "a ", "an ")
              stripped. Empty-after-strip falls back to original name lowercased.
  - visible: False when slug is in the blacklist, else True.

The output array is sorted by sort_key (stable sort). All attractions are
written -- hidden items are kept in the file so the frontend can filter on
`visible === false`.
"""

import json
import re
import sys
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent
ATTRACTIONS_PATH = VAULT_ROOT / "data" / "attractions.json"
BLACKLIST_PATH = VAULT_ROOT / "data" / "blacklist.json"
OUTPUT_PATH = VAULT_ROOT / "web" / "data.json"

ARTICLE_RE = re.compile(r"^(the|a|an)\s+", re.IGNORECASE)


def compute_sort_key(name: str) -> str:
    stripped = ARTICLE_RE.sub("", name).strip().lower()
    if not stripped:
        return name.lower()
    return stripped


def main() -> int:
    with ATTRACTIONS_PATH.open("r", encoding="utf-8") as f:
        attractions_doc = json.load(f)
    with BLACKLIST_PATH.open("r", encoding="utf-8") as f:
        blacklist_doc = json.load(f)

    attractions = attractions_doc.get("attractions", [])
    blacklist_slugs = blacklist_doc.get("blacklist", [])
    blacklist_set = set(blacklist_slugs)

    known_slugs = {a.get("slug") for a in attractions if a.get("slug")}
    for slug in blacklist_slugs:
        if slug not in known_slugs:
            print(
                f"WARNING: blacklist slug '{slug}' has no matching attraction -- skipped",
                file=sys.stderr,
            )

    for a in attractions:
        name = a.get("name", "") or ""
        slug = a.get("slug", "") or ""
        a["sort_key"] = compute_sort_key(name)
        a["visible"] = slug not in blacklist_set

    attractions_sorted = sorted(attractions, key=lambda a: a.get("sort_key", ""))

    output_doc = dict(attractions_doc)
    output_doc["attractions"] = attractions_sorted

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(output_doc, f, indent=2, ensure_ascii=False)
        f.write("\n")

    total = len(attractions_sorted)
    visible_count = sum(1 for a in attractions_sorted if a.get("visible"))
    hidden_count = total - visible_count
    first5 = ", ".join(a.get("slug", "") for a in attractions_sorted[:5])

    print(f"Export complete: {total} total | {visible_count} visible | {hidden_count} hidden")
    print(f"First 5 by sort order: {first5}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
