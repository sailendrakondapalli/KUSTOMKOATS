# How to Add Products to Your Kustom Koats Website

## The Issue
You're seeing **"No products yet"** in your admin panel and **"No Xtreme Wrap products available yet"** on the shop pages because your database is empty.

## Solution: Add Sample Products

### Option 1: Add Products via SQL (Fastest)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `gozoxlueuwnyujvvafdl`

2. **Run the SQL Script**
   - Click on **SQL Editor** in the left sidebar
   - Click **"New Query"**
   - Open the file: `insert-sample-products.sql`
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click **"Run"** button

3. **Verify Products Added**
   - Go to http://localhost:5173/admin
   - Click on **Products** tab
   - You should see 12 sample products:
     - 4 Xtreme Wrap products
     - 4 Xtreme Kolorz products
     - 4 Accessories

4. **Check Your Pages**
   - Visit: http://localhost:5173/shop/xtreme-wrap
   - You should now see 4 Xtreme Wrap products with images!

---

### Option 2: Add Products via Admin Panel (Manual)

1. **Go to Admin Panel**
   - Visit: http://localhost:5173/admin
   - Click on **Products** tab

2. **Click "Add Product" Button**

3. **Fill in Product Details**
   - **Product Name**: Pearl White Xtreme Wrap
   - **Description**: Premium pearl white vinyl wrap with stunning depth and shine
   - **Price**: 5999
   - **Original Price**: 6999 (optional - for showing discounts)
   - **Category**: Select **"Xtreme Wrap"** from dropdown
   - **Stock**: 50
   - **Image URL**: https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800
   - **Tags**: Add "new", "bestseller" (click Add Tag button for each)

4. **Click "Save Product"**

5. **Verify Product Appears**
   - Product should show in the admin products table
   - Visit: http://localhost:5173/shop/xtreme-wrap
   - Product should display on the page!

6. **Repeat** for more products

---

## Important Category Names

Make sure to use these **exact category names** (case-sensitive):

- **Xtreme Wrap** (capital X, capital W)
- **Xtreme Kolorz** (capital X, capital K, with 'z')
- **Accessories** (capital A)

---

## Product Image URLs

The sample SQL uses free Unsplash images. You can:

1. **Use Unsplash images** (free, no attribution required)
   - Search: https://unsplash.com/
   - Right-click image → Copy Image Address
   - Paste URL in admin panel

2. **Upload your own images**
   - Go to Supabase Dashboard → Storage → product-images
   - Upload your product photos
   - Copy the public URL
   - Paste in admin panel

3. **Use placeholder images** for testing
   - The code has a fallback: `/product-fallback.webp`
   - Products without images will show this fallback

---

## Troubleshooting

### Products Still Not Showing?

1. **Check Browser Console** (F12)
   - Look for any red error messages
   - Check Network tab for failed API calls

2. **Verify Database Connection**
   - Check `.env` file has correct Supabase credentials
   - Make sure dev server is running (`npm run dev`)

3. **Restart Dev Server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

4. **Clear Browser Cache**
   - Hard refresh: `Ctrl + Shift + R` (Windows/Linux)
   - Or: `Cmd + Shift + R` (Mac)

### Images Not Loading?

- Make sure image URLs are valid and accessible
- Check that URLs start with `https://`
- Verify product-images bucket in Supabase has public access

---

## Next Steps

Once products are added:

1. ✅ Products appear in admin panel
2. ✅ Products display on shop pages
3. ✅ Products show on homepage (Featured section)
4. ✅ Products are searchable on /products page
5. ✅ Product detail pages work (/products/:id)

Enjoy your fully functional Kustom Koats e-commerce website! 🎨🚗
