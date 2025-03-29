/*
  # Remove price column from extras and addons tables

  1. Modified Tables
    - `extras`
      - Removed `price` column
    - `addons`
      - Removed `price` column

  2. Security
    - No security changes
*/

ALTER TABLE extras DROP COLUMN IF EXISTS price;
ALTER TABLE addons DROP COLUMN IF EXISTS price;