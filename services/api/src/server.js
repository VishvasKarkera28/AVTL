import "dotenv/config";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const requiredEnv = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

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
const anonKey = getEnv("SUPABASE_ANON_KEY");
const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

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
app.use(express.json({ limit: "1mb" }));
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

const userCreateSchema = z.object({
  organizationId: z.uuid(),
  branchId: z.uuid().optional().nullable(),
  email: z.email(),
  fullName: z.string().min(2).max(120),
  phone: z.string().max(32).optional().nullable(),
  role: z.enum(["owner", "manager", "staff", "driver", "customer", "maintenance"]),
  password: z.string().min(12).max(128).optional(),
  sendInvite: z.boolean().default(true)
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
  entityId: z.uuid().optional().nullable(),
  contentType: z.string().min(3).max(120).optional(),
  upsert: z.boolean().default(false)
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "flashavtl-api" });
});

app.get("/api/me", requireUser, async (req, res, next) => {
  try {
    const roles = await getUserRoles(req.user.id);
    res.json({ user: req.user, roles });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/users", requireUser, requireAnyRole(["platform_admin", "owner", "manager"]), async (req, res, next) => {
  try {
    const input = userCreateSchema.parse(req.body);
    await assertCanManageOrganization(req.user.id, input.organizationId, ["platform_admin", "owner", "manager"]);

    const authPayload = {
      email: input.email,
      email_confirm: Boolean(input.password),
      password: input.password,
      user_metadata: {
        full_name: input.fullName,
        phone: input.phone ?? null
      },
      app_metadata: {
        organization_id: input.organizationId,
        role: input.role
      }
    };

    const { data: authData, error: authError } = input.password
      ? await serviceClient.auth.admin.createUser(authPayload)
      : await serviceClient.auth.admin.inviteUserByEmail(input.email, {
          data: {
            full_name: input.fullName,
            phone: input.phone ?? null
          },
          redirectTo: process.env.AUTH_REDIRECT_URL ?? process.env.WEB_APP_URL
        });

    if (authError) {
      throw httpError(400, authError.message);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw httpError(500, "Supabase did not return a user id.");
    }

    const { error: profileError } = await serviceClient.from("profiles").upsert({
      id: userId,
      organization_id: input.organizationId,
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email,
      identity_status: input.role === "driver" ? "pending" : "verified"
    });
    if (profileError) {
      throw httpError(400, profileError.message);
    }

    const { error: roleError } = await serviceClient.from("user_roles").upsert({
      organization_id: input.organizationId,
      user_id: userId,
      role: input.role,
      branch_id: input.branchId ?? null
    });
    if (roleError) {
      throw httpError(400, roleError.message);
    }

    const { error: inviteError } = await serviceClient.from("user_invitations").upsert({
      organization_id: input.organizationId,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone ?? null,
      role: input.role,
      branch_id: input.branchId ?? null,
      status: input.password ? "created" : "invited",
      invited_by: req.user.id,
      accepted_user_id: userId
    });
    if (inviteError) {
      throw httpError(400, inviteError.message);
    }

    await writeAudit({
      organizationId: input.organizationId,
      actorId: req.user.id,
      entityType: "profile",
      entityId: userId,
      action: "admin_user_created",
      metadata: { role: input.role, sendInvite: input.sendInvite }
    });

    res.status(201).json({
      userId,
      email: input.email,
      role: input.role,
      status: input.password ? "created" : "invited"
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/storage/signed-upload", requireUser, requireAnyRole(["platform_admin", "owner", "manager", "staff", "driver", "customer", "maintenance"]), async (req, res, next) => {
  try {
    const input = signedUploadSchema.parse(req.body);
    await assertCanUploadSection(req.user.id, input.organizationId, input.section);

    const { data, error } = await serviceClient.storage
      .from(input.bucket)
      .createSignedUploadUrl(input.objectPath, {
        upsert: input.upsert
      });

    if (error) {
      throw httpError(400, error.message);
    }

    const { error: recordError } = await serviceClient.from("storage_files").insert({
      organization_id: input.organizationId,
      bucket_id: input.bucket,
      object_path: input.objectPath,
      section: input.section,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      uploaded_by: req.user.id,
      content_type: input.contentType ?? null,
      status: "signed_url_created"
    });
    if (recordError) {
      throw httpError(400, recordError.message);
    }

    res.status(201).json(data);
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

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      throw httpError(401, error?.message ?? "Invalid JWT.");
    }

    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAnyRole(allowedRoles) {
  return async (req, _res, next) => {
    try {
      const roles = await getUserRoles(req.user.id);
      const hasAllowedRole = roles.some((role) => allowedRoles.includes(role.role));
      if (!hasAllowedRole) {
        throw httpError(403, "You do not have permission to perform this action.");
      }
      req.roles = roles;
      next();
    } catch (error) {
      next(error);
    }
  };
}

async function getUserRoles(userId) {
  const { data, error } = await serviceClient
    .from("user_roles")
    .select("organization_id, role, branch_id")
    .eq("user_id", userId);
  if (error) {
    throw httpError(400, error.message);
  }
  return data ?? [];
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

async function writeAudit({ organizationId, actorId, entityType, entityId, action, metadata }) {
  await serviceClient.from("audit_logs").insert({
    organization_id: organizationId,
    actor_id: actorId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata: metadata ?? {}
  });
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.code = crypto.randomUUID();
  return error;
}

app.use((error, _req, res, _next) => {
  const status = error.status ?? 500;
  res.status(status).json({
    error: {
      message: error.message ?? "Internal server error",
      code: error.code ?? null
    }
  });
});

app.listen(port, () => {
  console.log(`FlashAVTL API listening on http://localhost:${port}`);
});
