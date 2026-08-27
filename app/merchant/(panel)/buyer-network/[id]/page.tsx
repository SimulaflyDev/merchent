"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getContactAction } from "@/lib/auth/buyer-intelligence-actions";
import { callAction } from "@/lib/api/action-utils";
import type { ContactOut } from "@/lib/api/contacts";

// Helper to format currency
function formatCurrency(val: number): string {
  return "₹" + val.toLocaleString("en-IN");
}

// Mock purchase history function
interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
}

interface PurchaseOrder {
  id: string;
  date: string;
  time: string;
  products: string;
  total: number;
  charges: number;
  net: number;
  status: "Paid" | "Refunded" | "Pending";
  items: OrderItem[];
}

function getPurchaseHistory(name: string, inviteStatus: string): PurchaseOrder[] {
  if (name.toLowerCase().includes("rahul sharma")) {
    return [
      {
        id: "ORD-10041",
        date: "10 Jun 2026",
        time: "11:20",
        products: "Oslo Walnut Dining Table, Modern Floor Lamp",
        total: 185000,
        charges: 14800,
        net: 170200,
        status: "Paid",
        items: [
          { name: "Oslo Walnut Dining Table", sku: "ODT-3T-01", qty: 1, price: 150000 },
          { name: "Modern Floor Lamp", sku: "MFL-01", qty: 1, price: 35000 }
        ]
      },
      {
        id: "ORD-10032",
        date: "18 May 2026",
        time: "09:45",
        products: "Mist Ceramic Bookshelf, Desk Organizer Set",
        total: 42000,
        charges: 3360,
        net: 38640,
        status: "Paid",
        items: [
          { name: "Mist Ceramic Bookshelf", sku: "MCB-02", qty: 1, price: 32000 },
          { name: "Desk Organizer Set", sku: "DOS-05", qty: 1, price: 10000 }
        ]
      },
      {
        id: "ORD-10028",
        date: "02 Apr 2026",
        time: "16:10",
        products: "Rattan Accent Chair",
        total: 28500,
        charges: 2280,
        net: 26220,
        status: "Paid",
        items: [
          { name: "Rattan Accent Chair", sku: "RAC-09", qty: 1, price: 28500 }
        ]
      },
      {
        id: "ORD-10019",
        date: "14 Feb 2026",
        time: "13:55",
        products: "Abstract Wall Clock",
        total: 9800,
        charges: 0,
        net: 0,
        status: "Refunded",
        items: [
          { name: "Abstract Wall Clock", sku: "AWC-12", qty: 1, price: 9800 }
        ]
      },
      {
        id: "ORD-10015",
        date: "08 Jan 2026",
        time: "10:30",
        products: "Ember Coffee Table, Jute Area Rug (6x9)",
        total: 72000,
        charges: 5760,
        net: 66240,
        status: "Paid",
        items: [
          { name: "Ember Coffee Table", sku: "ECT-22", qty: 1, price: 48000 },
          { name: "Jute Area Rug (6x9)", sku: "JAR-69", qty: 1, price: 24000 }
        ]
      },
      {
        id: "ORD-10009",
        date: "22 Nov 2025",
        time: "15:42",
        products: "Velvet Sofa (Grey)",
        total: 120000,
        charges: 9600,
        net: 110400,
        status: "Paid",
        items: [
          { name: "Velvet Sofa (Grey)", sku: "VSG-10", qty: 1, price: 120000 }
        ]
      },
      {
        id: "ORD-10006",
        date: "05 Oct 2025",
        time: "12:00",
        products: "Brass Table Lamp, Ceramic Vase Set",
        total: 18500,
        charges: 1480,
        net: 17020,
        status: "Paid",
        items: [
          { name: "Brass Table Lamp", sku: "BTL-14", qty: 1, price: 12000 },
          { name: "Ceramic Vase Set", sku: "CVS-28", qty: 1, price: 6500 }
        ]
      },
      {
        id: "ORD-10004",
        date: "12 Sep 2025",
        time: "18:15",
        products: "Teak TV Console",
        total: 65000,
        charges: 5200,
        net: 59800,
        status: "Paid",
        items: [
          { name: "Teak TV Console", sku: "TTC-04", qty: 1, price: 65000 }
        ]
      },
      {
        id: "ORD-10002",
        date: "01 Aug 2025",
        time: "09:20",
        products: "Linen Curtain Set, Floating Wall Shelf",
        total: 34000,
        charges: 2720,
        net: 31280,
        status: "Paid",
        items: [
          { name: "Linen Curtain Set", sku: "LCS-33", qty: 1, price: 18000 },
          { name: "Floating Wall Shelf", sku: "FWS-08", qty: 1, price: 16000 }
        ]
      },
      {
        id: "ORD-10001",
        date: "15 Jun 2025",
        time: "14:05",
        products: "Luna Queen Bed Frame, Memory Foam Pillow (Pair)",
        total: 95000,
        charges: 7600,
        net: 87400,
        status: "Paid",
        items: [
          { name: "Luna Queen Bed Frame", sku: "LQB-45", qty: 1, price: 80000 },
          { name: "Memory Foam Pillow (Pair)", sku: "MFP-02", qty: 1, price: 15000 }
        ]
      },
      {
        id: "ORD-09998",
        date: "20 Apr 2025",
        time: "11:30",
        products: "Woven Storage Basket Set, Scented Candle Gift Box",
        total: 15200,
        charges: 1216,
        net: 13984,
        status: "Paid",
        items: [
          { name: "Woven Storage Basket Set", sku: "WSB-19", qty: 1, price: 9500 },
          { name: "Scented Candle Gift Box", sku: "SCG-02", qty: 1, price: 5700 }
        ]
      },
      {
        id: "ORD-09990",
        date: "28 Feb 2025",
        time: "16:45",
        products: "Marble Side Table",
        total: 48000,
        charges: 3840,
        net: 44160,
        status: "Paid",
        items: [
          { name: "Marble Side Table", sku: "MST-88", qty: 1, price: 48000 }
        ]
      },
      {
        id: "ORD-09985",
        date: "18 Jan 2025",
        time: "10:10",
        products: "Sheesham Wood Wardrobe",
        total: 55000,
        charges: 4400,
        net: 50600,
        status: "Paid",
        items: [
          { name: "Sheesham Wood Wardrobe", sku: "SWW-90", qty: 1, price: 55000 }
        ]
      }
    ];
  } else if (inviteStatus === "joined" || inviteStatus === "Joined") {
    return [
      {
        id: "ORD-08732",
        date: "12 May 2026",
        time: "14:30",
        products: "Mist Ceramic Bookshelf",
        total: 32000,
        charges: 2560,
        net: 29440,
        status: "Paid",
        items: [
          { name: "Mist Ceramic Bookshelf", sku: "MCB-02", qty: 1, price: 32000 }
        ]
      },
      {
        id: "ORD-08421",
        date: "24 Mar 2026",
        time: "10:15",
        products: "Modern Floor Lamp",
        total: 35000,
        charges: 2800,
        net: 32200,
        status: "Paid",
        items: [
          { name: "Modern Floor Lamp", sku: "MFL-01", qty: 1, price: 35000 }
        ]
      }
    ];
  }
  return [];
}

