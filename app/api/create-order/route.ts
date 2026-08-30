import { NextRequest, NextResponse } from "next/server";

import { api } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import { getMerchantSession } from "@/lib/auth/session";
import type { TopupIntentResponse } from "@/lib/types/wallet";

interface CreateOrderBody {
  amount?: unknown;
  currency?: unknown;
  receipt?: unknown;
}

export async function POST(request: NextRequest) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : "INR";
  if (!Number.isInteger(amount) || amount < 50_000) {
    return NextResponse.json(
      { error: "Minimum recharge amount is ₹500" },
      { status: 400 },
    );
  }
  if (amount > 50_000_000) {
    return NextResponse.json({ error: "Amount exceeds the ₹500,000 limit" }, { status: 400 });
  }
  if (currency !== "INR") {
    return NextResponse.json({ error: "Only INR payments are supported" }, { status: 400 });
  }
  if (body.receipt != null && (typeof body.receipt !== "string" || body.receipt.length > 40)) {
    return NextResponse.json({ error: "Receipt must be at most 40 characters" }, { status: 400 });
  }

  try {
    // The FastAPI wallet service creates the Razorpay order and persists a
    // pending transaction. It also owns the key secret; this route never does.
    const intent = await api<TopupIntentResponse>("/merchant/wallet/topup/intent", {
      method: "POST",
      body: JSON.stringify({ amount: amount / 100, currency }),
    });
    return NextResponse.json({
      order_id: intent.order_id,
      amount: Math.round(intent.amount * 100),
      currency: intent.currency,
    });
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return NextResponse.json({ error: "Razorpay API authentication failed" }, { status: 401 });
    }
    console.error("Razorpay order creation failed", error);
    return NextResponse.json({ error: "Could not create Razorpay order" }, { status: 500 });
  }
}
