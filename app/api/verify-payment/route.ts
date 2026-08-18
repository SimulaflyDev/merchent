import { NextRequest, NextResponse } from "next/server";

import { api } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import { getMerchantSession } from "@/lib/auth/session";
import type { WalletOut } from "@/lib/types/wallet";

interface VerifyPaymentBody {
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
}

export async function POST(request: NextRequest) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: VerifyPaymentBody;
  try {
    body = (await request.json()) as VerifyPaymentBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return NextResponse.json(
      {
        error:
          "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
      },
      { status: 400 },
    );
  }

  try {
    // FastAPI performs HMAC-SHA256(order_id|payment_id, KEY_SECRET), checks
    // ownership, and credits the wallet atomically and idempotently.
    const wallet = await api<WalletOut>("/merchant/wallet/topup/confirm", {
      method: "POST",
      body: JSON.stringify({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      }),
    });
    return NextResponse.json({
      success: true,
      message: "Payment verified and wallet credited",
      wallet,
    });
  } catch (error) {
    if (isApiError(error) && error.status === 400) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }
    if (isApiError(error) && error.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Razorpay payment verification failed", error);
    return NextResponse.json({ error: "Could not verify payment" }, { status: 500 });
  }
}
