<task>
You are a Python codemaster. Your job is to expand an existing script to pull five additional fields from Apple Contacts for 26 attendees, store them in a private JSON file, and conditionally propagate display_name changes to a public JSON file — while preserving all existing behavior and code structure exactly.
</task>

<background>
## Project Layout

Vault root: `/Users/alex/vaults/Vacation/Branson 2026/`

Run all commands from there. The script uses `Path(__file__).parent.parent` to find the vault root, so it must remain in `scripts/`.

### Files You Will Modify
- `scripts/sync_people_from_contacts.py` — the script to expand (currently 236 lines)
- `data/people.json` — private JSON (never deployed): add 5 new fields per attendee
- `web/people.json` — public JSON (deployed to GitHub Pages): update `display_name` and `age` only

### Files You Must NOT Modify
- `web/index.html`
- `web/event-timeline.html`
- Any other `web/*.html` file
- `scripts/generate_dashboard.py` (permanently frozen — do not even read it)

---

## Apple Contacts Database

Auto-discovered by the existing `find_contacts_db()` function (glob for `*/AddressBook-v22.abcddb`). Do not hardcode the path.

Canonical path for reference only:
`~/Library/Application Support/AddressBook/Sources/9948AF96-C726-4CF6-A28B-33DDD64B5FFF/AddressBook-v22.abcddb`

### Relevant Tables and Columns

**ZABCDRECORD**
- `Z_PK` — integer primary key
- `ZUNIQUEID` — text, stable UUID used as lookup key (e.g. `"9FBD9777-244E-4554-B4FA-BB89A240AF64:ABPerson"`)
- `ZFIRSTNAME` — text or NULL
- `ZLASTNAME` — text or NULL
- `ZNICKNAME` — text or NULL
- `ZBIRTHDAYYEAR`, `ZBIRTHDAY` — already used by existing code

**ZABCDPHONENUMBER**
- `ZOWNER` — integer FK → `ZABCDRECORD.Z_PK`
- `ZFULLNUMBER` — text, the phone number to store
- `ZLABEL` — text, e.g. `"_$!<iPhone>!$_"` or `"_$!<Mobile>!$_"`

**ZABCDEMAILADDRESS**
- `ZOWNER` — integer FK → `ZABCDRECORD.Z_PK`
- `ZADDRESS` — text, the email address to store
- `ZLABEL` — text, e.g. `"_$!<iCloud>!$_"` or `"_$!<Home>!$_"`

### Label Matching Rules

iPhone phone (preferred): `ZLABEL LIKE '%iPhone%' OR ZLABEL = '_$!<iPhone>!$_'`
Fallback phone: first row from `ZABCDPHONENUMBER` WHERE `ZOWNER = Z_PK`

iCloud email (preferred): `ZLABEL LIKE '%iCloud%' OR ZLABEL = '_$!<iCloud>!$_'`
Fallback email: first row from `ZABCDEMAILADDRESS` WHERE `ZOWNER = Z_PK`

If no phone rows exist at all → store `null`. Same for email.

---

## data/people.json Structure

Each attendee object currently has:
```json
{
  "display_name": "Bug",
  "full_name": "Octavia Shultz",
  "dob": "2018-02-07",
  "age_trip_start": 8,
  "contact_unique_id": "02F0E700-E7DB-463B-8AFF-293EB4882CFC:ABPerson"
}
```

After your changes, each object must also include:
```json
{
  "contact_first_name": "Octavia",
  "contact_last_name": "Shultz",
  "contact_nickname": "Buggy",
  "contact_phone": "+1 (555) 000-0001",
  "contact_email": "octavia@icloud.com"
}
```

NULL values from SQLite must be stored as JSON `null` (not empty string).

---

## web/people.json Structure

Each attendee object currently has: `display_name`, `full_name`, `age`, `arrival`, `departure`.

The `--update` mode must:
1. Update `age` (existing behavior — keep it)
2. Update `display_name` if and only if `contact_nickname` is non-null and non-empty
3. NEVER add `contact_phone`, `contact_email`, `contact_nickname`, `contact_first_name`, `contact_last_name`, or any private field

Matching between private and public JSON is done by `display_name` (before any rename). If a rename occurs, find the public record by the OLD display_name, then update it.

---

## Existing Code You Must Preserve Unchanged

1. `find_contacts_db()` — auto-discovery glob, exit on not-found, pick largest on tie
2. `zbirthday_to_date()` — CoreData epoch + CDT-6 correction
3. `calc_age()` — birthday-has-passed logic
4. `lookup_by_unique_id()` — returns `(dob, found)` with three distinct cases:
   - UUID not found: `(None, False)` → prints `UUID MISSING`
   - UUID found but birthday empty: `(None, True)` → prints `BIRTHDAY EMPTY`
   - UUID found with birthday: `(date, True)` → normal path
