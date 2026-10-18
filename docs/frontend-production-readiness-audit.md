# Frontend Production-Readiness Audit

Date: 2026-10-18. Scope: `src/`, `public/`, `index.html`, build/deploy config. The backend (Supabase SQL, RLS, edge functions) was read only to check API contracts.
OpenSpec change: `openspec/changes/frontend-production-readiness/`.

## 1. Current architecture and stack

| Area | Actual |
|---|---|
| Framework | React 19.2 SPA, Vite 8 (Rolldown), JavaScript/JSX only (no TypeScript, no PropTypes) |
| Routing | react-router-dom 7 (`BrowserRouter`). Admin routes are in `src/App.jsx` and storefront routes in `src/components/AnimatedRoutes.jsx`. All pages are `React.lazy` |
| State | zustand stores (`src/store/*`): auth, cart, wishlist, admin, category, recently-viewed. There is also one React context (language) |
| API | `@supabase/supabase-js` direct table access (`.from()` in about 187 places) plus edge functions (`supabase.functions.invoke`) for Razorpay, Shiprocket and e-way bill. There is no API layer abstraction, and `axios` is installed but unused |
| Offline | Dexie (IndexedDB) for the admin POS (`src/services/offlineDB.js`) |
| Styling | Tailwind 4 (`@tailwindcss/vite`) plus extensive inline styles. framer-motion animations |
| Payments | Razorpay Checkout JS. The order and signature verification run in edge functions |
| Tests / CI | **None.** No test runner, no test files, no `.github/` workflows |
| Deploy | Vercel (`vercel.json`: SPA rewrite, immutable cache for `/assets`). A Netlify-style `public/_redirects` is also shipped. There was no Docker config |

## 2. Critical gaps (summary)

1. All `/admin/*` routes render without any authentication (FE-001). The data safety of the admin surface depends entirely on RLS, which is inconsistent (FE-002).
2. Payment amounts, order totals and line prices are computed in the browser and trusted by the backend (FE-002).
3. Known-vulnerable runtime dependencies are present, including critical `jspdf` and high-severity `react-router` and `axios` (FE-003).
4. Paid orders display as "Failed" to customers, and the password-reset flow cannot set a new password (FE-004, FE-005).
5. There are no tests, no CI, no container build and no security headers (FE-011, FE-012, FE-013).

## 3. Findings

Severity: Critical / High / Medium / Low. Type: **D** = confirmed defect (reproduced from code), **R** = potential risk.
Status: Fixed / Partial / Open / Backend / Approval (see section 6).

