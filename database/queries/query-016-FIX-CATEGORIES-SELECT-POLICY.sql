-- Check current SELECT policies on categories table
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'categories' AND cmd = 'SELECT';

-- Drop any restrictive SELECT policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

-- Create a new policy that allows ANYONE (even anonymous users) to read categories
CREATE POLICY "Public read access for categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Verify the new policy
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'categories' AND cmd = 'SELECT';
