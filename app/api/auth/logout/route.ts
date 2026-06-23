import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const c = await cookies();
  c.delete("access_token");
  c.delete("refresh_token");
  c.delete("active_merchant_id");
  redirect("/merchant/sign_in");
}
