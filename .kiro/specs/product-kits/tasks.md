# Product Bundles System - Implementation Tasks

## Overview

Complete the integration of the Product Bundles/Kits system. The database schema and Admin Bundles Management page are already implemented. This plan covers the remaining integration points: route registration, menu navigation, product tagging, frontend display, and cart functionality.

## Tasks

- [x] 1. Register Admin Bundles Route in App.jsx
  - Add route for `/admin/bundles` path that renders AdminBundlesPage component
  - Import AdminBundlesPage from 'src/pages/admin/AdminBundlesPage.jsx'
  - Place route under admin route group (after other admin routes like /admin/products, /admin/transactions)
  - Ensure route uses ProtectedRoute wrapper if other admin routes use it

- [ ] 2. Add Bundles Menu Item to Admin Sidebar
  - Import Package icon from lucide-react in KKAdminLayout.jsx
  - Add "Bundles" menu item to sidebar navigation array
  - Use path="/admin/bundles" and icon={Package}
  - Position after "Products" menu item for logical grouping
  - Ensure styling matches other menu items

- [ ] 3. Add Bundle Tagging UI to Product Form
  - Add "Related Bundles" section in AdminProductsPage product form (after inventory section)
  - Fetch all active bundles from bundles table on form mount
  - Display checkboxes for each bundle with name and price
  - On save, insert/update records in product_bundles table linking product to selected bundles
  - Show currently tagged bundles when editing existing products
  - Include visual indicator showing bundle price and savings

- [ ] 4. Display Related Bundles on Product Detail Page
  - Fetch related bundles for current product using product_bundles join query
  - For each bundle, fetch bundle details and all bundle_items with product information
  - Display bundles section at bottom of product page (after specs/description)
  - Show bundle card with: name, description, image, products included (with quantities), original price (sum of products), bundle price, savings percentage
  - Add "Add Bundle to Cart" button for each bundle
  - Style consistently with product cards

- [ ] 5. Implement Add Bundle to Cart Functionality
  - Locate cart store/service (cartStore.js or equivalent)
  - Add addBundleToCart function that accepts bundle object
  - Extract all products from bundle.bundle_items
  - For each product in bundle, call existing addToCart with specified quantity
  - Show toast notification: "Bundle added to cart! (X items)"
  - Ensure cart updates reactively to show all added items
  - Handle cases where product stock may be insufficient

- [ ] 6. Final verification
  - Test complete flow: create bundle in admin → tag to product → view on product page → add to cart
  - Verify all 5 integration points work end-to-end
  - Check responsive design on mobile/tablet
  - Ensure proper error handling (empty bundles, network errors)

## Notes

- Database schema already exists (bundles, bundle_items, product_bundles tables)
- AdminBundlesPage already implemented with full CRUD operations
- User wants direct implementation without documentation files
- Bundle pricing should show original price vs bundle price with savings percentage
- Follow existing code patterns and styling from the project
