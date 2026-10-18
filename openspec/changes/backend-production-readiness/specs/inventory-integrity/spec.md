# Spec Delta

## Purpose

Defines how product stock responds to orders becoming paid and which invariants the database enforces on orders, order items, cart and products (audit BE-006, BE-012, BE-013).

## ADDED Requirements

### Requirement: Stock is deducted once per order
When an order's payment status changes into paid, completed or success, stock SHALL be deducted for its items exactly once over the order's lifetime, even if the status later leaves and re-enters a paid state.

#### Scenario: Re-confirmation
- **WHEN** an order goes pending → paid → pending_verification → paid
- **THEN** each item's product stock is reduced by its quantity only once

### Requirement: Orders inserted as paid manage their own stock
An order inserted directly with a paid status (the POS flow) SHALL be recorded as already stock-deducted so later status changes do not deduct again.

#### Scenario: POS sale later edited
- **WHEN** a POS order inserted as paid is moved to another status and back to paid
- **THEN** no trigger-based stock deduction occurs

### Requirement: Stock shortfalls are surfaced
When a paid order requests more units than a product has in stock, the system SHALL leave that product's stock unchanged, still confirm the payment, and record an admin notification of type `stock_shortfall`.

#### Scenario: Oversold item
- **WHEN** an order for 5 units becomes paid while the product has 2 in stock
- **THEN** stock stays 2 and a `stock_shortfall` notification references the order

### Requirement: Basic value invariants
New or updated rows SHALL satisfy: order item quantity > 0 and price >= 0, cart quantity > 0, order total >= 0, product price >= 0 and stock >= 0 (NULLs allowed where columns are nullable).

#### Scenario: Negative quantity
- **WHEN** a client inserts an order item with quantity 0
- **THEN** the insert fails with a check-constraint violation

### Requirement: Admin notifications originate from the backend
Clients using the anon or authenticated role SHALL NOT be able to insert admin notifications; only database triggers and service-role code may create them.

#### Scenario: Forged notification
- **WHEN** an anon client inserts into admin_notifications
- **THEN** the insert is rejected by row-level security

### Requirement: Payment references are unique
Each non-null `razorpay_order_id` and `display_order_id` SHALL identify at most one order once existing data has been verified to contain no duplicates.

#### Scenario: Duplicate Razorpay order id
- **WHEN** a second order is inserted with an existing `razorpay_order_id`
- **THEN** the insert fails with a unique violation
