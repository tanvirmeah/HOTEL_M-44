/*
  # Create extras and addons tables

  1. New Tables
    - `extras`
      - `id` (uuid, primary key)
      - `name` (text)
    - `addons`
      - `id` (uuid, primary key)
      - `name` (text)

  2. Security
    - Enable RLS on `extras` and `addons` tables
    - Add policies for authenticated users to read and insert data
*/

CREATE TABLE IF NOT EXISTS extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text
);

ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read extras"
  ON extras
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert extras"
  ON extras
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text
);

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read addons"
  ON addons
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert addons"
  ON addons
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);