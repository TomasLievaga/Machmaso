import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

// Only the email types this app sends (sign-up confirmation).
const allowedTypes: EmailOtpType[] = ["signup", "email"];

// Email confirmation callback. Supports the recommended template link
// (?token_hash=…&type=email) and the default PKCE link (?code=…).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), origin);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  // A relative Location keeps the browser on the host it used (so session
  // cookies match, e.g. 127.0.0.1 vs localhost) and can never leave the site.
  const target = (status: "confirmed" | "error") => {
    const url = new URL(next, origin);
    url.searchParams.set("auth", status);
    return new NextResponse(null, {
      status: 303,
      headers: { Location: `${url.pathname}${url.search}${url.hash}` },
    });
  };

  const supabase = await createClient();
  if (!supabase) return target("error");
  if (tokenHash && type && allowedTypes.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return target("confirmed");
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return target("confirmed");
  }
  return target("error");
}
