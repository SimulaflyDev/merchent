"use server";

import { revalidatePath } from "next/cache";

import {
  topupIntent as apiTopupIntent,
  topupConfirm as apiTopupConfirm,
  updateWalletSettings as apiUpdateSettings,
  topupBypass as apiTopupBypass,
  getBalanceHistory as apiGetBalanceHistory,
  redeemCode as apiRedeemCode,
} from "@/lib/api/wallet";
import type { TopupIntentResponse, WalletOut, BalanceHistoryResponse, RedeemResponse } from "@/lib/types/wallet";

import { srvAction, type ActionResult } from "@/lib/api/action-utils";

export async function topupIntentAction(amount: number): Promise<ActionResult<TopupIntentResponse>> {
  return srvAction(() => apiTopupIntent(amount));
}

export async function topupConfirmAction(payload: {
  order_id: string;
  payment_id: string;
  signature: string;
}): Promise<ActionResult<WalletOut>> {
  return srvAction(async () => {
    const wallet = await apiTopupConfirm(payload);
    revalidatePath("/merchant/billing");
    revalidatePath("/merchant/dashboard");
    return wallet;
  });
}

export async function updateWalletSettingsAction(
  low_balance_threshold: number,
): Promise<ActionResult<WalletOut>> {
  return srvAction(async () => {
    const wallet = await apiUpdateSettings({ low_balance_threshold });
    revalidatePath("/merchant/billing");
    return wallet;
  });
}

export async function topupBypassAction(amount: number): Promise<ActionResult<WalletOut>> {
  return srvAction(async () => {
    const wallet = await apiTopupBypass(amount);
    revalidatePath("/merchant/billing");
    revalidatePath("/merchant/dashboard");
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


