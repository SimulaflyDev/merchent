export type MemberRole = "owner" | "admin" | "staff";
export type MerchantStatus = "active" | "suspended" | "trial";

export interface MerchantOut {
  id: string;
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
}

export interface MerchantUpdatePayload {
  legal_name?: string;
  display_name?: string;
  logo_url?: string;
  support_email?: string;
  support_phone?: string;
  settings?: Record<string, unknown>;
}

export interface MemberInvitePayload {
  email: string;
  role: MemberRole;
}
