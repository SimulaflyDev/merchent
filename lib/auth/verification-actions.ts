"use server";

import {
  getMerchantVerification,
  acceptMerchantAgreements,
  verifyMerchantGstin,
  verifyMerchantPan,
  sendMerchantOtp,
  confirmMerchantOtp,
} from "@/lib/api/verification";
import { srvAction, type ActionResult } from "@/lib/api/action-utils";
import type {
  AgreementAcceptancePayload,
  GstinVerificationPayload,
  MerchantVerification,
  PanVerificationPayload,
  MerchantOtpStartPayload,
  MerchantOtpConfirmPayload,
} from "@/lib/types/verification";

export async function refreshMerchantVerificationAction(
  merchantId: string,
): Promise<ActionResult<MerchantVerification>> {
  return srvAction(() => getMerchantVerification(merchantId));
}

export async function sendMerchantOtpAction(merchantId: string, payload: MerchantOtpStartPayload): Promise<ActionResult<MerchantVerification>> {
  return srvAction(() => sendMerchantOtp(merchantId, payload));
}

export async function confirmMerchantOtpAction(merchantId: string, payload: MerchantOtpConfirmPayload): Promise<ActionResult<MerchantVerification>> {
  return srvAction(() => confirmMerchantOtp(merchantId, payload));
}

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
