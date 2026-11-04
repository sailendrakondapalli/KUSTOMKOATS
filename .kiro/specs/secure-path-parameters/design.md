# Design Document: Secure Path Parameters

## Introduction

This document provides the technical design for implementing secure identifier mapping to prevent internal database UUID exposure in URL paths. The solution introduces a public identifier system that maps non-sequential, non-predictable identifiers to internal database UUIDs, ensuring that browser history, server logs, referrer headers, and screenshots do not leak sensitive database structure information.

## Architecture Overview

The system implements a bi-directional identifier mapping layer between the frontend application and the Supabase backend. Three main components work together:

1. **Database Layer**: Maintains identifier mappings and enforces uniqueness constraints
2. **Backend Service Layer**: Generates public identifiers and provides resolution services
3. **Frontend Integration Layer**: Intercepts route parameters and translates identifiers before database queries

### Data Flow

```
User Request → Frontend Router → Public ID → Identifier Resolution → Internal UUID → Database Query → Response with Public ID → Frontend Display
```

## Component Design

### 1. Database Schema

#### Identifier Mapping Table

```javascript
// Table: identifier_mappings
{
  id: uuid (primary key, auto-generated),
  public_id: text (unique, indexed, not null),
  internal_uuid: uuid (indexed, not null),
  entity_type: text (not null), // 'product', 'order', 'testimonial', 'faq', 'footer_link'
  created_at: timestamptz (default: now()),
  updated_at: timestamptz (default: now())
}

// Indexes
CREATE UNIQUE INDEX idx_public_id ON identifier_mappings(public_id);
CREATE INDEX idx_internal_uuid ON identifier_mappings(internal_uuid);
CREATE INDEX idx_entity_type ON identifier_mappings(entity_type);
```

#### Public ID Generation Trigger

Database trigger to automatically generate public identifiers when new records are created:

```javascript
// Trigger function: generate_public_identifier()
// Fires: BEFORE INSERT on products, orders, testimonials, faqs, footer_links
// Logic:
// 1. Generate random alphanumeric string (8-12 characters)
// 2. Check uniqueness against identifier_mappings table
// 3. If collision, regenerate (max 10 attempts)
// 4. Insert mapping into identifier_mappings table
// 5. Return control to original insert operation
```

### 2. Public Identifier Generator

**Module**: `src/utils/identifierGenerator.js`

```javascript
// generatePublicId(): string
// - Generates cryptographically random alphanumeric string
// - Length: 8-12 characters (configurable)
// - Character set: [A-Za-z0-9] excluding ambiguous chars (0, O, I, l)
// - Uses crypto.randomBytes for entropy
// - Returns: string like "aB3xK9mP"

// isValidPublicIdFormat(id: string): boolean
// - Validates public ID format (alphanumeric, min 8 chars)
// - Returns: true if valid format, false otherwise

// isUuidFormat(id: string): boolean
// - Checks if string matches UUID format
// - Returns: true if UUID format, false otherwise
```

### 3. Identifier Resolution Service

**Module**: `src/services/identifierService.js`

This service provides the core resolution functionality with caching and error handling.

```javascript
// IdentifierService class

class IdentifierService {
  constructor() {
    this.cache = new Map() // In-memory LRU cache
    this.cacheMaxSize = 1000
    this.cacheTTL = 300000 // 5 minutes
  }

  // resolvePublicId(publicId: string, entityType: string): Promise<string|null>
  // - Accepts: public_id and entity_type
  // - Checks cache first
  // - Queries identifier_mappings table
  // - Returns: internal_uuid or null if not found
  // - Updates cache on successful resolution

  // resolveInternalUuid(uuid: string, entityType: string): Promise<string|null>
  // - Reverse lookup: internal_uuid → public_id
  // - Used for API response transformation
  // - Returns: public_id or null if not found

  // resolveWithFallback(id: string, entityType: string, allowUuidFallback: boolean): Promise<string|null>
  // - Attempts public_id resolution first
  // - If fails and allowUuidFallback=true, checks if id is valid UUID
  // - Logs deprecation warning if UUID used directly
  // - Returns: internal_uuid or null

  // invalidateCache(publicId: string): void
  // - Removes specific entry from cache
  // - Called when mappings are updated

  // clearCache(): void
  // - Clears entire cache
  // - Used during migrations or system maintenance
}

export const identifierService = new IdentifierService()
```

