-- =============================================================================
-- Migration: 0005_eval_periods
-- Adds structured mid-year / end-of-year checkpoints to evaluations so the staff
-- dashboard (PD / APD / Chief) can show a semiannual evaluation summary.
-- Additive + idempotent. Applied to production 2026-06-17.
-- =============================================================================
begin;

do $$ begin
  create type public.eval_period as enum ('mid_year','end_of_year');
exception when duplicate_object then null; end $$;

alter table public.evaluations
  add column if not exists period public.eval_period,
  add column if not exists academic_year text;  -- e.g. '2026-2027'

create index if not exists idx_evaluations_subject_period
  on public.evaluations(subject_id, period);

commit;

-- Rollback:
-- begin;
--   drop index if exists public.idx_evaluations_subject_period;
--   alter table public.evaluations drop column if exists academic_year;
--   alter table public.evaluations drop column if exists period;
--   drop type if exists public.eval_period;
-- commit;
