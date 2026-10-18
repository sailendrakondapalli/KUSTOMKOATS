# Proposal

## Why

The audit (`docs/backend-production-readiness-audit.md`) found that payments can be marked paid without paying the order amount (BE-003). It also found that the webhook can downgrade paid orders (BE-005), that stock deduction is not idempotent (BE-006), and that the edge functions lack validation, timeouts and safe errors (BE-009). The schema has no version-controlled migrations (BE-010). These issues can be fixed now, without breaking the current frontend. The fixes that do break it (the admin RLS lockdown and server-side pricing) are split into the separate, approval-gated change `backend-admin-rls-lockdown`.

## What Changes

- Bind Razorpay verification to the stored order and amount, and make it idempotent and constant-time (BE-003).
- Make the webhook idempotent. It must never downgrade a paid order, must acknowledge unknown orders with 2xx, and must check the amount and notify an admin on mismatch (BE-005).
- Validate `create-razorpay-order` input (amount bounds, INR only, Razorpay receipt and notes limits) (BE-003, BE-009).
- Require shipments to reference a paid order. Cache the Shiprocket token and stop leaking stack traces (BE-009).
- Add shared edge-function plumbing: input limits, upstream timeouts, an opt-in `ALLOWED_ORIGINS` CORS allowlist, generic errors with `request_id`, and structured JSON logs. Add a `health` function. Pin dependencies (BE-009, BE-015, BE-017).
- Adopt `supabase/migrations` with a reconstructed baseline, an additive drift-reconciliation migration, integrity constraints and indexes, and payment and stock hardening (BE-006, BE-007, BE-010–BE-013).
- Add Deno unit and handler tests, plus SQL migration and RLS tests that run in a throwaway container (BE-016).
- Document environment variables, migrations, the API and deployment in `docs/backend-operations.md`.
- Error-path status codes change: upstream failures return 502, a missing order returns 404, and validation failures return 400. The success response bodies are unchanged. The webhook returns 200 instead of 404 for unknown orders. None of this is **BREAKING** for the current frontend, which checks only `success` and `error`.

## Capabilities

### New Capabilities
- `payment-processing`: Razorpay order creation, client-side payment verification, and webhook reconciliation of order payment state.
- `shipment-creation`: creating courier shipments for paid orders through Shiprocket.
- `edge-function-runtime`: cross-cutting behaviour of every edge function, covering input handling, CORS, errors, logging, timeouts and health.
- `inventory-integrity`: how stock changes as orders become paid, plus the database invariants for orders, items and products.
- `schema-migrations`: how database schema changes are versioned, applied and verified.

### Modified Capabilities
- None. `openspec/specs/` is empty.

## Impact

- **Code:** `supabase/functions/**` (rewritten handlers plus `_shared/`), the new `supabase/functions/health`, `supabase/config.toml`, `supabase/migrations/**`, `supabase/tests/**`, and `docs/backend-*.md`.
- **Frontend coordination:** No code change is required. `verify-razorpay-payment` must keep receiving `order_id`, which it already does. `src/utils/testShiprocket.js` sends a non-UUID `order_id` and will now get a 400. Optionally, set `ALLOWED_ORIGINS` once the production domains are known.
- **Operations:** Deploy the functions with `supabase functions deploy`, and keep `verify_jwt = false` for `razorpay-webhook` and `health` (`config.toml`). On production, the baseline migration must be marked applied rather than executed (design.md).