### 4. Frontend Route Integration

**Module**: `src/hooks/useSecureId.js`

Custom React hook to handle identifier resolution in route components.

```javascript
// useSecureId(routeParamId: string, entityType: string, options?: Options): SecureIdResult

// Options:
// - allowUuidFallback: boolean (default: true for backward compatibility)
// - onError: (error: Error) => void
// - skipResolution: boolean (default: false)

// Returns SecureIdResult:
// {
//   internalId: string | null,    // Resolved internal UUID
//   publicId: string,               // Original public ID from route
//   loading: boolean,               // Resolution in progress
//   error: Error | null,            // Resolution error
//   isLegacyUuid: boolean          // True if fallback to UUID occurred
// }

function useSecureId(routeParamId, entityType, options = {}) {
  const [result, setResult] = useState({
    internalId: null,
    publicId: routeParamId,
    loading: true,
    error: null,
    isLegacyUuid: false
  })

  useEffect(() => {
    // Async resolution logic
    // 1. Check if skipResolution
    // 2. Call identifierService.resolveWithFallback()
    // 3. Update result state
    // 4. Log deprecation warning if isLegacyUuid
    // 5. Call onError callback if error occurs
  }, [routeParamId, entityType])

  return result
}
```

### 5. Link Generation Utility

**Module**: `src/utils/linkGenerator.js`

Centralized utility for generating secure links throughout the application.

```javascript
// generateProductLink(product: Product): string
// - Accepts: product object with id field (internal UUID)
// - Resolves to public_id via identifierService
// - Returns: "/products/{public_id}"

// generateOrderLink(order: Order): string
// - Returns: "/orders/{public_id}"

// generateAdminLink(entity: Entity, type: string): string
// - type: 'testimonial' | 'faq' | 'footer_link'
// - Returns: "/admin/{type}s/{public_id}"

// SecureLink component wrapper:
// <SecureLink to={entity} type="product" className="...">
//   {children}
// </SecureLink>
// - Automatically resolves entity to public_id
// - Renders as standard <Link> component
// - Falls back to '#' if resolution fails
```

### 6. API Response Transformer

**Module**: `src/utils/apiTransformer.js`

Middleware to transform API responses and remove internal UUIDs.

```javascript
// transformResponse(data: any, entityType: string): Promise<any>
// - Recursively traverses response object
// - Replaces 'id' fields with 'public_id' from identifier_mappings
// - Removes internal_uuid fields if present
// - Handles arrays and nested objects
// - Returns transformed response

// transformSingleEntity(entity: Entity, entityType: string): Promise<Entity>
// - Transforms single entity object
// - Adds 'public_id' field
// - Optionally removes 'id' field (configurable)

// transformEntityArray(entities: Entity[], entityType: string): Promise<Entity[]>
// - Batch transforms array of entities
// - More efficient than individual calls
// - Uses Promise.all for parallel resolution
```

### 7. Database Migration Script

**File**: `supabase/migrations/YYYYMMDDHHMMSS_add_identifier_mappings.sql`

