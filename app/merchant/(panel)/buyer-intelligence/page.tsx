import { listShoppers } from "@/lib/api/buyer-intelligence";
import { getWallet } from "@/lib/api/wallet";
import BuyerIntelligenceClient from "./BuyerIntelligenceClient";

export default async function BuyerIntelligencePage() {
  const [data, wallet] = await Promise.all([
    listShoppers({ limit: 50, since_days: 30 }).catch(() => ({ items: [], total: 0, limit: 50, offset: 0 })),
    getWallet().catch(() => ({ balance: 0 })),
  ]);

  return (
    <BuyerIntelligenceClient
      initialShoppers={data.items}
      walletBalance={Number(wallet.balance)}
    />
  );
}
