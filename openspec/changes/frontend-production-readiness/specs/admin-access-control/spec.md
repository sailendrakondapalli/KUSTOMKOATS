# Spec Delta

## Purpose

Controls which browser users can reach the admin console UI. It complements, and never replaces, the database row-level security that actually protects admin data.

## ADDED Requirements

### Requirement: Admin routes require an authenticated session
Every route under `/admin` SHALL render admin content only when a user session exists. While the session is being restored the app SHALL show a loading state and SHALL NOT render admin content.

#### Scenario: Anonymous visitor opens an admin URL
- **WHEN** a visitor without a session navigates to `/admin/orders`
- **THEN** the app redirects to `/login` and preserves `/admin/orders` as the post-login destination
- **AND** no admin page content is rendered

#### Scenario: Session still loading
- **WHEN** the auth state has not finished loading
- **THEN** a loading indicator is shown and no admin content is rendered

### Requirement: Admin routes require an admin authorization claim
A signed-in user SHALL be treated as admin only if their server-issued `app_metadata.role` equals `admin`, or their email is in the configured admin allow-list. User-editable `user_metadata` MUST NOT grant admin access. Non-admins SHALL see an access-denied view.

#### Scenario: Signed-in non-admin
- **WHEN** a signed-in user whose role is not `admin` and whose email is not allow-listed opens `/admin`
- **THEN** an "access denied" message with a link back to the storefront is shown and no admin content is rendered

#### Scenario: Admin via app metadata
- **WHEN** a signed-in user with `app_metadata.role = "admin"` opens `/admin/products`
- **THEN** the admin products page is rendered

#### Scenario: Forged user metadata
- **WHEN** a signed-in user has `user_metadata.role = "admin"` but no admin app metadata and no allow-listed email
- **THEN** access is denied

### Requirement: Admin role claim matches the backend
The role check SHALL use exactly the claim read by the backend's `public.is_admin()` (`app_metadata.role` as a single string; see `backend-admin-rls-lockdown`). The email allow-list is a transitional, UI-only path that grants no database rights.

#### Scenario: Role array is not an admin claim
- **WHEN** a signed-in user has `app_metadata.roles = ["admin"]` but no `app_metadata.role` and no allow-listed email
- **THEN** access is denied, matching `public.is_admin()`

#### Scenario: Allow-listed user after the RLS lockdown
- **WHEN** `backend-admin-rls-lockdown` is applied and an allow-listed user without `app_metadata.role = "admin"` opens the console
- **THEN** the console renders but the database rejects admin writes, so the user must be granted the role first

### Requirement: Admin allow-list is configurable
The admin email allow-list SHALL be read from the `VITE_ADMIN_EMAILS` build variable (comma-separated, case-insensitive) when it is set. When it is unset, the existing built-in list SHALL apply (transitional, until its removal is approved).

#### Scenario: Configured allow-list
- **WHEN** `VITE_ADMIN_EMAILS` is `Ops@Example.com, a@b.co` and a user signs in as `ops@example.com`
- **THEN** that user is treated as admin
