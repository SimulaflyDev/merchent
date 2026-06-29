import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/session";
import { listMyMerchants } from "@/lib/api/merchants";
import { isApiError } from "@/lib/api/errors";
import ShopsClient from "./ShopsClient";

export const metadata = {
  title: "My Shops · SimulaFly Merchant",
  description: "Manage all your shops and create new ones from one place.",
};

export default async function MyShopsPage() {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  let shops;
  try {
    shops = await listMyMerchants();
  } catch (err) {
    if (isApiError(err) && err.status === 401) redirect("/api/auth/logout");
    throw err;
  }

  return (
    <ShopsClient
      shops={shops}
      activeMerchantId={session.activeMerchantId}
    />
  );
}
