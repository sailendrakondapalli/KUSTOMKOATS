# Proposal

## Why

The audit (`docs/frontend-production-readiness-audit.md`) found confirmed defects that block a production launch. The admin UI renders for anonymous visitors (FE-001), and paid orders show as "Failed" to customers (FE-004). Password reset cannot complete (FE-005). A missing env var produces a blank page (FE-008), and an error boundary can reload forever (FE-016). The app also ships known-vulnerable dependencies (FE-003) and has no tests, container build or security headers (FE-011..013). These issues are cheap to fix in the SPA and expensive to leave.

## What Changes

- Gate every `/admin/*` route behind an authenticated session with an admin claim. Non-admins get a 403 view and anonymous users are sent to login (UX only; RLS stays the control).
- Use one shared payment and order status mapping for the customer order pages (`paid`, plus legacy `completed`, count as paid).
- Auth: handle the password-recovery link with a set-new-password form, fix the stale callback timeout, and derive OAuth and reset redirect URLs from the current origin.
- Resilience: validate env at startup with a readable error screen. The error boundary reloads at most once for stale chunks and otherwise shows a generic message with retry. Unknown routes get a NotFound page.
- Performance and a11y: load Razorpay on demand rather than on every page, and skip the intro overlays on admin routes and for `prefers-reduced-motion`. Add accessible names to icon-only buttons and a global focus-visible style.
- Delivery: a multi-stage Dockerfile (unprivileged nginx with SPA fallback, healthcheck and security headers) plus `.dockerignore`. Vercel uses `npm ci` and baseline headers, with CSP in Report-Only. robots and sitemap point at the real domain.
- Dependencies: remove unused `axios`/`dotenv`, and apply in-range security fixes (react-router, transitive `ws`/`form-data`).
- Tests: Vitest + Testing Library regression tests for the behaviors above. Fix high-signal lint errors (parse error, rules-of-hooks, undefined identifiers).

Out of scope (separate changes or approval needed): the jspdf major upgrade, hero video re-encoding, enforcing CSP, admin pagination (FE-019), TypeScript adoption (FE-021), CI workflow, and e2e.

## Capabilities

### New Capabilities
- `admin-access-control`: who may see the admin console in the browser and what others see instead.
- `customer-auth-flows`: sign-in redirect, OAuth/email callback and password recovery behavior.
- `order-status-display`: how payment and fulfilment states are presented to customers.
- `app-shell-resilience`: startup configuration validation, error boundaries, unknown routes and intro overlays.
- `static-delivery`: how the built SPA is served (container runtime, SPA fallback, health endpoint, security headers, crawler files).

### Modified Capabilities
<!-- none: openspec/specs/ is empty -->

## Impact

- Code: `src/App.jsx`, `src/components/{AdminRoute,ErrorBoundary,AnimatedRoutes,IntroVideo,ProductCard}.jsx`, `src/lib/{supabase,env}.js`, `src/store/authStore.js`, `src/pages/{AuthCallbackPage,OrderDetailPage,OrdersPage,CheckoutPage,HomePage,NotFoundPage}.jsx`, `src/pages/admin/AdminPOSPage.jsx`, `src/utils/{orderStatus,loadRazorpay}.js`, and `index.html`.
- Config: `package.json` / lockfile (deps, `test` script), `vite.config.js` (test config), `vercel.json`, the new `Dockerfile`, `nginx/default.conf`, `.dockerignore`, `.env.example`, and `public/robots.txt`, `public/sitemap.xml`.
- Backend dependencies (no backend code changed here): a server-side admin claim (`app_metadata.role='admin'`) enforced in RLS, server-side order total computation, the Auth redirect allow-list for each origin, and the canonical `payment_status` enum. See the audit, section 6. The backend side is tracked in `backend-production-readiness` (`public.is_admin()`, payment binding) and the approval-gated `backend-admin-rls-lockdown`, which depends on this change's admin guard; the cross-team order is in `docs/production-readiness-summary.md`.
- Behavior change: `/admin` now requires sign-in as an admin. Anyone relying on unauthenticated admin access (for example a POS terminal) must sign in.
