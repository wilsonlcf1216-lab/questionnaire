import { createClient } from "@supabase/supabase-js";

import { ENV, isSupabaseConfigured } from "@/utils/env";

export const supabase = isSupabaseConfigured()
  ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
