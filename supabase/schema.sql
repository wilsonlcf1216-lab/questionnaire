create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  ward_name text not null,
  inspector_name text not null,
  inspection_date date not null,
  handover_batch text not null default '',
  remarks text not null default '',
  total_items integer not null default 0,
  pass_count integer not null default 0,
  fail_count integer not null default 0,
  pending_count integer not null default 0,
  na_count integer not null default 0,
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.submission_items (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  source_key text not null,
  item_id text not null,
  sheet_name text not null,
  category text not null default '',
  element text not null default '',
  target_location text not null default '',
  status text not null default '',
  notes text not null default ''
);

create table if not exists public.submission_item_photos (
  id uuid primary key default gen_random_uuid(),
  submission_item_id uuid not null references public.submission_items(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  photo_url text not null,
  position integer not null default 0
);

create index if not exists idx_submission_items_submission_id on public.submission_items(submission_id);
create index if not exists idx_submission_items_source_key on public.submission_items(source_key);
create index if not exists idx_submission_item_photos_submission_item_id on public.submission_item_photos(submission_item_id);

alter table public.submissions enable row level security;
alter table public.submission_items enable row level security;
alter table public.submission_item_photos enable row level security;

drop policy if exists "public can insert submissions" on public.submissions;
create policy "public can insert submissions"
on public.submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated can read submissions" on public.submissions;
create policy "authenticated can read submissions"
on public.submissions
for select
to authenticated
using (true);

drop policy if exists "public can insert submission items" on public.submission_items;
create policy "public can insert submission items"
on public.submission_items
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated can read submission items" on public.submission_items;
create policy "authenticated can read submission items"
on public.submission_items
for select
to authenticated
using (true);

drop policy if exists "public can insert submission item photos" on public.submission_item_photos;
create policy "public can insert submission item photos"
on public.submission_item_photos
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated can read submission item photos" on public.submission_item_photos;
create policy "authenticated can read submission item photos"
on public.submission_item_photos
for select
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('submission-photos', 'submission-photos', true)
on conflict (id) do nothing;

drop policy if exists "public can upload submission photos" on storage.objects;
create policy "public can upload submission photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'submission-photos');

drop policy if exists "public can view submission photos" on storage.objects;
create policy "public can view submission photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'submission-photos');
