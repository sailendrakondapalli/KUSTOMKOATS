# Backend Setup & Migration Checklist

Use this checklist to track your progress setting up and migrating to the backend API.

## Phase 1: Initial Setup ⚙️

### Backend Configuration
- [ ] Navigate to `backend/` directory
- [ ] Run `npm install` (already done ✅)
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Navigate to Settings → API
- [ ] Copy the **service_role** key (NOT anon key)
- [ ] Open `backend/.env`
- [ ] Replace `YOUR_SERVICE_ROLE_KEY_HERE` with actual key
- [ ] Verify all other env variables are correct
- [ ] Save the file

### Start Backend Server
- [ ] Open terminal in `backend/` directory
- [ ] Run `npm run dev`
- [ ] Verify server starts without errors
- [ ] See success message with ASCII art

### Test Backend
- [ ] Open new terminal
- [ ] Test health check: `curl http://localhost:3001/health`
- [ ] Should return `{"status":"ok",...}`
- [ ] Test products: `curl http://localhost:3001/api/products`
- [ ] Should return product data from database

### Frontend Configuration
- [ ] Open `KUSTOMKOATS/.env`
- [ ] Verify `VITE_API_URL=http://localhost:3001/api` is present (already done ✅)
- [ ] Start frontend: `npm run dev`
- [ ] Check browser console for errors
- [ ] No CORS errors should appear

## Phase 2: Test All Endpoints 🧪

### Authentication Endpoints
- [ ] Test POST `/api/auth/register` - Register new user
- [ ] Test POST `/api/auth/login` - Login user
- [ ] Test GET `/api/auth/me` - Get current user (with token)
- [ ] Test PUT `/api/auth/profile` - Update profile (with token)
- [ ] Test POST `/api/auth/logout` - Logout

### Product Endpoints
- [ ] Test GET `/api/products` - Get all products
- [ ] Test GET `/api/products/:id` - Get single product
- [ ] Test POST `/api/products` - Create product (admin only)
- [ ] Test PUT `/api/products/:id` - Update product (admin only)
- [ ] Test DELETE `/api/products/:id` - Delete product (admin only)

### Order Endpoints
- [ ] Test GET `/api/orders/my-orders` - Get user orders
- [ ] Test GET `/api/orders` - Get all orders (admin)
- [ ] Test GET `/api/orders/:id` - Get single order
- [ ] Test POST `/api/orders` - Create order
- [ ] Test PATCH `/api/orders/:id/status` - Update status (admin)

### Promo Code Endpoints
- [ ] Test POST `/api/promo/validate` - Validate promo code
- [ ] Test GET `/api/promo` - Get all promo codes (admin)
- [ ] Test POST `/api/promo` - Create promo code (admin)
- [ ] Test PUT `/api/promo/:id` - Update promo code (admin)
- [ ] Test DELETE `/api/promo/:id` - Delete promo code (admin)

### Wholesale Endpoints
- [ ] Test POST `/api/wholesale/apply` - Submit application
- [ ] Test GET `/api/wholesale/applications` - Get applications (admin)
- [ ] Test PATCH `/api/wholesale/applications/:id` - Update application (admin)
- [ ] Test GET `/api/wholesale/customers` - Get customers (admin)

### Storage Endpoints
- [ ] Test POST `/api/storage/upload-url` - Get upload URL
- [ ] Test POST `/api/storage/download-url` - Get download URL
- [ ] Test POST `/api/storage/public-url` - Get public URL
- [ ] Test DELETE `/api/storage` - Delete files (admin)
- [ ] Test GET `/api/storage/:bucket` - List files (admin)

## Phase 3: Migrate Frontend Services 🔄

### Authentication Service
- [ ] Read `src/store/authStore.js`
- [ ] Replace Supabase auth calls with `authAPI` calls
- [ ] Update register function
- [ ] Update login function
- [ ] Update logout function
- [ ] Update get profile function
- [ ] Update update profile function
- [ ] Test login/logout flow
- [ ] Test registration
- [ ] Test profile updates

