-- Check the exact RLS policy definition
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'categories';

-- Check what's in your JWT token's claims
-- (This shows what the RLS policy actually sees)
SELECT 
  auth.uid() as user_id,
  auth.jwt() as full_jwt,
  auth.jwt() ->> 'role' as jwt_role,
  auth.jwt() ->> 'email' as jwt_email;

-- Check your user's metadata in the database
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'role' as metadata_role
FROM auth.users
WHERE email = 'sailendrakondapalli@gmail.com';
