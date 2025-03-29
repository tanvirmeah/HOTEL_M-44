/*
      # Create settings table

      1. New Tables
        - `settings`
          - `id` (text, primary key, default '1')
          - `hotelName` (text, nullable)
          - `addressLine1` (text, nullable)
          - `addressLine2` (text, nullable)
          - `phone` (text, nullable)
          - `logoUrl` (text, nullable)
          - `language` (text, nullable, default 'en')

      2. Security
        - Enable RLS on `settings` table
        - Add policy for authenticated users to read and update settings
    */

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT '1',
      hotelName TEXT,
      addressLine1 TEXT,
      addressLine2 TEXT,
      phone TEXT,
      logoUrl TEXT,
      language TEXT DEFAULT 'en'
    );

    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow authenticated users to read settings"
      ON settings
      FOR SELECT
      TO authenticated
      USING (TRUE);

    CREATE POLICY "Allow authenticated users to update settings"
      ON settings
      FOR UPDATE
      TO authenticated
      USING (TRUE);