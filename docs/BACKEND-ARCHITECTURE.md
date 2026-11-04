# Backend Architecture Documentation

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           React Frontend Application                   │     │
│  │                                                         │     │
│  │  Components → Stores → Services → API Client          │     │
│  │                                      ↓                  │     │
│  │                              apiClient.js               │     │
│  │                    (Axios with interceptors)            │     │
│  └───────────────────────────┬──────────────────────────┘     │
│                                │                                 │
│                                │ HTTP/HTTPS                      │
│                                │ JSON                            │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 │
                    ┌────────────▼────────────┐
                    │   CORS Validation        │
                    │   (Origin Check)         │
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                    BACKEND API SERVER                            │
│                    (Node.js + Express)                           │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Request Pipeline                          │ │
│  │                                                             │ │
│  │  1. Helmet (Security Headers)                              │ │
│  │  2. CORS (Cross-Origin)                                    │ │
│  │  3. Body Parser (JSON)                                     │ │
│  │  4. Input Sanitization                                     │ │
│  │  5. Request Logging                                        │ │
│  └───────────────────────┬───────────────────────────────────┘ │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐ │
│  │                  Route Handler                             │ │
│  │                                                             │ │
│  │  /api/auth        → Authentication Routes                  │ │
│  │  /api/products    → Product Routes                         │ │
│  │  /api/orders      → Order Routes                           │ │
│  │  /api/promo       → Promo Code Routes                      │ │
│  │  /api/wholesale   → Wholesale Routes                       │ │
│  │  /api/storage     → Storage Routes                         │ │
│  └───────────────────────┬───────────────────────────────────┘ │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐ │
│  │                  Middleware Layer                          │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ authenticateToken│  │ requireAdmin │  │ optionalAuth│ │ │
│  │  └─────────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │        Request Validation (express-validator)        │ │ │
│  │  │        - Email format                                 │ │ │
│  │  │        - UUID validation                              │ │ │
│  │  │        - Required fields                              │ │ │
│  │  │        - Data types                                   │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────┬───────────────────────────────────┘ │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐ │
│  │               Business Logic Layer                         │ │
│  │                                                             │ │
│  │  - Order calculation                                       │ │
│  │  - Promo code validation                                   │ │
│  │  - Discount application                                    │ │
│  │  - Stock management                                        │ │
│  │  - Permission checks                                       │ │
│  └───────────────────────┬───────────────────────────────────┘ │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐ │
│  │          Supabase Client (Service Role)                    │ │
│  │                                                             │ │
│  │  - Bypasses RLS (Row Level Security)                       │ │
│  │  - Full database access                                    │ │
│  │  - Only accessible from backend                            │ │
│  └───────────────────────┬───────────────────────────────────┘ │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           │ PostgreSQL Protocol
                           │ Secure Connection
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    SUPABASE CLOUD                             │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                        │  │
│  │                                                          │  │
│  │  Tables:                                                │  │
│  │  - products                                             │  │
│  │  - orders                                               │  │
│  │  - order_items                                          │  │
│  │  - profiles                                             │  │
│  │  - promo_codes                                          │  │
│  │  - wholesale_applications                               │  │
│  │  - ... and more                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Supabase Auth                              │  │
│  │                                                          │  │
│  │  - User authentication                                  │  │
│  │  - JWT token generation                                 │  │
│  │  - Token validation                                     │  │
│  │  - Password reset                                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Supabase Storage                           │  │
│  │                                                          │  │
│  │  Buckets:                                               │  │
│  │  - products                                             │  │
│  │  - avatars                                              │  │
│  │  - documents                                            │  │
│  │  - invoices                                             │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Request Flow Examples

### 1. User Login Flow

