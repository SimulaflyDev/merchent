import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getMerchantSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  // Check auth - return 401 on auth failures
  const session = await getMerchantSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { amount, currency = "INR", receipt } = body;

    // Validate amount >= 100 paise
    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json({ error: "Amount must be at least 100 paise" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay keys are missing in env");
      return NextResponse.json({ error: "Razorpay credentials not configured on server" }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await instance.orders.create({
      amount: Math.round(parsedAmount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Razorpay API authentication failed" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
