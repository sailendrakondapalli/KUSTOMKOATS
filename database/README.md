# Database Directory

This directory contains all database-related files for the KUSTOMKOATS project.

## Directory Structure

```
database/
├── migrations/          # Database schema migrations (numbered)
├── queries/            # SQL query files for maintenance and debugging
├── schemas/            # Database schema definitions
└── README.md           # This file
```

## Migrations

Located in `database/migrations/`

These are the database schema migration files that define the structure of the KUSTOMKOATS database. They should be run in sequential order (migration001.sql, migration002.sql, etc.).

**Migration Index**: See `migrations/INDEX.txt` for a complete list of migration files.

### Running Migrations

Migrations are managed through Supabase. To apply migrations:

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Run migrations in sequential order
4. Or use the Supabase CLI: `supabase db push`

## Queries

Located in `database/queries/`

These are administrative SQL query files used for:
- Database maintenance
- Debugging and troubleshooting  
- Data fixes and updates
- Administrative tasks
- Checking data integrity

**Query Index**: See `queries/INDEX.txt` for a complete list of query files.

### Query Categories

- **CHECK-*** queries: Diagnostic queries to inspect database state
- **FIX-*** queries: Queries that fix data issues
- **ADD-*** queries: Queries that add new data or policies
- **CLEAR-*** queries: Queries that clean up data

## Schemas

Located in `database/schemas/`

This directory is for database schema documentation and definitions:
- Table schemas
- Relationship diagrams
- Index definitions
- Constraint documentation

## Database Connection

The application connects to the database via Supabase:
- **Backend**: Uses `backend/src/config/supabase.js`
- **Frontend**: Uses Supabase client for authentication only
- **Connection String**: Defined in `.env` files

## Important Notes

- Never run queries directly on production without testing
- Always backup before running FIX queries
- Migrations should never be modified after being applied
- Use proper transaction management for data modifications
- Test queries on development environment first

## Related Documentation

- Database ER Diagram: `documentation/database/DATABASE-ER-DIAGRAM.md`
- Backend Models: `backend/src/models/`
- Migration logs: `backend/database/` (old location, being phased out)
