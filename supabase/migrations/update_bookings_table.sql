/*
  # Update bookings table

  1. Changes
    - Add `check_in_status` column to `bookings` table
      - `check_in_status` (BOOLEAN, default false)
    - Add `minibar_items` column to `bookings` table
      - `minibar_items` (JSONB, default '{}'::jsonb)
    - Add `minibar_total` column to `bookings` table
      - `minibar_total` (NUMERIC, default 0)

  2. Security
    - No changes to RLS policies
*/

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_status BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS minibar_items JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS minibar_total NUMERIC DEFAULT 0;