# Spec Delta

## Purpose

Defines how administrators are identified and which data only administrators may modify or read, so the public anon key no longer grants admin capability (audit BE-001, BE-002, BE-007).

## ADDED Requirements

### Requirement: Administrator identity comes from server-controlled claims
A request SHALL be treated as administrator only when its JWT `app_metadata.role` equals `admin`; `user_metadata` and the top-level `role` claim SHALL NOT confer admin rights.

#### Scenario: User edits own metadata
- **WHEN** a signed-in user sets `user_metadata.role = "admin"` via the Auth API
- **THEN** admin-only writes are still rejected

### Requirement: Catalogue and CMS writes are admin-only
Inserts, updates and deletes on products, categories, product details, bundles, testimonials, FAQs, footer links, site pages, blog content and promo codes SHALL require an administrator; public reads of published content SHALL keep working for anon.

#### Scenario: Anonymous edit attempt
- **WHEN** an anon client updates a FAQ
- **THEN** no row is changed

#### Scenario: Public storefront read
- **WHEN** an anon client selects active products and published FAQs
- **THEN** rows are returned as before

### Requirement: Integration credentials are not client-readable
E-way-bill configuration and records SHALL be readable and writable only by administrators.

#### Scenario: Anonymous credential read
- **WHEN** an anon client selects from eway_bill_config
- **THEN** no rows are returned

### Requirement: Clients cannot create paid orders
Non-admin clients SHALL only insert orders with payment status `pending` or `pending_verification` for themselves or as guests, and SHALL NOT update orders.

#### Scenario: Forged paid order
- **WHEN** an authenticated non-admin inserts an order with `payment_status = paid`
- **THEN** the insert is rejected

### Requirement: Storage writes are admin-only
Uploads and deletions in the `product-images` and `images` buckets SHALL require an administrator.

#### Scenario: Customer deletes a product image
- **WHEN** an authenticated non-admin deletes an object in product-images
- **THEN** nothing is deleted
