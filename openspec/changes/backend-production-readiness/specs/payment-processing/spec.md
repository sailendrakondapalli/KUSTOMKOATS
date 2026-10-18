# Spec Delta

## Purpose

Defines how Razorpay payments are created, verified, and reconciled so an order is marked paid only when a genuine payment for its exact amount exists (audit BE-003, BE-005).

## ADDED Requirements

### Requirement: Razorpay order creation validates input
The create-order endpoint SHALL accept only a finite positive amount no greater than the configured maximum, currency INR, a receipt of at most 40 characters and notes of at most 15 string entries. It SHALL return `{ success: true, order }` on success, preserving the existing response shape.

#### Scenario: Valid amount
- **WHEN** a client posts `{ amount: 499.5 }`
- **THEN** a Razorpay order for 49950 paise in INR is created and returned with `success: true`

#### Scenario: Invalid amount or currency
- **WHEN** a client posts a zero, negative, non-numeric or above-maximum amount, or a currency other than INR
- **THEN** the endpoint responds 400 with `success: false` and no Razorpay order is created

#### Scenario: Provider failure
- **WHEN** Razorpay rejects the request or does not answer within the timeout
- **THEN** the endpoint responds 502 with a generic error and no provider details

### Requirement: Payment verification is bound to the stored order
The verify endpoint SHALL mark an order paid only when the signature is valid, the stored order's `razorpay_order_id` equals the submitted one, and Razorpay reports the payment as captured or authorized for that Razorpay order in INR with an amount equal to the order's `total_amount` in paise.

#### Scenario: Genuine payment
- **WHEN** a valid signature, matching Razorpay order and matching amount are submitted for a pending order
- **THEN** the order becomes `payment_status = paid`, `order_status = confirmed` and the response is `{ success: true, order }`

#### Scenario: Payment for a different Razorpay order
- **WHEN** the submitted `razorpay_order_id` differs from the order's stored value
- **THEN** the endpoint responds 400 and the order is unchanged

#### Scenario: Amount mismatch
- **WHEN** Razorpay reports an amount different from the order total
- **THEN** the endpoint responds 400 and the order is unchanged

#### Scenario: Invalid signature
- **WHEN** the signature does not match the HMAC of `razorpay_order_id|razorpay_payment_id`
- **THEN** the endpoint responds 400 with `Invalid payment signature` and performs no database read or write

### Requirement: Payment verification is idempotent
Verifying an already-paid order SHALL succeed without modifying it again, so client retries and webhook races are harmless.

#### Scenario: Retry after success
- **WHEN** the same verification is submitted twice
- **THEN** both responses are `success: true` and the order is updated at most once

### Requirement: Webhook authenticity
The webhook SHALL reject requests without an `x-razorpay-signature` header (400) or whose HMAC of the raw body does not match (401), comparing signatures in constant time.

#### Scenario: Forged webhook
- **WHEN** a request carries an invalid signature
- **THEN** the webhook responds 401 and no order is changed

### Requirement: Webhook reconciliation never downgrades a paid order
On `payment.captured` the webhook SHALL mark the matching pending order paid only when the captured amount equals the order total. On `payment.failed` it SHALL set `failed` only on orders that are not already paid.

#### Scenario: Failure event after capture
- **WHEN** a `payment.failed` event arrives for an order already paid
- **THEN** the order stays paid

#### Scenario: Captured amount mismatch
- **WHEN** a `payment.captured` amount differs from the order total
- **THEN** the order is not marked paid, an admin notification of type `payment_mismatch` is recorded and the webhook responds 200

### Requirement: Webhook acknowledges unknown and duplicate events
The webhook SHALL respond 2xx to validly signed events for unknown orders, already-processed payments and unhandled event types so Razorpay does not retry or disable the endpoint.

#### Scenario: Unknown Razorpay order
- **WHEN** a signed `payment.captured` event references no stored order
- **THEN** the webhook responds 200 with `success: false` and `error: Order not found`
