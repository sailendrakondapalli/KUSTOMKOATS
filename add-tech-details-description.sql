-- Adds a "Technical Details" section title + description to each product.
-- Shown on the product page after the interactive Technical Bars.
-- Safe to run multiple times.

alter table public.products
  add column if not exists tech_details_title text default '';

alter table public.products
  add column if not exists tech_details_description text default '';
