-- Private bucket backing the resources catalog (Pillar 3).
-- ✅ APPLIED to production on 2026-06-12 via MCP. Repo record — do not re-run.

insert into storage.buckets (id, name, public) values ('resources','resources', false)
  on conflict (id) do nothing;

drop policy if exists "resources read (authenticated)" on storage.objects;
create policy "resources read (authenticated)" on storage.objects for select
  to authenticated using (bucket_id = 'resources');

drop policy if exists "resources insert (staff)" on storage.objects;
create policy "resources insert (staff)" on storage.objects for insert
  to authenticated with check (bucket_id = 'resources' and public.is_staff());

drop policy if exists "resources update (staff)" on storage.objects;
create policy "resources update (staff)" on storage.objects for update
  to authenticated using (bucket_id = 'resources' and public.is_staff())
  with check (bucket_id = 'resources' and public.is_staff());

drop policy if exists "resources delete (staff)" on storage.objects;
create policy "resources delete (staff)" on storage.objects for delete
  to authenticated using (bucket_id = 'resources' and public.is_staff());

-- ROLLBACK:
-- drop policy if exists "resources read (authenticated)" on storage.objects;
-- drop policy if exists "resources insert (staff)" on storage.objects;
-- drop policy if exists "resources update (staff)" on storage.objects;
-- drop policy if exists "resources delete (staff)" on storage.objects;
-- delete from storage.buckets where id = 'resources';
