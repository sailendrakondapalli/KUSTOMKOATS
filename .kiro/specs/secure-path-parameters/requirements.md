# Requirements Document

## Introduction

This document specifies requirements for securing path parameters in a Supabase-based React application to prevent sensitive data exposure. The current implementation exposes internal database UUIDs directly in URL paths across product pages, order pages, and admin pages (testimonials, footer links, FAQs). This exposure creates security risks through browser history leakage, server log exposure, referrer header transmission, and screenshot sharing. The solution must implement secure identifier mapping to hide internal database IDs while maintaining application functionality.

## Glossary

- **Frontend_Application**: The React-based user interface consisting of 93 .jsx files and 30 .js files
- **Backend_System**: The Supabase PostgreSQL database system
- **Public_Identifier**: A non-sequential, non-predictable identifier exposed in URLs
- **Internal_UUID**: The actual database UUID used internally for record identification
- **Identifier_Mapping_Table**: A database table that maps Public_Identifiers to Internal_UUIDs
- **URL_Path_Parameter**: The identifier segment in URL routes (e.g., the ':id' in /products/:id)
- **Query_Pattern**: The Supabase query method using .eq('id', id) to filter records
- **Product_Page**: Frontend page displaying individual product details
- **Order_Page**: Frontend page displaying individual order information
- **Admin_Page**: Frontend pages for administrative functions (testimonials, footer links, FAQs)
- **Exposure_Point**: Any location where internal database IDs could be leaked (browser history, logs, referrers, screenshots)

## Requirements

### Requirement 1: Public Identifier Generation

**User Story:** As a system administrator, I want all database records to have secure public identifiers, so that internal database structure is not exposed through URLs

#### Acceptance Criteria

1. THE Backend_System SHALL generate a unique Public_Identifier for each record upon creation
2. THE Public_Identifier SHALL be alphanumeric with minimum length of 8 characters
3. THE Public_Identifier SHALL NOT follow sequential or predictable patterns
4. THE Public_Identifier SHALL be unique within the Identifier_Mapping_Table
5. WHEN a record is created, THE Backend_System SHALL store the mapping between Public_Identifier and Internal_UUID in the Identifier_Mapping_Table

### Requirement 2: Identifier Mapping Storage

**User Story:** As a developer, I want a centralized mapping system for identifiers, so that public and internal IDs can be reliably translated

#### Acceptance Criteria

1. THE Backend_System SHALL maintain an Identifier_Mapping_Table with columns for Public_Identifier, Internal_UUID, and entity_type
2. THE Identifier_Mapping_Table SHALL enforce uniqueness constraints on Public_Identifier
3. THE Identifier_Mapping_Table SHALL support lookups in both directions (public-to-internal and internal-to-public)
4. WHEN querying by Public_Identifier, THE Backend_System SHALL return the corresponding Internal_UUID within 100ms
5. THE Identifier_Mapping_Table SHALL include indexes on Public_Identifier and Internal_UUID columns for query performance

### Requirement 3: Product Page URL Security

**User Story:** As an end user, I want to access product pages securely, so that internal database information is not exposed in my browser history

#### Acceptance Criteria

1. THE Frontend_Application SHALL use Public_Identifier in URL_Path_Parameter for all product page routes
2. WHEN a user navigates to /products/:id, THE Frontend_Application SHALL accept Public_Identifier as the id parameter
3. THE Frontend_Application SHALL resolve Public_Identifier to Internal_UUID before querying the Backend_System
4. THE Query_Pattern SHALL use Internal_UUID for database filtering operations
5. IF the Public_Identifier is invalid, THEN THE Frontend_Application SHALL display a "product not found" error

### Requirement 4: Order Page URL Security

**User Story:** As a customer, I want to view my orders securely, so that order database IDs are not visible in URLs

#### Acceptance Criteria

1. THE Frontend_Application SHALL use Public_Identifier in URL_Path_Parameter for all order page routes
2. WHEN a user navigates to /orders/:id, THE Frontend_Application SHALL accept Public_Identifier as the id parameter
3. THE Frontend_Application SHALL resolve Public_Identifier to Internal_UUID before querying the Backend_System
4. THE Query_Pattern SHALL use Internal_UUID for database filtering operations
5. IF the Public_Identifier is invalid, THEN THE Frontend_Application SHALL display an "order not found" error

### Requirement 5: Admin Page URL Security

**User Story:** As an administrator, I want admin pages to use secure identifiers, so that internal database structure is protected from exposure

#### Acceptance Criteria

1. THE Frontend_Application SHALL use Public_Identifier in URL_Path_Parameter for testimonial admin routes
2. THE Frontend_Application SHALL use Public_Identifier in URL_Path_Parameter for footer link admin routes
3. THE Frontend_Application SHALL use Public_Identifier in URL_Path_Parameter for FAQ admin routes
4. WHEN an admin navigates to any admin detail page, THE Frontend_Application SHALL accept Public_Identifier as the id parameter
5. THE Frontend_Application SHALL resolve Public_Identifier to Internal_UUID before performing any database operations

