import { NextResponse } from "next/server";
import { markAllNotificationsAsRead } from "@/lib/api/notifications";
import { getMerchantSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await getMerchantSession();
    if (!session?.activeMerchantId) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    await markAllNotificationsAsRead();
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.startsWith("HTTP 4") ? 400 : 500;
    return NextResponse.json({ detail: message }, { status });
  }
}
