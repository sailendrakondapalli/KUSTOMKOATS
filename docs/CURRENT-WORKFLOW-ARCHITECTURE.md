# Current System Architecture & Workflow

## Complete System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           USER DEVICES                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Desktop    │  │    Mobile    │  │    Tablet    │  │    Laptop    │ │
│  │   Browser    │  │   Browser    │  │   Browser    │  │   Browser    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │                  │          │
│         └──────────────────┴──────────────────┴──────────────────┘          │
│                                    │                                         │
│                                    │ HTTPS                                   │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                                     │
│                     http://localhost:5173                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    React + Vite Application                         │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐ │   │
│  │  │                   UI Components Layer                         │ │   │
│  │  │                                                                │ │   │
│  │  │  • HomePage                  • ProductsPage                   │ │   │
│  │  │  • ProductDetailPage         • CartPage                       │ │   │
│  │  │  • CheckoutPage              • OrdersPage                     │ │   │
│  │  │  • ProfilePage               • WishlistPage                   │ │   │
│  │  │  • LoginPage                 • RegisterPage                   │ │   │
│  │  │  • AdminProductsPage         • AdminOrdersPage                │ │   │
│  │  │  • AdminPromoCodesPage       • AdminWholesalePage             │ │   │
│  │  │  • FAQPage                   • TestimonialsPage               │ │   │
│  │  │  • WholesaleApplicationPage  • PolicyPages                    │ │   │
│  │  └──────────────────┬───────────────────────────────────────────┘ │   │
│  │                     │                                               │   │
│  │  ┌──────────────────▼───────────────────────────────────────────┐ │   │
│  │  │                   State Management Layer                      │ │   │
│  │  │                        (Zustand)                              │ │   │
│  │  │                                                                │ │   │
│  │  │  • authStore           - User authentication & sessions       │ │   │
│  │  │  • cartStore           - Shopping cart management             │ │   │
│  │  │  • wishlistStore       - User wishlist                        │ │   │
│  │  │  • adminStore          - Admin state & permissions            │ │   │
│  │  │  • categoryStore       - Product categories                   │ │   │
│  │  │  • recentlyViewedStore - Recently viewed products             │ │   │
│  │  └──────────────────┬───────────────────────────────────────────┘ │   │
│  │                     │                                               │   │
│  │  ┌──────────────────▼───────────────────────────────────────────┐ │   │
│  │  │                   Services Layer                              │ │   │
│  │  │                                                                │ │   │
│  │  │  • productService       - Product operations                  │ │   │
│  │  │  • orderService         - Order management                    │ │   │
│  │  │  • promoService         - Promo code validation               │ │   │
│  │  │  • addressService       - Address management                  │ │   │
│  │  │  • notificationService  - Toast notifications                 │ │   │
│  │  │  • storageService       - File uploads                        │ │   │
│  │  │  • posService           - POS operations                      │ │   │
│  │  │  • shiprocketService    - Shipping integration                │ │   │
│  │  │  • ewayBillService      - E-way bill generation               │ │   │
│  │  │  • settingsService      - App settings                        │ │   │
│  │  └──────────────────┬───────────────────────────────────────────┘ │   │
│  │                     │                                               │   │
│  │                     │ Currently: Direct Supabase Calls             │   │
│  │                     │ Future: Backend API Calls                    │   │
│  │                     │                                               │   │
│  │  ┌──────────────────▼───────────────────────────────────────────┐ │   │
│  │  │             Data Access Layer (Dual Mode)                     │ │   │
│  │  │                                                                │ │   │
│  │  │  Current Mode (Active):           Future Mode (Available):    │ │   │
│  │  │  ┌─────────────────────┐         ┌─────────────────────┐    │ │   │
│  │  │  │  Supabase Client    │         │   API Client        │    │ │   │
│  │  │  │  (Direct Access)    │         │   (Backend API)     │    │ │   │
│  │  │  │                     │         │                     │    │ │   │
│  │  │  │  • Auth             │         │  • authAPI          │    │ │   │
│  │  │  │  • Database         │         │  • productsAPI      │    │ │   │
│  │  │  │  • Storage          │         │  • ordersAPI        │    │ │   │
│  │  │  └─────────────────────┘         │  • promoAPI         │    │ │   │
│  │  │                                   │  • wholesaleAPI     │    │ │   │
│  │  │                                   │  • storageAPI       │    │ │   │
│  │  │                                   └─────────────────────┘    │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────┬──────────────┬────────────────────────────────────┘
                           │              │
                           │              │
              ┌────────────▼──────────┐  │
              │  Direct Supabase      │  │
              │  (Current - Active)   │  │
              │                       │  │
              │  Anon Key (Public)    │  │
              └────────────┬──────────┘  │
                           │              │
                           │              │ HTTP/HTTPS
                           │              │ API Calls
                           │              │
                           │   ┌──────────▼──────────┐
                           │   │   Backend API       │
                           │   │   (Future - Ready)  │
                           │   │                     │
                           │   │  localhost:3001     │
                           │   │                     │
                           │   │  Service Role Key   │
                           │   └──────────┬──────────┘
                           │              │
                           │              │ PostgreSQL
                           └──────────────┴──────────────┐
                                          │               │
                                          ▼               │
