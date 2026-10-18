# Spec Delta

## Purpose

Defines how customers complete sign-in callbacks and password recovery, and which URLs the identity provider redirects them back to.

## ADDED Requirements

### Requirement: Auth redirects target the current origin
OAuth sign-in and password-reset emails SHALL redirect to `<current origin>/auth/callback`, so that each deployment (production, preview, local, container) returns users to itself.

#### Scenario: Preview deployment sign-in
- **WHEN** a user starts Google sign-in on `https://preview.example.app`
- **THEN** the redirect URL sent to the identity provider is `https://preview.example.app/auth/callback`

### Requirement: Password recovery lets the user set a new password
When the callback is reached from a password-recovery link, the app SHALL show a form to set a new password (minimum 8 characters, confirmed) instead of redirecting. On success it SHALL confirm and navigate to the storefront. On failure it SHALL show the error and keep the form.

#### Scenario: Recovery link opened
- **WHEN** the user opens the password-recovery link and lands on `/auth/callback`
- **THEN** a "set new password" form is shown

#### Scenario: Mismatched confirmation
- **WHEN** the new password and confirmation differ
- **THEN** the form shows a validation error and does not submit

### Requirement: Callback fallback does not override a completed sign-in
The callback page SHALL redirect to `/login` after its timeout only if no session was established. It SHALL cancel the timeout and auth subscription once a session arrives or the page unmounts.

#### Scenario: Session arrives late
- **WHEN** the session is established 2 seconds after the callback page loads
- **THEN** the user is navigated to the storefront (or admin) and is not later redirected to `/login`
