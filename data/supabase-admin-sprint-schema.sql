-- Branson 2026 · Phase 2 Admin Sprint Schema
-- Run manually in the Supabase dashboard SQL editor.
-- DO NOT run via CLI or migration tooling.
-- Safe to re-run (IF NOT EXISTS / DROP IF EXISTS guards throughout).
-- Does NOT touch the existing `picks` table.

-- ─── 1. TABLE: schedule_events ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_events (
    id               TEXT PRIMARY KEY,
    title            TEXT,
    date             TEXT,
    duration         INTEGER,
    priority         TEXT,
    "catalogRef"     TEXT,
    "startTime"      TEXT,
    "travelMinutes"  INTEGER,
    interested       JSONB,
    undecided        JSONB,
    "notInterested"  JSONB,
    "noResponse"     JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. TABLE: app_config ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_config (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. updated_at trigger on schedule_events ────────────────────────────────
-- Inline function — no extension dependency.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_schedule_events_updated_at ON schedule_events;
CREATE TRIGGER trg_schedule_events_updated_at
    BEFORE UPDATE ON schedule_events
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ─── 4. RLS: schedule_events ─────────────────────────────────────────────────
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedule_events_anon_select" ON schedule_events;
CREATE POLICY "schedule_events_anon_select"
    ON schedule_events
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "schedule_events_authenticated_all" ON schedule_events;
CREATE POLICY "schedule_events_authenticated_all"
    ON schedule_events
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ─── 5. RLS: app_config ───────────────────────────────────────────────────────
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_config_anon_select" ON app_config;
CREATE POLICY "app_config_anon_select"
    ON app_config
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "app_config_authenticated_all" ON app_config;
CREATE POLICY "app_config_authenticated_all"
    ON app_config
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ─── 6. Realtime: app_config only ────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE app_config;
