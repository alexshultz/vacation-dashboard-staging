# Grill-Me: Admin Email/Password Auth

_Design Q&A for switching `admin.html` from Supabase passkeys (WebAuthn) to email/password auth._

---

## Q1: Why email/password instead of another passkey-free option — magic link, OAuth, or OTP?

**Answer:** Email/password is the fastest path to a working auth gate with zero extra infrastructure. Magic links require reliable email delivery (spam filters, delays) which adds friction on a personal project. OAuth adds an external provider dependency and a callback URL to maintain. OTP adds a code-entry step with the same email delivery risk. This is a single-admin tool. Email/password is well-understood, immediately unblockable, and lives entirely inside the Supabase project we already have. No new services, no new dependencies.

Alex's Thoughts:

---

## Q2: Why does only `admin.html` need changes — not `admin-event-timeline.html` or `admin-index.html`?

**Answer:** The other admin pages only verify that a session exists — they call `supabaseClient.auth.getSession()` and redirect to `admin.html` if the result is `null`. That check is auth-method-agnostic. A Supabase email/password session satisfies it identically to what a passkey session would have. The sign-in UX lives exclusively in `admin.html`. The other pages are already compatible with email/password and require no changes.

Alex's Thoughts:

---

## Q3: Is it safe to remove `{ auth: { experimental: { passkey: true } } }` from `createClient`? Could it silently break anything?

**Answer:** Yes, safe. That flag is purely additive — it unlocks experimental WebAuthn methods (`signInWithPasskey`, etc.) in the SDK. Removing it has no effect on the standard auth surface: `auth.getSession()`, `auth.signInWithPassword()`, and `auth.signOut()` are stable, non-experimental APIs that work regardless of whether the passkey flag is present. The only thing that breaks is the passkey UI we're intentionally replacing.

Alex's Thoughts:

---

## Q4: Should we pre-populate the email field with Alex's known address, or show a blank form?

**Answer:** Blank standard form. Pre-populating the email would require hardcoding it in source, which creates a mild maintenance hazard if the Supabase account email ever changes and looks sloppy if the file is ever shared or reviewed. It's a one-person admin tool — the user knows their email. A blank email + password form is the right call.

Alex's Thoughts:

---

## Q5: The old `showAuthUI()` function used `branson_passkey_registered` in localStorage to toggle between register and sign-in views. What happens to that key and that function?

**Answer:** Both are retired. With email/password there's no device registration concept — the flow is always just "show the login form." The `showAuthUI()` function is replaced with a simpler call that shows `#auth-email-login`. Any existing `branson_passkey_registered` value in localStorage is harmlessly stranded — it's never read again and will eventually be cleared with browser data. No active cleanup is needed; don't add any cleanup code.

Alex's Thoughts:

---

## Q6: Where should the Sign Out button live, and does it need a confirmation dialog?

**Answer:** Inside `#editor-section`'s `#admin-hub-nav` div, alongside "Edit Schedule" and "Edit Home View." No confirmation dialog. Sign-out from a personal tool isn't destructive — no data loss is possible. If accidentally triggered, signing back in takes seconds. A confirm dialog adds friction disproportionate to the risk.

Alex's Thoughts:

---

## Q7: Do we need a "Forgot Password" or password reset flow in the UI?

**Answer:** No. This is a single-admin personal tool. If Alex ever forgets his password, the recovery path is the Supabase Dashboard (Authentication → Users → Reset Password). Adding a reset flow in-page would be meaningful engineering complexity for a problem that will occur at most once. The task brief documents the Supabase Dashboard as the recovery path.

Alex's Thoughts:

---

## Q8: Should we switch the session check from `DOMContentLoaded` + `getSession()` to `onAuthStateChange`?

**Answer:** No. The current pattern — check session on `DOMContentLoaded`, show editor if session exists, show login form otherwise — is correct and simple. `onAuthStateChange` is designed for apps that need to react to auth events over time (e.g., token refresh, sign-out in another tab). For a page that only needs to gate access at load time, polling once with `getSession()` is idiomatic and sufficient. Switching to `onAuthStateChange` would be scope creep that adds complexity without a concrete benefit for this use case.

Alex's Thoughts:
