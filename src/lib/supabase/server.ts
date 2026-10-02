import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseAnonKey, hasSupabaseEnv } from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which cannot set cookies mid-render.
          // The proxy (src/proxy.ts) refreshes sessions on the request edge instead.
        }
      },
    },
  });
}