### Product Service
- [ ] Read `src/services/productService.js` (if exists)
- [ ] Replace Supabase calls with `productsAPI` calls
- [ ] Update get all products
- [ ] Update get product by ID
- [ ] Update search functionality
- [ ] Update category filtering
- [ ] Test product listing page
- [ ] Test product detail page
- [ ] Test search functionality
- [ ] Admin: Test product creation
- [ ] Admin: Test product updates
- [ ] Admin: Test product deletion

### Order Service
- [ ] Read `src/services/orderService.js`
- [ ] Replace Supabase calls with `ordersAPI` calls
- [ ] Update get user orders
- [ ] Update get order details
- [ ] Update create order function
- [ ] Test checkout process
- [ ] Test order creation
- [ ] Test order history page
- [ ] Test order detail page
- [ ] Admin: Test order management
- [ ] Admin: Test status updates

### Promo Code Service
- [ ] Read `src/services/promoService.js`
- [ ] Replace Supabase calls with `promoAPI` calls
- [ ] Update promo validation
- [ ] Test promo code input
- [ ] Test promo application
- [ ] Test invalid promo codes
- [ ] Test expired promo codes
- [ ] Admin: Test promo management

### Wholesale Service
- [ ] Find wholesale application form
- [ ] Replace Supabase calls with `wholesaleAPI` calls
- [ ] Update application submission
- [ ] Test wholesale form
- [ ] Admin: Test application listing
- [ ] Admin: Test application approval
- [ ] Admin: Test application rejection

### Storage Service
- [ ] Find image upload components
- [ ] Replace Supabase storage calls with `storageAPI` calls
- [ ] Update product image uploads
- [ ] Update avatar uploads
- [ ] Test image uploads
- [ ] Test image deletion
- [ ] Test image display

## Phase 4: Update Components 🎨

### Public Components
- [ ] Update HomePage product fetching
- [ ] Update ProductsPage product listing
- [ ] Update ProductDetailPage product display
- [ ] Update CartPage
- [ ] Update CheckoutPage
- [ ] Update WholesalePage form submission

### User Components
- [ ] Update ProfilePage
- [ ] Update OrdersPage
- [ ] Update OrderDetailPage
- [ ] Update WishlistPage (if applicable)

### Admin Components
- [ ] Update AdminProductsPage
- [ ] Update AdminOrdersPage
- [ ] Update AdminPromoCodesPage
- [ ] Update AdminWholesalePage
- [ ] Update AdminDashboard

## Phase 5: Testing 🧪

### Functional Testing
- [ ] **Public Features**
  - [ ] Browse products
  - [ ] View product details
  - [ ] Search products
  - [ ] Filter by category
  - [ ] View cart
  - [ ] Submit wholesale application

- [ ] **User Features**
  - [ ] Register account
  - [ ] Login
  - [ ] View profile
  - [ ] Update profile
  - [ ] Add to cart
  - [ ] Apply promo code
  - [ ] Checkout
  - [ ] View orders
  - [ ] View order details
  - [ ] Logout

- [ ] **Admin Features**
  - [ ] Login as admin
  - [ ] View dashboard
  - [ ] Create product
  - [ ] Update product
  - [ ] Delete product
  - [ ] View all orders
  - [ ] Update order status
  - [ ] Create promo code
  - [ ] View wholesale applications
  - [ ] Approve/reject applications

### Security Testing
- [ ] Try accessing admin endpoints without auth
- [ ] Try accessing admin endpoints with regular user token
- [ ] Try invalid JWT tokens
- [ ] Try SQL injection in inputs
- [ ] Try XSS attacks in inputs
- [ ] Verify no credentials in frontend code
- [ ] Verify no credentials in browser network tab

### Performance Testing
- [ ] Check response times for product listing
- [ ] Check response times for order creation
- [ ] Check response times for image uploads
- [ ] Monitor backend logs for slow queries
- [ ] Check for memory leaks

