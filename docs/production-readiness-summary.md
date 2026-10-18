# Production-Readiness Summary

Date: 2026-10-18. This is the entry point. Details live in the linked documents. Nothing has been committed, pushed, deployed or applied to the live Supabase project.

## 1. What was done

| Area | Documents | OpenSpec change |
|---|---|---|
| Frontend (SPA, build, Docker, Vercel) | [Audit](frontend-production-readiness-audit.md) (FE-001 to FE-022), [Deployment](frontend-deployment.md) | [`frontend-production-readiness`](../openspec/changes/frontend-production-readiness/) |
| Backend (Postgres, RLS, Storage, edge functions) | [Audit](backend-production-readiness-audit.md) (BE-001 to BE-020), [Operations](backend-operations.md) | [`backend-production-readiness`](../openspec/changes/backend-production-readiness/) (applied in code), [`backend-admin-rls-lockdown`](../openspec/changes/backend-admin-rls-lockdown/) (**approval-gated, not applied**) |

- **Frontend:** admin route guard, payment-status mapping, password-recovery flow, origin-relative auth redirects, env validation, error-boundary hardening, Razorpay loaded on demand, NotFound route, a11y fixes, security headers (CSP Report-Only), Dockerfile and nginx, and a Vitest suite.
- **Backend:** payment verification bound to the stored order and amount, an idempotent webhook that never downgrades a paid order, idempotent stock deduction, validated edge functions with timeouts and generic errors carrying a `request_id`, a `health` function, version-controlled migrations (baseline, drift, constraints, hardening with `public.is_admin()`), Deno tests and throwaway-container DB tests.
- **Integration review (this pass):** fixed four cross-team defects (section 2) and reconciled both audits, both deployment docs, the README and all three OpenSpec changes.

## 2. Integration defects found and fixed

| # | Defect | Fix |
|---|---|---|
| I-1 | The frontend `isAdmin` also accepted `app_metadata.roles: ['admin']`, but `public.is_admin()` reads only `app_metadata.role`. After the lockdown, such a user would see the console and fail every write. | `src/auth/isAdmin.js` now checks the same single claim. A test covers the array case. |
| I-2 | The backend treats `paid`, `completed` and `success` as paid (`PAID_STATUSES`, stock trigger), but the frontend mapping showed `success` as "Pending". | Added `success` to `src/utils/orderStatus.js`, with a test. |
| I-3 | Guest checkout ran `insert().select().single()` on `orders`. Under the proposed lockdown, guests fail the `own or admin read` SELECT policy, so `INSERT ... RETURNING` is rejected and **guest checkout would break**. The DB tests used plain INSERTs and missed this. | `createPendingOrder` now generates the UUID client-side and inserts without reading the row back. It works under both the current and the proposed policies. Covered by `src/services/orderService.test.js`. |
| I-4 | The docs contradicted each other: the backend said "the admin UI has no login", and the frontend spec let the email allow-list grant admin without saying that it confers no DB rights. | Updated BE-001 and the §4/§6 notes, the FE-002/FE-004/FE-017 notes and the §6 dependencies, the `admin-access-control` spec (new requirement "Admin role claim matches the backend"), and the lockdown task 1.2 and its proposal. |

Contracts checked and found consistent, with no change needed:
- **Checkout:** load the SDK, then `create-razorpay-order`, then the pending order, then `verify-razorpay-payment` (UUID `order_id`, matching `razorpay_order_id`, amount = `total_amount`), then `create-shiprocket-order` (requires a paid UUID order, which holds after verify).
- **Receipt:** the checkout receipt `order_<ms>` stays within 40 characters.
- **POS:** the notes stay within the 15-entry / 256-character limit.
- **CSP:** `connect-src`/`script-src`/`frame-src` cover `*.supabase.co`, the Razorpay checkout, api and lumberjack hosts, and the jsDelivr/unpkg hosts that dotlottie uses for wasm. It is Report-Only.
- **Auth redirect:** redirects use `window.location.origin` + `/auth/callback`.
- **Ignore rules:** `supabase/.temp` is ignored through `supabase/.gitignore`. `.gitignore` was not changed by either agent. The two README sections were merged into one.