| ID | Sev | Type | Finding and evidence | Impact | Recommended fix | Status |
|---|---|---|---|---|---|---|
| FE-001 | Critical | D | `src/components/AdminRoute.jsx` returns `children` unconditionally ("No authentication check"), and `src/App.jsx` does not even wrap the `/admin*` routes with it. Any anonymous visitor gets the full admin UI (orders, customers, POS, ERP, promo codes) | Admin UI exposure. Any write that RLS permits for anon or any authenticated user succeeds from this UI | Guard every admin route: require a session and an admin claim, otherwise redirect or show 403. The real control is still RLS (FE-002) | Fixed (UI) |
| FE-002 | Critical | D (backend) | `supabase/functions/create-razorpay-order/index.ts` charges `amount` from the request body. `src/services/orderService.js` `createPendingOrder` inserts `total_amount` and per-item `price` from the client. The Shiprocket order is created from the browser after payment (`CheckoutPage.jsx`). RLS "admin" policies use `USING (true)` (testimonials), `auth.role()='authenticated'` (bundles, blog) or `auth.jwt()->>'role'='admin'` (orders, wholesale), so the rules are inconsistent and some are wide open | Price tampering (pay ₹1 for any cart). Any logged-in user can edit content. Admin UI may silently fail for real admins | Backend: compute totals server-side from `order_items` and product prices, define one admin claim (e.g. `app_metadata.role='admin'`), and fix RLS. The frontend cannot mitigate this. *In progress (backend change):* verification is bound to the stored order amount and `public.is_admin()` checks `app_metadata.role`. The stored total itself is still client-supplied. The RLS lockdown that replaces the inconsistent policies is written but approval-gated (BE-001, `supabase/proposed/`) | Backend |
| FE-003 | High | D | `npm audit --omit=dev`: 8 vulnerabilities (1 critical `jspdf<=4.2.0`, high `jspdf-autotable`, `react-router 7.14.2`, `axios` (unused), `ws`, `form-data`; moderate `dompurify` via jspdf). `dotenv` and `axios` are unused in `src/` | Known CVEs ship to users (open redirect in router; jspdf injection paths) | Remove unused deps, apply in-range fixes, and upgrade `jspdf`/`jspdf-autotable` to the next major after testing invoices | Partial (jspdf: Approval) |
| FE-004 | High | D | `src/pages/OrderDetailPage.jsx` treats only `payment_status==='completed'` as paid, but the backend sets `'paid'` (`verify-razorpay-payment`, `razorpay-webhook`). Other values (`pending_verification`) render "Failed" | Customers see paid orders as **Failed** (support load, refunds) | One shared payment-status mapping used by the order list and order detail pages, with tests | Fixed |
| FE-005 | High | D | `authStore.resetPassword` redirects to `/auth/callback`, but nothing handles the `recovery` link (no `updateUser({password})` anywhere in `src/`). The callback just logs the user in | Password reset cannot set a new password | Detect recovery on the callback and render a set-new-password form | Fixed |
| FE-006 | Medium | D | `src/pages/AuthCallbackPage.jsx`: the 5 s fallback `setTimeout(() => navigate('/login'))` is never cleared after a successful late sign-in, and there is no unmount cleanup | Users who sign in successfully can be bounced to `/login` | Clear the timer and subscription on success and on unmount | Fixed |
| FE-007 | Medium | D | OAuth and reset `redirectTo` are hard-coded to `https://www.kustomkoats.com/auth/callback` (`src/store/authStore.js`) | Login breaks on preview, staging, local and Docker origins, and sends users to prod | Derive from `window.location.origin`. The Supabase redirect allow-list must include each origin | Fixed (+Backend config) |
| FE-008 | Medium | D | `src/lib/supabase.js` passes possibly-undefined env vars to `createClient`, which throws at import, so a missing env gives a blank white page. The root `.env.example` contains a real-looking project URL and Razorpay key id rather than placeholders. `VITE_ADMIN_EMAIL` is listed but unused | Opaque production outage on misconfiguration. Real identifiers in templates | Validate env at startup and render a clear configuration error. Placeholder-only `.env.example` | Fixed |
| FE-009 | High | D | The home hero autoplays `/Kustom Koats Hero Page.mov` (**36 MB**, QuickTime labelled `video/mp4`) (`src/pages/HomePage.jsx:148`). `IntroVideo` and `IntroAnimation` cover **every** page load, including `/admin`, for about 3 s or more, and ignore `prefers-reduced-motion` (`src/App.jsx`) | Very poor LCP on mobile and wasted bandwidth. Motion on load fails WCAG 2.3.3 (AAA) and 2.2.2 expectations. Admin staff wait on every reload | Skip the intros on `/admin` and for reduced-motion users. Re-encode the hero to compressed MP4/WebM with a poster (asset change) | Partial (hero asset: Approval) |
| FE-010 | Medium | D | `index.html` loads `checkout.razorpay.com/v1/checkout.js` synchronously on every page. `AdminPOSPage.jsx` already lazy-loads it separately | Third-party JS on every route (TBT, privacy, blast radius) | A shared on-demand loader used by checkout and POS | Fixed |
| FE-011 | Medium | R | `vercel.json` sets no security headers (no CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame protection). The Supabase session lives in `localStorage` (supabase-js default), so any XSS means token theft | XSS or clickjacking impact is maximized | Add baseline headers now. Roll out CSP in Report-Only first, then enforce | Partial (enforced CSP: Approval) |
| FE-012 | High | D | No unit, integration or e2e tests and no CI. `npm run lint` reports 209 problems (193 errors), including a **parse error** (`src/components/admin/AdminLayout.jsx` duplicate import, dead file), a **rules-of-hooks** violation (`TechnicalBarEditor.jsx` early return before hooks, which crashes if `labels` goes from empty to non-empty), and `no-undef` in dead code (`CheckoutPage.jsx` UPI handlers, `HomePage.jsx` `WhyKustomKoatsSection`) | Regressions are undetectable, and lint cannot act as a gate | Add Vitest and Testing Library regression tests. Fix the high-signal lint errors. Add CI (owner decision) | Partial |
| FE-013 | Medium | D | No Dockerfile, nginx config or `.dockerignore`. `vercel.json` uses `npm install` (not reproducible) | No portable or self-hosted deploy path. Lockfile drift in CI builds | Multi-stage Dockerfile (Node build to unprivileged nginx), SPA fallback, healthcheck, `npm ci` | Fixed |
| FE-014 | Medium | D | No catch-all route. Unknown URLs render an empty page between the navbar and footer (`AnimatedRoutes.jsx`) | Broken UX and soft-404s for SEO | Add a NotFound route (with `noindex`) | Fixed |
| FE-015 | Medium | D | `public/robots.txt` and `public/sitemap.xml` point to `https://www.rudrakshadivines.com` (an unrelated site; leftover from a template) | Search engines index the wrong domain, and the real site has no sitemap | Point both at `https://www.kustomkoats.com` and list the real public routes | Fixed |
| FE-016 | Medium | D | `ErrorBoundary.jsx` shows raw `error.message` to users, and it calls `window.location.reload()` on *any* error containing "Failed to fetch". A persistent network failure therefore causes an infinite reload loop | Leaks internals. Reload loops on outage | Reload at most once per session for chunk errors only. Show a generic message with retry | Fixed |
| FE-017 | Low | D | `AdminRoute.jsx` hard-codes 10 personal admin email addresses in the client bundle (PII, and an allow-list the client can bypass anyway) | PII exposure. Admin changes need a redeploy | Prefer the server-controlled `app_metadata.role`, with the email allow-list coming from env. The allow-list grants UI access only: after the backend RLS lockdown, an allow-listed user without `app_metadata.role='admin'` cannot write | Partial (removal: Approval) |
| FE-018 | Low | D | Icon-only buttons lack accessible names (`ProductCard.jsx` wishlist ×2, `CheckoutPage.jsx` close). There are 51 `outline-none` usages and no global `:focus-visible` style | Screen-reader and keyboard users cannot identify controls or see focus (WCAG 4.1.2, 2.4.7, 2.4.11) | Add `aria-label`s and a global focus-visible outline | Fixed |
| FE-019 | Medium | R | Only 7 of about 187 queries use `.range`/`.limit`. Admin pages fetch entire tables (`AdminOrdersPage`, `AdminTransactionsPage`, `AdminCustomersPage`). Errors are mostly `console.error` plus toast, with no retry | Slow admin pages and timeouts as data grows | Server-side pagination and a shared query/error helper (separate change) | Open |
| FE-020 | Low | R | Bundle: entry chunk was 454 kB minified (now 194 kB entry + 138 kB `App` chunk, since `App` is loaded after env validation). `brandedInvoiceGenerator` is 422 kB (jspdf) and is lazy. There are 181 `console.*` calls in production code | Slower TTI on mobile | Measure with a bundle visualizer, defer framer-motion from the shell, strip `console.debug/log` in prod | Open |
| FE-021 | Low | R | No type checking (JS only). Services return unvalidated Supabase rows. `JSON.stringify(address)` is stored in a text column and parsed ad hoc | Shape drift goes undetected | Incremental `// @ts-check`/JSDoc on services, or TS for new modules (separate change) | Open |
| FE-022 | Low | D | Root `test-shiprocket-now.html` embeds the Supabase project URL and **anon** JWT (role `anon`, which is public by design). `test-fetch-products.html` writes DB rows via `innerHTML`. `src/utils/testRazorpay.js` and `testShiprocket.js` are dead debug helpers that log env | Hygiene. Credentials are copied into files outside env management | Replace with placeholders. Keep these files out of builds and images | Fixed (placeholders, docker-ignored) |

