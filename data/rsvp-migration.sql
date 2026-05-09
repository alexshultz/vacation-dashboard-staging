-- Branson 2026 Phase 0 RSVP Migration
-- Run manually in the Supabase SQL editor. Do NOT execute via CLI or API.

-- 2a. Add locked_at to schedule_events
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- 2b. Add wishlist_count to schedule_events
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS wishlist_count INTEGER;

-- 2c. Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id   TEXT        NOT NULL,
  user_id    TEXT        NOT NULL,
  status     TEXT        NOT NULL
               CHECK (status IN ('interested','undecided','not-going','no-response')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- 2d. Enable RLS and create anon read/write policy on event_rsvps
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_rsvp_readwrite ON event_rsvps
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (
    (SELECT locked_at FROM schedule_events WHERE id = event_rsvps.event_id) IS NULL
    OR now() < (SELECT locked_at FROM schedule_events WHERE id = event_rsvps.event_id)
  );

-- 2e. Index on event_id for query performance
CREATE INDEX IF NOT EXISTS event_rsvps_event_idx ON event_rsvps (event_id);
