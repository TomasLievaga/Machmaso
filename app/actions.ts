"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { displayName, parseSignIn, parseSignUp } from "@/lib/auth-input";
import type { Listing } from "@/lib/data";
import { berlinToday } from "@/lib/data";
import { parseListingInput, type ListingInputError } from "@/lib/listing-input";
import { fromRow, toRow, type ListingRow } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

export type AuthError =
  | "email"
  | "password"
  | "name"
  | "credentials"
  | "unconfirmed"
  | "exists"
  | "rateLimit"
  | "unavailable"
  | "failed";
export type AuthResult =
  | { ok: true; status: "signedIn" | "confirmEmail" }
  | { ok: false; error: AuthError };

function authError(code: string | undefined, status?: number): AuthError {
  if (code === "invalid_credentials") return "credentials";
  if (code === "email_not_confirmed") return "unconfirmed";
  if (code === "user_already_exists" || code === "email_exists")
    return "exists";
  if (code === "weak_password") return "password";
  if (code === "email_address_invalid") return "email";
  if (code?.startsWith("over_") || status === 429) return "rateLimit";
  return "failed";
}

// Where confirmation emails send people back to. NEXT_PUBLIC_SITE_URL pins
// production; otherwise the request origin (checked by Next.js for Server
// Actions) is used. Supabase only honors URLs on its Redirect URLs allowlist.
async function confirmUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = configured || (await headers()).get("origin") || "";
  try {
    const url = new URL("/auth/confirm", origin);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export async function signUp(input: unknown): Promise<AuthResult> {
  const parsed = parseSignUp(input);
  if (!parsed.ok) return parsed;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "unavailable" };
  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      emailRedirectTo: await confirmUrl(),
      data: { display_name: parsed.name },
    },
  });
  if (error) return { ok: false, error: authError(error.code, error.status) };
  // With email confirmation enabled there is no session yet. Supabase also
  // returns no session for an already registered address, so both cases look
  // the same to visitors.
  if (!data.session) return { ok: true, status: "confirmEmail" };
  revalidatePath("/");
  return { ok: true, status: "signedIn" };
}

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = parseSignIn(input);
  if (!parsed.ok) return parsed;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "unavailable" };
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });
  if (error) return { ok: false, error: authError(error.code, error.status) };
  revalidatePath("/");
  return { ok: true, status: "signedIn" };
}

export async function signOut(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.auth.signOut();
  revalidatePath("/");
  return { ok: !error };
}

export type CreateListingResult =
  | { ok: true; listing: Listing }
  | {
      ok: false;
      error: ListingInputError | "auth" | "unavailable" | "failed";
    };

// Error codes seen before the listing-authors migration is applied: unknown
// author_id column, or no INSERT grant/policy yet.
const notMigrated = new Set(["PGRST204", "42703", "42501"]);

export async function createListing(
  input: unknown,
): Promise<CreateListingResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "unavailable" };
  // getUser() asks Supabase Auth to verify the session; the author comes from
  // here, never from the browser.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const parsed = parseListingInput(input, berlinToday());
  if (!parsed.ok) return parsed;

  const { data, error } = await supabase
    .from("listings")
    .insert(toRow(parsed.draft, user.id, displayName(user.user_metadata)))
    .select("*")
    .single<ListingRow>();
  if (error || !data) {
    console.error("Could not create listing:", error?.code, error?.message);
    if (error && notMigrated.has(error.code))
      return { ok: false, error: "unavailable" };
    if (error?.code === "23514") return { ok: false, error: "invalid" };
    return { ok: false, error: "failed" };
  }
  revalidatePath("/");
  return { ok: true, listing: fromRow(data, user.id) };
}
