# Implementation Plan: Backend MVC Architecture Restructuring

## Overview

This plan systematically restructures the KUSTOMKOATS backend from a monolithic architecture to a clean MVC (Model-View-Controller) pattern with clear separation of concerns. The migration proceeds through five phases: creating directory structure, migrating core files, decomposing all 16 route files into MVC layers, adding supporting infrastructure (error handling, utilities, configuration), and final verification. Each phase builds on previous work to ensure the application remains functional throughout the restructuring.

After completion, the backend will have a professional, maintainable architecture with distinct layers for routing, controllers, services, models, and validators, making it easy to test, maintain, and scale.

## Tasks

- [ ] 1. Set up backend MVC directory structure and migrate core files
  - [ ] 1.1 Create backend MVC directory structure
    - Create `backend/src/` base directory
    - Create `backend/src/controllers/` directory for HTTP handling
    - Create `backend/src/services/` directory for business logic
    - Create `backend/src/models/` directory for database queries
    - Create `backend/src/validators/` directory for validation schemas
    - Create `backend/src/routes/` directory for route definitions
    - Create `backend/src/middleware/` directory for middleware functions
    - Create `backend/src/config/` directory for configuration
    - Create `backend/src/utils/` directory for utility functions
    - Create `backend/src/jobs/` directory for background jobs
    - _Requirements: 1.1-1.3_
  
  - [ ] 1.2 Migrate existing core files to new structure
    - Move `backend/middleware/auth.js` to `backend/src/middleware/auth.js`
    - Move `backend/middleware/validation.js` to `backend/src/middleware/validation.js`
    - Move `backend/config/supabase.js` to `backend/src/config/supabase.js`
    - Update import paths in these files if they reference each other
    - _Requirements: 1.4, 14.1-14.2_

- [ ] 2. Decompose products, auth, and categories routes (Group 1)
  - [ ] 2.1 Decompose products.js route into MVC layers
    - Create `backend/src/models/productModel.js` with all database queries
    - Create `backend/src/services/productService.js` with business logic
    - Create `backend/src/controllers/productController.js` with HTTP handling
    - Create `backend/src/validators/productValidator.js` with validation schemas
    - Create `backend/src/routes/products.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/products.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 2.2 Decompose auth.js route into MVC layers
    - Create `backend/src/models/authModel.js` with database queries
    - Create `backend/src/services/authService.js` with authentication logic
    - Create `backend/src/controllers/authController.js` with HTTP handling
    - Create `backend/src/validators/authValidator.js` with validation schemas
    - Create `backend/src/routes/auth.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/auth.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 2.3 Decompose categories.js route into MVC layers
    - Create `backend/src/models/categoryModel.js` with database queries
    - Create `backend/src/services/categoryService.js` with business logic
    - Create `backend/src/controllers/categoryController.js` with HTTP handling
    - Create `backend/src/validators/categoryValidator.js` with validation schemas
    - Create `backend/src/routes/categories.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/categories.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_

- [ ] 3. Decompose cart, orders, and bundles routes (Group 2)
  - [ ] 3.1 Decompose cart.js route into MVC layers
    - Create `backend/src/models/cartModel.js` with database queries
    - Create `backend/src/services/cartService.js` with cart logic
    - Create `backend/src/controllers/cartController.js` with HTTP handling
    - Create `backend/src/validators/cartValidator.js` with validation schemas
    - Create `backend/src/routes/cart.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/cart.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 3.2 Decompose orders.js route into MVC layers
    - Create `backend/src/models/orderModel.js` with database queries
    - Create `backend/src/services/orderService.js` with order processing logic
    - Create `backend/src/controllers/orderController.js` with HTTP handling
    - Create `backend/src/validators/orderValidator.js` with validation schemas
    - Create `backend/src/routes/orders.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/orders.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 3.3 Decompose bundles.js route into MVC layers
    - Create `backend/src/models/bundleModel.js` with database queries
    - Create `backend/src/services/bundleService.js` with bundle logic
    - Create `backend/src/controllers/bundleController.js` with HTTP handling
    - Create `backend/src/validators/bundleValidator.js` with validation schemas
    - Create `backend/src/routes/bundles.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/bundles.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_

