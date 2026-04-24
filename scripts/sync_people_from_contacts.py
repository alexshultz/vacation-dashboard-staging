#!/usr/bin/env python3
"""
sync_people_from_contacts.py
----------------------------
Reads each person in data/people.json, looks them up by ZUNIQUEID in Apple Contacts,
re-extracts their birthday using the verified ZBIRTHDAY + CDT-6 method, recalculates
their age as of the trip start date, pulls extended contact fields (name parts,
nickname, preferred phone, preferred email), and reports any differences.

Usage:
  python3 scripts/sync_people_from_contacts.py           -- check mode (no writes)
  python3 scripts/sync_people_from_contacts.py --update  -- update both JSON files

Outputs:
  - data/people.json        (private: DOBs + contact UUIDs + name/phone/email -- never deployed)
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
import re
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


def lookup_contact_fields(cur, unique_id):
    """
    Pull extended contact fields (Z_PK, name parts, nickname, preferred phone,
    preferred email) by ZUNIQUEID.

    Phone preference: a row whose ZLABEL exactly equals "iPhone" wins; otherwise
    the first row by ZORDERINGINDEX ASC is used. Email preference: a row whose
    ZLABEL exactly equals "iCloud" wins; otherwise the first row by
    ZORDERINGINDEX ASC is used. If the corresponding table has no rows for this
    owner, the value is None.

    Returns a dict with keys: z_pk, first_name, last_name, nickname, phone, email.
    All values may be None.
    """
    cur.execute("""
        SELECT Z_PK, ZFIRSTNAME, ZLASTNAME, ZNICKNAME
        FROM ZABCDRECORD
        WHERE ZUNIQUEID = ?
        LIMIT 1
    """, (unique_id,))
    row = cur.fetchone()
    if not row:
        return {
            "z_pk": None,
            "first_name": None,
            "last_name": None,
            "nickname": None,
            "phone": None,
            "email": None,
        }
    z_pk, first_name, last_name, nickname = row

    # Phone: iPhone label preferred (exact match), else first row.
    # ORDER BY ZORDERINGINDEX ASC -- user-visible order in Contacts.app.
    cur.execute("""
        SELECT ZFULLNUMBER, ZLABEL
        FROM ZABCDPHONENUMBER
        WHERE ZOWNER = ?
        ORDER BY ZORDERINGINDEX ASC
    """, (z_pk,))
    phone_rows = cur.fetchall()
    phone = None
    if phone_rows:
        for number, label in phone_rows:
            if number and label == "iPhone":
                phone = number
                break
        if phone is None:
            phone = phone_rows[0][0]

    # Email: iCloud label preferred (exact match), else first row.
    # ORDER BY ZORDERINGINDEX ASC -- user-visible order in Contacts.app.
    cur.execute("""
        SELECT ZADDRESS, ZLABEL
        FROM ZABCDEMAILADDRESS
        WHERE ZOWNER = ?
        ORDER BY ZORDERINGINDEX ASC
    """, (z_pk,))
    email_rows = cur.fetchall()
    email = None
    if email_rows:
        for address, label in email_rows:
            if address and label == "iCloud":
                email = address
                break
        if email is None:
            email = email_rows[0][0]

    return {
        "z_pk": z_pk,
        "first_name": first_name,
        "last_name": last_name,
        "nickname": nickname,
        "phone": phone,
        "email": email,
    }

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

    # Snapshot OLD display_name list before any in-place mutation; the public-JSON
    # rebuild needs to find rows by their pre-rename name.
    original_display_names = [p["display_name"] for p in attendees]

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

        birthday_changes       = []
        contact_field_changes  = []   # list of dicts: {display_name, field, old, new}
        errors                 = []
        empty_phone            = []   # display_names whose phone resolved to ''
        empty_email            = []   # display_names whose email resolved to ''

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

            # UUID resolved -- pull extended fields.
            fields = lookup_contact_fields(cur, uid)

            # Build the target-schema values. UUID was found, so CHANGE 2
            # applies: None phone/email are coerced to '' here.
            first_part  = (fields["first_name"] or "").strip()
            last_part   = (fields["last_name"]  or "").strip()
            contact_name = f"{first_part} {last_part}".strip()

            nickname_raw = fields["nickname"]
            contact_nickname = nickname_raw.strip() if nickname_raw else ""

            phone = fields["phone"] if fields["phone"] is not None else ""
            email = fields["email"] if fields["email"] is not None else ""

            if phone == "":
                empty_phone.append(display)
            if email == "":
                empty_email.append(display)

            # Per-field change detection against what's already stored.
            stored_contact_name     = (person.get("contact_name") or "").strip()
            stored_contact_nickname = (person.get("contact_nickname") or "").strip()
            stored_phone            = person.get("phone") or ""
            stored_email            = person.get("email") or ""

            # contact_name: strip() both sides for comparison.
            if contact_name.strip() != stored_contact_name:
                contact_field_changes.append({
                    "display_name": display,
                    "field": "contact_name",
                    "old": stored_contact_name,
                    "new": contact_name,
                })

            # contact_nickname: strip both; None and '' are equivalent.
            if contact_nickname.strip() != stored_contact_nickname.strip():
                contact_field_changes.append({
                    "display_name": display,
                    "field": "contact_nickname",
                    "old": stored_contact_nickname,
                    "new": contact_nickname,
                })
                # REVIEW advisory: do NOT auto-update display_name.
                print(f"  REVIEW: display_name is currently '{display}' -- update it if needed.")

            # phone: compare digits only; store raw value.
            if re.sub(r'\D', '', phone) != re.sub(r'\D', '', stored_phone):
                contact_field_changes.append({
                    "display_name": display,
                    "field": "phone",
                    "old": stored_phone,
                    "new": phone,
                })

            # email: compare lowercased + stripped; store raw value.
            if email.lower().strip() != stored_email.lower().strip():
                contact_field_changes.append({
                    "display_name": display,
                    "field": "email",
                    "old": stored_email,
                    "new": email,
                })

            # Store the final target-schema values on the person record.
            person["contact_name"]     = contact_name
            person["contact_nickname"] = contact_nickname
            person["phone"]            = phone
            person["email"]            = email

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
            # Visibility line: show all 5 contact fields for this person.
            print(f"    contact_name={contact_name!r} contact_nickname={contact_nickname!r} "
                  f"dob={contacts_str} phone={phone!r} email={email!r}")

            if changed:
                birthday_changes.append({
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

    # ── Summary ──────────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"Results: {len(birthday_changes)} birthday change(s), "
          f"{len(contact_field_changes)} contact-field change(s), "
          f"{len(errors)} error(s)")

    if birthday_changes:
        print(f"\nCHANGED BIRTHDAYS:")
        for c in birthday_changes:
            print(f"  {c['display_name']}: {c['old_dob']} -> {c['new_dob']} (age {c['new_age']})")

    if contact_field_changes:
        print(f"\nCHANGED CONTACT FIELDS:")
        for c in contact_field_changes:
            old_disp = c["old"] if c["old"] != "" else "<empty>"
            new_disp = c["new"] if c["new"] != "" else "<empty>"
            print(f"  {c['display_name']} [{c['field']}]: {old_disp!r} -> {new_disp!r}")

    if errors:
        print(f"\nERRORS (manual attention needed):")
        for e in errors:
            print(f"  {e}")

    # ── Write updates ─────────────────────────────────────────────────────────
    if update_mode:
        # Always rewrite private JSON: even with no birthday/contact changes,
        # the contact fields per attendee need to be persisted.
        new_note = (
            "dob is stored as YYYY-MM-DD. age_trip_start is exact age on May 22, 2026. "
            "contact_unique_id is the Apple Contacts ZUNIQUEID. "
            "contact_name, contact_nickname, phone, email are pulled from Apple "
            "Contacts at sync time -- private, never deployed. display_name is "
            "human-curated; the sync script never overwrites it automatically. "
            "full_name is the legal name from the contact card."
        )
        private_data["note"]         = new_note
        private_data["last_updated"] = str(date.today())
        private_data["attendees"]    = attendees

        print(f"\nWriting updated data/people.json...")
        with open(PRIVATE_JSON, "w") as f:
            json.dump(private_data, f, indent=2)
        print(f"  Saved: {PRIVATE_JSON}")

        # PRIVACY: only age is written to public JSON
        # Public JSON carries only non-sensitive fields. Phone, email, dob,
        # contact_name, and contact_nickname MUST NEVER appear here.
        old_to_age = {
            orig_name: person.get("age_trip_start")
            for orig_name, person in zip(original_display_names, attendees)
        }

        print(f"Writing updated web/people.json...")
        with open(PUBLIC_JSON) as f:
            public_data = json.load(f)

        for pub_person in public_data["attendees"]:
            name_key = pub_person["display_name"]
            if name_key in old_to_age and old_to_age[name_key] is not None:
                pub_person["age"] = old_to_age[name_key]

        public_data["last_updated"] = str(date.today())
        with open(PUBLIC_JSON, "w") as f:
            json.dump(public_data, f, indent=2)
        print(f"  Saved: {PUBLIC_JSON}")

        if birthday_changes or contact_field_changes:
            print(f"\nDone. Remember to:")
            print(f"  1. Run the GitHub Pages sync to deploy web/people.json")
            print(f"  2. Commit both files to git")
        else:
            print(f"\nDone. Private JSON now includes contact fields; "
                  f"public JSON re-written but no age diffs.")
    else:
        if birthday_changes or contact_field_changes:
            print(f"\nRun with --update to apply these changes:")
            print(f"  python3 scripts/sync_people_from_contacts.py --update")


if __name__ == "__main__":
    main()
