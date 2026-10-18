# Proposal

> **STATUS: REQUIRES APPROVAL — NOT APPLIED.** This change narrows database access and breaks the current unauthenticated admin panel. Do not apply until the owner approves and the frontend ships admin login.

## Why

Every admin and CMS table, promo codes, e-way-bill credentials and storage writes are effectively open to anyone holding the public anon key (audit BE-001, BE-002, BE-007, BE-008, BE-011, BE-018). Admin role checks in the legacy SQL never match or are user-forgeable. This is the largest remaining production risk.

## What Changes

- **BREAKING** Replace permissive policies on admin-managed tables with public-read (where content is public) + `public.is_admin()` write policies; `is_admin()` reads `app_metadata.role`, which only the service role can set.
- **BREAKING** `eway_bill_config` and `eway_bills` become admin-only; the e-way-bill password is to move to Vault and be rotated.
- **BREAKING** Orders: clients may insert only `pending` / `pending_verification` orders for themselves or as guests; updates admin-only. `order_items` inserts limited to the caller's own pending orders.
- **BREAKING** `promo_codes` writes and `promo_code_uses` reads admin-only; anon `GRANT ALL` revoked.
- **BREAKING** Storage: `product-images` and `images` writes admin-only.
- Revoke `USAGE ON SCHEMA net` from `authenticated`.
- Follow-ups (separate approvals): server-side order creation/pricing (BE-004) and a private payment-proof bucket (BE-008).

## Capabilities

### New Capabilities
- `admin-authorization`: how the backend identifies administrators and which data only administrators may change or read.

### Modified Capabilities
- None.

## Impact

- SQL: `supabase/proposed/20261018100000_PROPOSED_admin_rls_lockdown.sql` (move into `supabase/migrations/` once approved).
- Frontend (required first): admin login restored in `AdminRoute.jsx` (implemented by `frontend-production-readiness`, pending deploy); POS and admin pages must run with an admin session; RPCs `get_all_orders` etc. reviewed (BE-014).
- Operations: grant admins via `auth.admin.updateUserById(id, { app_metadata: { role: 'admin' } })`.
