import "server-only";
import { api } from "./client";
import type {
  WalletOut,
  PaginatedTransactions,
  BalanceHistoryResponse,
  RedeemResponse,
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

export async function updateWalletSettings(payload: {
  low_balance_threshold: number;
}): Promise<WalletOut> {
  return api<WalletOut>("/merchant/wallet/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getBalanceHistory(
  params: { limit?: number; offset?: number; time_window?: string; event_filter?: string } = {}
): Promise<BalanceHistoryResponse> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.time_window != null) qs.set("time_window", params.time_window);
  if (params.event_filter != null) qs.set("event_filter", params.event_filter);
  const q = qs.toString();
  return api<BalanceHistoryResponse>(`/merchant/wallet/balance-history${q ? `?${q}` : ""}`);
}

export async function redeemCode(code: string): Promise<RedeemResponse> {
  return api<RedeemResponse>("/merchant/wallet/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}


