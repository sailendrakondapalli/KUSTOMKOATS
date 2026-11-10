# Design Document: Complete Backend API Migration

## Overview

This design provides a comprehensive architectural approach for migrating all frontend direct Supabase database calls to a secure backend API architecture. The migration eliminates security vulnerabilities where database structure, credentials, and sensitive data are exposed in browser network traffic by establishing the backend at `https://kustomkoats-backend.onrender.com/api` as the single point of data access.

### Current State

The frontend currently makes direct database queries using the Supabase client library, which exposes:
- Database schema and table structures in browser network traffic
- Supabase API URLs and project information
- Query patterns that reveal business logic
- Potential security vulnerabilities through client-side query manipulation

### Target State

After migration:
- All database operations flow through the backend API
- Frontend uses `lib/apiClient.js` exclusively for data access
- Zero direct Supabase database requests in browser network traffic (auth operations excepted)
- Backend enforces authentication, authorization, and validation
- Standardized error handling and response formats

### Migration Scope

**Pages to Migrate:**
- Admin pages: Blog management, bundles, categories, products
- Public pages: Our Philosophy, Our Story, Blog posts, Testimonials, FAQ, Gallery
- Components: Footer, Reviews Section, Related Bundles
- Forms: Contact, Enquiry, Wholesale application

