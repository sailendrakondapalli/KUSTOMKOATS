-- Run this in Supabase SQL Editor to check category images

SELECT 
  id,
  name,
  image_url,
  sort_order,
  is_active
FROM categories
ORDER BY sort_order;
