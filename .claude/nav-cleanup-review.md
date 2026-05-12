# Code Review -- nav-cleanup

You are a cold code reviewer. No prior context. Review the diff below and return PASS, WARN, or FAIL.

## Intended changes

1. **site.js** -- Remove `buildTabs()` from the `insertAdjacentHTML` call so no `<nav class="bottom-tabs">` is injected on any page.
2. **admin-overlay.js** -- Change `headerInner.appendChild(_btn)` to `headerInner.insertBefore(_btn, headerInner.querySelector('#site-hamburger'))` so the Sign Out button appears left of the hamburger button.

## Diff

```diff
diff --git a/web/js/admin-overlay.js b/web/js/admin-overlay.js
@@ -21,7 +21,7 @@
   document.body.appendChild(_btn); // fallback -- will be moved to header
   var headerInner = document.querySelector('.site-header__inner');
-  if (headerInner) { headerInner.appendChild(_btn); }
+  if (headerInner) { headerInner.insertBefore(_btn, headerInner.querySelector('#site-hamburger')); }

diff --git a/web/js/site.js b/web/js/site.js
@@ -147,7 +147,7 @@
   var cs = document.currentScript;
   if (cs && !document.querySelector('.site-header')) {
-    cs.insertAdjacentHTML('afterend', buildHeader() + buildTabs() + buildHamburgerPanel());
+    cs.insertAdjacentHTML('afterend', buildHeader() + buildHamburgerPanel());
```

## What to check

1. **site.js:** Does removing `buildTabs()` from the concatenation correctly suppress the bottom-tabs nav on all pages? Any risk this string concatenation removal breaks `buildHeader()` or `buildHamburgerPanel()` output?

2. **admin-overlay.js:** If `headerInner.querySelector('#site-hamburger')` returns `null` (hamburger not yet in DOM, or on a page without it), `insertBefore(btn, null)` falls back to `appendChild` per spec -- is that correct fallback behavior here?

3. **Scope:** Are any other elements modified beyond these two one-liners?

4. **Dead code note (not a blocker):** `buildTabs()` function and `BOTTOM_TABS` constant in site.js are now unreachable dead code. Is this worth flagging as WARN?

## Verdict format

PASS, WARN, or FAIL. Then specific findings. PASS = shippable. WARN = shippable with caveats. FAIL = must fix.
