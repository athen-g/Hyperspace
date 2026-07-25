import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

// Admin client bypasses RLS policies.
// WARNING: This client should ONLY be used in code running securely or under restricted access
// (like a password-protected admin dashboard route, though in pure React it is exposed in the bundle).
// For complete security in a serverless app, Supabase Custom Claims or standard auth is recommended.
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