// Helper to filter dates
function isWithinDays(orderDateStr: string, maxDays: number): boolean {
  const current = new Date("2026-06-16");
  const parts = orderDateStr.split(" ");
  if (parts.length !== 3) return true;
  const day = parseInt(parts[0], 10);
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const month = months[parts[1]] ?? 0;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  const diffTime = current.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= maxDays;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [contact, setContact] = useState<ContactOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, 30d, 3m, 6m, 1y
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    callAction(getContactAction(id))
      .then((data) => {
        setContact(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load contact details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="animate-spin w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-8 text-center text-gray-500">
        Customer not found or failed to load.
      </div>
    );
  }

  // Parse details
  const initials = contact.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const statusMap: Record<string, string> = {
    not_invited: "Not Invited",
    invited: "Invited",
    joined: "Joined",
  };
  const inviteStatusLabel = statusMap[contact.invite_status] ?? contact.invite_status;

  const getSourceLabel = (src: string) => {
    if (src === "csv") return "CSV";
    if (src === "whatsapp") return "WhatsApp";
    if (src === "checkout" || src === "Checkout") return "Checkout";
    return "Manual";
  };

  // Determine city: if lead doesn't specify it, default to "Mumbai" if Rahul, else "Not Specified"
  const city = contact.source === "Checkout" ? "—" : (contact.name.toLowerCase().includes("rahul sharma") ? "Mumbai" : "Mumbai");

  // Get date joined string
  const formatJoinedDate = (createdStr: string) => {
    if (contact.name.toLowerCase().includes("rahul sharma")) return "14 Jan 2025";
    const date = new Date(createdStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Get orders and metrics
  const allOrders = getPurchaseHistory(contact.name, contact.invite_status);
  
  // Apply Date filtering
  const filteredOrders = allOrders.filter(order => {
    if (activeTab === "30d") return isWithinDays(order.date, 30);
    if (activeTab === "3m") return isWithinDays(order.date, 90);
    if (activeTab === "6m") return isWithinDays(order.date, 180);
    if (activeTab === "1y") return isWithinDays(order.date, 365);
    return true; // all
  });

  // Calculate metrics based on ALL purchase history (not filtered, as metrics reflect overall customer LTV)
  const nonRefundedOrders = allOrders.filter(o => o.status !== "Refunded");
  const totalOrdersCount = nonRefundedOrders.length;
  const totalSpent = nonRefundedOrders.reduce((acc, curr) => acc + curr.total, 0);
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSpent / totalOrdersCount) : 0;
  const platformChargesTotal = nonRefundedOrders.reduce((acc, curr) => acc + curr.charges, 0);
  const netEarnings = totalSpent - platformChargesTotal;

  // Toggle order expansion
  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Styles based on status
  const getStatusStyles = (status: string) => {
    if (status === "Joined" || status === "joined") {
      return { dot: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50/70 border-emerald-100" };
    }
    if (status === "Invited" || status === "invited") {
      return { dot: "bg-amber-400", text: "text-amber-700 bg-amber-50/70 border-amber-100" };
    }
    return { dot: "bg-gray-300", text: "text-gray-500 bg-gray-50/70 border-gray-200" };
  };

  const statusStyles = getStatusStyles(inviteStatusLabel);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      
      {/* ── Breadcrumb ── */}
      <div>
        <Link href="/merchant/buyer-network" className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-gray-900 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to My Customers
        </Link>
      </div>

      {/* ── Customer Details Header Card ── */}
      <div className="bg-white border border-[#E2E4E8] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] border border-[#EAECEF] text-[#111827] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111827] tracking-tight">{contact.name}</h1>
              <p className="text-[12px] text-gray-400 font-medium mt-0.5">Joined SimulaFly on {formatJoinedDate(contact.created_at)}</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Phone Badge */}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] hover:bg-gray-200 border border-[#EAECEF] rounded-lg text-[11px] font-semibold text-gray-500 transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {contact.phone}
                  </a>
                )}
                
                {/* City Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] border border-[#EAECEF] rounded-lg text-[11px] font-semibold text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {city}
                </span>

                {/* Source Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] border border-[#EAECEF] rounded-lg text-[11px] font-semibold text-gray-400">
                  {getSourceLabel(contact.source)}
                </span>

                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold ${statusStyles.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                  {inviteStatusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-[#F1F3F5]" />

        {/* ── KPI stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Total Orders</p>
            <p className="text-2xl font-bold text-[#111827] mt-2">{totalOrdersCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Total Spent</p>
            <p className="text-2xl font-bold text-[#111827] mt-2">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Avg. Order Value</p>
            <p className="text-2xl font-bold text-[#111827] mt-2">{formatCurrency(avgOrderValue)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Your Net Earnings</p>
            <p className="text-2xl font-bold text-[#0E9F88] mt-2">{formatCurrency(netEarnings)}</p>
          </div>
        </div>
      </div>

      {/* ── Platform Charges Summary Card ── */}
      <div className="bg-white border border-[#E2E4E8] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">Platform Charges Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#F8FAFB] border border-[#EAECEF] rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Gross Revenue</p>
            <p className="text-xl font-bold text-[#111827] mt-2">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="bg-[#F8FAFB] border border-[#EAECEF] rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Platform Charges</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(platformChargesTotal)}</p>
          </div>
          <div className="bg-[#E6F6F3] border border-[#C5ECE4] rounded-xl p-4">
            <p className="text-[10px] font-bold text-[#0E9F88] uppercase tracking-widest leading-none">Net Earnings</p>
            <p className="text-xl font-bold text-[#0E9F88] mt-2">{formatCurrency(netEarnings)}</p>
          </div>
        </div>
      </div>

      {/* ── Purchase History Section ── */}
      <div className="bg-white border border-[#E2E4E8] rounded-2xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-[#F1F3F5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827] tracking-tight">Purchase History</h2>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {allOrders.length} order{allOrders.length !== 1 ? "s" : ""} - Up to 1.5 years of activity via SimulaFly
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-[#F5F5F7] p-1 rounded-lg border border-[#EAECEF]">
            {[
              { id: "all", label: "All Time" },
              { id: "30d", label: "Last 30 Days" },
              { id: "3m", label: "Last 3 Months" },
              { id: "6m", label: "Last 6 Months" },
              { id: "1y", label: "Last 1 Year" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedOrders({}); }}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm border border-[#EAECEF]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Table */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400 text-xs">
              No orders found for the selected time period.
            </div>
          ) : (
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#F1F3F5] bg-gray-50/50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="w-10"></th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Products</th>
                  <th className="px-6 py-3.5 text-right">Order Total</th>
                  <th className="px-6 py-3.5 text-right">Platform Charges</th>
                  <th className="px-6 py-3.5 text-right">Net Revenue</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5]">
                {filteredOrders.map(order => {
                  const isExpanded = !!expandedOrders[order.id];
                  return (
                    <React.Fragment key={order.id}>
                      {/* Order Row */}
                      <tr 
                        onClick={() => toggleOrder(order.id)}
                        className={`hover:bg-gray-50/40 transition-colors cursor-pointer text-xs ${isExpanded ? "bg-gray-50/20" : ""}`}
                      >
                        {/* Caret */}
                        <td className="pl-4 py-4 text-center text-gray-400">
                          <svg 
                            className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-90" : ""}`} 
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </td>
                        {/* Date */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{order.date}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{order.time}</p>
                        </td>
                        {/* Order ID */}
                        <td className="px-6 py-4 font-mono font-bold text-gray-800">
                          {order.id}
                        </td>
                        {/* Products */}
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate font-medium">
                          <p className="truncate font-semibold text-gray-900">{order.products}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                        </td>
                        {/* Order Total */}
                        <td className="px-6 py-4 text-right font-bold text-gray-900 tabular-nums">
                          {formatCurrency(order.total)}
                        </td>
                        {/* Platform Charges */}
                        <td className="px-6 py-4 text-right text-gray-500 font-medium tabular-nums">
                          {order.charges > 0 ? formatCurrency(order.charges) : "—"}
                        </td>
                        {/* Net Revenue */}
                        <td className="px-6 py-4 text-right font-bold text-[#0E9F88] tabular-nums">
                          {order.net > 0 ? formatCurrency(order.net) : "—"}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            order.status === "Paid" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              order.status === "Paid" ? "bg-emerald-500" : "bg-red-500"
                            }`} />
                            {order.status}
                          </span>
                        </td>
                        {/* Doc Icon */}
                        <td className="pr-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button 
                            title="Invoice Details"
                            className="p-1.5 rounded-md hover:bg-[#F5F5F7] text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Section */}
                      {isExpanded && (
                        <tr className="bg-[#F8FAFB]/60">
                          <td colSpan={9} className="px-6 py-5 border-t border-[#F1F3F5]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                              {/* Left Column: Line items */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Line Items</h4>
                                <div className="space-y-2.5">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3.5 border border-[#EAECEF] rounded-xl shadow-sm">
                                      <div>
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">SKU: {item.sku} · Qty: {item.qty}</p>
                                      </div>
                                      <p className="font-bold text-gray-900 tabular-nums">{formatCurrency(item.price * item.qty)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Right Column: Platform charges breakdown */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Charges Breakdown</h4>
                                <div className="bg-white border border-[#EAECEF] rounded-xl p-4.5 shadow-sm space-y-3.5">
                                  <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Order Total</span>
                                    <span className="font-bold text-gray-900 tabular-nums">{formatCurrency(order.total)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-600 font-medium">
                                    <span>SimulaFly Platform Charges</span>
                                    <span className="font-bold text-gray-900 tabular-nums">{order.charges > 0 ? formatCurrency(order.charges) : "—"}</span>
                                  </div>
                                  <div className="border-t border-[#F1F3F5] pt-3.5 flex justify-between text-[#0E9F88] font-bold">
                                    <span>Net Revenue</span>
                                    <span className="text-[14px] tabular-nums">{order.net > 0 ? formatCurrency(order.net) : "—"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
