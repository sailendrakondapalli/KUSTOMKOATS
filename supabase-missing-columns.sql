-- =============================================
-- ADD MISSING COLUMNS TO PRODUCTS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

alter table products add column if not exists custom_id text;
alter table products add column if not exists original_price numeric;
alter table products add column if not exists delivery_charge numeric;
alter table products add column if not exists size text;
alter table products add column if not exists tags text[] default '{}';

-- =============================================
-- VERIFY (optional - check columns exist)
-- =============================================
select column_name, data_type 
from information_schema.columns 
where table_name = 'products'
order by ordinal_position;
