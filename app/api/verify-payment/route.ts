import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Missing fields: return 400
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        error: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature must be provided",
      }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("Razorpay key secret is missing in env");
      return NextResponse.json({ error: "Razorpay credentials not configured on server" }, { status: 500 });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      // Signature mismatch: return 400
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
