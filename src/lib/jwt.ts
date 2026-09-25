/**
 * The seconds a JWT has left, read from its `exp` claim without verifying it —
 * the API does the verifying. Null when the token carries no readable `exp`.
 */
export function secondsLeft(token: string): number | null {
  try {
    const segment = (token.split(".")[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as { exp?: unknown };
    if (typeof payload.exp !== "number") return null;
    return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
  } catch {
    return null;
  }
}
