/*
  # Update rooms table to use text for id

  1. Modified Tables
    - `rooms`
      - Changed `id` from uuid to text

  2. Security
    - Enable RLS on `rooms` table
    - Add policy for authenticated users to perform CRUD operations
*/

ALTER TABLE rooms ALTER COLUMN id TYPE text;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable CRUD for authenticated users" ON rooms;

CREATE POLICY "Enable CRUD for authenticated users"
  ON rooms
  FOR ALL
  TO authenticated
  USING (TRUE);