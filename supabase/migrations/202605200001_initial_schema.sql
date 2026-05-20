-- FlashFleet AI production baseline schema for Supabase/Postgres.
-- Enable required extension in Supabase SQL editor before running.

create extension if not exists pgcrypto;

do $$ begin
  create type app_role as enum (
    'platform_admin',
    'owner',
    'manager',
    'staff',
    'driver',
    'customer',
    'maintenance'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type vehicle_status as enum (
    'available',
    'in_use',
    'maintenance',
    'offline',
    'reserved',
    'retired'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lock_state as enum (
    'locked',
    'unlocked',
    'unknown',
    'jammed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type command_status as enum (
    'requested',
    'queued',
    'sent',
    'accepted',
    'rejected',
    'expired',
    'failed'
  );
exception when duplicate_object then null;
end $$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  country_code text not null default 'IN',
  timezone text not null default 'Asia/Kolkata',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  identity_status text not null default 'pending',
  mfa_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role app_role not null,
  branch_id uuid references branches(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role, branch_id)
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  registration_number text not null,
  vin text,
  vehicle_type text not null,
  make text,
  model text,
  year int,
  status vehicle_status not null default 'available',
  lock_state lock_state not null default 'unknown',
  odometer_km numeric(12, 2) default 0,
  fuel_percent numeric(5, 2),
  battery_percent numeric(5, 2),
  last_seen_at timestamptz,
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, registration_number)
);

create table if not exists vehicle_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  serial_number text not null unique,
  imei text,
  firmware_version text,
  hardware_version text,
  public_key text not null,
  secure_element_serial text,
  status text not null default 'provisioned',
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists vehicle_latest_state (
  vehicle_id uuid primary key references vehicles(id) on delete cascade,
  device_id uuid references vehicle_devices(id) on delete set null,
  recorded_at timestamptz not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  speed_kph numeric(7, 2),
  heading_deg numeric(6, 2),
  ignition_on boolean,
  lock_state lock_state,
  fuel_percent numeric(5, 2),
  battery_percent numeric(5, 2),
  network_state text,
  health_flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists telemetry_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  device_id uuid references vehicle_devices(id) on delete set null,
  recorded_at timestamptz not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  speed_kph numeric(7, 2),
  odometer_km numeric(12, 2),
  lock_state lock_state,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  customer_id uuid not null references profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'reserved',
  pricing_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  driver_id uuid references profiles(id) on delete set null,
  started_at timestamptz,
  ended_at timestamptz,
  start_latitude numeric(10, 7),
  start_longitude numeric(10, 7),
  end_latitude numeric(10, 7),
  end_longitude numeric(10, 7),
  distance_km numeric(12, 2),
  risk_score numeric(5, 2),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists access_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  grant_type text not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  allowed_methods text[] not null default array['app'],
  status text not null default 'active',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (valid_until > valid_from)
);

create table if not exists offline_unlock_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  access_grant_id uuid not null references access_grants(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  token_hash text not null,
  nonce text not null,
  method text not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  max_uses int not null default 1,
  used_count int not null default 0,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (vehicle_id, nonce),
  check (valid_until > valid_from),
  check (max_uses > 0)
);

create table if not exists access_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  access_grant_id uuid references access_grants(id) on delete set null,
  method text not null,
  result text not null,
  reason text,
  device_recorded_at timestamptz,
  created_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists vehicle_commands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  device_id uuid references vehicle_devices(id) on delete set null,
  requested_by uuid references profiles(id) on delete set null,
  command_type text not null,
  status command_status not null default 'requested',
  safety_context jsonb not null default '{}'::jsonb,
  signed_payload text,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  result jsonb not null default '{}'::jsonb
);

create table if not exists geofences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  fence_type text not null default 'allowed',
  geometry jsonb not null,
  active_from time,
  active_until time,
  days_of_week int[] default array[1,2,3,4,5,6,7],
  policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists vehicle_geofence_assignments (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  geofence_id uuid not null references geofences(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (vehicle_id, geofence_id)
);

create table if not exists maintenance_work_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  assigned_to uuid references profiles(id) on delete set null,
  title text not null,
  priority text not null default 'medium',
  status text not null default 'open',
  due_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  notes text
);

create table if not exists maintenance_predictions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  prediction_type text not null,
  probability numeric(5, 2) not null,
  predicted_due_at timestamptz,
  explanation jsonb not null default '{}'::jsonb,
  model_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists driver_risk_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  driver_id uuid not null references profiles(id) on delete cascade,
  trip_id uuid references trips(id) on delete set null,
  score numeric(5, 2) not null,
  factors jsonb not null default '{}'::jsonb,
  model_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists identity_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  verification_type text not null,
  status text not null default 'pending',
  provider text,
  confidence numeric(5, 2),
  evidence_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists damage_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  reported_by uuid references profiles(id) on delete set null,
  report_stage text not null,
  status text not null default 'open',
  media_urls text[] not null default '{}',
  ai_findings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  document_type text not null,
  document_number text,
  file_url text,
  valid_from date,
  valid_until date,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  actor_id uuid references profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicles_org_status on vehicles (organization_id, status);