┌───────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API LAYER                                 │
│                      http://localhost:3001/api                             │
│                         (Ready - Not Yet Used)                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     Express.js Server                                │ │
│  │                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────┐ │ │
│  │  │                  Request Pipeline                               │ │ │
│  │  │                                                                  │ │ │
│  │  │  1. Helmet (Security Headers)                                   │ │ │
│  │  │  2. CORS (Cross-Origin Resource Sharing)                        │ │ │
│  │  │  3. Body Parser (JSON Parsing)                                  │ │ │
│  │  │  4. Input Sanitization (XSS Prevention)                         │ │ │
│  │  │  5. Request Logging                                             │ │ │
│  │  └────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────┐ │ │
│  │  │                  Middleware Layer                               │ │ │
│  │  │                                                                  │ │ │
│  │  │  • authenticateToken  - JWT token validation                    │ │ │
│  │  │  • requireAdmin       - Admin role verification                 │ │ │
│  │  │  • optionalAuth       - Optional authentication                 │ │ │
│  │  │  • handleValidation   - Request validation                      │ │ │
│  │  │  • sanitizeBody       - Input sanitization                      │ │ │
│  │  └────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────┐ │ │
│  │  │                  Route Handlers                                 │ │ │
│  │  │                                                                  │ │ │
│  │  │  /api/auth        • register, login, profile, password reset   │ │ │
│  │  │  /api/products    • CRUD operations, search, filters           │ │ │
│  │  │  /api/orders      • create, view, manage orders                │ │ │
│  │  │  /api/promo       • validate, manage promo codes               │ │ │
│  │  │  /api/wholesale   • applications, approvals                    │ │ │
│  │  │  /api/storage     • file uploads, downloads                    │ │ │
│  │  └────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────┐ │ │
│  │  │                  Business Logic Layer                           │ │ │
│  │  │                                                                  │ │ │
│  │  │  • Order calculation & validation                               │ │ │
│  │  │  • Promo code validation & application                          │ │ │
│  │  │  • Discount calculation                                         │ │ │
│  │  │  • Stock management                                             │ │ │
│  │  │  • Permission checks                                            │ │ │
│  │  │  • Data transformation                                          │ │ │
│  │  └────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────┐ │ │
│  │  │           Supabase Client (Service Role Key)                    │ │ │
│  │  │                                                                  │ │ │
│  │  │  • Full database access (bypasses RLS)                          │ │ │
│  │  │  • Secure server-side only                                      │ │ │
│  │  │  • Never exposed to frontend                                    │ │ │
│  │  └────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────┬──────────────────────────────────┘
                                         │
                                         │ PostgreSQL Protocol
                                         │ Secure Connection
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE CLOUD                                    │
│                   https://gozoxlueuwnyujvvafdl.supabase.co                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL Database                               │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │                      Tables                                   │  │ │
│  │  │                                                                │  │ │
│  │  │  • products                 - Product catalog                │  │ │
│  │  │  • orders                   - Customer orders                │  │ │
│  │  │  • order_items              - Order line items               │  │ │
│  │  │  • profiles                 - User profiles                  │  │ │
│  │  │  • promo_codes              - Promotional codes              │  │ │
│  │  │  • wholesale_applications   - Wholesale requests             │  │ │
│  │  │  • testimonials             - Customer reviews               │  │ │
│  │  │  • faqs                     - FAQ content                    │  │ │
│  │  │  • footer_links             - Footer navigation              │  │ │
│  │  │  • site_pages_content       - CMS content                    │  │ │
│  │  │  • policy_pages_content     - Policy pages                   │  │ │
│  │  │  • kustom_kultor_blogs      - Blog posts                     │  │ │
│  │  │  • settings                 - App settings                   │  │ │
│  │  │  • pos_transactions         - POS sales                      │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │                  Row Level Security (RLS)                     │  │ │
│  │  │                                                                │  │ │
│  │  │  • Enforced on direct Supabase calls (anon key)              │  │ │
│  │  │  • Bypassed by backend (service role key)                    │  │ │
│  │  │  • User-level data isolation                                 │  │ │
│  │  │  • Admin-only access policies                                │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    Supabase Auth                                     │ │
│  │                                                                       │ │
│  │  • User registration & login                                         │ │
│  │  • JWT token generation & validation                                 │ │
│  │  • Password reset & email verification                               │ │
│  │  • Session management                                                │ │
│  │  • OAuth providers (if configured)                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    Supabase Storage                                  │ │
│  │                                                                       │ │
│  │  Buckets:                                                            │ │
│  │  • products        - Product images                                  │ │
│  │  • avatars         - User profile pictures                           │ │
│  │  • documents       - Document storage                                │ │
│  │  • invoices        - Generated invoices                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

