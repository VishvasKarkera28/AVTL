import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
dotenv.config({ quiet: true });

const scrypt = promisify(crypto.scrypt);
const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "APP_JWT_SECRET"];
const issuer = "flashavtl-api";
const jwtTtlSeconds = Number(process.env.APP_JWT_EXPIRES_SECONDS ?? 60 * 60 * 8);

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

for (const name of requiredEnv) {
  getEnv(name);
}

const supabaseUrl = getEnv("SUPABASE_URL");
const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const jwtSecret = getEnv("APP_JWT_SECRET");

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const app = express();
const port = Number(process.env.PORT ?? 8787);
const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.WEB_APP_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS policy."));
    },
    credentials: true
  })
);

const passwordSchema = z.string().min(12).max(128);
const optionalUuid = z.uuid().optional().nullable();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128)
});

const registerSchema = z.object({
  organizationId: optionalUuid,
  branchId: optionalUuid,
  email: z.email(),
  password: passwordSchema,
  fullName: z.string().min(2).max(120),
  phone: z.string().max(32).optional().nullable()
});

const userCreateSchema = z.object({
  organizationId: z.uuid(),
  branchId: optionalUuid,
  email: z.email(),
  fullName: z.string().min(2).max(120),
  phone: z.string().max(32).optional().nullable(),
  role: z.enum(["owner", "manager", "staff", "driver", "customer", "maintenance"]),
  password: passwordSchema.optional(),
  sendInvite: z.boolean().default(false)
});

const fleetAssetCreateSchema = z.object({
  organizationId: z.uuid(),
  branchId: optionalUuid,
  registrationNumber: z.string().min(2).max(80),
  vin: z.string().max(80).optional().nullable(),
  assetType: z.string().min(2).max(64),
  make: z.string().max(80).optional().nullable(),
  model: z.string().max(80).optional().nullable(),
  year: z.union([z.string(), z.number()]).optional().nullable(),
  status: z.string().min(2).max(40).default("available"),
  odometerKm: z.union([z.string(), z.number()]).optional().nullable(),
  fuelPercent: z.union([z.string(), z.number()]).optional().nullable(),
  batteryPercent: z.union([z.string(), z.number()]).optional().nullable()
});

const bookingCreateSchema = z.object({
  organizationId: z.uuid(),
  branchId: optionalUuid,
  vehicleId: z.uuid(),
  customerId: z.uuid(),
  startsAt: z.string().min(5),
  endsAt: z.string().min(5),
  status: z.string().min(2).max(40).default("reserved"),
  pricingSnapshot: z.record(z.string(), z.unknown()).default({})
});

const tripCreateSchema = z.object({
  organizationId: z.uuid(),
  bookingId: optionalUuid,
  vehicleId: z.uuid(),
  driverId: optionalUuid,
  startedAt: z.string().min(5).optional().nullable(),
  summary: z.record(z.string(), z.unknown()).default({})
});

const telemetryEventSchema = z.object({
  organizationId: z.uuid(),
  vehicleId: z.uuid(),
  deviceId: optionalUuid,
  recordedAt: z.string().min(5).optional().nullable(),
  latitude: z.union([z.string(), z.number()]).optional().nullable(),
  longitude: z.union([z.string(), z.number()]).optional().nullable(),
  speedKph: z.union([z.string(), z.number()]).optional().nullable(),
  headingDeg: z.union([z.string(), z.number()]).optional().nullable(),
  odometerKm: z.union([z.string(), z.number()]).optional().nullable(),
  lockState: z.enum(["locked", "unlocked", "unknown"]).optional().nullable(),
  fuelPercent: z.union([z.string(), z.number()]).optional().nullable(),
  batteryPercent: z.union([z.string(), z.number()]).optional().nullable(),
  networkState: z.string().max(80).optional().nullable(),
  healthFlags: z.record(z.string(), z.unknown()).default({}),
  payload: z.record(z.string(), z.unknown()).default({})
});

