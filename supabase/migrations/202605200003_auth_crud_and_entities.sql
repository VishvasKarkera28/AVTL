-- Auth, authorization, entity creation, and storage metadata policies.
-- Run after:
-- 202605200001_initial_schema.sql
-- 202605200002_flashavtl_storage.sql

create table if not exists asset_types (
  id text primary key,
  label text not null,
  category text not null,
  description text,
  requires_registration boolean not null default true,
  supports_obd boolean not null default false,
  supports_ais boolean not null default false,
  created_at timestamptz not null default now()
);

insert into asset_types (id, label, category, description, supports_obd, supports_ais)
values
  ('truck', 'Truck', 'road', 'Commercial truck, tanker, lorry or logistics vehicle.', true, false),
  ('bus', 'Bus', 'road', 'Employee transport, school bus or passenger coach.', true, false),
  ('car', 'Car', 'road', 'Rental, pool, patrol or executive car.', true, false),
  ('bike', 'Bike', 'road', 'Two-wheeler rental, patrol or staff mobility vehicle.', false, false),
  ('van', 'Van', 'road', 'Delivery van, shuttle or service van.', true, false),
  ('ship', 'Ship', 'marine', 'Marine vessel, boat or coastal logistics asset.', false, true),
  ('equipment', 'Equipment', 'industrial', 'Generator, trailer, container, plant or yard equipment.', false, false)
on conflict (id) do update
set
  label = excluded.label,
  category = excluded.category,
  description = excluded.description,
  supports_obd = excluded.supports_obd,
  supports_ais = excluded.supports_ais;

create table if not exists user_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role app_role not null,
  branch_id uuid references branches(id) on delete set null,
  status text not null default 'pending',
  invited_by uuid references profiles(id) on delete set null,
  accepted_user_id uuid references profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email, role)
);

create table if not exists storage_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  bucket_id text not null default 'FlashAVTLStorage',
  object_path text not null,
  section text not null,
  entity_type text not null,
  entity_id uuid,
  uploaded_by uuid references profiles(id) on delete set null,
  content_type text,
  size_bytes bigint,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);

create index if not exists idx_user_invitations_org_status on user_invitations (organization_id, status);
create index if not exists idx_storage_files_org_section on storage_files (organization_id, section);

alter table asset_types enable row level security;
alter table user_invitations enable row level security;
alter table storage_files enable row level security;

drop policy if exists "asset types visible to authenticated users" on asset_types;
create policy "asset types visible to authenticated users"
on asset_types for select
to authenticated
using (true);

drop policy if exists "organizations insertable by platform admins" on organizations;
create policy "organizations insertable by platform admins"
on organizations for insert
to authenticated
with check (
  current_user_has_role(null, array['platform_admin']::app_role[])
);

drop policy if exists "organizations updateable by admins" on organizations;
create policy "organizations updateable by admins"
on organizations for update
to authenticated
using (
  current_user_has_role(id, array['platform_admin','owner']::app_role[])
)
with check (
  current_user_has_role(id, array['platform_admin','owner']::app_role[])
);

drop policy if exists "profiles insert own profile" on profiles;
create policy "profiles insert own profile"
on profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles update own or admin" on profiles;
create policy "profiles update own or admin"
on profiles for update
to authenticated
using (
  id = auth.uid()
  or current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
)
with check (
  id = auth.uid()
  or current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "branches insertable by organization admins" on branches;
create policy "branches insertable by organization admins"
on branches for insert
to authenticated
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "branches updateable by organization admins" on branches;
create policy "branches updateable by organization admins"
on branches for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "user roles manageable by admins" on user_roles;
create policy "user roles manageable by admins"
on user_roles for all
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "invitations visible to organization admins" on user_invitations;
create policy "invitations visible to organization admins"
on user_invitations for select
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

drop policy if exists "invitations insertable by admins" on user_invitations;
create policy "invitations insertable by admins"
on user_invitations for insert
to authenticated
with check (
  invited_by = auth.uid()
  and current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "invitations updateable by admins" on user_invitations;
create policy "invitations updateable by admins"
on user_invitations for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "vehicles insertable by fleet operators" on vehicles;
create policy "vehicles insertable by fleet operators"
on vehicles for insert
to authenticated
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  and exists (select 1 from asset_types at where at.id = vehicles.vehicle_type)
);

drop policy if exists "vehicles updateable by fleet operators" on vehicles;
create policy "vehicles updateable by fleet operators"
on vehicles for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
);

drop policy if exists "device records manageable by admins" on vehicle_devices;
create policy "device records manageable by admins"
on vehicle_devices for all
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

drop policy if exists "bookings insertable by rental operators" on bookings;
create policy "bookings insertable by rental operators"
on bookings for insert
to authenticated
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or customer_id = auth.uid()
);

drop policy if exists "bookings updateable by rental operators" on bookings;
create policy "bookings updateable by rental operators"
on bookings for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or customer_id = auth.uid()
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or customer_id = auth.uid()
);

drop policy if exists "trips insertable by operators and drivers" on trips;
create policy "trips insertable by operators and drivers"
on trips for insert
to authenticated
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or driver_id = auth.uid()
);

drop policy if exists "trips updateable by operators and assigned drivers" on trips;
create policy "trips updateable by operators and assigned drivers"
on trips for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or driver_id = auth.uid()
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or driver_id = auth.uid()
);

drop policy if exists "access grants insertable by access operators" on access_grants;
create policy "access grants insertable by access operators"
on access_grants for insert
to authenticated
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

drop policy if exists "access grants updateable by access operators" on access_grants;
create policy "access grants updateable by access operators"
on access_grants for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

drop policy if exists "damage reports insertable by permitted users" on damage_reports;
create policy "damage reports insertable by permitted users"
on damage_reports for insert
to authenticated
with check (
  reported_by = auth.uid()
  and (
    current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','driver','customer','maintenance']::app_role[])
    or user_has_active_vehicle_access(vehicle_id)
  )
);

drop policy if exists "damage reports updateable by operators" on damage_reports;
create policy "damage reports updateable by operators"
on damage_reports for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
);

drop policy if exists "identity verifications insertable by self or operators" on identity_verifications;
create policy "identity verifications insertable by self or operators"
on identity_verifications for insert
to authenticated
with check (
  user_id = auth.uid()
  or current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

drop policy if exists "vehicle documents insertable by operators" on vehicle_documents;
create policy "vehicle documents insertable by operators"
on vehicle_documents for insert
to authenticated
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
);

drop policy if exists "vehicle documents updateable by operators" on vehicle_documents;
create policy "vehicle documents updateable by operators"
on vehicle_documents for update
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
)
with check (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
);

drop policy if exists "storage file records visible to permitted users" on storage_files;
create policy "storage file records visible to permitted users"
on storage_files for select
to authenticated
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
  or uploaded_by = auth.uid()
);

drop policy if exists "storage file records insertable by permitted users" on storage_files;
create policy "storage file records insertable by permitted users"
on storage_files for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and bucket_id = 'FlashAVTLStorage'
  and section in ('vehicle-documents','damage-media','identity-evidence','inspection-media','firmware-artifacts')
  and (
    current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','driver','customer','maintenance']::app_role[])
  )
);

drop policy if exists "audit logs insertable by authenticated users" on audit_logs;
create policy "audit logs insertable by authenticated users"
on audit_logs for insert
to authenticated
with check (
  actor_id = auth.uid()
);
