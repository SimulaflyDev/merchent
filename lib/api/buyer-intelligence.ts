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
