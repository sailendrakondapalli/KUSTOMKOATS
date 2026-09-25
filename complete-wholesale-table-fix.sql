-- =============================================
-- COMPLETE FIX: Add all missing columns to wholesale_applications table
-- Run this in your Supabase SQL editor
-- =============================================

-- Add all missing columns
ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS business_name TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'dealer';

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS state TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS pincode TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraint for valid application types
ALTER TABLE wholesale_applications
DROP CONSTRAINT IF EXISTS valid_application_type;

ALTER TABLE wholesale_applications
ADD CONSTRAINT valid_application_type 
CHECK (application_type IN ('dealer', 'distributor', 'wholesaler'));

-- Add constraint for valid statuses
ALTER TABLE wholesale_applications
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE wholesale_applications
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Verify all columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'wholesale_applications'
ORDER BY ordinal_position;
