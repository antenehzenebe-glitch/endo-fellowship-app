-- 0007: scoped schedule editing.
-- Fellows on the Consult rotation build the monthly didactic calendar, so they
-- need UPDATE on program_schedule. The saveSchedule server action keeps a
-- fellow's write limited to config.months (block grid + settings are re-read
-- from the DB), so broadening the row-level policy here is safe.

-- helper: is the current user a fellow?
create or replace function public.is_fellow()
  returns boolean
  language sql
  stable
  security definer
  set search_path to 'public'
as $$
  select coalesce((select role = 'fellow' from public.profiles where id = auth.uid()), false);
$$;

-- replace the staff-only UPDATE policy with staff-or-fellow
drop policy if exists program_schedule_staff_update on public.program_schedule;

create policy program_schedule_update on public.program_schedule
  for update
  to authenticated
  using (public.is_staff() or public.is_fellow())
  with check (public.is_staff() or public.is_fellow());