**API Coverage:**
- Blog posts and categories
- Bundles and bundle items
- Product categories
- Reviews and testimonials
- FAQ entries
- Gallery items
- Footer links
- Page content
- Search and filtering
- File uploads

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Frontend)                       │
│  ┌────────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  Admin Pages   │    │ Public Pages │    │   Components   │  │
│  │  - Blog Mgmt   │    │ - Our Story  │    │   - Footer     │  │
│  │  - Bundles     │    │ - Blog Posts │    │   - Reviews    │  │
│  │  - Categories  │    │ - Testimonial│    │   - Bundles    │  │
│  │  - Products    │    │ - FAQ        │    │                │  │
│  └────────┬───────┘    └──────┬───────┘    └────────┬───────┘  │
│           │                   │                      │           │
│           └───────────────────┴──────────────────────┘           │
│                               │                                  │
│                    ┌──────────▼──────────┐                       │
│                    │   lib/apiClient.js  │                       │
│                    │  (Axios with Auth)  │                       │
│                    └──────────┬──────────┘                       │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                      HTTPS (JSON over SSL)
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│               Backend API (Express.js)                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                            │   │
│  │  - CORS validation                                       │   │
│  │  - Request sanitization                                  │   │
│  │  - Auth token verification (JWT)                         │   │
│  │  - Role-based access control (Admin/User)                │   │
│  │  - Request validation (express-validator)                │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │              Route Handlers                              │   │
│  │  /api/content/*   - Blog, FAQs, Testimonials            │   │
│  │  /api/bundles     - Bundle management                     │   │
│  │  /api/products    - Product operations                    │   │
│  │  /api/reviews     - Review submission/retrieval           │   │
│  │  /api/storage     - File upload/download                  │   │
│  │  /api/orders      - Order management                      │   │
│  │  /api/wholesale   - Wholesale applications                │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │         Supabase Client (Server-side)                    │   │
│  │  - Database queries with service role key                │   │
│  │  - Row-level security bypassed (secure server context)   │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│                    Supabase Database                              │
│  - PostgreSQL with Row-Level Security                             │
│  - Tables: products, bundles, blog, categories, etc.              │
│  - Storage buckets for images and files                           │
└───────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
Frontend Login                Backend Verification              Supabase Auth
      │                              │                               │
      │ POST /api/auth/login         │                               │
      ├─────────────────────────────>│                               │
      │  { email, password }          │ signInWithPassword()          │
      │                              ├──────────────────────────────>│
      │                              │                               │
      │                              │<──────────────────────────────┤
      │                              │  { user, session, access_token}│
      │<─────────────────────────────┤                               │
      │ { success: true, data: {...}}│                               │
      │                              │                               │
      │                              │                               │
   Store token                       │                               │
   in memory                         │                               │
      │                              │                               │
      │ GET /api/products            │                               │
      │ Authorization: Bearer <token>│                               │
      ├─────────────────────────────>│                               │
      │                              │ Verify JWT                    │
      │                              ├──────────────────────────────>│
      │                              │                               │
      │                              │<──────────────────────────────┤
      │                              │  { user data }                │
      │                              │                               │
      │                              │ Query Database                │
      │                              │ (with verified user context)  │
      │<─────────────────────────────┤                               │
      │  { success: true, data: [...]}│                              │
```

### Data Flow Examples

#### Example 1: Public Page Loading Blog Posts

```
1. User visits /blog
2. BlogPage.jsx calls: await apiClient.get('/content/blog')
3. API request flows through interceptor (adds auth if available)
4. Backend route: GET /api/content/blog
5. Middleware: CORS check, sanitization
6. Handler queries: supabase.from('kustom_kultor_blog').select('*').eq('is_published', true)
7. Backend returns: { success: true, data: [blog posts] }
8. Frontend renders blog list
```

#### Example 2: Admin Creating New Blog Post

```
1. Admin fills blog form in AdminBlogPage
2. Form submission: await apiClient.post('/content/blog', formData)
3. API request includes Authorization: Bearer <admin-token>
4. Backend route: POST /api/content/blog
5. Middleware: Auth verification, requireAdmin check, input validation
6. Handler inserts: supabase.from('kustom_kultor_blog').insert([data])
7. Backend returns: { success: true, data: newPost, message: 'Blog post created' }
8. Frontend shows success notification, updates UI
```

#### Example 3: Image Upload Flow

```
1. Admin selects image file
2. Frontend calls: await storageAPI.getUploadUrl('products', filename, contentType)
3. Backend generates: signed upload URL with expiration
4. Backend returns: { success: true, data: { signedUrl, path, token } }
5. Frontend uploads file directly to Supabase storage using signed URL
6. On success, frontend receives public URL
7. Frontend includes image URL in product data when saving
```

## Components and Interfaces

### Frontend API Client Structure

```javascript
// lib/apiClient.js - Central API client

import axios from 'axios';
import { supabase } from './supabase';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Attempt token refresh
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session?.access_token) {
        error.config.headers.Authorization = `Bearer ${session.access_token}`;
        error.config._retry = true;
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Backend API Endpoints

#### Content Management Endpoints

```javascript
// GET /api/content/blog - Get all blog posts (public)
// Query params: ?limit=10
// Response: { success: true, data: [posts] }

// GET /api/content/blog/:slug - Get single blog post by slug (public)
// Response: { success: true, data: post }

// POST /api/content/blog - Create blog post (admin only)
// Body: { title, slug, content, excerpt, image_url, author, is_published }
// Response: { success: true, data: newPost, message: 'Blog post created successfully' }

// PUT /api/content/blog/:id - Update blog post (admin only)
// Body: { title?, content?, is_published?, ... }
// Response: { success: true, data: updatedPost, message: 'Blog post updated successfully' }

// DELETE /api/content/blog/:id - Delete blog post (admin only)
// Response: { success: true, message: 'Blog post deleted successfully' }

// GET /api/content/categories - Get all categories (public)
// Response: { success: true, data: [categories] }

// GET /api/content/testimonials - Get all testimonials (public)
// Query params: ?limit=10
// Response: { success: true, data: [testimonials] }

// POST /api/content/testimonials - Create testimonial (admin)
// Body: { name, content, rating, image_url?, designation?, is_active? }
// Response: { success: true, data: newTestimonial, message: 'Testimonial created successfully' }

// PUT /api/content/testimonials/:id - Update testimonial (admin)
// DELETE /api/content/testimonials/:id - Delete testimonial (admin)

// GET /api/content/faqs - Get all FAQs (public)
// Response: { success: true, data: [faqs] }

// POST /api/content/faqs - Create FAQ (admin)
// PUT /api/content/faqs/:id - Update FAQ (admin)
// DELETE /api/content/faqs/:id - Delete FAQ (admin)

// GET /api/content/footer-links - Get footer links (public)
// Response: { success: true, data: [links] }

// POST /api/content/footer-links - Create footer link (admin)
// PUT /api/content/footer-links/:id - Update footer link (admin)
// DELETE /api/content/footer-links/:id - Delete footer link (admin)

// GET /api/content/policy/:slug - Get policy page by slug (public)
// PUT /api/content/policy/:slug - Update policy page (admin)

// GET /api/content/settings/:key - Get setting by key (public)
// PUT /api/content/settings/:key - Update setting (admin)
```

#### Bundle Endpoints (To be created)

```javascript
// GET /api/bundles - Get all bundles (public)
// Query params: ?category=string&limit=50&offset=0
// Response: { success: true, data: [bundles], total: number }

// GET /api/bundles/:id - Get single bundle with items (public)
// Response: { 
//   success: true, 
//   data: { 
//     id, name, description, price, discount, image_url, 
//     items: [{ product_id, product_name, quantity }] 
//   } 
// }

// POST /api/bundles - Create bundle (admin only)
// Body: { 
//   name, description, price, discount?, image_url?, 
//   items: [{ product_id, quantity }] 
// }
// Response: { success: true, data: newBundle, message: 'Bundle created successfully' }

// PUT /api/bundles/:id - Update bundle (admin only)
// Body: { name?, description?, price?, items?, ... }
// Response: { success: true, data: updatedBundle, message: 'Bundle updated successfully' }

// DELETE /api/bundles/:id - Delete bundle (admin only)
// Response: { success: true, message: 'Bundle deleted successfully' }
```

#### Review Endpoints (To be created)

```javascript
// GET /api/reviews - Get product reviews (public)
// Query params: ?product_id=uuid&limit=50
// Response: { success: true, data: [reviews] }

// POST /api/reviews - Submit review (authenticated)
// Body: { product_id, rating, title, content, images? }
// Validation: rating 1-5, title required, content required
// Response: { success: true, data: newReview, message: 'Review submitted successfully' }

// PUT /api/reviews/:id - Update own review (authenticated, owner only)
// DELETE /api/reviews/:id - Delete review (authenticated, owner or admin)
```

#### Gallery Endpoints (To be created)

```javascript
// GET /api/content/gallery - Get all gallery items (public)
// Query params: ?category=string&limit=50
// Response: { success: true, data: [galleryItems] }

// POST /api/content/gallery - Create gallery item (admin)
// Body: { title, description, image_url, category?, sort_order?, is_active? }
// Response: { success: true, data: newItem, message: 'Gallery item created' }

// PUT /api/content/gallery/:id - Update gallery item (admin)
// DELETE /api/content/gallery/:id - Delete gallery item (admin)
```

#### Page Content Endpoints (To be created)

```javascript
// GET /api/content/pages/:slug - Get page content by slug (public)
// Slugs: 'our-philosophy', 'our-story', 'why-partner', etc.
// Response: { 
//   success: true, 
//   data: { slug, title, content, metadata, updated_at } 
// }

// PUT /api/content/pages/:slug - Update page content (admin)
// Body: { title?, content?, metadata? }
// Response: { success: true, data: updatedPage, message: 'Page updated' }
```

#### Blog Category Endpoints (To be created)

```javascript
// GET /api/content/blog-categories - Get all blog categories (public)
// Response: { success: true, data: [categories] }

// POST /api/content/blog-categories - Create category (admin)
// Body: { name, slug, description? }
// Response: { success: true, data: newCategory, message: 'Category created' }

// PUT /api/content/blog-categories/:id - Update category (admin)
// DELETE /api/content/blog-categories/:id - Delete category (admin)
```

#### Events Endpoints (To be created)

```javascript
// GET /api/content/events - Get all events (public)
// Query params: ?upcoming=true&limit=10
// Response: { success: true, data: [events] }

// POST /api/content/events - Create event (admin)
// PUT /api/content/events/:id - Update event (admin)
// DELETE /api/content/events/:id - Delete event (admin)
```

#### Contact/Enquiry Endpoints (To be created)

```javascript
// POST /api/contact - Submit contact form
// Body: { name, email, phone?, subject, message }
// Validation: email format, message length, rate limiting
// Response: { success: true, message: 'Message sent successfully' }

// POST /api/enquiry - Submit enquiry form
// Body: { name, email, phone, product_id?, message }
// Response: { success: true, message: 'Enquiry submitted successfully' }
```

#### Search Endpoints (To be created)

```javascript
// GET /api/search/products - Search products
// Query params: ?q=searchTerm&category=string&min_price=number&max_price=number&limit=50&offset=0
// Response: { 
//   success: true, 
//   data: [products], 
//   total: number,
//   filters: { categories: [...], price_range: {...} }
// }
```

### Backend Middleware

```javascript
// middleware/auth.js

// Verify JWT token from Supabase
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('Invalid token');
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth - adds user if token present, continues if not
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) req.user = user;
    } catch (error) {
      // Continue without user
    }
  }
  next();
}

// Require admin role
export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access denied' });
  }
}
```

```javascript
// middleware/validation.js

import { validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Handle validation errors
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: errors.array()[0].msg,
      details: errors.array()
    });
  }
  next();
}

// Sanitize request body
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    }
  }
  next();
}
```

### Frontend Service Layer

```javascript
// services/contentService.js

import apiClient from '../lib/apiClient';

export const contentService = {
  // Blog operations
  getBlogPosts: (limit) => 
    apiClient.get('/content/blog', { params: { limit } }),
  
  getBlogPost: (slug) => 
    apiClient.get(`/content/blog/${slug}`),
  
  createBlogPost: (data) => 
    apiClient.post('/content/blog', data),
  
  updateBlogPost: (id, data) => 
    apiClient.put(`/content/blog/${id}`, data),
  
  deleteBlogPost: (id) => 
    apiClient.delete(`/content/blog/${id}`),
  
  // Testimonials
  getTestimonials: (limit) => 
    apiClient.get('/content/testimonials', { params: { limit } }),
  
  createTestimonial: (data) => 
    apiClient.post('/content/testimonials', data),
  
  updateTestimonial: (id, data) => 
    apiClient.put(`/content/testimonials/${id}`, data),
  
  deleteTestimonial: (id) => 
    apiClient.delete(`/content/testimonials/${id}`),
  
  // FAQs
  getFAQs: () => 
    apiClient.get('/content/faqs'),
  
  createFAQ: (data) => 
    apiClient.post('/content/faqs', data),
  
  updateFAQ: (id, data) => 
    apiClient.put(`/content/faqs/${id}`, data),
  
  deleteFAQ: (id) => 
    apiClient.delete(`/content/faqs/${id}`),
  
  // Footer links
  getFooterLinks: () => 
    apiClient.get('/content/footer-links'),
  
  // Policy pages
  getPolicyPage: (slug) => 
    apiClient.get(`/content/policy/${slug}`),
  
  updatePolicyPage: (slug, data) => 
    apiClient.put(`/content/policy/${slug}`, data),
  
  // Settings
  getSetting: (key) => 
    apiClient.get(`/content/settings/${key}`),
  
  updateSetting: (key, value) => 
    apiClient.put(`/content/settings/${key}`, { value }),
  
  // Categories
  getCategories: () => 
    apiClient.get('/content/categories')
};
```

```javascript
// services/bundleService.js

import apiClient from '../lib/apiClient';

export const bundleService = {
  getAll: (params) => 
    apiClient.get('/bundles', { params }),
  
  getById: (id) => 
    apiClient.get(`/bundles/${id}`),
  
  create: (data) => 
    apiClient.post('/bundles', data),
  
  update: (id, data) => 
    apiClient.put(`/bundles/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/bundles/${id}`)
};
```

```javascript
// services/reviewService.js

import apiClient from '../lib/apiClient';

export const reviewService = {
  getReviews: (productId, limit) => 
    apiClient.get('/reviews', { params: { product_id: productId, limit } }),
  
  submitReview: (data) => 
    apiClient.post('/reviews', data),
  
  updateReview: (id, data) => 
    apiClient.put(`/reviews/${id}`, data),
  
  deleteReview: (id) => 
    apiClient.delete(`/reviews/${id}`)
};
```

## Data Models

### Database Schema (Existing)

```sql
-- Products table (existing)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  images JSONB,
  custom_id TEXT,
  technical_details JSONB,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundles table (existing)
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(5, 2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle items junction table (existing)
CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product bundles junction (existing)
CREATE TABLE product_bundles (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, bundle_id)
);

-- Blog posts table (existing)
CREATE TABLE kustom_kultor_blog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table (existing)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table (existing)
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  designation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs table (existing)
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Footer links table (existing)
CREATE TABLE footer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy pages table (existing)
CREATE TABLE policy_pages_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (existing)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New Tables to Create

```sql
-- Reviews table (to be created)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images JSONB,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table (to be created)
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page content table (to be created)
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog categories table (to be created)
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (to be created)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions table (to be created)
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiry submissions table (to be created)
CREATE TABLE enquiry_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Request/Response Models

```typescript
// TypeScript interfaces for documentation

// Standard success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Standard error response
interface ErrorResponse {
  error: string;
  message: string;
  details?: any[];
}

// Paginated response
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Blog post model
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  author?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Bundle model
interface Bundle {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  image_url?: string;
  is_active: boolean;
  items: BundleItem[];
  created_at: string;
  updated_at: string;
}

interface BundleItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

// Review model
interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

// Testimonial model
interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  image_url?: string;
  designation?: string;
  is_active: boolean;
  created_at: string;
}

// FAQ model
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
```

## Error Handling

### Backend Error Handling Strategy

```javascript
// Centralized error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Database errors
  if (err.code === 'PGRST116') {
    return res.status(404).json({
      error: 'Resource not found',
      message: 'The requested resource does not exist'
    });
  }
  
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A resource with this identifier already exists'
    });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Invalid reference',
      message: 'Referenced resource does not exist'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
      details: err.details
    });
  }
  
  // Auth errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  if (err.status === 403) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this resource'
    });
  }
  
  // Generic server error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Frontend Error Handling

```javascript
// Enhanced API client error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // Token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data: { session } } = await supabase.auth.refreshSession();
        if (session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        message: 'Network error',
        isNetworkError: true
      });
    }
    
    // Server errors
    const errorData = error.response.data;
    const message = errorData?.message || errorData?.error || 'An error occurred';
    
    // Display user-friendly error
    if (error.response.status === 400) {
      toast.error(`Validation error: ${message}`);
    } else if (error.response.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response.status === 404) {
      toast.error('Resource not found');
    } else if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject({
      message,
      status: error.response.status,
      data: errorData
    });
  }
);
```

### Error User Experience

```javascript
// Example: Admin blog page error handling
const AdminBlogPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCreatePost = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contentService.createBlogPost(formData);
      toast.success('Blog post created successfully');
      // Refresh list or navigate
    } catch (err) {
      setError(err.message);
      // Error toast already shown by interceptor
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && (
        <Alert variant="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Form UI */}
    </div>
  );
};
```

## Testing Strategy

This migration focuses on correctness through comprehensive example-based testing and integration testing. Property-based testing is NOT applicable for this infrastructure migration project because:

1. **Infrastructure Configuration**: Most changes involve wiring API endpoints and middleware, not algorithmic logic
2. **External Service Integration**: Testing involves Supabase database calls and HTTP endpoints, not pure functions
3. **UI Behavior**: Many changes are in React components with side effects and external dependencies
4. **One-shot Operations**: CRUD operations have deterministic outcomes that don't vary meaningfully with input

### Testing Approach

#### Unit Tests (Example-Based)

**Backend Route Tests:**
```javascript
// Test: GET /api/content/blog returns published posts
describe('GET /api/content/blog', () => {
  it('should return published blog posts', async () => {
    const response = await request(app)
      .get('/api/content/blog')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    response.body.data.forEach(post => {
      expect(post.is_published).toBe(true);
    });
  });
  
  it('should limit results when limit param provided', async () => {
    const response = await request(app)
      .get('/api/content/blog?limit=5')
      .expect(200);
    
    expect(response.body.data.length).toBeLessThanOrEqual(5);
  });
  
  it('should return 404 for non-existent slug', async () => {
    const response = await request(app)
      .get('/api/content/blog/non-existent-slug')
      .expect(404);
    
    expect(response.body.error).toBe('Blog post not found');
  });
});

