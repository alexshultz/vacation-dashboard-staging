#!/usr/bin/env python3
"""
generate_dashboard.py - Generates dashboard HTML pages from data/attractions.json

Follows CLAUDE.md: JSON is canonical. Uses tokens/components design system (Phase 4).
Generates attractions.html from scratch, manages shared head/nav partials for all pages.

Usage: python3 scripts/generate_dashboard.py
"""

import sys

# ============================================================
# PERMANENTLY FROZEN -- DO NOT RUN
# ============================================================
# Running this script OVERWRITES web/attractions.html,
# web/wishlist.html, and web/suggested.html from scratch.
# Those files contain hand-edited Quick Pick swipe code
# that this generator does NOT reproduce.
# See CLAUDE.md ADR-002 and docs/DECISIONS.md.
# ============================================================
print("ERROR: generate_dashboard.py is permanently frozen.")
print("Running it overwrites hand-edited Quick Pick code in attractions.html.")
print("See CLAUDE.md (ADR-002) and docs/DECISIONS.md for context.")
print("To add attractions: edit data/attractions.json, copy to web/data.json, deploy.")
sys.exit(1)

import json
import html
import re
from collections import defaultdict
from pathlib import Path
from datetime import datetime
import sys

VAULT = Path(__file__).parent.parent
JSON_PATH = VAULT / "data" / "attractions.json"
HTML_PATH = VAULT / "web" / "shows.html"

# Utility functions
def normalize_slug(slug):
    """Normalize slug for matching/comparison."""
    if not slug:
        return ""
    normalized = slug.lower().strip()
    normalized = re.sub(r'-s(?=-|$)', 's', normalized)
    normalized = normalized.replace('and8217', "'")
    normalized = re.sub(r"[''´`]", '-', normalized)
    return normalized


def is_blacklisted(slug, blacklist):
    """Check if a slug is in the blacklist."""
    if not slug or not blacklist:
        return False
    normalized_slug = normalize_slug(slug)
    for item in blacklist:
        if normalize_slug(item) == normalized_slug:
            return True
    return False


def library_sort_key(name):
    """Generate sort key for library-style alphabetization (ignoring articles)."""
    if not name:
        return ""
    name = name.strip().lower()
    for article in ["the ", "a ", "an "]:
        if name.startswith(article):
            name = name[len(article):].strip()
            break
    return name


def format_display_name(name):
    """Format display name by moving articles to the end."""
    if not name:
        return name
    original = name.strip()
    lower = original.lower()
    for article in ["The ", "A ", "An "]:
        if lower.startswith(article.lower()):
            article_real = original[:len(article)]
            main_title = original[len(article):].strip()
            return f"{main_title}, {article_real.strip()}"
    return original


