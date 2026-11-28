-- Migration 035: Create contact and enquiry submissions tables
-- Purpose: Add tables to store contact form and enquiry form submissions
-- Date: 2024

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enquiry submissions table
CREATE TABLE IF NOT EXISTS enquiry_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_enquiry_submissions_email ON enquiry_submissions(email);

-- Create index on product_id for filtering
CREATE INDEX IF NOT EXISTS idx_enquiry_submissions_product_id ON enquiry_submissions(product_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_enquiry_submissions_status ON enquiry_submissions(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_enquiry_submissions_created_at ON enquiry_submissions(created_at DESC);

-- Add triggers to update updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at 
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiry_submissions_updated_at 
  BEFORE UPDATE ON enquiry_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON TABLE enquiry_submissions IS 'Stores enquiry form submissions from website visitors, can be linked to specific products';
COMMENT ON COLUMN contact_submissions.status IS 'Submission status: new, in_progress, resolved, archived';
COMMENT ON COLUMN enquiry_submissions.status IS 'Submission status: new, in_progress, resolved, archived';