// Test: POST /api/content/blog requires authentication
describe('POST /api/content/blog', () => {
  it('should reject unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/content/blog')
      .send({ title: 'Test', content: 'Content' })
      .expect(401);
    
    expect(response.body.error).toBe('Authentication required');
  });
  
  it('should reject non-admin users', async () => {
    const userToken = await getUserToken();
    const response = await request(app)
      .post('/api/content/blog')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test', content: 'Content' })
      .expect(403);
    
    expect(response.body.error).toBe('Admin access required');
  });
  
  it('should validate required fields', async () => {
    const adminToken = await getAdminToken();
    const response = await request(app)
      .post('/api/content/blog')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '' })
      .expect(400);
    
    expect(response.body.error).toBe('Validation failed');
  });
  
  it('should create blog post with valid data', async () => {
    const adminToken = await getAdminToken();
    const postData = {
      title: 'New Post',
      slug: 'new-post',
      content: 'Post content',
      is_published: true
    };
    
    const response = await request(app)
      .post('/api/content/blog')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(postData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('New Post');
  });
});
```

**Frontend Component Tests:**
```javascript
// Test: BlogPage fetches and displays posts
describe('BlogPage', () => {
  it('should fetch and display blog posts on mount', async () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', slug: 'post-1' },
      { id: '2', title: 'Post 2', slug: 'post-2' }
    ];
    
    jest.spyOn(contentService, 'getBlogPosts').mockResolvedValue({
      success: true,
      data: mockPosts
    });
    
    render(<BlogPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
    });
    
    expect(contentService.getBlogPosts).toHaveBeenCalledWith(undefined);
  });
  
  it('should show loading state while fetching', () => {
    jest.spyOn(contentService, 'getBlogPosts').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<BlogPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('should display error when fetch fails', async () => {
    jest.spyOn(contentService, 'getBlogPosts').mockRejectedValue(
      new Error('Failed to fetch posts')
    );
    
    render(<BlogPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

// Test: AdminBlogPage creates posts through API
describe('AdminBlogPage', () => {
  it('should call API when submitting new post', async () => {
    jest.spyOn(contentService, 'createBlogPost').mockResolvedValue({
      success: true,
      data: { id: '1', title: 'New Post' }
    });
    
    render(<AdminBlogPage />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Post' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Post content' }
    });
    fireEvent.click(screen.getByText('Publish'));
    
    await waitFor(() => {
      expect(contentService.createBlogPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Post',
          content: 'Post content'
        })
      );
    });
    
    expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
  });
});
```

#### Integration Tests

**End-to-End API Flow:**
```javascript
describe('Blog Management E2E', () => {
  let adminToken;
  let createdPostId;
  
  beforeAll(async () => {
    adminToken = await getAdminToken();
  });
  
  it('should complete full blog post lifecycle', async () => {
    // Create post
    const createResponse = await request(app)
      .post('/api/content/blog')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'E2E Test Post',
        slug: 'e2e-test-post',
        content: 'Test content',
        is_published: false
      })
      .expect(201);
    
    createdPostId = createResponse.body.data.id;
    expect(createResponse.body.data.is_published).toBe(false);
    
    // Update post
    const updateResponse = await request(app)
      .put(`/api/content/blog/${createdPostId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ is_published: true })
      .expect(200);
    
    expect(updateResponse.body.data.is_published).toBe(true);
    
    // Fetch post (public)
    const getResponse = await request(app)
      .get('/api/content/blog/e2e-test-post')
      .expect(200);
    
    expect(getResponse.body.data.title).toBe('E2E Test Post');
    expect(getResponse.body.data.is_published).toBe(true);
    
    // Delete post
    await request(app)
      .delete(`/api/content/blog/${createdPostId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    // Verify deletion
    await request(app)
      .get('/api/content/blog/e2e-test-post')
      .expect(404);
  });
});
```

**Frontend Integration:**
```javascript
describe('Blog User Journey', () => {
  it('should allow user to read blog post', async () => {
    // Setup: Create test post via API
    const testPost = await createTestBlogPost();
    
    // Navigate to blog list
    render(<App />, { initialRoute: '/blog' });
    
    await waitFor(() => {
      expect(screen.getByText(testPost.title)).toBeInTheDocument();
    });
    
    // Click post
    fireEvent.click(screen.getByText(testPost.title));
    
    // Verify navigation and content
    await waitFor(() => {
      expect(screen.getByText(testPost.content)).toBeInTheDocument();
    });
    
    // Cleanup
    await deleteTestBlogPost(testPost.id);
  });
});
```

#### Validation Tests

**Input Sanitization:**
```javascript
describe('Input Sanitization', () => {
  it('should sanitize XSS attempts in blog content', async () => {
    const adminToken = await getAdminToken();
    const maliciousContent = '<script>alert("xss")</script>Hello';
    
    const response = await request(app)
      .post('/api/content/blog')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test',
        slug: 'test-xss',
        content: maliciousContent
      })
      .expect(201);
    
    expect(response.body.data.content).not.toContain('<script>');
    expect(response.body.data.content).toContain('Hello');
  });
});
```

**Authorization Tests:**
```javascript
describe('Authorization', () => {
  it('should prevent regular users from accessing admin endpoints', async () => {
    const userToken = await getUserToken();
    
    await request(app)
      .post('/api/content/blog')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test' })
      .expect(403);
    
    await request(app)
      .delete('/api/content/blog/some-id')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
  
  it('should allow users to access own data only', async () => {
    const user1Token = await getUserToken('user1@example.com');
    const user2Token = await getUserToken('user2@example.com');
    
    // User1 creates review
    const review = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ product_id: 'some-id', rating: 5, content: 'Great!' })
      .expect(201);
    
    // User2 cannot delete user1's review
    await request(app)
      .delete(`/api/reviews/${review.body.data.id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(403);
    
    // User1 can delete own review
    await request(app)
      .delete(`/api/reviews/${review.body.data.id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
  });
});
```

#### Migration Verification Tests

**Network Traffic Verification:**
```javascript
describe('Migration Verification', () => {
  it('should not make direct Supabase database calls', async () => {
    const requestSpy = jest.spyOn(window, 'fetch');
    
    render(<App />, { initialRoute: '/blog' });
    
    await waitFor(() => {
      expect(screen.getByText(/blog/i)).toBeInTheDocument();
    });
    
    const supabaseCalls = requestSpy.mock.calls.filter(call => 
      call[0].includes('supabase.co') && 
      !call[0].includes('/auth/')  // Auth calls are allowed
    );
    
    expect(supabaseCalls.length).toBe(0);
  });
  
  it('should use backend API for all data operations', async () => {
    const requestSpy = jest.spyOn(window, 'fetch');
    
    render(<AdminBlogPage />);
    
    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith(
        expect.stringContaining(process.env.VITE_API_URL),
        expect.any(Object)
      );
    });
  });
});
```

### Test Coverage Goals

- **Backend Routes**: 90%+ code coverage
- **Frontend API Service Layer**: 100% coverage
- **Critical User Flows**: All covered with integration tests
- **Error Paths**: All error responses tested
- **Authorization**: All protected endpoints tested

### Test Execution

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run test:integration    # Integration tests only

# Frontend tests
cd frontend
npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run test:e2e            # End-to-end tests
```

