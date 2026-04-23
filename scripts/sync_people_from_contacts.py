#!/usr/bin/env python3
"""
sync_people_from_contacts.py
----------------------------
Reads each person in data/people.json, looks them up by ZUNIQUEID in Apple Contacts,
re-extracts their birthday using the verified ZBIRTHDAY + CDT-6 method, recalculates
their age as of the trip start date, and reports any differences.

Usage:
  python3 scripts/sync_people_from_contacts.py           -- check mode (no writes)
  python3 scripts/sync_people_from_contacts.py --update  -- update both JSON files

Outputs:
  - data/people.json        (private: DOBs + contact UUIDs -- never deployed)
  - web/people.json         (public-safe: display names, ages, arrival/departure only)

Method:
  Uses ZBIRTHDAY (CoreData timestamp, seconds since 2001-01-01 UTC) converted to
  local CDT (UTC-6) to get the correct calendar date. This is the verified method
  that matches what you see in Contacts.app. ZBIRTHDAYYEARLESS is NOT used.

Requirements:
  - Apple Contacts database must be accessible (Full Disk Access granted to Terminal/Python)
  - Run from the vault root:  cd "/Users/alex/vaults/Vacation/Branson 2026"
"""

import json
import sys
import sqlite3
from datetime import date, timedelta, datetime, timezone
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────

VAULT        = Path(__file__).parent.parent
PRIVATE_JSON = VAULT / "data" / "people.json"
PUBLIC_JSON  = VAULT / "web"  / "people.json"

# Apple Contacts DB -- find the active source UUID automatically
AB_BASE = Path.home() / "Library" / "Application Support" / "AddressBook" / "Sources"

def find_contacts_db():
    """Find the active Apple Contacts SQLite database."""
    matches = list(AB_BASE.glob("*/AddressBook-v22.abcddb"))
    if not matches:
        sys.exit("ERROR: Apple Contacts database not found. Grant Full Disk Access to Terminal.")
    if len(matches) > 1:
        # Pick the largest (most data = most likely the primary)
        matches.sort(key=lambda p: p.stat().st_size, reverse=True)
    return str(matches[0])

# ── Date conversion ───────────────────────────────────────────────────────────

CORETIME_EPOCH = datetime(2001, 1, 1, tzinfo=timezone.utc)
CDT_OFFSET_HOURS = 6  # Central Daylight Time = UTC-6

def zbirthday_to_date(zbirthday_secs):
    """
    Convert Apple CoreData ZBIRTHDAY timestamp to a local calendar date.
    ZBIRTHDAY = seconds elapsed since 2001-01-01 00:00:00 UTC.
    We subtract 6 hours to convert UTC -> CDT (Central Daylight Time).
    This matches what Contacts.app displays as the birthday.
    """
    if zbirthday_secs is None:
        return None
    dt_utc = CORETIME_EPOCH + timedelta(seconds=int(zbirthday_secs))
    dt_local = dt_utc - timedelta(hours=CDT_OFFSET_HOURS)
    return dt_local.date()

def calc_age(dob, reference_date):
    """Calculate age as of reference_date, accounting for whether birthday has passed."""
    if not dob:
        return None
    age = reference_date.year - dob.year
    if (dob.month, dob.day) > (reference_date.month, reference_date.day):
        age -= 1
    return age

# ── Contacts lookup ───────────────────────────────────────────────────────────

