-- Add RLS policy to allow admins to update categories table
CREATE POLICY "Admins can update categories"
ON categories
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Verify the policy was created
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'categories' AND cmd = 'UPDATE';
