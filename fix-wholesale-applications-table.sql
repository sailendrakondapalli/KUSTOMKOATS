-- =============================================
-- FIX: Add missing application_type column to wholesale_applications
-- Run this in your Supabase SQL editor
-- =============================================

-- Add application_type column if it doesn't exist
ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'dealer';

-- Add constraint to only allow valid application types
ALTER TABLE wholesale_applications
DROP CONSTRAINT IF EXISTS valid_application_type;

ALTER TABLE wholesale_applications
ADD CONSTRAINT valid_application_type 
CHECK (application_type IN ('dealer', 'distributor', 'wholesaler'));

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'wholesale_applications' 
AND column_name = 'application_type';
