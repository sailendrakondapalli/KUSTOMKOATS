-- =============================================
-- FIX: Row Level Security for wholesale_applications
-- Allow public users to submit applications
-- Run this in your Supabase SQL editor
-- =============================================

-- Enable RLS on wholesale_applications table
ALTER TABLE wholesale_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit wholesale applications" ON wholesale_applications;
DROP POLICY IF EXISTS "Only admins can view wholesale applications" ON wholesale_applications;
DROP POLICY IF EXISTS "Only admins can update wholesale applications" ON wholesale_applications;
DROP POLICY IF EXISTS "Only admins can delete wholesale applications" ON wholesale_applications;

-- Allow anyone to INSERT (submit) applications
CREATE POLICY "Anyone can submit wholesale applications"
  ON wholesale_applications
  FOR INSERT
  WITH CHECK (true);

-- Only admins can SELECT (view) applications
CREATE POLICY "Only admins can view wholesale applications"
  ON wholesale_applications
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Only admins can UPDATE applications
CREATE POLICY "Only admins can update wholesale applications"
  ON wholesale_applications
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Only admins can DELETE applications
CREATE POLICY "Only admins can delete wholesale applications"
  ON wholesale_applications
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'wholesale_applications';