## 4. Prioritized remediation

- **P0 (critical):** FE-001 (done), FE-002 (backend), FE-003 in-range fixes (done) and jspdf major (approval).
- **P1 (high):** FE-004, FE-005, FE-012 test baseline and high-signal lint errors, FE-009 intro gating (done). Also hero video re-encode (approval).
- **P2 (medium):** FE-006, FE-007, FE-008, FE-010, FE-011 headers, FE-013, FE-014, FE-015, FE-016 (done). FE-019 pagination (open).
- **P3 (low):** FE-017, FE-018, FE-022 (done/partial). FE-020, FE-021 (open). Remaining 190-odd lint warnings and errors (mostly unused variables and React Compiler-style hook rules).

## 5. Testing and deployment gaps

- **Added:** Vitest + Testing Library + jsdom (`npm test`). Regression tests cover the admin guard, the payment-status mapping, env validation, the auth redirect origin, the error boundary and the Razorpay loader.
- **Still missing:** browser e2e (Playwright) for checkout, login and admin. It was not added because it needs browser binaries plus a seeded Supabase test project, and the live project must not be used. There is no CI workflow (`.github/` has no owner in this split; the recommended pipeline is `npm ci && npm run lint && npm test && npm run build && npm audit --omit=dev`).
- **Lint gate:** `npm run lint` still fails, with 190 problems (173 errors, down from 209/193). They are all pre-existing classes: `no-unused-vars` and React Compiler hook rules. Parse, `no-undef`, `rules-of-hooks` and `no-dupe-keys` errors are now 0. The changed files carry no new issues, apart from issues in `AdminLayout.jsx` that were previously hidden by its parse error.
- **Docker:** `Dockerfile` + `nginx/default.conf` + `.dockerignore` were added. `VITE_*` values are **build-time** (baked into JS), so one image is built per environment, using `--build-arg`.
- **Vercel:** now uses `npm ci`. Security headers were added. `public/_redirects` is Netlify-only and harmless on Vercel and nginx.

## 6. Backend dependencies and unresolved risks

