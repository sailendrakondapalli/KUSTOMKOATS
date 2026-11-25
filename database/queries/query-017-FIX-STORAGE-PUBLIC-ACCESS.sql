-- Make sure the product-images bucket allows public access
-- Check current storage policies
SELECT *
FROM storage.policies
WHERE bucket_id = 'product-images';

-- If no public SELECT policy exists, create one
INSERT INTO storage.policies (bucket_id, name, definition, check_action)
VALUES (
  'product-images',
  'Public can read product images',
  'bucket_id = ''product-images''',
  'SELECT'
)
ON CONFLICT DO NOTHING;

-- Verify the policy was created
SELECT *
FROM storage.policies
WHERE bucket_id = 'product-images';
