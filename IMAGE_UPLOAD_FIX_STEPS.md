# 🔧 Fix Image Upload in Admin Panel - COMPLETE GUIDE

## Current Issue
When clicking **"Upload"** button in admin panel → **"Failed to upload image"** error

---

## ✅ SOLUTION - Follow These 3 Steps

### **STEP 1: Create Storage Bucket in Supabase Dashboard**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/gozoxlueuwnyujvvafdl
   - Login if needed

2. **Navigate to Storage**
   - Click **"Storage"** in left sidebar
   - You'll see list of buckets

3. **Check if `product-images` bucket exists**
   - Look for a bucket named **`product-images`**
   
   **If it EXISTS:**
   - Skip to STEP 2 ✅
   
   **If it DOESN'T EXIST:**
   - Click **"New bucket"** button (top right)
   - Fill in the form:
     * **Name**: `product-images` (exactly this, no spaces)
     * **Public bucket**: ✅ **YES** (toggle ON)
     * **File size limit**: `10 MB` (or leave default)
     * **Allowed MIME types**: Leave empty (allows all image types)
   - Click **"Create bucket"** button
   - ✅ Bucket created!

---

### **STEP 2: Apply Storage Policies (Run SQL)**

1. **Open SQL Editor**
   - In same Supabase Dashboard
   - Click **"SQL Editor"** in left sidebar
   - Click **"+ New query"** button

2. **Copy & Paste SQL Code**
   - Open file: `fix-product-images-bucket.sql`
   - Copy **ALL the code** (Ctrl+A then Ctrl+C)
   - Paste into SQL Editor (Ctrl+V)

3. **Run the SQL**
   - Click **"Run"** button (bottom right)
   - Or press **Ctrl+Enter**
   
4. **Verify Success**
   - You should see: ✅ **"Success. No rows returned"**
   - This means policies were created successfully

---

### **STEP 3: Test Upload in Admin Panel**

1. **Open Admin Panel**
   - Go to: http://localhost:5173/admin
   
2. **Navigate to Products**
   - Click **"Products"** tab in sidebar

3. **Add or Edit Product**
   - Click **"Add Product"** button (top right)
   - OR click edit icon on existing product

4. **Upload Image**
   - Scroll to **"Product Images"** section
   - Click green **"Upload"** button
   - Select an image file (JPG, PNG, WEBP, etc.)
   - File must be **under 5MB**

5. **Success! 🎉**
   - You should see image preview appear
   - Toast notification: **"Image uploaded successfully!"**
   - The image URL will be automatically filled

---

## 🔍 Troubleshooting

### Still getting "Failed to upload image"?

**1. Check Browser Console for Exact Error**
   - Press **F12** to open Developer Tools
   - Click **"Console"** tab
   - Try uploading image again
   - Look for red error messages
   - Common errors below 👇

---

### Common Errors & Solutions

#### ❌ **Error: "new row violates row-level security policy"**
**Cause**: Storage policies not set correctly

**Fix**:
1. Re-run the SQL script from STEP 2
2. Make sure you copied ALL the code
3. Check that Success message appeared

---

#### ❌ **Error: "Bucket not found"**
**Cause**: `product-images` bucket doesn't exist

**Fix**:
1. Go back to STEP 1
2. Create the bucket manually in Dashboard
3. Make sure name is exactly: `product-images`

---

#### ❌ **Error: "File size exceeds maximum allowed"**
**Cause**: Image file is too large (over 5MB)

**Fix**:
1. Compress the image using online tool (tinypng.com)
2. Or resize image to smaller dimensions
3. Keep under 5MB

---

#### ❌ **Error: "Invalid mime type"**
**Cause**: File type not supported

**Fix**:
1. Use JPG, PNG, WEBP, or GIF format
2. Avoid HEIC, TIFF, or other formats
3. Convert image if needed

---

#### ❌ **Error: "Storage API error"**
**Cause**: Supabase service issue or wrong credentials

**Fix**:
1. Check `.env` file has correct Supabase URL and key
2. Verify you're logged into correct Supabase project
3. Try refreshing page and uploading again

---

## 📋 What Each File Does

### `fix-product-images-bucket.sql`
- Drops old/conflicting storage policies
- Creates 4 new policies:
  1. Anyone can READ images (public access)
  2. Anyone can UPLOAD images (for admin)
  3. Anyone can UPDATE images
  4. Anyone can DELETE images
- **Note**: Public access is intentional for easy admin use (no auth needed)

### `src/pages/admin/AdminProductsPage.jsx`
- Has `handleImageUpload()` function
- Validates file type and size
- Uploads to Supabase Storage `product-images` bucket
- Gets public URL and adds to form data
- Shows toast notifications for success/error

---

## 🎯 Quick Test Checklist

After completing all 3 steps, verify:

- [ ] `product-images` bucket exists in Supabase Dashboard Storage
- [ ] Bucket is marked as **Public** (green badge)
- [ ] SQL policies ran successfully (saw Success message)
- [ ] Admin panel loads without errors (http://localhost:5173/admin)
- [ ] Can click Upload button without immediate error
- [ ] Can select image file from computer
- [ ] Upload completes with green toast notification
- [ ] Image preview appears in form
- [ ] Can save product with uploaded image
- [ ] Image displays in product list
- [ ] Image shows on frontend shop pages

---

## 🔒 Security Note

Current setup allows **anyone** to upload images (no authentication).

This is **intentional** for easy admin panel use without login.

### For Production (Future):
Consider adding:
- Admin authentication
- Rate limiting on uploads
- File scanning for malware
- Size limits per user
- CORS restrictions

For now: **Focus on getting it working!** ✅

---

## 💡 Alternative: Test with Direct Supabase Upload

If admin panel upload still fails, test storage directly:

1. Go to Supabase Dashboard → Storage
2. Click `product-images` bucket
3. Click **"Upload file"** button
4. Upload a test image
5. If this works: Issue is in admin panel code
6. If this fails: Issue is with bucket/policy setup

---

## 📞 Need More Help?

If still not working after all steps:

1. **Share error messages** from browser console (F12 → Console)
2. **Screenshot** of Supabase Storage page showing buckets
3. **Screenshot** of SQL Editor showing Success/Error message
4. **Describe** exactly what happens when you click Upload

I'll help debug further! 🚀
