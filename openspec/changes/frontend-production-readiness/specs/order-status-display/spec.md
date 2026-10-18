# Spec Delta

## Purpose

Defines how stored order payment and fulfilment states are presented to customers, so that every customer-facing page shows the same truthful status.

## ADDED Requirements

### Requirement: Payment status labels reflect the stored state
Customer order pages SHALL map `payment_status` consistently: `paid` (and the legacy `completed` and `success`, which the backend's `PAID_STATUSES` and stock trigger also treat as paid) shows as Paid; `pending` and `pending_verification` show as Pending; `failed` shows as Failed; `refunded` shows as Refunded. Any other or missing value SHALL show as Pending rather than Failed.

#### Scenario: Verified Razorpay payment
- **WHEN** an order has `payment_status = "paid"`
- **THEN** the order detail page shows "Paid"

#### Scenario: Awaiting manual verification
- **WHEN** an order has `payment_status = "pending_verification"`
- **THEN** the order detail page shows "Pending" and not "Failed"

#### Scenario: Unknown value
- **WHEN** an order has an unrecognised `payment_status`
- **THEN** the page shows "Pending"
