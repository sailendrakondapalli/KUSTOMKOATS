# Spec Delta

## Purpose

Defines how the Postgres schema is versioned, applied and verified so environments are reproducible and production changes are reviewed, ordered and non-destructive (audit BE-010).

## ADDED Requirements

### Requirement: Version-controlled migrations
All schema changes SHALL be delivered as timestamped files in `supabase/migrations/` applied in filename order by the Supabase CLI; root ad-hoc SQL scripts SHALL NOT be used for new changes.

#### Scenario: Fresh environment
- **WHEN** all migrations are applied to an empty Supabase Postgres 17 database
- **THEN** every migration succeeds and the resulting schema contains every table, column and policy the backend tests rely on

### Requirement: Migrations are re-runnable and additive
Applied migrations SHALL be idempotent and SHALL NOT drop tables, columns or data; destructive or access-narrowing changes SHALL be kept outside `supabase/migrations/` until approved.

#### Scenario: Re-run
- **WHEN** the full migration set is applied a second time to the same database
- **THEN** it completes without error and without changing data

### Requirement: Upgrade path from the legacy scripts
Corrective migrations SHALL apply cleanly on a database built from the legacy root SQL scripts, which models the production history.

#### Scenario: Legacy database upgrade
- **WHEN** migrations after the baseline are applied to a database built from the legacy scripts
- **THEN** they succeed and existing rows are preserved

### Requirement: Guarded constraint tightening
New uniqueness or check constraints SHALL be created so that existing violating data does not fail the deployment: checks as NOT VALID with a guarded validation, unique indexes only after a duplicate check, emitting a NOTICE otherwise.

#### Scenario: Duplicates already in production
- **WHEN** two existing orders share a `razorpay_order_id`
- **THEN** the migration succeeds, logs a NOTICE and creates a non-unique index instead

### Requirement: Controlled execution
Migrations SHALL run once per release from a single operator or CI job before functions and frontend are deployed, never from application replicas.

#### Scenario: Release order
- **WHEN** a release contains a migration and a function change that depends on it
- **THEN** the documented procedure applies the migration first, then deploys functions, then the frontend
