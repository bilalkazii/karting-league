import type { Group } from "@/types/group";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getGroupById as getMockGroupById } from "@/lib/mock-data";
import { mapGroupsRow } from "@/lib/repositories/mappers";

/**
 * Group repository — one resource, mock fallback.
 *
 * When Supabase is configured, the database is the source of truth: a
 * missing or denied row returns null (RLS keeps reads member-scoped).
 * When Supabase is NOT configured (no env), lookups fall back to the mock
 * helpers so every current page keeps working without a live project.
 */
export async function getGroupById(id: string): Promise<Group | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockGroupById(id) ?? null;

  const { data, error } = await client.from("groups").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapGroupsRow(data);
}