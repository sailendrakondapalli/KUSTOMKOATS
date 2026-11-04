-- Add Product Inventory Management Fields
-- Run this in Supabase SQL Editor

-- Add new columns for complete inventory management
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colour TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS finish TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gtin_ean TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS internal_barcode TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode_type TEXT DEFAULT 'Code 128';
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_internal_barcode ON products(internal_barcode);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Update existing products to have Active status if null
UPDATE products SET status = 'Active' WHERE status IS NULL;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('sku', 'brand', 'colour', 'finish', 'gtin_ean', 'internal_barcode', 'barcode_type', 'mrp', 'status')
ORDER BY column_name;
