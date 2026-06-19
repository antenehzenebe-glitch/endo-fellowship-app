-- 0005_program_schedule.sql
-- Staff-editable program schedule: weekly educational template + block/rotation matrix.
-- De-identified PROGRAM data only (rotation names, dates, times) — no PHI.
-- Read: any signed-in user. Write: staff only (is_staff()).

create table if not exists public.program_schedule (
  id            text primary key default 'current',
  academic_year text not null default '2026-2027',
  config        jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.profiles(id),
  constraint program_schedule_singleton check (id = 'current')
);

alter table public.program_schedule enable row level security;

drop policy if exists "program_schedule_read" on public.program_schedule;
create policy "program_schedule_read"
  on public.program_schedule for select
  to authenticated
  using (true);

drop policy if exists "program_schedule_staff_insert" on public.program_schedule;
create policy "program_schedule_staff_insert"
  on public.program_schedule for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "program_schedule_staff_update" on public.program_schedule;
create policy "program_schedule_staff_update"
  on public.program_schedule for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

insert into public.program_schedule (id, academic_year, config)
values (
  'current',
  '2026-2027',
  $json$
  {
    "version": 1,
    "weekly": [
      { "id": "w1", "activity": "Continuity Clinic", "days": ["Mon","Tue","Thu"], "start": "08:30", "end": "12:00", "kind": "clinic" },
      { "id": "w2", "activity": "Didactics & Division Meeting", "days": ["Wed","Fri"], "start": "10:00", "end": "12:00", "kind": "didactic", "note": "Division meeting — first week of the month" },
      { "id": "w3", "activity": "CGM & Insulin Pump Review", "days": ["Thu"], "start": "13:00", "end": "14:00", "kind": "training" },
      { "id": "w4", "activity": "Thyroid US & FNA Training", "days": ["Fri"], "start": "13:00", "end": "15:00", "kind": "training" },
      { "id": "w5", "activity": "Friday Fellows' Lecture (Dr. Zenebe)", "days": ["Fri"], "start": "13:00", "end": "15:00", "kind": "lecture" }
    ],
    "rotations": [
      "Inpatient Consults", "Ambulatory", "Diabetes", "Thyroid / Nuclear",
      "Bone & Mineral", "Reproductive / Pituitary", "Research / Scholarly", "Elective: Pediatric Endo"
    ],
    "fellows": [
      { "id": "beg",     "name": "Sofia Beg, MD",     "pgy": "PGY-5" },
      { "id": "khan",    "name": "Rumana Khan, MD",   "pgy": "PGY-5" },
      { "id": "adeleye", "name": "Folake Adeleye, MD", "pgy": "PGY-4" }
    ],
    "blocks": []
  }
  $json$::jsonb
)
on conflict (id) do nothing;
