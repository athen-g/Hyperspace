-- Migration: Add event_start and event_end columns to public.events table

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS event_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS event_end TIMESTAMPTZ;

-- Backfill existing event_start from event_date if null
UPDATE public.events
SET event_start = event_date
WHERE event_start IS NULL;

-- Backfill event_end to default +4 hours from event_start if null
UPDATE public.events
SET event_end = event_start + INTERVAL '4 hours'
WHERE event_end IS NULL;
