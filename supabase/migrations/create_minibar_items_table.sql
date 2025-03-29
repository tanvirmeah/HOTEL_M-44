/*
  # Create minibar_items table

  1. New Tables
    - `minibar_items`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `name` (text, not null)
      - `category` (text, not null)
      - `stock` (integer, not null, default 0)
      - `price` (integer, not null, default 0)

  2. Security
    - Enable RLS on `minibar_items` table
    - Add policy for authenticated users to be able to perform all actions
*/

CREATE TABLE IF NOT EXISTS minibar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  price integer NOT NULL DEFAULT 0
);

ALTER TABLE minibar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can perform all actions"
  ON minibar_items
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);