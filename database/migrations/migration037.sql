-- Migration 037: Create category showcase table
-- Purpose: Allow admins to manually select featured products for homepage category cards

CREATE TABLE IF NOT EXISTS category_showcase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL UNIQUE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_category_showcase_category ON category_showcase(category);

-- Add RLS policies
ALTER TABLE category_showcase ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view category showcases"
    ON category_showcase FOR SELECT
    USING (true);

-- Only admins can modify (assuming you have admin role checking)
CREATE POLICY "Only admins can modify category showcases"
    ON category_showcase FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_showcase_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER category_showcase_updated_at
    BEFORE UPDATE ON category_showcase
    FOR EACH ROW
    EXECUTE FUNCTION update_category_showcase_timestamp();

COMMENT ON TABLE category_showcase IS 'Stores admin-selected products for homepage category showcase section';
COMMENT ON COLUMN category_showcase.category IS 'Category name: Xtreme Kolorz, Xtreme Wrap, or Accessories';
COMMENT ON COLUMN category_showcase.product_id IS 'Product to showcase for this category';
