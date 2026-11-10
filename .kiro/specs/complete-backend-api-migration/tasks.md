# Implementation Plan: Complete Backend API Migration

## Overview

This plan systematically migrates all frontend direct Supabase database calls to a secure backend API architecture. The migration proceeds through eight phases: creating backend endpoints, building the frontend service layer, migrating admin pages, migrating public pages, migrating components, migrating forms, migrating search functionality, and final cleanup. Each phase builds on previous work to ensure the application remains functional throughout migration.

After completion, zero direct Supabase database requests will appear in browser network traffic (authentication excepted), with all data operations flowing through the validated backend API at `https://kustomkoats-backend.onrender.com/api`.

## Tasks

- [ ] 1. Set up backend API infrastructure and missing endpoints
  - [ ] 1.1 Create bundle management endpoints
    - Create `backend/routes/bundles.js` with CRUD endpoints
    - Implement GET /api/bundles (public, with query filters)
    - Implement GET /api/bundles/:id (public, includes bundle items with product details)
    - Implement POST /api/bundles (admin only, validates product references)
    - Implement PUT /api/bundles/:id (admin only)
    - Implement DELETE /api/bundles/:id (admin only)
    - Add validation for bundle items (product_id must exist, quantity > 0)
    - _Requirements: 2.2, 14.1-14.7_
  
  - [ ] 1.2 Create review endpoints
    - Create `backend/routes/reviews.js`
    - Implement GET /api/reviews (public, supports product_id filter)
    - Implement POST /api/reviews (authenticated users, associates with user_id)
    - Implement PUT /api/reviews/:id (authenticated, owner only)
    - Implement DELETE /api/reviews/:id (authenticated, owner or admin)
    - Add validation: rating 1-5, title and content required
    - Include user information in review responses
    - _Requirements: 2.4, 15.1-15.7_
  
  - [ ] 1.3 Extend content endpoints with gallery, pages, and events
    - Extend `backend/routes/content.js`
    - Implement GET/POST/PUT/DELETE /api/content/gallery (admin write, public read)
    - Implement GET /api/content/pages/:slug (public)
    - Implement PUT /api/content/pages/:slug (admin only)
    - Implement GET/POST/PUT/DELETE /api/content/blog-categories
    - Implement GET/POST/PUT/DELETE /api/content/events
    - Add rich text/markdown content validation
    - _Requirements: 2.5-2.7, 16.1-16.7_
  
  - [ ] 1.4 Create form submission endpoints
    - Extend `backend/routes/content.js` or create separate routes
    - Implement POST /api/contact (validate email format, phone, message length)
    - Implement POST /api/enquiry (validate required fields, optional product_id)
    - Add input sanitization to prevent XSS
    - Add rate limiting middleware (5 submissions per hour per IP)
    - _Requirements: 2.2, 19.1-19.5_
  
  - [ ] 1.5 Create search and filter endpoint
    - Create `backend/routes/search.js`
    - Implement GET /api/search/products
    - Support query params: q, category, min_price, max_price, limit, offset
    - Use parameterized queries to prevent SQL injection
    - Return paginated results with total count
    - Include available filters in response (categories, price_range)
    - _Requirements: 2.2, 20.1-20.6_
  
  - [ ]* 1.6 Write unit tests for new backend endpoints
    - Test bundle endpoints (CRUD, validation, authorization)
    - Test review endpoints (submission, ownership verification)
    - Test gallery, page content, and event endpoints
    - Test form submission validation and rate limiting
    - Test search endpoint (filtering, pagination, injection prevention)
    - _Requirements: 2.8-2.9, 7.1-7.6_

- [ ] 2. Checkpoint - Verify all backend endpoints are functional
  - Ensure all tests pass, verify endpoints with Postman/Thunder Client, ask the user if questions arise.

