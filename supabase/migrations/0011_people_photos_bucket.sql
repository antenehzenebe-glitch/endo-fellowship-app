-- 0011_people_photos_bucket.sql
-- Public Storage bucket for program headshots used on the Showcase pages. Public
-- read (served via CDN URL); only staff (is_staff()) may upload/replace/delete.
insert into storage.buckets (id, name, public)
values ('people-photos', 'people-photos', true)
on conflict (id) do nothing;

drop policy if exists "people-photos staff manage" on storage.objects;
create policy "people-photos staff manage"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'people-photos' and public.is_staff())
  with check (bucket_id = 'people-photos' and public.is_staff());
