import "server-only";
import { cookies } from "next/headers";
import { ApiError } from "./errors";
import { cookieOpts, ACCESS_TTL, REFRESH_TTL, isTokenExpired } from "@/lib/auth/jwt";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  skipMerchantId?: boolean;
}

async function refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: HTTP ${res.status}`);
  }

  return res.json();
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, skipMerchantId = false, headers, ...rest } = opts;

  const h = new Headers(headers);
  if (!(opts.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const c = await cookies();
    let accessToken = c.get("access_token")?.value;
    const refreshToken = c.get("refresh_token")?.value;

    // 1. Check if token is expired before calling the API
    if (refreshToken && (!accessToken || isTokenExpired(accessToken))) {
      try {
        const tokens = await refreshTokens(refreshToken);
        accessToken = tokens.access_token;
        try {
          c.set("access_token", tokens.access_token, cookieOpts(ACCESS_TTL));
          c.set("refresh_token", tokens.refresh_token, cookieOpts(REFRESH_TTL));
        } catch (cookieErr) {
          console.warn("Could not write refreshed tokens to cookies (expected in Server Component render):", cookieErr);
        }
      } catch (refreshErr) {
        console.error("Failed to refresh token in API client (pre-check):", refreshErr);
        try {
          c.delete("access_token");
          c.delete("refresh_token");
        } catch {}
      }
    }

    if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);

    const merchantId = c.get("active_merchant_id")?.value;
    // Caller opts out of merchant header with skipMerchantId; not auto-stripped by path shape.
    if (merchantId && !skipMerchantId) {
      h.set("X-Merchant-Id", merchantId);
    }
  }

  let res = await fetch(`${BASE}${path}`, { ...rest, headers: h, cache: "no-store" });

  // 2. Catch 401 Unauthorized errors and attempt one retry
  if (res.status === 401 && !skipAuth) {
    const c = await cookies();
    const refreshToken = c.get("refresh_token")?.value;
    if (refreshToken) {
      try {
        const tokens = await refreshTokens(refreshToken);
        try {
          c.set("access_token", tokens.access_token, cookieOpts(ACCESS_TTL));
          c.set("refresh_token", tokens.refresh_token, cookieOpts(REFRESH_TTL));
        } catch (cookieErr) {
          console.warn("Could not write refreshed tokens to cookies (expected in Server Component render):", cookieErr);
        }

        h.set("Authorization", `Bearer ${tokens.access_token}`);
        res = await fetch(`${BASE}${path}`, { ...rest, headers: h, cache: "no-store" });
      } catch (refreshErr) {
        console.error("Failed to refresh token in API client (on 401):", refreshErr);
      }
    }
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    let payload: unknown = undefined;
    try {
      payload = await res.json();
      detail = (payload as { detail?: string })?.detail ?? detail;
    } catch {
      /* non-JSON error body — keep generic detail */
    }
    throw new ApiError(res.status, detail, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
