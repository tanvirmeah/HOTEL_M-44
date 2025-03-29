/*
  # Update settings table RLS policy

  1. Changes
    - Update the "Allow authenticated users to update settings" policy to allow updates only if the user is authenticated.
*/

DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

CREATE POLICY "Allow authenticated users to update settings" ON settings
FOR UPDATE
TO authenticated
USING (TRUE);