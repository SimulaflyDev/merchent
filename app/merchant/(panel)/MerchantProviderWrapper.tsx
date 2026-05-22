import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import { MerchantProvider } from "../context/MerchantContext";

export default async function MerchantProviderWrapper({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");
  const merchant = await getMerchant(session.activeMerchantId);
  return (
    <MerchantProvider activeMerchantId={session.activeMerchantId} initialMerchant={merchant}>
      {children}
    </MerchantProvider>
  );
}
