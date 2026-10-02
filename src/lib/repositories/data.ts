import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Driver } from "@/types/driver";
import { mapDriverRow } from "@/lib/repositories/mappers";

/**
 * Shared DB read helpers used by the repository layer. These take the caller's
 * server client (RLS still applies per request) and return data already mapped
 * to domain types.
 */

export async function fetchDriversByIds(client: SupabaseClient<Database>, ids: string[]): Promise<Driver[]> {
  if (ids.length === 0) return [];

  const { data: rows } = await client.from("drivers").select("*").in("id", ids);
  if (!rows || rows.length === 0) return [];

  const profileIds = rows.map((r) => r.profile_id);
  const { data: profiles } = await client.from("profiles").select("id, full_name").in("id", profileIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return rows.map((row) => mapDriverRow(row, nameById.get(row.profile_id) ?? ""));
}