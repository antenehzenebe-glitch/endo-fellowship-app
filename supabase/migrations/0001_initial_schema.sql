-- ✅ APPLIED to production (project xousmzkftledlkwtpavb) on 2026-06-12 via MCP.
-- Repo record — do not re-run against the live database.

-- =============================================================================
-- Migration: 0001_initial_schema  (v2 — rewritten after scope audit)
-- Project:   HUH Endocrinology Fellowship App  (internal program tool)
--
-- WHAT THIS IS: a small, local tool for the Howard University Hospital
-- Endocrinology fellowship to (1) run program evaluations, (2) track fellow
-- progress, and (3) hold education & policy materials in one place. It is NOT a
-- replacement for institutional/ACGME systems (New Innovations, etc.) and does
-- NOT submit to ACGME. It is the program's day-to-day working copy.
--
-- PRIVACY POSTURE: NO PHI. Procedure logs are de-identified by design — no
-- patient name, MRN, or DOB columns exist, and none should be added. The
-- sensitive data here is FELLOW educational records; RLS isolates fellows from
-- one another and gates staff access. Keeping PHI out keeps this app out of
-- HIPAA scope entirely.
--
-- SCALE: ~2-6 fellows + a handful of faculty + 1 APD/coordinator. Lifetime row
-- counts are in the hundreds. Indexes below are for correctness/clarity, not
-- for load that will never arrive. No pagination/offline machinery here.
--
-- Run in the Supabase SQL Editor. Rollback block at the bottom.
-- =============================================================================

begin;

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enumerated types
-- -----------------------------------------------------------------------------
do $$ begin create type public.user_role as enum ('fellow','attending','pd','apd','coordinator','admin'); exception when duplicate_object then null; end $$;
-- If 0001 was already run, add the role instead of recreating the type:
--   alter type public.user_role add value if not exists 'pd' after 'attending';
do $$ begin create type public.pgy_level as enum ('PGY-4','PGY-5'); exception when duplicate_object then null; end $$;
do $$ begin create type public.procedure_type as enum ('FNA','THYROID_US','CGM_INTERP'); exception when duplicate_object then null; end $$;
do $$ begin create type public.procedure_outcome as enum ('successful','learning','incomplete'); exception when duplicate_object then null; end $$;
do $$ begin create type public.task_status as enum ('pending','in_progress','completed'); exception when duplicate_object then null; end $$;
do $$ begin
  create type public.acgme_competency as enum (
    'patient_care','medical_knowledge','interpersonal_communication',
    'professionalism','systems_based_practice','practice_based_learning','personal_improvement');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.evaluation_type as enum (
    'faculty_of_fellow','fellow_of_faculty','rotation','self','360','program');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.resource_category as enum (
    'policy','curriculum','didactic','onboarding','board_prep','form','other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.scholarly_type as enum (
    'qi_project','abstract','publication','poster','lecture','presentation','other');
exception when duplicate_object then null; end $$;
do $$ begin create type public.scholarly_status as enum ('planned','in_progress','completed'); exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- (Role helpers is_staff()/is_evaluator() are defined just after the profiles
--  table below, since SQL functions are validated against existing objects.)

-- =============================================================================
-- IDENTITY
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'fellow',
  full_name   text not null,
  email       text,
  pgy_level   public.pgy_level,            -- fellows only
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_pgy_role_chk check (
    (role = 'fellow' and pgy_level is not null) or
    (role <> 'fellow' and pgy_level is null))
);
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER avoids recursive RLS when policies read the caller's role.
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('pd','apd','coordinator','admin')
                   from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_evaluator() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('attending','pd','apd','coordinator','admin')
                   from public.profiles where id = auth.uid()), false);
$$;

-- Block role escalation: only staff may change a profile's role.
create or replace function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_staff() then
    raise exception 'Only program staff may change a user role';
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_profile_role on public.profiles;
create trigger trg_guard_profile_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- =============================================================================
-- PILLAR 1 - PROGRESS TRACKING
-- =============================================================================

-- De-identified procedure log. NO patient identifiers - by design.
create table if not exists public.procedure_logs (
  id                       uuid primary key default gen_random_uuid(),
  fellow_id                uuid not null references public.profiles(id) on delete cascade,
  procedure_type           public.procedure_type not null,
  date_performed           date not null,
  outcome                  public.procedure_outcome not null default 'successful',
  supervising_attending_id uuid references public.profiles(id) on delete set null,
  notes                    text,    -- teaching notes only; no PHI
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint procedure_date_not_future check (date_performed <= current_date)
);
drop trigger if exists trg_procedure_logs_updated_at on public.procedure_logs;
create trigger trg_procedure_logs_updated_at before update on public.procedure_logs
  for each row execute function public.set_updated_at();