def lookup_by_unique_id(cur, unique_id):
    """
    Look up a contact's birthday by their stable ZUNIQUEID.
    Returns (dob_date, found) where found=True means the UUID existed in Contacts.
    dob_date may still be None if the contact has no birthday set.
    """
    cur.execute("""
        SELECT ZBIRTHDAYYEAR, ZBIRTHDAY
        FROM ZABCDRECORD
        WHERE ZUNIQUEID = ?
        LIMIT 1
    """, (unique_id,))
    row = cur.fetchone()
    if not row:
        return None, False   # UUID genuinely not found
    byear, btime = row
    dob = zbirthday_to_date(btime)
    return dob, True         # UUID found; dob may be None if birthday field is empty

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    update_mode = "--update" in sys.argv

    # Load existing private JSON
    if not PRIVATE_JSON.exists():
        sys.exit(f"ERROR: {PRIVATE_JSON} not found. Run the initial setup first.")

    with open(PRIVATE_JSON) as f:
        private_data = json.load(f)

    trip_start = date.fromisoformat(private_data["trip_start"])
    attendees  = private_data["attendees"]

    # Connect to Contacts
    db_path = find_contacts_db()
    print(f"Using Contacts DB: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        print(f"\nChecking {len(attendees)} attendees against Apple Contacts...")
        print(f"Trip start for age calculation: {trip_start}\n")
        print(f"{'Name':<12} {'Stored DOB':<13} {'Contacts DOB':<13} {'Age':<5} {'Change?'}")
        print("-" * 60)

        changes = []
        errors  = []

        for person in attendees:
            display = person["display_name"]
            uid     = person.get("contact_unique_id")
            stored_dob_str = person.get("dob")
            stored_dob = date.fromisoformat(stored_dob_str) if stored_dob_str else None

            if not uid:
                errors.append(f"{display}: no contact_unique_id stored")
                print(f"{display:<12} {'?':<13} {'?':<13} {'?':<5} NO UUID STORED")
                continue

            contacts_dob, found = lookup_by_unique_id(cur, uid)

            if not found:
                errors.append(f"{display}: UUID not found in Contacts -- contact may have been re-created")
                stored_str = str(stored_dob) if stored_dob else "?"
                print(f"{display:<12} {stored_str:<13} {'NOT FOUND':<13} {'?':<5} UUID MISSING")
                continue

            if contacts_dob is None:
                errors.append(f"{display}: contact found but birthday field is empty in Contacts")
                stored_str = str(stored_dob) if stored_dob else "?"
                print(f"{display:<12} {stored_str:<13} {'NO BIRTHDAY':<13} {'?':<5} BIRTHDAY EMPTY")
                continue

            age = calc_age(contacts_dob, trip_start)
            stored_str   = str(stored_dob) if stored_dob else "?"
            contacts_str = str(contacts_dob)
            changed = contacts_dob != stored_dob
            marker = " <<< CHANGED" if changed else ""

            print(f"{display:<12} {stored_str:<13} {contacts_str:<13} {str(age):<5}{marker}")

            if changed:
                changes.append({
                    "display_name": display,
                    "old_dob": stored_str,
                    "new_dob": contacts_str,
                    "new_age": age,
                })

            # Update the person record in memory
            person["dob"]            = contacts_str
            person["age_trip_start"] = age

    finally:
        conn.close()

    # Summary
    print(f"\n{'='*60}")
    print(f"Results: {len(changes)} change(s), {len(errors)} error(s)")

    if changes:
        print(f"\nCHANGED BIRTHDAYS:")
        for c in changes:
            print(f"  {c['display_name']}: {c['old_dob']} -> {c['new_dob']} (age {c['new_age']})")

    if errors:
        print(f"\nERRORS (manual attention needed):")
        for e in errors:
            print(f"  {e}")

    if not changes and not errors:
        print("All birthdays match. No updates needed.")
        return

    # Write updates
    if update_mode:
        if changes:
            print(f"\nWriting updated data/people.json...")
            private_data["last_updated"] = str(date.today())
            private_data["attendees"] = attendees
            with open(PRIVATE_JSON, "w") as f:
                json.dump(private_data, f, indent=2)
            print(f"  Saved: {PRIVATE_JSON}")

            # Rebuild public web/people.json from updated private data
            print(f"Writing updated web/people.json...")
            with open(PUBLIC_JSON) as f:
                public_data = json.load(f)

            # Build a lookup from display_name -> updated age
            age_lookup = {p["display_name"]: p["age_trip_start"] for p in attendees}

            for pub_person in public_data["attendees"]:
                name = pub_person["display_name"]
                if name in age_lookup and age_lookup[name] is not None:
                    pub_person["age"] = age_lookup[name]

            public_data["last_updated"] = str(date.today())
            with open(PUBLIC_JSON, "w") as f:
                json.dump(public_data, f, indent=2)
            print(f"  Saved: {PUBLIC_JSON}")

            print(f"\nDone. Remember to:")
            print(f"  1. Run the GitHub Pages sync to deploy web/people.json")
            print(f"  2. Commit both files to git")
        else:
            print("\nNo birthday changes to write.")
    else:
        if changes:
            print(f"\nRun with --update to apply these changes:")
            print(f"  python3 scripts/sync_people_from_contacts.py --update")


if __name__ == "__main__":
    main()
