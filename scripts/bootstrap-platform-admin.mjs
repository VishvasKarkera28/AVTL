import "dotenv/config";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const scrypt = promisify(crypto.scrypt);

const configSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  FLASHAVTL_BOOTSTRAP_EMAIL: z.string().email(),
  FLASHAVTL_BOOTSTRAP_PASSWORD: z.string().min(12),
  FLASHAVTL_BOOTSTRAP_NAME: z.string().min(2).default("BP Petroleum Platform Admin"),
  FLASHAVTL_BOOTSTRAP_PHONE: z.string().optional().default(""),
  FLASHAVTL_BOOTSTRAP_ORG: z.string().min(2).default("BP Petroleum Logistics"),
  FLASHAVTL_BOOTSTRAP_BRANCH: z.string().min(2).default("Mumbai Fuel Terminal"),
  FLASHAVTL_BOOTSTRAP_VEHICLE_REG: z.string().min(2).default("MH-01-BP-4472"),
  FLASHAVTL_BOOTSTRAP_SKIP_DEMO_VEHICLE: z.string().optional().default("false"),
  FLASHAVTL_BOOTSTRAP_RESET_DEMO: z.string().optional().default("false")
});

const env = configSchema.parse(process.env);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

if (env.FLASHAVTL_BOOTSTRAP_RESET_DEMO === "true") {
  await resetDemoData();
}

const { organizationId, branchId } = await ensureWorkspace();
const adminUserId = await ensureAdminUser(organizationId, branchId);
await ensurePlatformAdminRole({ organizationId, branchId, userId: adminUserId });

if (env.FLASHAVTL_BOOTSTRAP_SKIP_DEMO_VEHICLE !== "true") {
  await ensureDemoTruck({ organizationId, branchId });
}

console.log("FlashAVTL bootstrap complete");
console.log(`Organization: ${env.FLASHAVTL_BOOTSTRAP_ORG} (${organizationId})`);
console.log(`Admin: ${env.FLASHAVTL_BOOTSTRAP_EMAIL} (${adminUserId})`);

async function ensureWorkspace() {
  const { data: existingOrg, error: findOrgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", env.FLASHAVTL_BOOTSTRAP_ORG)
    .limit(1)
    .maybeSingle();
  throwIf(findOrgError, "Could not read organizations");

  let organization = existingOrg;
  if (!organization) {
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: env.FLASHAVTL_BOOTSTRAP_ORG,
        legal_name: "BP Petroleum Logistics Private Limited",
        country_code: "IN",
        timezone: "Asia/Kolkata",
        status: "active"
      })
      .select("id")
      .single();
    throwIf(error, "Could not create organization");
    organization = data;
  }

  if (!organization?.id) {
    throw new Error("Could not create organization.");
  }

  const { data: existingBranch, error: findBranchError } = await supabase
    .from("branches")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("name", env.FLASHAVTL_BOOTSTRAP_BRANCH)
    .limit(1)
    .maybeSingle();
  throwIf(findBranchError, "Could not read branches");

  let branch = existingBranch;
  if (!branch) {
    const { data, error } = await supabase
      .from("branches")
      .insert({
        organization_id: organization.id,
        name: env.FLASHAVTL_BOOTSTRAP_BRANCH,
        address: "BP Petroleum coastal fuel terminal, Mumbai, Maharashtra",
        latitude: 19.076,
        longitude: 72.8777
      })
      .select("id")
      .single();
    throwIf(error, "Could not create branch");
    branch = data;
  }

  if (!branch?.id) {
    throw new Error("Could not create branch.");
  }

  return { organizationId: organization.id, branchId: branch.id };
}

async function ensureAdminUser(organizationId, branchId) {
  const { data: existingUser, error: userError } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", env.FLASHAVTL_BOOTSTRAP_EMAIL)
    .limit(1)
    .maybeSingle();
  throwIf(userError, "Could not read app users");

  if (existingUser?.id) {
    return existingUser.id;
  }

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", env.FLASHAVTL_BOOTSTRAP_EMAIL)
    .limit(1)
    .maybeSingle();
  throwIf(profileError, "Could not read legacy profiles");

  const passwordHash = await hashPassword(env.FLASHAVTL_BOOTSTRAP_PASSWORD);

  const { data: userData, error: insertError } = await supabase
    .from("app_users")
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      profile_id: existingProfile?.id ?? null,
      email: env.FLASHAVTL_BOOTSTRAP_EMAIL,
      password_hash: passwordHash,
      full_name: env.FLASHAVTL_BOOTSTRAP_NAME,
      phone: env.FLASHAVTL_BOOTSTRAP_PHONE || null,
      identity_status: "verified",
      mfa_enabled: false,
      status: "active"
    })
    .select("id")
    .single();
  throwIf(insertError, "Could not create app admin user");

  return userData.id;
}

