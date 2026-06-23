import { cookies } from "next/headers";

export interface MerchantSession {
  accessToken: string;
  refreshToken: string;
  activeMerchantId: string | null;
}

export async function getMerchantSession(): Promise<MerchantSession | null> {
  const c = await cookies();
  const accessToken = c.get("access_token")?.value;
  const refreshToken = c.get("refresh_token")?.value;
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
    activeMerchantId: c.get("active_merchant_id")?.value ?? null,
  };
}
