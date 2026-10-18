# Spec Delta

## Purpose

Defines when and how the backend creates Shiprocket shipments so that only paid store orders can create billable shipments (audit BE-009).

## ADDED Requirements

### Requirement: Shipments only for paid orders
The create-shipment endpoint SHALL require `order_id` to be the UUID of an existing order whose payment status is paid, completed or success, and SHALL require a non-empty `order_items` array.

#### Scenario: Paid order
- **WHEN** checkout submits shipment data for an order that has been verified as paid
- **THEN** a Shiprocket adhoc order is created and the response is `{ success: true, shipment }`

#### Scenario: Unpaid or unknown order
- **WHEN** `order_id` is missing, not a UUID, unknown, or refers to an unpaid order
- **THEN** the endpoint responds 400 or 404 with `success: false` and Shiprocket is not called

### Requirement: Shipment errors do not leak internals
The endpoint SHALL never return stack traces. Shiprocket rejections SHALL be returned as status 502 with `error: Failed to create shipment` and the upstream body truncated to 500 characters in `details`.

#### Scenario: Shiprocket rejects the order
- **WHEN** Shiprocket responds with a non-2xx status
- **THEN** the response is 502 with `success: false`, the truncated `details` and the upstream `status`

### Requirement: Shiprocket authentication is reused
The backend SHALL reuse a Shiprocket auth token across requests within a warm worker for a bounded period instead of logging in on every request.

#### Scenario: Two shipments in one worker
- **WHEN** two shipments are created within the token cache period
- **THEN** the Shiprocket login endpoint is called once
