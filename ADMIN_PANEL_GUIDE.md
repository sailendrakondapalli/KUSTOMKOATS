# 🎨 Kustom Koats Admin Panel Guide

## 📍 Access Your Admin Dashboard
**URL:** `http://localhost:5173/admin`  
**Authentication:** No password required (as requested)

---

## 🎯 What You Can Manage

Your admin panel now controls ALL the dynamic content on your Kustom Koats website!

### 1. 📦 **Products Management**
**Tab:** Products

**What You Can Do:**
- ✅ Add new automotive pearl products
- ✅ Edit product details (name, description, price, images)
- ✅ Update stock levels
- ✅ Set categories (Xtreme Kolorz, Xtreme Wrap, Accessories)
- ✅ Add multiple product images via URLs
- ✅ Delete products

**Where Products Appear on Website:**
- Homepage → Kustom Signature Series section (3rd section)
- `/shop` → All products page with filters
- `/shop/xtreme-kolorz` → Xtreme Kolorz category page
- `/shop/xtreme-wrap` → Xtreme Wrap category page
- `/shop/accessories` → Accessories category page
- `/products/:id` → Individual product detail pages

**Real-time Updates:** ✅ Changes appear instantly on all pages!

---

### 2. 🛒 **Orders Management**
**Tab:** Orders

**What You Can Do:**
- ✅ View all customer orders
- ✅ See order details (ID, total amount, date, items)
- ✅ **Change order status** with dropdown:
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- ✅ Track order dates and amounts
- ✅ View number of items per order

**Where This Affects Website:**
- Customer order tracking pages
- Order confirmation emails (if configured)
- Customer order history

**Real-time Updates:** ✅ Status changes update immediately!

---

### 3. ⭐ **Reviews/Testimonials Management**
**Tab:** Reviews

**What You Can Do:**
- ✅ View all customer reviews (approved and pending)
- ✅ See customer names, emails (for anonymous reviews)
- ✅ View star ratings (1-5 stars)
- ✅ Read full review text
- ✅ **Approve or unapprove reviews** with one click
- ✅ Delete inappropriate reviews
- ✅ Track review submission dates

**Review Approval System:**
- 🟡 **Pending:** Review submitted but not visible on website yet
- 🟢 **Approved:** Review is live and visible to all visitors
- Click status badge to toggle between Pending/Approved

**Where Reviews Appear on Website:**
- Homepage → Reviews section (testimonials carousel)
- Testimonials page
- Any page with ReviewsSection component

**Real-time Updates:** ✅ Approval/deletion reflects instantly!

---

### 4. 🎫 **Promo Codes Management**
**Tab:** Promo Codes

**What You Can Do:** (Coming soon)
- Create discount codes
- Set percentage or flat discounts
- Configure minimum order amounts
- Set expiration dates
- Toggle active/inactive status

---

### 5. ⚙️ **Site Settings**
**Tab:** Site Settings

**What You Can Manage:** (Coming soon)
- Hero video URL
- Banner images
- Feature highlights
- Site-wide announcements
- Homepage content configuration

---

## 🎨 Admin Panel Design

**Branding:** Kustom Koats Theme
- **Header:** Black background (#000000) with white text
- **Action Buttons:** Red (#FF0000) with hover effects
- **Tables:** Black headers with white data rows
- **Fonts:**
  - Bebas Neue for "KUSTOM KOATS ADMIN" title
  - Inter for all form inputs and data
  - Courier New for IDs

**Navigation:**
- Clean tab-based interface
- Icon indicators for each section
- Active tab highlighted in red
- Smooth transitions between sections

---

## 📊 Current Database Structure

Your website uses these main tables:

### **products**
```
- id (UUID)
- name
- description
- price
- original_price (optional, for discounts)
- category (Xtreme Kolorz | Xtreme Wrap | Accessories)
- stock
- images (array of URLs)
- tags (array)
- created_at
```

### **orders**
```
- id (UUID)
- user_id
- total_amount
- payment_status
- order_status (pending | confirmed | processing | shipped | delivered | cancelled)
- display_order_id
- created_at
+ Relationships: order_items, products
```

### **testimonials** (reviews)
```
- id (UUID)
- user_id (nullable for anonymous reviews)
- name (customer name)
- guest_email (for anonymous reviewers)
- rating (1-5 stars)
- review (text content)
- is_approved (true/false)
- is_active (true/false)
- created_at
```

### **promo_codes**
```
- id (UUID)
- code
- discount_type (percentage | flat)
- discount_value
- min_order_amount
- is_active
- expires_at
- created_at
```

---

## 🚀 Quick Start Guide

### Adding Your First Product:
1. Go to `http://localhost:5173/admin`
2. Click "**Add Product**" button (red button, top right)
3. Fill in product details:
   - Product Name (e.g., "Pearl Red Metallic")
   - Description
   - Price (₹2999)
   - Original Price (optional, for showing discounts)
   - Category (select from dropdown)
   - Stock quantity
   - Add image URLs (click "+ Add Image URL" for multiple images)
4. Click "**Create Product**"
5. Product appears instantly on your website!

### Managing Orders:
1. Go to admin → **Orders** tab
2. View all customer orders in the table
3. Click the status dropdown for any order
4. Select new status (e.g., change "Confirmed" to "Shipped")
5. Customer sees updated status immediately!

### Approving Reviews:
1. Go to admin → **Reviews** tab
2. See all reviews with their approval status
3. Click on **"Pending"** badge to approve
4. Click on **"Approved"** badge to unapprove
5. Review visibility changes instantly on website!
6. Click trash icon to delete any review

---

## ✅ Features Summary

| Feature | Status | Real-time Updates |
|---------|--------|-------------------|
| Products Management | ✅ Complete | ✅ Yes |
| Orders Management | ✅ Complete | ✅ Yes |
| Reviews Management | ✅ Complete | ✅ Yes |
| Promo Codes | 🚧 Coming Soon | - |
| Site Settings | 🚧 Coming Soon | - |

---

## 🔗 Important Links

- **Admin Dashboard:** http://localhost:5173/admin
- **Website Homepage:** http://localhost:5173/
- **Shop Page:** http://localhost:5173/shop
- **Product Categories:**
  - Xtreme Kolorz: http://localhost:5173/shop/xtreme-kolorz
  - Xtreme Wrap: http://localhost:5173/shop/xtreme-wrap
  - Accessories: http://localhost:5173/shop/accessories

---

## 💡 Pro Tips

1. **Image URLs:** Use high-quality product images. You can upload to Supabase storage or use external URLs.

2. **Product Stock:** Set realistic stock numbers. Stock automatically reduces when orders are placed.

3. **Review Moderation:** Always review testimonials before approving to maintain quality.

4. **Order Status Updates:** Keep customers informed by updating order statuses promptly.

5. **Categories:** Use exact category names:
   - "Xtreme Kolorz" (for automotive pearls)
   - "Xtreme Wrap" (for wraps and films)
   - "Accessories" (for related products)

---

## 🆘 Need Help?

All changes in the admin panel sync with your Supabase database in real-time. If something doesn't appear:

1. Check your browser console for errors
2. Verify your `.env` file has correct Supabase credentials
3. Ensure the dev server is running (`npm run dev`)
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

**Happy Managing! 🎨✨**

Your Kustom Koats website is now fully manageable from one central admin panel!
