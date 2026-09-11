# Fix "Failed to Upload Image" Error

## Problem
When clicking "Upload" button in admin panel to add product images, you get **"Failed to upload image"** error.

## Cause
The `product-images` storage bucket in Supabase either:
1. Doesn't exist
2. Has incorrect permissions
3. Is not properly configured

---

## 📖 **Complete Step-by-Step Guide**
👉 **See: `IMAGE_UPLOAD_FIX_STEPS.md`** for detailed instructions with troubleshooting

---

## Quick Solution: 3 Steps

### Step 1: Create Bucket Manually
You **CANNOT** create buckets via SQL. Must use Dashboard:
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `product-images`, Public: YES
4. Click "Create"

### Step 2: Run SQL Script

1. Open file: `fix-product-images-bucket.sql`
2. Copy ALL code
3. Go to Supabase Dashboard → SQL Editor
4. Paste and Run
5. Should see: "Success. No rows returned"

### Step 3: Test Upload
1. Go to http://localhost:5173/admin
2. Click Products → Add Product
3. Click Upload button
4. Select image
5. Should work! 🎉

---

## ⚠️ Important Notes

- **Bucket creation via SQL is NOT possible** - Supabase blocks direct storage table manipulation
- The `fix-product-images-bucket.sql` script only sets up **policies** (permissions)
- You MUST create the bucket manually in Dashboard first
- Then run the SQL to set policies

---

## 📖 Need More Help?

See **`IMAGE_UPLOAD_FIX_STEPS.md`** for:
- Detailed step-by-step guide with screenshots instructions
- Common errors and solutions
- Troubleshooting checklist
- Alternative methods
- Security notes
