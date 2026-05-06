<task>
  <description>
    Insert a single "Need help?" paragraph element into web/profile.html, immediately before the closing </main> tag. This is a purely mechanical one-line insertion -- no design decisions, no JavaScript, no other files.
  </description>

  <workdir>/Users/alex/vaults/Vacation/Branson 2026</workdir>

  <constraints>
    <only_file_to_modify>web/profile.html</only_file_to_modify>
    <do_not_touch>
      - Any file other than web/profile.html
      - Any existing element inside profile.html
      - generate_dashboard.py
      - generate_attractions.py
      - Any CSS file
    </do_not_touch>
  </constraints>

  <insertion>
    <target_file>web/profile.html</target_file>
    <placement>Immediately before the sole closing &lt;/main&gt; tag (currently at line 150). There is exactly one &lt;/main&gt; closing tag in the file -- use it as your anchor. Do NOT modify any existing line; only insert new lines.</placement>
    <html_to_insert>
&lt;p class="profile-help-link" style="text-align:center;margin-top:2rem;"&gt;
  &lt;a href="help.html"&gt;Need help? View the Help page&lt;/a&gt;
&lt;/p&gt;
    </html_to_insert>
    <note>Copy the HTML block above exactly -- class name, inline style, href, and link text must be character-for-character identical. No reformatting.</note>
  </insertion>

  <how_to_edit>
    Use a targeted find-and-replace to locate the unique closing &lt;/main&gt; tag in web/profile.html and insert the paragraph block immediately before it. Do NOT rewrite the full file. Verify the anchor string is unique before applying.
  </how_to_edit>

  <safety_checks>
    Run ALL four greps after editing and confirm each result:

    1. grep -c 'help.html' web/profile.html
       MUST return >= 1  (confirms insertion succeeded)

    2. grep -c 'fetch.*data\.json' web/attractions.html
       MUST return >= 1  (verify-only)

    3. grep -c 'pointerdown' web/quick-pick.html
       MUST return 1     (verify-only)

    4. grep -c 'fetch.*help\.json' web/help.html
       MUST return 1     (verify-only)

    If any grep returns an unexpected value, STOP and report the failure.
    Do not modify any file other than web/profile.html.
    Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.
  </safety_checks>

  <handback_format>
    When done, report exactly:
    1. File modified: web/profile.html
    2. No other files touched: yes/no
    3. Safety grep results (all four, with actual counts)
    4. STOP -- do not commit, push, open PRs, or update any logs or dashboards.
  </handback_format>
</task>
