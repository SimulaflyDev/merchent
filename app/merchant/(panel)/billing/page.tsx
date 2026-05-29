import { getWallet, listTransactions } from "@/lib/api/wallet";
import BillingClient from "./BillingClient";

interface PageProps {
  searchParams: Promise<{ offset?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const offset = sp.offset ? Number(sp.offset) : 0;

  const [wallet, transactions] = await Promise.all([
    getWallet(),
    listTransactions({ offset, limit: 25 }),
  ]);

  return (
    <BillingClient
      wallet={wallet}
      transactions={transactions}
    />
  );
}
