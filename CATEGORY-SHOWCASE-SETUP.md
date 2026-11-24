# Category Showcase Feature - Setup Guide

This feature allows admins to manually select which products are displayed in the homepage category showcase section (the second section after the hero).

## What Was Implemented

### 1. Database (Backend)
- **Migration File**: `backend/database/migrations/migration037.sql`
- Creates `category_showcase` table to store admin-selected products per category
- Run this migration in Supabase SQL Editor

### 2. Backend API
- **Route File**: `backend/routes/category-showcase.js`
- **Endpoints**:
  - `GET /api/category-showcase` - Get all showcases (public)
  - `GET /api/category-showcase/:category` - Get specific category showcase (public)
  - `POST /api/category-showcase` - Set/update showcase (admin only)
  - `DELETE /api/category-showcase/:category` - Remove showcase (admin only)
- Already registered in `server.js`

### 3. Admin Interface
- **Page**: `frontend/src/pages/admin/AdminCategoryShowcasePage.jsx`
- **Route**: `/admin/category-showcase`
- Added to admin navigation menu

### 4. Homepage Integration
- **Updated**: `frontend/src/pages/HomePage.jsx`
- `FeaturedCategoriesSection` now:
  1. First tries to fetch admin-selected products
  2. Falls back to most recent product if no admin selection
  3. Displays product image, name, and price

## Setup Instructions

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `backend/database/migrations/migration037.sql`
4. Paste and run the SQL

### Step 2: Restart Backend Server

```bash
cd backend
npm start
```

### Step 3: Access Admin Panel

1. Login to admin panel
2. Navigate to **Category Showcase** in the sidebar
3. You'll see three categories:
   - Xtreme Kolorz
   - Xtreme Wrap
   - Accessories

### Step 4: Select Products

1. Use the search/filter to find products
2. Click "Set for [Category]" button under any product
3. The selected product will now appear in that category card on the homepage
4. To revert to automatic (most recent product), click "Revert to Automatic"

## How It Works

### Without Admin Selection (Default)
- Each category shows the most recently added product from that category
- Link goes to product detail page

### With Admin Selection
- Shows the admin-selected product image and price
- Link goes to that specific product's detail page
- Admin can change or remove the selection anytime

## Files Modified/Created

### Backend
- ✅ `backend/database/migrations/migration037.sql` (NEW)
- ✅ `backend/routes/category-showcase.js` (NEW)
- ✅ `backend/server.js` (MODIFIED - added route)

### Frontend
- ✅ `frontend/src/pages/admin/AdminCategoryShowcasePage.jsx` (NEW)
- ✅ `frontend/src/pages/HomePage.jsx` (MODIFIED - FeaturedCategoriesSection)
- ✅ `frontend/src/App.jsx` (MODIFIED - added route)
- ✅ `frontend/src/components/admin/KKAdminLayout.jsx` (MODIFIED - added nav item)

## Testing

1. **Without Admin Selection**: Homepage should show most recent products (existing behavior)
2. **Set a Showcase**: Go to admin, select a product for a category
3. **Verify Homepage**: Check that the selected product appears
4. **Remove Showcase**: Remove the admin selection, verify it reverts to automatic
5. **Multiple Categories**: Set different products for different categories

## API Examples

### Get all showcases (public)
```bash
GET http://localhost:3001/api/category-showcase
```

### Set showcase (admin, requires auth token)
```bash
POST http://localhost:3001/api/category-showcase
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "category": "Xtreme Kolorz",
  "product_id": "uuid-of-product"
}
```

### Remove showcase (admin, requires auth token)
```bash
DELETE http://localhost:3001/api/category-showcase/Xtreme%20Kolorz
Authorization: Bearer YOUR_TOKEN
```

## Notes

- The feature is fully backward compatible - if no admin selections exist, it works exactly as before
- Changes are reflected immediately on the homepage
- Each category can only have one featured product at a time
- Admin authentication is required for setting/removing showcases
- The feature includes proper error handling and fallback behavior
