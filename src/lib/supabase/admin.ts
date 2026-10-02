import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseServiceRoleKey, hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";

export function createServiceRoleSupabaseClient() {
  if (!hasSupabaseServiceRoleEnv() || !getSupabaseUrl()) return null;
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}