# Admin Route Protection Guide

## Overview
This guide explains how to protect admin routes and configure admin access for your Kustom Koats application.

## What Was Created

### 1. ProtectedAdminRoute Component
**File:** `frontend/src/components/ProtectedAdminRoute.jsx`

**Features:**
- ✅ Checks if user is logged in
- ✅ Verifies admin role from user metadata
- ✅ Redirects non-admins to homepage
- ✅ Redirects non-logged users to login page
- ✅ Shows loading state while checking
- ✅ Displays error toasts for access denial

### 2. App.jsx Updates
**File:** `frontend/src/App.jsx`

**Changes:**
- ✅ Imported `ProtectedAdminRoute` component
- ✅ Wrapped `/admin` and `/admin/products` routes (example)
- ⚠️ **TODO:** Wrap ALL remaining admin routes

## How to Complete Protection

### Step 1: Wrap All Admin Routes

You need to wrap EVERY admin route with `<ProtectedAdminRoute>`. 

**Current state:**
- `/admin` - ✅ Protected
- `/admin/products` - ✅ Protected
- Other routes - ❌ NOT Protected

**Example of protected route:**
```jsx
<Route path="/admin/orders" element={
  <ProtectedAdminRoute>
    <ErrorBoundary>
      <Suspense fallback={<AdminLoader />}>
        <AdminOrdersPage />
      </Suspense>
    </ErrorBoundary>
  </ProtectedAdminRoute>
} />
```

**All routes to protect:**
1. `/admin/orders`
2. `/admin/payment-failures`
3. `/admin/categories`
4. `/admin/customers`
5. `/admin/wholesale`
6. `/admin/blog`
7. `/admin/promo-codes`
8. `/admin/testimonials`
9. `/admin/page-content`
10. `/admin/faqs`
11. `/admin/footer-links`
12. `/admin/erp`
13. `/admin/pos`
14. `/admin/transactions`
15. `/admin/bundles`
16. `/admin/eway-bill`
17. `/admin/settings`
18. `/admin/category-showcase`

### Step 2: Configure Admin Users

There are 3 methods to grant admin access:

#### Method 1: Email-based (Quick & Easy)
Edit `ProtectedAdminRoute.jsx` line 24:
```javascript
user.email === 'your-admin@email.com'
```

**How it works:**
- Any user with this exact email gets admin access
- Good for quick setup
- Not recommended for production with multiple admins

#### Method 2: User Metadata (Recommended)
Set admin role in Supabase dashboard:

1. Go to Supabase Dashboard
2. Navigate to **Authentication → Users**
3. Click on a user
4. Scroll to **User Metadata**
5. Click "Edit"
6. Add:
   ```json
   {
     "role": "admin"
   }
   ```
7. Save

**How it works:**
- Checks `user.user_metadata.role === 'admin'`
- Secure and scalable
- Can manage multiple admins

#### Method 3: Database Table (Most Secure)
Create an `admin_users` table:

**SQL to run in Supabase:**
```sql
-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin list
CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Add first admin (replace with your user ID)
INSERT INTO admin_users (user_id) 
VALUES ('your-user-id-here');
```

**Then uncomment in `ProtectedAdminRoute.jsx` (lines 27-31):**
```javascript
const { data, error } = await supabase
  .from('admin_users')
  .select('id')
  .eq('user_id', user.id)
  .single();

if (data && !error) {
  setIsAdmin(true);
}
```

## How to Access Admin Panel

### For Development (Local)

1. **Start your application**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login with admin account**
   - Go to `http://localhost:5173/login`
   - Login with your admin email
   - If using Method 1, use the email you configured

3. **Navigate to admin**
   - After login, go to `http://localhost:5173/admin`
   - Or click any admin link if you add them to your site

### For Production

1. **Setup admin user first** (use one of the 3 methods above)

2. **Login**
   - Go to `https://www.kustomkoats.com/login`
   - Login with admin credentials

3. **Access admin panel**
   - Direct URL: `https://www.kustomkoats.com/admin`
   - Or add admin link to your site

### Creating an Admin Link in Your Site

**Option 1: Hidden Link in Footer (Recommended)**
Add to `Footer.jsx`:
```jsx
{user && user.email === 'admin@kustomkoats.com' && (
  <Link to="/admin" className="text-xs text-gray-400 hover:text-[#CA2A31]">
    Admin Panel
  </Link>
)}
```

**Option 2: Direct URL**
Admins can bookmark: `https://www.kustomkoats.com/admin`

**Option 3: Profile Menu**
Add admin link to user profile dropdown if logged in as admin

## Security Best Practices

### ✅ DO:
1. Use HTTPS in production (already done with Vercel)
2. Use Method 2 or 3 for production
3. Keep admin emails private
4. Use strong passwords for admin accounts
5. Enable 2FA in Supabase for admin users
6. Regularly audit admin access
7. Protect ALL admin routes (complete Step 1)

### ❌ DON'T:
1. Hardcode admin emails in production code
2. Share admin credentials
3. Leave admin routes unprotected
4. Use simple/common passwords
5. Commit admin emails to GitHub

## Testing

### Test Admin Access
1. ✅ Login as admin → Should access `/admin`
2. ✅ Login as regular user → Should redirect to home
3. ✅ Not logged in → Should redirect to login
4. ✅ Try accessing `/admin/orders` → Should check protection
5. ✅ Error toasts display correctly

### Test All Routes
After completing Step 1, test each route:
```
/admin → Protected ✓
/admin/products → Protected ✓
/admin/orders → Protected ✓
/admin/settings → Protected ✓
... (test all 18 routes)
```

## Troubleshooting

### "Access denied" even though I'm admin
**Solutions:**
1. Check user metadata in Supabase dashboard
2. Verify email matches in Method 1
3. Clear browser cache and re-login
4. Check browser console for errors

### "Cannot read property 'email' of null"
**Solution:**
- Not logged in. Go to `/login` first

### Admin routes still accessible by non-admins
**Solution:**
- Complete Step 1 - wrap ALL routes with `<ProtectedAdminRoute>`
- Check that you imported the component correctly

### How to find my user ID for Method 3
1. Login to your app
2. Open browser console
3. Run:
   ```javascript
   supabase.auth.getUser().then(d => console.log(d.data.user.id))
   ```
4. Copy the UUID shown

## Quick Setup Checklist

- [ ] ✅ `ProtectedAdminRoute.jsx` created
- [ ] ✅ Imported in `App.jsx`
- [ ] ⚠️  Wrapped 2 routes (need to wrap 16 more)
- [ ] ❌ Chosen admin method (1, 2, or 3)
- [ ] ❌ Configured admin user
- [ ] ❌ Tested admin access
- [ ] ❌ Tested non-admin block
- [ ] ❌ Wrapped ALL 18 admin routes

## Next Steps

1. **Complete Route Protection** (Priority!)
   - Wrap all 18 admin routes in `App.jsx`
   - Use the example pattern shown above

2. **Configure Admin User**
   - Choose Method 1, 2, or 3
   - Set up at least one admin account

3. **Test Thoroughly**
   - Test as admin
   - Test as regular user
   - Test without login

4. **Add Admin Link** (Optional)
   - Add hidden link in footer or profile menu

5. **Document Admin Emails**
   - Keep secure list of admin emails
   - Share with team securely

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify user metadata in Supabase
3. Test with different browsers
4. Clear cache and cookies
5. Check that ALL routes are wrapped
