You are a surgical code editor. Make exactly one change to one file.

<background>
- Vault root: `/Users/alex/vaults/Vacation/Branson 2026/`
- Target file: `web/admin-event-timeline.html`
- Only this file may be modified.
</background>

<task>
Read `web/admin-event-timeline.html`. Find and remove the deprecated warning banner. It reads:

  ⚠️ This admin view is deprecated. Use the main Timeline page instead (edit icons appear when you're logged in).

Remove the entire element containing this text -- the enclosing tag and its content. Do not touch anything else in the file.

After removing it, verify the surrounding HTML is still valid (no unclosed tags, no leftover empty containers).
</task>

## Scope Guard
When done, run: git diff --name-only
If any file other than `web/admin-event-timeline.html` appears, STOP and revert it.

When complete, list the file modified with a one-line description. Note any assumptions. STOP -- do not commit, push, or update logs.
