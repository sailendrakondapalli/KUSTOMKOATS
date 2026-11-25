-- Testimonials table schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  role TEXT,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_active ON testimonials(is_approved, is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access for approved and active testimonials
CREATE POLICY "Public can view approved and active testimonials"
  ON testimonials
  FOR SELECT
  USING (is_approved = true AND is_active = true);

-- Admin full access (if you have admin role, otherwise adjust)
-- For now, allow authenticated users with specific email to manage
CREATE POLICY "Admins can manage testimonials"
  ON testimonials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: Adjust the admin policy based on your authentication setup
-- You might want to check against a specific admin role or email list

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
INSERT INTO testimonials (name, review, rating, role, is_approved, is_active, display_order) VALUES
  ('Sarah Johnson', 'Absolutely love my custom coat! The quality is exceptional and the design perfectly matches what I envisioned. Worth every penny!', 5, 'Verified Buyer', true, true, 1),
  ('Michael Chen', 'Outstanding craftsmanship and attention to detail. The team was professional and delivered exactly what I wanted. Highly recommended!', 5, 'Verified Buyer', true, true, 2),
  ('Emily Rodriguez', 'Best purchase I''ve made this year! The coat is stylish, comfortable, and unique. Got so many compliments already!', 5, 'Fashion Enthusiast', true, true, 3),
  ('David Thompson', 'Great experience from start to finish. The customization options are amazing and the final product exceeded my expectations.', 4, 'Verified Buyer', true, true, 4),
  ('Jessica Lee', 'Beautiful coat with perfect fit! The customer service was excellent and they helped me choose the right design for my style.', 5, 'Verified Buyer', true, true, 5),
  ('Robert Martinez', 'High quality materials and expert tailoring. This is the most comfortable coat I''ve ever owned. Will definitely order again!', 5, 'Repeat Customer', true, true, 6)
ON CONFLICT DO NOTHING;
