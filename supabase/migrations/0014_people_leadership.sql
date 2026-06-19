-- 0014_people_leadership.sql
-- Adds a leadership flag to the public people directory. Program leadership
-- (Chief / PD / APD / Coordinator) render in the Overview "Program leadership"
-- strip and the People-tab "Leadership" group. Orthogonal to `category`
-- (faculty/fellow/staff): the coordinator is category='staff' yet is leadership.
alter table public.people
  add column if not exists is_leadership boolean not null default false;

comment on column public.people.is_leadership is
  'Program leadership (PD/APD/Chief/Coordinator). Drives the Overview leadership strip and People-tab Leadership group. Orthogonal to category.';

create index if not exists people_leadership_sort_idx
  on public.people (is_leadership, sort_order);
