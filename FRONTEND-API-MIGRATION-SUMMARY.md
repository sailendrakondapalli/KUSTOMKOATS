# Frontend Supabase to Backend API Migration Summary

## Overview
This document tracks the migration of 35 frontend files from direct Supabase calls to backend API routes.

## Backend Routes Status
✅ All required backend routes exist:
- `/api/auth` - Authentication
- `/api/products` - Products CRUD
- `/api/cart` - Cart operations
- `/api/orders` - Order management
- `/api/profile` - User profile & addresses
- `/api/content` - CMS content (blog, testimonials, FAQs, etc.)
- `/api/bundles` - Product bundles
- `/api/reviews` - Product reviews
- `/api/search` - Search functionality
- `/api/promo` - Promo codes
- `/api/wholesale` - Wholesale applications
- `/api/wishlist` - Wishlist
- `/api/storage` - File uploads
- `/api/payment-failures` - Payment failure tracking

## Migration Strategy
Replace all `supabase.from()`, `supabase.functions.invoke()`, `supabase.storage` calls with corresponding API client methods from `services/apiClient.js`.

## Files to Migrate (35 total)

### Services Layer (9 files) - HIGH PRIORITY
1. ❌ `services/addressService.js` → Use `api.profile.getAddresses()`, `api.profile.addAddress()`, etc.
2. ❌ `services/orderService.js` → Use `api.orders.create()`, `api.orders.get()`, etc.
3. ❌ `services/promoService.js` → Use `api.promo.validate()`, `api.promo.apply()`
4. ❌ `services/settingsService.js` → Use `api.content.getSetting()`, `api.content.updateSetting()`
5. ❌ `services/storageService.js` → Use `api.storage.upload()`, `api.storage.getPublicUrl()`
6. ❌ `services/notificationService.js` → Create backend `/api/notifications` route first
7. ❌ `services/posService.js` → Use `api.orders` methods
8. ❌ `services/ewayBillService.js` → Create backend `/api/eway-bill` route or keep as-is (edge function)
9. ❌ `services/shiprocketService.js` → Keep as-is (uses Supabase edge functions for external API)

### Stores (3 files) - HIGH PRIORITY
10. ❌ `store/authStore.js` → Keep `supabase.auth` calls (auth stays with Supabase)
11. ❌ `store/adminStore.js` → Use various `api.*` methods
12. ❌ `store/categoryStore.js` → Use `api.content.getCategories()`

### Components (3 files)
13. ❌ `components/Footer.jsx` → Use `api.content.getFooterLinks()`
14. ❌ `components/RelatedBundles.jsx` → Use `api.bundles.getById()`
15. ❌ `components/ReviewsSection.jsx` → Use `api.reviews` methods (need to add to apiClient)

### Pages (17 files)
16. ❌ `pages/AuthCallbackPage.jsx` → Keep `supabase.auth` (auth flow)
17. ❌ `pages/BlogPostPage.jsx` → Use `api.content.getBlogPost()`
18. ❌ `pages/CheckoutPage.jsx` → Use `api.orders`, `api.storage`, `api.paymentFailures`
19. ❌ `pages/ContactPage.jsx` → Create `api.contact.submit()` endpoint
20. ❌ `pages/EnquiryPage.jsx` → Create `api.enquiry.submit()` endpoint
21. ❌ `pages/EventsPage.jsx` → Use `api.content.getEvents()`
22. ❌ `pages/FAQPage.jsx` → Use `api.content.getFAQs()`
23. ❌ `pages/GalleryPage.jsx` → Use `api.content.getGallery()`
24. ❌ `pages/KustomKultorPage.jsx` → Use `api.content.getBlogPosts()`
25. ❌ `pages/OrderDetailPage.jsx` → Use `api.orders.get()`
26. ❌ `pages/OrdersPage.jsx` → Use `api.orders.getAll()` + remove realtime subscription
27. ❌ `pages/OrderSuccessPage.jsx` → Use `api.orders.get()`
28. ❌ `pages/PackagesPage.jsx` → Use `api.content` or `api.bundles`
29. ❌ `pages/PolicyPage.jsx` → Use `api.content.getPolicyPage()`
30. ❌ `pages/ProductDetailPage.jsx` → Use `api.products.getById()`
31. ❌ `pages/TestimonialsPage.jsx` → Use `api.content.getTestimonials()`

### Utils (2 files)
32. ❌ `utils/wholesaleUtils.js` → Use `api.wholesale` methods
33. ⚠️ `utils/testRazorpay.js` → Test file (can keep or update)

### Lib (2 files)
34. ⚠️ `lib/supabase.js` → Keep for auth only
35. ⚠️ `lib/apiClient.js` → Already uses backend API (needs minor auth fix)

## Missing API Methods in apiClient.js
Need to add to `services/apiClient.js`:
- ✅ reviews API (already has placeholder)
- ❌ notifications API
- ❌ contact form API
- ❌ enquiry form API  
- ❌ events API
- ❌ gallery API
- ❌ settings API extensions

## Quick Fix Pattern

### Before (Supabase):
```javascript
import { supabase } from '../lib/supabase'

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('field', value)

if (error) throw error
return data
```

### After (Backend API):
```javascript
import api from '../services/apiClient'

const response = await api.resource.method(params)
return response.data
```

## Implementation Priority
1. **Phase 1**: Fix `services/apiClient.js` to add missing API methods
2. **Phase 2**: Migrate all service layer files (9 files)
3. **Phase 3**: Migrate store files (3 files)
4. **Phase 4**: Migrate pages (17 files)
5. **Phase 5**: Migrate components (3 files)
6. **Phase 6**: Migrate utils (2 files)
7. **Phase 7**: Final cleanup and testing

## Notes
- Auth operations (`supabase.auth.*`) should remain unchanged
- Supabase Edge Functions for external APIs (Shiprocket, EwayBill) can stay as-is
- Real-time subscriptions need to be removed or replaced with polling
- All error handling should use try/catch with toast notifications