5. `try/finally: conn.close()` block — must remain; all DB work inside `try`
6. The columnar `print()` table for all 26 people
7. All existing imports — do not remove any; do not add imports for functionality already available

---

## display_name Rename Logic

**Rule:** If `contact_nickname` (from ZNICKNAME) is non-null and non-empty string after `.strip()`:
- Set `person["display_name"]` in `data/people.json` to the nickname value
- Update the matching entry in `web/people.json` (matched by OLD display_name)
- Print prominently: `DISPLAY NAME CHANGED: Bug -> Buggy`
- Add to a `name_changes` list for the summary section

If nickname is null or empty → leave `display_name` untouched in both files.

---

## HTML Hardcoded Name Warning

`web/index.html` and `web/event-timeline.html` contain JavaScript `eventsData` arrays with display names baked in as string literals. The script cannot patch these files.

When any `display_name` change is detected (check mode OR update mode), print a warning section after the summary:

```
⚠️  MANUAL REVIEW REQUIRED — hardcoded display names in HTML:
   web/index.html          -- eventsData array contains display names
   web/event-timeline.html -- eventsData array contains display names
   Search for the OLD name(s) and update manually:
     Bug  (now: Buggy)
```

Print this warning whether or not `--update` was passed — it is always informational.

---

## Script Modes

**Check mode (no args):** Read Contacts, compute all changes, print full report. Write nothing to disk.

**`--update` mode:** Apply all changes to `data/people.json`. Update `display_name` and `age` in `web/people.json`. Never write phone/email to `web/people.json`.

In both modes, the full table of all 26 people must be printed and the script must exit 0.

---

## New Helper Function to Add

Add a function `lookup_contact_fields(cur, unique_id)` that returns a dict:
```python
{
    "z_pk": int_or_none,
    "first_name": str_or_none,
    "last_name": str_or_none,
    "nickname": str_or_none,
    "phone": str_or_none,
    "email": str_or_none,
}
```

It performs:
1. One SELECT on ZABCDRECORD for `Z_PK, ZFIRSTNAME, ZLASTNAME, ZNICKNAME` WHERE `ZUNIQUEID = ?`
2. If no row → return dict with all None values and z_pk=None
3. One SELECT on ZABCDPHONENUMBER for iPhone-preferred phone (use `CASE`/`ORDER BY` or Python preference logic)
4. One SELECT on ZABCDEMAILADDRESS for iCloud-preferred email

Phone preference query (one query, Python picks preferred):
```sql
SELECT ZFULLNUMBER, ZLABEL FROM ZABCDPHONENUMBER WHERE ZOWNER = ? ORDER BY ROWID
```
Then in Python: pick first row where label matches iPhone pattern; if none, pick first row overall; if no rows, None.

Email preference query (same pattern):
```sql
SELECT ZADDRESS, ZLABEL FROM ZABCDEMAILADDRESS WHERE ZOWNER = ? ORDER BY ROWID
```
Then in Python: pick first row where label matches iCloud pattern; if none, pick first row overall; if no rows, None.
</background>

<constraints>
1. Do NOT modify any `web/*.html` file for any reason.
2. Do NOT run `generate_dashboard.py` or import it.
3. Do NOT add dead imports. Only add imports that are actually used in new code.
4. Do NOT remove or alter existing imports.
5. The `try/finally: conn.close()` block is mandatory. All database access must occur inside the `try` block.
6. `data/people.json` and `web/people.json` may only be written when `--update` is passed.
7. `web/people.json` must never contain `contact_phone`, `contact_email`, `contact_nickname`, `contact_first_name`, or `contact_last_name`.
8. The script must exit 0 in both check mode and update mode (errors are reported, not raised as exceptions that kill the script, unless the DB or JSON file is completely inaccessible).
9. Preserve the columnar output table — all 26 people must appear whether or not their contact fields changed.
10. The `note` field in `data/people.json` must be updated to mention the five new contact fields.
</constraints>

<rules>
### Summary Section Order (printed at end, both modes)

1. `Results: N birthday change(s), N display_name change(s), N error(s)`
2. `CHANGED BIRTHDAYS:` block (existing)
3. `DISPLAY NAME CHANGED: OldName -> NewName` — one line per rename, printed prominently
4. `ERRORS (manual attention needed):` block (existing)
5. `⚠️  MANUAL REVIEW REQUIRED` HTML warning block (only if any name changes exist)
6. If update mode and changes were written: existing "Done. Remember to:" footer
7. If check mode and changes exist: existing "Run with --update to apply" footer

### Nickname Normalization
Apply `.strip()` to ZNICKNAME before comparing/storing. A whitespace-only string counts as empty (no rename).

