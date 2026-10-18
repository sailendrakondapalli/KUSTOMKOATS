# Design

## Context

See proposal.md (Why) and the audit report for finding IDs. Constraints that shape the approach:
- The browser talks to PostgREST directly with the anon key and the admin UI is intentionally unauthenticated (BE-001), so any RLS narrowing breaks the admin panel. This change therefore only makes changes the current frontend tolerates; lockdown lives in the separate `backend-admin-rls-lockdown` change.
- Production schema has drifted from the repo (BE-010) and must not be inspected or touched from this workstream. Migrations must be safe against an unknown superset schema.
- Runtime is Supabase Edge Runtime (Deno) and Supabase Postgres 17.6; there is no self-hosted server to containerize.

## Goals / Non-Goals

**Goals:** close BE-003/005/009 in code; make stock and payment transitions idempotent in SQL; establish a migration pipeline with fresh-install and upgrade-path tests; make every function testable offline.

**Non-Goals:** server-side pricing (BE-004), admin auth / RLS lockdown (BE-001/002/007-policy), storage bucket restructuring (BE-008), recreating production-only objects whose definitions are unknown (BE-014), CI workflow files, queues or caches.

## Decisions

1. **Handler/entrypoint split with injected dependencies.** Each function has `handler.ts` exporting `createHandler(deps)` and a thin `index.ts` that wires real Supabase/Razorpay/Shiprocket clients and calls `Deno.serve`. Tests inject fakes, so no network or database is needed. *Alternative:* mocking `fetch` globally — brittle and couples tests to URLs.
2. **Verification fetches the payment from Razorpay** (`GET /v1/payments/{id}`) and compares order id, status, currency and amount to the stored order. *Alternative:* compute the Razorpay order server-side from the DB order — stronger, but changes the call order in `CheckoutPage.jsx` (Razorpay order is created before the DB order), so it is deferred to BE-004.
3. **Conditional updates for idempotency** (`update … where payment_status not in (paid states)`), re-reading on zero rows. No new tables or locks needed.
4. **Web Crypto HMAC + constant-time compare** replaces the `std/node/crypto` shim; `npm:@supabase/supabase-js@2.49.4` is pinned; `Deno.serve` replaces deprecated `std@0.168.0` `serve`.
5. **CORS allowlist is opt-in** via `ALLOWED_ORIGINS` to avoid breaking preview deployments whose origins are not yet enumerated.
6. **Stock idempotency via `orders.stock_deducted_at`** set by a BEFORE trigger (replacing the AFTER trigger) with a backfill for already-paid orders. Shortfalls keep the original "skip" behaviour (so payment confirmation never fails) but now raise a `stock_shortfall` admin notification.
7. **Baseline is a reconstruction, not a dump.** `20261018000000_baseline_repo_schema.sql` encodes the last-writer-wins state of the root scripts so fresh environments and tests work. Production must mark it applied (`supabase migration repair`) after an owner reviews `supabase db dump` output; corrective migrations (0100+) are written to be safe on either state using `IF NOT EXISTS`, `to_regclass` guards and NOT VALID checks.
8. **Test DB = `supabase/postgres:17.6.1.166`** (production's exact version) plus a small bootstrap that provides `auth.jwt()`, the modern `auth.uid()` and a minimal `storage` schema (normally created by GoTrue/Storage services). *Alternative:* full `supabase start` stack — many containers and slower, and unnecessary for SQL/RLS tests.
9. **No production Docker image.** Supabase hosts every backend process; a compose file is provided only for the isolated DB + Deno test environment.

## Risks / Trade-offs

- [Razorpay API outage makes verification fail after a real payment] → 502 with generic error; webhook marks the order paid when it arrives; operations doc describes the manual check.
- [Production has duplicate `razorpay_order_id`] → migration falls back to a non-unique index and emits NOTICE; operator checks logs.
- [Drifted production column types differ from the reconstruction] → corrective migrations only `ADD COLUMN IF NOT EXISTS` and never alter types.
- [BEFORE-trigger rewrite changes trigger timing] → behaviour covered by DB tests (single deduction, shortfall, POS insert).
- [Status-code changes on error paths] → frontend only inspects `success`/`error`; verified by grepping call sites.

## Migration Plan

1. Owner runs `supabase db dump --schema public` (read-only) and diffs against the baseline.
2. `supabase migration repair --status applied 20261018000000` on production (requires approval — changes migration history).
3. `supabase db push` applies 0100–0300 from one operator/CI job at low traffic.
4. `supabase functions deploy` for all functions (config.toml keeps `verify_jwt=false` for webhook/health).
5. Rollback: functions — redeploy previous git revision; DB — migrations are additive; down-steps documented in `docs/backend-operations.md` (drop added indexes/constraints/trigger, restore previous trigger function).

## Open Questions

- Exact production definitions of `get_all_orders`, `update_order_status`, `get_next_series_number` (BE-014) — needed for the lockdown change, not for this one.
