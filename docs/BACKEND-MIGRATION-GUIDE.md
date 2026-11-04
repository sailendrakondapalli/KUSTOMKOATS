# Backend API Migration Guide

Guide for migrating from direct Supabase calls to the new Backend API layer.

## Overview

**Before (Direct Supabase):**
```
Frontend → Supabase (exposed credentials)
```

**After (Backend API):**
```
Frontend → Backend API → Supabase (secure)
```

## Benefits

✅ **Security**: Supabase credentials hidden on backend  
✅ **Validation**: All requests validated before reaching database  
✅ **Business Logic**: Centralized logic (promo codes, order processing)  
✅ **Rate Limiting**: Protect against abuse  
✅ **Monitoring**: Track all API usage  
✅ **Flexibility**: Easier to add features or change database

## Step-by-Step Migration

### Step 1: Setup Backend Server

#### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

#### 1.2 Configure Environment Variables

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Get your SERVICE_ROLE_KEY:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy "service_role" key (NOT the anon key)

#### 1.3 Start Backend Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════╗
║   KustomKoats Backend API Server              ║
║   Running on: http://localhost:3001           ║
╚═══════════════════════════════════════════════╝
```

### Step 2: Update Frontend Configuration

#### 2.1 Add Backend URL to Frontend .env

Add to `KUSTOMKOATS/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

#### 2.2 Import API Client

The API client is already created at `src/lib/apiClient.js`. Import it where needed:

```javascript
import { productsAPI, authAPI, ordersAPI } from '@/lib/apiClient';
```

### Step 3: Migrate Services One by One

#### Example: Product Service Migration

**Before (Direct Supabase):**
```javascript
// src/services/productService.js
import { supabase } from '@/lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active');
  
  if (error) throw error;
  return data;
}
```

**After (Using Backend API):**
```javascript
// src/services/productService.js
import { productsAPI } from '@/lib/apiClient';

export async function getProducts() {
  const response = await productsAPI.getAll();
  return response.data;
}
```

### Step 4: Migration Checklist by Service

#### ✅ Authentication (src/store/authStore.js)

**Before:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
```

**After:**
```javascript
const { data } = await authAPI.login(email, password);
```

**Update all instances:**
- [ ] Login
- [ ] Register  
- [ ] Logout
- [ ] Get current user
- [ ] Update profile
- [ ] Password reset

#### ✅ Products (src/services/productService.js)

**Migration:**
```javascript
// Old
await supabase.from('products').select('*')

// New
await productsAPI.getAll()
```

**Update all instances:**
- [ ] Get all products
- [ ] Get product by ID
- [ ] Search products
- [ ] Filter by category
- [ ] Admin: Create product
- [ ] Admin: Update product
- [ ] Admin: Delete product

#### ✅ Orders (src/services/orderService.js)

**Migration:**
```javascript
// Old
await supabase.from('orders').select('*').eq('user_id', userId)

// New
await ordersAPI.getMyOrders()
```

**Update all instances:**
- [ ] Get user orders
- [ ] Get order details
- [ ] Create order
- [ ] Admin: Get all orders
- [ ] Admin: Update order status

#### ✅ Promo Codes (src/services/promoService.js)

**Migration:**
```javascript
// Old
await supabase.from('promo_codes').select('*').eq('code', code)

// New
await promoAPI.validate(code, cartTotal)
```

**Update all instances:**
- [ ] Validate promo code
- [ ] Admin: Get all promo codes
- [ ] Admin: Create promo code
- [ ] Admin: Update promo code
- [ ] Admin: Delete promo code

#### ✅ Wholesale (Wholesale Pages)

**Migration:**
```javascript
// Old
await supabase.from('wholesale_applications').insert([data])

// New
await wholesaleAPI.apply(data)
```

**Update all instances:**
- [ ] Submit wholesale application
- [ ] Admin: Get applications
- [ ] Admin: Update application status
- [ ] Admin: Get wholesale customers

#### ✅ Storage (Image Uploads)

**Migration:**
```javascript
// Old
await supabase.storage.from('products').upload(path, file)

// New
const { data } = await storageAPI.getUploadUrl('products', path);
// Then upload file to signed URL
```

**Update all instances:**
- [ ] Upload product images
- [ ] Upload avatar
- [ ] Delete files
- [ ] Get public URLs

### Step 5: Update Components

#### Example: Product List Component

**Before:**
```javascript
// src/pages/ProductsPage.jsx
import { supabase } from '@/lib/supabase';

useEffect(() => {
  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');
    
    setProducts(data);
  }
  loadProducts();
}, []);
```

**After:**
```javascript
// src/pages/ProductsPage.jsx
import { productsAPI } from '@/lib/apiClient';

