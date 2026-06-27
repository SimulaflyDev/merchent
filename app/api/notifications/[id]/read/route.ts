import { NextResponse } from "next/server";
import { markNotificationAsRead } from "@/lib/api/notifications";
import { getMerchantSession } from "@/lib/auth/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getMerchantSession();
    if (!session?.activeMerchantId) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const notification = await markNotificationAsRead(id);
    return NextResponse.json(notification, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.startsWith("HTTP 4") ? 400 : 500;
    return NextResponse.json({ detail: message }, { status });
  }
}
