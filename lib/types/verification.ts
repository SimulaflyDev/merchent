export interface PanVerificationStatus {
  status: "not_started" | "details_checked" | "verified";
  source?: "sandbox" | "admin" | null;
  masked_pan: string | null;
  verified_name: string | null;
  category: string | null;
  verified_at: string | null;
}

export interface GstinVerificationStatus {
  status: "not_started" | "details_checked" | "verified";
  source?: "sandbox" | "admin" | null;
  gstin: string | null;
  legal_name: string | null;
  business_nature: string | null;
  state_name: string | null;
  registration_status: string | null;
  verified_at: string | null;
}

export interface MerchantVerification {
  pan: PanVerificationStatus;
  gstin: GstinVerificationStatus;
  other_checks: {
    authorized_person: { status: "pending" | "verified" };
    business_address: { status: "pending" | "verified" };
    shop_location: { status: "pending" | "verified" };
  };
  agreement: {
    accepted: boolean;
    accepted_at: string | null;
    versions: Record<string, string>;
  };
  is_kyc_completed: boolean;
  approval_status: "draft" | "pending_verification" | "approved" | "rejected";
  can_activate: boolean;
  manually_verified?: boolean;
  otp?: MerchantOtpStatus;
}

export interface MerchantOtpStatus {
  status: "not_started" | "pending" | "expired" | "locked" | "verified" | "not_required";
  challenge_id: string | null;
  gstin: string | null;
  expires_at: string | null;
  resend_available_at: string | null;
  attempts_remaining: number | null;
  verified_at: string | null;
}

export interface MerchantOtpStartPayload {
  gstin: string;
  username: string;
  consent: true;
}

export interface MerchantOtpConfirmPayload {
  challenge_id: string;
  otp: string;
}

export interface PanVerificationPayload {
  pan: string;
  name_as_per_pan: string;
  date_of_birth: string;
  consent: true;
}

export interface GstinVerificationPayload {
  gstin: string;
}

export interface AgreementAcceptancePayload {
  merchant_agreement: true;
  terms_and_conditions: true;
  privacy_policy: true;
  marketplace_rules: true;
  product_listing_policy: true;
  cancellation_return_rules: true;
  merchant_obligations_and_fees: true;
}
