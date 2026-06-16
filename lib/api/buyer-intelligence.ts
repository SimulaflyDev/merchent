import "server-only";
import { api } from "./client";

export interface ShopperOut {
  user_id: string;
  city: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  intent_score: number;
  intent_label: string;
  intent_tier: "ready" | "high" | "medium" | "low";
  interaction_count: number;
  unlocked: boolean;
  click_count: number;
  rag_count: number;
  image_count: number;
  redirect_count: number;
}

export interface PaginatedShoppers {
  items: ShopperOut[];
  total: number;
  limit: number;
  offset: number;
}

export async function listShoppers(params: {
  limit?: number;
  offset?: number;
  since_days?: number;
} = {}): Promise<PaginatedShoppers> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.since_days != null) qs.set("since_days", String(params.since_days));
  const q = qs.toString();
  return api<PaginatedShoppers>(`/merchant/buyer-intelligence/${q ? `?${q}` : ""}`);
}

export interface ShopperProductInteraction {
  name: string;
  views: number;
  engagement: string;
}

export interface ShopperTimelineEvent {
  time: string;
  icon: string;
  text: string;
  type: string;
}

export interface ShopperDetailResponse {
  user_id: string;
  city: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  intent_score: number;
  intent_label: string;
  intent_tier: "ready" | "high" | "medium" | "low";
  unlocked: boolean;
  interaction_count: number;
  click_count: number;
  rag_count: number;
  image_count: number;
  redirect_count: number;
  total_orders: number;
  lifetime_spend: number;
  viewed_products: ShopperProductInteraction[];
  timeline: ShopperTimelineEvent[];
  intent_reasons: string[];
  suggested_bundle: string[];
}

export async function getShopperDetail(userId: string): Promise<ShopperDetailResponse> {
  return api<ShopperDetailResponse>(`/merchant/buyer-intelligence/${userId}`);
}

