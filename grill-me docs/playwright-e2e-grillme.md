# Grill-Me: Playwright E2E Test Suite
**Task:** playwright-e2e-task.md

---

### Q1: Should the smoke suite include admin.html, or is the admin-gate spec sufficient for full admin coverage?

**Answer:** admin.html is included in smoke because it is a stable landing page that does NOT redirect -- it is the auth gate itself. Smoke verifies it loads, has a title, and has .site-header. admin-gate.spec.js then tests the redirect behavior of admin-index.html and admin-event-timeline.html. These are complementary, not redundant.

**Alex's Thoughts:**

---

### Q2: The people-timeline selector is ambiguous (.person-card vs .people-card). Should we inspect the live staging DOM before writing the brief, or let lazlo discover it at build time?

**Answer:** Let lazlo discover it at build time with the fallback logic specified in the brief. The brief instructs lazlo to try .person-card first, fall back to .people-card, log which matched, and use the one with count > 0. This avoids a pre-check round trip and is documented for future maintainers.

**Alex's Thoughts:**

---

### Q3: The beforeAll() health check in family-features.spec.js uses fetch() from the Node.js runtime. Does the test runner have network access to vacation-dev.creeperbomb.com at build time?

**Answer:** Yes -- lazlo runs on the same machine that serves as the test execution environment (macOS, same LAN). The staging URL is a live public GitHub Pages site. fetch() in beforeAll() will reach it unless there is a VPN or firewall issue. If it fails, tests are skipped, not failed -- this is the correct behavior.

**Alex's Thoughts:**

---

### Q4: The brief tells lazlo NOT to add data-testid attributes to web/ files, but then relies on CSS selectors that may not exist or may change. Is this the right trade-off for a living codebase?

**Answer:** Yes, for this sprint. Adding data-testids requires modifying web/ HTML files, which is a separate task with its own brief, safety checks, and deploy sequence. The current CSS selectors (.site-header, .card--light, .event-card, .qp-card) are established design-system class names unlikely to change without a dedicated refactor. The admin editor selector is the only real uncertainty -- the brief instructs lazlo to document what it finds. We accept selector fragility in exchange for not expanding scope into HTML modification.

**Alex's Thoughts:**

---

### Q5: The "within 3s" redirect constraint: is 3 seconds the right threshold? Could staging GitHub Pages + client-side JS redirect regularly exceed 3s on first load?

**Answer:** 3 seconds is appropriate for a client-side JS guard on a static site. The redirect guard should fire on DOMContentLoaded or earlier -- there is no Supabase dependency involved. The 15s global timeout exists for Supabase latency, not for JS execution. If the redirect takes longer than 3s on a clean static page load, that is itself a performance regression worth knowing about. The threshold is intentional.

**Alex's Thoughts:**

---

### Q6: The suite targets only staging. Should there be any mechanism to run smoke tests against production as a post-deploy check?

**Answer:** Not in this build. The brief adds PLAYWRIGHT_BASE_URL as an environment variable override so production smoke is possible without config edits. A dedicated production smoke run is a CI/CD concern deferred to a future brief. For now, the variable provides the capability without requiring it.

**Alex's Thoughts:**

---

### Q7: The Obsidian app.json edit (adding node_modules to excludedFolders) is a write to a config file inside the vault. Is this in scope for lazlo, or should it be done separately?

**Answer:** It is in scope. The alternative is a vault that indexes node_modules/, causing Obsidian search and sync performance degradation. This is a vault hygiene edit, not a web/ file edit. The brief is explicit: merge with existing content, do not overwrite. If lazlo cannot safely merge (e.g., JSON parse error), it should skip this step and flag it in the handback.

**Alex's Thoughts:**

---

### Q8: retries: 0 is specified intentionally to build a flakiness baseline. What is the plan for re-enabling retries once the baseline is established?

**Answer:** No plan is needed in this brief -- this is a future decision for Alex after 2 weeks of clean runs. The intent is documented in a comment in playwright.config.js. When retries are re-enabled, a separate brief will update the config. lazlo should not pre-wire any retry escalation logic.

**Alex's Thoughts:**

---

### Q9: The benign console error filter (BENIGN array in smoke.spec.js) includes "Failed to fetch". This could mask real network failures. Is this the right call?

**Answer:** It is intentional for smoke specifically. Smoke runs against all 13 pages including Supabase-dependent ones. "Failed to fetch" from a transient Supabase blip on a smoke run is acceptable noise -- the family-features spec will catch actual data rendering failures via card count assertions. If "Failed to fetch" appeared consistently, that is a data dependency issue documented by family-features, not by smoke. The separation of concerns is deliberate.

**Alex's Thoughts:**

---

### Q10: Should the test suite be committed to the vault's git repo as part of this task, or is that Hermes's job post-handback?

**Answer:** Hermes handles commit, push, and all post-code orchestration per the project workflow. lazlo stops after writing files and reporting test results. This is explicitly stated in the handback block.

**Alex's Thoughts:**

---

### Q11 (Bold -- user-visible decision): The suite does NOT cover wishlist.html, shows.html, or suggested.html with functional tests -- only smoke. Is this acceptable scope for the first build?

**Answer:** Yes. shows.html appears to be primarily a static listing. wishlist.html and suggested.html depend on localStorage state and/or user interactions that are out of scope for a stateless read-only E2E suite. Smoke coverage (loads, header, title, no errors) is sufficient for these pages in sprint 1. Functional coverage is deferred.

**Alex's Thoughts:**

---

### Q12 (Bold -- user-visible decision): The minimum card count for event cards and attraction cards is set at >= 1 and >= 3 respectively. Is this sufficient, or should higher minimums be enforced?

**Answer:** >= 1 for event cards (event-timeline and index) because staging data volume is unknown and a single rendered event proves the Supabase pipeline works. >= 3 for attractions because data.json is static and always has many records -- 3 is a conservative floor that catches a catastrophic render failure. These minimums can be raised once staging data volume is confirmed.

**Alex's Thoughts:**

---
