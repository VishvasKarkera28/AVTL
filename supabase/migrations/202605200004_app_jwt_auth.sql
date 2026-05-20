-- Application-owned JWT authentication.
-- Supabase remains the data and storage platform; app_users/app_user_roles are
-- authorized by the FlashAVTL API instead of Supabase Auth sessions.

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  phone text,
  identity_status text not null default 'pending',
  mfa_enabled boolean not null default false,
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  user_id uuid not null references app_users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role, branch_id)
);

alter table user_invitations
  add column if not exists app_invited_by uuid references app_users(id) on delete set null,
  add column if not exists app_accepted_user_id uuid references app_users(id) on delete set null;

alter table storage_files
  add column if not exists app_uploaded_by uuid references app_users(id) on delete set null;

alter table audit_logs
  add column if not exists app_actor_id uuid references app_users(id) on delete set null;

alter table bookings
  alter column customer_id drop not null,
  add column if not exists app_customer_id uuid references app_users(id) on delete set null;

alter table trips
  add column if not exists app_driver_id uuid references app_users(id) on delete set null;

alter table access_grants
  alter column user_id drop not null,
  add column if not exists app_user_id uuid references app_users(id) on delete cascade,
  add column if not exists app_created_by uuid references app_users(id) on delete set null;

alter table offline_unlock_tokens
  alter column user_id drop not null,
  add column if not exists app_user_id uuid references app_users(id) on delete cascade;

alter table access_events
  add column if not exists app_user_id uuid references app_users(id) on delete set null;

alter table vehicle_commands
  add column if not exists app_requested_by uuid references app_users(id) on delete set null;

alter table maintenance_work_orders
  add column if not exists app_assigned_to uuid references app_users(id) on delete set null;

alter table driver_risk_scores
  add column if not exists app_driver_id uuid references app_users(id) on delete cascade;

alter table identity_verifications
  add column if not exists app_user_id uuid references app_users(id) on delete cascade;

alter table damage_reports
  add column if not exists app_reported_by uuid references app_users(id) on delete set null;

create index if not exists idx_app_users_org_status on app_users (organization_id, status);
create index if not exists idx_app_user_roles_user on app_user_roles (user_id, organization_id);
create index if not exists idx_bookings_app_customer on bookings (app_customer_id, starts_at, ends_at);
create index if not exists idx_access_grants_app_user on access_grants (app_user_id, valid_from, valid_until);
create index if not exists idx_storage_files_app_uploaded_by on storage_files (app_uploaded_by);

alter table app_users enable row level security;
alter table app_user_roles enable row level security;

-- No authenticated policies are created for app_users/app_user_roles on purpose.
-- The API uses the service role and performs RBAC checks before every mutation.