- [ ] 3. Build comprehensive frontend service layer
  - [ ] 3.1 Extend apiClient.js with request/response interceptors
    - Ensure `frontend/lib/apiClient.js` includes auth token interceptor
    - Add automatic token refresh on 401 errors
    - Add response interceptor to extract data property
    - Add error interceptor for consistent error handling
    - Configure timeout (30 seconds)
    - _Requirements: 1.2, 6.1-6.2_
  
  - [ ] 3.2 Create bundleService with CRUD operations
    - Create `frontend/services/bundleService.js`
    - Implement getAll(params) → GET /api/bundles
    - Implement getById(id) → GET /api/bundles/:id
    - Implement create(data) → POST /api/bundles
    - Implement update(id, data) → PUT /api/bundles/:id
    - Implement delete(id) → DELETE /api/bundles/:id
    - _Requirements: 2.2, 14.1-14.5_
  
  - [ ] 3.3 Create reviewService for product reviews
    - Create `frontend/services/reviewService.js`
    - Implement getReviews(productId, limit) → GET /api/reviews
    - Implement submitReview(data) → POST /api/reviews
    - Implement updateReview(id, data) → PUT /api/reviews/:id
    - Implement deleteReview(id) → DELETE /api/reviews/:id
    - _Requirements: 2.4, 15.1-15.4_
  
  - [ ] 3.4 Create or extend contentService for gallery, pages, events
    - Extend `frontend/services/contentService.js`
    - Add getGallery(params), createGalleryItem(data), updateGalleryItem(id, data), deleteGalleryItem(id)
    - Add getPage(slug), updatePage(slug, data)
    - Add getBlogCategories(), createBlogCategory(data), etc.
    - Add getEvents(params), createEvent(data), updateEvent(id, data), deleteEvent(id)
    - _Requirements: 4.2, 16.1-16.4_
  
  - [ ] 3.5 Create formService for contact and enquiry submissions
    - Create `frontend/services/formService.js`
    - Implement submitContact(data) → POST /api/contact
    - Implement submitEnquiry(data) → POST /api/enquiry
    - Add client-side validation helpers
    - _Requirements: 19.1-19.2_
  
  - [ ] 3.6 Create searchService for product search
    - Create `frontend/services/searchService.js`
    - Implement searchProducts(query, filters) → GET /api/search/products
    - Support pagination parameters
    - _Requirements: 20.1, 20.5_
  
  - [ ]* 3.7 Write unit tests for frontend service layer
    - Mock apiClient and test each service function
    - Test error handling in services
    - Test parameter passing and response parsing
    - _Requirements: 2.2, 9.1-9.5_

- [ ] 4. Checkpoint - Verify service layer is complete
  - Ensure all tests pass, verify service functions work end-to-end, ask the user if questions arise.

- [ ] 5. Migrate admin pages to use backend API
  - [ ] 5.1 Migrate AdminBlogPage
    - Replace all `supabase.from('kustom_kultor_blog')` calls with `contentService` methods
    - Update blog list fetching: use `contentService.getBlogPosts()`
    - Update blog creation: use `contentService.createBlogPost(data)`
    - Update blog editing: use `contentService.updateBlogPost(id, data)`
    - Update blog deletion: use `contentService.deleteBlogPost(id)`
    - Add loading states during API calls
    - Add error handling with toast notifications
    - Add success notifications after CRUD operations
    - _Requirements: 3.1, 3.6-3.7_
  
  - [ ] 5.2 Migrate AdminBundlesPage
    - Replace all `supabase.from('bundles')` calls with `bundleService` methods
    - Update bundle list: use `bundleService.getAll()`
    - Update bundle creation: use `bundleService.create(data)`
    - Update bundle editing: use `bundleService.update(id, data)`
    - Update bundle deletion: use `bundleService.delete(id)`
    - Ensure bundle items validation (product references)
    - Add loading and error states
    - _Requirements: 3.2, 14.1-14.5_
  
  - [ ] 5.3 Migrate AdminCategoriesPage
    - Replace Supabase calls with `contentService.getCategories()` and related methods
    - Update category CRUD operations to use backend API
    - Add loading and error handling
    - _Requirements: 3.3_
  
  - [ ] 5.4 Migrate AdminProductsPage
    - Replace Supabase product queries with existing `productService` or API calls
    - Ensure product operations use backend endpoints
    - Add validation feedback from backend
    - _Requirements: 3.4_
  
  - [ ] 5.5 Migrate AdminGalleryPage
    - Replace Supabase calls with `contentService.getGallery()` and related methods
    - Implement gallery item CRUD via API
    - Handle image uploads via storage API
    - Add loading and error states
    - _Requirements: 2.6, 16.2_
  
  - [ ] 5.6 Update admin image upload flows
    - Ensure all admin pages use `storageAPI.getUploadUrl()` for image uploads
    - Update upload flow: request signed URL, upload to storage, save public URL
    - Validate file types and sizes on backend before generating signed URLs
    - _Requirements: 3.5, 11.1-11.6_
  
  - [ ]* 5.7 Write integration tests for admin pages
    - Test admin blog CRUD workflow end-to-end
    - Test admin bundle management workflow
    - Test error handling when backend returns validation errors
    - Test authorization (admin-only access)
    - _Requirements: 3.6-3.7, 6.1-6.6_

- [ ] 6. Checkpoint - Verify admin pages work correctly
  - Ensure all admin CRUD operations work, test with real backend, ask the user if questions arise.

