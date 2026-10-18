# Backend Operations: Environment, Migrations, API, Deployment and Testing

This document applies to the Supabase backend: Postgres, RLS, Storage, and the Edge Functions in `supabase/functions`. Findings are referenced by ID from `docs/backend-production-readiness-audit.md`.

## 1. Environment

Edge-function secrets are set with `supabase secrets set NAME=value` against a linked project. Never put them in `VITE_*` variables or in git.

| Variable | Used by | Required | Notes |
|---|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` | all | auto | Injected by the Supabase runtime. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | create/verify payment | yes | The secret is used to verify signatures and to fetch payments. |
| `RAZORPAY_WEBHOOK_SECRET` | razorpay-webhook | yes | Must equal the secret configured in the Razorpay dashboard. |
| `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD` | create-shiprocket-order | yes | This is the API user. Do not use a `VITE_SHIPROCKET_*` variable (BE-019). |
| `ALLOWED_ORIGINS` | browser-facing functions | no | A comma-separated list such as `https://kustomkoats.com,https://www.kustomkoats.com`. When it is unset, the functions send `*`, which was the previous behaviour. It must include every origin serving the SPA (Vercel previews, a self-hosted Docker origin, `http://localhost:5173` for dev), because the frontend calls these functions directly from the browser. The code also references `kustomkoats.in`; add it if that domain serves the app. |
| `MAX_ORDER_AMOUNT_INR` | create-razorpay-order | no | Default `1000000`. |
| `APP_VERSION` | health | no | Shown in `/health`. Use it for the release SHA. |

A function with a missing required secret fails closed. It returns `500 Internal error`, and its log line has `missing_env` set to the variable's name.

## 2. Edge-function API contracts

Every function returns JSON. Errors have the shape `{ success: false, error, request_id }`. The `request_id` matches the `request_id` field in the function's structured JSON log, which you can search in Supabase → Logs.

| Function | Request | Success | Error statuses |
|---|---|---|---|
| `create-razorpay-order` | `POST { amount (rupees, ≤ max), currency='INR', receipt? ≤40, notes? ≤15 }` | `200 { success, order }` | 400 validation, 502 Razorpay |
| `verify-razorpay-payment` | `POST { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id (uuid) }` | `200 { success, order }`, idempotent | 400 bad signature, order mismatch or amount mismatch; 404 order; 502 Razorpay |
| `razorpay-webhook` | Razorpay POST with `x-razorpay-signature` | `200` for every validly signed event | 400 missing signature, 401 bad signature |
| `create-shiprocket-order` | `POST` (same payload as before) with `order_id` = the UUID of a **paid** order | `200 { success, shipment }` | 400 validation or unpaid, 404 order, 502 `{ error, details (≤500 chars), status }` |
| `eway-bill-proxy` | `POST { action: authenticate\|generate\|get\|cancel, data }` with a user JWT | Upstream JSON | 400, 401, 502 |
| `health` | `GET`, optionally `?deep=1` | `200 { status:'ok' }` | 503 `{ status:'degraded', db, config }` |

The compatibility changes are listed in `openspec/changes/backend-production-readiness/proposal.md`. Only error paths changed. In particular, `src/utils/testShiprocket.js` (a dev helper) now receives a 400 because its `order_id` is not a UUID.

## 3. Database migrations

**Tooling.** Use the Supabase CLI. Migrations live in `supabase/migrations/<UTC-timestamp>_<name>.sql` and are applied in filename order. Each file runs in one transaction, so do not use `CREATE INDEX CONCURRENTLY`. The root `*.sql` scripts are **legacy** and must not be used for new changes.

