# Requirements Document

## Introduction

This document specifies the requirements for migrating all frontend direct Supabase database calls to a secure backend API architecture. The current application exposes database structure, credentials, and sensitive data in browser network traffic by making direct database queries from the frontend. This migration will establish the backend at https://kustomkoats-backend.onrender.com/api as the single point of data access, implementing proper authentication, authorization, and validation layers.

The migration encompasses admin pages (blog management, bundles, categories, products), public pages (content fetching, reviews), and shared components (footer, related bundles), ensuring no Supabase URLs or database queries appear in browser network traffic after completion.

## Glossary

- **Frontend**: The React application running in the user's browser at kustomkoats.in
- **Backend_API**: The Express.js server at https://kustomkoats-backend.onrender.com/api handling database operations
- **Supabase_Client**: The direct database connection library currently used in frontend code
- **API_Client**: The axios-based service layer (`lib/apiClient.js`) for backend communication
- **Admin_Pages**: Protected pages for content management (blog, bundles, categories, products)
- **Public_Pages**: Publicly accessible pages that fetch and display content
- **Database_Call**: Any operation that queries or modifies data in Supabase (SELECT, INSERT, UPDATE, DELETE)
- **Network_Tab**: Browser developer tools showing HTTP requests and responses
- **Migration**: The process of replacing direct Supabase_Client calls with Backend_API requests

## Requirements

### Requirement 1: Eliminate Direct Supabase Client Usage

**User Story:** As a security engineer, I want to remove all direct database access from the frontend, so that database credentials and structure are never exposed to browsers.

#### Acceptance Criteria

1. THE Frontend SHALL NOT import or use the Supabase_Client for database operations
2. WHEN the Frontend needs data, THE Frontend SHALL make HTTP requests to the Backend_API
3. THE Network_Tab SHALL NOT display any requests to supabase.co domains (excluding auth)
4. THE Frontend MAY use Supabase_Client ONLY for authentication session management
5. FOR ALL database tables, direct queries from Frontend SHALL be replaced with Backend_API endpoints

### Requirement 2: Backend API Endpoint Coverage

**User Story:** As a frontend developer, I want comprehensive backend endpoints for all data operations, so that I can fetch and modify data securely.

#### Acceptance Criteria

1. THE Backend_API SHALL provide CRUD endpoints for blog posts (`/api/content/blog`)
2. THE Backend_API SHALL provide CRUD endpoints for bundles (`/api/bundles`)
3. THE Backend_API SHALL provide CRUD endpoints for categories (`/api/content/categories`)
4. THE Backend_API SHALL provide endpoints for product reviews (`/api/reviews`)
5. THE Backend_API SHALL provide endpoints for page content (`/api/content/pages`)
6. THE Backend_API SHALL provide endpoints for gallery items (`/api/content/gallery`)
7. THE Backend_API SHALL provide endpoints for blog categories (`/api/content/blog-categories`)
8. WHEN an endpoint does not exist, THE Backend_API SHALL return a 404 status with error message
9. FOR ALL endpoints, THE Backend_API SHALL validate request parameters and return appropriate error responses

### Requirement 3: Admin Page Migration

**User Story:** As a content administrator, I want admin pages to work through the backend API, so that my database operations are secure and validated.

#### Acceptance Criteria

1. WHEN AdminBlogPage performs blog CRUD operations, THE AdminBlogPage SHALL use Backend_API endpoints
2. WHEN AdminBundlesPage manages bundles, THE AdminBundlesPage SHALL use Backend_API endpoints
3. WHEN AdminCategoriesPage manages categories, THE AdminCategoriesPage SHALL use Backend_API endpoints
4. WHEN AdminProductsPage manages products, THE AdminProductsPage SHALL use Backend_API endpoints
5. WHEN admin pages upload images, THE admin pages SHALL use the storage API endpoints (`/api/storage`)
6. THE admin pages SHALL display backend validation errors to users
7. WHEN backend returns error response, THE admin pages SHALL show user-friendly error messages

### Requirement 4: Public Page Migration

**User Story:** As a website visitor, I want public pages to load content securely, so that I can view information without exposing database internals.

#### Acceptance Criteria

1. WHEN OurPhilosophyPage loads content, THE OurPhilosophyPage SHALL fetch from Backend_API
2. WHEN OurStoryPage loads content, THE OurStoryPage SHALL fetch from Backend_API
3. WHEN Footer renders, THE Footer SHALL fetch links from Backend_API
4. WHEN ReviewsSection displays reviews, THE ReviewsSection SHALL fetch from Backend_API
5. WHEN RelatedBundles displays bundle details, THE RelatedBundles SHALL fetch from Backend_API
6. WHEN BlogPostPage loads a post, THE BlogPostPage SHALL fetch from Backend_API
7. WHEN TestimonialsPage displays testimonials, THE TestimonialsPage SHALL fetch from Backend_API
8. WHEN FAQPage displays questions, THE FAQPage SHALL fetch from Backend_API
9. WHEN GalleryPage displays media, THE GalleryPage SHALL fetch from Backend_API