- [ ] 7. Migrate public pages to use backend API
  - [ ] 7.1 Migrate OurPhilosophyPage
    - Replace `supabase.from('page_content')` with `contentService.getPage('our-philosophy')`
    - Add loading spinner while fetching
    - Add error boundary for fetch failures
    - _Requirements: 4.1_
  
  - [ ] 7.2 Migrate OurStoryPage
    - Replace Supabase call with `contentService.getPage('our-story')`
    - Add loading and error states
    - _Requirements: 4.2_
  
  - [ ] 7.3 Migrate BlogPostPage
    - Replace `supabase.from('kustom_kultor_blog')` with `contentService.getBlogPost(slug)`
    - Fetch single blog post by slug via API
    - Handle 404 errors when post not found
    - _Requirements: 4.6_
  
  - [ ] 7.4 Migrate TestimonialsPage
    - Replace Supabase call with `contentService.getTestimonials()`
    - Add loading state
    - Handle empty testimonials gracefully
    - _Requirements: 4.7_
  
  - [ ] 7.5 Migrate FAQPage
    - Replace Supabase call with `contentService.getFAQs()`
    - Add loading and error handling
    - _Requirements: 4.8_
  
  - [ ] 7.6 Migrate GalleryPage
    - Replace Supabase call with `contentService.getGallery()`
    - Support category filtering via query params
    - Add loading state and error handling
    - _Requirements: 4.9_
  
  - [ ] 7.7 Migrate WhyPartnerPage (wholesale content)
    - Replace Supabase call with `contentService.getPage('why-partner')`
    - Add loading and error states
    - _Requirements: 18.1_
  
  - [ ]* 7.8 Write integration tests for public pages
    - Test page content loading via API
    - Test error handling when content not found
    - Test loading states
    - Verify SEO metadata is preserved
    - _Requirements: 4.1-4.9, 9.1-9.5_

- [ ] 8. Checkpoint - Verify public pages load correctly
  - Ensure all public pages fetch content via API, test performance, ask the user if questions arise.

- [ ] 9. Migrate shared components to use backend API
  - [ ] 9.1 Migrate Footer component
    - Replace `supabase.from('footer_links')` with `contentService.getFooterLinks()`
    - Handle loading state without breaking layout
    - Cache footer links to avoid repeated fetches
    - _Requirements: 4.3, 5.3_
  
  - [ ] 9.2 Migrate ReviewsSection component
    - Replace `supabase.from('reviews')` with `reviewService.getReviews(productId)`
    - Update review submission: use `reviewService.submitReview(data)`
    - Show loading state while fetching reviews
    - Handle authentication for review submission
    - _Requirements: 4.4, 5.2, 15.2_
  
  - [ ] 9.3 Migrate RelatedBundles component
    - Replace `supabase.from('bundles')` with `bundleService.getById(id)` or `bundleService.getAll()`
    - Fetch related bundle details via API
    - Add loading state
    - _Requirements: 4.5, 5.1, 14.2_
  
  - [ ]* 9.4 Write unit tests for migrated components
    - Test Footer renders with API data
    - Test ReviewsSection fetches and displays reviews
    - Test RelatedBundles fetches bundle data
    - Test error handling in components
    - _Requirements: 5.4-5.5_

- [ ] 10. Migrate contact and enquiry forms
  - [ ] 10.1 Migrate ContactPage form
    - Replace `supabase.from('contact_submissions')` with `formService.submitContact(data)`
    - Add client-side validation
    - Show success message on submission
    - Handle rate limiting errors from backend
    - _Requirements: 19.1-19.2_
  
  - [ ] 10.2 Migrate EnquiryPage form
    - Replace Supabase insert with `formService.submitEnquiry(data)`
    - Validate required fields on frontend and backend
    - Show confirmation message after submission
    - _Requirements: 19.1-19.2_
  
  - [ ] 10.3 Migrate wholesale application form
    - Replace Supabase call with backend API endpoint for wholesale applications
    - Validate all application fields
    - Add rate limiting handling
    - _Requirements: 18.2-18.5_
  
  - [ ]* 10.4 Write integration tests for forms
    - Test contact form submission flow
    - Test enquiry form submission flow
    - Test validation error display
    - Test rate limiting behavior
    - _Requirements: 19.3-19.5_

