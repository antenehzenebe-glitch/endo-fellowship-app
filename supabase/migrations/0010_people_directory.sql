-- 0010_people_directory.sql
-- Public-facing program directory for the Showcase / People layer. Distinct from
-- public.profiles (auth-linked operational rows): these are curated marketing
-- bios with photos, published independently via is_published. Optional profile_id
-- links a person to their auth profile. Staff (is_staff()) manage; anon/auth read
-- only published rows.
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('faculty','fellow','staff')),
  full_name text not null,
  credentials text,
  role_title text,
  bio text,
  photo_path text,
  email text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people enable row level security;

drop trigger if exists set_people_updated_at on public.people;
create trigger set_people_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

drop policy if exists "people read published" on public.people;
create policy "people read published"
  on public.people for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "people staff all" on public.people;
create policy "people staff all"
  on public.people for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create index if not exists people_published_sort_idx
  on public.people (is_published, sort_order);