## Migration Implementation Plan

### Phase 1: Endpoint Creation (Backend)

**Objective**: Create missing backend API endpoints for all content types.

**Tasks:**
1. Create bundle endpoints in `routes/bundles.js`:
   - GET /api/bundles
   - GET /api/bundles/:id (with items)
   - POST /api/bundles (admin)
   - PUT /api/bundles/:id (admin)
   - DELETE /api/bundles/:id (admin)

2. Create review endpoints in `routes/reviews.js`:
   - GET /api/reviews (with product_id filter)
   - POST /api/reviews (authenticated)
   - PUT /api/reviews/:id (owner only)
   - DELETE /api/reviews/:id (owner or admin)

3. Extend content endpoints in `routes/content.js`:
   - GET/POST/PUT/DELETE /api/content/gallery
   - GET/PUT /api/content/pages/:slug
   - GET/POST/PUT/DELETE /api/content/blog-categories
   - GET/POST/PUT/DELETE /api/content/events

4. Create form submission endpoints:
   - POST /api/contact
   - POST /api/enquiry

5. Create search endpoint:
   - GET /api/search/products

**Acceptance Criteria:**
- All endpoints return standardized JSON responses
- Authentication and authorization properly enforced
- Input validation using express-validator
- Error handling returns appropriate status codes
- CORS configured for allowed origins

