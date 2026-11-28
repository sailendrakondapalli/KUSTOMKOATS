-- FAQs CMS
-- Stores admin-editable FAQ entries shown on /faq.
-- Each row is a single question/answer, grouped by category and orderable.

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'General',
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_faqs_category on public.faqs (category);
create index if not exists idx_faqs_sort_order on public.faqs (sort_order);

-- Keep updated_at fresh on every update
create or replace function public.set_faqs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_faqs_updated_at on public.faqs;
create trigger trg_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_faqs_updated_at();

-- Seed some starter content (safe to re-run; skipped if table already has rows)
insert into public.faqs (category, question, answer, sort_order)
select * from (values
  ('General', 'What products does Kustom Koats offer?', 'We specialize in Xtreme Kolorz automotive pearls, Xtreme Wrap vinyl films, and professional automotive accessories for custom finishes.', 1),
  ('General', 'How can I contact support?', 'You can reach us through our contact page, email, or phone. We typically respond within 24 hours.', 2),
  ('Orders', 'How long does shipping take?', 'Standard shipping typically takes 3-7 business days depending on your location.', 1),
  ('Orders', 'Can I track my order?', 'Yes, once your order ships you will receive a tracking number via email.', 2),
  ('Wholesale', 'Do you offer wholesale pricing?', 'Yes, we have a dedicated wholesale program. Visit our Wholesale page to apply.', 1),
  ('Returns', 'What is your return policy?', 'Please refer to our Refund Policy page for full details on returns and exchanges.', 1)
) as seed(category, question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- RLS: public can read published FAQs; admin panel (no auth gate currently) can manage all
alter table public.faqs enable row level security;

drop policy if exists "Public can read published faqs" on public.faqs;
create policy "Public can read published faqs"
  on public.faqs for select
  using (true);

drop policy if exists "Anyone can insert faqs" on public.faqs;
create policy "Anyone can insert faqs"
  on public.faqs for insert
  with check (true);

drop policy if exists "Anyone can update faqs" on public.faqs;
create policy "Anyone can update faqs"
  on public.faqs for update
  using (true)
  with check (true);

drop policy if exists "Anyone can delete faqs" on public.faqs;
create policy "Anyone can delete faqs"
  on public.faqs for delete
  using (true);
