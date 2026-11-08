-- Storage buckets.
-- cvs: private, PDF only, 5 MB. Each participant writes only inside a folder named after their user id.
-- public-media: sponsor logos and judge/mentor photos. Public read, admin write.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('cvs', 'cvs', false, 5242880, array['application/pdf']),
  ('public-media', 'public-media', true, 2097152, array['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy cvs_own on storage.objects for all to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy cvs_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and public.is_admin());

create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and public.is_admin())
  with check (bucket_id = 'public-media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());
