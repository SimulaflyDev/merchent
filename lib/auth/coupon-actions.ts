"use server";

import { revalidatePath } from "next/cache";
import { srvAction, type ActionResult } from "@/lib/api/action-utils";
import {
  createCoupon,
  type CreateCouponInput,
  type MerchantCoupon,
} from "@/lib/api/coupons";

export async function createCouponAction(
  input: CreateCouponInput,
): Promise<ActionResult<MerchantCoupon>> {
  return srvAction(async () => {
    const coupon = await createCoupon(input);
    revalidatePath("/merchant/orders");
    return coupon;
  });
}
