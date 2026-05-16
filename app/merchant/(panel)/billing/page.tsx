"use client";

import { useState } from "react";
import Link from "next/link";

// --- Region-Aware Mock Data ---
// Hardcoded to India region as requested
const mockMerchantProfile = {
  country: "IN",       // "IN" | "US" | "GB"
  currency: "INR",     // "INR" | "USD" | "GBP"
  currencySymbol: "₹", // "₹" | "$" | "£"
};

const isIndiaRegion = mockMerchantProfile.country === "IN";

const mockWallet = {
  balance: isIndiaRegion ? 2400.00 : 48.50,
  currency: mockMerchantProfile.currency,
  currencySymbol: mockMerchantProfile.currencySymbol,
  lastTopUp: isIndiaRegion ? 5000.00 : 100.00,
  autoRecharge: false,
  threshold: isIndiaRegion ? 500 : 10,
};

const mockLedger = [
  { id: 1, date: "14 May, 14:32", type: "ai_mention", product: "Oak Dining Table", amount: isIndiaRegion ? -0.50 : -0.005, balance: isIndiaRegion ? 2400.00 : 48.50 },
  { id: 2, date: "14 May, 13:15", type: "click", product: "Blue Velvet Sofa", amount: isIndiaRegion ? -1.00 : -0.010, balance: isIndiaRegion ? 2400.50 : 48.505 },
  { id: 3, date: "14 May, 11:00", type: "ar_view", product: "Rattan Chair", amount: isIndiaRegion ? -0.25 : -0.003, balance: isIndiaRegion ? 2401.50 : 48.515 },
  { id: 4, date: "12 May, 09:00", type: "topup", product: null, amount: isIndiaRegion ? 2000.00 : 50.00, balance: isIndiaRegion ? 2401.75 : 48.518 },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("All Time");
  const [typeFilter, setTypeFilter] = useState("All Events");
  
  // Default selected amount based on region
  const defaultAmount = isIndiaRegion ? 1000 : 50;
  const topUpPresets = isIndiaRegion ? [500, 1000, 2000, 5000, 10000] : [10, 50, 100, 250, 500];
  
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number | null>(defaultAmount);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(isIndiaRegion ? "upi" : "card_global");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoRecharge, setAutoRecharge] = useState(mockWallet.autoRecharge);

  const handleTopUpSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsTopUpModalOpen(false);
        setSelectedTopUpAmount(defaultAmount);
      }, 2000);
    }, 1500);
  };

  const formatAmount = (amt: number) => {
    return amt.toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: isIndiaRegion ? 0 : 2 });
  };

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-neutral-dark font-semibold">Billing & Tokens</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {mockMerchantProfile.country} Region
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-dark tracking-tight">Financial Control Center</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Wallet Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">SimulaFly Wallet</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl text-gray-400 font-bold">{mockWallet.currencySymbol}</span>
                <span className="text-5xl font-bold text-neutral-dark tabular-nums tracking-tight">
                  {mockWallet.balance.toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Runway</span>
                <span>{Math.round((mockWallet.balance / mockWallet.lastTopUp) * 100)}% of last top-up</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#1FAF9A] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((mockWallet.balance / mockWallet.lastTopUp) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={() => setIsTopUpModalOpen(true)}
              className="w-full py-3 bg-[#1FAF9A] text-white font-bold rounded-lg hover:bg-[#189986] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Funds
            </button>

            <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-dark">Auto-Recharge</p>
                <p className="text-xs text-gray-500 font-medium">When balance drops below {mockWallet.currencySymbol}{mockWallet.threshold}</p>
              </div>
              <button 
                onClick={() => setAutoRecharge(!autoRecharge)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRecharge ? 'bg-[#1FAF9A]' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRecharge ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs & Tables */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-6">
              {[
                { id: "history", label: "Balance History" },
                { id: "methods", label: "Payment Methods" },
                { id: "invoices", label: "Invoices" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? "border-[#1FAF9A] text-[#1FAF9A]" 
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
                      <option value="click">AI Add-to-Cart</option>
                      <option value="ai_mention">AI Mentions</option>
                      <option value="ar_view">AI Views</option>
                      <option value="topup">Top-ups</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-xs font-medium text-gray-500">
                      <strong className="text-neutral-dark">
                        {mockLedger.filter(item => typeFilter === "All Events" || item.type === typeFilter).length}
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
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-bold h-10">
                        <th className="px-6">Date & Time</th>
                        <th className="px-6">Product / Action</th>
                        <th className="px-6">Event Type</th>
                        <th className="px-6 text-right">Amount Deducted</th>
                        <th className="px-6 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {/* Detailed Usage History Rows */}
                      {mockLedger
                        .filter(item => typeFilter === "All Events" || item.type === typeFilter)
                        .map((item) => (
                        <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors font-medium text-gray-700 ${item.type === 'topup' ? 'bg-[#F8FAFB]' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-neutral-dark font-bold tabular-nums">{item.date.split(',')[0]} 2026</span>
                              <span className="text-xs text-gray-500 tabular-nums">{item.date.split(',')[1].trim()}:00</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.type === 'topup' ? (
                                <div className="w-8 h-8 rounded-full bg-[#1FAF9A]/10 flex items-center justify-center border border-[#1FAF9A]/20">
                                  <svg className="w-4 h-4 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200"></div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-neutral-dark">{item.type === 'topup' ? 'Wallet Top-up' : item.product}</span>
                                <span className="text-xs text-gray-500">{item.type === 'topup' ? `Method: ${isIndiaRegion ? 'UPI' : 'Credit Card'}` : 'SKU: XXXX'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {item.type === 'topup' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Deposit</span>
                            ) : item.type === 'click' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Add to Cart</span>
                            ) : item.type === 'ai_mention' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> AI Mention</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-700"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> AI View</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`${item.type === 'topup' ? 'text-emerald-500' : 'text-red-500'} font-bold tabular-nums`}>
                              {item.type === 'topup' ? '+' : '-'} {mockWallet.currencySymbol}{Math.abs(item.amount).toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-neutral-dark tabular-nums">
                            {mockWallet.currencySymbol}{(item.balance).toLocaleString(isIndiaRegion ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
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
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-[#1FAF9A] hover:bg-gray-50 transition-colors"
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
                  <p className="text-gray-500 font-medium">{mockWallet.currencySymbol}{selectedTopUpAmount ? formatAmount(selectedTopUpAmount) : 0} has been added to your wallet.</p>
                </div>
              ) : (
                <>
                  {/* Step 1: Amount */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">1. Select Amount</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {topUpPresets.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setSelectedTopUpAmount(amount)}
                          className={`py-3 rounded-xl border-2 font-bold tabular-nums transition-all ${
                            selectedTopUpAmount === amount 
                              ? "border-[#1FAF9A] bg-[#1FAF9A]/5 text-[#1FAF9A]" 
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {mockWallet.currencySymbol}{formatAmount(amount)}
                        </button>
                      ))}
                      <div className={`relative flex items-center rounded-xl border-2 transition-all overflow-hidden ${
                        !topUpPresets.includes(selectedTopUpAmount || 0) && selectedTopUpAmount !== null
                          ? "border-[#1FAF9A] bg-[#1FAF9A]/5" 
                          : "border-gray-200 bg-white focus-within:border-gray-300"
                      }`}>
                        <span className="absolute left-4 font-bold text-gray-400">{mockWallet.currencySymbol}</span>
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
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">2. Payment Method</h4>
                    <div className="space-y-3">
                      
                      {isIndiaRegion ? (
                        <>
                          {/* INDIA: UPI */}
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'upi' ? 'border-[#1FAF9A] bg-[#1FAF9A]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
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
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'card_india' ? 'border-[#1FAF9A] bg-[#1FAF9A]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
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
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'netbanking' ? 'border-[#1FAF9A] bg-[#1FAF9A]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
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
                          <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'card_global' ? 'border-[#1FAF9A] bg-[#1FAF9A]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
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
                  Total to pay: <span className="font-bold text-neutral-dark text-base tabular-nums">{mockWallet.currencySymbol}{selectedTopUpAmount ? formatAmount(selectedTopUpAmount) : 0}</span>
                </div>
                <button 
                  onClick={handleTopUpSubmit}
                  disabled={!selectedTopUpAmount || isProcessing}
                  className="px-8 py-3 bg-[#1FAF9A] text-white font-bold rounded-lg hover:bg-[#189986] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
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

