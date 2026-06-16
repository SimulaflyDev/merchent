import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import { getWallet } from "@/lib/api/wallet";
import { isApiError } from "@/lib/api/errors";
import MerchantPanelLayoutClient from "./MerchantPanelLayoutClient";

export default async function MerchantPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  let merchant;
  let wallet;

  try {
    const [m, w] = await Promise.all([
      getMerchant(session.activeMerchantId),
      getWallet(),
    ]);
    merchant = m;
    wallet = w;
  } catch (err) {
    if (isApiError(err) && err.status === 401) {
      redirect("/api/auth/logout");
    }
    throw err;
  }

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