### Requirement 5: Component Migration

**User Story:** As a developer, I want shared components to use the backend API, so that all data access is consistent and secure.

#### Acceptance Criteria

1. WHEN RelatedBundles component fetches bundle data, THE RelatedBundles SHALL use Backend_API
2. WHEN ReviewsSection component submits a review, THE ReviewsSection SHALL POST to Backend_API
3. WHEN Footer component fetches navigation links, THE Footer SHALL use Backend_API
4. THE components SHALL handle API loading states with appropriate UI feedback
5. THE components SHALL handle API errors gracefully without breaking the page

### Requirement 6: Authentication and Authorization

**User Story:** As a system administrator, I want proper authentication on backend endpoints, so that only authorized users can modify data.

#### Acceptance Criteria

1. WHEN Frontend calls admin endpoints, THE Frontend SHALL include authentication token in Authorization header
2. THE Backend_API SHALL verify authentication tokens for all protected endpoints
3. WHEN authentication token is missing or invalid, THE Backend_API SHALL return 401 Unauthorized
4. WHEN user lacks admin privileges, THE Backend_API SHALL return 403 Forbidden
5. THE Backend_API SHALL allow public read access to published content endpoints
6. THE Backend_API SHALL require admin authentication for all write operations

### Requirement 7: Data Validation and Sanitization

**User Story:** As a security engineer, I want backend validation on all inputs, so that malicious data cannot enter the database.

#### Acceptance Criteria

1. THE Backend_API SHALL validate all request body parameters against expected schemas
2. THE Backend_API SHALL sanitize text inputs to prevent XSS attacks
3. WHEN validation fails, THE Backend_API SHALL return 400 Bad Request with error details
4. THE Backend_API SHALL enforce data type constraints (strings, numbers, UUIDs)
5. THE Backend_API SHALL enforce required field constraints
6. THE Backend_API SHALL validate file uploads for type and size limits

### Requirement 8: Backward Compatibility During Migration

**User Story:** As a developer, I want the application to function during migration, so that users experience no downtime.

#### Acceptance Criteria

1. WHEN a page is partially migrated, THE page SHALL work with both old and new data fetching methods
2. THE migration SHALL proceed page by page without breaking existing functionality
3. WHEN migration is complete for a module, THE module SHALL only use Backend_API
4. THE application SHALL remain deployable and functional after each migration step

### Requirement 9: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when operations fail, so that I understand what went wrong.

#### Acceptance Criteria

1. WHEN Backend_API returns an error, THE Frontend SHALL display a user-friendly error message
2. THE Frontend SHALL distinguish between network errors, authentication errors, and validation errors
3. WHEN an operation succeeds, THE Frontend SHALL display a success notification
4. WHEN loading data, THE Frontend SHALL display loading indicators
5. THE Frontend SHALL log detailed errors to console for debugging

### Requirement 10: API Response Standardization

**User Story:** As a frontend developer, I want consistent API response formats, so that I can handle responses uniformly.

#### Acceptance Criteria

1. THE Backend_API SHALL return success responses in format `{ success: true, data: [...] }`
2. THE Backend_API SHALL return error responses in format `{ error: "message", message: "details" }`
3. THE Backend_API SHALL use standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)
4. THE Backend_API SHALL return JSON content type for all responses
5. THE Backend_API SHALL include CORS headers for allowed frontend origins

### Requirement 11: Image Upload Migration

**User Story:** As a content creator, I want to upload images through the backend API, so that file operations are secure and validated.

#### Acceptance Criteria

1. WHEN admin uploads an image, THE Frontend SHALL request a signed upload URL from Backend_API
2. THE Backend_API SHALL generate signed upload URLs with expiration times
3. THE Frontend SHALL upload files directly to storage using signed URLs
4. THE Backend_API SHALL validate file types and sizes before generating upload URLs
5. WHEN upload succeeds, THE Frontend SHALL receive the public URL for the uploaded file
6. THE Backend_API SHALL handle storage bucket operations (list, delete) through protected endpoints

### Requirement 12: Migration Verification and Testing

**User Story:** As a QA engineer, I want to verify the migration is complete and correct, so that no security vulnerabilities remain.

#### Acceptance Criteria

1. THE Network_Tab SHALL show zero requests to supabase.co database endpoints
2. WHEN inspecting network traffic, THE Network_Tab SHALL only show requests to Backend_API
3. THE Frontend bundle SHALL NOT include Supabase database client code (excluding auth)
4. FOR ALL migrated pages, functionality SHALL match pre-migration behavior
5. THE application SHALL pass security audit for exposed credentials and database structure

### Requirement 13: Legacy Supabase Client Removal

**User Story:** As a maintainer, I want to remove unused Supabase client code, so that the codebase is clean and secure.

#### Acceptance Criteria

