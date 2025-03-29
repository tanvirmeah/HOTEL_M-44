/*
  # Create rooms table

  1. New Tables
    - `rooms`
      - `id` (text, primary key)
      - `name` (text)
      - `type` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `rooms` table
    - Add policy for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  name text,
  type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable CRUD for authenticated users" ON rooms;

CREATE POLICY "Enable CRUD for authenticated users"
  ON rooms
  FOR ALL
  TO authenticated
  USING (TRUE);