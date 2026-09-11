# Admin Panel Image Upload Guide

## New Image Upload Feature

The admin panel now supports **two ways** to add product images:

### Method 1: Upload Image Files (NEW!) ✨

1. **Go to Admin Panel**: http://localhost:5173/admin
2. **Click "Products" tab**
3. **Click "Add Product"** or edit existing product
4. **In the Images section**, you'll see:
   - **"Upload"** button (green) - Click to upload from your computer
   - **"+ Upload New Image"** link - Add a new image slot and upload

5. **Click Upload button**
6. **Select image file** from your computer
7. **Image uploads automatically** to Supabase Storage
8. **Image URL appears** in the input field
9. **Image preview** shows below the input

### Method 2: Paste Image URL (Original)

1. Copy an image URL from anywhere
2. Paste it into the image input field
3. No upload needed

---

## Features:

### ✅ File Upload
- Upload images directly from your computer
- Automatic upload to Supabase `product-images` bucket
- Generates public URL automatically

### ✅ Image Preview
- See uploaded/pasted images immediately
- 128px x 128px preview thumbnail
- Shows before saving product

### ✅ Multiple Images
- Add unlimited product images
- Each image can be uploaded OR pasted as URL
- Mix and match both methods

### ✅ File Validation
- Only accepts image files (jpg, png, webp, gif)
- Maximum file size: 5MB
- Shows error if validation fails

### ✅ Delete Images
- Red trash button to remove any image
- Works for both uploaded and URL images

---

## How It Works:

### Upload Process:
1. **Select file** → File picker opens
2. **Validate** → Checks file type & size
3. **Upload** → Sends to Supabase Storage `product-images` bucket
4. **Get URL** → Retrieves public URL
5. **Insert** → Adds URL to form
6. **Preview** → Shows thumbnail

### Storage Location:
- **Bucket**: `product-images` (in Supabase Storage)
- **File naming**: `timestamp-random.extension`
- **Example**: `1704567890123-a1b2c3.jpg`
- **Public access**: All images are publicly accessible via URL

---

## Image Button Colors:

- 🟢 **Green "Upload" button** - Upload image file
- 🔴 **Red "Delete" button** - Remove image
- 🟢 **Green "+ Upload New Image"** - Add new slot & upload
- 🔴 **Red "+ Add Image URL"** - Add new slot for URL

---

## Example Workflow:

### Adding a Product with Images:

1. Click **"Add Product"**
2. Fill in product details:
   - Name: "Pearl White Xtreme Wrap"
   - Category: "Xtreme Wrap"
   - Price: 5999
   - Stock: 50

3. **Add Images**:
   - Click **"Upload New Image"**
   - Select image from computer
   - Wait for "Image uploaded successfully!" message
   - See image preview appear

4. **Add More Images**:
   - Click **"+ Upload New Image"** again
   - Or use **"+ Add Image URL"** to paste URL

5. **Save Product**
   - Click **"Create Product"**
   - Images save to database as array of URLs

---

## Troubleshooting:

### Image won't upload?
- Check file size (must be < 5MB)
- Check file type (must be image: jpg, png, webp, gif)
- Check internet connection
- Check Supabase Storage bucket exists

### Image URL not showing?
- Wait for upload to complete
- Check browser console for errors
- Verify Supabase credentials in .env

### Image preview not showing?
- URL might be invalid
- Image might be loading slowly
- Check if image URL is accessible

---

## Storage Setup:

The `product-images` bucket should already be created by the database setup script. If not:

1. Go to Supabase Dashboard → Storage
2. Create bucket: `product-images`
3. Set as **Public**
4. File size limit: **5MB**
5. Allowed types: image/jpeg, image/png, image/webp, image/avif

---

## Benefits:

✅ **No external image hosting needed** - Images stored in your Supabase project
✅ **Fast uploads** - Direct to cloud storage
✅ **Automatic URLs** - No copy-paste needed
✅ **Image preview** - See before saving
✅ **Professional workflow** - Just like Shopify, WooCommerce

---

Enjoy your new image upload feature! 🎨📸
