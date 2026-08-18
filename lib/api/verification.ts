import { api } from "./client";
import type {
  GstinVerificationPayload,
  AgreementAcceptancePayload,
  MerchantVerification,
  PanVerificationPayload,
} from "@/lib/types/verification";

export function getMerchantVerification(merchantId: string): Promise<MerchantVerification> {
  return api(`/merchants/${merchantId}/verification`);
}

export function acceptMerchantAgreements(
  merchantId: string,
  payload: AgreementAcceptancePayload,
): Promise<MerchantVerification> {
  return api(`/merchants/${merchantId}/verification/agreements/accept`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyMerchantPan(
  merchantId: string,
  payload: PanVerificationPayload,
): Promise<MerchantVerification> {
  return api(`/merchants/${merchantId}/verification/pan`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyMerchantGstin(
  merchantId: string,
  payload: GstinVerificationPayload,
): Promise<MerchantVerification> {
  return api(`/merchants/${merchantId}/verification/gstin`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
