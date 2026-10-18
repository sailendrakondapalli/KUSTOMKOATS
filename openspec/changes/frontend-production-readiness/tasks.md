# Tasks

## 1. Test harness and dependency hygiene (P0)

- [x] 1.1 Add Vitest, @testing-library/react, @testing-library/jest-dom and jsdom as devDependencies, plus a `test` script and the `test` block in `vite.config.js`; verify `npm test` runs a smoke test
- [x] 1.2 Remove unused `axios` and `dotenv`, and apply in-range fixes (`react-router-dom`, transitive `ws` and `form-data`) via `npm audit fix` without `--force`; verify `npm audit --omit=dev` lists only the jspdf chain and `npm run build` passes

## 2. Admin access control (P0, FE-001/FE-017)

- [x] 2.1 Implement `isAdmin` (app_metadata role → `VITE_ADMIN_EMAILS` → legacy list) and the guarded `AdminRoute` (loading / redirect-to-login / access-denied); verify the unit tests cover all spec scenarios, including forged `user_metadata`
- [x] 2.2 Nest all `/admin*` routes under one guarded layout route in `App.jsx`; verify with an integration test that anonymous `/admin/orders` redirects to `/login` and admin content is not rendered

## 3. Customer correctness (P1, FE-004/005/006/007)

- [x] 3.1 Add the `orderStatus` util and use it in `OrdersPage` and `OrderDetailPage`; verify the unit tests for `paid`, `completed`, `pending_verification`, `failed` and unknown values
- [x] 3.2 Derive auth `redirectTo` from `window.location.origin`; verify a unit test asserts the value passed to `signInWithOAuth` and `resetPasswordForEmail`
- [x] 3.3 Add recovery detection and a set-new-password form on `/auth/callback`; verify a test shows the form in recovery mode and a mismatch error
- [x] 3.4 Clear the callback timeout and subscription on success and unmount; verify a fake-timer test that a late session never navigates to `/login`

## 4. App shell resilience, performance and a11y (P1/P2, FE-008/009/010/014/016/018)

- [x] 4.1 Add `src/lib/env.js` validation and the ConfigError screen; verify unit tests for missing and invalid vars (names only, no values)
- [x] 4.2 Harden `ErrorBoundary` (one-shot chunk reload, generic message in prod); verify tests for the generic message and the no-second-reload behavior
- [x] 4.3 Add the NotFound catch-all route (noindex); verify a routing test for `/does-not-exist`
- [x] 4.4 Skip the intro overlays on `/admin` and for reduced motion; verify a test with mocked `matchMedia`
- [x] 4.5 Add the `loadRazorpay` loader, use it in Checkout and POS, and remove the script from `index.html`; verify loader tests (single injection, error path) and the build
- [x] 4.6 Add `aria-label`s to icon-only buttons and a global `:focus-visible` outline; verify by grep that no icon-only button lacks a label
- [x] 4.7 Fix the high-signal lint errors (AdminLayout duplicate import, TechnicalBarEditor rules-of-hooks, dead code with undefined identifiers, duplicate key); verify `npx eslint` reports 0 `no-undef`, parse and `rules-of-hooks` errors

## 5. Delivery (P2, FE-011/013/015/022)

- [x] 5.1 Add `Dockerfile`, `nginx/default.conf` and `.dockerignore`; verify `docker build` succeeds and smoke tests pass (`/healthz` 200, deep link 200, missing asset 404, headers present, runs as non-root)
- [x] 5.2 Update `vercel.json` (`npm ci`, security headers, CSP Report-Only, HTML no-cache); verify the JSON parses and the headers match the nginx config
- [x] 5.3 Fix `robots.txt` and `sitemap.xml` for the production domain; verify grep finds no foreign domain
- [x] 5.4 Replace the real-looking values in `.env.example` and the root `test-*.html` with placeholders, and document env and Docker usage in `docs/frontend-deployment.md` plus a README pointer; verify by grep that no JWT or project URL remains in these files

## 6. Integration verification

- [x] 6.1 Run lint (high-signal subset), tests, build, `npm audit` and the Docker smoke tests; record the results in the audit report and review `git diff` for secrets and unintended changes

- [x] 6.2 Cross-team integration review: align `isAdmin` with the backend `public.is_admin()` (single `app_metadata.role` claim; the `roles` array is no longer honoured), add the backend's legacy `success` paid status to the mapping, and make guest `createPendingOrder` work under the proposed lockdown (client-generated id, no `insert().select()`); verify `npm test`. See `docs/production-readiness-summary.md`

## Workflow follow-up

- Approval items (jspdf major, hero asset, enforced CSP, legacy admin list removal, intro once per session, dead file deletion) are tracked in the audit, section 6.
- Archive this change after review: `openspec archive frontend-production-readiness`.