**Rules for new migrations:**
- Make them additive and idempotent: use `IF NOT EXISTS`, `to_regclass` guards, and `CREATE OR REPLACE`.
- Add new constraints as `NOT VALID`, followed by a guarded `VALIDATE` (see the `pg_temp.add_check` helper in migration 0200).
- Use expand-and-contract for breaking shape changes. First add the new column or table. Then deploy code that writes both shapes, backfill, switch reads, and only drop the old shape in a later, approved release.
- Changes that narrow access or destroy data go in `supabase/proposed/` until approved (see audit §6).

**First rollout to the existing production project** (owner-run; steps 2 and 3 need approval):
1. Take a read-only snapshot: `supabase db dump --schema public -f prod-public.sql`. Diff it against `20261018000000_baseline_repo_schema.sql`. Also check for duplicate payment references with `select razorpay_order_id, count(*) from orders where razorpay_order_id is not null group by 1 having count(*)>1;`.
2. Run `supabase migration repair --status applied 20261018000000`. This marks the baseline as applied **without executing it**.
3. Run `supabase db push` from **one** operator machine or CI job, at low traffic. Read the `NOTICE` output: a non-unique fallback index or a constraint left `NOT VALID` means there is legacy data to clean up.
4. Deploy the functions (section 4), then the frontend.

**Release order (controlled execution).** Run migrations first, then functions, then the frontend. Migrations are never run by app instances or replicas, and Supabase hosts no app replicas anyway.

**Rollback.** The applied migrations are additive, so rolling back the code usually doesn't require a DB rollback. These are the manual down-steps if they are needed:
- 0300: Drop trigger `on_payment_confirmed_reduce_stock`. Recreate the legacy AFTER trigger and function from the baseline. `drop function public.is_admin()` only once the lockdown is not applied. `orders.stock_deducted_at` can stay, since it is harmless.
- 0200: Drop the `idx_*` indexes, `orders_razorpay_order_id_key` and `orders_display_order_id_key`, and the `*_nonnegative` / `*_positive` constraints.
- 0100: The columns are harmless and should stay. Drop the `update_orders_updated_at` trigger if needed.

## 4. Deployment

- **Backend runtime.** Supabase manages Postgres, PostgREST, Auth, Storage and Edge Runtime. There is no backend container image to build or run in production. The frontend is on Vercel.
- **Functions.** Run `supabase functions deploy <name>` for each of: `create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`, `create-shiprocket-order`, `eway-bill-proxy`, `health`. `supabase/config.toml` keeps `verify_jwt = false` only for `razorpay-webhook` (it authenticates by HMAC) and `health`. The functions import `../_shared/*`, which the CLI bundles. Dependency versions are pinned in `supabase/functions/deno.json`.
- **Monitoring.** Point an uptime monitor at `GET <project>/functions/v1/health?deep=1`, which returns 503 when degraded. In the Razorpay dashboard, watch webhook delivery failures. In the admin UI, watch the admin notifications of type `payment_mismatch` and `stock_shortfall`.
- **Payments.** If the Razorpay API is down, verification returns 502 even though the customer has paid. The webhook confirms the order later. To find stuck orders: `select id, razorpay_order_id from orders where payment_status='pending' and razorpay_order_id is not null and created_at < now() - interval '1 hour';`.
- **Rollback of functions.** Redeploy them from the previous git revision.

## 5. Testing

All tests are self-contained and **never connect to the live project**.

```bash
# Edge functions: format, lint, type-check, unit and handler tests (no network or DB)
cd supabase/functions && deno task ci
# The same, in a container:
docker compose -f supabase/tests/compose.yaml --profile functions run --rm -T deno-tests

# Database: fresh install, idempotent re-apply, proposed-lockdown RLS tests, and the legacy
# upgrade path. Uses throwaway supabase/postgres:17.6.1.166 containers (tmpfs) and removes them.
supabase/tests/db/run.sh            # or: run.sh fresh | run.sh upgrade
```

`supabase/tests/db/00_bootstrap_test_only.sql` stubs `auth.jwt()` and `storage.*`, which are normally created by the GoTrue and Storage services. Never run it against a real project.
