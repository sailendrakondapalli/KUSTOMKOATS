# Design Document

## Overview

This design document details the architectural transformation of the KUSTOMKOATS e-commerce platform from a monolithic structure to a professional enterprise-level architecture. The restructuring implements a clean MVC (Model-View-Controller) pattern on the backend with clear separation of concerns, and feature-based organization on the frontend to improve maintainability, scalability, and developer experience.

### Current State

**Backend:** Monolithic route files containing routing logic, HTTP handling, business logic, validation, and database queries all in a single file. No clear architectural layers.

**Frontend:** Flat page structure with pages scattered across multiple directories, admin code mixed with storefront code, and no consistent organizational pattern.

**Documentation:** Markdown files, SQL scripts, and guides scattered throughout the project root.

### Target State

**Backend:** Clean MVC architecture with distinct layers:
- **Routes Layer:** Thin routing definitions
- **Controller Layer:** HTTP request/response handling
- **Service Layer:** Business logic and orchestration
- **Model Layer:** Database interactions
- **Supporting Layers:** Validators, middleware, utilities, jobs, configuration

**Frontend:** Feature-based organization:
- **Storefront:** Feature folders organizing related pages, components, and logic
- **Admin Panel:** Separate root-level directory for independent admin application
- **Layouts:** Reusable layout components for consistent page structure

**Documentation:** Centralized `documentation/` directory with organized subdirectories for guides, deployment, database, and API documentation.

### Benefits

1. **Maintainability:** Each file has a single, clear responsibility
2. **Testability:** Layers can be tested independently with mocked dependencies
3. **Scalability:** New features follow established patterns and conventions
4. **Onboarding:** New developers can quickly understand the codebase structure
5. **Deployment Flexibility:** Admin panel can be deployed independently from storefront
6. **Code Reusability:** Shared business logic is centralized and easily accessible

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────┬───────────────────────────────┤
│      Storefront (React)         │   Admin Panel (React)         │
│   - Feature-based pages         │   - Separate deployment       │
│   - Shared components           │   - Admin components          │
│   - Layouts                     │   - Admin services            │
└─────────────────┬───────────────┴──────────┬────────────────────┘
                  │                          │
                  │      HTTP/REST API       │
                  │                          │
┌─────────────────┴──────────────────────────┴────────────────────┐
│                     Express Backend                              │
├──────────────────────────────────────────────────────────────────┤
│  Routes Layer (Endpoint Definitions)                             │
│    ↓                                                              │
│  Middleware Layer (Auth, Validation, Logging, Error Handling)    │
│    ↓                                                              │
│  Controller Layer (HTTP Concerns, Request/Response)              │
│    ↓                                                              │
│  Service Layer (Business Logic, Orchestration)                   │
│    ↓                                                              │
│  Model Layer (Database Queries, Data Access)                     │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│                   Supabase (PostgreSQL)                          │
│  - Products, Orders, Users, Categories, etc.                     │
└──────────────────────────────────────────────────────────────────┘
```

### Backend MVC Architecture

The backend follows a strict layered architecture where each layer has specific responsibilities and dependencies flow in one direction (downward).

#### Layers and Responsibilities

**1. Routes Layer** (`backend/src/routes/`)
- **Responsibility:** Define API endpoints and HTTP methods
- **Contains:** Route definitions, middleware application
- **Imports:** Controllers, middleware
- **Does NOT contain:** Business logic, validation logic, database queries

```javascript
// Example: routes/products.js
import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateProductCreate } from '../validators/productValidator.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', authenticateToken, requireAdmin, validateProductCreate, productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

export default router;
```

**2. Controller Layer** (`backend/src/controllers/`)
- **Responsibility:** Handle HTTP concerns (parse request, format response)
- **Contains:** Request parameter extraction, response formatting, HTTP status codes
- **Imports:** Services
- **Does NOT contain:** Business logic, database queries

```javascript
// Example: controllers/productController.js
import * as productService from '../services/productService.js';

