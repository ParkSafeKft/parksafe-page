import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings to prevent build time errors
// The client will fail at runtime if these are missing, which is expected behavior
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
