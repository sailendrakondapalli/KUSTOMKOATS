# Testing Category Showcase Feature

## Quick Test Checklist

### 1. Database Setup ✓
- [ ] Run migration037.sql in Supabase SQL Editor
- [ ] Verify `category_showcase` table exists

### 2. Backend API ✓
- [ ] Backend server starts without errors
- [ ] Can access `GET /api/category-showcase` (should return empty array initially)

### 3. Homepage (Before Admin Setup) ✓
- [ ] Visit homepage
- [ ] Verify category showcase section shows most recent products
- [ ] Verify images display correctly
- [ ] Verify clicking cards goes to product pages

### 4. Admin Panel Access ✓
- [ ] Login to admin panel
- [ ] Find "Category Showcase" in sidebar navigation
- [ ] Click to access the page
- [ ] Page loads without errors

### 5. Admin Functionality ✓
- [ ] See all three categories (Xtreme Kolorz, Xtreme Wrap, Accessories)
- [ ] See "Automatic (Most Recent)" status initially
- [ ] See list of products below
- [ ] Search functionality works
- [ ] Category filter works

### 6. Set Showcase Product ✓
- [ ] Click "Set for [Category]" on any product
- [ ] See success message
- [ ] Category card updates to show "Custom Selection"
- [ ] Product image, name, and price display

### 7. Homepage (After Admin Setup) ✓
- [ ] Visit homepage
- [ ] Verify selected product appears in category showcase
- [ ] Verify image displays correctly
- [ ] Verify clicking goes to that specific product page

### 8. Remove Showcase ✓
- [ ] In admin panel, click "Revert to Automatic"
- [ ] See success message
- [ ] Category card shows "Automatic (Most Recent)" again
- [ ] Homepage reverts to showing most recent product

### 9. Multiple Categories ✓
- [ ] Set different products for all three categories
- [ ] Verify all three show on homepage correctly
- [ ] Verify each links to correct product page

### 10. Edge Cases ✓
- [ ] Try setting product from wrong category (should still work)
- [ ] Try accessing admin page without login (should redirect)
- [ ] Try setting showcase via API without auth (should fail)

## Manual API Testing

### Test 1: Get All Showcases (Public)
```bash
curl http://localhost:3001/api/category-showcase
```
Expected: `{"success":true,"data":[]}`

### Test 2: Get Specific Category (Public)
```bash
curl http://localhost:3001/api/category-showcase/Xtreme%20Kolorz
```
Expected: `{"success":true,"data":null}` (if not set yet)

### Test 3: Set Showcase (Admin - requires token)
1. Login to get token
2. Find a product ID from products table
3. Run:
```bash
curl -X POST http://localhost:3001/api/category-showcase \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"category":"Xtreme Kolorz","product_id":"YOUR_PRODUCT_ID"}'
```
Expected: `{"success":true,"message":"Category showcase updated for Xtreme Kolorz","data":{...}}`

### Test 4: Remove Showcase (Admin - requires token)
```bash
curl -X DELETE http://localhost:3001/api/category-showcase/Xtreme%20Kolorz \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Expected: `{"success":true,"message":"Category showcase removed for Xtreme Kolorz, reverted to automatic"}`

## Common Issues & Solutions

### Issue: Migration fails
**Solution**: Check if `products` table exists. The foreign key requires it.

### Issue: Admin page shows no products
**Solution**: Verify products exist in database and API endpoint `/api/products` works

### Issue: Homepage still shows old products
**Solution**: Clear browser cache or do a hard refresh (Ctrl+Shift+R)

### Issue: "Not allowed by CORS" error
**Solution**: Check frontend URL is in `allowedOrigins` in server.js

### Issue: 401 Unauthorized in admin panel
**Solution**: Re-login to get fresh auth token

### Issue: Product image not displaying
**Solution**: Verify image URLs are valid in products table

## Success Criteria

✅ Admin can select products for each category
✅ Selected products appear on homepage
✅ Clicking category cards goes to correct product pages
✅ Can revert to automatic selection
✅ Works for all three categories
✅ Fallback to automatic works if no selection
✅ No errors in browser console
✅ No errors in backend logs