### Requirement 6: Backward Compatibility

**User Story:** As a system operator, I want existing URLs to continue functioning during migration, so that bookmarks and shared links remain valid

#### Acceptance Criteria

1. WHEN a URL_Path_Parameter contains an Internal_UUID format, THE Frontend_Application SHALL attempt to resolve it as a Public_Identifier first
2. IF the Public_Identifier resolution fails, THEN THE Frontend_Application SHALL check if the parameter is a valid Internal_UUID
3. WHERE backward compatibility is enabled, THE Frontend_Application SHALL query the Backend_System using the Internal_UUID directly
4. THE Frontend_Application SHALL log a deprecation warning when Internal_UUID format is detected in URLs
5. THE backward compatibility behavior SHALL be configurable through environment variables

### Requirement 7: API Response Security

**User Story:** As a security engineer, I want API responses to exclude internal UUIDs, so that sensitive identifiers are not transmitted to clients

#### Acceptance Criteria

1. THE Backend_System SHALL return Public_Identifier in API responses instead of Internal_UUID
2. WHEN the Frontend_Application requests record data, THE Backend_System SHALL include the Public_Identifier field in the response payload
3. THE Backend_System SHALL exclude Internal_UUID from all public-facing API responses
4. WHERE administrative access is granted, THE Backend_System MAY include Internal_UUID for debugging purposes
5. THE Frontend_Application SHALL use Public_Identifier for all client-side routing operations

### Requirement 8: Link Generation

**User Story:** As a developer, I want all generated links to use public identifiers, so that no internal IDs leak through application navigation

#### Acceptance Criteria

1. THE Frontend_Application SHALL generate all internal navigation links using Public_Identifier
2. WHEN rendering product links, THE Frontend_Application SHALL construct URLs with /products/:public_id format
3. WHEN rendering order links, THE Frontend_Application SHALL construct URLs with /orders/:public_id format
4. WHEN rendering admin links, THE Frontend_Application SHALL construct URLs with the appropriate public identifier format
5. THE Frontend_Application SHALL NOT expose Internal_UUID in any href attribute or navigation function

### Requirement 9: Migration Support

**User Story:** As a database administrator, I want to migrate existing records to the new identifier system, so that all data is secured without data loss

#### Acceptance Criteria

1. THE Backend_System SHALL provide a migration script that generates Public_Identifiers for all existing records
2. THE migration script SHALL populate the Identifier_Mapping_Table with mappings for all affected entity types
3. THE migration script SHALL verify uniqueness of all generated Public_Identifiers before committing
4. WHEN the migration completes, THE Backend_System SHALL report the number of records migrated per entity type
5. IF the migration encounters errors, THEN THE Backend_System SHALL rollback all changes and report the failure cause

### Requirement 10: Error Handling and Logging

**User Story:** As a system operator, I want clear error messages and logging for identifier resolution failures, so that I can diagnose issues quickly

#### Acceptance Criteria

1. WHEN Public_Identifier resolution fails, THE Frontend_Application SHALL log the attempted identifier and entity type
2. THE Frontend_Application SHALL display user-friendly error messages without exposing Internal_UUIDs
3. IF database query fails during identifier resolution, THEN THE Frontend_Application SHALL log the error details for debugging
4. THE Backend_System SHALL log all identifier mapping operations including creation and lookup attempts
5. THE logging system SHALL NOT include Internal_UUIDs in user-facing log messages or error displays

### Requirement 11: Performance Requirements

**User Story:** As an end user, I want page load times to remain fast, so that the security improvements do not degrade user experience

#### Acceptance Criteria

1. THE identifier resolution process SHALL add no more than 50ms to page load time
2. THE Backend_System SHALL cache frequently accessed identifier mappings in memory
3. WHEN concurrent requests query the same Public_Identifier, THE Backend_System SHALL serve cached results
4. THE cache invalidation SHALL occur within 5 seconds of any identifier mapping changes
5. THE Frontend_Application SHALL perform identifier resolution in parallel with other initialization tasks where possible

### Requirement 12: Security Validation

**User Story:** As a security auditor, I want to verify that no internal UUIDs are exposed, so that compliance requirements are met

#### Acceptance Criteria

1. THE Frontend_Application SHALL NOT render Internal_UUIDs in any DOM element
2. THE Frontend_Application SHALL NOT include Internal_UUIDs in browser history entries
3. THE Frontend_Application SHALL NOT transmit Internal_UUIDs in query parameters or URL fragments
4. WHEN sharing functionality is used, THE Frontend_Application SHALL ensure shared URLs contain only Public_Identifiers
5. THE Backend_System SHALL provide an audit endpoint that verifies no Internal_UUIDs are exposed in public responses
