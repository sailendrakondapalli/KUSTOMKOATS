# Quick Guide: Wrap All Admin Routes

## Current Status
✅ 2 routes protected
❌ 16 routes need protection

## Find & Replace Pattern

Open `frontend/src/App.jsx` and do a find-and-replace for each route:

### Pattern 1: Orders Route
**Find:**
```jsx
<Route path="/admin/orders" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminOrdersPage />
                </Suspense>
              </ErrorBoundary>
            } />
```

**Replace with:**
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

## Quick Method (VS Code)

1. Open `App.jsx`
2. Find: `<Route path="/admin/`
3. For each occurrence after the first 2 (which are already done):
   - Add `<ProtectedAdminRoute>` after `element={`
   - Add `</ProtectedAdminRoute>` before the closing `} />`

## Routes to Update (Checklist)

- [x] `/admin` - Already done
- [x] `/admin/products` - Already done
- [ ] `/admin/orders`
- [ ] `/admin/payment-failures`
- [ ] `/admin/categories`
- [ ] `/admin/customers`
- [ ] `/admin/wholesale`
- [ ] `/admin/blog`
- [ ] `/admin/promo-codes`
- [ ] `/admin/testimonials`
- [ ] `/admin/page-content`
- [ ] `/admin/faqs`
- [ ] `/admin/footer-links`
- [ ] `/admin/erp`
- [ ] `/admin/pos`
- [ ] `/admin/transactions`
- [ ] `/admin/bundles`
- [ ] `/admin/eway-bill`
- [ ] `/admin/settings`
- [ ] `/admin/category-showcase`

## Example: Before & After

**BEFORE:**
```jsx
<Route path="/admin/settings" element={
  <ErrorBoundary>
    <Suspense fallback={<AdminLoader />}>
      <AdminSettingsPage />
    </Suspense>
  </ErrorBoundary>
} />
```

**AFTER:**
```jsx
<Route path="/admin/settings" element={
  <ProtectedAdminRoute>
    <ErrorBoundary>
      <Suspense fallback={<AdminLoader />}>
        <AdminSettingsPage />
      </Suspense>
    </ErrorBoundary>
  </ProtectedAdminRoute>
} />
```

## Verification

After updating, search for `/admin/` in App.jsx and verify EVERY route has `<ProtectedAdminRoute>` wrapper.

Should look like:
```
<Route path="/admin/something" element={
  <ProtectedAdminRoute>  ← Must have this
    <ErrorBoundary>
      ...
    </ErrorBoundary>
  </ProtectedAdminRoute>  ← And this
} />
```
