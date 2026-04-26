<task_brief>

  <role>
    You are an expert Python developer and privacy-conscious systems engineer. You write clean,
    well-commented Python 3 that handles Apple Contacts SQLite queries, JSON file I/O, and
    field-level change detection. You never cut corners on privacy constraints -- they are
    absolute and non-negotiable.
  </role>

  <context>
    <vault>/Users/alex/vaults/Vacation/Branson 2026/</vault>
    <script>scripts/sync_people_from_contacts.py</script>
    <private_json>data/people.json</private_json>
    <public_json>web/people.json</public_json>

    <description>
      This vault manages a family vacation event with 26 attendees. A sync script pulls contact
      data from the macOS Apple Contacts SQLite database and maintains two JSON files:
        - data/people.json -- private, NEVER deployed, stores DOB, contact UUIDs, phone, email
        - web/people.json -- public, deployed to GitHub Pages, stores ONLY non-sensitive fields
          (currently: age). Phone, email, and DOB must NEVER appear in this file.

      The script currently pulls DOB plus contact name/nickname/phone/email (partially
      implemented). The task is to finalize the expansion, fix three known issues, and add
      per-field change detection for all 5 fields.
    </description>

    <apple_contacts_schema>
      All tables reside in the Apple Contacts SQLite database located by the existing
      find_contacts_db() function. Schema verified from live database:

      Table ZABCDRECORD:
        ZUNIQUEID       -- lookup key (matches contact_unique_id stored in data/people.json)
        Z_PK            -- integer primary key (used as FK target for phone/email joins)
        ZFIRSTNAME      -- first name (may be NULL)
        ZLASTNAME       -- last name (may be NULL)
        ZNICKNAME       -- nickname (may be NULL)
        ZBIRTHDAY       -- birthday (existing field, keep existing handling exactly)

      Table ZABCDPHONENUMBER:
        ZOWNER          -- FK to ZABCDRECORD.Z_PK
        ZFULLNUMBER     -- phone number string (e.g. '+17855551234')
        ZLABEL          -- label string (e.g. 'iPhone', 'mobile', 'home')
        ZORDERINGINDEX  -- integer, lower = higher priority in Contacts UI

      Table ZABCDEMAILADDRESS:
        ZOWNER          -- FK to ZABCDRECORD.Z_PK
        ZADDRESS        -- email address string
        ZLABEL          -- label string (e.g. 'iCloud', 'work', 'home')
        ZORDERINGINDEX  -- integer, lower = higher priority in Contacts UI

      Label constants (case-sensitive, exact):
        iPhone label  -- 'iPhone'
        iCloud label  -- 'iCloud'

      Join pattern:
        ZABCDPHONENUMBER.ZOWNER = ZABCDRECORD.Z_PK
        ZABCDEMAILADDRESS.ZOWNER = ZABCDRECORD.Z_PK
    </apple_contacts_schema>

    <field_extraction_rules>
      contact_name:     ZFIRSTNAME + ' ' + ZLASTNAME, then strip(). If both NULL, empty string ''.
      contact_nickname: ZNICKNAME if not NULL and not empty, else empty string ''.
      dob:              already implemented -- keep existing logic exactly, do not alter.
      phone:            ZFULLNUMBER where ZLABEL = 'iPhone' (exact match, ORDER BY ZORDERINGINDEX ASC).
                        If no iPhone label, use first phone ORDER BY ZORDERINGINDEX ASC.
                        If no phones at all, empty string ''.
      email:            ZADDRESS where ZLABEL = 'iCloud' (exact match, ORDER BY ZORDERINGINDEX ASC).
                        If no iCloud label, use first email ORDER BY ZORDERINGINDEX ASC.
                        If no emails at all, empty string ''.
      IMPORTANT: Always ORDER BY ZORDERINGINDEX ASC -- never ORDER BY ROWID.
    </field_extraction_rules>

    <known_issues_to_fix>
      Three issues identified by the Council of Minds review of the current script:

      Issue 1 -- ORDER BY ROWID vs ZORDERINGINDEX:
        The current lookup_contact_fields() queries use ORDER BY ROWID. This must be changed
        to ORDER BY ZORDERINGINDEX ASC in both the phone query and the email query.
        ROWID is insertion order; ZORDERINGINDEX reflects the user-visible order in Contacts.app.

      Issue 2 -- None vs empty-string semantics for phone/email:
        When the contact UUID IS found but has no phone rows, the current code may return None
        instead of ''. The correct behavior: if UUID found but no phone rows = ''; if UUID not
        found = preserve whatever was previously stored (do not overwrite). Same for email.

      Issue 3 -- Missing per-field change detection for contact_name, contact_nickname, phone, email:
        The script currently only detects DOB changes. It must also detect and report changes
        to all 4 other fields individually, using these normalization rules before comparing:
          - contact_name:     strip() both sides
          - contact_nickname: strip() both sides, treat None and '' as equivalent (both = no nickname)
          - phone:            re.sub(r'\D', '', value) for comparison only; store raw value
          - email:            .lower().strip() for comparison only; store raw value
    </known_issues_to_fix>

    <data_people_json_new_fields>
      Each record in data/people.json will gain these fields after --update mode runs:
        "contact_name":     "Octavia Shultz"      (str, may be '')
        "contact_nickname": "Buggy"               (str, may be '')
        "phone":            "+17855551234"         (str, may be '')
        "email":            "octavia@icloud.com"  (str, may be '')
      All existing keys must be preserved unchanged.
    </data_people_json_new_fields>

    <existing_script_structure>
      Read the script in full before touching anything. Key structure to preserve:
        find_contacts_db()       -- keep exactly
        zbirthday_to_date()      -- keep exactly
        calc_age()               -- keep exactly
        lookup_by_unique_id()    -- this returns (dob, found); keep its signature
        lookup_contact_fields()  -- this already exists; expand/fix it per the issues above
        main()                   -- update change detection to cover all 5 fields
      The try/finally block around conn must be preserved exactly.
      The check-mode / --update-mode split must be preserved exactly.
    </existing_script_structure>
  </context>

  <task>
    Read the existing script at scripts/sync_people_from_contacts.py in full before writing
    a single line. Then make exactly three targeted changes:

    CHANGE 1 -- Fix ORDER BY in lookup_contact_fields():
      Change all ORDER BY ROWID to ORDER BY ZORDERINGINDEX ASC in phone and email queries.

    CHANGE 2 -- Fix None vs empty-string semantics:
      After lookup_contact_fields() returns, ensure that when the contact UUID IS found:
        - phone None --> ''
        - email None --> ''
      When UUID is NOT found: do not overwrite the existing stored values.

    CHANGE 3 -- Add per-field change detection for all 4 contact fields:
      In main(), after fetching all fields, compare each of the 4 contact fields
      (contact_name, contact_nickname, phone, email) against what is stored in
      data/people.json. Use the normalization rules from known_issues_to_fix.
      Report each changed field with: field name, old value, new value.
      When contact_nickname has changed, print an advisory:
        "  REVIEW: display_name is currently '{display_name}' -- update it if needed."
      The script must NOT auto-update display_name. Human decision only.

    Additionally:
      - Add the PRIVACY comment in the --update write block for web/people.json:
        # PRIVACY: only age is written to public JSON
      - Add import re at the top if not already present (needed for phone normalization).
  </task>

  <instructions>
    <step n="1">
      Read the full current contents of scripts/sync_people_from_contacts.py.
      Identify the exact lines where: (a) phone/email queries use ORDER BY; (b) phone/email
      None values are handled after lookup; (c) change detection for DOB occurs (use that
      pattern to add change detection for the 4 other fields).
    </step>

    <step n="2">
      Make CHANGE 1: find both ORDER BY ROWID occurrences in lookup_contact_fields() and
      replace with ORDER BY ZORDERINGINDEX ASC.
    </step>

    <step n="3">
      Make CHANGE 2: in the section of main() where lookup_contact_fields() results are
      used, add None-to-empty-string coercion for phone and email when the contact was found
      (i.e. when found=True from lookup_by_unique_id).
    </step>

    <step n="4">
      Make CHANGE 3: after the existing DOB change detection block, add parallel change
      detection for contact_name, contact_nickname, phone, and email. Use the normalizations
      specified. Accumulate changed fields into a list and print them in the summary.
      Add the nickname advisory print when contact_nickname changed.
    </step>

    <step n="5">
      Add the PRIVACY comment and import re (if missing).
    </step>

    <step n="6">
      Read the entire edited script to verify:
        - find_contacts_db(), zbirthday_to_date(), calc_age() are unchanged.
        - try/finally block intact.
        - No phone, email, dob, contact_name, contact_nickname written to web/people.json.
        - 'PRIVACY' string present in the file.
        - 'import re' present.
    </step>

    <step n="7">
      Run all 5 quality gates. Report command, output, exit code. Fix and re-run if any fail.
    </step>
  </instructions>

  <constraints>
    <absolute_privacy>
      phone and email values MUST NEVER be written to web/people.json under any code path.
      This constraint supersedes all other considerations. If in doubt, omit.
    </absolute_privacy>

    <file_scope>
      Modify ONLY:
        - scripts/sync_people_from_contacts.py
        - data/people.json (only when --update flag is passed)
        - web/people.json (only when --update flag is passed, only the 'age' field per record)
      Do NOT touch any HTML files.
      Do NOT run or modify generate_dashboard.py.
    </file_scope>

    <display_name_handling>
      display_name is the human-curated dashboard label. The script MUST NOT automatically
      update display_name. It MUST print an advisory when contact_nickname changes.
    </display_name_handling>

    <empty_field_handling>
      No phone + no email = valid state. Store ''. Do not error.
    </empty_field_handling>
  </constraints>

  <quality_gates>
    Run from vault root (/Users/alex/vaults/Vacation/Branson 2026/).

    Gate 1 -- Script runs cleanly in check mode:
      python3 scripts/sync_people_from_contacts.py
      Expected: exit code 0, output shows contact_name/contact_nickname/dob/phone/email for all 26.

    Gate 2 -- Public JSON has zero private fields:
      grep -c 'phone\|email' web/people.json
      Expected: 0. Any non-zero = privacy violation, fix immediately.

    Gate 3 -- --update writes new fields to private JSON:
      python3 scripts/sync_people_from_contacts.py --update
      grep -c 'contact_name\|contact_nickname\|phone\|email' data/people.json
      Expected: count > 0.

    Gate 4 -- PRIVACY comment present:
      grep -c 'PRIVACY' scripts/sync_people_from_contacts.py
      Expected: >= 1.

    Gate 5 -- Script exits cleanly after --update:
      python3 scripts/sync_people_from_contacts.py
      Expected: exit code 0.
  </quality_gates>

  <handback_format>
    When all gates pass, report:
    1. One paragraph: what was changed and why.
    2. Quality gate results (command + output + exit code for each).
    3. List any persons where phone or email resolved to '' so operator can investigate.
    4. STOP. Do not push, rsync, or run generate_dashboard.py.
  </handback_format>

</task_brief>