### Phase 2: Frontend Service Layer (Frontend)

**Objective**: Create comprehensive service functions for all API endpoints.

**Tasks:**
1. Extend `lib/apiClient.js` with service objects:
   - bundleService (getAll, getById, create, update, delete)
   - reviewService (getReviews, submitReview, updateReview, deleteReview)
   - galleryService (getAll, create, update, delete)
   - pageContentService (getPage, updatePage)
   - formService (submitContact, submitEnquiry)
   - searchService (searchProducts)

2. Update existing `contentService` to use all available endpoints

3. Ensure all service functions:
   - Use apiClient (which adds auth headers)
   - Return promises with typed responses
   - Handle errors gracefully

**Acceptance Criteria:**
- Service layer provides clean interface to API
- No direct Supabase imports in service files
- All API calls use apiClient interceptors
- TypeScript types defined (if using TS) or JSDoc comments

### Phase 3: Admin Pages Migration

**Objective**: Migrate admin pages to use backend API exclusively.

**Pages to Migrate:**
- AdminBlogPage
- AdminBundlesPage
- AdminCategoriesPage
- AdminProductsPage
- AdminGalleryPage
- AdminTestimonialsPage
- AdminFAQPage

**Migration Pattern for Each Page:**
```javascript
// BEFORE: Direct Supabase query
const { data, error } = await supabase
  .from('kustom_kultor_blog')
  .select('*')
  .eq('is_published', true);

// AFTER: Backend API call
const { success, data } = await contentService.getBlogPosts();
```

