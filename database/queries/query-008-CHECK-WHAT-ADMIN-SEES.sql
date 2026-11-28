-- Check what categories the admin panel can actually read
SELECT 
  id,
  name,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '❌ No image URL'
    WHEN image_url = '' THEN '❌ Empty string'
    ELSE '✅ Has URL: ' || image_url
  END as image_status
FROM categories
ORDER BY sort_order;