```
┌─────────┐                ┌─────────┐               ┌──────────┐
│ Browser │                │ Backend │               │ Supabase │
└────┬────┘                └────┬────┘               └────┬─────┘
     │                          │                         │
     │ POST /api/auth/login     │                         │
     │ { email, password }      │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │ Validate input          │
     │                          │ (email format, etc.)    │
     │                          │                         │
     │                          │ auth.signInWithPassword │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │                         │ Verify
     │                          │                         │ credentials
     │                          │                         │
     │                          │      JWT Token          │
     │                          │<────────────────────────┤
     │                          │                         │
     │     Success + Token      │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │ Store token in auth      │                         │
     │ (Supabase client)        │                         │
     │                          │                         │
```

### 2. Get Products Flow (Public)

```
┌─────────┐                ┌─────────┐               ┌──────────┐
│ Browser │                │ Backend │               │ Supabase │
└────┬────┘                └────┬────┘               └────┬─────┘
     │                          │                         │
     │ GET /api/products        │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │ No auth required        │
     │                          │                         │
     │                          │ SELECT * FROM products  │
     │                          │ WHERE status = 'active' │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │      Product Data       │
     │                          │<────────────────────────┤
     │                          │                         │
     │     JSON Response        │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
```

### 3. Create Order Flow (Authenticated)

```
┌─────────┐                ┌─────────┐               ┌──────────┐
│ Browser │                │ Backend │               │ Supabase │
└────┬────┘                └────┬────┘               └────┬─────┘
     │                          │                         │
     │ POST /api/orders         │                         │
     │ Authorization: Bearer... │                         │
     │ { items, address, ... }  │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │ 1. Verify JWT token     │
     │                          ├────────────────────────>│
     │                          │    Token valid?         │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │ 2. Validate order data  │
     │                          │    (items, address)     │
     │                          │                         │
     │                          │ 3. Calculate total      │
     │                          │                         │
     │                          │ 4. Apply promo code     │
     │                          │    (if provided)        │
     │                          │                         │
     │                          │ 5. INSERT order         │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │ 6. INSERT order_items   │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │    Order Created        │
     │                          │<────────────────────────┤
     │                          │                         │
     │     Order Confirmation   │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
```

### 4. Admin Update Product Flow

```
┌─────────┐                ┌─────────┐               ┌──────────┐
│ Browser │                │ Backend │               │ Supabase │
└────┬────┘                └────┬────┘               └────┬─────┘
     │                          │                         │
     │ PUT /api/products/:id    │                         │
     │ Authorization: Bearer... │                         │
     │ { name, price, ... }     │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │ 1. Verify JWT token     │
     │                          ├────────────────────────>│
     │                          │    Token valid?         │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │ 2. Check user role      │
     │                          │    SELECT role          │
     │                          │    FROM profiles        │
     │                          ├────────────────────────>│
     │                          │    role = 'admin'?      │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │ 3. Validate input       │
     │                          │    (price > 0, etc.)    │
     │                          │                         │
     │                          │ 4. UPDATE product       │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │    Updated Product      │
     │                          │<────────────────────────┤
     │                          │                         │
     │     Success Response     │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
```

## Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│                     Security Layers                           │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. NETWORK LAYER                                             │
│     - HTTPS encryption                                        │
│     - CORS policy                                             │
│     - Rate limiting (can be added)                            │
│                                                                │
│  2. REQUEST LAYER                                             │
│     - Helmet security headers                                 │
│     - Input sanitization                                      │
│     - XSS prevention                                          │
│                                                                │
│  3. AUTHENTICATION LAYER                                      │
│     - JWT token validation                                    │
│     - Token expiration checks                                 │
│     - Automatic token refresh                                 │
│                                                                │
│  4. AUTHORIZATION LAYER                                       │
│     - Role-based access control                               │
│     - Resource ownership checks                               │
│     - Admin-only endpoints                                    │
│                                                                │
│  5. VALIDATION LAYER                                          │
│     - Request schema validation                               │
│     - Data type checking                                      │
│     - Business rule enforcement                               │
│                                                                │
│  6. DATABASE LAYER                                            │
│     - Row Level Security (RLS)                                │
│     - Service role key (backend only)                         │
│     - SQL injection prevention                                │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Comparison

