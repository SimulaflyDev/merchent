import { NextResponse } from "next/server";
import { createSupportTicket } from "@/lib/api/support";
import { getMerchantSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getMerchantSession();
    if (!session?.activeMerchantId) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const ticket = await createSupportTicket(body);
    return NextResponse.json(ticket, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.startsWith("HTTP 4") ? 400 : 500;
    return NextResponse.json({ detail: message }, { status });
  }
}
