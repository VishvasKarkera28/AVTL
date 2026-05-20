import { storageConfig } from "./index.js";

const defaultStorageKey = "flashavtl.jwt";

export function hasApiConfig(config) {
  return Boolean(config?.baseUrl);
}

export function createFlashAvtlApiClient(config) {
  if (!hasApiConfig(config)) {
    return null;
  }

  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const storageKey = config.storageKey ?? defaultStorageKey;
  const subscribers = new Set();
  let accessToken = readStoredToken(storageKey);

  async function request(path, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {})
    };

    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const payload = await readJson(response);

    if (!response.ok) {
      throw {
        message: payload?.error?.message ?? response.statusText,
        status: response.status,
        details: payload?.error?.code ?? null
      };
    }

    return payload;
  }

  function setSession(session) {
    accessToken = session?.accessToken ?? null;
    writeStoredToken(storageKey, accessToken);
    subscribers.forEach((callback) => callback(accessToken ? "SIGNED_IN" : "SIGNED_OUT", session ?? null));
  }

  return {
    baseUrl,
    getAccessToken: () => accessToken,
    setSession,
    clearSession: () => setSession(null),
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    request
  };
}

export async function getAuthSession(api) {
  if (!api?.getAccessToken()) {
    return { data: null, error: null };
  }

  try {
    const context = await api.request("/api/auth/me");
    return {
      data: {
        accessToken: api.getAccessToken(),
        user: context.user,
        roles: context.roles
      },
      error: null
    };
  } catch (error) {
    api.clearSession();
    return { data: null, error: toAppError(error) };
  }
}

export async function signInWithPassword(api, { email, password }) {
  try {
    const data = await api.request("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    api.setSession(data);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toAppError(error) };
  }
}

export async function signUpUser(api, { email, password, fullName, phone, organizationId, branchId }) {
  try {
    const data = await api.request("/api/auth/register", {
      method: "POST",
      body: { email, password, fullName, phone, organizationId: organizationId || null, branchId: branchId || null }
    });
    api.setSession(data);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toAppError(error) };
  }
}

export async function signOut(api) {
  try {
    if (api?.getAccessToken()) {
      await api.request("/api/auth/logout", { method: "POST" });
    }
  } catch (_error) {
    // Stateless JWT logout is local; a failed network call should not trap users.
  }
  api?.clearSession();
  return { error: null };
}

export function onAuthStateChange(api, callback) {
  if (!api) {
    return () => {};
  }
  return api.subscribe(callback);
}

export async function getCurrentUserContext(api) {
  return requestData(api, "/api/app/context");
}

export async function listOrganizations(api) {
  return requestData(api, "/api/organizations");
}

export async function listAssetTypes(api) {
  return requestData(api, "/api/asset-types");
}

export async function listFleetAssets(api) {
  return requestData(api, "/api/fleet-assets");
}

export async function createUserInvitation(api, invitation) {
  return requestData(api, "/api/admin/users", {
    method: "POST",
    body: {
      organizationId: invitation.organizationId,
      branchId: invitation.branchId || null,
      email: invitation.email,
      fullName: invitation.fullName,
      phone: invitation.phone || null,
      role: invitation.role,
      password: invitation.password || undefined,
      sendInvite: invitation.sendInvite ?? false
    }
  });
}

export async function createFleetAsset(api, asset) {
  return requestData(api, "/api/fleet-assets", {
    method: "POST",
    body: asset
  });
}

export async function createBooking(api, booking) {
  return requestData(api, "/api/bookings", {
    method: "POST",
    body: booking
  });
}

export async function createTrip(api, trip) {
  return requestData(api, "/api/trips", {
    method: "POST",
    body: trip
  });
}

export async function createAccessGrant(api, grant) {
  return requestData(api, "/api/access-grants", {
    method: "POST",
    body: grant
  });
}

export async function createDamageReport(api, report) {
  return requestData(api, "/api/damage-reports", {
    method: "POST",
    body: report
  });
}

export async function uploadFlashAvtlFile(api, file, options) {
  const signedResult = await requestData(api, "/api/storage/signed-upload", {
    method: "POST",
    body: {
      organizationId: options.organizationId,
      bucket: storageConfig.bucket,
      objectPath: options.objectPath,
      section: options.section,
      entityType: options.entityType,
      entityId: options.entityId || null,
      contentType: options.contentType,
      sizeBytes: file.size,
      upsert: options.upsert ?? false
    }
  });

  if (signedResult.error) {
    return signedResult;
  }

  const signedUpload = signedResult.data;
  const signedUrl = signedUpload?.signedUrl ?? signedUpload?.signedURL;
  if (signedUrl) {
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": options.contentType ?? "application/octet-stream"
      },
      body: file
    });

    if (!uploadResponse.ok) {
      return {
        data: null,
        error: {
          message: `Signed upload failed with status ${uploadResponse.status}.`,
          status: uploadResponse.status,
          details: null
        }
      };
    }
  }

  return {
    data: {
      signedUpload,
      fileRecord: {
        bucket_id: storageConfig.bucket,
        object_path: options.objectPath
      }
    },
    error: null
  };
}

async function requestData(api, path, options) {
  if (!api) {
    return { data: null, error: { message: "FlashAVTL API is not configured." } };
  }

  try {
    const payload = await api.request(path, options);
    return { data: payload?.data ?? payload, error: null };
  } catch (error) {
    return { data: null, error: toAppError(error) };
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    return { raw: text };
  }
}

function readStoredToken(storageKey) {
  try {
    return globalThis.localStorage?.getItem(storageKey) ?? null;
  } catch (_error) {
    return null;
  }
}

function writeStoredToken(storageKey, token) {
  try {
    if (!globalThis.localStorage) {
      return;
    }
    if (token) {
      globalThis.localStorage.setItem(storageKey, token);
    } else {
      globalThis.localStorage.removeItem(storageKey);
    }
  } catch (_error) {
    // Storage can be unavailable in private mode or React Native.
  }
}

function toAppError(error) {
  if (!error) {
    return null;
  }

  return {
    message: error.message ?? "Unknown FlashAVTL API error",
    status: error.status ?? null,
    details: error.details ?? null
  };
}