1. WHEN migration is complete, THE Frontend SHALL remove `lib/supabase.js` database imports
2. THE Frontend MAY retain Supabase auth client for authentication flows
3. THE Frontend SHALL update `lib/apiClient.js` to be the sole data access layer
4. WHEN database operations are needed, THE code SHALL only use API_Client service functions
5. THE Frontend SHALL remove any commented-out Supabase database code

### Requirement 14: Bundle Management API

**User Story:** As a product manager, I want bundle operations to go through the backend, so that bundle pricing and availability are controlled server-side.

#### Acceptance Criteria

1. THE Backend_API SHALL provide `GET /api/bundles` for fetching all bundles
2. THE Backend_API SHALL provide `GET /api/bundles/:id` for fetching single bundle with items
3. THE Backend_API SHALL provide `POST /api/bundles` for creating bundles (admin only)
4. THE Backend_API SHALL provide `PUT /api/bundles/:id` for updating bundles (admin only)
5. THE Backend_API SHALL provide `DELETE /api/bundles/:id` for deleting bundles (admin only)
6. WHEN creating/updating bundles, THE Backend_API SHALL validate bundle items reference valid products
7. WHEN fetching bundles, THE Backend_API SHALL include related product details in response

### Requirement 15: Review and Testimonial API

**User Story:** As a customer, I want to submit reviews through a secure API, so that my feedback is validated and stored safely.

#### Acceptance Criteria

1. THE Backend_API SHALL provide `GET /api/reviews` for fetching product reviews
2. THE Backend_API SHALL provide `POST /api/reviews` for submitting new reviews (authenticated)
3. THE Backend_API SHALL validate review ratings are between 1 and 5
4. THE Backend_API SHALL validate review text length and content
5. WHEN submitting a review, THE Backend_API SHALL associate it with authenticated user
6. THE Backend_API SHALL return reviews with user information for display
7. THE Backend_API SHALL support filtering reviews by product_id

### Requirement 16: Content Management API Coverage

**User Story:** As a content editor, I want comprehensive APIs for all content types, so that I can manage website content without database access.

#### Acceptance Criteria

1. THE Backend_API SHALL provide endpoints for page content management (`/api/content/pages`)
2. THE Backend_API SHALL provide endpoints for gallery management (`/api/content/gallery`)
3. THE Backend_API SHALL provide endpoints for events management (`/api/content/events`)
4. THE Backend_API SHALL provide endpoints for packages/pricing (`/api/content/packages`)
5. THE Backend_API SHALL provide endpoints for wholesale page content
6. FOR ALL content endpoints, THE Backend_API SHALL support rich text/markdown content
7. FOR ALL content endpoints, THE Backend_API SHALL validate required fields

### Requirement 17: Order and Customer Data Security

**User Story:** As a customer, I want my order information to be accessed securely, so that my personal data remains private.

#### Acceptance Criteria

1. WHEN OrdersPage displays order history, THE OrdersPage SHALL fetch via Backend_API
2. WHEN OrderDetailPage displays order details, THE OrderDetailPage SHALL fetch via Backend_API
3. THE Backend_API SHALL ensure users can only access their own orders
4. THE Backend_API SHALL prevent order data exposure through direct database queries
5. WHEN generating invoices, THE Frontend SHALL use order data from Backend_API

### Requirement 18: Wholesale Application Security

**User Story:** As a wholesale applicant, I want my application data to be transmitted securely, so that my business information remains confidential.

#### Acceptance Criteria

1. WHEN WhyPartnerPage loads content, THE WhyPartnerPage SHALL fetch via Backend_API
2. WHEN ApplicationPage submits wholesale application, THE ApplicationPage SHALL POST to Backend_API
3. THE Backend_API SHALL validate all wholesale application fields
4. THE Backend_API SHALL prevent unauthorized access to wholesale application data
5. THE Backend_API SHALL log wholesale applications for admin review

### Requirement 19: Contact and Enquiry Form Security

**User Story:** As a visitor, I want contact forms to be secure, so that my inquiries are safely transmitted.

#### Acceptance Criteria

1. WHEN ContactPage submits a message, THE ContactPage SHALL POST to Backend_API
2. WHEN EnquiryPage submits an inquiry, THE EnquiryPage SHALL POST to Backend_API
3. THE Backend_API SHALL validate email addresses and phone numbers
4. THE Backend_API SHALL sanitize message content to prevent injection attacks
5. THE Backend_API SHALL rate-limit form submissions to prevent spam

### Requirement 20: Search and Filter Operations

**User Story:** As a shopper, I want product searches to be fast and secure, so that I can find items without exposing database queries.

#### Acceptance Criteria

1. WHEN Frontend performs product search, THE Frontend SHALL send search terms to Backend_API
2. THE Backend_API SHALL handle search query optimization and execution
3. THE Backend_API SHALL validate and sanitize search inputs
4. THE Backend_API SHALL support filtering by category, price, and availability
5. THE Backend_API SHALL return paginated search results
6. THE Backend_API SHALL prevent SQL injection through parameterized queries
