import "server-only";
import { api } from "./client";
import type {
  WalletOut,
  PaginatedTransactions,
  TopupIntentResponse,
} from "@/lib/types/wallet";

export async function getWallet(): Promise<WalletOut> {
  return api<WalletOut>("/merchant/wallet/");
}

export async function listTransactions(
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedTransactions> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const q = qs.toString();
  return api<PaginatedTransactions>(`/merchant/wallet/transactions${q ? `?${q}` : ""}`);
}

export async function topupIntent(amount: number): Promise<TopupIntentResponse> {
  return api<TopupIntentResponse>("/merchant/wallet/topup/intent", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function topupConfirm(payload: {
  order_id: string;
  payment_id: string;
  signature: string;
}): Promise<WalletOut> {
  return api<WalletOut>("/merchant/wallet/topup/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWalletSettings(payload: {
  low_balance_threshold: number;
}): Promise<WalletOut> {
  return api<WalletOut>("/merchant/wallet/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
