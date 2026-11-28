-- Drop the existing admin policy that checks for role
DROP POLICY IF EXISTS "Admins can update categories" ON categories;

-- Create a new policy that allows specific admin emails to update
CREATE POLICY "Admin emails can update categories"
ON categories
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'sailendrakondapalli@gmail.com'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'sailendrakondapalli@gmail.com'
);

-- Verify the new policy
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'categories' AND cmd = 'UPDATE';
