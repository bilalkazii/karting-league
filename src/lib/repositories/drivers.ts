import type { Driver } from "@/types/driver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDriverById as getMockDriverById } from "@/lib/mock-data";
import { mapDriverRow } from "@/lib/repositories/mappers";
import { fetchDriversByIds } from "@/lib/repositories/data";

/**
 * Driver repository — one resource, mock fallback.
 *
 * When Supabase is configured, the database is the source of truth (RLS keeps
 * driver identity rows readable by any authenticated user). When it is NOT
 * configured (no env), lookups fall back to the mock helpers so every current
 * page keeps working without a live project.
 */
export async function getDriverById(id: string): Promise<Driver | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockDriverById(id) ?? null;

  const { data: row, error } = await client.from("drivers").select("*").eq("id", id).maybeSingle();
  if (error || !row) return null;

  const { data: profile } = await client.from("profiles").select("full_name").eq("id", row.profile_id).maybeSingle();
  return mapDriverRow(row, profile?.full_name ?? "");
}

/**
 * Resolves several drivers by id, preserving caller order. Used by pages so a
 * DB-backed group can render member/team identities without per-driver trips.
 */
export async function getDriversByIds(ids: string[]): Promise<Driver[]> {
  const client = await createServerSupabaseClient();
  if (!client) return ids.map((id) => getMockDriverById(id)).filter((d): d is Driver => Boolean(d));

  const byId = new Map((await fetchDriversByIds(client, ids)).map((d) => [d.id, d]));
  return ids.flatMap((id) => {
    const driver = byId.get(id);
    return driver ? [driver] : [];
  });
}