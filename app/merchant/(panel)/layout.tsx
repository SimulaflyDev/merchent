import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import MerchantPanelLayoutClient from "./MerchantPanelLayoutClient";

export default async function MerchantPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");
  return (
    <MerchantPanelLayoutClient activeMerchantId={session.activeMerchantId}>
      {children}
    </MerchantPanelLayoutClient>
  );
}