## Phase 6: Cleanup 🧹

### Remove Old Code
- [ ] Comment out old Supabase direct calls (don't delete yet)
- [ ] Keep backups of original files
- [ ] Remove unused imports
- [ ] Update documentation

### Remove Sensitive Data from Frontend
- [ ] Remove Shiprocket credentials from frontend `.env`
- [ ] Verify only these remain in frontend `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`
  - `VITE_RAZORPAY_KEY_ID`
  - `VITE_ADMIN_EMAIL`

### Code Review
- [ ] Review all changed files
- [ ] Check for console.log statements
- [ ] Check for TODO comments
- [ ] Verify error handling
- [ ] Check code formatting

## Phase 7: Production Preparation 🚀

### Backend Deployment
- [ ] Choose hosting provider (Railway/Render/Vercel/etc.)
- [ ] Create new project/app
- [ ] Connect to Git repository
- [ ] Set build command
- [ ] Set start command
- [ ] Add environment variables
- [ ] Deploy backend
- [ ] Test production backend URL

### Frontend Configuration
- [ ] Create `.env.production`
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Verify all env variables are correct
- [ ] Build frontend: `npm run build`
- [ ] Test production build locally: `npm run preview`

### Production Testing
- [ ] Test all endpoints on production backend
- [ ] Test frontend with production backend
- [ ] Check for CORS errors
- [ ] Check for SSL/HTTPS issues
- [ ] Test authentication flow
- [ ] Test order creation
- [ ] Test payment processing
- [ ] Test image uploads

### Monitoring Setup
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure alerts for errors
- [ ] Configure alerts for downtime

## Phase 8: Documentation 📚

### Update Documentation
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document common issues
- [ ] Document rollback procedure

### Team Communication
- [ ] Notify team of new architecture
- [ ] Share API documentation
- [ ] Share deployment guide
- [ ] Schedule training session (if needed)

## Phase 9: Monitoring & Optimization 📊

### Week 1 After Launch
- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Check user feedback
- [ ] Fix any critical bugs
- [ ] Optimize slow endpoints

### Month 1 After Launch
- [ ] Review performance metrics
- [ ] Identify bottlenecks
- [ ] Plan optimizations
- [ ] Consider caching strategy
- [ ] Consider rate limiting

## Emergency Rollback Plan 🆘

If something goes wrong:

### Quick Rollback
- [ ] Stop backend server
- [ ] Revert frontend to use direct Supabase calls
- [ ] Restore original `.env` files
- [ ] Deploy previous frontend version
- [ ] Notify users (if necessary)

### Investigation
- [ ] Check backend logs
- [ ] Check frontend console errors
- [ ] Check Supabase logs
- [ ] Identify root cause
- [ ] Fix issue
- [ ] Test thoroughly
- [ ] Redeploy

## Progress Tracking

### Overall Progress
```
[ ] Phase 1: Initial Setup (0/4 sections)
[ ] Phase 2: Test Endpoints (0/6 sections)
[ ] Phase 3: Migrate Services (0/6 services)
[ ] Phase 4: Update Components (0/3 groups)
[ ] Phase 5: Testing (0/3 types)
[ ] Phase 6: Cleanup (0/3 sections)
[ ] Phase 7: Production (0/4 sections)
[ ] Phase 8: Documentation (0/2 sections)
[ ] Phase 9: Monitoring (0/2 periods)
```

### Completion Percentage
```
Total Tasks: ~150
Completed: ___
Percentage: ____%
```

---

## 🎉 Completion Criteria

You've successfully completed the migration when:

✅ All frontend services use backend API  
✅ No direct Supabase calls from frontend  
✅ All tests passing  
✅ Production deployment working  
✅ No security vulnerabilities  
✅ Performance meets requirements  
✅ Team is trained and ready  
✅ Documentation is complete  

---

**Current Status**: Ready to begin Phase 1

**Next Step**: Get your Supabase service role key and configure `backend/.env`

Good luck! 🚀
