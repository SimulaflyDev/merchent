import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import { api } from "@/lib/api/client";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  const merchant = await getMerchant(session.activeMerchantId);
  const user = await api<{ email: string; phone: string | null }>("/users/me");

  return <SettingsClient initialMerchant={merchant} currentUser={user} />;
}
