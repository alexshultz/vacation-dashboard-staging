/**
 * picks.js -- Branson '26 wishlist state manager
 * Phase 1: localStorage backend (no auth, single-device)
 * Phase 2: swap in Supabase backend by setting SUPABASE_URL + SUPABASE_ANON_KEY
 * and calling picks.init(userName) before use.
 *
 * Usage:
 *   picks.init('Mycah')          // set current user (Phase 1: honor-system name)
 *   picks.set('silver-dollar-city', 'wishlist')   // 'wishlist' | 'committing' | 'not-going' | null
 *   picks.get('silver-dollar-city')               // returns current state or null
 *   picks.getAll()                                // returns {slug: state} object for all picks
 *   picks.onChange(slug, callback)                // subscribe to changes on a slug
 */
const picks = (function() {
  'use strict';

  // ---- Config ----
  const SUPABASE_URL = 'https://quebfbvfuwbncpexlylu.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_yLlf7qoMZMfiZhNsyudX7g_HnZ8clgt';
  const STORAGE_KEY = 'vacdash:v1:picks';
  const USER_KEY = 'vacdash:v1:user';

  let currentUser = localStorage.getItem(USER_KEY) || '';
  let listeners = {};  // slug -> [callbacks]

  // ---- LocalStorage backend ----
  function lsGet(slug) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data[slug] || null;
    } catch(e) { return null; }
  }

  function lsSet(slug, state) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (state === null) { delete data[slug]; }
      else { data[slug] = state; }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch(e) { console.error('[picks] localStorage write failed', e); return false; }
  }

  function lsGetAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e) { return {}; }
  }

  // ---- Supabase backend (Phase 2 -- stub) ----
  function sbEnabled() { return !!(SUPABASE_URL && SUPABASE_ANON_KEY && currentUser); }

  // ---- Wishlist aggregation (all users) ----
  async function fetchAllWishlists() {
    const url = `${SUPABASE_URL}/rest/v1/picks?state=eq.wishlist&select=user_id,slug`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    };
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) {
        const text = await r.text();
        console.error('[picks] fetchAllWishlists HTTP error', r.status, r.statusText, text);
        return {};
      }
      const rows = await r.json();
      const grouped = {};
      rows.forEach(function(row) {
        if (!grouped[row.slug]) grouped[row.slug] = [];
        grouped[row.slug].push(row.user_id);
      });
      return grouped;
    } catch(e) {
      console.error('[picks] fetchAllWishlists failed', e);
      return {};
    }
  }

  async function sbSet(slug, state) {
    if (!sbEnabled()) return false;
    const url = `${SUPABASE_URL}/rest/v1/picks`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'resolution=merge-duplicates'
    };
    try {
      if (state === null) {
        await fetch(`${url}?user_id=eq.${encodeURIComponent(currentUser)}&slug=eq.${encodeURIComponent(slug)}`, {method:'DELETE', headers});
      } else {
        await fetch(url, {method:'POST', headers, body: JSON.stringify({user_id:currentUser, slug, state})});
      }
      return true;
    } catch(e) { console.error('[picks] Supabase write failed', e); return false; }
  }

  async function sbGet(slug) {
    if (!sbEnabled()) return null;
    const url = `${SUPABASE_URL}/rest/v1/picks?user_id=eq.${encodeURIComponent(currentUser)}&slug=eq.${encodeURIComponent(slug)}&select=state`;
    const headers = {'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`};
    try {
      const r = await fetch(url, {headers});
      const d = await r.json();
      return (d && d[0]) ? d[0].state : null;
    } catch(e) { return null; }
  }

  // ---- Public API ----
  function notify(slug, state) {
    (listeners[slug] || []).forEach(cb => { try { cb(slug, state); } catch(e) {} });
    (listeners['*'] || []).forEach(cb => { try { cb(slug, state); } catch(e) {} });
  }

  return {
    init(userName) {
      currentUser = userName || '';
      if (currentUser) localStorage.setItem(USER_KEY, currentUser);
    },
    getUser() { return currentUser; },
    get(slug) { return lsGet(slug); },
    getAll() { return lsGetAll(); },
    async set(slug, state) {
      const ok = lsSet(slug, state);  // always write localStorage first (fast + offline)
      if (ok) notify(slug, state);
      if (sbEnabled()) await sbSet(slug, state);  // then sync to Supabase if available
      return ok;
    },
    onChange(slug, callback) {
      if (!listeners[slug]) listeners[slug] = [];
      listeners[slug].push(callback);
    },
    fetchAllWishlists,
    // Listen to storage events from other tabs
    _initStorageSync() {
      window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
          const oldData = JSON.parse(e.oldValue || '{}');
          const newData = JSON.parse(e.newValue || '{}');
          const allSlugs = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
          allSlugs.forEach(slug => {
            if (oldData[slug] !== newData[slug]) notify(slug, newData[slug] || null);
          });
        }
      });
    }
  };
})();

// Auto-init storage sync
if (typeof window !== 'undefined') picks._initStorageSync();