### Matching public JSON to private JSON
Use a dict keyed by display_name: `pub_lookup = {p["display_name"]: p for p in public_data["attendees"]}`. Apply renames using the OLD name as key. After all renames, rebuild the public JSON.

### Field Storage Order in data/people.json per Attendee
Maintain existing fields first, then append new ones in this order:
`contact_first_name`, `contact_last_name`, `contact_nickname`, `contact_phone`, `contact_email`
(Python dicts preserve insertion order; use `person["contact_first_name"] = …` assignments in order.)
</rules>

<examples>
### Example: display_name rename flow

Private JSON before:
```json
{ "display_name": "Bug", "contact_unique_id": "02F0E700-...ABPerson" }
```

ZNICKNAME in Contacts = `"Buggy"`

Expected private JSON after `--update`:
```json
{
  "display_name": "Buggy",
  "contact_nickname": "Buggy",
  ...
}
```

Expected public JSON after `--update`:
```json
{ "display_name": "Buggy", "age": 8, "arrival": "...", "departure": "..." }
```

Console output during run:
```
DISPLAY NAME CHANGED: Bug -> Buggy

⚠️  MANUAL REVIEW REQUIRED — hardcoded display names in HTML:
   web/index.html          -- eventsData array contains display names
   web/event-timeline.html -- eventsData array contains display names
   Search for the OLD name(s) and update manually:
     Bug  (now: Buggy)
```

### Example: contact with no phone or email

```json
{
  "contact_phone": null,
  "contact_email": null
}
```

(Not an error — just stored as null. Do not print an error line for this.)

### Example: contact with iPhone phone and iCloud email

SQLite rows:
- ZABCDPHONENUMBER: `("+1 (314) 555-0002", "_$!<Mobile>!$_")`, `("+1 (314) 555-0001", "_$!<iPhone>!$_")`
- ZABCDEMAILADDRESS: `("alex@gmail.com", "_$!<Home>!$_")`, `("alex@icloud.com", "_$!<iCloud>!$_")`

Stored values:
```json
{
  "contact_phone": "+1 (314) 555-0001",
  "contact_email": "alex@icloud.com"
}
```
</examples>

<quality_gates>
After you finish, verify these pass before reporting done:

```bash
cd "/Users/alex/vaults/Vacation/Branson 2026"

# Gate 1: Check mode exits 0 and shows all 26 people
python3 scripts/sync_people_from_contacts.py

# Gate 2-4: After update mode, new fields appear in private JSON
python3 scripts/sync_people_from_contacts.py --update
grep -c 'contact_nickname' data/people.json   # must be >= 1
grep -c 'contact_phone' data/people.json      # must be >= 1
grep -c 'contact_email' data/people.json      # must be >= 1

# Gate 5: Privacy — phone and email must NOT appear in public JSON
grep -c 'contact_phone\|contact_email' web/people.json  # must return 0

# Gate 6: Bug renamed to Buggy (assumes Octavia Shultz has ZNICKNAME = 'Buggy' in Contacts)
python3 -c "import json; d=json.load(open('data/people.json')); p=[x for x in d['attendees'] if x['display_name']=='Buggy']; print(len(p))"
# must print 1
```

Gate 6 only passes if the Apple Contacts record for Octavia Shultz (UUID `02F0E700-E7DB-463B-8AFF-293EB4882CFC:ABPerson`) actually has ZNICKNAME = 'Buggy'. If that record has a different or empty nickname, Gate 6 will not pass — note this in your handback rather than patching around it.
</quality_gates>

<output_format>
Produce only the modified `scripts/sync_people_from_contacts.py`. Output it as a complete file inside a fenced code block. Do not produce partial diffs or snippets — the full file, ready to write to disk.

After the code block, list every file modified and a one-line description. Stop there. Do not run git, do not push, do not update logs.
</output_format>

<reminder>
- Do not invent SQL column names, table names, or file paths. Every name used here comes from the task brief and verified schema above.
- If a SQLite query returns no rows for a contact (phone table empty, email table empty), store `null` — do not treat this as an error.
- The `find_contacts_db()` function already handles DB path discovery. Do not hardcode the UUID path.
- If the ZNICKNAME for Octavia Shultz turns out to be NULL or empty at runtime, do NOT rename "Bug" — leave display_name unchanged and store `contact_nickname: null`. Note this in output.
- Do not silently discard errors. If a UUID is missing or a contact has no birthday, the existing error-reporting path handles it — extend it for new fields consistently.
- Do not add `import re` or any other import unless you use it. Use Python string `.lower()` and `in` for label matching if regex is not already imported.
- If you are uncertain whether a label check should use `LIKE` in SQL vs. Python string matching, use Python string matching on the fetched rows — it avoids SQL injection risk and is already consistent with the existing codebase style.
- Cite file, line, or field name when making factual claims about the existing codebase.
</reminder>
