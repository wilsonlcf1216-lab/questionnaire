const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export const ENV = {
  supabaseUrl,
  supabaseAnonKey,
  adminEmails,
  basePath: import.meta.env.VITE_BASE_PATH?.trim() || import.meta.env.BASE_URL || "/",
};

export function isSupabaseConfigured() {
  return Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  if (ENV.adminEmails.length === 0) {
    return true;
  }

  return ENV.adminEmails.includes(email.toLowerCase());
}
