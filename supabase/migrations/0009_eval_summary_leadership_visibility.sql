-- 0009: Evaluation Summary = the program's communication of the New Innovations review.
-- Authoring + full visibility = PD, APD, Division Chief (admin). Coordinator and
-- attendings no longer author, edit, delete, or read summaries. Each fellow sees only
-- her own FINAL summary. The official evaluation of record remains in New Innovations.

-- 1) Narrow authorship to the leadership trio (PD, APD, Chief).
--    INSERT and UPDATE policies already reference can_author_eval() and inherit this.
create or replace function public.can_author_eval()
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select coalesce((select role in ('pd','apd','admin')
                   from public.profiles where id = auth.uid()), false);
$function$;

-- 2) Visibility: leadership trio sees all; a fellow sees only her own final summary.
drop policy if exists fellow_evaluations_select on public.fellow_evaluations;
create policy fellow_evaluations_select
  on public.fellow_evaluations
  for select
  to authenticated
  using (
    can_author_eval()
    or (fellow_id = auth.uid() and status = 'final')
  );

-- 3) Deletion: leadership trio only (removes coordinator's prior is_staff() access).
drop policy if exists fellow_evaluations_delete on public.fellow_evaluations;
create policy fellow_evaluations_delete
  on public.fellow_evaluations
  for delete
  to authenticated
  using (can_author_eval());
