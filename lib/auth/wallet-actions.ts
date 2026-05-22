"use server";

import { revalidatePath } from "next/cache";

import {
  topupIntent as apiTopupIntent,
  topupConfirm as apiTopupConfirm,
  updateWalletSettings as apiUpdateSettings,
} from "@/lib/api/wallet";
import type { TopupIntentResponse, WalletOut } from "@/lib/types/wallet";

export async function topupIntentAction(amount: number): Promise<TopupIntentResponse> {
  return apiTopupIntent(amount);
}

export async function topupConfirmAction(payload: {
  order_id: string;
  payment_id: string;
  signature: string;
}): Promise<WalletOut> {
  const wallet = await apiTopupConfirm(payload);
  revalidatePath("/merchant/billing");
  revalidatePath("/merchant/dashboard");
  return wallet;
}

export async function updateWalletSettingsAction(
  low_balance_threshold: number,
): Promise<WalletOut> {
  const wallet = await apiUpdateSettings({ low_balance_threshold });
  revalidatePath("/merchant/billing");
  return wallet;
}
