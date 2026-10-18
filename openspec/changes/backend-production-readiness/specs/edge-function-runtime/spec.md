# Spec Delta

## Purpose

Defines the common request-handling contract every Supabase edge function follows: input limits, CORS, error format, logging, timeouts and health reporting (audit BE-009, BE-015, BE-017).

## ADDED Requirements

### Requirement: Bounded JSON input
Functions accepting JSON SHALL reject bodies larger than 64 KiB with 413 and malformed JSON with 400, and SHALL reject methods other than POST and OPTIONS with 405.

#### Scenario: Malformed body
- **WHEN** a client posts invalid JSON
- **THEN** the function responds 400 with `success: false` and a generic message

### Requirement: Configurable CORS allowlist
When `ALLOWED_ORIGINS` is set, browser-facing functions SHALL echo `Access-Control-Allow-Origin` only for listed origins; when unset they SHALL keep the current `*` behaviour for backward compatibility.

#### Scenario: Unlisted origin with allowlist configured
- **WHEN** `ALLOWED_ORIGINS=https://shop.example` and a request comes from `https://evil.example`
- **THEN** the response carries no `Access-Control-Allow-Origin` header

#### Scenario: Allowlist not configured
- **WHEN** `ALLOWED_ORIGINS` is unset
- **THEN** responses carry `Access-Control-Allow-Origin: *`

### Requirement: Generic errors with correlation id
Unexpected failures SHALL respond 500 with `{ success: false, error: "Internal error", request_id }` and never include exception messages, stack traces or secrets; the same `request_id` SHALL appear in the function's structured log line.

#### Scenario: Unexpected exception
- **WHEN** a dependency throws an unexpected error
- **THEN** the client receives the generic body with a `request_id` and the log contains that id and the error

### Requirement: Missing configuration fails closed
A function whose required secret is not configured SHALL respond 500 with the generic error and SHALL NOT call any upstream provider.

#### Scenario: Secret missing
- **WHEN** `RAZORPAY_KEY_SECRET` is unset and a verification request arrives
- **THEN** the response is 500 and no database or provider call is made

### Requirement: Upstream timeouts
Every outbound call to Razorpay, Shiprocket or the e-way-bill API SHALL be aborted after a bounded timeout (default 10 seconds).

#### Scenario: Hung provider
- **WHEN** the provider does not respond within the timeout
- **THEN** the function responds 502 instead of hanging

### Requirement: Health endpoint
A public `health` function SHALL respond 200 `{ status: "ok" }` to GET; with `?deep=1` it SHALL also report database reachability and whether required configuration is present, without revealing values.

#### Scenario: Deep health check with database unreachable
- **WHEN** `GET /health?deep=1` runs and the database query fails
- **THEN** the response is 503 with `status: "degraded"` and `db: "error"`
