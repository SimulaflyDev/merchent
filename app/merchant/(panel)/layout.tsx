import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import { getWallet } from "@/lib/api/wallet";
import MerchantPanelLayoutClient from "./MerchantPanelLayoutClient";

export default async function MerchantPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  const [merchant, wallet] = await Promise.all([
    getMerchant(session.activeMerchantId),
    getWallet(),
  ]);

  return (
    <MerchantPanelLayoutClient
      activeMerchantId={session.activeMerchantId}
      initialMerchant={merchant}
      initialWallet={wallet}
    >
      {children}
    </MerchantPanelLayoutClient>
  );
}
