"use server";

import { revalidatePath } from "next/cache";

import {
  updateWalletSettings as apiUpdateSettings,
  getBalanceHistory as apiGetBalanceHistory,
  redeemCode as apiRedeemCode,
} from "@/lib/api/wallet";
import type { WalletOut, BalanceHistoryResponse, RedeemResponse } from "@/lib/types/wallet";

import { srvAction, type ActionResult } from "@/lib/api/action-utils";

export async function updateWalletSettingsAction(
  low_balance_threshold: number,
): Promise<ActionResult<WalletOut>> {
  return srvAction(async () => {
    const wallet = await apiUpdateSettings({ low_balance_threshold });
    revalidatePath("/merchant/billing");
    return wallet;
  });
}

export async function getBalanceHistoryAction(params: {
  limit?: number;
  offset?: number;
  time_window?: string;
  event_filter?: string;
}): Promise<ActionResult<BalanceHistoryResponse>> {
  return srvAction(() => apiGetBalanceHistory(params));
}

export async function redeemCodeAction(code: string): Promise<ActionResult<RedeemResponse>> {
  return srvAction(async () => {
    const resp = await apiRedeemCode(code);
    revalidatePath("/merchant/billing");
    return resp;
  });
}


