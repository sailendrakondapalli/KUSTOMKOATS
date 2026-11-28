-- Product Bundles/Kits System Setup
-- Run this in Supabase SQL Editor

-- 1. Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  bundle_price NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create bundle_items table (products included in each bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bundle_id, product_id)
);

-- 3. Create product_bundles table (which bundles are related to which products)
CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, bundle_id)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON bundle_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_bundles_product_id ON product_bundles(product_id);
CREATE INDEX IF NOT EXISTS idx_product_bundles_bundle_id ON product_bundles(bundle_id);

-- 5. Enable Row Level Security
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Bundles - Everyone can read, only admins can modify
CREATE POLICY "Anyone can view active bundles" ON bundles
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can insert bundles" ON bundles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update bundles" ON bundles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete bundles" ON bundles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Bundle Items - Everyone can read, only admins can modify
CREATE POLICY "Anyone can view bundle items" ON bundle_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert bundle items" ON bundle_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update bundle items" ON bundle_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete bundle items" ON bundle_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Product Bundles - Everyone can read, only admins can modify
CREATE POLICY "Anyone can view product bundles" ON product_bundles
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert product bundles" ON product_bundles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update product bundles" ON product_bundles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete product bundles" ON product_bundles
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Create updated_at trigger for bundles
CREATE OR REPLACE FUNCTION update_bundles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bundles_updated_at
  BEFORE UPDATE ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_bundles_updated_at();

-- Verify setup
SELECT 'Bundles table created' as status, COUNT(*) as count FROM bundles;
SELECT 'Bundle items table created' as status, COUNT(*) as count FROM bundle_items;
SELECT 'Product bundles table created' as status, COUNT(*) as count FROM product_bundles;
