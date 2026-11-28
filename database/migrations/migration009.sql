-- =============================================
-- FIX: Make place_location nullable or set default
-- Run this in your Supabase SQL editor
-- =============================================

-- Option 1: Make place_location nullable (recommended)
ALTER TABLE wholesale_applications 
ALTER COLUMN place_location DROP NOT NULL;

-- Option 2: Or set a default value instead
-- ALTER TABLE wholesale_applications 
-- ALTER COLUMN place_location SET DEFAULT '';

-- Verify the change
SELECT 
  column_name, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'wholesale_applications' 
AND column_name = 'place_location';
