export interface PanVerificationStatus {
  status: "not_started" | "verified";
  masked_pan: string | null;
  verified_name: string | null;
  category: string | null;
  verified_at: string | null;
}

export interface GstinVerificationStatus {
  status: "not_started" | "verified";
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
