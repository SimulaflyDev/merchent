"use client";

import Link from "next/link";

import { useMerchant } from "@/app/merchant/context/MerchantContext";

export default function LowBalanceBanner() {
  const { wallet } = useMerchant();
  if (!wallet) return null;
  if (wallet.balance >= wallet.low_balance_threshold) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6 sm:py-2">
      <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-amber-800">
          <strong>Low balance.</strong> Your wallet is below ₹
          {wallet.low_balance_threshold.toLocaleString("en-IN")}.
          Products will pause if it hits zero.
        </p>
        <Link
          href="/merchant/billing"
          className="rounded-md bg-amber-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-amber-700"
        >
          Top up
        </Link>
      </div>
    </div>
  );
}
