import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://example.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.mock";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || FALLBACK_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || FALLBACK_SUPABASE_ANON_KEY;

  return createBrowserClient(url, anonKey);
}
