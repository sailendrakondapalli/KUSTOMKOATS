# Tasks

## 1. Prerequisites (owner / frontend — blocked pending approval)

- [ ] 1.1 Owner approves this change in writing; record the approval in this file
- [ ] 1.2 Frontend restores admin login in `AdminRoute.jsx` and runs admin/POS pages with an admin session; verify by logging in as admin on a staging project. *Code done, not yet deployed or staging-verified:* `frontend-production-readiness` added the guard (`src/auth/isAdmin.js`), aligned to `app_metadata.role` only. Its transitional email allow-list grants UI access but no DB rights, so every allow-listed admin also needs 1.3
- [x] 1.2a Guest checkout must not read its order back after insert (guests fail the new `own or admin read` policy on `INSERT ... RETURNING`). Done in the frontend: `createPendingOrder` now generates the id client-side and inserts without `.select()` (`src/services/orderService.test.js`)
- [ ] 1.3 Grant `app_metadata.role=admin` to admin accounts with the service role; verify `select public.is_admin()` returns true for an admin JWT on staging
- [ ] 1.4 Review production definitions of `get_all_orders`, `get_all_order_items`, `update_order_status`, `get_next_series_number` and gate them with `is_admin()` where needed (BE-014)

## 2. Database

- [x] 2.1 Write `supabase/proposed/20261018100000_PROPOSED_admin_rls_lockdown.sql`; verified only in the throwaway test DB: `supabase/tests/db/run.sh fresh` lockdown suite 4/4 passed
- [ ] 2.2 Move the file into `supabase/migrations/` with a new timestamp and apply to staging; verify the RLS suite against staging
- [ ] 2.3 Rotate the e-way-bill portal password and move it to Vault; verify `eway_bill_config.api_password` is empty

## 3. Integration

- [ ] 3.1 Smoke-test storefront (browse, cart, guest and logged-in checkout, UPI) and admin flows on staging after the lockdown
