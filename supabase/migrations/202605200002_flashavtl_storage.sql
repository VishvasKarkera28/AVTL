-- FlashAVTLStorage bucket and folder-prefix policies.
-- Run after 202605200001_initial_schema.sql because these policies use app_role
-- and public.current_user_has_role().

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'FlashAVTLStorage',
  'FlashAVTLStorage',
  false,
  524288000,
  array[
    'application/pdf',
    'application/json',
    'application/octet-stream',
    'application/zip',
    'application/gzip',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

create or replace function public.flashavtl_try_uuid(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  return value::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function public.flashavtl_storage_section(object_name text)
returns text
language sql
stable
set search_path = storage, public
as $$
  select (storage.foldername(object_name))[1];
$$;

create or replace function public.flashavtl_storage_org_id(object_name text)
returns uuid
language sql
stable
set search_path = storage, public
as $$
  select public.flashavtl_try_uuid((storage.foldername(object_name))[2]);
$$;

create or replace function public.flashavtl_storage_user_id(object_name text)
returns uuid
language sql
stable
set search_path = storage, public
as $$
  select public.flashavtl_try_uuid((storage.foldername(object_name))[3]);
$$;

drop policy if exists "FlashAVTL bucket visible to authenticated users" on storage.buckets;
create policy "FlashAVTL bucket visible to authenticated users"
on storage.buckets
for select
to authenticated
using (id = 'FlashAVTLStorage');

drop policy if exists "FlashAVTL read permitted objects" on storage.objects;
create policy "FlashAVTL read permitted objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'FlashAVTLStorage'
  and (
    public.current_user_has_role(
      public.flashavtl_storage_org_id(name),
      array['platform_admin','owner','manager','staff','maintenance']::public.app_role[]
    )
    or (
      public.flashavtl_storage_section(name) = 'identity-evidence'
      and public.flashavtl_storage_user_id(name) = auth.uid()
    )
    or (
      public.flashavtl_storage_section(name) in ('damage-media','inspection-media')
      and public.current_user_has_role(
        public.flashavtl_storage_org_id(name),
        array['driver','customer']::public.app_role[]
      )
    )
    or (
      public.flashavtl_storage_section(name) = 'firmware-artifacts'
      and public.current_user_has_role(
        null,
        array['platform_admin']::public.app_role[]
      )
    )
  )
);

drop policy if exists "FlashAVTL upload permitted objects" on storage.objects;
create policy "FlashAVTL upload permitted objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'FlashAVTLStorage'
  and public.flashavtl_storage_section(name) in (
    'vehicle-documents',
    'damage-media',
    'identity-evidence',
    'inspection-media',
    'firmware-artifacts'
  )
  and (
    (
      public.flashavtl_storage_section(name) = 'vehicle-documents'
      and public.current_user_has_role(
        public.flashavtl_storage_org_id(name),
        array['platform_admin','owner','manager','staff','maintenance']::public.app_role[]
      )
    )
    or (
      public.flashavtl_storage_section(name) in ('damage-media','inspection-media')
      and public.current_user_has_role(
        public.flashavtl_storage_org_id(name),
        array['platform_admin','owner','manager','staff','driver','customer','maintenance']::public.app_role[]
      )
    )
    or (
      public.flashavtl_storage_section(name) = 'identity-evidence'
      and (
        public.flashavtl_storage_user_id(name) = auth.uid()
        or public.current_user_has_role(
          public.flashavtl_storage_org_id(name),
          array['platform_admin','owner','manager','staff']::public.app_role[]
        )
      )
    )
    or (
      public.flashavtl_storage_section(name) = 'firmware-artifacts'
      and public.current_user_has_role(
        null,
        array['platform_admin']::public.app_role[]
      )
    )
  )
);

drop policy if exists "FlashAVTL update owned or admin objects" on storage.objects;
create policy "FlashAVTL update owned or admin objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'FlashAVTLStorage'
  and (
    owner_id = auth.uid()::text
    or public.current_user_has_role(
      public.flashavtl_storage_org_id(name),
      array['platform_admin','owner','manager']::public.app_role[]
    )
    or (
      public.flashavtl_storage_section(name) = 'firmware-artifacts'
      and public.current_user_has_role(
        null,
        array['platform_admin']::public.app_role[]
      )
    )
  )
)
with check (
  bucket_id = 'FlashAVTLStorage'
  and public.flashavtl_storage_section(name) in (
    'vehicle-documents',
    'damage-media',
    'identity-evidence',
    'inspection-media',
    'firmware-artifacts'
  )
);

drop policy if exists "FlashAVTL delete owned or admin objects" on storage.objects;
create policy "FlashAVTL delete owned or admin objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'FlashAVTLStorage'
  and (
    owner_id = auth.uid()::text
    or public.current_user_has_role(
      public.flashavtl_storage_org_id(name),
      array['platform_admin','owner','manager']::public.app_role[]
    )
    or (
      public.flashavtl_storage_section(name) = 'firmware-artifacts'
      and public.current_user_has_role(
        null,
        array['platform_admin']::public.app_role[]
      )
    )
  )
);