**Tasks per Page:**
1. Replace all `supabase.from()` calls with service functions
2. Update state management to handle API responses
3. Add loading states
4. Add error handling with user feedback
5. Update form submissions to use API
6. Test CRUD operations

**Acceptance Criteria:**
- No `supabase.from()` calls in admin pages
- All operations use service layer
- Loading indicators during API calls
- Error messages displayed to users
- Success notifications after operations
- Functionality matches pre-migration behavior

### Phase 4: Public Pages Migration

**Objective**: Migrate public pages to fetch content via backend API.

**Pages to Migrate:**
- OurPhilosophyPage
- OurStoryPage
- BlogPostPage
- TestimonialsPage
- FAQPage
- GalleryPage
- WhyPartnerPage

**Migration Pattern:**
```javascript
// BEFORE
const { data: content } = await supabase
  .from('page_content')
  .select('*')
  .eq('slug', 'our-philosophy')
  .single();

// AFTER
const { data: content } = await pageContentService.getPage('our-philosophy');
```

**Tasks per Page:**
1. Replace Supabase queries with API service calls
2. Update loading states
3. Add error boundaries
4. Test SEO (ensure SSR/SSG if applicable)

**Acceptance Criteria:**
- All content loaded via API
- Pages handle loading and error states
- SEO metadata preserved
- Performance remains acceptable