export async function getProducts(req, res) {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    const result = await productService.fetchProducts({ category, search, limit, offset });
    
    res.json({
      data: result.products,
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
}
```

**3. Service Layer** (`backend/src/services/`)
- **Responsibility:** Business logic, data transformation, orchestration
- **Contains:** Business rules, multi-model coordination, data transformation
- **Imports:** Models, utilities
- **Does NOT contain:** HTTP concerns, database queries

```javascript
// Example: services/productService.js
import * as productModel from '../models/productModel.js';
import { formatProductForDisplay } from '../utils/formatting.js';

export async function fetchProducts({ category, search, limit, offset }) {
  const filters = { status: 'Active' };
  if (category) filters.category = category;
  if (search) filters.search = search;
  
  const { products, count } = await productModel.getProducts(filters, limit, offset);
  
  // Business logic: format products for display
  const formattedProducts = products.map(formatProductForDisplay);
  
  return { products: formattedProducts, count };
}
```

**4. Model Layer** (`backend/src/models/`)
- **Responsibility:** Database interactions, data access
- **Contains:** Database queries, raw data operations, database connection logic
- **Imports:** Database configuration
- **Does NOT contain:** Business logic, HTTP concerns

```javascript
// Example: models/productModel.js
import { supabase } from '../config/supabase.js';

export async function getProducts(filters, limit, offset) {
  let query = supabase
    .from('products')
    .select('id, name, description, price, category, stock, images, custom_id, status', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return { products: data, count };
}
```

**5. Validator Layer** (`backend/src/validators/`)
- **Responsibility:** Input validation schemas
- **Contains:** express-validator chains, validation rules
- **Exports:** Reusable validation middleware

```javascript
// Example: validators/productValidator.js
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

export const validateProductCreate = [
  body('name').isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  handleValidationErrors
];

export const validateProductId = [
  param('id').isUUID(),
  handleValidationErrors
];
```

**6. Middleware Layer** (`backend/src/middleware/`)
- **Responsibility:** Cross-cutting concerns
- **Contains:** Authentication, error handling, logging, request sanitization
- **Applied to:** Routes before controllers

**7. Utilities Layer** (`backend/src/utils/`)
- **Responsibility:** Pure helper functions
- **Contains:** Formatting, calculation, string manipulation, date utilities
- **Characteristics:** Stateless, reusable, testable

**8. Jobs Layer** (`backend/src/jobs/`)
- **Responsibility:** Background processing, scheduled tasks
- **Contains:** Email jobs, cleanup tasks, batch processing
- **Runs:** Independently of request/response cycle

**9. Configuration Layer** (`backend/src/config/`)
- **Responsibility:** Application configuration
- **Contains:** Database config, CORS config, server config
- **Environment:** Loads from environment variables

### Backend Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   ├── bundleController.js
│   │   ├── profileController.js
│   │   ├── promoController.js
│   │   ├── wholesaleController.js
│   │   ├── reviewController.js
│   │   ├── searchController.js
│   │   ├── storageController.js
│   │   ├── contentController.js
│   │   ├── wishlistController.js
│   │   ├── paymentFailureController.js
│   │   └── categoryShowcaseController.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── cartService.js
│   │   ├── categoryService.js
│   │   ├── bundleService.js
│   │   ├── profileService.js
│   │   ├── promoService.js
│   │   ├── wholesaleService.js
│   │   ├── reviewService.js
│   │   ├── searchService.js
│   │   ├── storageService.js
│   │   ├── contentService.js
│   │   ├── wishlistService.js
│   │   ├── paymentFailureService.js
│   │   └── categoryShowcaseService.js
│   │
│   ├── models/
│   │   ├── authModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   ├── cartModel.js
│   │   ├── categoryModel.js
│   │   ├── bundleModel.js
│   │   ├── profileModel.js
│   │   ├── promoModel.js
│   │   ├── wholesaleModel.js
│   │   ├── reviewModel.js
│   │   ├── searchModel.js
│   │   ├── storageModel.js
│   │   ├── contentModel.js
│   │   ├── wishlistModel.js
│   │   ├── paymentFailureModel.js
│   │   └── categoryShowcaseModel.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── productValidator.js
│   │   ├── orderValidator.js
│   │   ├── cartValidator.js
│   │   ├── categoryValidator.js
│   │   ├── bundleValidator.js
│   │   ├── profileValidator.js
│   │   ├── promoValidator.js
│   │   ├── wholesaleValidator.js
│   │   └── reviewValidator.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── logging.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── categories.js
│   │   ├── bundles.js
│   │   ├── profile.js
│   │   ├── promo.js
│   │   ├── wholesale.js
│   │   ├── reviews.js
│   │   ├── search.js
│   │   ├── storage.js
│   │   ├── content.js
│   │   ├── wishlist.js
│   │   ├── payment-failures.js
│   │   ├── category-showcase.js
│   │   └── index.js (route aggregator)
│   │
│   ├── utils/
│   │   ├── formatting.js
│   │   ├── validation.js
│   │   ├── errorHandling.js
│   │   └── logger.js
│   │
│   ├── jobs/
│   │   ├── emailJob.js
│   │   ├── orderProcessingJob.js
│   │   └── cleanupJob.js
│   │
│   └── config/
│       ├── supabase.js
│       ├── cors.js
│       └── server.js
│
├── server.js (minimal entry point)
├── package.json
├── .env
└── .env.example
```

### Frontend Architecture

The frontend is organized by features with clear separation between storefront and admin functionality.

#### Frontend Directory Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── HomePage.jsx
│   │   │   └── components/
│   │   ├── Products/
│   │   │   ├── ProductsPage.jsx
│   │   │   └── components/
│   │   ├── ProductDetails/
│   │   │   ├── ProductDetailPage.jsx
│   │   │   └── components/
│   │   ├── Cart/
│   │   │   ├── CartPage.jsx
│   │   │   └── components/
│   │   ├── Checkout/
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   └── components/
│   │   ├── Login/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AuthCallbackPage.jsx
│   │   │   └── components/
│   │   ├── Orders/
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetailPage.jsx
│   │   │   └── components/
│   │   ├── Profile/
│   │   │   ├── ProfilePage.jsx
│   │   │   └── components/
│   │   ├── Wishlist/
│   │   │   ├── WishlistPage.jsx
│   │   │   └── components/
│   │   ├── About/
│   │   │   └── (existing about pages)
│   │   ├── Shop/
│   │   │   └── (existing shop pages)
│   │   ├── Wholesale/
│   │   │   └── (existing wholesale pages)
│   │   └── Kulture/
│   │       └── (existing kulture pages)
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx (Navbar + Footer for storefront)
│   │   ├── AdminLayout.jsx (Admin sidebar + header)
│   │   └── EmptyLayout.jsx (No header/footer)
│   │
│   ├── components/ (shared components)
│   ├── services/ (API service layer)
│   ├── hooks/ (custom React hooks)
│   ├── context/ (React context providers)
│   ├── utils/ (utility functions)
│   ├── store/ (state management)
│   ├── config/ (configuration)
│   ├── theme/ (styling and theming)
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js

admin-panel/ (root level, separate from frontend)
├── pages/
│   ├── Dashboard/
│   ├── Products/
│   ├── Orders/
│   ├── Categories/
│   ├── Users/
│   └── Analytics/
│
├── components/
│   ├── AdminSidebar.jsx
│   ├── AdminHeader.jsx
│   └── ...
│
├── services/
│   ├── adminProductService.js
│   ├── adminOrderService.js
│   └── ...
│
└── utils/
```

#### Layout System

Layouts wrap pages to provide consistent structure:

```javascript
// layouts/MainLayout.jsx
export function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// layouts/AdminLayout.jsx
export function AdminLayout({ children }) {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}

// App.jsx usage
<Route path="/products" element={
  <MainLayout>
    <ProductsPage />
  </MainLayout>
} />
```

---

## Components and Interfaces

### Backend Route Decomposition Pattern

Each existing monolithic route file will be decomposed into three files following this pattern:

**Example: products.js decomposition**

```
Current:
backend/routes/products.js (500+ lines)
  - Route definitions
  - Validation schemas
  - Request handling
  - Business logic
  - Database queries
  - Error handling

After:
backend/src/routes/products.js (50 lines)
  - Route definitions only
  
backend/src/controllers/productController.js (150 lines)
  - HTTP request/response handling
  - Parameter extraction
  - Response formatting
  
backend/src/services/productService.js (200 lines)
  - Business logic
  - Data transformation
  - Multi-model orchestration
  
backend/src/models/productModel.js (100 lines)
  - Database queries
  - Data access layer
  
backend/src/validators/productValidator.js (50 lines)
  - Validation schemas
  - Validation middleware
```

### File Decomposition Strategy

For each route file, the decomposition follows this systematic approach:

1. **Identify Route Endpoints:** Extract all `router.get()`, `router.post()`, etc. definitions
2. **Extract Validation:** Move express-validator chains to validators
3. **Separate HTTP Logic:** Move request parsing and response formatting to controllers
4. **Isolate Business Logic:** Move data transformation and business rules to services
5. **Extract Database Queries:** Move all Supabase queries to models

### Interface Contracts

**Controller → Service:**
```javascript
// Controllers pass plain JavaScript objects
const result = await productService.fetchProducts({ 
  category, 
  search, 
  limit, 
  offset 
});

// Services return plain JavaScript objects/arrays
return { products: [...], count: 100 };
```

**Service → Model:**
```javascript
// Services pass filters and parameters
const { products, count } = await productModel.getProducts(
  { status: 'Active', category: 'Paint' },
  50,
  0
);

// Models return raw database results
return { products: data, count };
```

### Module Boundaries

Each layer has clear boundaries:

- **Routes** can import: Controllers, Middleware, Validators
- **Controllers** can import: Services, Utilities
- **Services** can import: Models, Utilities
- **Models** can import: Configuration
- **Validators** can import: Middleware
- **Utilities** can import: Nothing (pure functions)

**Circular dependencies are forbidden.** Dependencies flow in one direction (downward in the layer stack).

---

## Data Models

### Database Schema (Existing)

The existing Supabase PostgreSQL database schema remains unchanged. This restructuring is purely a code organization effort. Key tables include:

- **products:** Product catalog
- **orders:** Customer orders
- **order_items:** Order line items
- **users:** User accounts
- **categories:** Product categories
- **bundles:** Product bundle definitions
- **product_bundles:** Many-to-many bundle relationships
- **cart_items:** Shopping cart
- **wishlists:** User wishlists
- **reviews:** Product reviews
- **promo_codes:** Promotional codes
- **wholesale_requests:** Wholesale inquiries
- **payment_failures:** Failed payment tracking

### Model Layer Data Structures

Models return raw database data structures without transformation:

```javascript
// productModel.js
export async function getProducts(filters, limit, offset) {
  // Returns: { products: Product[], count: number }
  // Product: { id, name, description, price, category, stock, images, custom_id, status, created_at, updated_at }
}

export async function getProductById(id) {
  // Returns: Product | null
}

export async function createProduct(productData) {
  // Returns: Product
}

export async function updateProduct(id, updates) {
  // Returns: Product
}

export async function deleteProduct(id) {
  // Returns: { success: boolean }
}
```

### Service Layer Data Transformation

Services apply business logic and transform data for consumption:

```javascript
// productService.js
export async function fetchProducts({ category, search, limit, offset }) {
  const filters = { status: 'Active' };
  if (category) filters.category = category;
  if (search) filters.search = search;
  
  const { products, count } = await productModel.getProducts(filters, limit, offset);
  
  // Business logic: format products, calculate discounts, enrich data
  const formattedProducts = products.map(product => ({
    ...product,
    displayPrice: formatPrice(product.price),
    inStock: product.stock > 0,
    thumbnailUrl: product.images?.[0] || '/placeholder.png'
  }));
  
  return { products: formattedProducts, count };
}
```

---

## Error Handling

### Error Handling Architecture

A centralized error handling system ensures consistent error responses across all endpoints.

#### Error Handler Middleware

```javascript
// middleware/errorHandler.js
export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;
  
  // Log error
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`, {
    statusCode,
    message: err.message,
    errorCode: err.errorCode,
    stack: err.stack
  });
  
  // Send response
  res.status(statusCode).json({
    error: isOperational ? err.message : 'Internal Server Error',
    errorCode: err.errorCode,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
}
```

#### Error Handling Flow

1. **Model Layer:** Throws native errors from database operations
2. **Service Layer:** Catches model errors, wraps in AppError with business context
3. **Controller Layer:** Catches service errors, determines HTTP status code
4. **Error Middleware:** Logs and formats final response

#### Example Error Flow

```javascript
// Model
export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error; // Native Supabase error
  }
  return data;
}

// Service
export async function fetchProduct(id) {
  try {
    const product = await productModel.getProductById(id);
    
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    
    if (product.status !== 'Active') {
      throw new AppError('Product is not available', 403, 'PRODUCT_UNAVAILABLE');
    }
    
    return formatProductForDisplay(product);
  } catch (error) {
    if (error.isOperational) throw error;
    throw new AppError('Failed to fetch product', 500, 'FETCH_ERROR');
  }
}

// Controller
export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.fetchProduct(id);
    res.json({ data: product });
  } catch (error) {
    next(error); // Pass to error middleware
  }
}
```

### Standard Error Codes

```javascript
// Common error codes
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_PROMO_CODE: 'INVALID_PROMO_CODE',
  CART_EMPTY: 'CART_EMPTY',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};
```

### Validation Error Handling

```javascript
// middleware/validation.js
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
}
```

---

## Testing Strategy

### Testing Approach

This restructuring project requires a testing strategy focused on **integration testing**, **migration verification**, and **regression testing** rather than property-based testing. The nature of this work is infrastructure refactoring, not new feature development.

#### Why Property-Based Testing Does NOT Apply

Property-based testing (PBT) is designed for testing pure functions and business logic with universal properties. This project involves:

1. **Infrastructure as Code:** Reorganizing files and directories
2. **Code Movement:** Moving code between files without changing behavior
3. **Configuration Changes:** Updating import paths and module resolution
4. **No New Business Logic:** Preserving existing functionality

**PBT is NOT appropriate for:**
- File movement and reorganization
- Import path updates
- Directory structure changes
- Configuration management
- Code refactoring without behavior changes

### Testing Layers

#### 1. Unit Tests (Post-Migration)

After restructuring, each layer can be tested independently:

**Controller Tests:**
```javascript
// controllers/productController.test.js
describe('Product Controller', () => {
  it('should fetch products and return formatted response', async () => {
    // Mock service
    const mockService = {
      fetchProducts: jest.fn().mockResolvedValue({
        products: [{ id: '1', name: 'Test' }],
        count: 1
      })
    };
    
    const req = { query: { limit: 10, offset: 0 } };
    const res = { json: jest.fn() };
    
    await productController.getProducts(req, res);
    
    expect(res.json).toHaveBeenCalledWith({
      data: expect.any(Array),
      total: 1,
      limit: 10,
      offset: 0
    });
  });
});
```

**Service Tests:**
```javascript
// services/productService.test.js
describe('Product Service', () => {
  it('should apply business logic and transform product data', async () => {
    // Mock model
    const mockModel = {
      getProducts: jest.fn().mockResolvedValue({
        products: [{ id: '1', name: 'Test', price: 1000, stock: 5 }],
        count: 1
      })
    };
    
    const result = await productService.fetchProducts({ limit: 10, offset: 0 });
    
    expect(result.products[0]).toHaveProperty('displayPrice');
    expect(result.products[0]).toHaveProperty('inStock', true);
  });
});
```

**Model Tests:**
```javascript
// models/productModel.test.js
describe('Product Model', () => {
  it('should fetch products from database with correct filters', async () => {
    // Mock Supabase
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
    };
    
    const result = await productModel.getProducts({ status: 'Active' }, 10, 0);
    
    expect(mockSupabase.from).toHaveBeenCalledWith('products');
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('count');
  });
});
```

#### 2. Integration Tests

Test the full request flow through all layers:

```javascript
// integration/products.test.js
describe('Products API Integration', () => {
  it('should fetch products through full stack', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ limit: 10, offset: 0 })
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  it('should create product with admin authentication', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        price: 1000,
        stock: 10
      })
      .expect(201);
    
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('Test Product');
  });
});
```

#### 3. Migration Verification Tests

Automated tests to verify migration correctness:

```javascript
// migration/verification.test.js
describe('Migration Verification', () => {
  it('all route files should exist in new location', () => {
    const routeFiles = [
      'auth.js', 'products.js', 'orders.js', 'cart.js',
      // ... all route files
    ];
    
    routeFiles.forEach(file => {
      const path = `./backend/src/routes/${file}`;
      expect(fs.existsSync(path)).toBe(true);
    });
  });
  
  it('all controllers should exist', () => {
    const controllers = [
      'authController.js', 'productController.js', 'orderController.js',
      // ... all controllers
    ];
    
    controllers.forEach(file => {
      const path = `./backend/src/controllers/${file}`;
      expect(fs.existsSync(path)).toBe(true);
    });
  });
  
  it('no files should remain in old routes location', () => {
    const oldPath = './backend/routes/';
    expect(fs.existsSync(oldPath)).toBe(false);
  });
});
```

#### 4. Regression Tests

Ensure existing functionality is preserved:

```javascript
// regression/api.test.js
describe('API Regression Tests', () => {
  const endpoints = [
    { method: 'GET', path: '/api/products' },
    { method: 'GET', path: '/api/categories' },
    { method: 'GET', path: '/api/bundles' },
    // ... all public endpoints
  ];
  
  endpoints.forEach(({ method, path }) => {
    it(`${method} ${path} should respond successfully`, async () => {
      await request(app)[method.toLowerCase()](path)
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        });
    });
  });
});
```

#### 5. Frontend Tests

**Component Tests:**
```javascript
// pages/Products/ProductsPage.test.jsx
describe('ProductsPage', () => {
  it('should render products list', () => {
    render(<ProductsPage />);
    expect(screen.getByText(/products/i)).toBeInTheDocument();
  });
});
```

**Route Tests:**
```javascript
// routes/routes.test.jsx
describe('Application Routes', () => {
  it('should render home page at /', () => {
    render(<App />, { initialRoute: '/' });
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });
  
  it('should render products page at /products', () => {
    render(<App />, { initialRoute: '/products' });
    expect(screen.getByText(/products/i)).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- **Unit Tests:** 80% coverage for services and models
- **Integration Tests:** All API endpoints tested
- **Migration Verification:** 100% file movement verification
- **Regression Tests:** All existing endpoints tested

### Test Execution Strategy

1. **Pre-Migration:** Run existing tests to establish baseline
2. **During Migration:** Run verification tests after each module migration
3. **Post-Migration:** Run full test suite (unit + integration + regression)
4. **Continuous:** Add new tests for each newly structured module

---

## Migration Execution Phases

The migration will be executed in carefully planned phases to minimize risk and maintain system functionality.

### Phase 1: Preparation and Setup

**Objective:** Set up new directory structure and infrastructure

**Tasks:**
1. Create `backend/src/` directory structure
2. Create all subdirectories: `controllers/`, `services/`, `models/`, `validators/`, `utils/`, `jobs/`, `routes/`, `middleware/`, `config/`
3. Create `frontend/src/layouts/` directory
4. Create feature folders in `frontend/src/pages/`
5. Create `admin-panel/` root directory
6. Create `database/` root directory
7. Create `documentation/` root directory with subdirectories
8. Set up import path aliasing in package.json and tsconfig/jsconfig if needed
9. Create migration tracking document

**Duration:** 1 day

**Verification:**
- All directories exist
- No existing code is affected

### Phase 2: Backend Middleware and Configuration

**Objective:** Move and refactor cross-cutting concerns first

**Tasks:**
1. Move `backend/middleware/auth.js` to `backend/src/middleware/auth.js`
2. Move `backend/middleware/validation.js` to `backend/src/middleware/validation.js`
3. Create `backend/src/middleware/errorHandler.js`
4. Create `backend/src/middleware/logging.js`
5. Move `backend/config/supabase.js` to `backend/src/config/supabase.js`
6. Create `backend/src/config/cors.js`
7. Create `backend/src/config/server.js`
8. Update all import references to middleware and config

**Duration:** 1 day

**Verification:**
- Middleware tests pass
- Server starts successfully
- All routes can still import middleware

### Phase 3: Backend Utilities Layer

**Objective:** Extract and centralize utility functions

**Tasks:**
1. Identify utility functions across all route files
2. Create `backend/src/utils/formatting.js`
3. Create `backend/src/utils/validation.js`
4. Create `backend/src/utils/errorHandling.js`
5. Create `backend/src/utils/logger.js`
6. Extract utility functions from route files
7. Update imports in files using utilities

**Duration:** 2 days

**Verification:**
- Utility functions are pure and testable
- No circular dependencies
- All imports resolve correctly

### Phase 4: Backend Route Decomposition (Iterative)

**Objective:** Decompose each route file into MVC layers

**Approach:** One route file at a time, following this pattern:

1. **Select route file** (e.g., products.js)
2. **Create model file** (e.g., productModel.js)
   - Extract all Supabase queries
   - Remove business logic
   - Return raw data
3. **Create service file** (e.g., productService.js)
   - Import model
   - Extract business logic
   - Add data transformation
4. **Create controller file** (e.g., productController.js)
   - Import service
   - Extract HTTP handling
   - Format responses
5. **Create validator file** (e.g., productValidator.js)
   - Extract validation chains
   - Export middleware
6. **Update route file** (e.g., products.js)
   - Keep only endpoint definitions
   - Import controller, validator
   - Apply middleware
7. **Test the module**
   - Run integration tests
   - Verify functionality
8. **Move route file** to `backend/src/routes/`
9. **Update server.js import**

**Route Files Order:**
1. products.js (most critical, good reference)
2. categories.js
3. orders.js
4. cart.js
5. auth.js
6. profile.js
7. bundles.js
8. promo.js
9. wholesale.js
10. reviews.js
11. search.js
12. storage.js
13. content.js
14. wishlist.js
15. payment-failures.js
16. category-showcase.js

**Duration:** 10-12 days (1 route file per day average)

**Verification for Each Route:**
- Model tests pass
- Service tests pass
- Controller tests pass
- Integration tests pass
- Endpoints return expected responses
- No regression in functionality

### Phase 5: Backend Server Entry Point Refactoring

**Objective:** Simplify server.js to minimal entry point

**Tasks:**
1. Create `backend/src/routes/index.js` as route aggregator
2. Move CORS configuration to `backend/src/config/cors.js`
3. Move logging middleware to `backend/src/middleware/logging.js`
4. Update server.js to import from new locations
5. Simplify server.js to only:
   - Load environment
   - Configure Express app
   - Apply middleware
   - Register routes
   - Start server
6. Remove old `backend/routes/` directory

**Duration:** 1 day

**Verification:**
- Server starts successfully
- All routes are registered
- Middleware is applied correctly
- Health check endpoint works

### Phase 6: Frontend Layout System

**Objective:** Create reusable layout components

**Tasks:**
1. Create `frontend/src/layouts/MainLayout.jsx`
2. Create `frontend/src/layouts/AdminLayout.jsx`
3. Create `frontend/src/layouts/EmptyLayout.jsx`
4. Extract Navbar and Footer into layout
5. Update App.jsx to use layouts
6. Test layout rendering

**Duration:** 1 day

**Verification:**
- Layouts render correctly
- Navigation works
- Footer displays

### Phase 7: Frontend Feature Organization

**Objective:** Organize storefront pages into feature folders

**Tasks:**
1. Move HomePage.jsx to `pages/Home/HomePage.jsx`
2. Move ProductsPage.jsx to `pages/Products/ProductsPage.jsx`
3. Move ProductDetailPage.jsx to `pages/ProductDetails/ProductDetailPage.jsx`
4. Move CartPage.jsx to `pages/Cart/CartPage.jsx`
5. Move CheckoutPage.jsx and OrderSuccessPage.jsx to `pages/Checkout/`
6. Move LoginPage.jsx and AuthCallbackPage.jsx to `pages/Login/`
7. Move OrdersPage.jsx and OrderDetailPage.jsx to `pages/Orders/`
8. Move ProfilePage.jsx to `pages/Profile/ProfilePage.jsx`
9. Move WishlistPage.jsx to `pages/Wishlist/WishlistPage.jsx`
10. Update all import statements in App.jsx
11. Update all import statements in components
12. Keep existing folder structure for about/, shop/, wholesale/, kulture/

**Duration:** 2 days

**Verification:**
- All routes resolve correctly
- Navigation works
- No broken imports

### Phase 8: Admin Panel Separation

**Objective:** Move admin code to separate root-level directory

**Tasks:**
1. Create `admin-panel/pages/` directory structure
2. Move all files from `frontend/src/pages/admin/` to `admin-panel/pages/`
3. Create `admin-panel/components/`
4. Create `admin-panel/services/`
5. Update admin page imports in App.jsx
6. Update admin routes
7. Test admin panel functionality

**Duration:** 2 days

**Verification:**
- Admin routes work
- Admin components render
- Admin API calls succeed

### Phase 9: Database Directory Restructuring

**Objective:** Move database files to root level

**Tasks:**
1. Move `backend/database/migrations/` to `database/migrations/`
2. Create `database/schemas/` directory
3. Create `database/seeders/` directory
4. Update any migration references
5. Remove old `backend/database/` directory

**Duration:** 1 day

**Verification:**
- Migrations are accessible
- No broken references

### Phase 10: Documentation Consolidation

**Objective:** Organize all documentation files

**Tasks:**
1. Create `documentation/guides/`
2. Create `documentation/deployment/`
3. Create `documentation/database/`
4. Create `documentation/api/`
5. Create `documentation/architecture/`
6. Move deployment .md files to `documentation/deployment/`
7. Move database .md files to `documentation/database/`
8. Move guide .md files to `documentation/guides/`
9. Move all root SQL files to `documentation/database/queries/`
10. Keep README.md at root
11. Create BACKEND-ARCHITECTURE.md
12. Create FRONTEND-ARCHITECTURE.md

**Duration:** 1 day

**Verification:**
- All documentation is organized
- No files remain in root except README.md
- Architecture documentation is complete

### Phase 11: Testing and Verification

**Objective:** Comprehensive testing of migrated system

**Tasks:**
1. Run full backend test suite
2. Run full frontend test suite
3. Run integration tests
4. Run regression tests
5. Manual testing of all major features:
   - Browse products
   - Add to cart
   - Checkout process
   - User authentication
   - Admin panel
   - Order management
6. Performance testing
7. Error handling verification

**Duration:** 3 days

**Verification:**
- All tests pass
- No regressions found
- Performance is maintained
- Error handling works correctly

### Phase 12: Documentation and Cleanup

**Objective:** Finalize documentation and remove obsolete code

**Tasks:**
1. Update all README files
2. Document migration changes
3. Create developer onboarding guide
4. Document new architecture
5. Update API documentation
6. Remove any obsolete files
7. Clean up comments and TODOs
8. Final code review

**Duration:** 2 days

**Deliverables:**
- Complete architecture documentation
- Updated README files
- Developer onboarding guide
- API documentation
- Migration summary report

---

## Configuration Management

### Environment Configuration

Configuration will be centralized in the `backend/src/config/` directory:

#### Supabase Configuration

```javascript
// config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### CORS Configuration

```javascript
// config/cors.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://www.kustomkoats.in',
  'https://kustomkoats.in',
  'https://kustomkoats.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

export const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log(`⚠️  Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

#### Server Configuration

```javascript
// config/server.js
export const serverConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiPrefix: '/api',
  bodyLimit: '10mb'
};
```

### Refactored Server Entry Point

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { serverConfig } from './src/config/server.js';
import { corsOptions } from './src/config/cors.js';
import { sanitizeBody } from './src/middleware/validation.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { requestLogger, responseLogger } from './src/middleware/logging.js';
import routes from './src/routes/index.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: serverConfig.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: serverConfig.bodyLimit }));

// Input sanitization
app.use(sanitizeBody);

// Request/Response logging
app.use(requestLogger);
app.use(responseLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'KustomKoats Backend API'
  });
});

