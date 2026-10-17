-- Product Bundles/Kits System
-- Run this in Supabase SQL Editor

-- Step 1: Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  bundle_price NUMERIC NOT NULL,
  original_price NUMERIC,
  savings_amount NUMERIC,
  savings_percentage NUMERIC,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create bundle_items table (products in a bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create product_bundle_relations table (tag bundles to products)
CREATE TABLE IF NOT EXISTS product_bundle_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, bundle_id)
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON bundle_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_bundle_relations_product ON product_bundle_relations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_bundle_relations_bundle ON product_bundle_relations(bundle_id);

-- Step 5: Enable RLS (Row Level Security)
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundle_relations ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies (allow read for everyone, admin for write)
CREATE POLICY "Anyone can view active bundles" ON bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage bundles" ON bundles FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view bundle items" ON bundle_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage bundle items" ON bundle_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view product bundle relations" ON product_bundle_relations FOR SELECT USING (true);
CREATE POLICY "Admins can manage product bundle relations" ON product_bundle_relations FOR ALL USING (auth.role() = 'authenticated');

-- Step 7: Create function to calculate bundle savings
CREATE OR REPLACE FUNCTION calculate_bundle_savings()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate original price from bundle items
  NEW.original_price := (
    SELECT COALESCE(SUM(p.price * bi.quantity), 0)
    FROM bundle_items bi
    JOIN products p ON p.id = bi.product_id
    WHERE bi.bundle_id = NEW.id
  );
  
  -- Calculate savings
  NEW.savings_amount := NEW.original_price - NEW.bundle_price;
  NEW.savings_percentage := CASE 
    WHEN NEW.original_price > 0 THEN 
      ROUND(((NEW.original_price - NEW.bundle_price) / NEW.original_price * 100)::numeric, 2)
    ELSE 0
  END;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger to auto-calculate savings
DROP TRIGGER IF EXISTS trigger_calculate_bundle_savings ON bundles;
CREATE TRIGGER trigger_calculate_bundle_savings
  BEFORE INSERT OR UPDATE OF bundle_price ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bundle_savings();

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bundles', 'bundle_items', 'product_bundle_relations')
ORDER BY table_name;
