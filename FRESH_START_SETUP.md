# 🚀 Kustom Koats - Fresh Database Setup Guide

Follow these steps to set up your Kustom Koats website with a new database.

---

## 📋 Step 1: Create New Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name:** Kustom Koats
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
4. Click "Create Project"
5. Wait 2-3 minutes for setup to complete

---

## 🔑 Step 2: Get Your Database Credentials

1. In your Supabase project dashboard
2. Click the **Settings** icon (⚙️) in left sidebar
3. Click **API** under Project Settings
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## ⚙️ Step 3: Update .env File

1. Open `.env` file in your project root
2. Replace with your credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_URL_HERE.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
VITE_ADMIN_EMAIL=sailendrakondapalli@gmail.com
```

3. Save the file

---

## 🗄️ Step 4: Run Database Setup

1. Go back to Supabase dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Open the file `COMPLETE_DATABASE_SETUP.sql` from your project
5. **Copy ALL the SQL code** from that file
6. **Paste it** into the SQL Editor
7. Click **RUN** button (or press Ctrl+Enter)
8. Wait for "Success. No rows returned" message

This creates all your tables:
- ✅ products
- ✅ orders
- ✅ order_items
- ✅ testimonials (reviews)
- ✅ cart
- ✅ wishlist
- ✅ addresses
- ✅ promo_codes
- ✅ site_settings

---

## 🎨 Step 5: Start Your Website

1. Open terminal in your project folder
2. Run:
```bash
npm install
npm run dev
```

3. Open browser: http://localhost:5173
4. You should see your Kustom Koats website!

---

## 🎯 Step 6: Access Admin Panel

1. Go to: http://localhost:5173/admin
2. You should see the admin dashboard with:
   - Dashboard tab (statistics)
   - Products tab
   - Orders tab
   - Reviews tab

---

## 📦 Step 7: Add Your First Product

1. In admin panel, click **Products** tab
2. Click **Add Product** button (red button, top right)
3. Fill in:
   - **Name:** e.g., "Pearl Red Metallic"
   - **Description:** e.g., "Premium automotive pearl finish"
   - **Price:** e.g., 2999
   - **Original Price:** e.g., 3999 (optional, for discounts)
   - **Category:** Select "Xtreme Kolorz", "Xtreme Wrap", or "Accessories"
   - **Stock:** e.g., 10
   - **Images:** Click "+ Add Image URL" and paste image URLs

4. Click **Create Product**
5. Product appears instantly on your website!

---

## 🔍 Where Your Products Appear

After adding products, they will show on:

### Homepage:
- **Kustom Signature Series** section (3rd section)
- Shows 8 most recent products

### Shop Pages:
- `/shop` - All products
- `/shop/xtreme-kolorz` - Xtreme Kolorz products only
- `/shop/xtreme-wrap` - Xtreme Wrap products only
- `/shop/accessories` - Accessories only

### Product Detail:
- `/products/:id` - Individual product pages
- Click any product card to see full details

---

## 📸 Adding Product Images

### Option 1: Use Supabase Storage
1. In Supabase dashboard → **Storage**
2. Click on **product-images** bucket
3. Click **Upload File**
4. Select your image
5. After upload, click the image
6. Click **Get Public URL**
7. Copy the URL and paste in admin panel

### Option 2: Use External URLs
- Use any image hosting service (Imgur, Cloudinary, etc.)
- Copy the direct image URL
- Paste in admin panel

---

## 🎨 Admin Panel Features

### Dashboard Tab:
- Total Products count
- Active Orders count
- Total Revenue (₹)
- Pending Reviews count
- Recent Orders table

### Products Tab:
- View all products
- Add new products
- Edit product details
- Delete products
- See product images, prices, stock

### Orders Tab:
- View all customer orders
- Change order status:
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- See order totals and dates

### Reviews Tab:
- View all customer reviews
- Approve/Unapprove reviews
- Delete reviews
- See star ratings
- Only approved reviews show on website

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Website loads at http://localhost:5173
- [ ] Admin panel loads at http://localhost:5173/admin
- [ ] Can add products in admin
- [ ] Products appear on homepage
- [ ] Can click products to see details
- [ ] Shop page shows products
- [ ] Category pages work (Xtreme Kolorz, Xtreme Wrap, Accessories)
- [ ] Reviews section appears on homepage

---

## 🆘 Troubleshooting

### Website won't load?
1. Check `.env` file has correct credentials
2. Make sure dev server is running (`npm run dev`)
3. Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Products not appearing?
1. Go to admin panel
2. Check if products are added
3. Check product category matches page you're viewing
4. Check browser console for errors (F12)

### Database connection error?
1. Verify Supabase URL and key in `.env`
2. Make sure SQL setup completed successfully
3. Check Supabase project is active (not paused)

### Admin panel not loading?
1. Clear browser cache
2. Check browser console for errors (F12)
3. Restart dev server

---

## 🎉 You're Ready!

Your Kustom Koats website is now fully set up with:

✅ Fresh database  
✅ Professional admin panel  
✅ Product management  
✅ Order tracking  
✅ Review moderation  
✅ Real-time updates  

Start adding your automotive pearl products and customize your website!

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify all setup steps were completed
3. Make sure Supabase project is active
4. Check `.env` file has correct credentials

---

**Happy Selling! 🚗✨**
