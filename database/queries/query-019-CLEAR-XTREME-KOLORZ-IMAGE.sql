-- Check current image URL for Xtreme Kolorz
SELECT id, name, image_url 
FROM categories 
WHERE name = 'Xtreme Kolorz';

-- Clear the image URL for Xtreme Kolorz so you can upload a new one
UPDATE categories 
SET image_url = NULL 
WHERE name = 'Xtreme Kolorz';

-- Verify the update
SELECT id, name, image_url 
FROM categories 
WHERE name = 'Xtreme Kolorz';
