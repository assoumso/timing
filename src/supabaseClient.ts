import { createClient } from '@supabase/supabase-js';

// User credentials with fallback override configurations
const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
  "https://utixbzqtakabfjjeajzs.supabase.co";

const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  "sb_publishable_GGN4I9asearMP27tPHXAXg_GhxAJGTy";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

