-- Add title field to events table
-- Allows admins to set custom event names (optional, e.g., '??? Weapon Gacha', 'Summer Festival')

ALTER TABLE events ADD COLUMN IF NOT EXISTS title VARCHAR(255);
