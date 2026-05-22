import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { MerchantProvider } from "../context/MerchantContext";

export default async function MerchantProviderWrapper({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");
  return <MerchantProvider activeMerchantId={session.activeMerchantId}>{children}</MerchantProvider>;
}
