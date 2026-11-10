-- =============================================
-- TECHNICAL DETAILS MIGRATION
-- Run this in your Supabase SQL editor
-- =============================================

-- product_technical_bars: interactive slider bars shown on product detail page
-- e.g. "Color Vibe" with labels ["Stealthy", "Bold", "Extreme"] and selected_value="Bold"
create table if not exists product_technical_bars (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  title text not null,              -- e.g. "Color Vibe"
  labels text[] not null default '{}', -- e.g. ["Stealthy", "Bold", "Extreme"]
  selected_value text not null,     -- e.g. "Bold"
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- product_specifications: key-value technical specs shown in right column
-- e.g. "Paint Type" => "Peelable Paint"
create table if not exists product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  spec_name text not null,          -- e.g. "Paint Type"
  spec_value text not null,         -- e.g. "Peelable Paint"
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- categories: dedicated categories table for admin management
-- (replaces site_settings custom_categories approach)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text,
  description text,
  image_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Seed default categories if not exists
insert into categories (name, slug, sort_order) values
  ('Xtreme Kolorz', 'xtreme-kolorz', 1),
  ('Xtreme Wrap',   'xtreme-wrap',   2),
  ('Accessories',   'accessories',   3),
  ('Wholesale',     'wholesale',     4)
on conflict (name) do nothing;

-- wholesale_applications: dealer/wholesaler applications
create table if not exists wholesale_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text,
  email text not null,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  application_type text default 'dealer',  -- 'dealer' | 'distributor' | 'wholesaler'
  message text,
  status text default 'pending',           -- 'pending' | 'approved' | 'rejected'
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- RLS Policies
-- =============================================

alter table product_technical_bars enable row level security;
alter table product_specifications enable row level security;
alter table categories enable row level security;
alter table wholesale_applications enable row level security;

-- Technical bars: public read, admin write
create policy "Technical bars are viewable by everyone"
  on product_technical_bars for select using (true);

create policy "Only admins can insert technical bars"
  on product_technical_bars for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update technical bars"
  on product_technical_bars for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete technical bars"
  on product_technical_bars for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- Specifications: public read, admin write
create policy "Specifications are viewable by everyone"
  on product_specifications for select using (true);

create policy "Only admins can insert specifications"
  on product_specifications for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update specifications"
  on product_specifications for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete specifications"
  on product_specifications for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- Categories: public read, admin write
create policy "Categories are viewable by everyone"
  on categories for select using (true);

create policy "Only admins can manage categories"
  on categories for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Wholesale applications: users can insert own, admins can manage all
create policy "Anyone can submit wholesale application"
  on wholesale_applications for insert
  with check (true);

create policy "Admins can view all applications"
  on wholesale_applications for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update applications"
  on wholesale_applications for update
  using (auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- NOTE: If RLS blocks admin writes (role not in JWT),
-- use service_role key server-side OR temporarily:
-- alter table product_technical_bars disable row level security;
-- alter table product_specifications disable row level security;
-- alter table categories disable row level security;
-- alter table wholesale_applications disable row level security;
-- =============================================
