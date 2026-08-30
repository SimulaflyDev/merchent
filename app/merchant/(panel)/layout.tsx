import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import { getWallet } from "@/lib/api/wallet";
import { isApiError } from "@/lib/api/errors";
import MerchantPanelLayoutClient from "./MerchantPanelLayoutClient";
import VerificationFeatureGate from "./components/VerificationFeatureGate";

export default async function MerchantPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  let merchant;
  let wallet = null;

  try {
    merchant = await getMerchant(session.activeMerchantId);
    if (merchant.is_kyc_completed) {
      wallet = await getWallet();
    }
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
      <VerificationFeatureGate isVerified={merchant.is_kyc_completed}>
        {children}
      </VerificationFeatureGate>
    </MerchantPanelLayoutClient>
  );
}
