-- =============================================
-- MIGRATION: Fix Wholesale Applications & Ensure Product Technical Details
-- Run this in your Supabase SQL editor
-- =============================================

-- 1. Ensure wholesale_applications table has admin_notes column
ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. Ensure wholesale_applications table has updated_at column
ALTER TABLE wholesale_applications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Ensure products table has all optional columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price NUMERIC;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dealer_price NUMERIC;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS custom_id TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC;

-- 4. Ensure product_technical_bars table exists
CREATE TABLE IF NOT EXISTS product_technical_bars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  labels TEXT[] NOT NULL DEFAULT '{}',
  selected_value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ensure product_specifications table exists
CREATE TABLE IF NOT EXISTS product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  spec_name TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS if not already enabled
ALTER TABLE product_technical_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Technical bars are viewable by everyone" ON product_technical_bars;
DROP POLICY IF EXISTS "Only admins can insert technical bars" ON product_technical_bars;
DROP POLICY IF EXISTS "Only admins can update technical bars" ON product_technical_bars;
DROP POLICY IF EXISTS "Only admins can delete technical bars" ON product_technical_bars;

DROP POLICY IF EXISTS "Specifications are viewable by everyone" ON product_specifications;
DROP POLICY IF EXISTS "Only admins can insert specifications" ON product_specifications;
DROP POLICY IF EXISTS "Only admins can update specifications" ON product_specifications;
DROP POLICY IF EXISTS "Only admins can delete specifications" ON product_specifications;

-- 8. Create policies for technical bars
CREATE POLICY "Technical bars are viewable by everyone"
  ON product_technical_bars FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can insert technical bars"
  ON product_technical_bars FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update technical bars"
  ON product_technical_bars FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete technical bars"
  ON product_technical_bars FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 9. Create policies for specifications
CREATE POLICY "Specifications are viewable by everyone"
  ON product_specifications FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can insert specifications"
  ON product_specifications FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update specifications"
  ON product_specifications FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete specifications"
  ON product_specifications FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- OPTIONAL: If you still get RLS errors, uncomment these lines
-- to temporarily disable RLS for admin operations
-- =============================================
-- ALTER TABLE product_technical_bars DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_specifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE wholesale_applications DISABLE ROW LEVEL SECURITY;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check if admin_notes column exists in wholesale_applications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wholesale_applications' 
AND column_name = 'admin_notes';

-- Check if product technical tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('product_technical_bars', 'product_specifications');

-- Check products table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('original_price', 'wholesale_price', 'dealer_price', 'custom_id', 'delivery_charge');
