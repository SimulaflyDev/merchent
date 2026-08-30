"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  getBalanceHistoryAction,
  redeemCodeAction,
} from "@/lib/auth/wallet-actions";
import { updateMerchantAction } from "@/lib/auth/merchant-actions";
import { isApiError } from "@/lib/api/errors";
import { resolveImageUrl } from "@/lib/api/image-utils";
import type { WalletOut, BalanceHistoryItem } from "@/lib/types/wallet";
import type { MerchantOut } from "@/lib/types/merchant";

interface Props {
  wallet: WalletOut;
  merchant: MerchantOut;
}

const PRESET_TIERS = [500, 1000, 2500, 5000, 10000];

export default function BillingClient({ wallet, merchant }: Props) {
  const router = useRouter();

  // Active Tab: "history", "rewards", "payments", "invoices"
  const [activeTab, setActiveTab] = useState<"history" | "rewards" | "payments" | "invoices">("history");

  // Balance History State
  const [historyItems, setHistoryItems] = useState<BalanceHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyLimit = 25;
  const [historyOffset, setHistoryOffset] = useState(0);
  const [timeWindow, setTimeWindow] = useState("all_time");
  const [eventFilter, setEventFilter] = useState("all");
  const [historyLoading, setHistoryLoading] = useState(true);

  // Modals & Forms State
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  // Funds input
  const [customAmount, setCustomAmount] = useState("");
  const [redeemCodeText, setRedeemCodeText] = useState("");

  // Notifications State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Clipboard Copied State
  const [copied, setCopied] = useState(false);

  // Auto-Recharge State
  const [autoRecharge, setAutoRecharge] = useState(
    merchant.settings?.auto_recharge_enabled ?? false
  );

  // Fetch Balance History when filters or offset changes
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getBalanceHistoryAction({
        limit: historyLimit,
        offset: historyOffset,
        time_window: timeWindow,
        event_filter: eventFilter,
      });
      if (res.success) {
        setHistoryItems(res.data.items);
        setHistoryTotal(res.data.total);
      } else {
        console.error("Failed to load balance history:", res.error.detail);
      }
    } catch (err) {
      console.error("Error loading balance history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [eventFilter, historyOffset, timeWindow]);

  useEffect(() => {
    // Data loading is intentionally triggered when a filter or page changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHistory();
  }, [fetchHistory]);

  // Invoices (wallet top-ups/deposits) State
  const [allInvoiceTxs, setAllInvoiceTxs] = useState<BalanceHistoryItem[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "topups" | "order_confirmation" | "buyer_intel_unlock">("all");
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<BalanceHistoryItem | null>(null);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const res = await getBalanceHistoryAction({
        event_filter: "all",
        limit: 100,
      });
      if (res.success) {
        setAllInvoiceTxs(res.data.items);
      } else {
        console.error("Failed to load invoices:", res.error.detail);
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "invoices") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchInvoices();
    }
  }, [activeTab, fetchInvoices]);

  const getInvoiceDetails = (tx: BalanceHistoryItem) => {
    let title = "SimulaFly Transaction";
    let sub = "Transaction record entry.";
    
    if (tx.reason === "topup") {
      title = "SimulaFly Wallet Top-up";
      sub = "Prepaid credits added to merchant wallet.";
    } else if (tx.reason === "kyc_welcome_bonus") {
      title = "KYC Welcome Bonus";
      sub = "One-time welcome credit for successful KYC completion.";
    } else if (tx.reason === "order_confirmation") {
      title = "Order Confirmation Fee";
      sub = `Deduction for buyer order confirmation ${tx.product ? `(Product: ${tx.product.title})` : ""}`;
    } else if (tx.reason === "external_redirect" || tx.reason === "click") {
      title = "External Marketplace Redirect Fee";
      sub = `Deduction for third party online marketplace redirect click ${tx.product ? `(Product: ${tx.product.title})` : ""}`;
    } else if (tx.reason === "buyer_intel_unlock") {
      title = "Buyer Intelligence Unlock Fee";
      sub = "Deduction for high-intent customer lead profile unlock.";
    } else if (tx.reason?.startsWith("promo_")) {
      title = "Promo Code Credit";
      sub = `Credits added from promotional code: ${tx.reason.replace("promo_", "").toUpperCase()}`;
    } else if (tx.reason === "referral_redeem") {
      title = "Merchant Referral Credit";
      sub = "Credits earned for onboarding a new merchant.";
    } else if (tx.reason === "referral_partner") {
      title = "Merchant Onboarding Bonus";
      sub = "Credit bonus for onboarding through referral link.";
    } else if (tx.reason === "user_referral") {
      title = "User Referral Credit";
      sub = "Credits earned for mobile app user referral.";
    }
    
    return { title, sub };
  };

  const invoiceTxs = allInvoiceTxs.filter((tx) => {
    if (invoiceFilter === "all") return true;
    if (invoiceFilter === "topups") {
      return tx.entry_type === "Deposit" || tx.reason === "topup" || tx.reason === "kyc_welcome_bonus" || tx.reason.startsWith("promo_") || tx.reason === "referral_redeem" || tx.reason === "referral_partner" || tx.reason === "user_referral";
    }
    if (invoiceFilter === "order_confirmation") {
      return tx.reason === "order_confirmation";
    }

    if (invoiceFilter === "buyer_intel_unlock") {
      return tx.reason === "buyer_intel_unlock";
    }
    return true;
  });

  // Invoice Print helper
  const handlePrintInvoice = (tx: BalanceHistoryItem) => {
    const { title, sub } = getInvoiceDetails(tx);
    const dateStr = new Date(tx.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${tx.id.replace(/^tx_|^le_/, "").slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; margin: 0; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #0E9F88; }
            .title { font-size: 28px; font-weight: 800; text-align: right; text-transform: uppercase; color: #111827; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px; }
            .details-col { flex: 1; }
            .details-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9ca3af; margin-bottom: 6px; }
            .details-value { font-size: 14px; font-weight: 500; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .invoice-table th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #4b5563; text-align: left; }
            .invoice-table td { padding: 16px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .invoice-table td.right { text-align: right; }
            .invoice-table th.right { text-align: right; }
            .total-section { display: flex; justify-content: flex-end; margin-bottom: 50px; }
            .total-box { width: 300px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 2px solid #111827; padding-top: 12px; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; text-align: center; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">SimulaFly</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">SimulaFly Technologies Pvt. Ltd.</div>
            </div>
            <div>
              <div class="title">Invoice</div>
              <div style="font-size: 13px; text-align: right; font-weight: bold; margin-top: 4px;">INV-${tx.id.replace(/^tx_|^le_/, "").slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
          
          <div class="details">
            <div class="details-col">
              <div class="details-label">Billed To</div>
              <div class="details-value" style="font-weight: 700; color: #111827;">${merchant.display_name}</div>
              <div class="details-value">${merchant.legal_name || "—"}</div>
              <div class="details-value">${merchant.support_email || "—"}</div>
            </div>
            <div class="details-col" style="text-align: right;">
              <div class="details-label">Invoice Details</div>
              <div class="details-value"><strong>Date:</strong> ${dateStr}</div>
              <div class="details-value"><strong>Payment Method:</strong> ${tx.payment_method || "Wallet"}</div>
              <div class="details-value"><strong>Reference ID:</strong> ${tx.gateway_ref || "—"}</div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${title}</strong><br/>
                  <span style="font-size: 12px; color: #6b7280;">${sub}</span>
                </td>
                <td class="right" style="font-weight: bold;">₹${Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <span>Total Amount</span>
              <span>₹${Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for your business! For any billing queries, support is available at support@simulafly.com
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compute runway percentage based on latest recharge transaction
  const getRunwayPercent = () => {
    // Find the last successful deposit transaction in history
    const lastDepositItem = historyItems.find((item) => item.entry_type === "Deposit" && item.amount > 0);
    const baseAmount = lastDepositItem
      ? lastDepositItem.amount
      : Math.max(wallet.balance, wallet.low_balance_threshold, 1);
    const percent = Math.min(100, Math.max(0, Math.round((wallet.balance / baseAmount) * 100)));
    return { percent, baseAmount };
  };

  const { percent: runwayPercent } = getRunwayPercent();

  // Auto recharge toggler
  const handleToggleAutoRecharge = async () => {
    const nextVal = !autoRecharge;
    setAutoRecharge(nextVal);
    setBusy(true);
    try {
      const currentSettings = merchant.settings || {};
      const res = await updateMerchantAction(merchant.id, {
        settings: {
          ...currentSettings,
          auto_recharge_enabled: nextVal,
        },
      });
      if (res.success) {
        setSuccessMsg(`Auto-Recharge ${nextVal ? "enabled" : "disabled"} successfully.`);
        router.refresh();
      } else {
        setAutoRecharge(!nextVal); // rollback
        setErrorMsg(res.error.detail || "Failed to update Auto-Recharge setting.");
      }
    } catch {
      setAutoRecharge(!nextVal);
      setErrorMsg("An error occurred while updating settings.");
    } finally {
      setBusy(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 3000);
    }
  };

  // Live topup via Razorpay
  const handleLiveTopup = async (amount: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsAddFundsOpen(false);

    if (!Number.isInteger(amount) || amount < 500 || amount > 500_000) {
      setErrorMsg("Recharge amount must be between ₹500 and ₹500,000.");
      return;
    }
    if (typeof window === "undefined" || !window.Razorpay) {
      setErrorMsg("Razorpay Checkout hasn't loaded yet — try again in a moment.");
      return;
    }
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      setErrorMsg("Razorpay public key is not configured.");
      return;
    }

    setBusy(true);
    try {
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "INR",
        }),
      });
      const order = (await orderResponse.json()) as {
        order_id?: string;
        amount?: number;
        currency?: string;
        error?: string;
      };
      if (!orderResponse.ok || !order.order_id || !order.amount || !order.currency) {
        throw new Error(order.error || "Could not create Razorpay order");
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "SimulaFly",
        description: "Wallet top-up",
        order_id: order.order_id,
        prefill: {
          name: merchant.display_name,
          email: merchant.support_email || "",
          contact: merchant.support_phone || "",
        },
        theme: { color: "#0E9F88" },
        handler: async (response) => {
          try {
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verification = (await verificationResponse.json()) as {
              success?: boolean;
              error?: string;
            };
            if (!verificationResponse.ok || !verification.success) {
              throw new Error(verification.error || "Payment signature verification failed");
            }
            setSuccessMsg(`Successfully added ₹${amount.toLocaleString("en-IN")} to your wallet.`);
            void fetchHistory();
            router.refresh();
          } catch (err) {
            setErrorMsg(
              isApiError(err) ? err.detail : "Top-up succeeded on Razorpay but failed to credit wallet. Contact support.",
            );
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setErrorMsg("Payment cancelled. Your wallet was not charged.");
            setBusy(false);
          },
        },
      });
      rzp.on("payment.failed", (...args: unknown[]) => {
        const failure = args[0] as {
          error?: { description?: string; reason?: string };
        };
        setErrorMsg(
          failure.error?.description || failure.error?.reason || "Razorpay payment failed.",
        );
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(
        isApiError(err) ? err.detail : err instanceof Error ? err.message : "Could not start top-up",
      );
      setBusy(false);
    }
  };

  // Code redemption
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCodeText.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      const res = await redeemCodeAction(redeemCodeText.trim());
      if (res.success) {
        setSuccessMsg(res.data.message || "Code redeemed successfully!");
        setRedeemCodeText("");
        setIsRedeemOpen(false);
        fetchHistory();
        router.refresh();
      } else {
        setErrorMsg(res.error.detail || "Failed to redeem code.");
      }
    } catch {
      setErrorMsg("An error occurred during code redemption.");
    } finally {
      setBusy(false);
    }
  };

  // Clipboard copy
  const handleCopyReferral = () => {
    if (typeof navigator !== "undefined" && merchant.referral_code) {
      navigator.clipboard.writeText(merchant.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  // Export CSV
  const handleExportCSV = () => {
    if (historyItems.length === 0) return;
    const headers = "Date & Time,Product/Action,Event Type,Amount (INR),Running Balance (INR)\n";
    const rows = historyItems.map((item) => {
      const dateStr = new Date(item.created_at).toLocaleString("en-IN");
      const title = item.product ? `${item.product.title} (SKU: ${item.product.sku})` : item.reason;
      return `"${dateStr}","${title.replace(/"/g, '""')}","${item.entry_type}",${item.amount},${item.running_balance}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `balance_history_${merchant.slug || "merchant"}_${Date.now()}.csv`);
    link.click();
  };

  // Compute rewards stats
  const getRewardsStats = () => {
    // Sum credit ledgers for referrals
    const referralCredits = historyItems.filter(
      (item) => item.amount > 0 && (item.reason === "referral_redeem" || item.reason === "referral_partner")
    );
    const calculatedPoints = referralCredits.reduce((sum, item) => sum + item.amount, 0);

    return {
      points: calculatedPoints,
      customers: referralCredits.filter((item) => item.reason === "referral_redeem").length,
      partners: referralCredits.filter((item) => item.reason === "referral_partner").length,
    };
  };

  const referralStats = getRewardsStats();

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onError={() => setErrorMsg("Could not load Razorpay Checkout. Check your connection and retry.")}
      />

      <div className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Banner Messages */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-center justify-between transition duration-300">
            <span className="text-sm font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 text-lg">&times;</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm flex items-center justify-between transition duration-300">
            <span className="text-sm font-medium">{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-green-500 hover:text-green-700 text-lg">&times;</button>
          </div>
        )}

        {/* Header Section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Billing & Tokens</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-700 rounded-full">IN REGION</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Financial Control Center</h1>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Wallet Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E4E8] shadow-sm overflow-hidden p-6 hover:shadow-md transition duration-300">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1">SimulaFly Wallet</span>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-black text-gray-900 tabular-nums">
                  ₹{wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Runway percentage progress */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Runway</span>
                  <span className="font-bold">{runwayPercent}% of last top-up</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0E9F88] rounded-full transition-all duration-500"
                    style={{ width: `${runwayPercent}%` }}
                  />
                </div>
              </div>

              {/* Wallet Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setIsAddFundsOpen(true)}
                  className="px-4 py-3 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-black transition duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Funds
                </button>
                <button
                  onClick={() => setIsRedeemOpen(true)}
                  className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 4h4M5 20h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
                  </svg>
                  Redeem Code
                </button>
              </div>

              {/* Auto recharge toggler */}
              <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Auto-Recharge</h4>
                  <p className="text-xs text-gray-400 mt-0.5">When balance drops below ₹500</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoRecharge}
                  disabled={busy}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoRecharge ? "bg-[#0E9F88]" : "bg-gray-200"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoRecharge ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E4E8] shadow-sm overflow-hidden min-h-[500px]">
              
              {/* Tab Headers */}
                  <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50/50 px-4 sm:px-6">
                {(["history", "rewards", "payments", "invoices"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const labelMap = {
                    history: "Balance History",
                    rewards: "Rewards & Referrals",
                    payments: "Payment Methods",
                    invoices: "Invoices",
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                        className={`shrink-0 border-b-2 px-4 py-4 text-sm font-semibold transition duration-150 ${
                        isActive
                          ? "border-[#0E9F88] text-[#0E9F88] bg-white -mb-px"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {labelMap[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="p-6">

                {/* Tab 1: Balance History */}
                {activeTab === "history" && (
                  <div className="space-y-6">
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <select
                          value={timeWindow}
                          onChange={(e) => {
                            setTimeWindow(e.target.value);
                            setHistoryOffset(0);
                          }}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E9F88]"
                        >
                          <option value="all_time">All Time</option>
                          <option value="today">Today</option>
                          <option value="7_days">Last 7 Days</option>
                          <option value="30_days">Last 30 Days</option>
                        </select>

                        <select
                          value={eventFilter}
                          onChange={(e) => {
                            setEventFilter(e.target.value);
                            setHistoryOffset(0);
                          }}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E9F88]"
                        >
                          <option value="all">All Events</option>
                          <option value="add_to_cart">Shopper Add-to-Cart</option>
                          <option value="activity">Buyer Activity</option>
                          <option value="views">Shopper Views</option>
                          <option value="topups">Top-ups</option>
                          <option value="referrals">Referrals & Coupons</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-600">
                          {historyTotal} transactions
                        </span>
                        {historyItems.length > 0 && (
                          <button
                            onClick={handleExportCSV}
                            className="text-[#0E9F88] font-bold text-sm hover:text-[#0B7A69] flex items-center gap-1.5 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      {historyLoading ? (
                        <div className="py-20 text-center text-gray-400 font-semibold text-sm">
                          Loading transaction records…
                        </div>
                      ) : historyItems.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-semibold text-sm">
                          No transactions found matching the selected filters.
                        </div>
                      ) : (
                        <table className="w-full min-w-[760px] table-auto text-left text-sm">
                          <thead className="bg-gray-50 text-gray-400 uppercase tracking-widest text-[10px] font-bold border-b border-gray-100">
                            <tr>
                              <th className="px-4 py-3">Date & Time</th>
                              <th className="px-4 py-3 max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">Product / Action</th>
                              <th className="px-4 py-3 text-center">Event Type</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                              <th className="px-4 py-3 text-right">Running Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {historyItems.map((item) => {
                              const isPositive = item.amount > 0;
                              return (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition duration-150">
                                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                    <span className="block text-xs font-semibold">
                                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">
                                      {new Date(item.created_at).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: false,
                                      })}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">
                                    <div className="flex items-center gap-3">
                                      {item.product ? (
                                        <>
                                          <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {item.product.image_url ? (
                                              <img 
                                                src={resolveImageUrl(item.product.image_url)} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <span className="font-bold text-gray-800 block truncate" title={item.product.title}>{item.product.title}</span>
                                            <span className="text-[10px] text-gray-400 font-mono block mt-0.5 truncate">SKU: {item.product.sku}</span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                            </svg>
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <span className="font-bold text-gray-800 block truncate">Wallet Top-up</span>
                                            <span className="text-[10px] text-gray-400 block mt-0.5 truncate">Method: {item.payment_method || "UPI"}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800">
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        item.entry_type === "Mention" ? "bg-amber-500" :
                                        item.entry_type === "Add to Cart" ? "bg-blue-500" :
                                        item.entry_type === "View" ? "bg-indigo-400" : "bg-green-500"
                                      }`} />
                                      {item.entry_type}
                                    </span>
                                  </td>
                                  <td className={`px-4 py-3 text-right font-bold whitespace-nowrap tabular-nums ${isPositive ? "text-green-600" : "text-gray-700"}`}>
                                    {isPositive ? "+" : "-"} ₹{Math.abs(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-900 font-bold whitespace-nowrap tabular-nums">
                                    ₹{item.running_balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Pagination */}
                    {historyTotal > historyLimit && (
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <button
                          onClick={() => setHistoryOffset(Math.max(0, historyOffset - historyLimit))}
                          disabled={historyOffset === 0 || historyLoading}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          Previous
                        </button>
                        <span className="text-xs font-semibold text-gray-400">
                          Showing {historyOffset + 1} - {Math.min(historyTotal, historyOffset + historyLimit)} of {historyTotal}
                        </span>
                        <button
                          onClick={() => setHistoryOffset(historyOffset + historyLimit)}
                          disabled={historyOffset + historyLimit >= historyTotal || historyLoading}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Rewards & Referrals */}
                {activeTab === "rewards" && (
                  <div className="space-y-8">
                    {/* Refer Banner */}
                    <div className="bg-[#0E9F88] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                      <div className="space-y-3 max-w-lg text-center md:text-left z-10">
                        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Refer & Earn Points</h2>
                        <p className="text-sm text-green-50 opacity-90 leading-relaxed font-medium">
                          Share your unique referral code with your customers or invite other merchants. You get points added directly to your billing balance when they join.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-semibold">
                            👤 Customer = 50 pts
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-semibold">
                            🏢 Partner = ₹500
                          </span>
                        </div>
                      </div>

                      {/* Code container card */}
                      <div className="bg-white rounded-xl p-5 text-gray-900 w-full max-w-xs text-center border border-green-700/10 shadow-lg z-10 flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Referral Code</span>
                        <div className="my-3 font-mono font-black text-xl text-[#0E9F88] tracking-widest bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 select-all">
                          {merchant.referral_code || "Not available"}
                        </div>
                        <button
                          onClick={handleCopyReferral}
                          className="w-full py-2 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          {copied ? "Copied! ✓" : "Copy Code"}
                        </button>
                      </div>

                      {/* Graphic circle background elements */}
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
                      <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
                    </div>

                    {/* Referral statistics impact */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Your Referral Impact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Stat Card 1 */}
                        <div className="bg-white rounded-xl border border-[#E2E4E8] p-5 shadow-sm hover:shadow transition">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Points Earned</span>
                          <span className="text-2xl font-black text-[#0E9F88] block mt-1 tabular-nums">
                            {referralStats.points.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="bg-white rounded-xl border border-[#E2E4E8] p-5 shadow-sm hover:shadow transition">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Customers Referred</span>
                          <span className="text-2xl font-black text-gray-900 block mt-1 tabular-nums">
                            {referralStats.customers}
                          </span>
                        </div>

                        {/* Stat Card 3 */}
                        <div className="bg-white rounded-xl border border-[#E2E4E8] p-5 shadow-sm hover:shadow transition">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Partners Referred</span>
                          <span className="text-2xl font-black text-gray-900 block mt-1 tabular-nums">
                            {referralStats.partners}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Payment Methods */}
                {activeTab === "payments" && (
                  <div className="rounded-2xl border border-[#E2E4E8] bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="max-w-xl">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0E9F88]/10 text-lg font-black text-[#0E9F88]">R</div>
                        <h3 className="text-base font-black text-gray-900">Secure checkout by Razorpay</h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-500">
                          Cards, UPI, netbanking, and wallets are entered only inside Razorpay Checkout.
                          SimulaFly does not collect or store card numbers or UPI credentials.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddFundsOpen(true)}
                        className="rounded-xl bg-[#0E9F88] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0B7A69]"
                      >
                        Add funds with Razorpay
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 4: Invoices */}
                {activeTab === "invoices" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                          SimulaFly Wallet Invoices
                        </h3>
                        <span className="text-xs font-semibold text-gray-400 mt-1 block">
                          {invoiceTxs.length} invoices displayed
                        </span>
                      </div>
                      
                      {/* Category Dropdown Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">Invoice Type:</span>
                        <select
                          value={invoiceFilter}
                          onChange={(e) =>
                            setInvoiceFilter(e.target.value as typeof invoiceFilter)
                          }
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-medium hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E9F88]"
                        >
                          <option value="all">All Invoices</option>
                          <option value="topups">Wallet Recharge</option>
                          <option value="order_confirmation">Post Order Confirmation</option>
                          <option value="buyer_intel_unlock">Buyer Intel Purchase</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      {invoicesLoading ? (
                        <div className="py-20 text-center text-gray-400 font-semibold text-sm">
                          Loading invoices…
                        </div>
                      ) : invoiceTxs.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-semibold text-sm">
                          No invoices found for the selected category.
                        </div>
                      ) : (
                        <table className="w-full min-w-[860px] table-auto text-left text-sm">
                          <thead className="bg-gray-50 text-gray-400 uppercase tracking-widest text-[10px] font-bold border-b border-gray-100">
                            <tr>
                              <th className="px-4 py-3">Invoice ID</th>
                              <th className="px-4 py-3">Billing Date</th>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3">Payment Method</th>
                              <th className="px-4 py-3">Gateway Ref</th>
                              <th className="px-4 py-3 text-right">Amount (INR)</th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {invoiceTxs.map((tx) => {
                              const displayId = `INV-${tx.id.replace(/^tx_|^le_/, "").slice(0, 8).toUpperCase()}`;
                              const isDeduction = tx.amount < 0;
                              const { title } = getInvoiceDetails(tx);
                              return (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition duration-150 text-xs">
                                  <td className="px-4 py-3 font-mono font-bold text-gray-900">
                                    {displayId}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                    <span className="block font-semibold">
                                      {new Date(tx.created_at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">
                                      {new Date(tx.created_at).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    <span className="font-bold">{title}</span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 uppercase font-bold">
                                    {tx.payment_method || "Wallet"}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-gray-400 truncate max-w-[120px]" title={tx.gateway_ref || ""}>
                                    {tx.gateway_ref || "—"}
                                  </td>
                                  <td className={`px-4 py-3 text-right font-black tabular-nums ${isDeduction ? "text-red-600" : "text-[#0E9F88]"}`}>
                                    {isDeduction ? "-" : "+"} ₹{Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-4 py-3 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => setSelectedInvoice(tx)}
                                      className="text-xs px-3 py-1.5 bg-gray-950 text-white font-bold rounded-lg hover:bg-black transition-colors"
                                    >
                                      See Invoice
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>



      </div>

      {/* Modal 1: Add Funds */}
      {isAddFundsOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-lg">Add Wallet Funds</h3>
              <button 
                onClick={() => {
                  setIsAddFundsOpen(false);
                  setCustomAmount("");
                }} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Presets */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Select Predefined Tier</span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_TIERS.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => handleLiveTopup(tier)}
                      className="py-3 px-2 border border-gray-200 hover:border-[#0E9F88] hover:bg-green-50/20 rounded-xl font-black text-sm text-center text-gray-800 transition duration-150"
                    >
                      ₹{tier.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const amt = Number(customAmount);
                  if (Number.isInteger(amt)) void handleLiveTopup(amt);
                }} 
                className="space-y-3"
              >
                <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">Or Enter Custom Amount</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Custom amount (₹500 – ₹500,000)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0E9F88] hover:border-gray-300 font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={!customAmount || Number(customAmount) < 500}
                    className="px-5 py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition shadow-sm"
                  >
                    Top up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Redeem Code */}
      {isRedeemOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-lg">Redeem Promo or Referral Code</h3>
              <button 
                onClick={() => {
                  setIsRedeemOpen(false);
                  setRedeemCodeText("");
                }} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRedeemCode} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">Enter Code</label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME500 or SIMULA-CODE"
                  value={redeemCodeText}
                  onChange={(e) => setRedeemCodeText(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0E9F88] hover:border-gray-300 font-mono font-black uppercase text-[#0E9F88] tracking-widest text-center"
                  required
                />
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Redeem coupon/promo codes or enter a referral code shared by another merchant to earn wallet balance rewards. Self-redemption is not allowed.
              </p>

              <button
                type="submit"
                disabled={!redeemCodeText.trim() || busy}
                className="w-full py-3 bg-[#111827] hover:bg-black text-white text-sm font-bold rounded-xl disabled:opacity-50 transition shadow-sm"
              >
                {busy ? "Processing Redemption…" : "Redeem"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Invoice Details / Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-black text-gray-900 text-lg">Invoice Details</h3>
              <button 
                onClick={() => setSelectedInvoice(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            {/* Invoice Print Layout Preview */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-4">
                <div>
                  <h4 className="font-extrabold text-lg text-[#0E9F88]">SimulaFly</h4>
                  <p className="text-xs text-gray-400 mt-1">SimulaFly Technologies Pvt. Ltd.</p>
                </div>
                <div className="text-right">
                  <h4 className="font-black text-gray-900 uppercase">Invoice</h4>
                  <p className="text-xs font-mono font-bold mt-1 text-[#0E9F88]">
                    INV-{selectedInvoice.id.replace(/^tx_|^le_/, "").slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Billed To</span>
                  <span className="font-bold text-gray-900 block">{merchant.display_name}</span>
                  <span className="text-xs text-gray-500 block mt-0.5">{merchant.legal_name || "—"}</span>
                  <span className="text-xs text-gray-500 block">{merchant.support_email || "—"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Invoice Details</span>
                  <span className="text-xs block">
                    <strong>Date:</strong> {new Date(selectedInvoice.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs block mt-1">
                    <strong>Payment Method:</strong> <span className="uppercase">{selectedInvoice.payment_method || "Wallet"}</span>
                  </span>
                  <span className="text-xs block mt-1 truncate">
                    <strong>Reference ID:</strong> {selectedInvoice.gateway_ref || "—"}
                  </span>
                </div>
              </div>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-4 text-gray-700">
                      <span className="font-bold block text-sm">{getInvoiceDetails(selectedInvoice).title}</span>
                      <span className="text-[10px] text-gray-400 mt-1 block">{getInvoiceDetails(selectedInvoice).sub}</span>
                    </td>
                    <td className="px-3 py-4 text-right font-black text-gray-900 text-sm tabular-nums">
                      ₹{Math.abs(selectedInvoice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end pt-4">
                <div className="flex w-full justify-between border-t border-gray-900 pt-3 text-sm font-black text-gray-900 sm:w-64">
                  <span>Total Amount</span>
                  <span>₹{Math.abs(selectedInvoice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handlePrintInvoice(selectedInvoice)}
                className="px-4 py-2 bg-[#0E9F88] hover:bg-[#0B7A69] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download / Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