async function ensurePlatformAdminRole({ organizationId, branchId, userId }) {
  const { error } = await supabase.from("app_user_roles").upsert({
    organization_id: organizationId,
    branch_id: branchId,
    user_id: userId,
    role: "platform_admin"
  });
  throwIf(error, "Could not assign platform_admin role");
}

async function ensureDemoTruck({ organizationId, branchId }) {
  const { data: existingVehicle, error: findVehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("registration_number", env.FLASHAVTL_BOOTSTRAP_VEHICLE_REG)
    .limit(1)
    .maybeSingle();
  throwIf(findVehicleError, "Could not read vehicles");

  let vehicle = existingVehicle;
  if (!vehicle) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        organization_id: organizationId,
        branch_id: branchId,
        registration_number: env.FLASHAVTL_BOOTSTRAP_VEHICLE_REG,
        vin: "BPAVTLDEMO0001",
        vehicle_type: "truck",
        make: "Tata Motors",
        model: "BP Petroleum Tanker 16KL",
        year: 2024,
        status: "available",
        lock_state: "locked",
        odometer_km: 42680,
        fuel_percent: 74,
        battery_percent: 91,
        last_seen_at: new Date().toISOString(),
        current_latitude: 19.076,
        current_longitude: 72.8777
      })
      .select("id")
      .single();
    throwIf(error, "Could not create demo vehicle");
    vehicle = data;
  }

  if (!vehicle?.id) {
    throw new Error("Could not create demo vehicle.");
  }

  const { error: stateError } = await supabase.from("vehicle_latest_state").upsert({
    vehicle_id: vehicle.id,
    recorded_at: new Date().toISOString(),
    latitude: 19.076,
    longitude: 72.8777,
    speed_kph: 0,
    heading_deg: 88,
    ignition_on: false,
    lock_state: "locked",
    fuel_percent: 74,
    battery_percent: 91,
    network_state: "online",
    health_flags: {
      brakes: "nominal",
      tankerSeal: "verified",
      telematics: "online"
    }
  });
  throwIf(stateError, "Could not create latest vehicle state");
}

async function resetDemoData() {
  const demoOrgNames = [
    "HPCL Petroleum Logistics",
    "BP Petroleum Logistics",
    env.FLASHAVTL_BOOTSTRAP_ORG
  ];
  const demoEmails = [
    env.FLASHAVTL_BOOTSTRAP_EMAIL,
    "admin@flashavtl.local",
    "bp.admin@flashavtl.local"
  ];

  const { data: organizations, error: orgReadError } = await supabase
    .from("organizations")
    .select("id, name")
    .in("name", Array.from(new Set(demoOrgNames)));
  throwIf(orgReadError, "Could not read demo organizations");

  const organizationIds = organizations?.map((organization) => organization.id) ?? [];
  if (organizationIds.length) {
    const { error: deleteOrgError } = await supabase
      .from("organizations")
      .delete()
      .in("id", organizationIds);
    throwIf(deleteOrgError, "Could not delete old demo organizations");
  }

  const { error: staleUserError } = await supabase
    .from("app_users")
    .delete()
    .in("email", Array.from(new Set(demoEmails)));
  throwIf(staleUserError, "Could not delete stale demo app users");

  const { error: staleInvitationError } = await supabase
    .from("user_invitations")
    .delete()
    .in("email", Array.from(new Set(demoEmails)));
  throwIf(staleInvitationError, "Could not delete stale demo invitations");
}

function throwIf(error, prefix) {
  if (error) {
    throw new Error(`${prefix}: ${error.message}`);
  }
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const params = { N: 16384, r: 8, p: 1, keylen: 64 };
  const derivedKey = await scrypt(password, salt, params.keylen, { N: params.N, r: params.r, p: params.p });
  return `scrypt$${params.N}$${params.r}$${params.p}$${salt}$${derivedKey.toString("base64url")}`;
}
