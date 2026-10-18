# Spec Delta

## Purpose

Defines how the built single-page application is served in production, whether by the container image or the hosting platform. It covers routing fallback, caching, health checks, security headers and crawler files.

## ADDED Requirements

### Requirement: Container serves the SPA as a non-root process
The production container SHALL serve the built assets as a non-root user on port 8080. Deep links SHALL be served with `index.html` (SPA fallback), and missing static assets under `/assets/` SHALL return 404.

#### Scenario: Deep link
- **WHEN** `GET /products/123` is requested from the container
- **THEN** the response is 200 with the app's `index.html`

#### Scenario: Missing hashed asset
- **WHEN** `GET /assets/missing.js` is requested
- **THEN** the response is 404

### Requirement: Health endpoint
The container SHALL expose `GET /healthz` that returns 200 without touching the app, and the image SHALL declare a health check using it.

#### Scenario: Health probe
- **WHEN** `GET /healthz` is requested
- **THEN** the response is 200

### Requirement: Caching policy
Hashed build assets SHALL be served with `Cache-Control: public, max-age=31536000, immutable`, and `index.html` SHALL be served with `Cache-Control: no-cache`.

#### Scenario: HTML revalidates
- **WHEN** `GET /` is requested
- **THEN** the `Cache-Control` header is `no-cache`

### Requirement: Baseline security headers
Responses SHALL include `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and a restrictive `Permissions-Policy`. A `Content-Security-Policy-Report-Only` header SHALL be sent until enforcement is approved.

#### Scenario: Header check
- **WHEN** any page is requested
- **THEN** the response carries `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`

### Requirement: Crawler files reference the production domain
`robots.txt` and `sitemap.xml` SHALL reference only `https://www.kustomkoats.com`. `/admin` and account pages SHALL remain disallowed.

#### Scenario: Sitemap domain
- **WHEN** `/sitemap.xml` is fetched
- **THEN** every `<loc>` starts with `https://www.kustomkoats.com/`
