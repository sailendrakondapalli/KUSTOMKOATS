# Design

## Context

See proposal.md (Why) and the audit for evidence. Constraints:
- JS-only Vite SPA. The `VITE_*` values are inlined at build time, so there is no runtime config injection.
- Admin data is protected only by Supabase RLS, which is inconsistent today (FE-002, owned by `backend-production-readiness`). The browser guard is a UX and exposure-reduction control, not an authorization boundary.
- No backend code may change here. Behavior must be preserved except where the specs say otherwise.

## Goals / Non-Goals

**Goals:** close the confirmed defects with small, local changes. Establish a test harness that later changes can extend. Provide a reproducible container artifact.

**Non-Goals:** API-layer rewrite, TypeScript migration, pagination, design-system changes, major dependency upgrades, an e2e harness (needs a seeded non-production Supabase project).

## Decisions

1. **Admin guard = session + claim, rendered as a layout route.** A single `AdminRoute` wraps a parent `<Route path="/admin">` with `<Outlet/>`, so the 17 admin pages are guarded in one place. The claim check order is `app_metadata.role === 'admin'` (server-controlled, cannot be self-assigned) → `VITE_ADMIN_EMAILS` → the legacy hard-coded list. `user_metadata` is never trusted.
   *Alternative:* query a `profiles.role` table or RPC. Rejected for now because no such contract exists (verified in the root SQL files), and it adds a request per navigation. The guard will switch to the RPC once the backend defines one. *Integration note:* the backend now defines `public.is_admin()` (migration `20261018000300`), which reads only `app_metadata.role`; the frontend check was aligned to the same single claim.
2. **Status mapping as a pure util** (`src/utils/orderStatus.js`) shared by `OrdersPage` and `OrderDetailPage`. Unknown values map to *Pending*: showing "Failed" for an unknown state is the more harmful error.
3. **Recovery detection:** capture `type=recovery` from `location.hash` in `src/lib/supabase.js` *before* `createClient` runs (supabase-js strips the hash during init), and also listen for the `PASSWORD_RECOVERY` event. Either signal shows the form. This avoids a race with the async URL parsing.
4. **Env validation** in `src/lib/env.js` as a pure function. `main.jsx` renders a `ConfigError` screen when it fails, and the Supabase client is created only when the config is valid. A dynamic `import('./App.jsx')` ensures no module touches `supabase` first.
5. **Error boundary:** a one-shot reload, keyed in `sessionStorage`, only for dynamic-import or chunk errors. Raw messages appear only in `import.meta.env.DEV`.
6. **Razorpay loader:** `loadRazorpay()` returns a memoized promise, and on failure it clears the memo so a retry is possible. The tag is removed from `index.html`.
7. **Container:** `node:22-alpine` build stage (`npm ci`, build-args for `VITE_*`), then `nginxinc/nginx-unprivileged:1.27-alpine` running as uid 101 on :8080. nginx stops gracefully on SIGQUIT, which the upstream image sets via `STOPSIGNAL`. `/healthz` is served by nginx itself. HTML gets `no-cache` and hashed assets get immutable caching.
   *Alternative:* `vite preview` or `serve`. Rejected: neither is meant for production, both need a Node runtime, and both have a larger attack surface.
8. **CSP Report-Only** with an allow-list derived from the code (self, Supabase, Razorpay, Google Fonts). It is report-only because image and video hosts used by CMS content are unknown, and enforcing it could break pages.
9. **Tests:** Vitest + @testing-library/react + jsdom, configured in `vite.config.js` (`test` key) to reuse the Vite pipeline. Supabase is mocked at the module boundary, so tests never touch the network.

## Risks / Trade-offs

- [Admins who used `/admin` without logging in are now prompted to sign in] → documented in the proposal impact and the README. Admin emails in the legacy list keep working.
- [The legacy email list stays in the bundle] → removing it is in the approval list. It is not an authorization boundary either way.
- [`window.location.origin` redirects fail if an origin is missing from the Supabase redirect allow-list] → add each origin there (backend config dependency). Production behavior is unchanged.
- [One container image per environment, because of build-time env] → this is documented. Runtime injection would need an `env.js` shim, deferred.
- [Lint is still red from about 190 pre-existing issues] → only the high-signal errors are fixed. A cleanup belongs in a separate change.

## Migration Plan

Deploy as usual. Rollback means reverting the commit. Before deploying: set `VITE_ADMIN_EMAILS` (optional), confirm the Supabase redirect URLs, and confirm admins can sign in.
