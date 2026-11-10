-- =============================================
-- FIX: Technical Details Not Showing on Frontend
-- =============================================
-- Issue: RLS policies are blocking public read access
-- Solution: Temporarily disable RLS or fix the policies

-- OPTION 1: Disable RLS (Quick Fix - Recommended for Testing)
-- =============================================
ALTER TABLE product_technical_bars DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications DISABLE ROW LEVEL SECURITY;

-- After running this, refresh your product page. 
-- Technical details should now appear! ✅


-- OPTION 2: Fix the Policies (Better for Production)
-- =============================================
-- Only use this if OPTION 1 doesn't work or you want proper security

-- First, drop existing policies
DROP POLICY IF EXISTS "Technical bars are viewable by everyone" ON product_technical_bars;
DROP POLICY IF EXISTS "Specifications are viewable by everyone" ON product_specifications;

-- Then create new policies that definitely allow public read
CREATE POLICY "Enable read access for all users"
  ON product_technical_bars FOR SELECT
  USING (TRUE);

CREATE POLICY "Enable read access for all users"  
  ON product_specifications FOR SELECT
  USING (TRUE);

-- Re-enable RLS
ALTER TABLE product_technical_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;


-- =============================================
-- VERIFICATION
-- =============================================
-- Run these queries to verify the fix

-- Check if RLS is disabled (should show 'f' for false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_technical_bars', 'product_specifications');

-- Check if you can select data (should return rows)
SELECT COUNT(*) as total_bars FROM product_technical_bars;
SELECT COUNT(*) as total_specs FROM product_specifications;

-- View sample data
SELECT * FROM product_technical_bars LIMIT 3;
SELECT * FROM product_specifications LIMIT 3;
