const ONE_DAY = 60 * 60 * 24;
export const ACCESS_TTL = ONE_DAY;       // backend access token lifetime
export const REFRESH_TTL = ONE_DAY * 30; // backend refresh token lifetime

export function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null; // in milliseconds
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewSeconds = 10): boolean {
  const expiry = getJwtExpiry(token);
  if (!expiry) return true;
  return expiry < Date.now() + skewSeconds * 1000;
}
