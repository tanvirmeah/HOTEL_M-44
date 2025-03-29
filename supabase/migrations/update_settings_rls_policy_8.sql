/*
  # Update settings table RLS policy

  1. Changes
    - Enable authenticated users to insert new rows into the settings table.
*/

DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

CREATE POLICY "Allow authenticated users to update settings" ON settings
FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);