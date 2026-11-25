-- Check if your user has the admin role in raw_app_meta_data
SELECT id, email, raw_app_meta_data, raw_user_meta_data
FROM auth.users
WHERE email = 'sailendrakondapalli@gmail.com';

-- If the role is missing, add it with this:
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'sailendrakondapalli@gmail.com';

-- Verify the update
SELECT id, email, raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'sailendrakondapalli@gmail.com';
