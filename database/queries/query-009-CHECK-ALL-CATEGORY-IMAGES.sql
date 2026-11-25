-- Check all category images
SELECT 
  id,
  name,
  CASE 
    WHEN image_url IS NULL THEN '❌ No image'
    WHEN image_url = '' THEN '❌ Empty string'
    ELSE '✅ Has image'
  END as status,
  image_url
FROM categories
ORDER BY name;
