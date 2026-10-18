# Spec Delta

## Purpose

Defines how the application shell behaves on misconfiguration, runtime errors, unknown URLs and first load, so that users always see a meaningful, accessible screen.

## ADDED Requirements

### Requirement: Startup configuration is validated
On startup the app SHALL verify that `VITE_SUPABASE_URL` (an http(s) URL) and `VITE_SUPABASE_ANON_KEY` are present. If either is missing or invalid, it SHALL render a configuration-error screen naming the missing variables (never their values) instead of a blank page.

#### Scenario: Missing anon key
- **WHEN** the build has no `VITE_SUPABASE_ANON_KEY`
- **THEN** the page shows a configuration error that lists `VITE_SUPABASE_ANON_KEY`

### Requirement: Render errors show a recoverable message
When a page throws during render, the error boundary SHALL show a generic message with a "Try again" action. Raw error messages SHALL NOT be shown in production builds.

#### Scenario: Page throws
- **WHEN** a lazily loaded page throws a render error
- **THEN** a generic error message and a "Try again" button are shown

### Requirement: Stale-chunk errors reload at most once
If the error is a failed dynamic import, the app SHALL reload the page once per browser session. If that error recurs after the reload, it SHALL show the error message instead of reloading again.

#### Scenario: Persistent chunk failure
- **WHEN** a dynamic import fails, the page reloads, and the import fails again
- **THEN** the second failure shows the error UI and does not reload

### Requirement: Unknown routes show a Not Found page
Any storefront URL that matches no route SHALL render a Not Found page with a link home. The page SHALL be marked `noindex`.

#### Scenario: Mistyped URL
- **WHEN** a visitor opens `/does-not-exist`
- **THEN** a "Page not found" heading and a link to `/` are shown

### Requirement: Intro overlays respect context and motion preferences
The intro video and animation overlays SHALL NOT be shown on `/admin` routes, or when the user prefers reduced motion.

#### Scenario: Reduced motion
- **WHEN** the OS setting `prefers-reduced-motion: reduce` is active
- **THEN** the storefront renders without the intro overlays

### Requirement: Payment SDK loads on demand
The Razorpay checkout script SHALL be loaded only when a payment is initiated, at most once per page, and a load failure SHALL surface as a user-visible error.

#### Scenario: Script blocked
- **WHEN** the checkout script fails to load
- **THEN** the user sees a "payment service unavailable" error and the pay button is re-enabled