## Integration Services

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      THIRD-PARTY INTEGRATIONS                              │
│                                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐             │
│  │      Razorpay            │  │      Shiprocket          │             │
│  │   Payment Gateway        │  │   Shipping Service       │             │
│  │                          │  │                          │             │
│  │  • Payment collection    │  │  • Shipment creation     │             │
│  │  • Order verification    │  │  • Tracking              │             │
│  │  • Refunds               │  │  • Label generation      │             │
│  │                          │  │  • Rate calculation      │             │
│  │  Live: rzp_live_...      │  │  Credentials secured     │             │
│  └──────────────────────────┘  └──────────────────────────┘             │
│           ▲                              ▲                                 │
│           │                              │                                 │
│           │ Frontend calls               │ Currently: Frontend             │
│           │ (Public key)                 │ Future: Backend                 │
│           │                              │                                 │
└───────────┼──────────────────────────────┼─────────────────────────────────┘
            │                              │
            │                              │
┌───────────┴──────────────────────────────┴─────────────────────────────────┐
│                       E-way Bill Service                                    │
│                    (Government Integration)                                 │
│                                                                              │
│  • E-way bill generation for shipments                                     │
│  • Tax invoice compliance                                                  │
│  • GST integration                                                         │
│                                                                              │
│  Proxy function in Supabase                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Browse Products (Current Flow)

```
User Browser
    ↓ Navigate to /products
HomePage Component
    ↓ useEffect
productService.js
    ↓ getProducts()
Supabase Client (Anon Key)
    ↓ Direct query: select * from products
Supabase Database
    ↓ RLS: Allow public read
Return products[]
    ↓
Update State (categoryStore)
    ↓
Render ProductCards
    ↓
Display to User
```

### 2. User Login (Current Flow)

```
User enters credentials
    ↓
LoginPage Component
    ↓ handleLogin()
authStore (Zustand)
    ↓ login(email, password)
Supabase Auth Client
    ↓ signInWithPassword()
Supabase Auth Service
    ↓ Verify credentials
Generate JWT Token
    ↓
Store session locally
    ↓ Update authStore
Redirect to Homepage
```

### 3. Create Order (Current Flow)

```
User clicks "Place Order"
    ↓
CheckoutPage Component
    ↓ handleCheckout()
orderService.js
    ↓ createOrder(orderData)
Validate promo code (if any)
    ↓ promoService.validate()
Supabase Client (User Token)
    ↓ Insert into orders table
Supabase Database
    ↓ RLS: Check user_id matches
Create order record
    ↓ Insert order_items
Return order_id
    ↓
Update UI (OrderConfirmation)
    ↓
Redirect to /orders/:id
```

### 4. Admin Manage Products (Current Flow)

```
Admin login
    ↓ authStore verifies admin role
AdminProductsPage
    ↓ Load products
Supabase Client (Admin Token)
    ↓ select * from products
Return all products
    ↓
Admin edits product
    ↓ handleUpdate()
Supabase Client (Admin Token)
    ↓ update products set ...
Supabase Database
    ↓ RLS: Check admin role
Update product
    ↓
Refresh product list
```

## Security Layers (Current)