### Phase 5: Component Migration

**Objective**: Migrate shared components to use backend API.

**Components to Migrate:**
- Footer
- ReviewsSection
- RelatedBundles
- TestimonialCarousel (if exists)
- CategoryFilter

**Tasks:**
1. Update Footer to fetch links via API
2. Update ReviewsSection to submit/display reviews via API
3. Update RelatedBundles to fetch bundle data via API
4. Ensure components handle loading states
5. Add error boundaries

**Acceptance Criteria:**
- No Supabase database calls in components
- Components work in both authenticated and unauthenticated states
- Loading states don't break layout
- Errors handled gracefully

### Phase 6: Form Migration

**Objective**: Migrate contact and enquiry forms to submit via backend API.

**Forms to Migrate:**
- ContactPage form
- EnquiryPage form
- Wholesale application form

**Migration Pattern:**
```javascript
// BEFORE
const { error } = await supabase
  .from('contact_submissions')
  .insert([formData]);

// AFTER
const { success } = await formService.submitContact(formData);
```

**Tasks:**
1. Create form service functions
2. Update form submit handlers
3. Add rate limiting (backend)
4. Add validation feedback
5. Add CAPTCHA if needed

**Acceptance Criteria:**
- Forms submit to backend API
- Server-side validation enforced
- Rate limiting prevents spam
- User receives confirmation
- Submissions stored in database

### Phase 7: Search and Filter Migration

**Objective**: Move search functionality to backend.

**Tasks:**
1. Create search endpoint with filtering
2. Update product search UI to use API
3. Implement pagination via API
4. Add debouncing for search inputs

**Acceptance Criteria:**
- Search queries sent to backend
- Backend handles query optimization
- Results paginated efficiently
- No SQL injection vulnerability

### Phase 8: Cleanup and Verification

**Objective**: Remove unused Supabase client code and verify migration.

**Tasks:**
1. Search codebase for remaining `supabase.from()` calls
2. Remove or comment out unused imports
3. Keep `lib/supabase.js` only for auth
4. Run network traffic inspection
5. Verify no supabase.co database URLs in network tab
6. Update environment variables if needed
7. Update documentation

**Acceptance Criteria:**
- Network tab shows zero database requests to supabase.co
- Only Supabase auth requests present (login, session refresh)
- All features working correctly
- Performance acceptable
- Security audit passed

### Migration Validation Checklist

```markdown
## Pre-Migration Checklist
- [ ] All backend endpoints created and tested
- [ ] Service layer functions implemented
- [ ] Authentication working end-to-end
- [ ] CORS properly configured
- [ ] Error handling implemented

## Migration Checklist
- [ ] Admin pages migrated
  - [ ] AdminBlogPage
  - [ ] AdminBundlesPage
  - [ ] AdminCategoriesPage
  - [ ] AdminProductsPage
  - [ ] AdminGalleryPage
- [ ] Public pages migrated
  - [ ] OurPhilosophyPage
  - [ ] OurStoryPage
  - [ ] BlogPostPage
  - [ ] TestimonialsPage
  - [ ] FAQPage
  - [ ] GalleryPage
- [ ] Components migrated
  - [ ] Footer
  - [ ] ReviewsSection
  - [ ] RelatedBundles
- [ ] Forms migrated
  - [ ] ContactPage
  - [ ] EnquiryPage
  - [ ] Wholesale application

## Post-Migration Checklist
- [ ] Network tab verification (no supabase.co database URLs)
- [ ] All CRUD operations working
- [ ] Authentication flow working
- [ ] Authorization enforced
- [ ] File uploads working
- [ ] Search functionality working
- [ ] Error handling working
- [ ] Loading states present
- [ ] Performance acceptable
- [ ] SEO preserved
- [ ] Security audit passed
- [ ] Documentation updated
```

## Deployment Strategy

### Development Environment
1. Backend: Run locally on `http://localhost:3001`
2. Frontend: Run locally on `http://localhost:5173`
3. Test all endpoints with Postman/Thunder Client
4. Verify auth flow works locally

### Staging Environment
1. Deploy backend to Render staging
2. Deploy frontend to Vercel preview
3. Update frontend `.env` with staging backend URL
4. Run full regression tests
5. Verify network traffic (no direct Supabase calls)

