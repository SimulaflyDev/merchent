"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { topupIntentAction, topupConfirmAction } from "@/lib/auth/wallet-actions";
import { isApiError } from "@/lib/api/errors";
import type { PaginatedTransactions, WalletOut } from "@/lib/types/wallet";

interface Props {
  wallet: WalletOut;
  transactions: PaginatedTransactions;
}

const TOPUP_TIERS = [500, 1000, 2500, 5000, 10000];

const STATUS_STYLES: Record<string, string> = {
  successful: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export default function BillingClient({ wallet, transactions }: Props) {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null);

  const lowBalance = wallet.balance < wallet.low_balance_threshold;

  const startTopup = async (amount: number) => {
    setTopupError(null);
    setTopupSuccess(null);

    if (amount < 1 || amount > 500_000) {
      setTopupError("Amount must be between ₹1 and ₹500,000.");
      return;
    }
    if (typeof window === "undefined" || !window.Razorpay) {
      setTopupError("Razorpay Checkout hasn't loaded yet — try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const intent = await topupIntentAction(amount);

      const rzp = new window.Razorpay({
        key: intent.razorpay_key_id,
        amount: intent.amount * 100,
        currency: intent.currency,
        name: "SimulaFly",
        description: "Wallet top-up",
        order_id: intent.order_id,
        theme: { color: "#0E9F88" },
        handler: async (resp) => {
          try {
            await topupConfirmAction({
              order_id: resp.razorpay_order_id,
              payment_id: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            });
            setTopupSuccess(`Added ₹${amount.toLocaleString("en-IN")} to your wallet.`);
            router.refresh();
          } catch (err) {
            setTopupError(
              isApiError(err) ? err.detail : "Top-up succeeded on Razorpay but failed to credit wallet. Contact support.",
            );
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rzp.open();
    } catch (err) {
      setTopupError(isApiError(err) ? err.detail : "Could not start top-up");
      setBusy(false);
    }
  };

  const handleCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(customAmount);
    if (Number.isFinite(n) && n > 0) startTopup(n);
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Billing & wallet</h1>
          <p className="text-sm text-gray-500 mt-1">Top up your wallet to keep your products active.</p>
        </div>

        {/* Balance card */}
        <section className="bg-white rounded-xl border border-[#E2E4E8] p-6">
          <div className="flex items-baseline gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Current balance</p>
              <p className={`text-4xl font-bold tabular-nums mt-1 ${lowBalance ? "text-amber-600" : "text-[#111827]"}`}>
                {wallet.currency === "INR" ? "₹" : wallet.currency + " "}
                {wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            {lowBalance && (
              <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                Low balance
              </span>
            )}
          </div>
          {wallet.last_recharged_at && (
            <p className="text-xs text-gray-400 mt-2">
              Last topped up {new Date(wallet.last_recharged_at).toLocaleString("en-IN")}
            </p>
          )}
        </section>

        {/* Top-up tiles */}
        <section className="bg-white rounded-xl border border-[#E2E4E8] p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Add funds
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TOPUP_TIERS.map((tier) => (
              <button
                key={tier}
                disabled={busy}
                onClick={() => startTopup(tier)}
                className="px-4 py-4 border border-gray-300 rounded-lg hover:border-[#0E9F88] hover:bg-[#0E9F88]/5 disabled:opacity-50 text-center"
              >
                <span className="block text-lg font-semibold">₹{tier.toLocaleString("en-IN")}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCustom} className="mt-4 flex gap-2">
            <input
              type="number"
              min="1"
              max="500000"
              step="1"
              placeholder="Custom amount (₹1 – ₹500,000)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={busy || !customAmount}
              className="px-4 py-2 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69] disabled:opacity-50"
            >
              {busy ? "Processing…" : "Top up"}
            </button>
          </form>

          {topupError && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {topupError}
            </div>
          )}
          {topupSuccess && (
            <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              {topupSuccess}
            </div>
          )}
        </section>

        {/* Transaction history */}
        <section className="bg-white rounded-xl border border-[#E2E4E8] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Recent transactions ({transactions.total})
            </h2>
          </div>

          {transactions.items.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No transactions yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.items.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(t.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      ₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-600 uppercase text-xs">
                      {t.payment_method ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[t.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {t.gateway_ref ?? t.razorpay_order_id ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