```
┌────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                             │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. HTTPS ENCRYPTION                                            │
│     All traffic encrypted in transit                            │
│                                                                  │
│  2. SUPABASE RLS (Row Level Security)                          │
│     Database-level access control                               │
│     • Users can only access their own data                      │
│     • Admins have elevated permissions                          │
│     • Public tables for product catalog                         │
│                                                                  │
│  3. SUPABASE AUTH                                               │
│     JWT-based authentication                                    │
│     • Token validation                                          │
│     • Session management                                        │
│     • Password hashing                                          │
│                                                                  │
│  4. FRONTEND VALIDATION                                         │
│     Client-side input validation                                │
│     • Form validation                                           │
│     • Type checking                                             │
│     • Error handling                                            │
│                                                                  │
│  5. ENVIRONMENT VARIABLES                                       │
│     Sensitive data in .env files                                │
│     • Supabase credentials                                      │
│     • API keys (Razorpay, Shiprocket)                          │
│     ⚠️ Some credentials exposed to frontend                    │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌────────────────────────────────────────────────────────────────┐
│                      FRONTEND STACK                             │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • React 19.2.5          - UI framework                        │
│  • Vite 8.0.10           - Build tool & dev server             │
│  • React Router 7.14.2   - Client-side routing                 │
│  • Zustand 5.0.12        - State management                    │
│  • Tailwind CSS 4.2.4    - Styling                             │
│  • Framer Motion 12.38.0 - Animations                          │
│  • Axios 1.16.0          - HTTP client                         │
│  • React Hot Toast 2.6.0 - Notifications                       │
│  • Lucide React 1.14.0   - Icons                               │
│  • jsPDF 2.5.2           - PDF generation                      │
│  • QRCode 1.5.4          - QR code generation                  │
│  • Dexie 4.4.6           - IndexedDB wrapper (offline)         │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      BACKEND STACK                              │
│                  (Ready - Not Yet Active)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Node.js               - Runtime                             │
│  • Express 4.21.2        - Web framework                       │
│  • Supabase JS 2.105.1   - Database client                     │
│  • CORS 2.8.5            - Cross-origin support                │
│  • Helmet 7.1.0          - Security headers                    │
│  • Express Validator 7.0.1 - Request validation                │
│  • Dotenv 18.0.1         - Environment config                  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      DATABASE & SERVICES                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Supabase              - PostgreSQL database + Auth           │
│  • PostgreSQL            - Relational database                  │
│  • Supabase Storage      - File storage                        │
│  • Razorpay              - Payment gateway                      │
│  • Shiprocket            - Shipping service                     │
│  • E-way Bill API        - Government tax service               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   CURRENT DEPLOYMENT                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Development:                                                   │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Frontend: localhost:5173 (Vite dev server)          │     │
│  │  Backend:  localhost:3001 (Express server)           │     │
│  │  Database: Supabase Cloud (gozoxlueuwnyujvvafdl)     │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  Production (Future):                                           │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Frontend: Vercel / Netlify (Static hosting)         │     │
│  │  Backend:  Railway / Render (Node.js hosting)        │     │
│  │  Database: Supabase Cloud (Production instance)      │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Migration Path

```
┌────────────────────────────────────────────────────────────────┐
│              MIGRATION: CURRENT → FUTURE                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1: Current State (NOW)                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Frontend → Supabase (Direct)                         │     │
│  │  Backend: Ready but not used                          │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  Phase 2: Migration (OPTIONAL)                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  1. Migrate Authentication Service                    │     │
│  │  2. Migrate Products Service                          │     │
│  │  3. Migrate Orders Service                            │     │
│  │  4. Migrate Promo Codes Service                       │     │
│  │  5. Migrate Wholesale Service                         │     │
│  │  6. Migrate Storage Service                           │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  Phase 3: Future State                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Frontend → Backend API → Supabase                    │     │
│  │  Enhanced security & validation                       │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Summary

### Current Architecture Strengths:
✅ Simple and direct  
✅ Fast development  
✅ Low latency (direct database access)  
✅ Supabase RLS provides basic security  
✅ All features working  

### Current Architecture Weaknesses:
❌ Database credentials exposed to frontend  
❌ Limited server-side validation  
❌ Difficult to add complex business logic  
❌ Shiprocket credentials exposed  
❌ No centralized monitoring  

### Future Architecture Improvements (Available):
✅ Backend API layer ready  
✅ Server-side validation  
✅ Credentials secured on backend  
✅ Centralized business logic  
✅ Better error handling  
✅ Monitoring capabilities  
✅ Scalable architecture  

---

**Current Status**: Both systems running, frontend using direct Supabase, backend available for migration when ready.
