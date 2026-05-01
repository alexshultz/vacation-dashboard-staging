# Task Brief: Switch Admin Auth from Passkeys to Email/Password

**Project:** Branson 2026 Vacation Dashboard  
**Vault root:** `/Users/alex/vaults/Vacation/Branson 2026/`  
**Scope:** `web/admin.html` only — no other file may be touched  
**Reason:** Supabase free plan does not support WebAuthn passkeys. The current UI shows "Passkeys are disabled" on every auth attempt. Switching to email/password which is fully supported on all Supabase plans.

---

## ⚠️ PREREQUISITE MANUAL STEP — DO THIS BEFORE RUNNING LAZLO

> **Alex must create a Supabase Auth user before this code change is useful.**
>
> 1. Open the [Supabase Dashboard](https://supabase.com/dashboard) → select the Branson '26 project
> 2. Go to **Authentication → Users**
> 3. Click **Add user → Create new user**
> 4. Enter your email address and choose a strong password
> 5. Click **Create User**
>
> ⚠️ **The new login form will show "Invalid login credentials" until this step is completed.** The code change itself is independent and can be deployed first, but login will not work until the user exists in Supabase.

---

## Background

The Supabase free plan does not support the WebAuthn passkey API. The current `admin.html` has:

- A `createClient` call with `{ auth: { experimental: { passkey: true } } }` as its third argument
- Two passkey divs inside `#passcode-section`: `#auth-register` (shows "Set up Face ID / Touch ID") and `#auth-signin` (shows "Sign in with Face ID / Touch ID")
- A `showAuthUI()` function that reads `branson_passkey_registered` from localStorage to toggle between the two divs
- Two passkey button click handlers (`register-btn`, `signin-btn`) that call `supabaseClient.auth.signInWithPasskey()`

All of these fail at runtime with "Passkeys are disabled." This task replaces the passkey UI and associated JS with a standard email/password login form backed by `supabaseClient.auth.signInWithPassword()`.

`admin-event-timeline.html` and `admin-index.html` are **not affected** — their session guards use `auth.getSession()` which works identically with email/password sessions. Do not touch those files.

---

## Constraints

- **Modify `web/admin.html` only.** No other file in the project may be touched.
- **Do not modify any HTML element not explicitly named in this task. If you encounter an element that looks unused or redundant, flag it in the handback report. Do not remove it.**
- Do not run `git add`, `git commit`, `git push`, or any deployment command.
- Do not add `console.log` statements, comments explaining removed code, or any code not described in this brief.

---

## Changes to Make

### Change 1 — Fix the `createClient` call (line ~202)

Remove the third argument (the passkey options object) and revert to the two-argument form.

**Before:**
```js
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { experimental: { passkey: true } } });
```

**After:**
```js
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### Change 2 — Replace the passkey HTML with an email/password login form

The two passkey divs (`#auth-register` and `#auth-signin`) inside `#passcode-section` must be replaced with a single email/password login div. The `#passcode-section` wrapper itself stays — do not touch it.

**Before** (lines ~39–56):
```html
<div id="auth-register" style="display:none;">
  <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin-bottom:12px;">Admin Access</h2>
  <p style="font-size:14px;color:var(--color-ink-dim);margin:0 0 20px;">Register your device to access admin tools.</p>
  <button id="register-btn"
    style="padding:12px 22px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:15px;cursor:pointer;color:var(--color-ink);width:100%;">
    Set up Face ID / Touch ID
  </button>
  <div id="auth-error" style="display:none;color:#c0392b;font-size:14px;margin-top:12px;"></div>
</div>
<div id="auth-signin" style="display:none;">
  <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin-bottom:12px;">Admin Access</h2>
  <p style="font-size:14px;color:var(--color-ink-dim);margin:0 0 20px;">Authenticate to access admin tools.</p>
  <button id="signin-btn"
    style="padding:12px 22px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:15px;cursor:pointer;color:var(--color-ink);width:100%;">
    Sign in with Face ID / Touch ID
  </button>
  <div id="auth-error-signin" style="display:none;color:#c0392b;font-size:14px;margin-top:12px;"></div>
</div>
```

**After** (replace both divs with this single div):
```html
<div id="auth-email-login">
  <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin-bottom:12px;">Admin Access</h2>
  <p style="font-size:14px;color:var(--color-ink-dim);margin:0 0 20px;">Sign in to access admin tools.</p>
  <div style="margin-bottom:12px;">
    <label for="login-email" style="display:block;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);margin-bottom:6px;">Email</label>
    <input type="email" id="login-email" autocomplete="email"
      style="width:100%;padding:9px 12px;border:1.5px solid var(--color-line);border-radius:var(--radius-btn);background:var(--color-surface);color:var(--color-ink);font-size:14px;box-sizing:border-box;">
  </div>
  <div style="margin-bottom:20px;">
    <label for="login-password" style="display:block;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-ink-dim);margin-bottom:6px;">Password</label>
    <input type="password" id="login-password" autocomplete="current-password"
      style="width:100%;padding:9px 12px;border:1.5px solid var(--color-line);border-radius:var(--radius-btn);background:var(--color-surface);color:var(--color-ink);font-size:14px;box-sizing:border-box;">
  </div>
  <button id="login-btn"
    style="padding:12px 22px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:15px;cursor:pointer;color:var(--color-ink);width:100%;">
    Sign In
  </button>
  <div id="auth-error-email" style="display:none;color:#c0392b;font-size:14px;margin-top:12px;"></div>
</div>
```

---

### Change 3 — Add a Sign Out button to `#admin-hub-nav`

Inside the `#admin-hub-nav` div in `#editor-section`, append a Sign Out button after the two existing `<a>` links. The existing links must not be touched.

**Before** (the closing of `#admin-hub-nav`):
```html
      <a href="admin-index.html"
        style="display:inline-block;padding:14px 22px;border-radius:var(--radius-btn);background:var(--color-ink);color:var(--color-bg);font-family:var(--font-display);font-weight:700;font-size:15px;text-decoration:none;">
        Edit Home View
      </a>
    </div>
```

**After** (add the Sign Out button immediately before the closing `</div>`):
```html
      <a href="admin-index.html"
        style="display:inline-block;padding:14px 22px;border-radius:var(--radius-btn);background:var(--color-ink);color:var(--color-bg);font-family:var(--font-display);font-weight:700;font-size:15px;text-decoration:none;">
        Edit Home View
      </a>
      <button id="signout-btn"
        style="padding:14px 22px;border-radius:var(--radius-btn);background:var(--color-surface);border:1.5px solid var(--color-line);font-family:var(--font-display);font-weight:700;font-size:15px;cursor:pointer;color:var(--color-ink);">
        Sign Out
      </button>
    </div>
```

---

### Change 4 — Replace `showAuthUI()` and passkey JS with email/password handlers

In the `<script>` block, make three sub-changes:

#### 4a — Replace `showAuthUI()`

**Before:**
```js
function showAuthUI() {
  const registered = localStorage.getItem('branson_passkey_registered');
  document.getElementById('auth-register').style.display = registered ? 'none' : 'block';
  document.getElementById('auth-signin').style.display = registered ? 'block' : 'none';
}
```

**After:**
```js
function showAuthUI() {
  document.getElementById('auth-email-login').style.display = 'block';
}
```

#### 4b — Replace the passkey button listeners in `DOMContentLoaded`

The `DOMContentLoaded` handler currently has this passkey block immediately after the session check:

**Before** (the entire passkey listener block — remove both listener blocks):
```js
      // Register passkey button
      document.getElementById('register-btn').addEventListener('click', async () => {
        const errEl = document.getElementById('auth-error');
        errEl.style.display = 'none';
        try {
          const { error } = await supabaseClient.auth.signInWithPasskey();
          if (error) throw error;
          localStorage.setItem('branson_passkey_registered', '1');
          showEditor();
        } catch (e) {
          errEl.textContent = e.message || 'Registration failed.';
          errEl.style.display = 'block';
        }
      });

      // Sign-in passkey button
      document.getElementById('signin-btn').addEventListener('click', async () => {
        const errEl = document.getElementById('auth-error-signin');
        errEl.style.display = 'none';
        try {
          const { error } = await supabaseClient.auth.signInWithPasskey();
          if (error) throw error;
          showEditor();
        } catch (e) {
          errEl.textContent = e.message || 'Sign-in failed.';
          errEl.style.display = 'block';
        }
      });
```

**After** (replace both passkey listener blocks with these two handlers):
```js
      // Email/password login button
      document.getElementById('login-btn').addEventListener('click', async () => {
        const errEl = document.getElementById('auth-error-email');
        errEl.style.display = 'none';
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        try {
          const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;
          showEditor();
        } catch (e) {
          errEl.textContent = e.message || 'Sign-in failed.';
          errEl.style.display = 'block';
        }
      });

      // Sign-out button
      document.getElementById('signout-btn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        location.reload();
      });
```

---

## What Does NOT Change

The following are explicitly **kept unchanged**:

- `showEditor()` function — hides `#passcode-section`, shows `#editor-section`
- `getAdminToken()` function — calls `supabaseClient.auth.getSession()`
- The `DOMContentLoaded` session check (`getSession()` → `showEditor()` or `showAuthUI()`)
- All of `#editor-section` contents except adding the Sign Out button to `#admin-hub-nav`
- `#offline-banner`, `#import-block`, sort controls, event selector, form fields, error banner
- The `<header>` element at the top of the page
- All other JS functions: `formatDate`, `getSortedEvents`, `renderEventSelect`, `populateField`, `loadEventForm`, `resetField`, `resetAllOverrides`, `saveOverrides`, `showErrorBanner`, `checkSupabase`

---

## Verify Your Work

After making all changes, run the full Playwright E2E suite:

```bash
cd /Users/alex/vaults/Vacation/Branson\ 2026/tests/e2e && npx playwright test
```

**All tests must pass before submitting the handback report.**

Tests to confirm specifically:
- **Smoke test:** `admin.html` loads with a title containing "Branson" and `site-header` (or the inline header) present — must pass
- **Admin gate tests:** Unauthenticated access to `admin-event-timeline.html` and `admin-index.html` redirects to `admin.html` — must pass (these are unaffected by this change but must not regress)

> Note: Actual email/password login cannot be exercised in a headless test environment without a live Supabase connection and a test user credential. The test suite verifies structural correctness and the redirect gate, which is sufficient to confirm the change did not regress anything.

If any test fails that was passing before your change, investigate and resolve it before submitting. If you cannot resolve a failure, document it clearly in the handback report.

---

## Handback Report

When all code changes are complete: (1) List every file you modified with a one-line description. (2) Note any assumptions or judgment calls. (3) STOP. Do not commit, push, copy files, or update logs. Hermes handles all post-code orchestration.
