-- Fix testimonials table schema
-- Add missing columns if they don't exist

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='testimonials' AND column_name='role') THEN
    ALTER TABLE testimonials ADD COLUMN role TEXT;
  END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='testimonials' AND column_name='image_url') THEN
    ALTER TABLE testimonials ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Add is_approved column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='testimonials' AND column_name='is_approved') THEN
    ALTER TABLE testimonials ADD COLUMN is_approved BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='testimonials' AND column_name='is_active') THEN
    ALTER TABLE testimonials ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add display_order column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='testimonials' AND column_name='display_order') THEN
    ALTER TABLE testimonials ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='testimonials' AND column_name='updated_at') THEN
    ALTER TABLE testimonials ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add rating constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                 WHERE table_name='testimonials' AND constraint_name='testimonials_rating_check') THEN
    ALTER TABLE testimonials ADD CONSTRAINT testimonials_rating_check CHECK (rating >= 1 AND rating <= 5);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update existing records to have default values
UPDATE testimonials SET is_approved = true WHERE is_approved IS NULL;
UPDATE testimonials SET is_active = true WHERE is_active IS NULL;
UPDATE testimonials SET display_order = 0 WHERE display_order IS NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_active ON testimonials(is_approved, is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view approved and active testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Public can view approved and active testimonials"
  ON testimonials
  FOR SELECT
  USING (is_approved = true AND is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert sample data (only if table is empty or you want more samples)
-- Uncomment the section below if you want to add sample testimonials

/*
INSERT INTO testimonials (name, review, rating, role, is_approved, is_active, display_order) VALUES
  ('Sarah Johnson', 'Absolutely love my custom coat! The quality is exceptional and the design perfectly matches what I envisioned. Worth every penny!', 5, 'Verified Buyer', true, true, 1),
  ('Michael Chen', 'Outstanding craftsmanship and attention to detail. The team was professional and delivered exactly what I wanted. Highly recommended!', 5, 'Verified Buyer', true, true, 2),
  ('Emily Rodriguez', 'Best purchase I''ve made this year! The coat is stylish, comfortable, and unique. Got so many compliments already!', 5, 'Fashion Enthusiast', true, true, 3),
  ('David Thompson', 'Great experience from start to finish. The customization options are amazing and the final product exceeded my expectations.', 4, 'Verified Buyer', true, true, 4),
  ('Jessica Lee', 'Beautiful coat with perfect fit! The customer service was excellent and they helped me choose the right design for my style.', 5, 'Verified Buyer', true, true, 5),
  ('Robert Martinez', 'High quality materials and expert tailoring. This is the most comfortable coat I''ve ever owned. Will definitely order again!', 5, 'Repeat Customer', true, true, 6)
ON CONFLICT DO NOTHING;
*/