## 3. Top risks (combined, ranked)

1. **Admin and CMS data are writable with the public anon key** (BE-001, BE-007, FE-002). The UI guard is not a security boundary. The lockdown is written and tested in a throwaway DB, but not applied.
2. **Order totals and prices are client-supplied** (BE-004, FE-002). Payments are now bound to the stored total, but the total itself can be forged.
3. **The e-way-bill portal password is stored in plaintext and readable by anyone** (BE-002).
4. **Critical `jspdf` advisory** (FE-003). The fix is a major upgrade.
5. **Production schema drift is unknown** (BE-010, BE-014). Some RPCs, such as `get_all_orders`, exist only in production and may expose every order's PII to anon.
6. **Over-permissive Storage, with payment proofs in a public bucket** (BE-008).
7. **No CI and no e2e coverage of checkout or admin** (FE-012, BE-016). Lint still fails (190 problems, all pre-existing).

## 4. Requires approval (de-duplicated, not applied)

| # | Item | Reason | Impact |
|---|---|---|---|
| A-1 | Apply the admin RLS lockdown (`supabase/proposed/20261018100000_PROPOSED_admin_rls_lockdown.sql`; BE-001/002/007/008/011/018) | It narrows DB access | It breaks admin, POS and order-status updates for anyone without `app_metadata.role='admin'`. It closes the top risk. |
| A-2 | Server-side order creation and pricing (BE-004 / FE-002) | It is a breaking API change to checkout and POS | It needs a new RPC or edge function, plus frontend changes. It closes price tampering. |
| A-3 | Private payment-proof bucket (BE-008) | It changes the frontend upload path | It removes public exposure of UPI screenshots. |
| A-4 | Rotate the e-way-bill password and move it to Vault (BE-002) | It is an irreversible operational action | Until then, the e-way-bill flow must be re-tested and the credential is exposed. |
| A-5 | `supabase migration repair --status applied 20261018000000` on production | It writes the production migration history | It is required before `supabase db push`. |
| A-6 | Upgrade `jspdf` 2 to 4 and `jspdf-autotable` 3 to 5 (FE-003) | It is a major upgrade | Invoice and receipt PDFs must be re-verified. It clears the critical advisory. |
| A-7 | Enforce the CSP (it is Report-Only today; FE-011) | Enforcing it may block third parties | Collect violation reports first. |
| A-8 | Remove the hard-coded admin email list (FE-017) | It locks out admins who lack the role | Do it after step 2 in section 5. It removes PII from the bundle. |
| A-9 | Replace the 36 MB hero `.mov` (FE-009) | It is a content or asset change | Large LCP and bandwidth gains. |
| A-10 | Play the intro once per session (FE-009) | It is a product decision | UX. |
| A-11 | Delete the dead files (`AdminLayout.jsx`, `src/utils/test*.js`, root `test-*.html`) | It deletes code | Hygiene. |

## 5. Cross-team rollout checklist (in order)

