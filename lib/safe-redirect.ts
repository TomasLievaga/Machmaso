// Turns an untrusted `next` value into a same-origin path, so auth callbacks
// cannot be used as open redirects. Accepts relative paths and absolute URLs
// on `origin` (the email template passes {{ .RedirectTo }}); anything else
// falls back to "/".
export function safeNextPath(next: string | null, origin: string) {
  if (!next) return "/";
  // Reject protocol-relative and backslash tricks before URL parsing.
  if (/^\s*(\/\/|\/\\|\\)/.test(next) || /[\u0000-\u001f]/.test(next))
    return "/";
  let url: URL;
  try {
    url = new URL(next, origin);
  } catch {
    return "/";
  }
  if (url.origin !== new URL(origin).origin) return "/";
  // Do not bounce back into the callback itself.
  if (url.pathname.startsWith("/auth/")) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
