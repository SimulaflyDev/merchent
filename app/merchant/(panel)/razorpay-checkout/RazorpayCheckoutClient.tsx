"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { WalletOut } from "@/lib/types/wallet";
import { MerchantOut } from "@/lib/types/merchant";

interface ClientProps {
  wallet: WalletOut;
  merchant: MerchantOut;
}

export default function RazorpayCheckoutClient({ wallet, merchant }: ClientProps) {
  const [amountInr, setAmountInr] = useState("10"); // Default to ₹10 (1000 paise)
  const [status, setStatus] = useState<"idle" | "creating_order" | "waiting_payment" | "verifying" | "success" | "failed">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handlePay = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPaymentDetails(null);
    setLogs([]);

    const amountPaise = Math.round(parseFloat(amountInr) * 100);
    if (isNaN(amountPaise) || amountPaise < 100) {
      setErrorMsg("Amount must be at least ₹1 (100 paise)");
      return;
    }

    addLog(`Initiating payment for ₹${amountInr} (${amountPaise} paise)...`);
    setStatus("creating_order");

    try {
      // 1. Create order on backend
      addLog("Calling backend /api/create-order...");
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise, currency: "INR" }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || `HTTP error ${orderRes.status}`);
      }

      const orderData = await orderRes.json();
      addLog(`Backend created Razorpay Order: ${orderData.order_id}`);

      // 2. Open Razorpay Checkout modal
      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please try again.");
      }

      setStatus("waiting_payment");
      addLog("Opening Razorpay Checkout Modal...");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T8kzV6TGqUSWvA",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SimulaFly Merchant",
        description: `Wallet topup recharge of ₹${amountInr}`,
        order_id: orderData.order_id,
        theme: { color: "#0E9F88" },
        prefill: {
          name: merchant.display_name,
          email: merchant.support_email || "",
          contact: merchant.support_phone || "",
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("verifying");
          addLog("Payment successful in checkout modal!");
          addLog(`Payment ID: ${response.razorpay_payment_id}`);
          addLog(`Order ID: ${response.razorpay_order_id}`);
          addLog(`Signature: ${response.razorpay_signature}`);
          addLog("Verifying payment signature with backend...");

          try {
            // 3. Verify signature on backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json();
              throw new Error(verifyErr.error || "Signature verification failed");
            }

            const verifyData = await verifyRes.json();
            addLog("Payment verified successfully on backend!");
            setSuccessMsg(`Successfully processed payment of ₹${amountInr}!`);
            setPaymentDetails(response);
            setStatus("success");
          } catch (verifyErr: any) {
            console.error(verifyErr);
            addLog(`Error: ${verifyErr.message}`);
            setErrorMsg(verifyErr.message || "Verification failed");
            setStatus("failed");
          }
        },
        modal: {
          ondismiss: () => {
            addLog("Payment modal dismissed by user (cancelled).");
            setErrorMsg("Payment cancelled by user.");
            setStatus("idle");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Listen for payment failed
      rzp.on("payment.failed", (resp: any) => {
        addLog(`Payment failed: ${resp.error.description}`);
        setErrorMsg(resp.error.description || "Payment failed");
        setStatus("failed");
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      addLog(`Error: ${err.message}`);
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("failed");
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-8">
        {/* Breadcrumb / Nav */}
        <div className="flex items-center gap-2">
          <Link href="/merchant/billing" className="text-xs font-semibold text-gray-500 hover:text-[#0E9F88]">
            Billing & Wallet
          </Link>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs uppercase font-semibold text-[#0E9F88] tracking-wider">Razorpay Checkout</span>
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Razorpay Checkout Integration</h1>
          <p className="text-sm text-gray-500 font-medium">
            Test and verify Razorpay standard web checkout modal with local serverless API route handlers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls Card */}
          <div className="lg:col-span-1 bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Checkout Form</h2>

            {/* Merchant Context */}
            <div className="space-y-1 bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E7EB] text-xs font-medium">
              <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Active Merchant</span>
              <div className="text-gray-900 font-bold">{merchant.display_name}</div>
              <div className="text-gray-500">{merchant.support_email}</div>
            </div>

            {/* Input Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-bold text-gray-700">
                Amount (INR)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                  disabled={status !== "idle" && status !== "success" && status !== "failed"}
                  className="focus:ring-[#0E9F88] focus:border-[#0E9F88] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg py-2.5"
                  placeholder="0.00"
                  min="1"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 sm:text-xs font-bold font-mono">
                    {Math.round(parseFloat(amountInr || "0") * 100)} paise
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handlePay}
              disabled={status === "creating_order" || status === "waiting_payment" || status === "verifying"}
              className="w-full py-3 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "creating_order" && "Creating Order..."}
              {status === "waiting_payment" && "Waiting for Payment..."}
              {status === "verifying" && "Verifying Signature..."}
              {status !== "creating_order" && status !== "waiting_payment" && status !== "verifying" && "Pay with Razorpay"}
            </button>

            {/* Success and Error Banners */}
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm text-xs font-medium relative">
                <div>{errorMsg}</div>
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm text-xs font-medium relative">
                <div>{successMsg}</div>
              </div>
            )}
          </div>

          {/* Execution Log & Details Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 flex flex-col h-[320px]">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Payment Process Log</h2>
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs overflow-y-auto text-gray-700 space-y-1.5">
                {logs.length === 0 ? (
                  <div className="text-gray-400 italic">No checkout actions triggered yet. Click "Pay with Razorpay" to start.</div>
                ) : (
                  logs.map((log, idx) => <div key={idx}>{log}</div>)
                )}
              </div>
            </div>

            {/* Payment Details Metadata */}
            {paymentDetails && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Verification Payload</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB] text-xs">
                    <span className="text-gray-400 block uppercase tracking-wider text-[9px] font-bold">Razorpay Payment ID</span>
                    <span className="text-gray-800 font-mono font-semibold select-all">{paymentDetails.razorpay_payment_id}</span>
                  </div>
                  <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB] text-xs">
                    <span className="text-gray-400 block uppercase tracking-wider text-[9px] font-bold">Razorpay Order ID</span>
                    <span className="text-gray-800 font-mono font-semibold select-all">{paymentDetails.razorpay_order_id}</span>
                  </div>
                  <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB] text-xs">
                    <span className="text-gray-400 block uppercase tracking-wider text-[9px] font-bold">Razorpay Signature</span>
                    <span className="text-gray-800 font-mono font-semibold select-all truncate block" title={paymentDetails.razorpay_signature}>
                      {paymentDetails.razorpay_signature}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
