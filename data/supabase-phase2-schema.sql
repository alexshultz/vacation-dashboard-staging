-- Phase 2 schema: wishlist picks + suggestions
-- 
-- IMPORTANT: This file contains DDL (CREATE TABLE, etc.) which cannot be run via REST API.
-- 
-- TO APPLY THIS SCHEMA:
-- 1. Go to https://supabase.com/dashboard/project/quebfbvfuwbncpexlylu/sql
-- 2. Click "New query" or open the SQL editor
-- 3. Copy and paste the entire contents of this file into the editor
-- 4. Click "Run" to execute
-- 5. Verify that all three tables were created: picks, suggestions, wishlist_trash
-- 
-- This schema enables Phase 2 wishlist functionality:
-- - picks: stores each person's "wishlist" / "committing" / "not-going" state for each attraction
-- - suggestions: peer-to-peer attraction suggestions with optional replies
-- - wishlist_trash: soft-delete recovery (60-day retention)
--
-- Phase 1 (honor-system, no auth): user_id is a browser-chosen name string
-- Phase 2 (with auth): user_id becomes auth.uid()

-- Table: picks
-- Stores each person's wishlist state for each attraction.
-- In Phase 1 (honor-system, no auth), user_id is just a browser-chosen name.
-- In Phase 2, user_id becomes auth.uid().
CREATE TABLE IF NOT EXISTS public.picks (
  id          bigserial PRIMARY KEY,
  user_id     text NOT NULL,           -- Phase 1: name string. Phase 2: auth.uid()
  slug        text NOT NULL,           -- attraction slug from attractions.json
  state       text NOT NULL CHECK (state IN ('wishlist', 'committing', 'not-going')),
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, slug)               -- one row per person per attraction
);

-- Index for fast per-slug lookups (who has wishlisted this attraction)
CREATE INDEX IF NOT EXISTS picks_slug_idx ON public.picks (slug);

-- Index for fast per-user lookups (what has this person picked)
CREATE INDEX IF NOT EXISTS picks_user_idx ON public.picks (user_id);

-- Table: suggestions
-- One row per (sender, recipient, attraction) suggestion.
CREATE TABLE IF NOT EXISTS public.suggestions (
  id           bigserial PRIMARY KEY,
  from_user    text NOT NULL,
  to_user      text NOT NULL,
  slug         text NOT NULL,
  note         text DEFAULT '',
  reply_emoji  text DEFAULT '',        -- ❤️ / 🤔 / 🙅 or empty
  reply_note   text DEFAULT '',
  dismissed    boolean DEFAULT false,
  added        boolean DEFAULT false,  -- true when recipient added to wishlist
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

-- Table: wishlist_trash (already exists from Phase 1, but include for completeness)
-- Attractions removed from wishlist, recoverable for 60 days.
CREATE TABLE IF NOT EXISTS public.wishlist_trash (
  id          bigserial PRIMARY KEY,
  user_id     text NOT NULL,
  slug        text NOT NULL,
  trashed_at  timestamptz DEFAULT now() NOT NULL,
  expires_at  timestamptz DEFAULT (now() + interval '60 days') NOT NULL
);
CREATE INDEX IF NOT EXISTS trash_user_idx ON public.wishlist_trash (user_id);

-- RLS policies (Phase 1: honor-system, anyone can read/write)
-- DROP POLICY IF EXISTS guards make this script safe to re-run (no "CREATE POLICY IF NOT EXISTS" in Postgres)
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "picks_open_phase1" ON public.picks;
CREATE POLICY "picks_open_phase1" ON public.picks FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suggestions_open_phase1" ON public.suggestions;
CREATE POLICY "suggestions_open_phase1" ON public.suggestions FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE public.wishlist_trash ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trash_open_phase1" ON public.wishlist_trash;
CREATE POLICY "trash_open_phase1" ON public.wishlist_trash FOR ALL TO anon USING (true) WITH CHECK (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS picks_updated_at ON public.picks;
CREATE TRIGGER picks_updated_at BEFORE UPDATE ON public.picks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS suggestions_updated_at ON public.suggestions;
CREATE TRIGGER suggestions_updated_at BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
