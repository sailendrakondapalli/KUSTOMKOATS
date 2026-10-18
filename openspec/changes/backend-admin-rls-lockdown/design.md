# Design

## Context

See proposal.md. `public.is_admin()` already ships (additively) in `backend-production-readiness` migration 0300, so this change only swaps policies.

## Goals / Non-Goals

**Goals:** admin-only writes, credential isolation, no client-forged paid orders, storage write restriction.
**Non-Goals:** server-side pricing (separate approval), Vault migration of e-way-bill password (operational follow-up), private payment-proof bucket.

## Decisions

- **Drop all existing policies per table dynamically, then recreate** — legacy policy names diverge between repo and production (BE-010), so name-based drops would leave unknown permissive policies behind. Alternative (named drops) rejected for that reason.
- **Claims-based `is_admin()` (app_metadata)** instead of an admin table — no extra join per row, cannot be set by users. Trade-off: role changes take effect on next token refresh.
- Guest checkout keeps working: inserts with `user_id IS NULL AND guest_email IS NOT NULL` and pending status remain allowed.
- **UPI flow (pending_verification) and POS** require admin session for status changes and POS inserts as `paid` (admin bypass in the insert policy).

## Risks / Trade-offs

- [Admin panel breaks if applied before frontend login] → hard prerequisite in tasks; apply in the same release window as the frontend.
- [Unknown production policies on drifted tables (addresses, profiles, enquiries…)] → not touched; reviewed separately with BE-014.
- [Guest order lookups] → guests still cannot read their orders (unchanged behaviour).

## Migration Plan

1. Frontend ships admin login; admins granted `app_metadata.role=admin`.
2. Move the proposed file into `supabase/migrations/` with a new timestamp; `supabase db push`.
3. Rollback: re-run the legacy policy scripts (permissive) — documented in `docs/backend-operations.md`.
