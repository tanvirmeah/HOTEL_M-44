/*
  # Add name column to rooms table

  1. Changes
    - Add `name` column to `rooms` table
  2. Security
    - No security changes
*/

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS name TEXT;