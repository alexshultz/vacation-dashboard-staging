-- Phase 1 Migration: Event Types Feature
-- Adds event classification, series grouping, attendee assignment, and meal override columns
-- to the schedule_events table in Supabase.
-- References: ADR-017, ADR-018, ADR-019, ADR-020, ADR-021
-- Run manually in the Supabase SQL editor. Safe to re-run (idempotent).

-- Widen duration from INTEGER to NUMERIC to support fractional hours (e.g. 0.75, 1.5, 2.5)
ALTER TABLE IF EXISTS schedule_events
  ALTER COLUMN duration TYPE NUMERIC;

-- Add event classification column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN event_type TEXT CHECK (event_type IN ('commitment', 'open', 'meal'));
  END IF;
END $$;

-- Add series grouping slug column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'series_slug'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN series_slug TEXT;
  END IF;
END $$;

-- Add assigned attendees array (for commitment-type events)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'assigned_attendees'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN assigned_attendees TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add meal inclusion override array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'meal_override_include'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN meal_override_include TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add meal exclusion override array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_events' AND column_name = 'meal_override_exclude'
  ) THEN
    ALTER TABLE schedule_events
      ADD COLUMN meal_override_exclude TEXT[] DEFAULT '{}';
  END IF;
END $$;