// API routes
app.use(serverConfig.apiPrefix, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(serverConfig.port, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   KustomKoats Backend API Server              ║
║   Running on: http://localhost:${serverConfig.port}        ║
║   Environment: ${serverConfig.nodeEnv}                 ║
║   Frontend URL: ${serverConfig.frontendUrl} ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
```

### Route Aggregator

```javascript
// routes/index.js
import express from 'express';
import authRoutes from './auth.js';
import productsRoutes from './products.js';
import ordersRoutes from './orders.js';
import cartRoutes from './cart.js';
import categoriesRoutes from './categories.js';
import bundlesRoutes from './bundles.js';
import profileRoutes from './profile.js';
import promoRoutes from './promo.js';
import wholesaleRoutes from './wholesale.js';
import reviewsRoutes from './reviews.js';
import searchRoutes from './search.js';
import storageRoutes from './storage.js';
import contentRoutes from './content.js';
import wishlistRoutes from './wishlist.js';
import paymentFailuresRoutes from './payment-failures.js';
import categoryShowcaseRoutes from './category-showcase.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoriesRoutes);
router.use('/bundles', bundlesRoutes);
router.use('/profile', profileRoutes);
router.use('/promo', promoRoutes);
router.use('/wholesale', wholesaleRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/search', searchRoutes);
router.use('/storage', storageRoutes);
router.use('/content', contentRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/payment-failures', paymentFailuresRoutes);
router.use('/category-showcase', categoryShowcaseRoutes);

export default router;
```

---

## Import Path Resolution Strategy

### Import Path Conventions

To maintain consistency and avoid confusion, the following import path conventions will be used:

#### Backend Import Paths

**Within Same Layer (Relative):**
```javascript
// In controllers/productController.js
import { formatProduct } from './productController.helpers.js';
```

**Cross-Layer (Absolute from src/):**
```javascript
// In controllers/productController.js
import * as productService from '../services/productService.js';
import { logger } from '../utils/logger.js';
```

**Configuration and Middleware:**
```javascript
// In any file
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
```

#### Frontend Import Paths

**Pages:**
```javascript
// In App.jsx
import HomePage from './pages/Home/HomePage.jsx';
import ProductsPage from './pages/Products/ProductsPage.jsx';
```

**Admin:**
```javascript
// In App.jsx
import AdminDashboard from '../admin-panel/pages/Dashboard/AdminDashboard.jsx';
```

**Layouts:**
```javascript
// In App.jsx
import MainLayout from './layouts/MainLayout.jsx';
```

**Services:**
```javascript
// In any component
import { fetchProducts } from '../../services/productService.js';
```

### Import Path Update Strategy

During migration, import paths will be updated using this systematic approach:

1. **Move File First:** Move the file to its new location
2. **Update Imports In File:** Update all imports within the moved file
3. **Find All References:** Use search to find all files importing the moved file
4. **Update References:** Update import paths in all referencing files
5. **Test:** Verify the application runs without import errors

### Automated Import Path Updates

Consider using tools to assist with import path updates:

```bash
# Find all imports of a specific file
grep -r "from.*products.js" backend/

# Use sed for batch replacements (with caution)
find backend/src -name "*.js" -exec sed -i 's|../routes/products|../routes/products|g' {} +
```

### Import Path Validation

Create a script to validate import paths after migration:

```javascript
// scripts/validate-imports.js
import fs from 'fs';
import path from 'path';

function validateImports(directory) {
  const files = getAllJsFiles(directory);
  const errors = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content);
    
    imports.forEach(importPath => {
      const resolvedPath = path.resolve(path.dirname(file), importPath);
      if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.js')) {
        errors.push({
          file,
          import: importPath,
          resolved: resolvedPath
        });
      }
    });
  });
  
  return errors;
}

// Run validation
const errors = validateImports('./backend/src');
if (errors.length > 0) {
  console.error('Import errors found:', errors);
  process.exit(1);
}
```

---

## Summary

This design document provides a comprehensive blueprint for transforming the KUSTOMKOATS e-commerce platform from a monolithic architecture to a professional enterprise-level structure. The migration follows a phased approach that minimizes risk, maintains functionality, and establishes a maintainable foundation for future development.

**Key Transformations:**

1. **Backend:** Monolithic route files → Clean MVC layers (Routes, Controllers, Services, Models)
2. **Frontend:** Flat page structure → Feature-based organization with separate admin panel
3. **Documentation:** Scattered files → Centralized documentation directory
4. **Configuration:** Inline config → Dedicated config modules
5. **Error Handling:** Ad-hoc → Standardized error handling middleware

**Expected Outcomes:**

- **Improved Maintainability:** Clear file responsibilities and predictable locations
- **Better Testability:** Independent layer testing with mocked dependencies
- **Enhanced Scalability:** Established patterns for adding new features
- **Faster Onboarding:** Intuitive structure and comprehensive documentation
- **Deployment Flexibility:** Admin panel can be deployed separately from storefront

The migration will take approximately 25-30 days with careful execution and thorough testing at each phase.
