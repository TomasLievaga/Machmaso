import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Single shared client. Null when the environment is not configured, so the
// app can fall back to built-in demo data. No auth yet, so no session storage.
export const supabase =
  url && key
    ? createClient(url, key, { auth: { persistSession: false } })
    : null;
