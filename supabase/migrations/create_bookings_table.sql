/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `room_id` (text, references rooms.id)
      - `check_in_date` (date, not null)
      - `check_out_date` (date, not null)
      - `created_at` (timestamp, default now())

  2. Security
    - Enable RLS on `bookings` table
    - Add policy for authenticated users to be able to perform all actions
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text REFERENCES rooms(id),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can perform all actions"
  ON bookings
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);