1. [ ] **Owner:** approve A-1 in writing, and record the approval in `backend-admin-rls-lockdown/tasks.md`.
2. [ ] **Ops (service role, staging first):** grant `app_metadata: { role: 'admin' }` to every admin, including every address in the legacy or `VITE_ADMIN_EMAILS` list who should keep access. Verify that `select public.is_admin()` returns true for an admin JWT.
3. [ ] **Ops:** run `supabase db dump` (read-only), diff it against the baseline, and check for duplicate `razorpay_order_id` values. Then, with A-5 approved, run `migration repair` and `supabase db push` for migrations 0100 to 0300 (additive).
4. [ ] **Backend:** set the function secrets and `ALLOWED_ORIGINS` (every SPA origin: apex and `www` on `kustomkoats.com`, previews, and `kustomkoats.in` if it serves the app). Deploy the six functions.
5. [ ] **Auth config:** add each origin's `/auth/callback` to the Supabase redirect allow-list.
6. [ ] **Frontend:** deploy the guard, the checkout change (I-3) and the headers. Verify admin login and guest and logged-in checkout on staging.
7. [ ] **Backend:** review and gate the production-only RPCs (`get_all_orders`, `get_all_order_items`, `update_order_status`, `get_next_series_number`) with `is_admin()` (BE-014).
8. [ ] **Backend:** move the lockdown into `supabase/migrations/` with a new timestamp, apply it on staging, run the storefront and admin smoke tests (lockdown task 3.1), then apply it in production in the same window as step 6.
9. [ ] **Ops:** rotate the e-way-bill password into Vault (A-4).
10. [ ] **Both teams:** move order creation and pricing server-side (A-2), then the private payment-proof bucket (A-3) and the POS atomic stock RPC (BE-006).
11. [ ] **Frontend:** remove the legacy admin email list (A-8), then enforce the CSP (A-7).

## 6. Verification matrix

| Check | Agent | Result |
|---|---|---|
| `npm test` | FE | Pass: 10 files, 42 tests |
| `npm test` | Integration | **Pass: 11 files, 45 tests** |
| `npm run build` | FE, Integration | **Pass** (`dist/` removed afterwards) |
| `npm run lint` | FE, Integration | **Fail (pre-existing): 190 problems (173 errors, 17 warnings).** The count is unchanged by the integration edits. The `preserve-caught-error` errors in `orderService.js` predate this review. |
| `npm audit --omit=dev` | FE | 3 remaining (the jspdf chain, A-6). Not re-run. |
| `docker build` and container smoke test | FE | Pass. Not re-run, per instructions. |
| `deno task ci` (fmt, lint, check, tests) | BE, Integration | **Pass: 33 passed, 0 failed** (Deno 2.7.1, exit 0) |
| Deno tests in a container | BE | Pass, 33/33. Not re-run. |
| DB `run.sh fresh` (migrations, re-apply, lockdown RLS) | BE | Pass: 9/9, 9/9, 4/4. Not re-run. **Gap:** the RLS tests do not cover `INSERT ... RETURNING` (I-3). |
| DB `run.sh upgrade` (legacy path) | BE | Pass, 5/5. Not re-run. |
| `openspec validate --all --strict` (v1.14.3) | Integration | **Pass: 3/3 changes** |
| Secret scan of the full diff and new files | Integration | No JWTs, project URLs or live keys in added content. The hits are removed lines, placeholders (`rzp_test_xxx…`) and test passwords. Real identifiers remain in **git history** (baseline). |
| E2E (checkout, login, admin) | none | **Not run.** There is no harness, and it needs a non-production Supabase project. |
| Staging or production verification | none | **Not run** (forbidden) |

## 7. Remaining unresolved risks

- Every P0 (BE-001, BE-002, BE-004) stays exploitable in production until steps 1 to 10 are complete. The frontend guard alone changes nothing for an attacker using the anon key.
- The admin email allow-list grants UI access only. Any admin who is missed in step 2 will see the console but will be unable to save after the lockdown.
- `supabase.functions.invoke` surfaces non-2xx responses as a generic `FunctionsHttpError`, so the frontend never shows the backend's `request_id`. Support has to correlate by time and order ID instead.
- `create-shiprocket-order` is still called from the browser, so any anon-key caller can request a shipment for any paid order ID. It should move to the verify or webhook path (FE-002 recommendation).
- If the Razorpay API is down, verification returns 502 after a successful payment. The webhook reconciles, but the customer sees "contact support".
- The production-only objects (BE-010, BE-014) were not inspected. The lockdown leaves `addresses`, `profiles`, `site_settings` and other production-only tables untouched.
- No DB constraint enforces the `payment_status` set, so new values display as "Pending".
- There is no CI pipeline. The recommended pipeline is `npm ci && npm run lint && npm test && npm run build && npm audit --omit=dev`, plus `deno task ci` and `supabase/tests/db/run.sh`.
