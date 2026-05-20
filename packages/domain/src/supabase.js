import { createClient } from "@supabase/supabase-js";

export function hasSupabaseConfig(config) {
  return Boolean(config?.url && config?.anonKey);
}

export function createFlashAvtlClient(config) {
  if (!hasSupabaseConfig(config)) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: config.detectSessionInUrl ?? false
    },
    global: {
      headers: {
        "x-application-name": "flashavtl"
      }
    }
  });
}

export function toAppError(error) {
  if (!error) {
    return null;
  }

  return {
    message: error.message ?? "Unknown Supabase error",
    status: error.status ?? error.code ?? null,
    details: error.details ?? error.hint ?? null
  };
}
