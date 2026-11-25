-- Migration 038: Create content management tables (gallery, page_content, blog_categories, events)
-- Purpose: Support extended content endpoints for complete backend API migration

-- ============= GALLERY TABLE =============

CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for gallery
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_gallery_sort_order ON gallery(sort_order);
CREATE INDEX idx_gallery_is_active ON gallery(is_active);

-- Enable RLS for gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active gallery items
CREATE POLICY "Anyone can view active gallery items"
    ON gallery FOR SELECT
    USING (is_active = true);

-- Only admins can modify gallery
CREATE POLICY "Only admins can modify gallery"
    ON gallery FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============= PAGE CONTENT TABLE =============

CREATE TABLE IF NOT EXISTS page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for page content slug lookups
CREATE INDEX idx_page_content_slug ON page_content(slug);

-- Enable RLS for page content
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all page content
CREATE POLICY "Anyone can view page content"
    ON page_content FOR SELECT
    USING (true);

-- Only admins can modify page content
CREATE POLICY "Only admins can modify page content"
    ON page_content FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============= BLOG CATEGORIES TABLE =============

CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for blog category slug lookups
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);

-- Enable RLS for blog categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all blog categories
CREATE POLICY "Anyone can view blog categories"
    ON blog_categories FOR SELECT
    USING (true);

-- Only admins can modify blog categories
CREATE POLICY "Only admins can modify blog categories"
    ON blog_categories FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============= EVENTS TABLE =============

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for events
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_active ON events(is_active);

-- Enable RLS for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active events
CREATE POLICY "Anyone can view active events"
    ON events FOR SELECT
    USING (is_active = true);

-- Only admins can modify events
CREATE POLICY "Only admins can modify events"
    ON events FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============= UPDATE TRIGGERS =============

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER gallery_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER page_content_updated_at
    BEFORE UPDATE ON page_content
    FOR EACH ROW
    EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_content_timestamp();

CREATE TRIGGER events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_content_timestamp();

-- ============= COMMENTS =============

COMMENT ON TABLE gallery IS 'Stores gallery images and media for display on the gallery page';
COMMENT ON TABLE page_content IS 'Stores editable content for static pages like Our Philosophy, Our Story, etc.';
COMMENT ON TABLE blog_categories IS 'Stores categories for blog posts';
COMMENT ON TABLE events IS 'Stores upcoming and past events information';

COMMENT ON COLUMN gallery.sort_order IS 'Display order for gallery items (lower number = earlier display)';
COMMENT ON COLUMN page_content.slug IS 'URL-friendly identifier for the page (e.g., "our-philosophy")';
COMMENT ON COLUMN page_content.metadata IS 'Additional metadata like SEO title, description, etc.';
COMMENT ON COLUMN events.event_date IS 'Date and time when the event occurs';
