-- Fix promo_codes table - add ALL missing columns if they don't exist

-- Add applicable_category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'applicable_category'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN applicable_category TEXT;
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'description'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add max_uses column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'max_uses'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN max_uses INTEGER;
    END IF;
END $$;

-- Add is_one_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'is_one_time'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN is_one_time BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add min_order_amount column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'min_order_amount'
    ) THEN
        ALTER TABLE promo_codes ADD COLUMN min_order_amount NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;

CREATE TRIGGER update_promo_codes_updated_at 
  BEFORE UPDATE ON promo_codes 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Verify the structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'promo_codes'
ORDER BY ordinal_position;