### Before: Direct Supabase Access ❌

```
Frontend                           Supabase
  │                                   │
  │  ┌─────────────────────┐         │
  │  │ Supabase Client     │         │
  │  │ + Anon Key (Public) │         │
  │  └──────────┬──────────┘         │
  │             │                     │
  │             │ Direct Connection   │
  │             └────────────────────>│
  │                                   │
  │  Problems:                        │
  │  - Exposed credentials            │
  │  - No validation                  │
  │  - No business logic              │
  │  - RLS complexity                 │
  │  - Hard to monitor                │
```

### After: Backend API Layer ✅

```
Frontend          Backend API              Supabase
  │                  │                        │
  │  HTTP Requests   │                        │
  │ ────────────────>│                        │
  │                  │                        │
  │                  │  ┌──────────────────┐ │
  │                  │  │ Supabase Client  │ │
  │                  │  │ + Service Role   │ │
  │                  │  │   (Secret)       │ │
  │                  │  └────────┬─────────┘ │
  │                  │           │            │
  │                  │           └───────────>│
  │                  │                        │
  │  Benefits:                                │
  │  - Secure credentials                     │
  │  - Request validation                     │
  │  - Business logic                         │
  │  - Simplified RLS                         │
  │  - Full monitoring                        │
  │  - Scalable                               │
```

## Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  FRONTEND (.env)                  BACKEND (.env)            │
│  ├─ VITE_SUPABASE_URL           ├─ SUPABASE_URL            │
│  ├─ VITE_SUPABASE_ANON_KEY      ├─ SUPABASE_SERVICE_ROLE   │
│  ├─ VITE_API_URL                ├─ PORT                     │
│  └─ VITE_RAZORPAY_KEY_ID        ├─ NODE_ENV                │
│                                   ├─ FRONTEND_URL            │
│                                   ├─ SHIPROCKET_EMAIL        │
│                                   ├─ SHIPROCKET_PASSWORD     │
│                                   ├─ RAZORPAY_KEY_ID         │
│                                   └─ RAZORPAY_KEY_SECRET     │
│                                                               │
│  PUBLIC (Safe to expose)          PRIVATE (Never expose)    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                      │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Vercel    │ Frontend Hosting
│  (Static)   │ - React build
└──────┬──────┘ - CDN distribution
       │
       │ HTTPS
       │
       ▼
┌─────────────┐
│   Railway   │ Backend API Hosting
│ (or Render) │ - Node.js server
└──────┬──────┘ - Auto-deploy from Git
       │        - Environment variables
       │        - Health checks
       │ 
       │ PostgreSQL Protocol
       │
       ▼
┌─────────────┐
│  Supabase   │ Database & Auth
│   Cloud     │ - PostgreSQL
└─────────────┘ - Storage
                 - Auth
                 - Managed service
```

## Monitoring & Logging

```
┌──────────────────────────────────────────────────────────────┐
│                    MONITORING POINTS                          │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. REQUEST LOGGING                                           │
│     - Timestamp                                               │
│     - Method (GET, POST, etc.)                                │
│     - Endpoint                                                │
│     - Response time                                           │
│     - Status code                                             │
│                                                                │
│  2. ERROR TRACKING                                            │
│     - Error type                                              │
│     - Stack trace                                             │
│     - User context                                            │
│     - Request details                                         │
│                                                                │
│  3. PERFORMANCE METRICS                                       │
│     - Response times                                          │
│     - Database query times                                    │
│     - Memory usage                                            │
│     - CPU usage                                               │
│                                                                │
│  4. SECURITY EVENTS                                           │
│     - Failed login attempts                                   │
│     - Invalid tokens                                          │
│     - Unauthorized access                                     │
│     - Suspicious patterns                                     │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

**This architecture provides a professional, secure, and scalable foundation for your e-commerce platform.**
