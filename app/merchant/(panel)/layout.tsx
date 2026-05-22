import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import MerchantPanelLayoutClient from "./MerchantPanelLayoutClient";

export default async function MerchantPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");
  const merchant = await getMerchant(session.activeMerchantId);
  return (
    <MerchantPanelLayoutClient
      activeMerchantId={session.activeMerchantId}
      initialMerchant={merchant}
    >
      {children}
    </MerchantPanelLayoutClient>
  );
}
