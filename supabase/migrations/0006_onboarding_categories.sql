-- Migration: 0006_onboarding_categories
-- Splits per-fellow checklist items into two groups via a `category` column on
-- public.onboarding_tasks:
--   'onboarding' -> Institutional Onboarding (incoming-fellow must-clear items)
--   'training'   -> Training & Development Milestones (ongoing formative items)
-- Existing rows (the original 6 items) are backfilled to 'training'. The
-- institutional-onboarding rows are per-fellow SEED DATA and are inserted
-- separately (not in this migration).
begin;

alter table public.onboarding_tasks add column if not exists category text;
update public.onboarding_tasks set category = 'training' where category is null;
alter table public.onboarding_tasks alter column category set default 'onboarding';
alter table public.onboarding_tasks alter column category set not null;
do $$ begin
  alter table public.onboarding_tasks
    add constraint onboarding_tasks_category_chk check (category in ('onboarding','training'));
exception when duplicate_object then null; end $$;

commit;