const accessGrantCreateSchema = z.object({
  organizationId: z.uuid(),
  vehicleId: z.uuid(),
  userId: z.uuid(),
  bookingId: optionalUuid,
  grantType: z.string().min(2).max(40).default("booking"),
  validFrom: z.string().min(5),
  validUntil: z.string().min(5),
  allowedMethods: z.array(z.string().min(2).max(40)).min(1),
  status: z.string().min(2).max(40).default("active")
});

const damageReportCreateSchema = z.object({
  organizationId: z.uuid(),
  vehicleId: z.uuid(),
  bookingId: optionalUuid,
  reportStage: z.string().min(2).max(40),
  status: z.string().min(2).max(40).default("open"),
  mediaUrls: z.array(z.string()).default([]),
  aiFindings: z.record(z.string(), z.unknown()).default({})
});

const signedUploadSchema = z.object({
  organizationId: z.uuid(),
  bucket: z.literal("FlashAVTLStorage").default("FlashAVTLStorage"),
  objectPath: z.string().min(8).max(600),
  section: z.enum([
    "vehicle-documents",
    "damage-media",
    "identity-evidence",
    "inspection-media",
    "firmware-artifacts"
  ]),
  entityType: z.string().min(2).max(64),
  entityId: optionalUuid,
  contentType: z.string().min(3).max(120).optional(),
  sizeBytes: z.number().int().positive().optional(),
  upsert: z.boolean().default(false)
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "flashavtl-api", auth: "app-jwt" });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await findAppUserByEmail(input.email);
    if (!user || user.status !== "active") {
      throw httpError(401, "Invalid email or password.");
    }

    const passwordOk = await verifyPassword(input.password, user.password_hash);
    if (!passwordOk) {
      throw httpError(401, "Invalid email or password.");
    }

    const roles = await getUserRoles(user.id);
    const accessToken = signAppJwt(user, roles);

    await serviceClient
      .from("app_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    res.json({
      accessToken,
      user: sanitizeUser(user),
      roles,
      tokenType: "Bearer",
      expiresIn: jwtTtlSeconds
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const workspace = await resolveRegistrationWorkspace(input.organizationId, input.branchId);
    const user = await createOrUpdateAppUser({
      organizationId: workspace.organizationId,
      branchId: workspace.branchId,
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      phone: input.phone ?? null,
      identityStatus: "pending"
    });

    await upsertAppRole({
      organizationId: workspace.organizationId,
      branchId: workspace.branchId,
      userId: user.id,
      role: "customer"
    });

    const roles = await getUserRoles(user.id);
    const accessToken = signAppJwt(user, roles);

    res.status(201).json({
      accessToken,
      user: sanitizeUser(user),
      roles,
      tokenType: "Bearer",
      expiresIn: jwtTtlSeconds
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireUser, async (req, res) => {
  res.json(toUserContext(req.user, req.roles));
});

app.post("/api/auth/logout", requireUser, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/me", requireUser, async (req, res) => {
  res.json(toUserContext(req.user, req.roles));
});

app.get("/api/app/context", requireUser, async (req, res) => {
  res.json(toUserContext(req.user, req.roles));
});

app.get("/api/organizations", requireUser, async (req, res, next) => {
  try {
    const organizationIds = getReadableOrganizationIds(req.roles);
    let query = serviceClient
      .from("organizations")
      .select("*, branches(*)")
      .order("created_at", { ascending: false });

    if (!isPlatformAdmin(req.roles)) {
      query = query.in("id", organizationIds);
    }

    const { data, error } = await query;
    throwIfSupabase(error);
    res.json({ data: data ?? [] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/asset-types", requireUser, async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("asset_types")
      .select("*")
      .order("label", { ascending: true });
    throwIfSupabase(error);
    res.json({ data: data ?? [] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/fleet-assets", requireUser, async (req, res, next) => {
  try {
    const organizationIds = getReadableOrganizationIds(req.roles);
    let query = serviceClient
      .from("vehicles")
      .select("*, vehicle_latest_state(*)")
      .order("created_at", { ascending: false });

    if (!isPlatformAdmin(req.roles)) {
      query = query.in("organization_id", organizationIds);
    }

    const { data, error } = await query;
    throwIfSupabase(error);
    res.json({ data: data ?? [] });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/users", requireUser, requireAnyRole(["platform_admin", "owner", "manager"]), async (req, res, next) => {
  try {
    const input = userCreateSchema.parse(req.body);
    await assertCanManageOrganization(req.user.id, input.organizationId, ["platform_admin", "owner", "manager"]);

    const generatedPassword = input.password ? null : createTemporaryPassword();
    const user = await createOrUpdateAppUser({
      organizationId: input.organizationId,
      branchId: input.branchId ?? null,
      email: input.email,
      password: input.password ?? generatedPassword,
      fullName: input.fullName,
      phone: input.phone ?? null,
      identityStatus: input.role === "driver" ? "pending" : "verified"
    });

    await upsertAppRole({
      organizationId: input.organizationId,
      branchId: input.branchId ?? null,
      userId: user.id,
      role: input.role
    });

    const { error: inviteError } = await serviceClient.from("user_invitations").upsert({
      organization_id: input.organizationId,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone ?? null,
      role: input.role,
      branch_id: input.branchId ?? null,
      status: input.sendInvite ? "invited" : "created",
      invited_by: null,
      accepted_user_id: null,
      app_invited_by: req.user.id,
      app_accepted_user_id: user.id
    });
    throwIfSupabase(inviteError);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "app_user",
      entityId: user.id,
      action: "admin_user_created",
      metadata: { role: input.role, sendInvite: input.sendInvite }
    });

    res.status(201).json({
      userId: user.id,
      email: input.email,
      role: input.role,
      status: input.sendInvite ? "invited" : "created",
      temporaryPassword: generatedPassword
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/fleet-assets", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff"]), async (req, res, next) => {
  try {
    const input = fleetAssetCreateSchema.parse(req.body);
    await assertCanAccessOrganization(req.user.id, input.organizationId, ["platform_admin", "owner", "manager", "staff"]);

    const { data, error } = await serviceClient
      .from("vehicles")
      .insert({
        organization_id: input.organizationId,
        branch_id: input.branchId ?? null,
        registration_number: input.registrationNumber,
        vin: input.vin ?? null,
        vehicle_type: input.assetType,
        make: input.make ?? null,
        model: input.model ?? null,
        year: toNumberOrNull(input.year),
        status: input.status,
        lock_state: "unknown",
        odometer_km: toNumberOrNull(input.odometerKm) ?? 0,
        fuel_percent: toNumberOrNull(input.fuelPercent),
        battery_percent: toNumberOrNull(input.batteryPercent)
      })
      .select()
      .single();
    throwIfSupabase(error);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "vehicle",
      entityId: data.id,
      action: "fleet_asset_created",
      metadata: { registrationNumber: input.registrationNumber, assetType: input.assetType }
    });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff", "customer"]), async (req, res, next) => {
  try {
    const input = bookingCreateSchema.parse(req.body);
    const customer = await resolveAppUser(input.customerId);
    await assertCanCreateForOrganization(req.user, req.roles, input.organizationId, customer?.id);

    const { data, error } = await serviceClient
      .from("bookings")
      .insert({
        organization_id: input.organizationId,
        branch_id: input.branchId ?? null,
        vehicle_id: input.vehicleId,
        customer_id: customer?.profile_id ?? null,
        app_customer_id: customer?.id ?? null,
        starts_at: toIsoDateTime(input.startsAt),
        ends_at: toIsoDateTime(input.endsAt),
        status: input.status,
        pricing_snapshot: input.pricingSnapshot
      })
      .select()
      .single();
    throwIfSupabase(error);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "booking",
      entityId: data.id,
      action: "booking_created",
      metadata: { vehicleId: input.vehicleId, appCustomerId: customer?.id ?? null }
    });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

app.post("/api/trips", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff", "driver"]), async (req, res, next) => {
  try {
    const input = tripCreateSchema.parse(req.body);
    const driver = input.driverId ? await resolveAppUser(input.driverId) : null;
    await assertCanCreateForOrganization(req.user, req.roles, input.organizationId, driver?.id);

    const { data, error } = await serviceClient
      .from("trips")
      .insert({
        organization_id: input.organizationId,
        booking_id: input.bookingId ?? null,
        vehicle_id: input.vehicleId,
        driver_id: driver?.profile_id ?? null,
        app_driver_id: driver?.id ?? null,
        started_at: input.startedAt ? toIsoDateTime(input.startedAt) : null,
        summary: input.summary
      })
      .select()
      .single();
    throwIfSupabase(error);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "trip",
      entityId: data.id,
      action: "trip_created",
      metadata: { vehicleId: input.vehicleId, appDriverId: driver?.id ?? null }
    });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

app.post("/api/telemetry-events", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff", "driver"]), async (req, res, next) => {
  try {
    const input = telemetryEventSchema.parse(req.body);
    await assertCanAccessOrganization(req.user.id, input.organizationId, ["platform_admin", "owner", "manager", "staff", "driver"]);
    const recordedAt = input.recordedAt ? toIsoDateTime(input.recordedAt) : new Date().toISOString();
    const latitude = toNumberOrNull(input.latitude);
    const longitude = toNumberOrNull(input.longitude);
    const speedKph = toNumberOrNull(input.speedKph);
    const fuelPercent = toNumberOrNull(input.fuelPercent);
    const batteryPercent = toNumberOrNull(input.batteryPercent);

    const { data: telemetry, error: telemetryError } = await serviceClient
      .from("telemetry_events")
      .insert({
        organization_id: input.organizationId,
        vehicle_id: input.vehicleId,
        device_id: input.deviceId ?? null,
        recorded_at: recordedAt,
        latitude,
        longitude,
        speed_kph: speedKph,
        odometer_km: toNumberOrNull(input.odometerKm),
        lock_state: input.lockState ?? null,
        payload: {
          ...input.payload,
          headingDeg: toNumberOrNull(input.headingDeg),
          batteryPercent,
          networkState: input.networkState,
          healthFlags: input.healthFlags
        }
      })
      .select()
      .single();
    throwIfSupabase(telemetryError);

    const { error: latestStateError } = await serviceClient
      .from("vehicle_latest_state")
      .upsert({
        vehicle_id: input.vehicleId,
        device_id: input.deviceId ?? null,
        recorded_at: recordedAt,
        latitude,
        longitude,
        speed_kph: speedKph,
        heading_deg: toNumberOrNull(input.headingDeg),
        ignition_on: Boolean(input.payload?.ignitionOn ?? input.payload?.ignition_on ?? false),
        lock_state: input.lockState ?? null,
        fuel_percent: fuelPercent,
        battery_percent: batteryPercent,
        network_state: input.networkState ?? null,
        health_flags: input.healthFlags,
        updated_at: new Date().toISOString()
      }, { onConflict: "vehicle_id" });
    throwIfSupabase(latestStateError);

    const vehiclePatch = {
      last_seen_at: recordedAt,
      updated_at: new Date().toISOString()
    };
    if (latitude !== null) {
      vehiclePatch.current_latitude = latitude;
    }
    if (longitude !== null) {
      vehiclePatch.current_longitude = longitude;
    }
    if (input.lockState) {
      vehiclePatch.lock_state = input.lockState;
    }
    if (fuelPercent !== null) {
      vehiclePatch.fuel_percent = fuelPercent;
    }
    if (batteryPercent !== null) {
      vehiclePatch.battery_percent = batteryPercent;
    }

    const { error: vehicleError } = await serviceClient
      .from("vehicles")
      .update(vehiclePatch)
      .eq("id", input.vehicleId)
      .eq("organization_id", input.organizationId);
    throwIfSupabase(vehicleError);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "vehicle",
      entityId: input.vehicleId,
      action: "telemetry_event_ingested",
      metadata: { speedKph, latitude, longitude }
    });

    res.status(201).json({ data: telemetry });
  } catch (error) {
    next(error);
  }
});

app.post("/api/access-grants", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff"]), async (req, res, next) => {
  try {
    const input = accessGrantCreateSchema.parse(req.body);
    await assertCanAccessOrganization(req.user.id, input.organizationId, ["platform_admin", "owner", "manager", "staff"]);
    const grantUser = await resolveAppUser(input.userId);

    const { data, error } = await serviceClient
      .from("access_grants")
      .insert({
        organization_id: input.organizationId,
        vehicle_id: input.vehicleId,
        user_id: grantUser?.profile_id ?? null,
        app_user_id: grantUser.id,
        booking_id: input.bookingId ?? null,
        grant_type: input.grantType,
        valid_from: toIsoDateTime(input.validFrom),
        valid_until: toIsoDateTime(input.validUntil),
        allowed_methods: input.allowedMethods,
        status: input.status,
        created_by: req.user.profile_id ?? null,
        app_created_by: req.user.id
      })
      .select()
      .single();
    throwIfSupabase(error);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "access_grant",
      entityId: data.id,
      action: "access_grant_created",
      metadata: { vehicleId: input.vehicleId, appUserId: grantUser.id, methods: input.allowedMethods }
    });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

app.post("/api/damage-reports", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff", "driver", "customer", "maintenance"]), async (req, res, next) => {
  try {
    const input = damageReportCreateSchema.parse(req.body);
    await assertCanCreateForOrganization(req.user, req.roles, input.organizationId, req.user.id);

    const { data, error } = await serviceClient
      .from("damage_reports")
      .insert({
        organization_id: input.organizationId,
        vehicle_id: input.vehicleId,
        booking_id: input.bookingId ?? null,
        reported_by: req.user.profile_id ?? null,
        app_reported_by: req.user.id,
        report_stage: input.reportStage,
        status: input.status,
        media_urls: input.mediaUrls,
        ai_findings: input.aiFindings
      })
      .select()
      .single();
    throwIfSupabase(error);

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "damage_report",
      entityId: data.id,
      action: "damage_report_created",
      metadata: { vehicleId: input.vehicleId, stage: input.reportStage }
    });

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

app.post("/api/storage/signed-upload", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff", "driver", "customer", "maintenance"]), async (req, res, next) => {
  try {
    const input = signedUploadSchema.parse(req.body);
    await assertCanUploadSection(req.user.id, input.organizationId, input.section);

    if (!input.objectPath.startsWith(`${input.section}/`)) {
      throw httpError(400, `Object path must start with ${input.section}/.`);
    }

    const { data, error } = await serviceClient.storage
      .from(input.bucket)
      .createSignedUploadUrl(input.objectPath, {
        upsert: input.upsert
      });
    throwIfSupabase(error);

    const { error: recordError } = await serviceClient.from("storage_files").insert({
      organization_id: input.organizationId,
      bucket_id: input.bucket,
      object_path: input.objectPath,
      section: input.section,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      uploaded_by: req.user.profile_id ?? null,
      app_uploaded_by: req.user.id,
      content_type: input.contentType ?? null,
      size_bytes: input.sizeBytes ?? null,
      status: "signed_url_created"
    });
    throwIfSupabase(recordError);

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

async function requireUser(req, _res, next) {
  try {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      throw httpError(401, "Missing Bearer token.");
    }

    const claims = verifyAppJwt(token);
    const user = await findAppUserById(claims.sub);
    if (!user || user.status !== "active") {
      throw httpError(401, "Invalid JWT user.");
    }

    const roles = await getUserRoles(user.id);
    req.user = user;
    req.roles = roles;
    req.accessToken = token;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAnyRole(allowedRoles) {
  return async (req, _res, next) => {
    try {
      const hasAllowedRole = req.roles.some((role) => allowedRoles.includes(role.role));
      if (!hasAllowedRole) {
        throw httpError(403, "You do not have permission to perform this action.");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

async function findAppUserByEmail(email) {
  const { data, error } = await serviceClient
    .from("app_users")
    .select("*")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  throwIfSupabase(error);
  return data;
}

async function findAppUserById(userId) {
  const { data, error } = await serviceClient
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();
  throwIfSupabase(error);
  return data;
}

async function resolveAppUser(userId) {
  const user = await findAppUserById(userId);
  if (!user) {
    throw httpError(400, "Target app user was not found.");
  }
  return user;
}

async function getUserRoles(userId) {
  const { data, error } = await serviceClient
    .from("app_user_roles")
    .select("organization_id, role, branch_id, branches(name)")
    .eq("user_id", userId);
  throwIfSupabase(error);
  return data ?? [];
}

async function createOrUpdateAppUser({
  organizationId,
  branchId,
  email,
  password,
  fullName,
  phone,
  identityStatus
}) {
  const passwordHash = await hashPassword(password);
  const existing = await findAppUserByEmail(email);

  if (existing?.id) {
    const { data, error } = await serviceClient
      .from("app_users")
      .update({
        organization_id: organizationId,
        branch_id: branchId ?? existing.branch_id ?? null,
        password_hash: passwordHash,
        full_name: fullName,
        phone,
        identity_status: identityStatus,
        status: "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select()
      .single();
    throwIfSupabase(error);
    return data;
  }

  const { data, error } = await serviceClient
    .from("app_users")
    .insert({
      organization_id: organizationId,
      branch_id: branchId ?? null,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      phone,
      identity_status: identityStatus,
      status: "active"
    })
    .select()
    .single();
  throwIfSupabase(error);
  return data;
}

async function upsertAppRole({ organizationId, branchId, userId, role }) {
  const { error } = await serviceClient.from("app_user_roles").upsert({
    organization_id: organizationId,
    branch_id: branchId ?? null,
    user_id: userId,
    role
  });
  throwIfSupabase(error);
}

async function assertCanManageOrganization(userId, organizationId, allowedRoles) {
  const roles = await getUserRoles(userId);
  const allowed = roles.some((role) => {
    if (role.role === "platform_admin") {
      return true;
    }
    return role.organization_id === organizationId && allowedRoles.includes(role.role);
  });

  if (!allowed) {
    throw httpError(403, "You cannot manage this organization.");
  }
}

async function assertCanAccessOrganization(userId, organizationId, allowedRoles) {
  const roles = await getUserRoles(userId);
  const allowed = roles.some((role) => {
    if (role.role === "platform_admin") {
      return true;
    }
    return role.organization_id === organizationId && allowedRoles.includes(role.role);
  });

  if (!allowed) {
    throw httpError(403, "You cannot access this organization.");
  }
}

async function assertCanCreateForOrganization(user, roles, organizationId, targetUserId) {
  const operatorAllowed = roles.some((role) => {
    if (role.role === "platform_admin") {
      return true;
    }
    return role.organization_id === organizationId && ["owner", "manager", "staff", "maintenance"].includes(role.role);
  });

  const selfAllowed = user.organization_id === organizationId && (!targetUserId || targetUserId === user.id);
  if (!operatorAllowed && !selfAllowed) {
    throw httpError(403, "You cannot create this record for the organization.");
  }
}

async function assertCanUploadSection(userId, organizationId, section) {
  const roles = await getUserRoles(userId);
  const roleNames = roles
    .filter((role) => role.role === "platform_admin" || role.organization_id === organizationId)
    .map((role) => role.role);

  const sectionRoles = {
    "vehicle-documents": ["platform_admin", "owner", "manager", "staff", "maintenance"],
    "damage-media": ["platform_admin", "owner", "manager", "staff", "driver", "customer", "maintenance"],
    "identity-evidence": ["platform_admin", "owner", "manager", "staff", "driver", "customer", "maintenance"],
    "inspection-media": ["platform_admin", "owner", "manager", "staff", "driver", "customer", "maintenance"],
    "firmware-artifacts": ["platform_admin"]
  };

  const allowed = roleNames.some((role) => sectionRoles[section].includes(role));
  if (!allowed) {
    throw httpError(403, "You cannot upload files to this storage section.");
  }
}

async function resolveRegistrationWorkspace(organizationId, branchId) {
  if (organizationId) {
    return { organizationId, branchId: branchId ?? null };
  }

  const { data, error } = await serviceClient
    .from("organizations")
    .select("id, branches(id)")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  throwIfSupabase(error);

  if (!data?.id) {
    throw httpError(400, "No active organization is available for registration.");
  }

  return {
    organizationId: data.id,
    branchId: data.branches?.[0]?.id ?? null
  };
}

async function writeAudit({ organizationId, actorId, entityType, entityId, action, metadata }) {
  await serviceClient.from("audit_logs").insert({
    organization_id: organizationId,
    actor_id: null,
    app_actor_id: actorId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata: metadata ?? {}
  });
}

function signAppJwt(user, roles) {
  const now = Math.floor(Date.now() / 1000);
  return signJwt({
    iss: issuer,
    sub: user.id,
    email: user.email,
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    roles: roles.map((role) => ({
      organization_id: role.organization_id,
      branch_id: role.branch_id,
      role: role.role
    })),
    iat: now,
    exp: now + jwtTtlSeconds
  });
}

function signJwt(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", jwtSecret)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function verifyAppJwt(token) {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw httpError(401, "Invalid JWT.");
  }

  const expected = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  if (!safeEqual(signature, expected)) {
    throw httpError(401, "Invalid JWT signature.");
  }

  const claims = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== issuer || !claims.sub || Number(claims.exp) <= now) {
    throw httpError(401, "JWT is expired or invalid.");
  }
  return claims;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const params = { N: 16384, r: 8, p: 1, keylen: 64 };
  const derivedKey = await scrypt(password, salt, params.keylen, { N: params.N, r: params.r, p: params.p });
  return `scrypt$${params.N}$${params.r}$${params.p}$${salt}$${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password, storedHash) {
  const [scheme, N, r, p, salt, hash] = String(storedHash).split("$");
  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, Buffer.from(hash, "base64url").length, {
    N: Number(N),
    r: Number(r),
    p: Number(p)
  });
  return safeEqual(derivedKey.toString("base64url"), hash);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function toUserContext(user, roles) {
  return {
    user: sanitizeUser(user),
    profile: sanitizeUser(user),
    roles,
    jwtClaims: {
      issuer,
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      roles: roles.map((role) => role.role)
    }
  };
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function isPlatformAdmin(roles) {
  return roles.some((role) => role.role === "platform_admin");
}

function getReadableOrganizationIds(roles) {
  return roles
    .filter((role) => role.organization_id)
    .map((role) => role.organization_id);
}

function createTemporaryPassword() {
  return `FlashAVTL-${crypto.randomBytes(12).toString("base64url")}1!`;
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(400, "Invalid date/time value.");
  }
  return date.toISOString();
}

function throwIfSupabase(error) {
  if (error) {
    throw httpError(400, error.message);
  }
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.code = crypto.randomUUID();
  return error;
}

app.use((error, _req, res, _next) => {
  const status = error.status ?? 500;
  const message = error instanceof z.ZodError ? z.prettifyError(error) : error.message;
  res.status(status).json({
    error: {
      message: message ?? "Internal server error",
      code: error.code ?? null
    }
  });
});

app.listen(port, () => {
  console.log(`FlashAVTL API listening on http://localhost:${port}`);
});
