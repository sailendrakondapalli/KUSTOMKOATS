-- Site Pages Content CMS
-- Stores admin-editable content for long-form marketing pages:
--   why-partner    -> /wholesale/why-partner
--   our-story      -> /about/story
--   our-philosophy -> /about/philosophy
--
-- Each row represents one page. "sections" is a JSONB array of
-- { "heading": string, "body": string } blocks rendered in order.

create table if not exists public.site_pages_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique check (page_key in ('why-partner', 'our-story', 'our-philosophy')),
  hero_title text not null default '',
  hero_subtitle text not null default '',
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every update
create or replace function public.set_site_pages_content_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_site_pages_content_updated_at on public.site_pages_content;
create trigger trg_site_pages_content_updated_at
  before update on public.site_pages_content
  for each row execute function public.set_site_pages_content_updated_at();

-- Seed default rows (safe to re-run)
insert into public.site_pages_content (page_key, hero_title, hero_subtitle, sections)
values
  ('why-partner', 'WHY PARTNER WITH US', 'Benefits of partnering with Kustom Koats', '[]'::jsonb),
  ('our-story', 'OUR STORY', 'The history and vision behind Kustom Koats', '[]'::jsonb),
  ('our-philosophy', 'OUR PHILOSOPHY', 'Our values and approach to automotive finishing', '[]'::jsonb)
on conflict (page_key) do nothing;

-- RLS: open read/write, matching the rest of this project's admin tables
-- (the admin panel currently has no login gate — see src/components/AdminRoute.jsx).
-- If admin auth is reintroduced later, tighten the write policies below.
alter table public.site_pages_content enable row level security;

drop policy if exists "Public can read site pages content" on public.site_pages_content;
create policy "Public can read site pages content"
  on public.site_pages_content for select
  using (true);

drop policy if exists "Anyone can update site pages content" on public.site_pages_content;
create policy "Anyone can update site pages content"
  on public.site_pages_content for update
  using (true)
  with check (true);

drop policy if exists "Anyone can insert site pages content" on public.site_pages_content;
create policy "Anyone can insert site pages content"
  on public.site_pages_content for insert
  with check (true);
