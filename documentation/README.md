# Documentation Directory

This directory contains all project documentation for the KUSTOMKOATS e-commerce platform.

## Directory Structure

```
documentation/
├── guides/              # Feature guides, tutorials, and how-tos
├── deployment/          # Deployment and infrastructure documentation
├── database/            # Database-related documentation
├── specs/               # Technical specifications and architecture docs
└── README.md            # This file
```

## Guides (`guides/`)

User guides, feature documentation, and implementation guides:

- **Admin Protection Guide**: Security guidelines for admin routes
- **Category Showcase**: Documentation for category showcase feature
- **Migration Guides**: Frontend API migration documentation
- **Feature Summaries**: Completed feature documentation
- **Quick References**: Quick setup and reference guides
- **Product Updates**: Product-related feature documentation
- **Payment Failure Tracking**: Payment failure implementation guide

## Deployment (`deployment/`)

Deployment guides and infrastructure documentation:

- **Backend Deployment Guide**: How to deploy the backend to Render
- **Vercel Deployment Guide**: How to deploy the frontend to Vercel
- **Local Setup**: Local development environment setup
- **Deployment Summaries**: Deployment completion reports
- **Render Configuration**: Render-specific configuration
- **Environment Variables**: Guide for updating environment variables

## Database (`database/`)

Database architecture and schema documentation:

- **DATABASE-ER-DIAGRAM.md**: Entity-relationship diagram and schema
- Database design decisions
- Table relationships
- Index strategies

## Specs (`specs/`)

Technical specifications and architecture documentation:

- **Backend MVC Migration**: Backend architecture restructuring specs
- **MVC Migration Summary**: Comprehensive migration documentation
- API specifications
- Architecture decision records
- Technical design documents

## Documentation Standards

### File Naming Convention

- Use kebab-case for file names: `my-feature-guide.md`
- Use descriptive names that indicate content
- Include date in name if time-sensitive: `deployment-2024-11-25.md`

### Markdown Format

All documentation uses Markdown format with:
- Clear headings (H1 for title, H2 for sections)
- Code blocks with language specification
- Lists for step-by-step instructions
- Tables for structured data
- Links to related documentation

### Sections to Include

Each guide should contain:
1. **Overview**: What this document covers
2. **Prerequisites**: What you need before starting
3. **Steps**: Detailed instructions
4. **Troubleshooting**: Common issues and solutions
5. **Related Links**: Links to related documentation

## Finding Documentation

### By Topic

- **Setting up environment**: Check `deployment/` directory
- **Using features**: Check `guides/` directory
- **Database questions**: Check `database/` directory
- **Architecture understanding**: Check `specs/` directory

### Quick Links

- [Backend MVC Architecture](specs/MVC-MIGRATION-SUMMARY.md)
- [Deployment Guides](deployment/)
- [Feature Guides](guides/)
- [Database Schema](database/DATABASE-ER-DIAGRAM.md)

## Contributing to Documentation

When adding new documentation:

1. Choose the appropriate directory
2. Follow naming conventions
3. Use the markdown template
4. Update this README with links if needed
5. Keep documentation up-to-date with code changes

## Related Resources

- **Main README**: `../README.md` (project root)
- **Database Files**: `../database/`
- **API Documentation**: Check backend route files
- **Frontend Components**: Check component documentation in code