### Production Deployment
1. Deploy backend to production Render instance
2. Update frontend production `.env` with production backend URL
3. Deploy frontend to production Vercel
4. Monitor logs for errors
5. Check network tab in browser dev tools
6. Verify all features working
7. Monitor performance metrics

### Rollback Plan
If issues arise post-deployment:
1. Keep old code in git branch
2. Environment variables can switch between old/new backend
3. Feature flags can disable migrated features
4. Database unchanged (only API layer changed)
5. Can rollback frontend independently of backend

## Security Considerations

### Authentication Security
- JWT tokens verified on every protected request
- Token expiration enforced (Supabase default: 1 hour)
- Automatic token refresh before expiration
- Secure token storage (memory, not localStorage for sensitive apps)

### Authorization Security
- Role-based access control enforced server-side
- Admin endpoints require `requireAdmin` middleware
- Users can only access own data (orders, reviews, etc.)
- Database Row-Level Security as backup layer

### Input Validation
- All request bodies validated with express-validator
- Type checking (strings, numbers, UUIDs, emails)
- Length constraints enforced
- XSS prevention via DOMPurify sanitization
- SQL injection prevented via parameterized queries

### CORS Configuration
- Allowed origins explicitly listed
- No wildcard (*) in production
- Credentials enabled for auth cookies
- Preflight requests handled

### Rate Limiting (To Implement)
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// Stricter limit for form submissions
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many submissions, please try again later'
});

app.use('/api/contact', formLimiter);
app.use('/api/enquiry', formLimiter);
```

### File Upload Security
- Signed URLs with expiration
- File type validation
- File size limits enforced
- Uploads go directly to Supabase storage (not through backend)
- Backend only generates signed URLs

### Environment Variables
```bash
# Backend .env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only, never exposed
FRONTEND_URL=https://kustomkoats.in
NODE_ENV=production
PORT=3001

# Frontend .env
VITE_API_URL=https://kustomkoats-backend.onrender.com/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx  # Public key, safe to expose
```

## Performance Optimization

### Backend Optimization
- Database connection pooling (Supabase default)
- Response compression (gzip)
- Query optimization (select only needed fields)
- Pagination for large datasets
- Caching headers for static content

### Frontend Optimization
- API response caching (React Query or SWR)
- Debounced search inputs
- Lazy loading for images
- Code splitting for routes
- Prefetching for likely navigation paths

### Caching Strategy
```javascript
// Example: React Query for client-side caching
import { useQuery } from '@tanstack/react-query';

const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => contentService.getBlogPosts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

// Usage in component
const BlogPage = () => {
  const { data, isLoading, error } = useBlogPosts();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <BlogList posts={data.data} />;
};
```

## Monitoring and Logging

### Backend Logging
```javascript
// Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log all requests
app.use((req, res, next) => {
  logger.info('Request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  next();
});

// Log all errors
app.use((err, req, res, next) => {
  logger.error('Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  next(err);
});
```

### Frontend Error Tracking
```javascript
// Error boundary for React
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error tracking service (e.g., Sentry)
    console.error('React Error:', error, errorInfo);
    
    // Could send to backend logging endpoint
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    });
  }
  
  render() {
    return this.props.children;
  }
}
```

### Metrics to Monitor
- API response times
- Error rates by endpoint
- Authentication failures
- Database query performance
- Network traffic patterns
- User activity by feature

## Documentation Updates

### API Documentation
Create OpenAPI/Swagger documentation:
```yaml
openapi: 3.0.0
info:
  title: KustomKoats Backend API
  version: 1.0.0
  description: Secure backend API for KustomKoats e-commerce platform

servers:
  - url: https://kustomkoats-backend.onrender.com/api
    description: Production server
  - url: http://localhost:3001/api
    description: Development server

paths:
  /content/blog:
    get:
      summary: Get all blog posts
      tags: [Content]
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
            minimum: 1
            maximum: 100
          description: Maximum number of posts to return
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/BlogPost'
    post:
      summary: Create blog post
      tags: [Content]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BlogPostInput'
      responses:
        201:
          description: Blog post created
        401:
          description: Unauthorized
        403:
          description: Forbidden (requires admin)

components:
  schemas:
    BlogPost:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        slug:
          type: string
        content:
          type: string
        is_published:
          type: boolean
        created_at:
          type: string
          format: date-time
  
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### README Updates
Update both backend and frontend READMEs:
- API endpoint documentation
- Environment variable setup
- Development workflow
- Testing instructions
- Deployment process

### Developer Onboarding
Create migration guide for developers:
- How to use service layer
- Authentication flow
- Error handling patterns
- Testing conventions
- Common pitfalls to avoid

---

## Summary

This design provides a comprehensive plan for migrating from direct frontend Supabase database access to a secure backend API architecture. The migration:

1. **Eliminates security vulnerabilities** by removing database exposure from the browser
2. **Centralizes data access** through a validated, authenticated API layer
3. **Maintains functionality** while improving security and maintainability
4. **Follows best practices** for authentication, authorization, and input validation
5. **Includes comprehensive testing** to ensure correctness throughout migration
6. **Provides clear implementation phases** for systematic, low-risk deployment

The architecture ensures that after migration, the browser network traffic contains zero direct database queries, with all data operations flowing through the secure backend API at `https://kustomkoats-backend.onrender.com/api`.