- [ ] 11. Migrate search and filter functionality
  - [ ] 11.1 Migrate product search to use backend API
    - Replace direct Supabase queries with `searchService.searchProducts(query, filters)`
    - Send search terms and filters to backend
    - Display paginated results
    - Add debouncing to search input (300ms delay)
    - _Requirements: 20.1-20.3_
  
  - [ ] 11.2 Implement filter UI updates
    - Update category filter to use backend filtering
    - Update price range filter to use backend filtering
    - Update availability filter if present
    - Send all filters as query parameters to backend
    - _Requirements: 20.4_
  
  - [ ] 11.3 Implement pagination for search results
    - Use limit and offset parameters from backend
    - Display page navigation UI
    - Update results without full page reload
    - _Requirements: 20.5_
  
  - [ ]* 11.4 Write tests for search functionality
    - Test search query sends correct parameters
    - Test pagination controls
    - Test filter application
    - Test debouncing works correctly
    - _Requirements: 20.1-20.6_

- [ ] 12. Checkpoint - Verify all components and forms migrated
  - Ensure shared components and forms use API, test error cases, ask the user if questions arise.

- [ ] 13. Clean up unused Supabase client code
  - [ ] 13.1 Search codebase for remaining Supabase database calls
    - Run grep/search for `supabase.from(` across all frontend files
    - Identify any remaining direct database queries
    - Verify each is either migrated or intentionally kept (auth only)
    - _Requirements: 1.1, 13.1_
  
  - [ ] 13.2 Remove unused Supabase imports
    - Remove or comment out `import { supabase } from 'lib/supabase'` where not needed
    - Keep Supabase imports only in auth-related files and apiClient
    - Update `lib/supabase.js` documentation to note it's auth-only
    - _Requirements: 13.2-13.3_
  
  - [ ] 13.3 Update environment variables and configuration
    - Ensure `VITE_API_URL` points to correct backend
    - Document required environment variables in README
    - Remove any unused Supabase-related env vars
    - _Requirements: 1.2, 8.1-8.4_

- [ ] 14. Final verification and network traffic inspection
  - [ ] 14.1 Perform comprehensive network traffic inspection
    - Open browser DevTools Network tab
    - Navigate through all migrated pages (admin and public)
    - Verify zero requests to `*.supabase.co/rest/*` (database endpoints)
    - Verify only Supabase auth requests present (`*.supabase.co/auth/*`)
    - Verify all data requests go to backend API
    - _Requirements: 1.3, 12.1-12.2_
  
  - [ ] 14.2 Run full regression tests
    - Test all admin CRUD operations work correctly
    - Test all public pages load content
    - Test user authentication flow end-to-end
    - Test review submission and display
    - Test bundle creation and display
    - Test contact form submission
    - Test search functionality
    - _Requirements: 8.1-8.4, 12.4_
  
  - [ ] 14.3 Verify security requirements are met
    - Confirm admin endpoints require authentication
    - Confirm users can only access own data (reviews, orders)
    - Confirm input validation works on backend
    - Confirm XSS prevention is in place
    - Confirm rate limiting works on form submissions
    - _Requirements: 6.1-6.6, 7.1-7.6, 12.5_
  
  - [ ] 14.4 Performance verification
    - Measure page load times before and after migration
    - Ensure API response times are acceptable (< 500ms for most requests)
    - Check for excessive API calls (implement caching if needed)
    - _Requirements: 8.1-8.4_
  
  - [ ] 14.5 Update documentation
    - Update README with migration completion status
    - Document API endpoints used by frontend
    - Update developer onboarding guide
    - Add troubleshooting section for common issues
    - _Requirements: 13.4-13.5_

- [ ] 15. Final checkpoint - Migration complete
  - Ensure all tests pass, verify zero Supabase database requests in network tab, confirm all features working correctly, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test-related tasks and can be skipped for faster migration
- Each task references specific requirements for traceability
- Migration proceeds incrementally to keep application functional throughout
- Checkpoints ensure validation at critical milestones
- Authentication remains with Supabase auth service - only database queries are migrated
- Backend endpoints must be deployed and accessible before frontend migration begins
- All operations that modify data require authentication and proper authorization checks
- Network traffic inspection is the ultimate verification that migration is complete

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["1.6"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 3, "tasks": ["3.7"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 5, "tasks": ["5.6"] },
    { "id": 6, "tasks": ["5.7", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"] },
    { "id": 7, "tasks": ["7.8", "9.1", "9.2", "9.3"] },
    { "id": 8, "tasks": ["9.4", "10.1", "10.2", "10.3"] },
    { "id": 9, "tasks": ["10.4", "11.1", "11.2", "11.3"] },
    { "id": 10, "tasks": ["11.4", "13.1"] },
    { "id": 11, "tasks": ["13.2", "13.3"] },
    { "id": 12, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5"] }
  ]
}
```
