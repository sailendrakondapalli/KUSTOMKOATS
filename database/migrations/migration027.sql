-- ================================================================
-- Settings and Product Auto-Increment Setup
-- ================================================================

-- 1. Create site_settings table if it doesn't exist (without description)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;
DROP POLICY IF EXISTS "Public can read allowed settings" ON site_settings;

-- Admin can manage settings
CREATE POLICY "Admins can manage settings" ON site_settings
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'email' IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

-- Public can read certain settings
CREATE POLICY "Public can read allowed settings" ON site_settings
  FOR SELECT USING (
    key IN ('gstin', 'company_name', 'company_address', 'company_phone', 'company_email')
  );

-- 2. Insert default GST and Company settings (without description column)
INSERT INTO site_settings (key, value) VALUES
  ('gstin', '27BZAPK4893D1ZZT'),
  ('company_name', 'KUSTOM KOATS ENTERPRISES'),
  ('company_address', 'S1/803, NEAR TOAD FARMS, KONDHWA BK - HAVELI, WAGHOLI, Pune, MAHARASHTRA 411048'),
  ('company_phone', '+91 9222777925'),
  ('company_email', 'info@kustomkoats.in'),
  ('pan_number', 'AAACI4297A'),
  ('cin_number', 'L24292WB1954PLC021516'),
  ('product_id_prefix', 'KK'),
  ('next_product_id', '100001')
ON CONFLICT (key) DO NOTHING;

-- 3. Add display_product_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_product_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code TEXT DEFAULT '32089090';

-- Create unique index on display_product_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_display_product_id ON products(display_product_id) WHERE display_product_id IS NOT NULL;

-- 4. Function to generate next product ID
CREATE OR REPLACE FUNCTION generate_product_id()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  new_id TEXT;
BEGIN
  -- Get prefix and next number from settings
  SELECT value INTO prefix FROM site_settings WHERE key = 'product_id_prefix';
  SELECT value::INTEGER INTO next_num FROM site_settings WHERE key = 'next_product_id';
  
  -- Default values if settings don't exist
  IF prefix IS NULL THEN prefix := 'KK'; END IF;
  IF next_num IS NULL THEN next_num := 100001; END IF;
  
  -- Generate new ID
  new_id := prefix || '-' || LPAD(next_num::TEXT, 6, '0');
  
  -- Increment the counter
  UPDATE site_settings SET value = (next_num + 1)::TEXT WHERE key = 'next_product_id';
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to auto-generate product ID on insert
CREATE OR REPLACE FUNCTION auto_generate_product_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if display_product_id is not provided
  IF NEW.display_product_id IS NULL OR NEW.display_product_id = '' THEN
    NEW.display_product_id := generate_product_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_product_id ON products;

-- Create trigger
CREATE TRIGGER trigger_auto_product_id
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_id();

-- 6. Backfill existing products with display_product_id
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN SELECT id FROM products WHERE display_product_id IS NULL ORDER BY created_at
  LOOP
    UPDATE products 
    SET display_product_id = generate_product_id() 
    WHERE id = prod.id;
  END LOOP;
END $$;

-- 7. Update products table with hsn_code from custom_id or default
UPDATE products 
SET hsn_code = COALESCE(custom_id, '32089090')
WHERE hsn_code IS NULL;

COMMENT ON COLUMN products.display_product_id IS 'Auto-incremented display product ID (e.g., KK-100001)';
COMMENT ON COLUMN products.hsn_code IS 'HSN/SAC code for tax purposes';
COMMENT ON TABLE site_settings IS 'Global site settings including GSTIN, company details, and counters';

-- Done!
SELECT 'Setup completed successfully!' AS status;
