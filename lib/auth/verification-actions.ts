"use server";

import {
  acceptMerchantAgreements,
  verifyMerchantGstin,
  verifyMerchantPan,
} from "@/lib/api/verification";
import { srvAction, type ActionResult } from "@/lib/api/action-utils";
import type {
  AgreementAcceptancePayload,
  GstinVerificationPayload,
  MerchantVerification,
  PanVerificationPayload,
} from "@/lib/types/verification";

export async function verifyMerchantPanAction(
  merchantId: string,
  payload: PanVerificationPayload,
): Promise<ActionResult<MerchantVerification>> {
  return srvAction(() => verifyMerchantPan(merchantId, payload));
}

export async function acceptMerchantAgreementsAction(
  merchantId: string,
  payload: AgreementAcceptancePayload,
): Promise<ActionResult<MerchantVerification>> {
  return srvAction(() => acceptMerchantAgreements(merchantId, payload));
}

export async function verifyMerchantGstinAction(
  merchantId: string,
  payload: GstinVerificationPayload,
): Promise<ActionResult<MerchantVerification>> {
  return srvAction(() => verifyMerchantGstin(merchantId, payload));
}
