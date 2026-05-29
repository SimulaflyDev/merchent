import "server-only";
import { cookies } from "next/headers";
import { ApiError } from "./errors";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  skipMerchantId?: boolean;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, skipMerchantId = false, headers, ...rest } = opts;

  const h = new Headers(headers);
  h.set("Content-Type", "application/json");

  if (!skipAuth) {
    const c = await cookies();
    const accessToken = c.get("access_token")?.value;
    if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);

    const merchantId = c.get("active_merchant_id")?.value;
    // Caller opts out of merchant header with skipMerchantId; not auto-stripped by path shape.
    if (merchantId && !skipMerchantId) {
      h.set("X-Merchant-Id", merchantId);
    }
  }

  const res = await fetch(`${BASE}${path}`, { ...rest, headers: h, cache: "no-store" });

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
