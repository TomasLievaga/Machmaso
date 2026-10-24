export type AuthInputError = "email" | "password" | "name";

export const passwordLimits = { min: 8, max: 72 };
export const nameLimit = 40;

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const length = (value: string) => Array.from(value).length;

function parseEmail(value: unknown) {
  const email = text(value).toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

export function parseSignIn(raw: unknown) {
  const input = (raw ?? {}) as Record<string, unknown>;
  const email = parseEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";
  if (!email) return { ok: false as const, error: "email" as AuthInputError };
  if (!password)
    return { ok: false as const, error: "password" as AuthInputError };
  return { ok: true as const, email, password };
}

export function parseSignUp(raw: unknown) {
  const input = (raw ?? {}) as Record<string, unknown>;
  const signIn = parseSignIn(raw);
  if (!signIn.ok) return signIn;
  // bcrypt, used by Supabase Auth, only considers the first 72 bytes.
  const bytes = new TextEncoder().encode(signIn.password).length;
  if (signIn.password.length < passwordLimits.min || bytes > passwordLimits.max)
    return { ok: false as const, error: "password" as AuthInputError };
  const name = text(input.name);
  if (!name || length(name) > nameLimit)
    return { ok: false as const, error: "name" as AuthInputError };
  return { ...signIn, name };
}

// Public name for a verified user, from the name given at sign-up.
export function displayName(metadata: unknown) {
  const value = (metadata as { display_name?: unknown } | null)?.display_name;
  const name = text(value);
  return name && length(name) <= nameLimit ? name : "Neighbor";
}