useEffect(() => {
  async function loadProducts() {
    const { data } = await productsAPI.getAll();
    setProducts(data);
  }
  loadProducts();
}, []);
```

### Step 6: Test Each Feature

Create a testing checklist:

#### Public Features (No Auth)
- [ ] Browse products
- [ ] View product details
- [ ] Search products
- [ ] Filter by category
- [ ] View testimonials
- [ ] View FAQs
- [ ] Submit wholesale application

#### User Features (Auth Required)
- [ ] Register account
- [ ] Login
- [ ] View profile
- [ ] Update profile
- [ ] Add to cart
- [ ] Create order
- [ ] View orders
- [ ] View order details
- [ ] Apply promo code
- [ ] Logout

#### Admin Features (Admin Only)
- [ ] View all orders
- [ ] Update order status
- [ ] Create product
- [ ] Update product
- [ ] Delete product
- [ ] View promo codes
- [ ] Create promo code
- [ ] View wholesale applications
- [ ] Approve/reject applications

### Step 7: Remove Direct Supabase Calls

Once migration is complete and tested:

#### 7.1 Update Supabase Client (Frontend)

Keep Supabase client ONLY for auth state management:

```javascript
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ONLY use for auth, NOT for database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

#### 7.2 Update Environment Variables

**Frontend .env** - KEEP these (needed for auth):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

**Backend .env** - Use SERVICE_ROLE_KEY:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 8: Production Deployment

#### 8.1 Deploy Backend

Choose a hosting provider:
- **Railway**: Easiest, automatic deployments
- **Render**: Free tier available
- **Vercel**: Serverless functions
- **DigitalOcean/AWS**: Full control

#### 8.2 Update Production Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

#### 8.3 Test Production

- [ ] All API endpoints work
- [ ] Authentication works
- [ ] CORS configured correctly
- [ ] Error handling works
- [ ] Performance is acceptable

## Common Migration Patterns

### Pattern 1: Simple Select Query

**Before:**
```javascript
const { data } = await supabase.from('table').select('*');
```

**After:**
```javascript
const { data } = await apiClient.get('/table');
```

### Pattern 2: Insert Data

**Before:**
```javascript
const { data } = await supabase.from('table').insert([newData]);
```

**After:**
```javascript
const { data } = await apiClient.post('/table', newData);
```

### Pattern 3: Update Data

**Before:**
```javascript
const { data } = await supabase.from('table').update(updates).eq('id', id);
```

**After:**
```javascript
const { data } = await apiClient.put(`/table/${id}`, updates);
```

### Pattern 4: Delete Data

**Before:**
```javascript
await supabase.from('table').delete().eq('id', id);
```

**After:**
```javascript
await apiClient.delete(`/table/${id}`);
```

### Pattern 5: Complex Queries

**Before:**
```javascript
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**After:**
```javascript
// Backend handles the complex query
const { data } = await ordersAPI.getMyOrders();
```

## Troubleshooting

### Issue: CORS Errors

**Solution:** Verify `FRONTEND_URL` in backend `.env` matches your frontend URL exactly.

### Issue: 401 Unauthorized

**Solution:** 
1. Check that token is being sent
2. Verify token is valid
3. Check Supabase service role key is correct

### Issue: API Client Not Working

**Solution:**
```javascript
// Check API URL is set
console.log(import.meta.env.VITE_API_URL);

// Verify backend is running
curl http://localhost:3001/health
```

### Issue: Validation Errors

**Solution:** Check the API response for `details` field:
```javascript
try {
  await productsAPI.create(productData);
} catch (error) {
  console.log(error.data.details); // Validation errors here
}
```

## Rollback Plan

If you need to rollback:

1. **Keep old code commented:**
```javascript
// Old direct Supabase call (backup)
// const { data } = await supabase.from('products').select('*');

// New API call
const { data } = await productsAPI.getAll();
```

2. **Test thoroughly before deleting old code**

3. **Keep both systems running during transition**

## Next Steps

After successful migration:

1. **Add more endpoints** as needed
2. **Implement rate limiting** for production
3. **Add request logging** for monitoring
4. **Set up error tracking** (Sentry, etc.)
5. **Add API documentation** (Swagger/OpenAPI)
6. **Implement caching** for better performance

## Support

If you encounter issues during migration:

1. Check backend logs: `npm run dev` output
2. Check browser console for errors
3. Test API endpoints with Postman/Insomnia
4. Verify environment variables are correct
5. Check Supabase dashboard for database issues

---

**Migration Status: Ready to Begin**

Start with authentication, then migrate one service at a time, testing thoroughly before moving to the next.
