# Tasks

## 1. Shared edge-function runtime

- [x] 1.1 Add `supabase/functions/deno.json` (pinned imports, fmt/lint/test tasks) and `_shared/` (http, log, env, razorpay, validation) and verify `deno check` passes (BE-015)
- [x] 1.2 Unit-test signature verification, constant-time compare, validators, CORS and JSON body limits; verify `deno task test` passes (BE-009)
- [x] 1.3 Add `health` function with `?deep=1`, plus `supabase/config.toml` with `verify_jwt=false` for `razorpay-webhook` and `health`; verify handler tests cover ok/degraded (BE-017)

## 2. Payment processing

- [x] 2.1 Rewrite `create-razorpay-order` with validation and timeout; verify tests for valid, invalid amount/currency and provider failure (BE-003)
- [x] 2.2 Rewrite `verify-razorpay-payment` with order binding, Razorpay payment fetch, amount check and idempotency; verify tests for genuine, mismatched order, mismatched amount, bad signature and retry (BE-003)
- [x] 2.3 Rewrite `razorpay-webhook` with constant-time check, no-downgrade transitions, amount mismatch notification and 2xx for unknown orders; verify tests for each spec scenario (BE-005)

## 3. Shipments and e-way bill

- [x] 3.1 Rewrite `create-shiprocket-order` requiring a paid order, token cache, truncated errors; verify tests for paid, unpaid, unknown and upstream failure (BE-009)
- [x] 3.2 Harden `eway-bill-proxy` (action allowlist, encoded `ewbNo`, timeout, generic errors); verify tests for invalid action and unauthenticated request (BE-020)

## 4. Database migrations

- [x] 4.1 Add baseline reconstruction migration and verify a fresh `supabase/postgres:17.6.1.166` container applies it (BE-010)
- [x] 4.2 Add drift-reconciliation migration (missing columns, `orders.updated_at` trigger) and verify via schema assertions (BE-010)
- [x] 4.3 Add integrity constraints/indexes migration with guarded validation and duplicate-aware unique indexes; verify constraint and duplicate-fallback tests (BE-013)
- [x] 4.4 Add payment/stock hardening migration (`is_admin()`, `stock_deducted_at` + backfill, shortfall notifications, `search_path`, drop forged-notification policy); verify stock idempotency, POS insert and RLS tests (BE-006, BE-007, BE-011, BE-012)
- [x] 4.5 Add upgrade-path test (legacy root scripts → migrations 0100+) and idempotent re-run; verify `supabase/tests/db/run.sh` passes end to end (BE-010)
- [x] 4.6 Write the approval-gated lockdown migration under `supabase/proposed/` and verify it with RLS tests in the throwaway DB only (BE-001, BE-002)

## 5. Environment, docs and integration checks

- [x] 5.1 Add `supabase/tests/compose.yaml` for the isolated DB + Deno runner and verify `docker compose config` succeeds
- [x] 5.2 Write `docs/backend-operations.md` (env vars, migration procedure, API contracts, deploy/rollback, testing) and verify the documented test commands run as written
- [x] 5.3 Run `deno fmt --check`, `deno lint`, `deno check`, all tests and the DB suite; review `git diff` for secrets and unintended changes; update audit statuses

## Workflow follow-up

- Archive the change after owner review and production rollout.
- Apply `backend-admin-rls-lockdown` only after approval and frontend admin login.

## Verification log (2026-10-18, actually executed)

- `deno task ci` (local Deno 2.7.1): fmt --check, lint, check — clean; tests 33 passed / 0 failed.
- `docker compose -f supabase/tests/compose.yaml --profile functions run --rm -T deno-tests` (denoland/deno:alpine-2.5.6): `deno task ci` 33 passed / 0 failed. First container run failed fmt on a gitignored `supabase/functions/supabase/.temp/` file; fixed by `exclude` in deno.json.
- `supabase/tests/db/run.sh fresh` (supabase/postgres:17.6.1.166): all migrations applied, 9/9 behaviour tests passed, re-apply of all migrations succeeded and 9/9 passed again, proposed lockdown applied in the test DB only and 4/4 RLS tests passed (first run caught a policy-reset bug in the proposal, fixed).
- `supabase/tests/db/run.sh upgrade`: 29 legacy root scripts applied (4 pre-existing statement errors: pos-sales-setup, product-bundles-schema x2, fix-place-location), dirty data seeded, migrations 0100–0300 applied, 5/5 upgrade assertions passed (row counts preserved, duplicate-aware unique index fallback, NOT VALID fallback, backfill, no double deduction).
- Supabase CLI 2.119.0 (`npx`, scratch copy without `.temp`): `supabase db push --db-url <local throwaway>` applied all 4 migrations through the CLI's transactional runner; `migration list` shows local = remote; 9/9 behaviour tests passed afterwards. An accidental first push without the test bootstrap failed and left no partial objects, confirming per-file transactions.
- Not verified: deployment to any real Supabase project (forbidden), `supabase functions serve` end-to-end with real Razorpay/Shiprocket, production schema diff.
