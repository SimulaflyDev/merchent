export type MemberRole = "owner" | "admin" | "staff";
export type MerchantStatus = "active" | "suspended" | "trial";

export interface MerchantStorefrontSettings {
  tagline?: string;
  description?: string;
  hero_image_url?: string;
  featured_categories?: string[];
}

export interface MerchantSettings extends Record<string, unknown> {
  storefront?: MerchantStorefrontSettings;
}

export interface MerchantOut {
  id: string;
  /** Human-readable Merchant Partner Unique Identification Number (MPUID) e.g. "SIM-M-MH-000142-M" */
  partner_id: string | null;
  /** Human-readable Merchant Partner Shop Unique Identification Number (MPSUID) e.g. "SIM-S-000142-01-M" */
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
  settings: MerchantSettings;
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
  /** 2-letter State Code for MPUID generation e.g. "MH", "DL" */
  state_code?: string;
  /** 1-character City Code for regional routing e.g. "M", "N" */
  city_code?: string;
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
  // NOTE: address, latitude, longitude are intentionally omitted —
  // location is set once at creation and cannot be changed via PATCH.
  // Merchants must contact support@simulafly.com for location changes.
}

export interface MemberInvitePayload {
  email: string;
  role: MemberRole;
}
