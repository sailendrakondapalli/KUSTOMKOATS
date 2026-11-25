-- Footer Links CMS
-- Stores admin-editable link lists shown in the site Footer's "Product Categories"
-- and "Quick Links" columns. Each row is one link, grouped by section and orderable.

create table if not exists public.footer_links (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('product_categories', 'quick_links')),
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_footer_links_section on public.footer_links (section);
create index if not exists idx_footer_links_sort_order on public.footer_links (sort_order);

-- Keep updated_at fresh on every update
create or replace function public.set_footer_links_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_footer_links_updated_at on public.footer_links;
create trigger trg_footer_links_updated_at
  before update on public.footer_links
  for each row execute function public.set_footer_links_updated_at();

-- Seed with the links currently hardcoded in Footer.jsx (safe to re-run; skipped if table already has rows)
insert into public.footer_links (section, label, url, sort_order)
select * from (values
  ('product_categories', 'Xtreme Kolorz', '/shop/xtreme-kolorz', 1),
  ('product_categories', 'Xtreme Wrap',   '/shop/xtreme-wrap',   2),
  ('product_categories', 'Accessories',   '/shop/accessories',   3),
  ('product_categories', 'Wholesale',     '/shop/wholesale',     4),

  ('quick_links', 'Contact Us',                            '/contact',           1),
  ('quick_links', 'FAQ''s',                                '/faq',               2),
  ('quick_links', 'Shipping Policy',                       '/shipping-policy',   3),
  ('quick_links', 'Wholesale',                              '/shop/wholesale',    4),
  ('quick_links', 'Military & First Responder Discounts',  '/military-discount', 5),
  ('quick_links', 'KK Point Rewards',                      '/kk-rewards',        6),
  ('quick_links', 'KK University',                         '/kulture/university',7),
  ('quick_links', 'Your Privacy Choices',                  '/privacy-choices',   8),
  ('quick_links', 'Order Protection',                      '/order-protection',  9)
) as seed(section, label, url, sort_order)
where not exists (select 1 from public.footer_links);

-- RLS: public can read active links; admin panel (no auth gate currently) can manage all
alter table public.footer_links enable row level security;

drop policy if exists "Public can read footer links" on public.footer_links;
create policy "Public can read footer links"
  on public.footer_links for select
  using (true);

drop policy if exists "Anyone can insert footer links" on public.footer_links;
create policy "Anyone can insert footer links"
  on public.footer_links for insert
  with check (true);

drop policy if exists "Anyone can update footer links" on public.footer_links;
create policy "Anyone can update footer links"
  on public.footer_links for update
  using (true)
  with check (true);

drop policy if exists "Anyone can delete footer links" on public.footer_links;
create policy "Anyone can delete footer links"
  on public.footer_links for delete
  using (true);