create index if not exists idx_procedure_logs_fellow on public.procedure_logs(fellow_id, date_performed desc);

-- Program-set procedural minimums for graduation readiness (APD-editable).
create table if not exists public.procedure_targets (
  procedure_type public.procedure_type primary key,
  min_total      integer not null check (min_total >= 0),
  updated_at     timestamptz not null default now()
);
drop trigger if exists trg_procedure_targets_updated_at on public.procedure_targets;
create trigger trg_procedure_targets_updated_at before update on public.procedure_targets
  for each row execute function public.set_updated_at();

-- Longitudinal in-training exam scores (entered by program staff).
create table if not exists public.ite_scores (
  id            uuid primary key default gen_random_uuid(),
  fellow_id     uuid not null references public.profiles(id) on delete cascade,
  exam_year     integer not null,
  percentile    integer check (percentile between 0 and 100),
  scaled_score  integer,
  notes         text,
  created_at    timestamptz not null default now(),
  unique (fellow_id, exam_year)
);
create index if not exists idx_ite_fellow on public.ite_scores(fellow_id);

-- Scholarly activity: QI projects (ongoing) and deliverables (abstracts, etc.).
create table if not exists public.scholarly_activities (
  id            uuid primary key default gen_random_uuid(),
  fellow_id     uuid not null references public.profiles(id) on delete cascade,
  activity_type public.scholarly_type not null,
  title         text not null,
  status        public.scholarly_status not null default 'in_progress',
  started_on    date,
  completed_on  date,
  details       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_scholarly_updated_at on public.scholarly_activities;
create trigger trg_scholarly_updated_at before update on public.scholarly_activities
  for each row execute function public.set_updated_at();
create index if not exists idx_scholarly_fellow on public.scholarly_activities(fellow_id);

-- =============================================================================
-- PILLAR 2 - EVALUATIONS
-- Two complementary pieces:
--  (a) milestone_assessments - structured ACGME competency data the graduation
--      dashboard aggregates over time.
--  (b) evaluation_forms + evaluations - flexible forms (rotation, 360, faculty,
--      program) for actually RUNNING evaluations: assign -> track -> complete.
-- =============================================================================

create table if not exists public.milestone_assessments (
  id              uuid primary key default gen_random_uuid(),
  fellow_id       uuid not null references public.profiles(id) on delete cascade,
  attending_id    uuid not null references public.profiles(id) on delete set null,
  competency      public.acgme_competency not null,
  sub_competency  text,                      -- e.g. 'PC2'
  level           numeric(2,1) not null,     -- ACGME 1.0-5.0, half-steps only
  comments        text,
  assessment_date date not null default current_date,
  academic_year   text,                      -- e.g. '2025-2026'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint milestone_level_range_chk check (level >= 1.0 and level <= 5.0),
  constraint milestone_level_halfstep_chk check ((level * 2) = floor(level * 2))
);
drop trigger if exists trg_milestone_updated_at on public.milestone_assessments;
create trigger trg_milestone_updated_at before update on public.milestone_assessments
  for each row execute function public.set_updated_at();
create index if not exists idx_milestone_fellow on public.milestone_assessments(fellow_id, competency);

-- Reusable form definition. `questions` is JSONB so the APD can define forms
-- without schema changes - appropriate at this scale.
create table if not exists public.evaluation_forms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  type        public.evaluation_type not null,
  questions   jsonb not null default '[]'::jsonb,
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_eval_forms_updated_at on public.evaluation_forms;
create trigger trg_eval_forms_updated_at before update on public.evaluation_forms
  for each row execute function public.set_updated_at();

-- One assignment/instance of a form: who evaluates whom, for what period.
-- subject_id is null for program-level evaluations.
create table if not exists public.evaluations (
  id            uuid primary key default gen_random_uuid(),
  form_id       uuid not null references public.evaluation_forms(id) on delete restrict,
  evaluator_id  uuid not null references public.profiles(id) on delete cascade,
  subject_id    uuid references public.profiles(id) on delete cascade,
  period_label  text,                        -- e.g. 'Block 5 - 2025-2026'
  status        public.task_status not null default 'pending',
  responses     jsonb not null default '{}'::jsonb,
  due_date      date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_evaluations_updated_at on public.evaluations;
create trigger trg_evaluations_updated_at before update on public.evaluations
  for each row execute function public.set_updated_at();
create index if not exists idx_evaluations_evaluator on public.evaluations(evaluator_id, status);
create index if not exists idx_evaluations_subject   on public.evaluations(subject_id);

-- =============================================================================
-- PILLAR 3 - EDUCATION & POLICY MATERIALS  (replaces paper files)
-- Files live in a Supabase Storage bucket; this table is the catalog. Use
-- either storage_path (uploaded file) or external_url (link).
-- =============================================================================
create table if not exists public.resources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category      public.resource_category not null default 'other',
  storage_path  text,                 -- path within the 'resources' storage bucket
  external_url  text,                 -- alternative: link out
  file_type     text,                 -- e.g. 'application/pdf'
  requires_ack  boolean not null default false,  -- e.g. policies fellows must read
  is_active     boolean not null default true,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint resource_has_source check (storage_path is not null or external_url is not null)
);
drop trigger if exists trg_resources_updated_at on public.resources;
create trigger trg_resources_updated_at before update on public.resources
  for each row execute function public.set_updated_at();
create index if not exists idx_resources_category on public.resources(category) where is_active;

-- "Has every fellow acknowledged the new policy?" - compliance, low cost.
create table if not exists public.resource_acknowledgments (
  id              uuid primary key default gen_random_uuid(),
  resource_id     uuid not null references public.resources(id) on delete cascade,
  fellow_id       uuid not null references public.profiles(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique (resource_id, fellow_id)
);
create index if not exists idx_ack_resource on public.resource_acknowledgments(resource_id);

-- Per-fellow onboarding checklist.
create table if not exists public.onboarding_tasks (
  id            uuid primary key default gen_random_uuid(),
  fellow_id     uuid not null references public.profiles(id) on delete cascade,
  task_name     text not null,
  description   text,
  status        public.task_status not null default 'pending',
  due_date      date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_onboarding_updated_at on public.onboarding_tasks;
create trigger trg_onboarding_updated_at before update on public.onboarding_tasks
  for each row execute function public.set_updated_at();
create index if not exists idx_onboarding_fellow on public.onboarding_tasks(fellow_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles               enable row level security;
alter table public.procedure_logs         enable row level security;
alter table public.procedure_targets      enable row level security;
alter table public.ite_scores             enable row level security;
alter table public.scholarly_activities   enable row level security;
alter table public.milestone_assessments  enable row level security;
alter table public.evaluation_forms       enable row level security;
alter table public.evaluations            enable row level security;
alter table public.resources              enable row level security;
alter table public.resource_acknowledgments enable row level security;
alter table public.onboarding_tasks       enable row level security;

-- profiles: any authenticated user may read the roster (names/roles — an
-- internal directory; sensitive data lives in other tables). Provisioning is
-- staff-only; role changes are blocked by trg_guard_profile_role.
create policy profiles_select on public.profiles for select using (true);
create policy profiles_insert_staff on public.profiles for insert with check (public.is_staff());
create policy profiles_update_self_or_staff on public.profiles for update
  using (id = auth.uid() or public.is_staff()) with check (id = auth.uid() or public.is_staff());

-- procedure_logs: fellow owns; supervising attending reads; staff read/delete.
create policy proc_select on public.procedure_logs for select
  using (fellow_id = auth.uid() or supervising_attending_id = auth.uid() or public.is_staff());
create policy proc_insert on public.procedure_logs for insert with check (fellow_id = auth.uid());
create policy proc_update on public.procedure_logs for update
  using (fellow_id = auth.uid()) with check (fellow_id = auth.uid());
create policy proc_delete on public.procedure_logs for delete
  using (fellow_id = auth.uid() or public.is_staff());

-- procedure_targets: everyone reads; staff manage.
create policy targets_select on public.procedure_targets for select using (true);
create policy targets_write  on public.procedure_targets for all
  using (public.is_staff()) with check (public.is_staff());

-- ite_scores: fellow reads own; staff manage.
create policy ite_select on public.ite_scores for select using (fellow_id = auth.uid() or public.is_staff());
create policy ite_write  on public.ite_scores for all using (public.is_staff()) with check (public.is_staff());

-- scholarly_activities: fellow owns; staff read all.
create policy sch_select on public.scholarly_activities for select using (fellow_id = auth.uid() or public.is_staff());
create policy sch_insert on public.scholarly_activities for insert with check (fellow_id = auth.uid());
create policy sch_update on public.scholarly_activities for update using (fellow_id = auth.uid() or public.is_staff()) with check (fellow_id = auth.uid() or public.is_staff());
create policy sch_delete on public.scholarly_activities for delete using (fellow_id = auth.uid() or public.is_staff());

-- milestone_assessments: subject fellow + author + staff read; evaluators author.
create policy ms_select on public.milestone_assessments for select
  using (fellow_id = auth.uid() or attending_id = auth.uid() or public.is_staff());
create policy ms_insert on public.milestone_assessments for insert
  with check (attending_id = auth.uid() and public.is_evaluator());
create policy ms_update on public.milestone_assessments for update
  using (attending_id = auth.uid() or public.is_staff()) with check (attending_id = auth.uid() or public.is_staff());
create policy ms_delete on public.milestone_assessments for delete
  using (attending_id = auth.uid() or public.is_staff());

-- evaluation_forms: everyone reads active forms; staff manage.
create policy forms_select on public.evaluation_forms for select using (is_active or public.is_staff());
create policy forms_write  on public.evaluation_forms for all using (public.is_staff()) with check (public.is_staff());

-- evaluations: evaluator owns their instance; subject sees completed ones about
-- them; staff see all. (For blinded evals, drop the subject_id clause.)
create policy eval_select on public.evaluations for select
  using (evaluator_id = auth.uid()
         or (subject_id = auth.uid() and status = 'completed')
         or public.is_staff());
create policy eval_insert on public.evaluations for insert
  with check (public.is_staff() or evaluator_id = auth.uid());
create policy eval_update on public.evaluations for update
  using (evaluator_id = auth.uid() or public.is_staff())
  with check (evaluator_id = auth.uid() or public.is_staff());
create policy eval_delete on public.evaluations for delete using (public.is_staff());

-- resources: any authenticated user reads active materials; staff manage.
create policy res_select on public.resources for select using (is_active or public.is_staff());
create policy res_write  on public.resources for all using (public.is_staff()) with check (public.is_staff());

-- acknowledgments: fellow records/reads own; staff read all.
create policy ack_select on public.resource_acknowledgments for select using (fellow_id = auth.uid() or public.is_staff());
create policy ack_insert on public.resource_acknowledgments for insert with check (fellow_id = auth.uid());

-- onboarding_tasks: fellow reads/updates own; staff manage.
create policy onb_select on public.onboarding_tasks for select using (fellow_id = auth.uid() or public.is_staff());
create policy onb_insert on public.onboarding_tasks for insert with check (public.is_staff());
create policy onb_update on public.onboarding_tasks for update using (fellow_id = auth.uid() or public.is_staff()) with check (fellow_id = auth.uid() or public.is_staff());
create policy onb_delete on public.onboarding_tasks for delete using (public.is_staff());

commit;

-- =============================================================================
-- SUPABASE STORAGE (run after creating a private bucket named 'resources').
-- =============================================================================
-- insert into storage.buckets (id, name, public) values ('resources','resources', false)
--   on conflict (id) do nothing;
-- create policy "resources read (authenticated)" on storage.objects for select
--   to authenticated using (bucket_id = 'resources');
-- create policy "resources write (staff)" on storage.objects for insert
--   to authenticated with check (bucket_id = 'resources' and public.is_staff());
-- create policy "resources manage (staff)" on storage.objects for all
--   to authenticated using (bucket_id = 'resources' and public.is_staff());

-- =============================================================================
-- BOOTSTRAP: the first APD account can't be created under RLS (insert is
-- staff-only). Create it once via the Supabase SQL editor (service role bypasses
-- RLS), then that APD provisions everyone else:
--   insert into public.profiles (id, role, full_name, email)
--   values ('<auth-user-uuid>', 'apd', 'Program Director', 'apd@example.org');
-- =============================================================================

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- begin;
--   drop table if exists public.resource_acknowledgments, public.resources,
--     public.onboarding_tasks, public.evaluations, public.evaluation_forms,
--     public.milestone_assessments, public.scholarly_activities, public.ite_scores,
--     public.procedure_targets, public.procedure_logs, public.profiles cascade;
--   drop function if exists public.guard_profile_role, public.is_evaluator,
--     public.is_staff, public.set_updated_at cascade;
--   drop type if exists public.scholarly_status, public.scholarly_type,
--     public.resource_category, public.evaluation_type, public.acgme_competency,
--     public.task_status, public.procedure_outcome, public.procedure_type,
--     public.pgy_level, public.user_role cascade;
-- commit;