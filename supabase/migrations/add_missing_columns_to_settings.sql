/*
  # Add missing columns to settings table

  1. Changes
    - Add `addressLine1` column to `settings` table
    - Add `addressLine2` column to `settings` table
    - Add `phone` column to `settings` table
    - Add `logoUrl` column to `settings` table
    - Add `language` column to `settings` table
    - Add `hotelName` column to `settings` table
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'addressLine1') THEN
    ALTER TABLE settings ADD COLUMN "addressLine1" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'addressLine2') THEN
    ALTER TABLE settings ADD COLUMN "addressLine2" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'phone') THEN
    ALTER TABLE settings ADD COLUMN "phone" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'logoUrl') THEN
    ALTER TABLE settings ADD COLUMN "logoUrl" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'language') THEN
    ALTER TABLE settings ADD COLUMN "language" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'hotelName') THEN
    ALTER TABLE settings ADD COLUMN "hotelName" TEXT;
  END IF;
END $$;