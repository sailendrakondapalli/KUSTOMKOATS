# Database Migrations

This directory contains all database migration files in sequential order.

## Migration Mapping

| Migration File | Original Filename |
|---------------|-------------------|
| migration001.sql | add-product-inventory-fields.sql |
| migration002.sql | add-tech-details-description.sql |
| migration003.sql | check-pending-payments.sql |
| migration004.sql | complete-wholesale-table-fix.sql |
| migration005.sql | diagnose-eway-bill.sql |
| migration006.sql | eway-bill-proxy-function.sql |
| migration007.sql | faqs-schema.sql |
| migration008.sql | fix-expired-promo-codes.sql |
| migration009.sql | fix-place-location.sql |
| migration010.sql | fix-pos-transactions.sql |
| migration011.sql | fix-promo-codes-rls.sql |
| migration012.sql | fix-promo-codes-schema.sql |
| migration013.sql | fix-rls-policies.sql |
| migration014.sql | fix-testimonials-schema.sql |
| migration015.sql | fix-wholesale-applications-table.sql |
| migration016.sql | fix-wholesale-rls.sql |
| migration017.sql | footer-links-schema.sql |
| migration018.sql | kustom-kultor-blog-schema.sql |
| migration019.sql | migration-fix-wholesale-and-products.sql |
| migration020.sql | policy-pages-content-schema.sql |
| migration021.sql | pos-sales-setup.sql |
| migration022.sql | product-bundles-schema.sql |
| migration023.sql | razorpay-integration-schema-clean.sql |
| migration024.sql | setup-eway-bill.sql |
| migration025.sql | setup-product-bundles.sql |
| migration026.sql | setup-promo-codes.sql |
| migration027.sql | setup-settings-and-product-ids.sql |
| migration028.sql | site-pages-content-schema.sql |
| migration029.sql | supabase-missing-columns.sql |
| migration030.sql | supabase-schema.sql |
| migration031.sql | supabase-storage-setup.sql |
| migration032.sql | supabase-technical-details.sql |
| migration033.sql | testimonials-schema.sql |

## Usage

Run migrations in sequential order from 001 to 033.

Each migration file contains the SQL statements needed to update the database schema or data.
