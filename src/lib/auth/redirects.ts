export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Validate a post-login redirect target so it can only ever be an internal,
 * same-origin path — never an absolute/off-site URL. Prevents open-redirect
 * attacks via the `callbackUrl` query parameter.
 *
 * Accepts only values that start with a single "/", are not protocol-relative
 * ("//host") or backslash tricks, and resolve to a same-origin path. Anything
 * else (including a loop back to "/login") falls back to `fallback`.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = DEFAULT_LOGIN_REDIRECT,
): string {
  if (typeof raw !== "string") return fallback;

  const value = raw.trim();
  if (value.length === 0) return fallback;

  // Must be a relative path; block protocol-relative ("//") and backslashes
  // (e.g. "/\\evil.com", "\\evil.com", "/%09/evil.com").
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\")) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(value, "http://internal.invalid");
  } catch {
    return fallback;
  }

  // If a host/scheme was smuggled in, the origin would change.
  if (parsed.origin !== "http://internal.invalid") return fallback;

  const path = parsed.pathname + parsed.search;

  // Never send the user back to the login page (redirect loop).
  if (path === "/login" || path.startsWith("/login?") || path.startsWith("/login#")) {
    return fallback;
  }

  return path;
}
