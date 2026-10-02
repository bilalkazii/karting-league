import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const client = await createServerSupabaseClient();
  if (!client) return null;

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return { id: user.id, email: user.email ?? null };
}