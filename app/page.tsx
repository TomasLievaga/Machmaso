import Discovery from "@/components/discovery";
import { displayName } from "@/lib/auth-input";
import { loadListings } from "@/lib/listings";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Load listings and the viewer per request; demo fallback dates are also
// generated per load.
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string | string[] }>;
}) {
  // Set by /auth/confirm after an email confirmation link.
  const { auth } = await searchParams;
  const authStatus = auth === "confirmed" || auth === "error" ? auth : null;
  const supabase = await createClient();
  // getClaims() verifies the session token. Used for display and ownership
  // only; Server Actions verify the user again before writing.
  const claims = supabase
    ? (await supabase.auth.getClaims()).data?.claims
    : null;
  const viewer = claims?.sub
    ? { id: claims.sub, name: displayName(claims.user_metadata) }
    : null;
  const { listings, source } = await loadListings(supabase, viewer?.id);
  return (
    <Discovery
      initialListings={listings}
      demoData={source === "demo"}
      authAvailable={supabaseConfigured}
      viewer={viewer ? { name: viewer.name } : null}
      authStatus={authStatus}
    />
  );
}
