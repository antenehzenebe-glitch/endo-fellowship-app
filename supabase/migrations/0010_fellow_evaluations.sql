-- 0008: narrative fellow evaluations (period-based: mid-year / end-of-year).
-- Clean, purpose-built table separate from the form-engine `evaluations` table.
-- Authors: attendings + PD/APD/admin (NOT coordinator, NOT fellows).
-- Visibility: leadership (is_staff) see all; an attending sees own-authored;
--             a fellow sees only their OWN FINALIZED evaluations.

-- who may author an evaluation (excludes coordinator + fellow)
create or replace function public.can_author_eval()
  returns boolean language sql stable security definer set search_path to 'public'
as $$
  select coalesce((select role in ('attending','pd','apd','admin')
                   from public.profiles where id = auth.uid()), false);
$$;

create table if not exists public.fellow_evaluations (
  id            uuid primary key default gen_random_uuid(),
  fellow_id     uuid not null references public.profiles(id) on delete cascade,
  evaluator_id  uuid not null references public.profiles(id) on delete cascade,
  period        public.eval_period not null,
  academic_year text not null,
  overall_rating text not null check (overall_rating in ('below','at','above')),
  narrative     text not null,
  status        text not null default 'draft' check (status in ('draft','final')),
  finalized_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (fellow_id, evaluator_id, period, academic_year)
);

create index if not exists fellow_evaluations_fellow_idx    on public.fellow_evaluations(fellow_id);
create index if not exists fellow_evaluations_evaluator_idx on public.fellow_evaluations(evaluator_id);

alter table public.fellow_evaluations enable row level security;

create policy fellow_evaluations_select on public.fellow_evaluations
  for select to authenticated
  using (
    public.is_staff()
    or evaluator_id = auth.uid()
    or (fellow_id = auth.uid() and status = 'final')
  );

create policy fellow_evaluations_insert on public.fellow_evaluations
  for insert to authenticated
  with check ( public.can_author_eval() and evaluator_id = auth.uid() );

create policy fellow_evaluations_update on public.fellow_evaluations
  for update to authenticated
  using ( public.can_author_eval() and evaluator_id = auth.uid() )
  with check ( public.can_author_eval() and evaluator_id = auth.uid() );

create policy fellow_evaluations_delete on public.fellow_evaluations
  for delete to authenticated
  using ( evaluator_id = auth.uid() or public.is_staff() );