def render_head(title: str, description: str = "") -> str:
    """Shared <head> content for all pages."""
    desc_tag = f'<meta name="description" content="{html.escape(description)}">' if description else ""
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
{desc_tag}
<title>{html.escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/themes/trail.css">
<link rel="stylesheet" href="css/components.css">
<script>/* Theme loader -- inline to prevent flash-of-wrong-theme */
(function(){{
  var m = localStorage.getItem('vacdash:v1:mode') || 'system';
  document.documentElement.setAttribute('data-mode', m);
}})();
</script>"""


def render_nav(active_page: str) -> str:
    """Shared site header + mobile bottom tab bar."""
    pages = [
        ("home",        "index.html",           "🏠", "Home"),
        ("attractions", "attractions.html",     "🎡", "Activities"),
        ("wishlist",    "wishlist.html",        "♡",  "Wishlist"),
        ("suggested",   "suggested.html",       "💡", "Suggested"),
        ("timeline",    "event-timeline.html",  "📅", "Timeline"),
        ("people",      "people-timeline.html", "👥", "People"),
    ]
    nav_links = ""
    for key, href, emoji, label in pages:
        cur = ' aria-current="page"' if key == active_page else ""
        nav_links += f'<a href="{href}" class="nav-link"{cur}>{label}</a>\n      '
    tabs = ""
    for key, href, emoji, label in pages:
        cur = ' aria-current="page"' if key == active_page else ""
        tabs += f'<a href="{href}" class="tab"{cur} aria-label="{label}">{emoji}</a>\n  '
    return f"""<header class="site-header">
  <div class="site-header__inner">
    <a class="site-logo" href="index.html">Branson '26</a>
    <nav class="site-nav" aria-label="Main">
      {nav_links.strip()}
    </nav>
    <button class="theme-toggle" aria-label="Toggle dark mode" onclick="(function(){{var modes=['system','light','dark'];var m=document.documentElement.getAttribute('data-mode')||'system';var next=modes[(modes.indexOf(m)+1)%3];document.documentElement.setAttribute('data-mode',next);localStorage.setItem('vacdash:v1:mode',next);}})()">☀️</button>
  </div>
</header>
<nav class="bottom-tabs" aria-label="Main navigation">
  {tabs.strip()}
</nav>"""


def load_people_names() -> list:
    """Return list of person name strings from people.json (falls back to example)."""
    for fname in ("people.json", "people.example.json"):
        p = VAULT / "data" / fname
        if p.exists():
            try:
                people = json.loads(p.read_text(encoding="utf-8"))
                names = [x["name"] for x in people if isinstance(x, dict) and x.get("name")]
                if names:
                    return names
            except Exception:
                pass
    return ["Alex", "Mycah", "Ashlyn", "Jordan", "Evie"]


def render_name_modal(names: list) -> str:
    """Return the name-chooser modal HTML."""
    btns = "\n".join(
        f'      <button class="modal-name-btn" data-name="{html.escape(n)}">{html.escape(n)}</button>'
        for n in names
    )
    return f"""<!-- Name-chooser modal (shown on first heart tap) -->
<div id="name-modal" role="dialog" aria-modal="true" aria-labelledby="name-modal-title"
     style="display:none;position:fixed;inset:0;z-index:1000;align-items:center;justify-content:center;">
  <div class="modal-backdrop" style="position:absolute;inset:0;background:rgba(0,0,0,.55);"></div>
  <div class="modal-box" style="position:relative;background:var(--color-surface,#fff);border-radius:16px;padding:28px 24px 20px;max-width:340px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.25);z-index:1;">
    <h2 id="name-modal-title" style="margin:0 0 6px;font-size:1.2rem;">Who are you? 👋</h2>
    <p style="margin:0 0 18px;font-size:.9rem;color:var(--color-ink-dim,#666);">
      Pick your name so we can save your picks.</p>
    <div class="modal-names" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;">
{btns}
    </div>
    <button class="modal-cancel" style="width:100%;padding:10px;border:1px solid var(--color-ink-dim,#999);
            border-radius:8px;background:transparent;cursor:pointer;font-size:.9rem;">
      Cancel
    </button>
  </div>
</div>

<!-- Detail view modal (one shared instance, rich layout) -->
<div id="detail-modal" class="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
  <div class="detail-modal__sheet">
    <button id="dm-heart" class="heart-overlay detail-modal__heart" type="button" aria-pressed="false" aria-label="Add to wishlist">♡</button>
    <!-- 1. Hero image slot (filled by JS if image exists) -->
    <div id="dm-hero"></div>
    <div class="detail-modal__body">
      <!-- 2. Header row: title (h2) on left, ★ rating on right -->
      <div id="dm-header" class="detail-modal__header-row"></div>
      <!-- 3. Metadata row: price, family pass, duration -->
      <div id="dm-meta"></div>
      <!-- 4. Full description -->
      <div id="dm-desc"></div>
      <!-- 5. Notes (muted tips/warnings) -->
      <div id="dm-notes"></div>
      <!-- 6. Tags pill chips -->
      <div id="dm-tags"></div>
      <!-- 7. Avatar stack (who wishlisted; querySelectorAll('.card--light__avatars') picks this up) -->
      <div id="dm-avatars" class="card--light__avatars detail-modal__avatars" data-slug=""></div>
      <!-- 8. RSVP buttons -->
      <div id="dm-rsvp"></div>
      <!-- 9. Footer: official site link -->
      <div id="dm-footer"></div>
      <!-- 10. Close button: always visible at bottom of sheet -- primary dismiss affordance on mobile -->
      <button id="dm-close" class="detail-modal__close-btn" type="button">✕ Close</button>
    </div>
  </div>
</div>"""


def render_picks_script(names: list) -> str:
    """Return the picks.js loader + heart-button click handler + avatar stack."""
    names_json = json.dumps(names)
    heart_script = f"""<script src=\"js/picks.js\"></script>
<script>
/* Heart / wishlist handler */
(function(){{
  var PEOPLE = {names_json};
  var modal = document.getElementById('name-modal');
  var namesDiv = modal.querySelector('.modal-names');
  var pendingSlug = null;

  function showModal(slug) {{
    pendingSlug = slug;
    modal.style.display = 'flex';
    modal.querySelector('.modal-name-btn').focus();
  }}
  function hideModal() {{
    modal.style.display = 'none';
    pendingSlug = null;
  }}
  /* Expose showModal so other scripts (e.g., detail modal suggest button) can trigger the name chooser */
  modal._vacdash_show = showModal;

  /* Wire up name buttons (already in DOM; just add listeners) */
  namesDiv.querySelectorAll('.modal-name-btn').forEach(function(btn) {{
    btn.style.cssText = 'padding:10px 16px;border-radius:8px;border:2px solid var(--color-accent,#3F6B3A);' +
      'background:transparent;cursor:pointer;font-size:.95rem;font-weight:600;';
    btn.addEventListener('click', function() {{
      picks.init(btn.dataset.name);
      var slug = pendingSlug;
      hideModal();
      if (slug) applyPick(slug);
    }});
  }});
  modal.querySelector('.modal-cancel').addEventListener('click', hideModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', hideModal);
  document.addEventListener('keydown', function(e) {{
    if (e.key === 'Escape' && modal.style.display !== 'none') hideModal();
  }});

  function updateBtn(btn, state) {{
    var on = state === 'wishlist';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? '\\u2665' : '\\u2661';
  }}

  function applyPick(slug) {{
    var card = document.querySelector('.card--light[data-slug="' + slug + '"]');
    var btn = card ? card.querySelector('.heart-overlay') : null;
    if (!btn) return;
    var current = picks.get(slug);
    var next = (current === 'wishlist') ? null : 'wishlist';
    picks.set(slug, next);
    updateBtn(btn, next);
  }}

  /* Restore heart state on page load */
  document.querySelectorAll('.card--light').forEach(function(card) {{
    var slug = card.dataset.slug;
    var btn = card.querySelector('.heart-overlay');
    if (btn && slug) updateBtn(btn, picks.get(slug));
  }});

  /* Heart button click */
  document.querySelectorAll('.heart-overlay').forEach(function(btn) {{
    btn.addEventListener('click', function(e) {{
      e.stopPropagation();
      var card = btn.closest('.card--light');
      var slug = card ? card.dataset.slug : null;
      if (!slug) return;
      if (!picks.getUser()) {{
        showModal(slug);
      }} else {{
        applyPick(slug);
      }}
    }});
  }});

  /* Cross-tab sync */
  picks.onChange('*', function(slug, state) {{
    var card = document.querySelector('.card--light[data-slug="' + slug + '"]');
    var btn = card ? card.querySelector('.heart-overlay') : null;
    if (btn) updateBtn(btn, state);
  }});
}})();
</script>"""

    avatar_script = """
<script>
/* Avatar stack -- family wishlist counts, refreshes every 30s */
(function() {
  function chipStyle(extra) {
    return 'display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:9999px;' +
      'background:rgba(100,100,116,.28);color:var(--color-ink,#e2e2e2);font-size:11px;font-weight:600;' +
      'line-height:1;white-space:nowrap;' + (extra || '');
  }

  function renderAvatars(container, users) {
    var currentUser = picks.getUser();
    var others = users.filter(function(u) { return u !== currentUser; });
    container.innerHTML = '';
    if (others.length === 0) return;

    var visible = others.slice(0, 2);
    var overflow = others.length - visible.length;
    var frag = document.createDocumentFragment();

    visible.forEach(function(name) {
      var chip = document.createElement('span');
      chip.setAttribute('style', chipStyle('margin-right:4px;'));
      chip.textContent = name.slice(0, 6);
      chip.title = name;
      frag.appendChild(chip);
    });

    if (overflow > 0) {
      var more = document.createElement('span');
      more.setAttribute('style', chipStyle('margin-right:4px;opacity:.8;'));
      more.textContent = '+' + overflow + ' more';
      frag.appendChild(more);
    }

    container.appendChild(frag);
  }

  async function refreshAvatars() {
    var wishlists = await picks.fetchAllWishlists();
    document.querySelectorAll('.card--light__avatars').forEach(function(container) {
      var slug = container.dataset.slug;
      var users = wishlists[slug] || [];
      renderAvatars(container, users);
    });
  }

  /* Initial load */
  refreshAvatars();
  /* Poll every 30s */
  setInterval(refreshAvatars, 30000);
})();
</script>"""

    return heart_script + avatar_script


def render_detail_modal_script() -> str:
    """Return the detail modal JS -- populates and controls the shared #detail-modal element."""
    return """<script>
/* Detail view modal -- card tap → full-screen sheet with rich dense-card layout */
(function() {
  'use strict';

  var modal     = document.getElementById('detail-modal');
  var dmHeart   = document.getElementById('dm-heart');
  var dmHero    = document.getElementById('dm-hero');
  var dmHeader = document.getElementById('dm-header');
  var dmMeta   = document.getElementById('dm-meta');
  var dmDesc   = document.getElementById('dm-desc');
  var dmNotes  = document.getElementById('dm-notes');
  var dmTags   = document.getElementById('dm-tags');
  var dmAvatars= document.getElementById('dm-avatars');
  var dmRsvp   = document.getElementById('dm-rsvp');
  var dmFooter = document.getElementById('dm-footer');
  var dmClose  = document.getElementById('dm-close');

  if (!modal)   { console.error('[detail-modal] FATAL: #detail-modal missing from DOM'); return; }
  if (!dmHeart) { console.error('[detail-modal] FATAL: #dm-heart missing from DOM'); return; }
  if (!dmClose) { console.error('[detail-modal] FATAL: #dm-close missing from DOM'); return; }
  var slots = { dmHero:dmHero, dmHeader:dmHeader, dmMeta:dmMeta, dmDesc:dmDesc,
                dmNotes:dmNotes, dmTags:dmTags, dmAvatars:dmAvatars, dmRsvp:dmRsvp, dmFooter:dmFooter };
  for (var k in slots) {
    if (!slots[k]) { console.error('[detail-modal] FATAL: slot missing from DOM: ' + k); return; }
  }

  /* Sheet-level click → close modal (tap anywhere on card to dismiss).
     Interactive elements (heart, RSVP, suggest, site link, close btn) each call
     e.stopPropagation() in their own handlers so they don't bubble here. */
  var sheet = modal.querySelector('.detail-modal__sheet');
  if (!sheet) { console.error('[detail-modal] FATAL: .detail-modal__sheet missing from DOM'); return; }
  sheet.addEventListener('click', function(e) { closeModal(); });

  var activeCard = null;
  var activeSlug = null;

  /* ---- helper: create element with text ---- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---- Parse tags-json attr safely ---- */
  function parseTags(raw) {
    if (!raw) return [];
    try {
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch(err) {
      console.error('[detail-modal] tags-json parse failed:', err, 'raw:', raw);
      return [];
    }
  }

  /* ---- Update modal heart visual state ---- */
  function updateModalHeart(slug) {
    var state;
    try { state = picks.get(slug); } catch(e) { state = null; }
    var on = (state === 'wishlist');
    dmHeart.setAttribute('aria-pressed', on ? 'true' : 'false');
    dmHeart.textContent = on ? '\\u2665' : '\\u2661';
    dmHeart.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
  }

  /* ---- Sync RSVP button pressed states from picks ---- */
  function syncRsvpButtons(slug) {
    var rsvpEl = document.getElementById('dm-rsvp');
    if (!rsvpEl) return;
    var current;
    try { current = picks.get(slug); } catch(e) { current = null; }
    rsvpEl.querySelectorAll('button[data-v]').forEach(function(btn) {
      var active = (btn.getAttribute('data-v') === current);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  /* ---- Build and open modal ---- */
  function openModal(card) {
    activeCard = card;
    var d = card.dataset;
    activeSlug = d.slug || '';

    /* Sync heart for this slug */
    updateModalHeart(activeSlug);

    /* 1. Hero image -- only if image src exists */
    dmHero.innerHTML = '';
    if (d.img && d.img.trim()) {
      var img = document.createElement('img');
      img.className = 'detail-modal__img';
      img.src = d.img;
      img.alt = d.title || '';
      img.loading = 'lazy';
      dmHero.appendChild(img);
    }

    /* 2. Header row: h2 title (always shown if title exists), rating on right (optional) */
    dmHeader.innerHTML = '';
    var titleEl = el('h2', 'detail-modal__title', d.title || '');
    titleEl.id = 'detail-modal-title';
    dmHeader.appendChild(titleEl);
    if (d.rating && d.rating.trim()) {
      dmHeader.appendChild(el('span', 'detail-modal__rating', '\\u2605 ' + d.rating));
    }

    /* 3. Metadata row -- each item conditional */
    dmMeta.innerHTML = '';
    var metaItems = [];
    if (d.priceAdult && d.priceAdult.trim()) {
      metaItems.push('\\uD83D\\uDCB2 ' + d.priceAdult + ' adult');
    }
    if (d.familyPass && d.familyPass.trim()) {
      metaItems.push('\\uD83D\\uDCB2 Family ' + d.familyPass);
    }
    if (d.duration && d.duration.trim()) {
      metaItems.push('\\u23F1 ' + d.duration);
    }
    if (metaItems.length > 0) {
      var metaRow = el('div', 'detail-modal__meta-row');
      metaItems.forEach(function(txt) {
        metaRow.appendChild(el('span', 'detail-modal__kv', txt));
      });
      dmMeta.appendChild(metaRow);
    }

    /* 4. Full description -- only if exists */
    dmDesc.innerHTML = '';
    if (d.desc && d.desc.trim()) {
      dmDesc.appendChild(el('p', 'detail-modal__desc', d.desc));
    }

    /* 5. Notes -- only if exists and non-empty */
    dmNotes.innerHTML = '';
    if (d.notes && d.notes.trim()) {
      var notesEl = el('p', 'detail-modal__notes', d.notes);
      dmNotes.appendChild(notesEl);
    }

    /* 6. Tags row -- only if tags array is non-empty */
    dmTags.innerHTML = '';
    var tags = parseTags(d.tagsJson);
    if (tags.length > 0) {
      var tagsRow = el('div', 'detail-modal__tags-row');
      tags.forEach(function(t) {
        tagsRow.appendChild(el('span', 'tag', t));
      });
      dmTags.appendChild(tagsRow);
    }

    /* 7. Avatar stack -- copy from card's avatar container; data-slug updated so live refresh hits it */
    var cardAvatars = card.querySelector('.card--light__avatars');
    dmAvatars.setAttribute('data-slug', activeSlug);
    dmAvatars.innerHTML = cardAvatars ? cardAvatars.innerHTML : '';

    /* 8. RSVP two-button segmented control */
    dmRsvp.innerHTML = '';
    var seg = el('div', 'seg two-btn detail-modal__rsvp');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'RSVP for ' + (d.title || 'this attraction'));
    var btnIn = el('button', '', '');
    btnIn.setAttribute('type', 'button');
    btnIn.setAttribute('data-v', 'committing');
    btnIn.setAttribute('aria-pressed', 'false');
    btnIn.innerHTML = '<span class="ico">\\u2713</span> I\\u2019m In';
    var btnOut = el('button', '', '');
    btnOut.setAttribute('type', 'button');
    btnOut.setAttribute('data-v', 'not-going');
    btnOut.setAttribute('aria-pressed', 'false');
    btnOut.innerHTML = '<span class="ico">\\u2717</span> Not Going';
    seg.appendChild(btnIn);
    seg.appendChild(btnOut);
    dmRsvp.appendChild(seg);

    /* Restore current RSVP state */
    syncRsvpButtons(activeSlug);

    /* Wire RSVP button clicks */
    seg.querySelectorAll('button[data-v]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!activeSlug) { console.error('[detail-modal] RSVP click: no activeSlug'); return; }
        var v = btn.getAttribute('data-v');
        var current;
        try { current = picks.get(activeSlug); }
        catch(e) { console.error('[detail-modal] picks.get failed:', e); return; }
        /* Tap active button again → deselect (null) */
        var next = (current === v) ? null : v;
        try { picks.set(activeSlug, next); }
        catch(e) { console.error('[detail-modal] picks.set failed:', e, {slug:activeSlug, next:next}); return; }
        syncRsvpButtons(activeSlug);
      });
    });

    /* 9. Footer: official site link + optional Suggest button */
    dmFooter.innerHTML = '';
    var footerRow = el('div', 'detail-modal__footer-row');
    if (d.url && d.url.trim()) {
      var footerLink = document.createElement('a');
      footerLink.className = 'detail-modal__site-link';
      footerLink.href = d.url;
      footerLink.target = '_blank';
      footerLink.rel = 'noopener noreferrer';
      footerLink.textContent = 'Visit official site \\u2197';
      footerLink.addEventListener('click', function(e) { e.stopPropagation(); });
      footerRow.appendChild(footerLink);
    }
    /* Suggest button -- always shown; prompts name chooser if no user set yet */
    var suggestBtn = el('button', 'detail-modal__suggest-btn');
    suggestBtn.setAttribute('type', 'button');
    suggestBtn.innerHTML = '\\uD83D\\uDCE4 Suggest to someone';
    suggestBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var nm;
      try { nm = picks.getUser(); } catch(err) { nm = ''; }
      if (!nm) {
        /* Name not set yet -- open the name-chooser modal first. After the user picks a name
           the pending suggest action is currently not replayed (Phase 3). Show a message instead. */
        var nameModal = document.getElementById('name-modal');
        if (nameModal && typeof nameModal._vacdash_show === 'function') {
          nameModal._vacdash_show(null);
        } else {
          console.error('[detail-modal] name-modal._vacdash_show not available');
          alert('Please pick your name first by tapping the heart ♡, then try Suggest again.');
        }
        return;
      }
      alert('Suggestions coming in Phase 3!');
    });
    footerRow.appendChild(suggestBtn);
    if (footerRow.hasChildNodes()) dmFooter.appendChild(footerRow);

    /* Open */
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    dmHeart.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    var prev = activeCard;
    activeCard = null;
    activeSlug = null;
    if (prev) prev.focus();
  }

  /* Bottom close button -- primary dismiss affordance (required on mobile where sheet fills viewport) */
  dmClose.addEventListener('click', function(e) {
    e.stopPropagation();
    closeModal();
  });

  /* Modal heart -- toggles wishlist for active slug */
  dmHeart.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!activeSlug) { console.error('[detail-modal] heart click: no activeSlug'); return; }
    var current;
    try { current = picks.get(activeSlug); }
    catch(err) { console.error('[detail-modal] picks.get failed:', err); return; }
    var next = (current === 'wishlist') ? null : 'wishlist';
    try { picks.set(activeSlug, next); }
    catch(err) { console.error('[detail-modal] picks.set failed:', err); return; }
    updateModalHeart(activeSlug);
    /* Mirror to browse card heart button */
    var card = document.querySelector('.card--light[data-slug="' + activeSlug + '"]');
    if (card) {
      var cardHeart = card.querySelector('.heart-overlay');
      if (cardHeart) {
        var on = (next === 'wishlist');
        cardHeart.setAttribute('aria-pressed', on ? 'true' : 'false');
        cardHeart.textContent = on ? '\\u2665' : '\\u2661';
      }
    }
  });

  /* Backdrop click (clicking the overlay, not the sheet) */
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  /* Escape key */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* Wire card clicks -- heart button stops propagation itself */
  document.querySelectorAll('.card--light').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.heart-overlay')) return;
      openModal(card);
    });
  });

  /* Cross-tab sync: if RSVP state changes elsewhere, update the open modal */
  try {
    picks.onChange('*', function(slug, state) {
      if (modal.classList.contains('is-open') && slug === activeSlug) {
        syncRsvpButtons(slug);
        updateModalHeart(slug);
      }
    });
  } catch(e) {
    console.error('[detail-modal] picks.onChange registration failed:', e);
  }

  /* Expose openModal for pages with dynamically-built cards (e.g., wishlist) */
  window._vacdash_openModal = openModal;
})();
</script>"""


def generate_attractions_page():
    """Generate web/attractions.html from data/attractions.json."""
    # Load data
    with open(VAULT / "data" / "attractions.json", encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle both formats: raw list or dict with "attractions" key
    attractions = data.get("attractions", data) if isinstance(data, dict) else data
    if not isinstance(attractions, list):
        attractions = []

    # Load blacklist
    blacklist_path = VAULT / "data" / "blacklist.json"
    blacklist = []
    if blacklist_path.exists():
        with open(blacklist_path, encoding="utf-8") as f:
            bl_data = json.load(f)
            # Handle both list and dict formats
            blacklist = bl_data if isinstance(bl_data, list) else bl_data.get("blacklist", [])
    else:
        print("WARNING: blacklist.json not found -- all attractions will be included", file=sys.stderr)

    # Filter blacklisted
    def is_bl(a):
        slug = a.get("slug", "") if isinstance(a, dict) else a
        return normalize_slug(slug) in {normalize_slug(s) for s in blacklist}

    items = [a for a in attractions if not is_bl(a)]
    items.sort(key=lambda a: library_sort_key(a.get("name","")))

    # Collect all tags for filter chips
    all_tags = set()
    for a in items:
        tags = a.get("tags", a.get("proposed_tags", ""))
        if isinstance(tags, str):
            for t in tags.split(","):
                t = t.strip()
                if t: all_tags.add(t)
        elif isinstance(tags, list):
            for t in tags:
                if t: all_tags.add(t)
    sorted_tags = sorted(all_tags)

    def get_tags_str(a):
        tags = a.get("tags", a.get("proposed_tags", ""))
        if isinstance(tags, str):
            return " ".join(t.strip() for t in tags.split(",") if t.strip())
        elif isinstance(tags, list):
            return " ".join(t for t in tags if t)
        return ""

    def thumb_html(a):
        slug = normalize_slug(a.get("slug",""))
        name = a.get("name","?")
        thumbs_dir = VAULT / "web" / "assets" / "thumbs"
        for ext in ("jpg","jpeg","png","webp"):
            p = thumbs_dir / f"{slug}-thumb.{ext}"
            if p.exists():
                return (f'<img src="assets/thumbs/{slug}-thumb.{ext}" alt="{html.escape(name)}" loading="lazy" class="card--light__img">',
                        f'assets/thumbs/{slug}-thumb.{ext}')
        # SVG fallback
        letter = name[0].lower() if name else "a"
        if not letter.isalpha(): letter = "a"
        svg_path = VAULT / "web" / "svg-fallbacks" / f"{letter}.svg"
        if svg_path.exists():
            return svg_path.read_text(encoding="utf-8"), ""
        return (f'<div class="card--light__img" style="background:#3F6B3A;display:grid;place-items:center;color:white;font-size:48px;font-weight:700;">{name[0].upper()}</div>',
                "")

    def duration_str(h):
        if not h: return ""
        try:
            h = float(h)
        except (TypeError, ValueError) as e:
            print(f"[generate_dashboard] WARN: duration_str failed for {h!r}: {e}", file=sys.stderr)
            return str(h)
        if h < 1: return f"{int(h*60)}min"
        if h == int(h): return f"{int(h)}h"
        return f"{h}h"

    def render_card(a):
        name = html.escape(a.get("name","Unknown"))
        slug = normalize_slug(a.get("slug",""))
        desc = a.get("description","")
        hook = html.escape(desc[:120] + "..." if len(desc)>120 else desc)
        desc_full = html.escape(desc)
        price = a.get("price_adult") or a.get("price","")
        dur = a.get("duration_hours","")
        rating = a.get("rating","")
        official_url = html.escape(a.get("official_url","") or "")
        tags_str = get_tags_str(a)

        # New: raw fields for rich detail modal
        price_adult_raw = a.get("price_adult")
        family_pass_raw = a.get("family_pass")
        notes_raw = a.get("notes") or ""
        raw_tags = a.get("tags", a.get("proposed_tags", ""))
        if isinstance(raw_tags, list):
            tags_list = [t for t in raw_tags if t]
        elif isinstance(raw_tags, str):
            tags_list = [t.strip() for t in raw_tags.split(",") if t.strip()]
        else:
            tags_list = []

        def fmt_price_display(p):
            """Format a price value as '$X' for display, or '' if missing/falsy."""
            if not p:
                return ""
            try:
                return f"${int(float(p))}"
            except (TypeError, ValueError):
                return str(p)

        # Format price/dur/rating for data attrs
        def price_str(p):
            if not p: return ""
            try: return f"from ${float(p):.0f}"
            except (TypeError, ValueError): return str(p)

        chips = ""
        if price:
            try:
                chips += f'<span class="minichip price">from ${float(price):.0f}</span>'
            except (TypeError, ValueError) as e:
                print(f"[generate_dashboard] WARN: price format failed for {price!r}: {e}", file=sys.stderr)
                chips += f'<span class="minichip price">{html.escape(str(price))}</span>'
        if dur:
            chips += f'<span class="minichip">{html.escape(duration_str(dur))}</span>'
        if rating:
            chips += f'<span class="minichip rating">★ {html.escape(str(rating))}</span>'

        th_html, img_src = thumb_html(a)
        return f'''<article class="card--light" data-tags="{tags_str}" data-slug="{slug}"
  data-title="{name}"
  data-desc="{desc_full}"
  data-price="{html.escape(price_str(price))}"
  data-price-adult="{html.escape(fmt_price_display(price_adult_raw))}"
  data-family-pass="{html.escape(fmt_price_display(family_pass_raw))}"
  data-duration="{html.escape(duration_str(dur))}"
  data-rating="{html.escape(str(rating)) if rating else ''}"
  data-img="{html.escape(img_src)}"
  data-url="{official_url}"
  data-notes="{html.escape(notes_raw)}"
  data-tags-json="{html.escape(json.dumps(tags_list, ensure_ascii=False))}">
  <button class="heart-overlay" aria-pressed="false" aria-label="Wishlist {name}">♡</button>
  <div class="card--light__thumb">{th_html}</div>
  <div class="card--light__body">
    <h3>{name}</h3>
    <p class="card--light__hook">{hook}</p>
    <div class="card--light__avatars" data-slug="{slug}"></div>
    <div class="card--light__row">{chips}</div>
  </div>
</article>'''

    cards_html = "\n".join(render_card(a) for a in items)

    # Load people names for modal
    names = load_people_names()
    name_modal = render_name_modal(names)
    picks_script = render_picks_script(names)
    detail_modal_script = render_detail_modal_script()

    chip_btns = '<button class="chip" aria-pressed="true" data-tag="">All</button>\n'
    for t in sorted_tags:
        chip_btns += f'<button class="chip" aria-pressed="false" data-tag="{html.escape(t)}">{html.escape(t)}</button>\n'

    filter_js = r"""
<script>
(function(){
  var active = new Set();
  var chips = document.querySelectorAll('.filter-strip .chip');
  var cards = document.querySelectorAll('.catalog-grid .card--light');
  var counter = document.getElementById('live-count');
  var allBtn = document.querySelector('.chip[data-tag=""]');
  var toggleBtn = document.getElementById('filter-toggle');
  var popover = document.getElementById('filter-popover');

  if (!toggleBtn || !popover) throw new Error('filter-toggle or filter-popover element missing from DOM');

  /* --- Popover open/close --- */
  function openPopover() {
    popover.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closePopover() {
    popover.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  function isOpen() { return popover.classList.contains('open'); }

  toggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    isOpen() ? closePopover() : openPopover();
  });

  /* Close on outside click */
  document.addEventListener('click', function(e) {
    if (isOpen() && !popover.contains(e.target) && e.target !== toggleBtn) {
      closePopover();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen()) {
      closePopover();
      toggleBtn.focus();
    }
  });

  /* --- Toggle button label/state --- */
  function updateToggleBtn() {
    var hasActiveFilter = active.size > 0;
    if (hasActiveFilter) {
      toggleBtn.textContent = 'Filtered \u25cf';
      toggleBtn.classList.add('is-filtered');
    } else {
      toggleBtn.textContent = 'Filter \u25be';
      toggleBtn.classList.remove('is-filtered');
    }
  }

  /* --- Card filtering (unchanged logic) --- */
  function refilter(){
    var shown = 0;
    cards.forEach(function(c){
      var tags = new Set((c.dataset.tags||'').split(' ').filter(Boolean));
      var visible = active.size === 0 || [...active].some(function(t){ return tags.has(t); });
      c.style.display = visible ? '' : 'none';
      if(visible) shown++;
    });
    if(counter) counter.textContent = 'Showing ' + shown + ' of ' + cards.length;
  }

  chips.forEach(function(btn){
    btn.addEventListener('click', function(){
      var tag = btn.dataset.tag;
      if(tag === ''){
        active.clear();
        chips.forEach(function(b){ b.setAttribute('aria-pressed', b === allBtn ? 'true' : 'false'); });
      } else {
        if(active.has(tag)){
          active.delete(tag);
          btn.setAttribute('aria-pressed','false');
        } else {
          active.add(tag);
          btn.setAttribute('aria-pressed','true');
        }
        allBtn.setAttribute('aria-pressed', active.size === 0 ? 'true' : 'false');
      }
      refilter();
      updateToggleBtn();
      closePopover();
    });
  });

  refilter();
  updateToggleBtn();
})();
</script>"""

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    page = f"""<!doctype html>
<html lang="en" data-mode="system">
<head>
{render_head("Activities -- Branson '26", "Browse all Branson 2026 activities")}
<style>
/* Page-specific overrides */
.card--light__thumb {{ aspect-ratio: 16/10; overflow: hidden; background: var(--color-bg); }}
.card--light__thumb img {{ width:100%; height:100%; object-fit:cover; display:block; }}
.card--light__thumb svg {{ width:100%; height:100%; display:block; }}
.card--light__body {{ padding: 12px 14px 14px; display:flex; flex-direction:column; gap:8px; flex:1; }}
.card--light__hook {{ font-size:13px; color:var(--color-ink-dim); line-height:1.4; margin:0;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }}
.card--light__row {{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:auto; }}
</style>
</head>
<body>
{render_nav("attractions")}
<main class="page-main">
  <div class="page-hero">
    <p class="eyebrow">Branson '26</p>
    <h1>Activities</h1>
    <p class="hero-sub">Browse {len(items)} things to do. Heart anything that looks fun.</p>
  </div>
  <div class="test-banner" role="status">
    🧪 <strong>Test data</strong> -- Interest counts and picks shown here are not real family data.
    This banner will be removed when the live backend connects in Phase 2.
  </div>
  <div class="filter-popover-wrap">
    <button class="filter-toggle-btn" id="filter-toggle"
            aria-haspopup="true" aria-expanded="false">Filter &#9662;</button>
    <div class="filter-popover" id="filter-popover" role="group" aria-label="Filter by tag">
      <div class="filter-strip">
        {chip_btns.strip()}
      </div>
    </div>
  </div>
  <p class="live-count" id="live-count">Showing {len(items)} of {len(items)}</p>
  <div class="catalog-grid" id="catalog-grid">
{cards_html}
  </div>
</main>
{filter_js}
<script>window.addEventListener('storage',function(e){{if(e.key==='vacdash:v1:mode')document.documentElement.setAttribute('data-mode',e.newValue||'system')}});</script>
{name_modal}
{picks_script}
{detail_modal_script}
</body>
</html>"""

    out = VAULT / "web" / "attractions.html"
    out.write_text(page, encoding="utf-8")
    size_kb = out.stat().st_size // 1024
    print(f"  wrote {out} ({size_kb} KB, {len(items)} attractions)")


def generate_shows_page():
    """Generate web/shows.html using design system (nav updated; file kept for deep-link compat)."""
    names = load_people_names()
    name_modal = render_name_modal(names)
    page = f"""<!doctype html>
<html lang="en" data-mode="system">
<head>
{render_head("Shows -- Branson '26", "Browse all Branson 2026 shows")}
</head>
<body>
{render_nav("shows")}
<main class="page-main">
  <div class="page-hero">
    <p class="eyebrow">Branson '26</p>
    <h1>Shows</h1>
    <p class="hero-sub">Shows are now part of the <a href="attractions.html" style="color:var(--status-yes);font-weight:700;">Activities</a> page.</p>
  </div>
</main>
<script>window.addEventListener('storage',function(e){{if(e.key==='vacdash:v1:mode')document.documentElement.setAttribute('data-mode',e.newValue||'system')}});</script>
{name_modal}
<script src="js/picks.js"></script>
</body>
</html>"""
    out = VAULT / "web" / "shows.html"
    out.write_text(page, encoding="utf-8")
    print(f"  wrote {out}")


def _build_compact_attractions_js() -> str:
    """Build a compact JS const ATTRACTIONS_DATA from attractions.json (slug, name, description,
    price_adult, duration_hours, rating, image, official_url, notes, tags)."""
    with open(VAULT / "data" / "attractions.json", encoding="utf-8") as f:
        data = json.load(f)
    attractions = data.get("attractions", data) if isinstance(data, dict) else data
    if not isinstance(attractions, list):
        attractions = []

    # Load blacklist
    blacklist_path = VAULT / "data" / "blacklist.json"
    blacklist = []
    if blacklist_path.exists():
        with open(blacklist_path, encoding="utf-8") as f:
            bl_data = json.load(f)
            blacklist = bl_data if isinstance(bl_data, list) else bl_data.get("blacklist", [])

    blacklist_set = {normalize_slug(s) for s in blacklist}
    thumbs_dir = VAULT / "web" / "assets" / "thumbs"

    compact = []
    for a in attractions:
        slug = normalize_slug(a.get("slug", ""))
        if not slug or slug in blacklist_set:
            continue
        raw_tags = a.get("tags", a.get("proposed_tags", ""))
        if isinstance(raw_tags, list):
            tags = [t for t in raw_tags if t]
        elif isinstance(raw_tags, str):
            tags = [t.strip() for t in raw_tags.split(",") if t.strip()]
        else:
            tags = []
        # Resolve thumb path for compact data
        slug_norm = normalize_slug(a.get("slug", ""))
        thumb_src = ""
        for ext in ("jpg", "jpeg", "png", "webp"):
            p = thumbs_dir / f"{slug_norm}-thumb.{ext}"
            if p.exists():
                thumb_src = f"assets/thumbs/{slug_norm}-thumb.{ext}"
                break
        compact.append({
            "slug": slug,
            "name": a.get("name", ""),
            "description": a.get("description", ""),
            "price_adult": a.get("price_adult"),
            "family_pass": a.get("family_pass"),
            "duration_hours": a.get("duration_hours"),
            "rating": a.get("rating"),
            "image": thumb_src or a.get("image", ""),
            "official_url": a.get("official_url", ""),
            "notes": a.get("notes", ""),
            "tags": tags,
        })

    return "const ATTRACTIONS_DATA = " + json.dumps(compact, ensure_ascii=True, indent=2) + ";"


def generate_wishlist_page():
    """Generate web/wishlist.html -- user's wishlisted activities using catalog card layout (same as attractions.html)."""
    names = load_people_names()
    name_modal = render_name_modal(names)
    detail_modal_script = render_detail_modal_script()
    compact_data_js = _build_compact_attractions_js()

    page = f"""<!doctype html>
<html lang="en" data-mode="system">
<head>
{render_head("Wishlist -- Branson '26", "Your wishlisted activities for Branson 2026")}
<style>
/* Page-specific overrides -- identical to attractions.html */
.card--light__thumb {{ aspect-ratio: 16/10; overflow: hidden; background: var(--color-bg); }}
.card--light__thumb img {{ width:100%; height:100%; object-fit:cover; display:block; }}
.card--light__thumb svg {{ width:100%; height:100%; display:block; }}
.card--light__body {{ padding: 12px 14px 14px; display:flex; flex-direction:column; gap:8px; flex:1; }}
.card--light__hook {{ font-size:13px; color:var(--color-ink-dim); line-height:1.4; margin:0;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }}
.card--light__row {{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:auto; }}
/* Suggest button on card -- below the minichip row */
.wishlist-card__actions {{
  display: flex; gap: 8px; padding-top: 8px; border-top: 1px dashed var(--color-line);
  margin-top: 4px;
}}
.btn-suggest-sm {{
  flex: 1; padding: 8px 10px; border-radius: 10px;
  font-family: var(--font-display); font-weight: 700; font-size: 12px;
  background: transparent; border: 1.5px solid var(--color-line);
  color: var(--color-ink); cursor: pointer;
  transition: border-color 150ms, color 150ms;
}}
.btn-suggest-sm:hover {{ border-color: var(--status-yes); color: var(--status-yes); }}
/* Empty / who-prompt states */
.empty-state {{
  text-align: center; padding: 64px 24px;
  color: var(--color-ink-dim); font-size: 17px;
}}
.empty-state p {{ margin: 0 auto; max-width: 36ch; }}
.who-prompt {{
  background: var(--color-surface);
  border: 1.5px solid var(--color-line);
  border-radius: var(--radius-card);
  padding: 32px 24px; text-align: center;
  margin: 32px auto; max-width: 440px;
}}
.who-prompt h2 {{ margin-bottom: 8px; }}
.who-prompt p {{ color: var(--color-ink-dim); margin: 0 0 18px; }}
.who-prompt .name-btn-row {{ display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }}
.who-prompt .name-btn {{
  padding: 10px 18px; border-radius: 10px;
  border: 2px solid var(--status-yes);
  background: transparent; cursor: pointer;
  font-size: 1rem; font-weight: 700; font-family: var(--font-display);
  color: var(--status-yes);
  transition: background 150ms, color 150ms;
}}
.who-prompt .name-btn:hover {{ background: var(--status-yes); color: white; }}
</style>
</head>
<body>
{render_nav("wishlist")}
<main class="page-main">
  <div class="page-hero">
    <p class="eyebrow">Branson '26</p>
    <h1>My Wishlist</h1>
    <p class="hero-sub">Activities you've saved. Tap a card to see details.</p>
  </div>
  <div id="wishlist-root">
    <p style="color:var(--color-ink-dim);text-align:center;padding:40px 0;">Loading&hellip;</p>
  </div>
</main>

{name_modal}
<script src="js/picks.js"></script>
<script>
/* ============================================================
   Wishlist page -- catalog card layout (matches attractions.html)
   Cards are built dynamically from ATTRACTIONS_DATA, keyed by slug.
   Heart button un-wishlists; tapping card body opens detail modal.
   ============================================================ */
(function() {{
  'use strict';

  /* ---- Attraction data (embedded compact snapshot) ---- */
{compact_data_js}

  /* ---- Helpers ---- */
  function esc(s) {{
    return String(s || '').replace(/[&<>"']/g, function(c) {{
      return ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}})[c];
    }});
  }}

  function slugToAttr(slug) {{
    return ATTRACTIONS_DATA.find(function(a) {{ return a.slug === slug; }}) || null;
  }}

  function durationStr(h) {{
    if (!h) return '';
    var n = parseFloat(h);
    if (isNaN(n)) return String(h);
    if (n < 1) return Math.round(n * 60) + 'min';
    if (n === Math.floor(n)) return Math.floor(n) + 'h';
    return n + 'h';
  }}

  function fmtPrice(p) {{
    if (!p) return '';
    var n = parseFloat(p);
    return isNaN(n) ? String(p) : 'from $' + Math.round(n);
  }}

  /* ---- SVG gradient fallback ---- */
  var GRAD_PAIRS = [
    ['#3F6B3A','#2A6A8A'], ['#2A6A8A','#D8A660'], ['#D8A660','#C1553B'],
    ['#C1553B','#6B4C8F'], ['#6B4C8F','#3F6B3A'], ['#3F6B3A','#D8A660'],
    ['#2A6A8A','#6B4C8F']
  ];
  function hashSlug(s) {{
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {{ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }}
    return h;
  }}
  function svgFallback(name, slug) {{
    var pair = GRAD_PAIRS[hashSlug(slug) % GRAD_PAIRS.length];
    var c1 = pair[0], c2 = pair[1];
    var letter = ((name || '?').trim()[0] || '?').toUpperCase();
    var id = 'g-' + slug.replace(/[^a-z0-9]/gi, '-');
    return '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(name) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#' + id + ')"/>' +
      '<text x="160" y="118" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="800" font-size="88" fill="rgba(255,255,255,0.95)">' + esc(letter) + '</text>' +
      '</svg>';
  }}

  var PEOPLE_NAMES = {json.dumps(names)};
  var root = document.getElementById('wishlist-root');
  if (!root) {{ throw new Error('[wishlist] FATAL: #wishlist-root missing from DOM'); }}

  /* ---- Name chooser prompt (rendered inline) ---- */
  function renderWhoPrompt() {{
    var btns = PEOPLE_NAMES.map(function(n) {{
      return '<button class="name-btn" data-name="' + esc(n) + '">' + esc(n) + '</button>';
    }}).join('');
    root.innerHTML = '<div class="who-prompt">' +
      '<h2>Who are you? 👋</h2>' +
      '<p>Pick your name so we can show your wishlist.</p>' +
      '<div class="name-btn-row">' + btns + '</div>' +
      '</div>';
    root.querySelectorAll('.name-btn').forEach(function(btn) {{
      btn.addEventListener('click', function() {{
        picks.init(btn.dataset.name);
        renderWishlist();
      }});
    }});
  }}

  /* ---- Build one catalog card article element ---- */
  function buildCard(a) {{
    var thumbHtml;
    if (a.image) {{
      thumbHtml = '<img src="' + esc(a.image) + '" alt="' + esc(a.name) + '" loading="lazy" class="card--light__img">';
    }} else {{
      thumbHtml = svgFallback(a.name, a.slug);
    }}

    /* Minichips row */
    var chips = '';
    if (a.price_adult != null) {{
      chips += '<span class="minichip price">' + esc(fmtPrice(a.price_adult)) + '</span>';
    }}
    if (a.duration_hours != null) {{
      chips += '<span class="minichip">' + esc(durationStr(a.duration_hours)) + '</span>';
    }}
    if (a.rating) {{
      chips += '<span class="minichip rating">\u2605 ' + esc(parseFloat(a.rating).toFixed(1)) + '</span>';
    }}

    /* Hook (truncated description) */
    var desc = String(a.description || '');
    var hook = desc.length > 120 ? desc.slice(0, 120) + '\u2026' : desc;

    /* data-* attrs for detail modal (same pattern as attractions.html) */
    var tagsJson = JSON.stringify(a.tags || []);
    var priceAdultDisp = a.price_adult ? '$' + Math.round(parseFloat(a.price_adult)) : '';
    var familyPassDisp = a.family_pass ? '$' + Math.round(parseFloat(a.family_pass)) : '';
    var durDisp = durationStr(a.duration_hours);
    var ratingStr = a.rating ? String(a.rating) : '';

    /* Build article element */
    var art = document.createElement('article');
    art.className = 'card--light';
    art.setAttribute('tabindex', '0');
    art.setAttribute('role', 'button');
    art.setAttribute('aria-label', 'View details for ' + a.name);
    art.setAttribute('data-slug', a.slug);
    art.setAttribute('data-title', a.name);
    art.setAttribute('data-desc', desc);
    art.setAttribute('data-price', fmtPrice(a.price_adult));
    art.setAttribute('data-price-adult', priceAdultDisp);
    art.setAttribute('data-family-pass', familyPassDisp);
    art.setAttribute('data-duration', durDisp);
    art.setAttribute('data-rating', ratingStr);
    art.setAttribute('data-img', a.image || '');
    art.setAttribute('data-url', a.official_url || '');
    art.setAttribute('data-notes', a.notes || '');
    art.setAttribute('data-tags-json', tagsJson);

    art.innerHTML =
      '<button class="heart-overlay" type="button" aria-pressed="false" aria-label="Remove from wishlist">\u2665</button>' +
      '<div class="card--light__thumb">' + thumbHtml + '</div>' +
      '<div class="card--light__body">' +
        '<h3>' + esc(a.name) + '</h3>' +
        '<p class="card--light__hook">' + esc(hook) + '</p>' +
        '<div class="card--light__avatars" data-slug="' + esc(a.slug) + '"></div>' +
        '<div class="card--light__row">' + chips + '</div>' +
        '<div class="wishlist-card__actions">' +
          '<button type="button" class="btn-suggest-sm" data-suggest="' + esc(a.slug) + '">\U0001F4E4 Suggest to someone</button>' +
        '</div>' +
      '</div>';

    return art;
  }}

  /* ---- Update heart button visual state ---- */
  function syncHeart(art, state) {{
    var btn = art.querySelector('.heart-overlay');
    if (!btn) return;
    var on = (state === 'wishlist');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? '\u2665' : '\u2661';
    btn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
  }}

  /* ---- Main render ---- */
  function renderWishlist() {{
    var user = picks.getUser();
    if (!user) {{ renderWhoPrompt(); return; }}

    /* Gather slugs where current user has wishlist state */
    var local = picks.getAll();
    var wishlisted = [];
    Object.keys(local).forEach(function(slug) {{
      var s = local[slug];
      if (s === 'wishlist') wishlisted.push(slug);
    }});

    if (wishlisted.length === 0) {{
      root.innerHTML = '<div class="empty-state">' +
        '<p>Nothing wishlisted yet &mdash; tap \u2661 on any activity to add it here.</p>' +
        '</div>';
      return;
    }}

    /* Build grid */
    var grid = document.createElement('div');
    grid.className = 'catalog-grid';

    wishlisted.forEach(function(slug) {{
      var a = slugToAttr(slug);
      if (!a) {{ console.error('[wishlist] slug not found in ATTRACTIONS_DATA:', slug); return; }}
      var art = buildCard(a);
      syncHeart(art, picks.get(slug));
      grid.appendChild(art);
    }});

    root.innerHTML = '';
    root.appendChild(grid);

    /* Wire heart buttons (un-wishlist: sets null, card disappears on next render) */
    grid.querySelectorAll('.heart-overlay').forEach(function(btn) {{
      btn.addEventListener('click', function(e) {{
        e.stopPropagation();
        var art = btn.closest('.card--light');
        if (!art) return;
        var slug = art.getAttribute('data-slug');
        if (!slug) return;
        var current;
        try {{ current = picks.get(slug); }} catch(err) {{ console.error('[wishlist] picks.get failed:', err); return; }}
        var next = (current === 'wishlist') ? null : 'wishlist';
        try {{ picks.set(slug, next); }} catch(err) {{ console.error('[wishlist] picks.set failed:', err); return; }}
        if (next === null) {{
          /* Animate out then re-render */
          art.style.transition = 'opacity 200ms ease, transform 200ms ease';
          art.style.opacity = '0';
          art.style.transform = 'scale(0.96)';
          setTimeout(function() {{ renderWishlist(); }}, 220);
        }} else {{
          syncHeart(art, next);
        }}
      }});
    }});

    /* Wire suggest buttons */
    grid.querySelectorAll('.btn-suggest-sm').forEach(function(btn) {{
      btn.addEventListener('click', function(e) {{
        e.stopPropagation();
        var nm;
        try {{ nm = picks.getUser(); }} catch(err) {{ nm = ''; }}
        if (!nm) {{
          var nameModal = document.getElementById('name-modal');
          if (nameModal && typeof nameModal._vacdash_show === 'function') {{
            nameModal._vacdash_show(null);
          }} else {{
            console.error('[wishlist] name-modal._vacdash_show not available');
            alert('Please pick your name first by tapping the heart \u2661, then try Suggest again.');
          }}
          return;
        }}
        alert('Suggestions coming in Phase 3!');
      }});
    }});

    /* Wire card clicks -- open detail modal */
    grid.querySelectorAll('.card--light').forEach(function(art) {{
      art.addEventListener('click', function(e) {{
        if (e.target.closest('.heart-overlay')) return;
        if (e.target.closest('.btn-suggest-sm')) return;
        if (typeof window._vacdash_openModal === 'function') {{
          window._vacdash_openModal(art);
        }} else {{
          console.error('[wishlist] window._vacdash_openModal not available -- detail modal script not loaded');
        }}
      }});
      art.addEventListener('keydown', function(e) {{
        if (e.key === 'Enter' || e.key === ' ') {{
          e.preventDefault();
          if (typeof window._vacdash_openModal === 'function') {{
            window._vacdash_openModal(art);
          }}
        }}
      }});
    }});
  }}

  /* ---- Init + cross-tab sync ---- */
  renderWishlist();

  picks.onChange('*', function() {{
    var user = picks.getUser();
    if (user) renderWishlist();
  }});
}})();
</script>
{detail_modal_script}
<script>window.addEventListener('storage',function(e){{if(e.key==='vacdash:v1:mode')document.documentElement.setAttribute('data-mode',e.newValue||'system')}});</script>
</body>
</html>"""

    out = VAULT / "web" / "wishlist.html"
    out.write_text(page, encoding="utf-8")
    print(f"  wrote {out}")


def generate_suggested_page():
    """Generate web/suggested.html -- activities suggested to the current user by other family members."""
    names = load_people_names()
    name_modal = render_name_modal(names)
    compact_data_js = _build_compact_attractions_js()

    page = f"""<!doctype html>
<html lang="en" data-mode="system">
<head>
{render_head("Suggested -- Branson '26", "Activities suggested to you by family members")}
<style>
/* ===== Suggested page styles ===== */
.card--dense__title-line {{
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  flex-wrap: wrap;
}}
.card--dense__title-line h3 {{ font-size: 22px; line-height: 1.15; }}
.rating-big {{ font-family: var(--font-display); font-weight: 800; color: var(--accent-sand); font-size: 17px; white-space: nowrap; }}
.card--dense__desc {{ margin: 0; color: var(--color-ink); font-size: 15px; }}
.kv-row {{ display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 14px; color: var(--color-ink-dim); }}
.kv {{ display: inline-flex; align-items: center; gap: 6px; }}
.kv b {{ color: var(--color-ink); font-weight: 700; }}
.notes-block {{
  padding: 10px 14px; border-radius: 10px;
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--warn) 35%, var(--color-line));
  font-size: 14px; color: var(--color-ink);
}}
.suggestion-from {{
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 10px;
  background: color-mix(in srgb, var(--status-wishlist) 10%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--status-wishlist) 30%, var(--color-line));
  font-size: 14px; font-weight: 700;
  color: var(--status-wishlist);
}}
.suggestion-note {{
  font-size: 14px; color: var(--color-ink-dim);
  font-style: italic; margin: 0;
}}
.link-row {{
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 14px;
  padding-top: 12px; border-top: 1px dashed var(--color-line);
}}
.link-row a {{ color: var(--status-wishlist); font-weight: 700; text-decoration: none; }}
.link-row a:hover {{ text-decoration: underline; }}
.empty-state {{
  text-align: center; padding: 64px 24px;
  color: var(--color-ink-dim); font-size: 17px;
}}
.empty-state .icon {{ font-size: 48px; display: block; margin-bottom: 16px; }}
.empty-state p {{ margin: 0 auto; max-width: 42ch; }}
.who-prompt {{
  background: var(--color-surface);
  border: 1.5px solid var(--color-line);
  border-radius: var(--radius-card);
  padding: 32px 24px; text-align: center;
  margin: 32px auto; max-width: 440px;
}}
.who-prompt h2 {{ margin-bottom: 8px; }}
.who-prompt p {{ color: var(--color-ink-dim); margin: 0 0 18px; }}
.who-prompt .name-btn-row {{ display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }}
.who-prompt .name-btn {{
  padding: 10px 18px; border-radius: 10px;
  border: 2px solid var(--status-yes);
  background: transparent; cursor: pointer;
  font-size: 1rem; font-weight: 700; font-family: var(--font-display);
  color: var(--status-yes);
  transition: background 150ms, color 150ms;
}}
.who-prompt .name-btn:hover {{ background: var(--status-yes); color: white; }}
.action-btns {{
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  padding-top: 12px; border-top: 1px dashed var(--color-line);
}}
.btn-add-wish {{
  padding: 10px 8px; border-radius: 10px;
  background: var(--status-yes); color: white;
  font-family: var(--font-display); font-weight: 700; font-size: 13px;
  border: none; cursor: pointer; min-height: 44px;
  transition: background 150ms;
}}
.btn-add-wish:hover {{ background: color-mix(in srgb, var(--status-yes) 80%, black); }}
.btn-no-thanks {{
  padding: 10px 8px; border-radius: 10px;
  background: transparent; color: var(--color-ink-dim);
  font-family: var(--font-display); font-weight: 700; font-size: 13px;
  border: 1.5px solid var(--color-line); cursor: pointer; min-height: 44px;
  transition: background 150ms, border-color 150ms, color 150ms;
}}
.btn-no-thanks:hover {{ background: var(--accent-clay); color: white; border-color: var(--accent-clay); }}
</style>
</head>
<body>
{render_nav("suggested")}
<main class="page-main">
  <div class="page-hero">
    <p class="eyebrow">Branson '26</p>
    <h1>Suggested for You</h1>
    <p class="hero-sub">Activities other family members think you'd enjoy.</p>
  </div>
  <div id="suggested-root">
    <p style="color:var(--color-ink-dim);text-align:center;padding:40px 0;">Loading&hellip;</p>
  </div>
</main>

{name_modal}
<script src="js/picks.js"></script>
<script>
/* ============================================================
   Suggested page -- fetch from Supabase suggestions table
   ============================================================ */
(function() {{
  'use strict';

  var SB_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
  var SB_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';

  /* ---- Attraction data (embedded compact snapshot) ---- */
{compact_data_js}

  /* ---- Helpers ---- */
  function esc(s) {{
    return String(s || '').replace(/[&<>"']/g, function(c) {{
      return ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}})[c];
    }});
  }}

  function slugToAttr(slug) {{
    return ATTRACTIONS_DATA.find(function(a) {{ return a.slug === slug; }}) || null;
  }}

  var PEOPLE_NAMES = {json.dumps(names)};
  var root = document.getElementById('suggested-root');
  if (!root) {{ console.error('[suggested] FATAL: #suggested-root missing from DOM'); return; }}

  /* ---- Name chooser prompt ---- */
  function renderWhoPrompt() {{
    var btns = PEOPLE_NAMES.map(function(n) {{
      return '<button class="name-btn" data-name="' + esc(n) + '">' + esc(n) + '</button>';
    }}).join('');
    root.innerHTML = '<div class="who-prompt">' +
      '<h2>Who are you? 👋</h2>' +
      '<p>Pick your name so we can show suggestions for you.</p>' +
      '<div class="name-btn-row">' + btns + '</div>' +
      '</div>';
    root.querySelectorAll('.name-btn').forEach(function(btn) {{
      btn.addEventListener('click', function() {{
        picks.init(btn.dataset.name);
        renderSuggested();
      }});
    }});
  }}

  /* ---- SVG gradient fallback ---- */
  var GRAD_PAIRS = [
    ['#3F6B3A','#2A6A8A'], ['#2A6A8A','#D8A660'], ['#D8A660','#C1553B'],
    ['#C1553B','#6B4C8F'], ['#6B4C8F','#3F6B3A'], ['#3F6B3A','#D8A660'],
    ['#2A6A8A','#6B4C8F']
  ];
  function hashSlug(s) {{
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {{ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }}
    return h;
  }}
  function svgFallback(name, slug) {{
    var pair = GRAD_PAIRS[hashSlug(slug) % GRAD_PAIRS.length];
    var c1 = pair[0], c2 = pair[1];
    var letter = ((name || '?').trim()[0] || '?').toUpperCase();
    var id = 'g-' + slug.replace(/[^a-z0-9]/gi, '-');
    return '<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(name) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="320" height="240" fill="url(#' + id + ')"/>' +
      '<text x="160" y="138" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="800" font-size="88" fill="rgba(255,255,255,0.95)">' + esc(letter) + '</text>' +
      '</svg>';
  }}

  /* ---- Dismiss a suggestion via Supabase PATCH ---- */
  async function dismissSuggestion(id) {{
    var url = SB_URL + '/rest/v1/suggestions?id=eq.' + encodeURIComponent(id);
    try {{
      var resp = await fetch(url, {{
        method: 'PATCH',
        headers: {{
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }},
        body: JSON.stringify({{ dismissed: true }})
      }});
      if (!resp.ok) {{
        var text = await resp.text().catch(function() {{ return '(no body)'; }});
        console.error('[suggested] dismiss PATCH failed', resp.status, text);
      }}
    }} catch(e) {{
      console.error('[suggested] dismiss PATCH threw', e);
    }}
  }}

  /* ---- Render a single suggestion card ---- */
  function renderCard(row, a) {{
    var imgHtml;
    if (a.image) {{
      imgHtml = '<img src="' + esc(a.image) + '" alt="' + esc(a.name) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">';
    }} else {{
      imgHtml = svgFallback(a.name, a.slug);
    }}

    var ratingHtml = a.rating
      ? '<span class="rating-big">\u2605 ' + parseFloat(a.rating).toFixed(1) + '</span>'
      : '';

    var kvRows = '';
    if (a.price_adult != null) {{
      kvRows += '<div class="kv-row"><span class="kv">💲 <b>$' + esc(a.price_adult) + '</b> adult</span></div>';
    }}
    if (a.duration_hours != null) {{
      kvRows += '<div class="kv-row"><span class="kv">\u23F1 <b>' + esc(a.duration_hours) + 'h</b></span></div>';
    }}

    var notesHtml = a.notes
      ? '<div class="notes-block">' + esc(a.notes) + '</div>'
      : '';

    var tagsHtml = '';
    if (a.tags && a.tags.length) {{
      tagsHtml = '<div class="tags-row">' +
        a.tags.map(function(t) {{ return '<span class="tag">' + esc(t) + '</span>'; }}).join('') +
        '</div>';
    }}

    var suggestionNoteHtml = row.note
      ? '<p class="suggestion-note">&ldquo;' + esc(row.note) + '&rdquo;</p>'
      : '';

    var linkHtml = a.official_url
      ? '<a href="' + esc(a.official_url) + '" target="_blank" rel="noopener noreferrer">Visit official site \u2197</a>'
      : '';

    return '<article class="card--dense" data-slug="' + esc(a.slug) + '" data-suggestion-id="' + esc(row.id) + '" data-state="wishlist">' +
      '<div class="card--dense__top">' +
        '<div class="card--dense__thumb">' + imgHtml + '</div>' +
        '<div class="card--dense__body">' +
          '<div class="suggestion-from">📨 From ' + esc(row.from_user) + '</div>' +
          (suggestionNoteHtml) +
          '<div class="card--dense__title-line">' +
            '<h3>' + esc(a.name) + '</h3>' + ratingHtml +
          '</div>' +
          (a.description ? '<p class="card--dense__desc">' + esc(a.description) + '</p>' : '') +
          kvRows +
          notesHtml +
          tagsHtml +
          '<div class="action-btns">' +
            '<button type="button" class="btn-add-wish" data-action="add" data-slug="' + esc(a.slug) + '" data-id="' + esc(row.id) + '">\u2665 Add to Wishlist</button>' +
            '<button type="button" class="btn-no-thanks" data-action="dismiss" data-slug="' + esc(a.slug) + '" data-id="' + esc(row.id) + '">No Thanks</button>' +
          '</div>' +
          (linkHtml ? '<div class="link-row">' + linkHtml + '</div>' : '') +
        '</div>' +
      '</div>' +
    '</article>';
  }}

  /* ---- Fetch + render all undismissed suggestions ---- */
  async function renderSuggested() {{
    var user = picks.getUser();
    if (!user) {{ renderWhoPrompt(); return; }}

    var url = SB_URL + '/rest/v1/suggestions?to_user=eq.' + encodeURIComponent(user) +
              '&dismissed=eq.false&select=*';
    var rows;
    try {{
      var resp = await fetch(url, {{
        headers: {{
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY
        }}
      }});
      if (!resp.ok) {{
        var text = await resp.text().catch(function() {{ return '(no body)'; }});
        console.error('[suggested] fetch suggestions failed', resp.status, text);
        root.innerHTML = '<div class="empty-state"><span class="icon">\u26A0\uFE0F</span><p>Could not load suggestions. Check console for details.</p></div>';
        return;
      }}
      rows = await resp.json();
    }} catch(e) {{
      console.error('[suggested] fetch threw', e);
      root.innerHTML = '<div class="empty-state"><span class="icon">\u26A0\uFE0F</span><p>Could not reach server. Check your connection.</p></div>';
      return;
    }}

    if (!rows || rows.length === 0) {{
      root.innerHTML = '<p style="text-align:center;color:var(--color-ink-dim);padding:64px 24px 40px;">No suggestions yet.</p>';
      return;
    }}

    var cards = [];
    rows.forEach(function(row) {{
      var a = slugToAttr(row.slug);
      if (!a) {{
        console.error('[suggested] slug not found in ATTRACTIONS_DATA:', row.slug, 'suggestion id:', row.id);
        return;
      }}
      cards.push(renderCard(row, a));
    }});

    if (cards.length === 0) {{
      root.innerHTML = '<p style="text-align:center;color:var(--color-ink-dim);padding:64px 24px 40px;">No suggestions yet.</p>';
      return;
    }}

    root.innerHTML = '<div class="dense-stack">' + cards.join('') + '</div>';

    /* Wire action buttons */
    root.querySelectorAll('button[data-action]').forEach(function(btn) {{
      btn.addEventListener('click', async function() {{
        var action = btn.getAttribute('data-action');
        var slug = btn.getAttribute('data-slug');
        var id = btn.getAttribute('data-id');
        var card = document.querySelector('.card--dense[data-suggestion-id="' + id + '"]');

        if (action === 'add') {{
          /* Add to wishlist + dismiss */
          try {{ await picks.set(slug, 'wishlist'); }} catch(e) {{ console.error('[suggested] picks.set failed', e); }}
          await dismissSuggestion(id);
        }} else if (action === 'dismiss') {{
          await dismissSuggestion(id);
        }}

        /* Animate card out */
        if (card) {{
          card.style.transition = 'opacity 220ms ease, transform 220ms ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(function() {{ card.remove(); }}, 240);
        }}

        /* If stack is now empty, show empty state */
        setTimeout(function() {{
          var stack = root.querySelector('.dense-stack');
          if (stack && stack.children.length === 0) {{
            root.innerHTML = '<div class="empty-state">' +
              '<span class="icon">\u2713</span>' +
              '<p>All caught up! No pending suggestions.</p>' +
              '</div>';
          }}
        }}, 300);
      }});
    }});
  }}

  /* ---- Init + poll ---- */
  renderSuggested();
  setInterval(renderSuggested, 30000);
}})();
</script>
<script>window.addEventListener('storage',function(e){{if(e.key==='vacdash:v1:mode')document.documentElement.setAttribute('data-mode',e.newValue||'system')}});</script>
</body>
</html>"""

    out = VAULT / "web" / "suggested.html"
    out.write_text(page, encoding="utf-8")
    print(f"  wrote {out}")


def main():
    """Generate all dashboard pages."""
    print("Generating attractions.html...")
    generate_attractions_page()
    print("Generating shows.html...")
    generate_shows_page()
    print("Generating wishlist.html...")
    generate_wishlist_page()
    print("Generating suggested.html...")
    generate_suggested_page()
    print("Done!")


if __name__ == "__main__":
    main()
