# 🔍 Troubleshooting: Technical Details Not Showing

## Quick Diagnostic Steps

### Step 1: Check Browser Console

1. Open the product detail page where technical details should appear
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab
4. Look for any red errors

**Common errors to look for:**
- `techBars fetch error:` or `techSpecs fetch error:`
- `RLS policy violation`
- `permission denied`
- `relation "product_technical_bars" does not exist`

### Step 2: Check if Data Was Saved

Open **Supabase Dashboard → Table Editor**

**Check `product_technical_bars` table:**
```
1. Go to Table Editor
2. Find "product_technical_bars" table
3. Look for rows with your product_id
4. Should see rows with title, labels, selected_value
```

**Check `product_specifications` table:**
```
1. Go to Table Editor  
2. Find "product_specifications" table
3. Look for rows with your product_id
4. Should see rows with spec_name, spec_value
```

### Step 3: Verify RLS Policies

If data exists but doesn't show on frontend, it's likely an RLS (Row Level Security) issue.

**Fix:** Run this in Supabase SQL Editor:

```sql
-- Temporarily disable RLS to test
ALTER TABLE product_technical_bars DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications DISABLE ROW LEVEL SECURITY;
```

Then refresh the product page. If it works now, the issue was RLS policies.

### Step 4: Check Product ID

Make sure the technical details were saved with the correct `product_id`.

**In Supabase SQL Editor, run:**
```sql
-- Replace 'YOUR_PRODUCT_ID' with the actual product ID from the URL
SELECT * FROM product_technical_bars 
WHERE product_id = 'YOUR_PRODUCT_ID';

SELECT * FROM product_specifications 
WHERE product_id = 'YOUR_PRODUCT_ID';
```

If no rows are returned, the data wasn't saved properly.

---

## Common Issues & Solutions

### Issue 1: RLS Policy Error
**Symptom:** Console shows "RLS policy violation" or "permission denied"

**Solution:**
```sql
-- Disable RLS temporarily
ALTER TABLE product_technical_bars DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications DISABLE ROW LEVEL SECURITY;
```

### Issue 2: Tables Don't Exist
**Symptom:** Console shows "relation does not exist"

**Solution:** Re-run the migration SQL file

### Issue 3: Data Not Saving
**Symptom:** Tables exist but are empty after clicking "Save"

**Solution:** 
1. Check browser console when clicking "Save"
2. Look for errors
3. Might be an admin authentication issue

### Issue 4: Wrong Product ID
**Symptom:** Data exists but for a different product

**Solution:**
1. Delete incorrect data in Supabase
2. Edit product again in admin
3. Re-save technical details

---

## Quick Fix Script

**Run this in Supabase SQL Editor to check everything:**

```sql
-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('product_technical_bars', 'product_specifications');

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_technical_bars', 'product_specifications');

-- 3. Count rows in each table
SELECT 'technical_bars' as table_name, COUNT(*) as row_count 
FROM product_technical_bars
UNION ALL
SELECT 'specifications' as table_name, COUNT(*) as row_count 
FROM product_specifications;

-- 4. See all technical details
SELECT 
  ptb.product_id,
  p.name as product_name,
  ptb.title,
  ptb.labels,
  ptb.selected_value
FROM product_technical_bars ptb
LEFT JOIN products p ON p.id = ptb.product_id
ORDER BY ptb.created_at DESC
LIMIT 10;

SELECT 
  ps.product_id,
  p.name as product_name,
  ps.spec_name,
  ps.spec_value
FROM product_specifications ps
LEFT JOIN products p ON p.id = ps.product_id
ORDER BY ps.created_at DESC
LIMIT 10;
```

---

## If Nothing Works

1. **Export your product data** (so you don't lose it)
2. **Run this to reset everything:**

```sql
-- Drop and recreate tables
DROP TABLE IF EXISTS product_technical_bars CASCADE;
DROP TABLE IF EXISTS product_specifications CASCADE;

-- Then re-run the full migration from:
-- migration-fix-wholesale-and-products.sql
```

3. **Re-add technical details** in admin panel

---

## Test Product Creation

Try creating a test product from scratch:

1. Go to `/admin/products`
2. Click "+ Add Product"
3. Basic Info:
   - Name: "TEST PRODUCT"
   - Price: 100
   - Category: Any
   - Stock: 1
4. Technical Details:
   - Add 1 technical bar
   - Add 1 specification
5. Click "Save"
6. Check browser console for errors
7. Go to product page
8. Check if technical details appear

If test product works, the issue is with the specific product you're trying to view.

---

## Get Help

If you're still stuck, tell me:
1. What errors you see in browser console (if any)
2. What you see when you check the database tables
3. Which of the above steps you tried

I'll help you debug further! 🔍
