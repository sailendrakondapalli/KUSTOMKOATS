# Frontend Supabase to Backend API Migration Progress

## Completed Files ✅

### Services (3/9)
- ✅ `services/addressService.js` - Migrated to use api.profile methods
- ✅ `services/orderService.js` - Migrated to use api.orders methods  
- ✅ `services/promoService.js` - Migrated to use api.promo methods
- ❌ `services/settingsService.js`
- ❌ `services/storageService.js`
- ❌ `services/notificationService.js`
- ❌ `services/posService.js`
- ⚠️ `services/ewayBillService.js` - Keep as-is (edge function)
- ⚠️ `services/shiprocketService.js` - Keep as-is (edge function)

### Stores (0/3)
- ❌ `store/authStore.js` - Keep supabase.auth calls
- ❌ `store/adminStore.js`
- ❌ `store/categoryStore.js`

### Components (0/3)
- ❌ `components/Footer.jsx`
- ❌ `components/RelatedBundles.jsx`
- ❌ `components/ReviewsSection.jsx`

### Pages (0/17)
- ❌ All 17 page files pending

### Utils (0/2)
- ❌ `utils/wholesaleUtils.js`
- ⚠️ `utils/testRazorpay.js` - Test file

## Next Steps
Continue migrating remaining files systematically.

## Notes
- Files marked ⚠️ can stay as-is (use Supabase edge functions or auth)
- Auth operations using `supabase.auth.*` should remain unchanged
- Real-time subscriptions need alternative solutions (polling or webhooks)