| Ref | Needed from backend (owner: `openspec/changes/backend-production-readiness`) |
|---|---|
| FE-002 | Server-side recomputation of order totals and line prices (in `create-razorpay-order`, or via an RPC that creates the order and the Razorpay order together). Reject client `amount`. Move Shiprocket creation to `verify-razorpay-payment` or the webhook |
| FE-001/017 | A single admin authorization source. **Resolved in design:** the backend's `public.is_admin()` (migration `20261018000300`) reads `app_metadata.role = 'admin'`, and the frontend guard was aligned to that exact claim (the `app_metadata.roles` array is no longer honoured). The RLS policies that use it are approval-gated (`backend-admin-rls-lockdown`) |
| FE-004 | Canonical `payment_status` values. The backend writes `paid` and `failed`, and treats `paid`/`completed`/`success` as paid (`PAID_STATUSES`, stock trigger). The frontend mapping now accepts all three as Paid. No DB check constraint enforces the set yet |
| FE-005/007 | Supabase Auth: add each deploy origin's `/auth/callback` to the Redirect URL allow-list, and keep the email recovery template pointing there. Edge-function `ALLOWED_ORIGINS` (backend change) must include each frontend origin |
| FE-019 | Indexes for paginated admin queries (`orders.created_at`, `orders.user_id`) |

**Requires approval (not applied):**
1. Upgrade `jspdf` 2.5 to 4.x and `jspdf-autotable` 3.8 to 5.x (major; invoice and receipt PDFs must be re-verified). This clears the critical advisory.
2. Replace the 36 MB hero `.mov` with a compressed MP4/WebM plus a poster image (content or asset change).
3. Enforce CSP (currently Report-Only; Razorpay, Supabase, Google Fonts and image hosts need confirmation).
4. Remove the hard-coded admin email allow-list once `app_metadata.role` or `VITE_ADMIN_EMAILS` is provisioned (otherwise admins are locked out).
5. Play the intro once per session instead of on every load (product decision; code comment in `IntroVideo.jsx` suggests it).
6. Delete the dead files (`AdminLayout.jsx`, `src/utils/test*.js`, root `test-*.html`). Unreachable functions that referenced undefined state (`CheckoutPage` UPI-screenshot handlers, `HomePage` `WhyKustomKoatsSection`) were removed, because they could not run. They are recoverable from git.

**Unresolved risks:** client-side guards are UX only, and until FE-002 lands the admin data is protected only by the current mixed RLS. The session token is in `localStorage`. There is no e2e coverage of payment. The Razorpay key id and Supabase URL are public by design but are now baked per build.

## 7. Verification results (2026-10-18)

| Check | Command | Result |
|---|---|---|
| Unit + integration tests | `npm test` | **Pass**: 10 files, 42 tests. The App-level admin test was confirmed to **fail** against the original `App.jsx`. After the integration review: 11 files, 45 tests, pass |
| Lint | `npm run lint` | **Fail (pre-existing)**: 190 problems, 0 parse, `no-undef` or `rules-of-hooks` errors. See section 5 |
| Type check | n/a | Not available (JS-only project, FE-021) |
| Formatting | n/a | No formatter configured (no Prettier). Not added, to avoid a repo-wide reformat |
| Production build | `npm run build` | **Pass** |
| Dependency audit | `npm audit --omit=dev` | 3 remaining (jspdf critical, jspdf-autotable high, dompurify moderate), all in the jspdf major-upgrade chain, which needs approval. Before: 8 |
| Docker build | `docker build --build-arg VITE_…=<dummy> .` | **Pass** (169 MB, of which 45 MB is `public/` media) |
| Container smoke | curl against `:18080` | **Pass**: `/healthz` 200, `/` 200 `no-cache`, deep link 200, `/assets/missing.js` 404, `/.env` and `/.git/config` 404, hashed assets immutable and gzip, all security headers present. Runs as uid 101. Docker health `healthy`. `docker stop` exits 0 gracefully |
| E2E | n/a | **Not run**: no harness, and a non-production Supabase project is required (section 5) |
| OpenSpec | `openspec validate frontend-production-readiness --strict` | **Valid** |
| Secret scan of diff | grep for JWT, project URL, `rzp_live_`, `service_role` in added lines | None found. `.env.example` and the root `test-*.html` now contain placeholders only. A real anon JWT and project URL remain in **git history** (baseline commit, `test-shiprocket-now.html`). The anon key is public by design, so rotation is optional |

Notes: `npm install` with npm 10.9 crashed while adding vitest (`Cannot read properties of null (reading 'edgesOut')`, an arborist bug). The dependency was added with `npx npm@11`, then the lockfile was re-synced with npm 10 so that `npm ci` works in the Node 22 image. jsdom 30 prints an `EBADENGINE` warning on Node 22.22.0 (it wants 22.22.2 or later). It is dev-only, and the warning does not affect the build.
