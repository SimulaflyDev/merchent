"use client";

import { useMerchant } from "../../context/MerchantContext";
import { useState } from "react";

function DiscountModal({ customer, onClose }: { customer: any, onClose: () => void }) {
  const code = `SIMFLY-${customer.id.replace('CID-', '')}-10`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Issue Discount Code</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600">
            Generating a <strong className="text-gray-900">10% loyalty discount</strong> for <strong className="text-gray-900">{customer.name}</strong>. Share this code directly with the customer via WhatsApp.
          </p>
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between gap-4">
            <span className="font-mono text-lg font-bold text-[#1FAF9A] tracking-widest">{code}</span>
            <button
              onClick={copy}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <a
            href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(customer.name)}%2C%20here%20is%20your%20exclusive%20SimulaFly%20discount%20code%3A%20${code}%20-%20enjoy%2010%25%20off%20your%20next%20order!`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#1DA851] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            Send via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const { leads } = useMerchant();
  const [searchQuery, setSearchQuery] = useState("");
  const [discountTarget, setDiscountTarget] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const customerMap = new Map<string, any>();
  leads.forEach(lead => {
    const customerId = `CID-${lead.customer.name.substring(0,3).toUpperCase()}${lead.customer.phone.substring(lead.customer.phone.length - 4)}`;
    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        id: customerId,
        name: lead.customer.name,
        email: lead.customer.email,
        phone: lead.customer.phone,
        city: lead.customer.city,
        totalOrders: 1,
        lifetimeSpend: lead.total,
        aiInteractions: lead.aiInteractions,
        lastOrderDate: lead.date
      });
    } else {
      const existing = customerMap.get(customerId);
      existing.totalOrders += 1;
      existing.lifetimeSpend += lead.total;
      existing.aiInteractions += lead.aiInteractions;
    }
  });

  const customers = Array.from(customerMap.values()).filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Customer ID,Name,Email,City,Total Orders,Lifetime Spend,AI Interactions\n"
        + customers.map(c => `${c.id},${c.name},${c.email},${c.city},${c.totalOrders},${c.lifetimeSpend},${c.aiInteractions}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `simulafly_customers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 w-full space-y-6 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-1 tracking-tight">Customer Relationships</h1>
          <p className="text-sm text-gray-600">Manage your specific buyers and issue targeted discounts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isExporting ? (
              <svg className="w-4 h-4 text-gray-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            )}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Search by name or Customer ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1FAF9A] focus:ring-1 focus:ring-[#1FAF9A] transition-shadow"
          />
        </div>
        <p className="text-xs text-gray-400 font-medium ml-auto">{customers.length} customers</p>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFB] border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Lifetime Spend</th>
                <th className="px-6 py-4">AI Engagement</th>
                <th className="px-6 py-4 text-right">Promotions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No customers found.</td></tr>
              ) : customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1FAF9A]/10 text-[#1FAF9A] font-bold flex items-center justify-center shrink-0 text-sm">
                        {cust.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{cust.name}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{cust.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">{cust.city}, India</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{cust.totalOrders}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Last: {cust.lastOrderDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">₹{cust.lifetimeSpend.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-[#1FAF9A]/10 text-[#1FAF9A] px-2 py-1 rounded text-xs font-bold">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      {cust.aiInteractions} interactions
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 hover:text-[#1FAF9A] hover:border-[#1FAF9A]/30 transition-all shadow-sm inline-flex items-center gap-1.5"
                      onClick={() => setDiscountTarget(cust)}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      Issue Discount
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {discountTarget && <DiscountModal customer={discountTarget} onClose={() => setDiscountTarget(null)} />}
    </div>
  );
}