```sql
-- Create identifier_mappings table
CREATE TABLE identifier_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL,
  internal_uuid uuid NOT NULL,
  entity_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_public_id UNIQUE (public_id)
);

-- Create indexes
CREATE INDEX idx_public_id ON identifier_mappings(public_id);
CREATE INDEX idx_internal_uuid ON identifier_mappings(internal_uuid);
CREATE INDEX idx_entity_type ON identifier_mappings(entity_type);

-- Create function to generate public IDs
CREATE OR REPLACE FUNCTION generate_public_id(length int DEFAULT 10)
RETURNS text AS $$
DECLARE
  chars text := 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
  pos int;
BEGIN
  FOR i IN 1..length LOOP
    pos := 1 + floor(random() * length(chars))::int;
    result := result || substr(chars, pos, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Migrate existing records
DO $$
DECLARE
  entity_record RECORD;
  new_public_id text;
  max_attempts int := 10;
  attempt int;
  is_unique boolean;
BEGIN
  -- Migrate products
  FOR entity_record IN SELECT id FROM products LOOP
    attempt := 0;
    is_unique := false;
    
    WHILE NOT is_unique AND attempt < max_attempts LOOP
      new_public_id := generate_public_id(10);
      
      IF NOT EXISTS (SELECT 1 FROM identifier_mappings WHERE public_id = new_public_id) THEN
        is_unique := true;
      END IF;
      
      attempt := attempt + 1;
    END LOOP;
    
    IF NOT is_unique THEN
      RAISE EXCEPTION 'Failed to generate unique public_id after % attempts', max_attempts;
    END IF;
    
    INSERT INTO identifier_mappings (public_id, internal_uuid, entity_type)
    VALUES (new_public_id, entity_record.id, 'product');
  END LOOP;

  -- Repeat for orders, testimonials, faqs, footer_links
  -- (Similar logic for each entity type)

  RAISE NOTICE 'Migration completed successfully';
END $$;
```

## Integration Points

### Product Detail Page

**File**: `src/pages/ProductDetailPage.jsx`

```javascript
import { useSecureId } from '../hooks/useSecureId'

export default function ProductDetailPage() {
  const { id } = useParams() // This is now a public_id
  const { internalId, loading, error, isLegacyUuid } = useSecureId(id, 'product')

  useEffect(() => {
    if (!internalId) return
    
    // Use internalId for database query
    supabase.from('products')
      .select('*')
      .eq('id', internalId) // Query with internal UUID
      .single()
      .then(({ data, error }) => {
        // Handle response
      })
  }, [internalId])

  // Show deprecation notice if legacy UUID detected
  useEffect(() => {
    if (isLegacyUuid) {
      console.warn('Legacy UUID detected in URL. Please update bookmarks.')
    }
  }, [isLegacyUuid])

  // Rest of component logic...
}
```

### Order Page

**File**: `src/pages/OrderDetailPage.jsx`

Similar integration as ProductDetailPage, using `useSecureId(id, 'order')`.

### Admin Pages

**Files**: 
- `src/pages/admin/AdminTestimonialsPage.jsx`
- `src/pages/admin/AdminFAQPage.jsx`
- `src/pages/admin/AdminFooterLinksPage.jsx`

Each admin page uses the same pattern with appropriate entity type.

### Link Generation

**All pages that generate links** (ProductCard, OrderHistory, etc.):

```javascript
import { generateProductLink } from '../utils/linkGenerator'

// Instead of:
// <Link to={`/products/${product.id}`}>

// Use:
<Link to={generateProductLink(product)}>
```

Or use the SecureLink component:

```javascript
import { SecureLink } from '../utils/linkGenerator'

<SecureLink to={product} type="product">
  View Product
</SecureLink>
```

## Configuration

### Environment Variables

```javascript
// .env file additions

// Enable backward compatibility (accepts legacy UUIDs in routes)
VITE_ALLOW_LEGACY_UUID_ROUTES=true

// Public ID length (8-12 recommended)
VITE_PUBLIC_ID_LENGTH=10

// Cache settings
VITE_ID_CACHE_TTL_MS=300000  // 5 minutes
VITE_ID_CACHE_MAX_SIZE=1000

// Enable deprecation warnings in console
VITE_SHOW_LEGACY_UUID_WARNINGS=true
```

## Error Handling

### Resolution Failures

When identifier resolution fails:

1. **User-facing error**: Display "Page not found" or "Item not found" message
2. **Logging**: Log the attempted public_id and entity_type to console/monitoring
3. **Fallback**: Do NOT expose internal UUID in error messages
4. **Navigation**: Optionally redirect to 404 page or entity listing page

### Database Errors

When database queries fail during resolution:

1. **Retry logic**: Attempt resolution up to 3 times with exponential backoff
2. **Cache bypass**: Skip cache on retry attempts
3. **User feedback**: Show generic error message without technical details
4. **Monitoring**: Log error details for debugging (server-side only)

### Cache Invalidation

Cache entries are invalidated:

