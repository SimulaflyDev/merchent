import { getWallet } from "@/lib/api/wallet";
import { getMerchant } from "@/lib/api/merchants";
import { getMerchantSession } from "@/lib/auth/session";
import BillingClient from "./BillingClient";

interface PageProps {
  searchParams: Promise<{ offset?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Unauthorized access. Please log in again.
      </div>
    );
  }

  const [wallet, merchant] = await Promise.all([
    getWallet(),
    getMerchant(session.activeMerchantId),
  ]);

  return (
    <BillingClient
      wallet={wallet}
      merchant={merchant}
    />
  );
}

