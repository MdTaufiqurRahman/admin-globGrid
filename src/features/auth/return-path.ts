/**
 * Where to go after signing in, if it is a page of this app. Anything else —
 * another origin, a protocol-relative `//host` — is dropped, so a crafted link
 * cannot send the admin off-site once signed in.
 */
export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}
