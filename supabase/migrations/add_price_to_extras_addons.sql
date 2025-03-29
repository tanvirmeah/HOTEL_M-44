/*
  # Add price column to extras and addons tables

  1. Modified Tables
    - `extras`
      - Added `price` (numeric) column
    - `addons`
      - Added `price` (numeric) column
  2. Security
    - No security changes
*/

ALTER TABLE extras ADD COLUMN price NUMERIC DEFAULT 0;
ALTER TABLE addons ADD COLUMN price NUMERIC DEFAULT 0;