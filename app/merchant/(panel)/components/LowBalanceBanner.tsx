"use client";

import Link from "next/link";

import { useMerchant } from "@/app/merchant/context/MerchantContext";

export default function LowBalanceBanner() {
  const { wallet } = useMerchant();
  if (!wallet) return null;
  if (wallet.balance >= wallet.low_balance_threshold) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-amber-800">
          <strong>Low balance.</strong> Your wallet is below ₹
          {wallet.low_balance_threshold.toLocaleString("en-IN")}.
          Products will pause if it hits zero.
        </p>
        <Link
          href="/merchant/billing"
          className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700"
        >
          Top up
        </Link>
      </div>
    </div>
  );
}
