import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/api/notifications";
import { getMerchantSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getMerchantSession();
    if (!session?.activeMerchantId) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread_only") === "true";
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    const data = await listNotifications({ unread_only: unreadOnly, limit });
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = message.startsWith("HTTP 4") ? 400 : 500;
    return NextResponse.json({ detail: message }, { status });
  }
}
