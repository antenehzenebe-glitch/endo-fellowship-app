-- Convert procedure_type from a fixed enum to an APD-editable catalog table,
-- so staff can add or retire procedures (DXA, insulin pump, ...) without a
-- schema migration. Tables verified empty at conversion time.
-- ✅ APPLIED to production on 2026-06-12 via MCP. Repo record — do not re-run.

create table if not exists public.procedure_types (
  code        text primary key,              -- short stable code, e.g. 'FNA'
  label       text not null,                 -- display name
  is_active   boolean not null default true, -- retire instead of delete
  sort_order  integer not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_procedure_types_updated_at on public.procedure_types;
create trigger trg_procedure_types_updated_at before update on public.procedure_types
  for each row execute function public.set_updated_at();

insert into public.procedure_types (code, label, sort_order) values
  ('FNA',        'Thyroid FNA',                10),
  ('THYROID_US', 'Thyroid Ultrasound',         20),
  ('CGM_INTERP', 'CGM Interpretation',         30),
  ('DXA_INTERP', 'DXA Interpretation',         40),
  ('PUMP_MGMT',  'Insulin Pump Management',    50)
on conflict (code) do nothing;

alter table public.procedure_logs
  alter column procedure_type type text using procedure_type::text;
alter table public.procedure_logs
  add constraint procedure_logs_type_fk
  foreign key (procedure_type) references public.procedure_types(code);

alter table public.procedure_targets
  alter column procedure_type type text using procedure_type::text;
alter table public.procedure_targets
  add constraint procedure_targets_type_fk
  foreign key (procedure_type) references public.procedure_types(code) on delete cascade;

drop type if exists public.procedure_type;

alter table public.procedure_types enable row level security;
create policy ptypes_select on public.procedure_types for select
  using (is_active or public.is_staff());
create policy ptypes_write on public.procedure_types for all
  using (public.is_staff()) with check (public.is_staff());

-- Program minimums: 5 of each, per APD (2026-06-12). APD-editable in
-- procedure_targets.min_total.
insert into public.procedure_targets (procedure_type, min_total) values
  ('FNA', 5), ('THYROID_US', 5), ('CGM_INTERP', 5), ('DXA_INTERP', 5), ('PUMP_MGMT', 5)
on conflict (procedure_type) do update set min_total = excluded.min_total;
