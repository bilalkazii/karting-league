import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export interface SignInResult {
  error: string | null;
}

export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const client = createBrowserSupabaseClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(email: string, password: string): Promise<SignInResult> {
  const client = createBrowserSupabaseClient();
  const { error } = await client.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<SignInResult> {
  const client = createBrowserSupabaseClient();
  const { error } = await client.auth.signOut();
  return { error: error?.message ?? null };
}