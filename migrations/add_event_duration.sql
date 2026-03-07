-- Add duration field to events table
-- Allows admins to set custom durations per event (e.g., '7-Day', '24-Hour', '3-Day')

ALTER TABLE events ADD COLUMN IF NOT EXISTS duration VARCHAR(50) DEFAULT '7-Day';

-- Update existing events with appropriate defaults
UPDATE events SET duration = '24-Hour' WHERE event_type = 'patch' AND duration = '7-Day';
UPDATE events SET duration = '7-Day' WHERE event_type IN ('mystery', 'world_reset') AND duration = '7-Day';
