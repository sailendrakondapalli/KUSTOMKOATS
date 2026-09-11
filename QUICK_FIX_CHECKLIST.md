# ✅ Quick Fix Checklist - Image Upload Error

## Problem
Admin panel shows **"Failed to upload image"** error

---

## Solution (3 Steps)

### ☐ STEP 1: Create Bucket in Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/gozoxlueuwnyujvvafdl
2. Click: **Storage** (left sidebar)
3. Check if `product-images` bucket exists
   - **If YES**: Skip to Step 2 ✅
   - **If NO**: Continue below ⬇️
4. Click: **"New bucket"**
5. Fill in:
   - Name: `product-images`
   - Public: ✅ YES (toggle on)
6. Click: **"Create bucket"**

✅ **Bucket created!**

---

### ☐ STEP 2: Run SQL Script

1. In Supabase Dashboard, click: **SQL Editor** (left sidebar)
2. Click: **"+ New query"**
3. Open file: `fix-product-images-bucket.sql`
4. Copy **ALL** code (Ctrl+A → Ctrl+C)
5. Paste in SQL Editor (Ctrl+V)
6. Click: **"Run"** (or Ctrl+Enter)
7. Should see: ✅ **"Success. No rows returned"**

✅ **Policies applied!**

---

### ☐ STEP 3: Test Upload

1. Open: http://localhost:5173/admin
2. Click: **Products** tab
3. Click: **"Add Product"** (or edit existing)
4. Scroll to "Product Images"
5. Click: green **"Upload"** button
6. Select image (JPG/PNG, under 5MB)
7. Should see: ✅ **"Image uploaded successfully!"**
8. Image preview appears

✅ **Upload working!**

---

## 🔴 Still Not Working?

### Check Browser Console (F12)
1. Press **F12** (Developer Tools)
2. Click **"Console"** tab
3. Try upload again
4. Look for red error message

### Common Errors:

| Error Message | Solution |
|---------------|----------|
| **"Bucket not found"** | Do Step 1 - create bucket |
| **"violates row-level security"** | Do Step 2 - run SQL again |
| **"File size exceeds"** | Use smaller image (<5MB) |
| **"Invalid mime type"** | Use JPG or PNG format |

---

## 📖 Need Detailed Help?

See these files:
- **`IMAGE_UPLOAD_FIX_STEPS.md`** - Complete guide with troubleshooting
- **`FIX_IMAGE_UPLOAD_ERROR.md`** - Quick reference
- **`fix-product-images-bucket.sql`** - SQL script to run

---

## 💡 Why This Happens

1. **Supabase doesn't allow bucket creation via SQL** (security)
2. Must create bucket manually in Dashboard
3. Then SQL script sets up permissions (policies)
4. Without both: uploads fail

---

## ✅ Success Indicators

You'll know it's working when:
- No error toast appears
- Green "Image uploaded successfully!" toast shows
- Image preview appears in form
- Can save product with image
- Image shows in product list
- Image displays on shop pages

---

**Need help?** Share the error from browser console (F12) 🚀
