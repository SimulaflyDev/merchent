export type MemberRole = "owner" | "admin" | "staff";
export type MerchantStatus = "active" | "suspended" | "trial";

export interface MerchantOut {
  id: string;
  /** Human-readable partner identifier e.g. "m1234567" */
  partner_id: string | null;
  /** Short shop identifier e.g. "S123" */
  shop_id: string | null;
  slug: string;
  legal_name: string;
  display_name: string;
  logo_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  country: string;
  status: MerchantStatus;
  referral_code: string;
  settings: Record<string, unknown>;
  /** Free-text address set once at creation — immutable thereafter */
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  range_km: number | null;
  /** Whether identity KYC has been completed for this merchant (inherited from primary shop). */
  is_kyc_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MerchantMemberOut {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: MemberRole;
  joined_at: string;
}

export interface MerchantCreatePayload {
  legal_name: string;
  display_name: string;
  country?: string;
  support_email?: string;
  support_phone?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  /** Shop address — set once, immutable after creation */
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  range_km?: number | null;
  referred_by_code?: string;
}

export interface MerchantUpdatePayload {
  legal_name?: string;
  display_name?: string;
  logo_url?: string;
  support_email?: string;
  support_phone?: string;
  settings?: Record<string, unknown>;
  range_km?: number | null;
  is_kyc_completed?: boolean;
  // NOTE: address, latitude, longitude are intentionally omitted —
  // location is set once at creation and cannot be changed via PATCH.
  // Merchants must contact support@simulafly.com for location changes.
}

export interface MemberInvitePayload {
  email: string;
  role: MemberRole;
}