1. **On TTL expiry**: Automatically after 5 minutes
2. **On update**: When identifier mappings are modified
3. **On migration**: When running database migrations
4. **Manual**: Via admin endpoint for troubleshooting

## Performance Considerations

### Caching Strategy

- **LRU Cache**: Least Recently Used eviction when cache reaches max size
- **Cache warming**: Pre-populate cache with frequently accessed products on app startup
- **Parallel resolution**: Batch resolve multiple identifiers in single database query
- **Service Worker**: Consider caching public_id mappings in service worker for offline support

### Database Optimization

- **Indexed lookups**: Both public_id and internal_uuid columns are indexed
- **Query batching**: Resolve multiple identifiers in single query when possible
- **Connection pooling**: Use Supabase connection pooling for high throughput
- **Read replicas**: Consider read replicas for identifier resolution queries

### Frontend Optimization

- **Prefetching**: Prefetch identifier mappings for related products
- **Route preloading**: Resolve identifiers for visible links before navigation
- **Lazy resolution**: Only resolve identifiers when actually needed for queries
- **Error boundaries**: Prevent identifier resolution errors from crashing entire app

## Security Considerations

### UUID Exposure Prevention

1. **DOM scanning**: No `id` attributes should contain UUIDs in rendered HTML
2. **URL validation**: Server-side validation rejects direct UUID access (when compat disabled)
3. **API responses**: Transform all responses to use public_ids before sending to client
4. **Error messages**: Never include UUIDs in user-facing error text
5. **Logs**: Client-side logs should use public_ids, server logs can use UUIDs

### Rate Limiting

Implement rate limiting on identifier resolution endpoints to prevent:

- **Enumeration attacks**: Attempting to discover valid public_ids through brute force
- **Cache exhaustion**: Flooding cache with invalid identifiers
- **Database overload**: Excessive resolution requests

### Access Control

- **Public identifiers**: Anyone can resolve public_ids to access public data
- **Protected entities**: Orders require authentication to resolve and access
- **Admin entities**: Admin entities (testimonials, FAQs) require admin role for write operations
- **Audit trail**: Log all identifier resolution attempts for security monitoring

## Migration Strategy

### Phase 1: Preparation (No User Impact)

1. Deploy identifier_mappings table
2. Run migration script to generate public_ids for all existing records
3. Deploy backend resolution service (unused initially)
4. Test resolution service in non-production environment

### Phase 2: Dual Operation (Backward Compatible)

1. Deploy frontend changes with VITE_ALLOW_LEGACY_UUID_ROUTES=true
2. All new links use public_ids
3. Old UUID links continue to work via fallback
4. Monitor deprecation warnings in logs

### Phase 3: Transition Period (4-8 weeks)

1. Monitor usage of legacy UUID routes
2. Notify users to update bookmarks if needed
3. Gradual decrease in UUID route usage

### Phase 4: Legacy Deprecation (Optional)

1. Set VITE_ALLOW_LEGACY_UUID_ROUTES=false
2. UUID routes return 404 or redirect to public_id version
3. Full security benefit realized

## Testing Strategy

The system will be validated through both unit tests and property-based tests to ensure correctness across all inputs and scenarios.

### Unit Tests

Unit tests will cover specific examples and integration scenarios:

1. **Identifier generation**: Test specific format requirements and error cases
2. **Resolution fallback**: Test backward compatibility with legacy UUIDs
3. **Error handling**: Test specific error scenarios (invalid IDs, network failures)
4. **Cache behavior**: Test cache hit/miss scenarios
5. **Link generation**: Test specific entity types and URL formats

### Property-Based Tests

Property-based tests will validate universal correctness properties across many generated inputs:

1. **Public ID format and uniqueness**
2. **Bi-directional resolution consistency**
3. **URL generation security**
4. **API response transformation**
5. **DOM security validation**

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Public Identifier Validity

*For any* generated public identifier, it SHALL be alphanumeric, at least 8 characters long, and unique within the identifier_mappings table.

**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: Non-Sequential Generation

*For any* sequence of generated public identifiers, they SHALL NOT follow sequential or predictable patterns (no incrementing, no simple mathematical relationships).

**Validates: Requirements 1.3**

