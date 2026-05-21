"use client";

import { useState } from "react";
import Link from "next/link";

// --- Region-Aware Mock Data ---
// Hardcoded to India region as requested
const mockMerchantProfile = {
  country: "IN",
  currency: "INR",
  currencySymbol: "₹",
};

const isIndiaRegion = mockMerchantProfile.country === "IN";

const INITIAL_WALLET = {
  balance: isIndiaRegion ? 2400.00 : 48.50,
  currency: mockMerchantProfile.currency,
  currencySymbol: mockMerchantProfile.currencySymbol,
  lastTopUp: isIndiaRegion ? 5000.00 : 100.00,
  autoRecharge: false,
  threshold: isIndiaRegion ? 500 : 10,
};

const INITIAL_LEDGER = [
  { id: 1, date: "14 May, 14:32", type: "ai_mention", product: "Oak Dining Table", amount: isIndiaRegion ? -0.50 : -0.005, balance: isIndiaRegion ? 2400.00 : 48.50 },
  { id: 2, date: "14 May, 13:15", type: "click", product: "Blue Velvet Sofa", amount: isIndiaRegion ? -1.00 : -0.010, balance: isIndiaRegion ? 2400.50 : 48.505 },
  { id: 3, date: "14 May, 11:00", type: "ar_view", product: "Rattan Chair", amount: isIndiaRegion ? -0.25 : -0.003, balance: isIndiaRegion ? 2401.50 : 48.515 },
  { id: 4, date: "12 May, 09:00", type: "topup", product: null, amount: isIndiaRegion ? 2000.00 : 50.00, balance: isIndiaRegion ? 2401.75 : 48.518 },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("history");
  
  // Wallet & Ledger State
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  
  // Modals
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  
  // Filters
  const [dateFilter, setDateFilter] = useState("All Time");
  const [typeFilter, setTypeFilter] = useState("All Events");
  
  // Top Up State
  const defaultAmount = isIndiaRegion ? 1000 : 50;
  const topUpPresets = isIndiaRegion ? [500, 1000, 2000, 5000, 10000] : [10, 50, 100, 250, 500];
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number | null>(defaultAmount);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(isIndiaRegion ? "upi" : "card_global");
  
  // Process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemError, setRedeemError] = useState("");

  const handleTopUpSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      const newBalance = wallet.balance + (selectedTopUpAmount || 0);
      setWallet({ ...wallet, balance: newBalance, lastTopUp: selectedTopUpAmount || wallet.lastTopUp });
      setLedger([
        { id: Date.now(), date: "Just now", type: "topup", product: null, amount: selectedTopUpAmount || 0, balance: newBalance },
        ...ledger
      ]);

      setTimeout(() => {
        setIsSuccess(false);
        setIsTopUpModalOpen(false);
        setSelectedTopUpAmount(defaultAmount);
      }, 2000);
    }, 1500);
  };

  const handleRedeemSubmit = () => {
    setRedeemError("");
    if (!redeemCode.trim()) {
      setRedeemError("Please enter a valid code");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Mock logic: if it contains "PARTNER", give 500, otherwise 50 (or coupon amount)
      let amount = isIndiaRegion ? 500 : 10;
      let type = "coupon";
      
      if (redeemCode.toUpperCase().includes("PARTNER")) {
        amount = isIndiaRegion ? 5000 : 100;
        type = "referral_partner";
      } else if (redeemCode.toUpperCase().includes("CUST")) {
        amount = isIndiaRegion ? 500 : 10;
        type = "referral_customer";
      }
      
      setIsSuccess(true);
      const newBalance = wallet.balance + amount;
      setWallet({ ...wallet, balance: newBalance });
      setLedger([
        { id: Date.now(), date: "Just now", type: type, product: redeemCode.toUpperCase(), amount: amount, balance: newBalance },
        ...ledger
      ]);

      setTimeout(() => {
        setIsSuccess(false);
        setIsRedeemModalOpen(false);
        setRedeemCode("");
      }, 2000);
    }, 1500);
  };

  const formatAmount = (amt: number) => {
    return amt.toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: isIndiaRegion ? 0 : 2 });
  };

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-neutral-dark font-semibold">Billing & Tokens</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {mockMerchantProfile.country} Region
            </span>
          </div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Financial Control Center</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Wallet Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#EAECEF] space-y-6">
            <div>
              <h2 className="text-[10px] font-medium text-gray-400 mb-1">SimulaFly Wallet</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl text-gray-400 font-medium">{wallet.currencySymbol}</span>
                <span className="text-[40px] font-bold text-[#111827] tabular-nums tracking-tight">
                  {wallet.balance.toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Runway</span>
                <span>{Math.round((wallet.balance / wallet.lastTopUp) * 100)}% of last top-up</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#0E9F88] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((wallet.balance / wallet.lastTopUp) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsTopUpModalOpen(true)}
                className="py-3 bg-[#111827] text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Funds
              </button>
              <button 
                onClick={() => setIsRedeemModalOpen(true)}
                className="py-3 bg-white border border-[#EAECEF] text-[#111827] font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                Redeem Code
              </button>
            </div>

            <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#111827]">Auto-Recharge</p>
                <p className="text-xs text-gray-500 font-medium">When balance drops below {wallet.currencySymbol}{wallet.threshold}</p>
              </div>
              <button 
                onClick={() => setWallet({...wallet, autoRecharge: !wallet.autoRecharge})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wallet.autoRecharge ? 'bg-[#0E9F88]' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wallet.autoRecharge ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs & Tables */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-[#EAECEF] overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-6">
              {[
                { id: "history", label: "Balance History" },
                { id: "rewards", label: "Rewards & Referrals" },
                { id: "methods", label: "Payment Methods" },
                { id: "invoices", label: "Invoices" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-[12px] font-medium border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? "border-[#111827] text-[#111827]" 
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content: Rewards */}
            {activeTab === "rewards" && (
              <div className="p-8 space-y-8">
                {/* Hero section */}
                <div className="bg-gradient-to-r from-[#0E9F88] to-[#1FAF9A] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex-1 space-y-3 relative z-10">
                    <h3 className="text-2xl font-bold tracking-tight">Refer & Earn Points</h3>
                    <p className="text-white/80 text-sm max-w-md">
                      Share your unique referral code with your customers or invite other merchants. You get points added directly to your billing balance when they join.
                    </p>
                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-lg text-sm font-semibold">
                        <span>👤 Customer = {isIndiaRegion ? '500' : '10'} pts</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-lg text-sm font-semibold">
                        <span>🏪 Partner = {isIndiaRegion ? '5000' : '100'} pts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white text-center p-5 rounded-xl shadow-xl w-full md:w-auto relative z-10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Referral Code</p>
                    <div className="text-xl font-bold font-mono text-[#0E9F88] tracking-widest mb-3 bg-gray-50 py-2 px-4 rounded border border-gray-100">
                      SIMULA-ACME-2026
                    </div>
                    <button className="w-full bg-[#111827] text-white text-xs font-bold py-2.5 rounded hover:bg-black transition-colors">
                      Copy Code
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="text-sm font-bold text-[#111827] mb-4">Your Referral Impact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="text-3xl font-bold text-[#0E9F88] mb-1">{isIndiaRegion ? '12,500' : '250'}</div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Total Points Earned</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="text-3xl font-bold text-[#111827] mb-1">15</div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Customers Referred</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="text-3xl font-bold text-[#111827] mb-1">1</div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Partners Referred</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: History (The Ledger) */}
            {activeTab === "history" && (
              <div>
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50/50 border-b border-gray-50 gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                      className="flex-1 md:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1FAF9A]/20"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option>All Time</option>
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>This Month</option>
                    </select>
                    <select 
                      className="flex-1 md:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1FAF9A]/20"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option>All Events</option>
                      <option value="click">Shopper Add-to-Cart</option>
                      <option value="ai_mention">Buyer Activity</option>
                      <option value="ar_view">Shopper Views</option>
                      <option value="topup">Top-ups</option>
                      <option value="referral">Referrals & Coupons</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-xs font-medium text-gray-500">
                      <strong className="text-neutral-dark">
                        {ledger.filter(item => {
                          if (typeFilter === "All Events") return true;
                          if (typeFilter === "referral") return item.type.includes("referral") || item.type === "coupon";
                          return item.type === typeFilter;
                        }).length}
                      </strong> transactions
                    </div>
                    <button className="text-sm font-bold text-[#1FAF9A] flex items-center gap-1 hover:text-[#189986]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export CSV
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#FAFBFC] border-b border-[#F1F3F5] text-[10px] font-medium text-gray-400 h-10">
                        <th className="px-6">Date & Time</th>
                        <th className="px-6">Product / Action</th>
                        <th className="px-6">Event Type</th>
                        <th className="px-6 text-right">Amount</th>
                        <th className="px-6 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ledger
                        .filter(item => {
                          if (typeFilter === "All Events") return true;
                          if (typeFilter === "referral") return item.type.includes("referral") || item.type === "coupon";
                          return item.type === typeFilter;
                        })
                        .map((item) => {
                        const isCredit = item.amount > 0;
                        return (
                        <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors font-medium text-gray-700 ${isCredit ? 'bg-[#F8FAFB]' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-neutral-dark font-bold tabular-nums">{item.date.split(',')[0]} {item.date !== "Just now" && "2026"}</span>
                              {item.date !== "Just now" && <span className="text-xs text-gray-500 tabular-nums">{item.date.split(',')[1]?.trim()}:00</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.type === 'topup' ? (
                                <div className="w-8 h-8 rounded-full bg-[#1FAF9A]/10 flex items-center justify-center border border-[#1FAF9A]/20">
                                  <svg className="w-4 h-4 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </div>
                              ) : item.type.includes('referral') || item.type === 'coupon' ? (
                                <div className="w-8 h-8 rounded-full bg-[#0E9F88]/10 flex items-center justify-center border border-[#0E9F88]/20">
                                  <svg className="w-4 h-4 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200"></div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-neutral-dark">
                                  {item.type === 'topup' ? 'Wallet Top-up' : 
                                   item.type.includes('referral') ? 'Referral Reward' :
                                   item.type === 'coupon' ? 'Coupon Redeemed' : item.product}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {item.type === 'topup' ? `Method: ${isIndiaRegion ? 'UPI' : 'Credit Card'}` : 
                                   item.type.includes('referral') || item.type === 'coupon' ? `Code: ${item.product}` : 'SKU: XXXX'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {item.type === 'topup' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0E9F88]"><span className="w-1.5 h-1.5 rounded-full bg-[#0E9F88]"></span> Deposit</span>
                            ) : item.type.includes('referral') || item.type === 'coupon' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0E9F88]"><span className="w-1.5 h-1.5 rounded-full bg-[#0E9F88]"></span> Reward</span>
                            ) : item.type === 'click' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#111827]"><span className="w-1.5 h-1.5 rounded-full bg-[#111827]"></span> Add to Cart</span>
                            ) : item.type === 'ai_mention' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Mention</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> View</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`${isCredit ? 'text-[#0E9F88]' : 'text-gray-500'} font-semibold tabular-nums`}>
                              {isCredit ? '+' : '-'} {wallet.currencySymbol}{Math.abs(item.amount).toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#111827] tabular-nums">
                            {wallet.currencySymbol}{(item.balance).toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Content: Payment Methods */}
            {activeTab === "methods" && (
              <div className="p-6 space-y-6">
                
                {isIndiaRegion ? (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[#1FAF9A] text-xs">UPI</div>
                      <div>
                        <p className="text-sm font-bold text-neutral-dark">merchant@okaxis</p>
                        <p className="text-xs text-gray-500 font-medium">Primary Method</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-blue-800 text-xs italic">VISA</div>
                      <div>
                        <p className="text-sm font-bold text-neutral-dark">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500 font-medium">Primary Method • Expires 12/28</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:text-red-700">Remove</button>
                  </div>
                )}
                
                <button 
                  onClick={() => setIsTopUpModalOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-[12px] font-medium text-[#111827] hover:bg-gray-50 transition-colors"
                >
                  + Add New Payment Method
                </button>
              </div>
            )}

            {/* Tab Content: Invoices */}
            {activeTab === "invoices" && (
              <div className="p-6 flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3 className="text-base font-bold text-neutral-dark mb-1">No invoices yet</h3>
                <p className="text-sm text-gray-500 max-w-sm">Monthly invoices will appear here at the end of your first billing cycle.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redeem Code Modal */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-sm" onClick={() => !isProcessing && !isSuccess && setIsRedeemModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {isSuccess ? (
              <div className="p-8 flex flex-col items-center text-center bg-gradient-to-b from-[#F0FDF4] to-white">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 className="text-xl font-bold text-[#111827] mb-2">Code Redeemed!</h4>
                <p className="text-gray-500 text-sm">Reward points have been successfully added to your wallet balance.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F8FAFB]">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-[#111827]">Redeem Code</h3>
                    <span className="text-xs text-gray-500 font-medium">Enter a referral or promotional coupon</span>
                  </div>
                  <button onClick={() => setIsRedeemModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Promo Code</label>
                    <input 
                      type="text" 
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SIMULA500" 
                      className={`w-full bg-white border ${redeemError ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#0E9F88]/20'} rounded-lg px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:ring-4 transition-all uppercase tracking-widest`}
                    />
                    {redeemError && <p className="text-xs text-red-500 font-medium">{redeemError}</p>}
                  </div>
                  <button 
                    onClick={handleRedeemSubmit}
                    disabled={!redeemCode || isProcessing}
                    className="w-full py-3 bg-[#111827] text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isProcessing ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : "Claim Reward"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Funds Modal (Region Aware) */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-sm" onClick={() => setIsTopUpModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-neutral-dark tracking-tight">Add Funds to Wallet</h3>
              <button onClick={() => setIsTopUpModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-neutral-dark mb-2">Payment Successful</h4>
                  <p className="text-gray-500 font-medium">{wallet.currencySymbol}{selectedTopUpAmount ? formatAmount(selectedTopUpAmount) : 0} has been added to your wallet.</p>
                </div>
              ) : (
                <>
                  {/* Step 1: Amount */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-medium text-gray-400 mb-3">1. Select Amount</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {topUpPresets.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setSelectedTopUpAmount(amount)}
                          className={`py-3 rounded-xl border-2 font-semibold tabular-nums transition-all ${
                            selectedTopUpAmount === amount 
                              ? "border-[#111827] bg-[#111827]/5 text-[#111827]" 
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {wallet.currencySymbol}{formatAmount(amount)}
                        </button>
                      ))}
                      <div className={`relative flex items-center rounded-xl border-2 transition-all overflow-hidden ${
                        !topUpPresets.includes(selectedTopUpAmount || 0) && selectedTopUpAmount !== null
                          ? "border-[#111827] bg-[#111827]/5" 
                          : "border-gray-200 bg-white focus-within:border-gray-300"
                      }`}>
                        <span className="absolute left-4 font-bold text-gray-400">{wallet.currencySymbol}</span>
                        <input 
                          type="number" 
                          placeholder="Custom"
                          onChange={(e) => setSelectedTopUpAmount(Number(e.target.value))}
                          onFocus={() => setSelectedTopUpAmount(selectedTopUpAmount === defaultAmount ? 0 : selectedTopUpAmount)}
                          className="w-full py-3 pl-8 pr-4 bg-transparent outline-none font-bold text-neutral-dark placeholder:text-gray-400 tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Payment Method */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-medium text-gray-400 mb-3">2. Payment Method</h4>
                    <div className="space-y-3">
                      
                      {isIndiaRegion ? (
                        <>
                          {/* INDIA: UPI */}
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'upi' ? 'border-[#111827] bg-[#111827]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4">
                              <input 
                                type="radio" 
                                name="payment_method" 
                                value="upi"
                                checked={selectedPaymentMethod === 'upi'}
                                onChange={() => setSelectedPaymentMethod('upi')}
                                className="mt-1 w-4 h-4 text-[#1FAF9A] focus:ring-[#1FAF9A] cursor-pointer" 
                              />
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className="font-bold text-neutral-dark block mb-1">Pay via UPI</span>
                                  <div className="text-xs font-bold text-[#1FAF9A] border border-[#1FAF9A]/20 bg-white px-2 py-0.5 rounded">UPI</div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 block mb-3">Google Pay, PhonePe, Paytm, BHIM</span>
                                
                                {selectedPaymentMethod === 'upi' && (
                                  <div className="mt-2 relative">
                                    <input 
                                      type="text" 
                                      placeholder="Enter UPI ID (e.g. mobile@upi)" 
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium"
                                    />
                                    <button className="absolute right-2 top-2 text-xs font-bold text-[#1FAF9A] hover:text-[#189986] bg-white px-2 py-0.5 rounded">Verify</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>

                          {/* INDIA: Card (Razorpay style) */}
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'card_india' ? 'border-[#111827] bg-[#111827]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4">
                              <input 
                                type="radio" 
                                name="payment_method" 
                                value="card_india"
                                checked={selectedPaymentMethod === 'card_india'}
                                onChange={() => setSelectedPaymentMethod('card_india')}
                                className="mt-1 w-4 h-4 text-[#1FAF9A] focus:ring-[#1FAF9A] cursor-pointer" 
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-neutral-dark block mb-1">Credit / Debit Card</span>
                                  <div className="flex gap-1 opacity-60">
                                    <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center text-[8px] text-white font-bold italic">VISA</div>
                                    <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-[8px] text-white font-bold">MC</div>
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 block">Domestic cards processed securely via Razorpay</span>
                                
                                {selectedPaymentMethod === 'card_india' && (
                                  <div className="mt-4 space-y-3">
                                    <input type="text" placeholder="Card Number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                    <div className="grid grid-cols-2 gap-3">
                                      <input type="text" placeholder="MM/YY" className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                      <input type="text" placeholder="CVV" className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>

                          {/* INDIA: Net Banking */}
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'netbanking' ? 'border-[#111827] bg-[#111827]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4">
                              <input 
                                type="radio" 
                                name="payment_method" 
                                value="netbanking"
                                checked={selectedPaymentMethod === 'netbanking'}
                                onChange={() => setSelectedPaymentMethod('netbanking')}
                                className="mt-1 w-4 h-4 text-[#1FAF9A] focus:ring-[#1FAF9A] cursor-pointer" 
                              />
                              <div className="flex-1">
                                <span className="font-bold text-neutral-dark block mb-1">Net Banking</span>
                                <span className="text-xs font-medium text-gray-500 block">All major Indian banks supported</span>
                                
                                {selectedPaymentMethod === 'netbanking' && (
                                  <div className="mt-4">
                                    <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 font-medium">
                                      <option>Select Bank...</option>
                                      <option>State Bank of India</option>
                                      <option>HDFC Bank</option>
                                      <option>ICICI Bank</option>
                                      <option>Axis Bank</option>
                                      <option>Kotak Mahindra Bank</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        </>
                      ) : (
                        <>
                          {/* GLOBAL: Card (Stripe style) */}
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'card_global' ? 'border-[#111827] bg-[#111827]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4">
                              <input 
                                type="radio" 
                                name="payment_method" 
                                value="card_global"
                                checked={selectedPaymentMethod === 'card_global'}
                                onChange={() => setSelectedPaymentMethod('card_global')}
                                className="mt-1 w-4 h-4 text-[#1FAF9A] focus:ring-[#1FAF9A] cursor-pointer" 
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-neutral-dark block mb-1">Credit / Debit Card</span>
                                  <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Stripe
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 block">Visa, Mastercard, Amex, Discover</span>
                                
                                {selectedPaymentMethod === 'card_global' && (
                                  <div className="mt-4 space-y-3">
                                    <input type="text" placeholder="Card Number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                    <div className="grid grid-cols-3 gap-3">
                                      <input type="text" placeholder="MM/YY" className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                      <input type="text" placeholder="CVV" className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                      <input type="text" placeholder="ZIP" className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>

                          {/* GLOBAL: ACH (US Only mock) */}
                          {mockMerchantProfile.country === "US" && (
                            <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'ach' ? 'border-[#1FAF9A] bg-[#1FAF9A]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <div className="flex items-start gap-4">
                                <input 
                                  type="radio" 
                                  name="payment_method" 
                                  value="ach"
                                  checked={selectedPaymentMethod === 'ach'}
                                  onChange={() => setSelectedPaymentMethod('ach')}
                                  className="mt-1 w-4 h-4 text-[#1FAF9A] focus:ring-[#1FAF9A] cursor-pointer" 
                                />
                                <div className="flex-1">
                                  <span className="font-bold text-neutral-dark block mb-1">Bank Transfer (ACH)</span>
                                  <span className="text-xs font-medium text-gray-500 block">Connect your US bank account (0% fee)</span>
                                  
                                  {selectedPaymentMethod === 'ach' && (
                                    <div className="mt-4 space-y-3">
                                      <input type="text" placeholder="Routing Number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                      <input type="text" placeholder="Account Number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          )}

                          {/* GLOBAL: SEPA/BACS (GB/EU mock) */}
                          {mockMerchantProfile.country === "GB" && (
                            <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'sepa' ? 'border-[#1FAF9A] bg-[#1FAF9A]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <div className="flex items-start gap-4">
                                <input 
                                  type="radio" 
                                  name="payment_method" 
                                  value="sepa"
                                  checked={selectedPaymentMethod === 'sepa'}
                                  onChange={() => setSelectedPaymentMethod('sepa')}
                                  className="mt-1 w-4 h-4 text-[#1FAF9A] focus:ring-[#1FAF9A] cursor-pointer" 
                                />
                                <div className="flex-1">
                                  <span className="font-bold text-neutral-dark block mb-1">BACS Direct Debit</span>
                                  <span className="text-xs font-medium text-gray-500 block">Connect your UK bank account</span>
                                  
                                  {selectedPaymentMethod === 'sepa' && (
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                      <input type="text" placeholder="Sort Code" className="col-span-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                      <input type="text" placeholder="Account Number" className="col-span-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 transition-all font-medium tabular-nums" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!isSuccess && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between">
                <div className="text-sm font-medium text-gray-500">
                  Total to pay: <span className="font-bold text-neutral-dark text-base tabular-nums">{wallet.currencySymbol}{selectedTopUpAmount ? formatAmount(selectedTopUpAmount) : 0}</span>
                </div>
                <button 
                  onClick={handleTopUpSubmit}
                  disabled={!selectedTopUpAmount || isProcessing}
                  className="px-8 py-3 bg-[#111827] text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </>
                  ) : "Secure Pay"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