- [ ] 4. Decompose profile, promo, and reviews routes (Group 3)
  - [ ] 4.1 Decompose profile.js route into MVC layers
    - Create `backend/src/models/profileModel.js` with database queries
    - Create `backend/src/services/profileService.js` with profile logic
    - Create `backend/src/controllers/profileController.js` with HTTP handling
    - Create `backend/src/validators/profileValidator.js` with validation schemas
    - Create `backend/src/routes/profile.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/profile.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 4.2 Decompose promo.js route into MVC layers
    - Create `backend/src/models/promoModel.js` with database queries
    - Create `backend/src/services/promoService.js` with promo code logic
    - Create `backend/src/controllers/promoController.js` with HTTP handling
    - Create `backend/src/validators/promoValidator.js` with validation schemas
    - Create `backend/src/routes/promo.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/promo.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 4.3 Decompose reviews.js route into MVC layers
    - Create `backend/src/models/reviewModel.js` with database queries
    - Create `backend/src/services/reviewService.js` with review logic
    - Create `backend/src/controllers/reviewController.js` with HTTP handling
    - Create `backend/src/validators/reviewValidator.js` with validation schemas
    - Create `backend/src/routes/reviews.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/reviews.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_

- [ ] 5. Decompose search, storage, and content routes (Group 4)
  - [ ] 5.1 Decompose search.js route into MVC layers
    - Create `backend/src/models/searchModel.js` with database queries
    - Create `backend/src/services/searchService.js` with search logic
    - Create `backend/src/controllers/searchController.js` with HTTP handling
    - Create `backend/src/routes/search.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/search.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 5.2 Decompose storage.js route into MVC layers
    - Create `backend/src/models/storageModel.js` with database queries
    - Create `backend/src/services/storageService.js` with storage logic
    - Create `backend/src/controllers/storageController.js` with HTTP handling
    - Create `backend/src/routes/storage.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/storage.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 5.3 Decompose content.js route into MVC layers
    - Create `backend/src/models/contentModel.js` with database queries
    - Create `backend/src/services/contentService.js` with content logic
    - Create `backend/src/controllers/contentController.js` with HTTP handling
    - Create `backend/src/routes/content.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/content.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_

- [ ] 6. Decompose remaining routes (Group 5)
  - [ ] 6.1 Decompose wholesale.js route into MVC layers
    - Create `backend/src/models/wholesaleModel.js` with database queries
    - Create `backend/src/services/wholesaleService.js` with wholesale logic
    - Create `backend/src/controllers/wholesaleController.js` with HTTP handling
    - Create `backend/src/validators/wholesaleValidator.js` with validation schemas
    - Create `backend/src/routes/wholesale.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/wholesale.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 6.2 Decompose wishlist.js route into MVC layers
    - Create `backend/src/models/wishlistModel.js` with database queries
    - Create `backend/src/services/wishlistService.js` with wishlist logic
    - Create `backend/src/controllers/wishlistController.js` with HTTP handling
    - Create `backend/src/routes/wishlist.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/wishlist.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 6.3 Decompose payment-failures.js route into MVC layers
    - Create `backend/src/models/paymentFailureModel.js` with database queries
    - Create `backend/src/services/paymentFailureService.js` with payment failure logic
    - Create `backend/src/controllers/paymentFailureController.js` with HTTP handling
    - Create `backend/src/routes/payment-failures.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/payment-failures.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_
  
  - [ ] 6.4 Decompose category-showcase.js route into MVC layers
    - Create `backend/src/models/categoryShowcaseModel.js` with database queries
    - Create `backend/src/services/categoryShowcaseService.js` with showcase logic
    - Create `backend/src/controllers/categoryShowcaseController.js` with HTTP handling
    - Create `backend/src/routes/category-showcase.js` with thin routing layer
    - Update `backend/server.js` to import from `./src/routes/category-showcase.js`
    - _Requirements: 2.1-2.8, 16.1-16.5_

- [ ] 7. Add supporting infrastructure
  - [ ] 7.1 Create error handler middleware
    - Create `backend/src/middleware/errorHandler.js` with AppError class
    - Implement centralized error handling middleware with logging
    - Implement standard error response format
    - Update `backend/server.js` to use error handler middleware
    - _Requirements: 13.1-13.5_
  
  - [ ] 7.2 Create backend utility functions
    - Create `backend/src/utils/formatting.js` for data formatting helpers
    - Create `backend/src/utils/logger.js` for logging utilities
    - Create `backend/src/utils/errorHandling.js` for error utilities
    - _Requirements: 10.1-10.5_
  
  - [ ] 7.3 Extract configuration files
    - Create `backend/src/config/cors.js` for CORS configuration
    - Create `backend/src/config/server.js` for server configuration
    - Update `backend/server.js` to import and use configurations
    - _Requirements: 12.1-12.5, 15.1-15.6_

- [ ] 8. Final verification and testing
  - [ ] 8.1 Comprehensive backend verification
    - Start the backend server and verify it runs without errors
    - Test all API endpoints to ensure they respond correctly
    - Verify all import paths are correct and resolve properly
    - Check error handling works as expected for all endpoints
    - Confirm database operations function properly
    - Test authentication and authorization flows
    - _Requirements: 18.1-18.6, 19.1-19.6_
  
  - [ ] 8.2 Delete old route files
    - Remove `backend/routes/` directory (all old route files)
    - Remove `backend/middleware/` directory (old middleware location)
    - Remove `backend/config/` directory (old config location)
    - Verify no broken imports remain
    - _Requirements: 19.1-19.6_

## Notes

- Each route decomposition follows the same pattern: Model → Service → Controller → Validator → Route → Update server.js
- Dependencies flow downward: Routes → Controllers → Services → Models → Config
- Circular dependencies are forbidden
- All existing functionality must be preserved during migration
- API endpoint paths remain unchanged
- Authentication and authorization logic is maintained throughout
- Each task group can be executed in parallel within the wave
- Server.js is updated incrementally as routes are migrated

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.4"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 7, "tasks": ["8.1", "8.2"] }
  ]
}
```
