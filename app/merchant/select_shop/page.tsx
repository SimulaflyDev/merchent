import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/session";
import { listMyMerchants } from "@/lib/api/merchants";
import { isApiError } from "@/lib/api/errors";
import SelectShopClient from "./SelectShopClient";

export const metadata = {
  title: "Who's managing today? · SimulaFly Merchant",
  description: "Select a shop profile to manage.",
};

export default async function SelectShopPage() {
  const session = await getMerchantSession();
  
  // Note: if user is not signed in, redirect them to sign_in
  // We don't check for session.activeMerchantId because they might not have selected one yet!
  
  let shops;
  try {
    shops = await listMyMerchants();
  } catch (err) {
    if (isApiError(err) && err.status === 401) {
      redirect("/merchant/sign_in");
    }
    throw err;
  }

  if (shops.length === 0) {
    redirect("/merchant/onboarding");
  }

  return (
    <SelectShopClient
      shops={shops}
      activeMerchantId={session?.activeMerchantId || null}
    />
  );
}
