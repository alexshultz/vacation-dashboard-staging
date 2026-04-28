-- Admin schema: schedule_overrides
--
-- IMPORTANT: This file contains DDL (CREATE TABLE, etc.) which cannot be run via REST API.
--
-- TO APPLY THIS SCHEMA:
-- 1. Go to https://supabase.com/dashboard/project/quebfbvfuwbncpexlylu/sql
-- 2. Click "New query" or open the SQL editor
-- 3. Copy and paste the entire contents of this file into the editor
-- 4. Click "Run" to execute
-- 5. Verify that the schedule_overrides table was created
--
-- This schema enables coordinator schedule overrides:
-- - schedule_overrides: one row per (event_id, field) override
--   Coordinator writes via admin.html; family pages read at render time.
--   UNIQUE(event_id, field) means each field can have at most one override per event.

-- Table: schedule_overrides
-- Stores field-level overrides for schedule.json events.
-- Family pages (index.html, event-timeline.html) fetch all rows at load time
-- and merge into the events array before rendering.
CREATE TABLE IF NOT EXISTS public.schedule_overrides (
  id          bigserial PRIMARY KEY,
  event_id    text NOT NULL,               -- matches schedule.json event.id (e.g. "atv")
  field       text NOT NULL,               -- field name (e.g. "title", "date", "duration")
  new_value   text NOT NULL,               -- override value as text (cast on read by JS)
  updated_by  text NOT NULL DEFAULT 'Alex',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, field)                 -- one override row per event+field combination
);

-- Index for fast per-event lookups (admin form and family pages both filter by event_id)
CREATE INDEX IF NOT EXISTS schedule_overrides_event_idx ON public.schedule_overrides (event_id);

-- RLS: enable row-level security
ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;

-- Policy 1: anon SELECT (family pages read overrides without auth)
DROP POLICY IF EXISTS "schedule_overrides_anon_read" ON public.schedule_overrides;
CREATE POLICY "schedule_overrides_anon_read"
  ON public.schedule_overrides
  FOR SELECT
  TO anon
  USING (true);

-- Policy 2: admin write (INSERT/UPDATE/DELETE require X-Admin-Token header)
-- The header value must match the app.admin_token config setting (set via MANUAL STEP below).
-- Supabase forwards request headers into current_setting('request.headers') as JSON.
DROP POLICY IF EXISTS "schedule_overrides_admin_write" ON public.schedule_overrides;
CREATE POLICY "schedule_overrides_admin_write"
  ON public.schedule_overrides
  FOR ALL
  TO anon
  USING (
    current_setting('app.admin_token', true) =
    current_setting('request.headers', true)::json->>'x-admin-token'
  )
  WITH CHECK (
    current_setting('app.admin_token', true) =
    current_setting('request.headers', true)::json->>'x-admin-token'
  );

-- Trigger: auto-update updated_at on row change
-- Uses the same shared set_updated_at() function as Phase 2 picks/suggestions tables.
-- CREATE OR REPLACE is safe to re-run even if the function already exists.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_schedule_overrides_updated_at ON public.schedule_overrides;
CREATE TRIGGER set_schedule_overrides_updated_at
  BEFORE UPDATE ON public.schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- MANUAL STEP (run once in Supabase SQL editor after applying this schema):
-- SELECT pg_catalog.set_config('app.admin_token', 'override-token-3141', false);
--
-- This sets the server-side token that the RLS write policy checks against.
-- Without this step, all INSERT/UPDATE/DELETE from admin.html will be rejected.
-- =============================================================================
