import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseAnonKey, hasSupabaseEnv } from "@/lib/supabase/env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (client) return client;
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  client = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  return client;
}