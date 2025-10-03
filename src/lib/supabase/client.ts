import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Use demo/placeholder values for development when env vars are missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key-for-development-only';
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

