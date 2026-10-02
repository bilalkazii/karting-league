function readEnv(name: string): string {
  const value = process.env[name];
  return value?.trim() ?? "";
}

export function getSupabaseUrl(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey(): string {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function hasSupabaseServiceRoleEnv(): boolean {
  return Boolean(getSupabaseServiceRoleKey());
}