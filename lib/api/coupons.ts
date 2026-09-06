import "server-only";

import { api } from "./client";

export interface MerchantCoupon {
  id: string;
  merchant_id: string;
  code: string;
  title: string;
  discount_type: "flat" | "percentage";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

export interface CreateCouponInput {
  code: string;
  title: string;
  discount_type: "flat" | "percentage";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  expires_at?: string;
}

export async function createCoupon(
  body: CreateCouponInput,
): Promise<MerchantCoupon> {
  return api<MerchantCoupon>("/coupons/merchant/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
