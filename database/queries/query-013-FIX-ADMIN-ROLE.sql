-- Step 1: Check current user metadata
SELECT id, email, raw_app_meta_data, raw_user_meta_data
FROM auth.users
WHERE email = 'sailendrakondapalli@gmail.com';

-- Step 2: Add admin role to raw_app_meta_data
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'sailendrakondapalli@gmail.com';

-- Step 3: Verify the admin role was added
SELECT 
  id, 
  email, 
  raw_app_meta_data,
  raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'sailendrakondapalli@gmail.com';

-- Expected result: role column should show "admin"