### Property 3: Mapping Round-Trip Consistency

*For any* record with a public_id and internal_uuid mapping, resolving the public_id SHALL return the original internal_uuid, and reverse-resolving that internal_uuid SHALL return the original public_id.

**Validates: Requirements 1.5, 2.3**

### Property 4: URL Generation Security

*For any* entity (product, order, testimonial, FAQ, footer_link), all generated navigation links SHALL use the public_id and SHALL NOT contain the internal UUID in the URL path.

**Validates: Requirements 3.1, 4.1, 5.1, 5.2, 5.3, 8.1, 8.2, 8.3, 8.4**

### Property 5: Resolution Before Query

*For any* route parameter id (whether public_id or legacy UUID), the system SHALL resolve it to an internal_uuid before executing database queries using .eq('id', ...).

**Validates: Requirements 3.3, 3.4, 4.3, 4.4, 5.5**

### Property 6: API Response Transformation

*For any* API response containing entity data, the response SHALL include the public_id field and SHALL NOT include the internal UUID field in public-facing contexts.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 7: DOM Security

*For any* rendered page containing entity links or data, the DOM SHALL NOT contain internal UUIDs in text content, href attributes, or data attributes.

**Validates: Requirements 8.5, 12.1**

### Property 8: Browser History Security

*For any* navigation operation that updates browser history, the history entry URL SHALL contain only public_ids and SHALL NOT contain internal UUIDs.

**Validates: Requirements 12.2**

### Property 9: Error Message Security

*For any* error condition (invalid ID, not found, database error), user-facing error messages SHALL NOT contain or expose internal UUIDs.

**Validates: Requirements 10.2, 10.5**

### Property 10: Uniqueness Constraint Enforcement

*For any* attempt to insert a duplicate public_id into the identifier_mappings table, the database SHALL reject the insertion with a uniqueness constraint violation.

**Validates: Requirements 2.2**

## Monitoring and Observability

### Metrics to Track

1. **Resolution latency**: P50, P95, P99 for identifier resolution
2. **Cache hit rate**: Percentage of resolutions served from cache
3. **Legacy UUID usage**: Count of deprecated UUID route accesses
4. **Resolution failures**: Rate of failed identifier lookups
5. **Database query performance**: Identifier mapping query times

### Alerts

1. **High resolution latency**: Alert if P95 > 100ms
2. **Low cache hit rate**: Alert if < 70%
3. **Resolution failures spike**: Alert if failure rate > 5%
4. **Database errors**: Alert on any identifier_mappings query errors

### Logging

Development and production logging:

```javascript
// Example log entries (structured JSON)
{
  level: 'info',
  event: 'identifier_resolved',
  public_id: 'aB3xK9mP',
  entity_type: 'product',
  cache_hit: true,
  duration_ms: 12
}

{
  level: 'warn',
  event: 'legacy_uuid_detected',
  public_id: '550e8400-e29b-41d4-a716-446655440000',
  entity_type: 'product',
  user_agent: 'Mozilla/5.0...'
}

{
  level: 'error',
  event: 'resolution_failed',
  public_id: 'invalidID',
  entity_type: 'product',
  error: 'Identifier not found in mappings table'
}
```

## Rollback Plan

If critical issues arise post-deployment:

1. **Immediate**: Set VITE_ALLOW_LEGACY_UUID_ROUTES=true (if disabled)
2. **Short-term**: Revert frontend changes to restore direct UUID usage
3. **Data preservation**: identifier_mappings table can remain for future retry
4. **Communication**: Notify users of rollback and expected resolution timeline

The identifier_mappings table persists all mappings, so rollback does not cause data loss and the feature can be re-enabled after fixes are applied.

## Future Enhancements

1. **Custom vanity IDs**: Allow admins to set custom public_ids for featured products
2. **Short URLs**: Implement even shorter public_ids (4-6 chars) with expiry for sharing
3. **QR codes**: Generate QR codes using public_ids for physical product labels
4. **Analytics integration**: Track public_id usage for marketing insights
5. **Multi-region support**: Distributed caching for global deployments
6. **Batch API**: Bulk identifier resolution endpoint for performance
