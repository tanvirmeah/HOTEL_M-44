/*
  # Add status column to bookings table

  1. Changes
    - Add `status` column to `bookings` table
      - `status` (TEXT, default 'active')

  2. Security
    - No changes to RLS policies
*/

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';