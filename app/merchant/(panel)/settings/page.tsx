import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant, listMembers } from "@/lib/api/merchants";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  const [merchant, members] = await Promise.all([
    getMerchant(session.activeMerchantId),
    listMembers(session.activeMerchantId),
  ]);

  return <SettingsClient initialMerchant={merchant} initialMembers={members} />;
}
