import { storageConfig } from "./index.js";
import { toAppError } from "./supabase.js";

export async function getAuthSession(supabase) {
  if (!supabase) {
    return { data: null, error: { message: "Supabase is not configured." } };
  }

  const { data, error } = await supabase.auth.getSession();
  return { data: data?.session ?? null, error: toAppError(error) };
}

export async function signInWithPassword(supabase, { email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error: toAppError(error) };
}

export async function signUpUser(supabase, { email, password, fullName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });
  return { data, error: toAppError(error) };
}

export async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  return { error: toAppError(error) };
}

export function onAuthStateChange(supabase, callback) {
  if (!supabase) {
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => data.subscription.unsubscribe();
}

export async function getCurrentUserContext(supabase) {
  if (!supabase) {
    return { data: null, error: { message: "Supabase is not configured." } };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return { data: null, error: toAppError(authError) ?? { message: "No authenticated user." } };
  }

  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", authData.user.id).maybeSingle(),
      supabase.from("user_roles").select("*, branches(name)").eq("user_id", authData.user.id)
    ]);

  if (profileError || rolesError) {
    return { data: null, error: toAppError(profileError ?? rolesError) };
  }

  return {
    data: {
      user: authData.user,
      profile,
      roles: roles ?? [],
      jwtClaims: authData.user.app_metadata ?? {}
    },
    error: null
  };
}

export async function listOrganizations(supabase) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*, branches(*)")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: toAppError(error) };
}

export async function listAssetTypes(supabase) {
  const { data, error } = await supabase
    .from("asset_types")
    .select("*")
    .order("label", { ascending: true });
  return { data: data ?? [], error: toAppError(error) };
}

export async function createUserInvitation(supabase, invitation) {
  const { data: userData } = await supabase.auth.getUser();
  const payload = {
    organization_id: invitation.organizationId,
    email: invitation.email,
    full_name: invitation.fullName,
    phone: invitation.phone || null,
    role: invitation.role,
    branch_id: invitation.branchId || null,
    invited_by: userData?.user?.id ?? null
  };

  const { data, error } = await supabase
    .from("user_invitations")
    .insert(payload)
    .select()
    .single();

  return { data, error: toAppError(error) };
}

export async function createFleetAsset(supabase, asset) {
  const payload = {
    organization_id: asset.organizationId,
    branch_id: asset.branchId || null,
    registration_number: asset.registrationNumber,
    vin: asset.vin || null,
    vehicle_type: asset.assetType,
    make: asset.make || null,
    model: asset.model || null,
    year: asset.year ? Number(asset.year) : null,
    status: asset.status || "available",
    lock_state: "unknown",
    odometer_km: asset.odometerKm ? Number(asset.odometerKm) : 0,
    fuel_percent: asset.fuelPercent ? Number(asset.fuelPercent) : null,
    battery_percent: asset.batteryPercent ? Number(asset.batteryPercent) : null
  };

  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select()
    .single();

  return { data, error: toAppError(error) };
}

export async function listFleetAssets(supabase) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_latest_state(*)")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: toAppError(error) };
}

export async function createBooking(supabase, booking) {
  const payload = {
    organization_id: booking.organizationId,
    branch_id: booking.branchId || null,
    vehicle_id: booking.vehicleId,
    customer_id: booking.customerId,
    starts_at: booking.startsAt,
    ends_at: booking.endsAt,
    status: booking.status || "reserved",
    pricing_snapshot: booking.pricingSnapshot ?? {}
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();
  return { data, error: toAppError(error) };
}

export async function createTrip(supabase, trip) {
  const payload = {
    organization_id: trip.organizationId,
    booking_id: trip.bookingId || null,
    vehicle_id: trip.vehicleId,
    driver_id: trip.driverId || null,
    started_at: trip.startedAt || null,
    summary: trip.summary ?? {}
  };

  const { data, error } = await supabase
    .from("trips")
    .insert(payload)
    .select()
    .single();
  return { data, error: toAppError(error) };
}

export async function createAccessGrant(supabase, grant) {
  const payload = {
    organization_id: grant.organizationId,
    vehicle_id: grant.vehicleId,
    user_id: grant.userId,
    booking_id: grant.bookingId || null,
    grant_type: grant.grantType || "booking",
    valid_from: grant.validFrom,
    valid_until: grant.validUntil,
    allowed_methods: grant.allowedMethods,
    status: grant.status || "active"
  };

  const { data, error } = await supabase
    .from("access_grants")
    .insert(payload)
    .select()
    .single();
  return { data, error: toAppError(error) };
}

export async function createDamageReport(supabase, report) {
  const { data: userData } = await supabase.auth.getUser();
  const payload = {
    organization_id: report.organizationId,
    vehicle_id: report.vehicleId,
    booking_id: report.bookingId || null,
    reported_by: userData?.user?.id ?? null,
    report_stage: report.reportStage,
    status: report.status || "open",
    media_urls: report.mediaUrls ?? [],
    ai_findings: report.aiFindings ?? {}
  };

  const { data, error } = await supabase
    .from("damage_reports")
    .insert(payload)
    .select()
    .single();
  return { data, error: toAppError(error) };
}

export async function uploadFlashAvtlFile(supabase, file, options) {
  const objectPath = options.objectPath;
  const { data, error } = await supabase.storage
    .from(storageConfig.bucket)
    .upload(objectPath, file, {
      contentType: options.contentType,
      cacheControl: "3600",
      upsert: options.upsert ?? false
    });

  if (error) {
    return { data: null, error: toAppError(error) };
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data: fileRecord, error: recordError } = await supabase
    .from("storage_files")
    .insert({
      organization_id: options.organizationId,
      bucket_id: storageConfig.bucket,
      object_path: objectPath,
      section: options.section,
      entity_type: options.entityType,
      entity_id: options.entityId || null,
      uploaded_by: userData?.user?.id ?? null,
      content_type: options.contentType,
      size_bytes: file.size ?? null
    })
    .select()
    .single();

  return {
    data: {
      storageObject: data,
      fileRecord
    },
    error: toAppError(recordError)
  };
}