create index if not exists idx_telemetry_vehicle_time on telemetry_events (vehicle_id, recorded_at desc);
create index if not exists idx_bookings_vehicle_time on bookings (vehicle_id, starts_at, ends_at);
create index if not exists idx_access_grants_vehicle_user on access_grants (vehicle_id, user_id, valid_from, valid_until);
create index if not exists idx_commands_vehicle_status on vehicle_commands (vehicle_id, status, requested_at desc);
create index if not exists idx_audit_org_time on audit_logs (organization_id, created_at desc);

alter table organizations enable row level security;
alter table branches enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table vehicles enable row level security;
alter table vehicle_devices enable row level security;
alter table vehicle_latest_state enable row level security;
alter table telemetry_events enable row level security;
alter table bookings enable row level security;
alter table trips enable row level security;
alter table access_grants enable row level security;
alter table offline_unlock_tokens enable row level security;
alter table access_events enable row level security;
alter table vehicle_commands enable row level security;
alter table geofences enable row level security;
alter table vehicle_geofence_assignments enable row level security;
alter table maintenance_work_orders enable row level security;
alter table maintenance_predictions enable row level security;
alter table driver_risk_scores enable row level security;
alter table identity_verifications enable row level security;
alter table damage_reports enable row level security;
alter table vehicle_documents enable row level security;
alter table audit_logs enable row level security;

create or replace function current_user_has_role(target_org uuid, allowed_roles app_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from user_roles ur
    where ur.user_id = auth.uid()
      and (ur.organization_id = target_org or ur.role = 'platform_admin')
      and ur.role = any(allowed_roles)
  );
$$;

create or replace function user_has_active_vehicle_access(target_vehicle uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from bookings b
    where b.vehicle_id = target_vehicle
      and b.customer_id = auth.uid()
      and b.status in ('reserved','active')
      and now() between b.starts_at - interval '30 minutes' and b.ends_at + interval '30 minutes'
  )
  or exists (
    select 1
    from access_grants ag
    where ag.vehicle_id = target_vehicle
      and ag.user_id = auth.uid()
      and ag.status = 'active'
      and now() between ag.valid_from and ag.valid_until
  );
$$;

create policy "organizations visible to members"
on organizations for select
using (
  current_user_has_role(id, array['platform_admin','owner','manager','staff','driver','customer','maintenance']::app_role[])
);

create policy "branches visible to organization members"
on branches for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','driver','customer','maintenance']::app_role[])
);

create policy "profiles can read same organization profiles"
on profiles for select
using (
  id = auth.uid()
  or current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
);

create policy "user roles visible to self and admins"
on user_roles for select
using (
  user_id = auth.uid()
  or current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
);

create policy "vehicles visible to organization operators"
on vehicles for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
);

create policy "customers can read vehicles for active bookings"
on vehicles for select
using (
  user_has_active_vehicle_access(id)
);

create policy "latest state visible to permitted users"
on vehicle_latest_state for select
using (
  exists (
    select 1
    from vehicles v
    where v.id = vehicle_latest_state.vehicle_id
      and (
        current_user_has_role(v.organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
        or user_has_active_vehicle_access(v.id)
      )
  )
);

create policy "telemetry visible to organization operators"
on telemetry_events for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','maintenance']::app_role[])
);

create policy "bookings visible to organization operators"
on bookings for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or customer_id = auth.uid()
);

create policy "trips visible to operators and assigned drivers"
on trips for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
  or driver_id = auth.uid()
);

create policy "access grants visible to operators and grant users"
on access_grants for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or user_id = auth.uid()
);

create policy "access events visible to operators and actor"
on access_events for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
  or user_id = auth.uid()
);

create policy "commands visible to organization operators"
on vehicle_commands for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

create policy "geofences visible to organization operators"
on geofences for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

create policy "maintenance work orders visible to maintenance users"
on maintenance_work_orders for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','maintenance']::app_role[])
  or assigned_to = auth.uid()
);

create policy "maintenance predictions visible to maintenance users"
on maintenance_predictions for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','maintenance']::app_role[])
);

create policy "risk scores visible to operators and driver"
on driver_risk_scores for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager']::app_role[])
  or driver_id = auth.uid()
);

create policy "identity checks visible to self and operators"
on identity_verifications for select
using (
  user_id = auth.uid()
  or current_user_has_role(organization_id, array['platform_admin','owner','manager','staff']::app_role[])
);

create policy "damage reports visible to operators and reporters"
on damage_reports for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
  or reported_by = auth.uid()
);

create policy "vehicle documents visible to operators and active users"
on vehicle_documents for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner','manager','staff','maintenance']::app_role[])
  or user_has_active_vehicle_access(vehicle_id)
);

create policy "audit logs visible to admins"
on audit_logs for select
using (
  current_user_has_role(organization_id, array['platform_admin','owner']::app_role[])
);
