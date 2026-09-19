import { androidAssetLinks } from "@/lib/android-app-links";

export const dynamic = "force-dynamic";

// Android reads this without a login or redirect when verifying shared links.
export function GET() {
  try {
    return Response.json(androidAssetLinks(), {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return Response.json({ error: "App link verification is not configured" }, { status: 503 });
  }
}
