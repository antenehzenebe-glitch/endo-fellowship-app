-- 0015_module_system.sql
-- Educational module system: modules + program_videos + module_progress,
-- plus a private 'program-videos' storage bucket for clip files.
--
-- Mirrors the resources / resource_acknowledgments pattern. Role gating uses
-- the existing SQL helpers: is_staff() = pd/apd/coordinator/admin.
--   - modules / program_videos:  read = any signed-in user (active rows) or
--     staff (all rows);  write = staff only.
--   - module_progress:  a fellow inserts/updates only their OWN, un-attested
--     row;  only staff can set attestation;  staff can see/delete all.
-- All reads are scoped `to authenticated`, so content is genuinely behind login.
--
-- NOTE: This migration was authored after the equivalent statements were applied
-- to the live database via the Supabase migration ledger (migrations
-- "module_system_tables" + "module_videos_storage"). It is written idempotently
-- so re-running it is safe and so the migrations folder reflects live state.

-- ============================================================ modules
create table if not exists public.modules (
  id                    uuid primary key default gen_random_uuid(),
  key                   text not null unique,
  title                 text not null,
  subtitle              text,
  description           text,
  lecture_resource_id   uuid references public.resources(id) on delete set null,
  pass_pct              integer not null default 80,
  requires_attestation  boolean not null default false,
  is_active             boolean not null default true,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
alter table public.modules enable row level security;
grant select, insert, update, delete on public.modules to authenticated;

drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules
  for select to authenticated
  using (is_active or public.is_staff());

drop policy if exists modules_write on public.modules;
create policy modules_write on public.modules
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop trigger if exists set_updated_at on public.modules;
create trigger set_updated_at before update on public.modules
  for each row execute function public.set_updated_at();

-- ============================================================ program_videos
create table if not exists public.program_videos (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid references public.modules(id) on delete set null,
  title            text not null,
  description      text,
  storage_path     text,
  external_url     text,
  poster_path      text,
  duration_seconds integer,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.program_videos enable row level security;
grant select, insert, update, delete on public.program_videos to authenticated;

drop policy if exists program_videos_select on public.program_videos;
create policy program_videos_select on public.program_videos
  for select to authenticated
  using (is_active or public.is_staff());

drop policy if exists program_videos_write on public.program_videos;
create policy program_videos_write on public.program_videos
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop trigger if exists set_updated_at on public.program_videos;
create trigger set_updated_at before update on public.program_videos
  for each row execute function public.set_updated_at();

-- ============================================================ module_progress
create table if not exists public.module_progress (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  fellow_id    uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz not null default now(),
  quiz_score   integer,
  quiz_total   integer,
  attested_by  uuid references public.profiles(id) on delete set null,
  attested_at  timestamptz,
  unique (module_id, fellow_id)
);
alter table public.module_progress enable row level security;
grant select, insert, update, delete on public.module_progress to authenticated;

-- Own row OR staff may read.
drop policy if exists module_progress_select on public.module_progress;
create policy module_progress_select on public.module_progress
  for select to authenticated
  using ((fellow_id = auth.uid()) or public.is_staff());

-- A fellow may insert only their OWN, un-attested completion; staff may insert any.
drop policy if exists module_progress_insert on public.module_progress;
create policy module_progress_insert on public.module_progress
  for insert to authenticated
  with check (
    ((fellow_id = auth.uid()) and attested_by is null and attested_at is null)
    or public.is_staff()
  );

-- A fellow may update their own row but cannot set attestation; staff may do anything.
drop policy if exists module_progress_update on public.module_progress;
create policy module_progress_update on public.module_progress
  for update to authenticated
  using ((fellow_id = auth.uid()) or public.is_staff())
  with check (
    ((fellow_id = auth.uid()) and attested_by is null and attested_at is null)
    or public.is_staff()
  );

-- Only staff may delete a completion record.
drop policy if exists module_progress_delete on public.module_progress;
create policy module_progress_delete on public.module_progress
  for delete to authenticated
  using (public.is_staff());

-- ============================================================ storage: program-videos
-- Private bucket; clips are served to signed-in users via short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('program-videos', 'program-videos', false)
on conflict (id) do nothing;

drop policy if exists program_videos_read on storage.objects;
create policy program_videos_read on storage.objects
  for select to authenticated
  using (bucket_id = 'program-videos');

drop policy if exists program_videos_manage on storage.objects;
create policy program_videos_manage on storage.objects
  for all to authenticated
  using (bucket_id = 'program-videos' and public.is_staff())
  with check (bucket_id = 'program-videos' and public.is_staff());

-- ============================================================ ROLLBACK
-- To reverse this migration, run:
--
-- drop policy if exists program_videos_manage on storage.objects;
-- drop policy if exists program_videos_read   on storage.objects;
-- delete from storage.buckets where id = 'program-videos';
-- drop table if exists public.module_progress;
-- drop table if exists public.program_videos;
-- drop table if exists public.modules;
