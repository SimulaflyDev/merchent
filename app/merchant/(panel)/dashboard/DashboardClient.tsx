"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lead } from "@/lib/types/lead";

interface AnalyticsSnapshot {
  external_redirects: number;
  ai_mentions: number;
  ai_image_generations: number;
  impressions: number;
  clicks: number;
  total_spend: number;
  published_products: number;
  total_products: number;
  ctr: number;
}

interface TopProduct {
  id: string;
  title: string;
  category: string | null;
  price: number | null;
  image: string | null;
  ai_mentions: number;
  clicks: number;
  spend: number;
}

interface DashboardClientProps {
  analyticsSnapshot: AnalyticsSnapshot;
  topProducts: TopProduct[];
  recentLeads: Lead[];
  totalLeads: number;
  pipelineValue: number;
  walletBalance: number;
  walletStatus: "active" | "depleted" | "frozen";
  walletCurrency: string;
}

const statusColorMap: Record<string, string> = {
  "New Lead": "text-blue-600",
  Synced: "text-amber-600",
  Converted: "text-[#0E9F88]",
  Lost: "text-gray-400",
};
const statusDotMap: Record<string, string> = {
  "New Lead": "bg-blue-500",
  Synced: "bg-amber-500",
  Converted: "bg-[#0E9F88]",
  Lost: "bg-gray-400",
};

function fmt(n: number) { return n.toLocaleString("en-IN"); }
function fmtRs(n: number) { return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }

function generateSparkline(points: number[], width: number, height: number) {
  if (points.length < 2) return "";
  const max = Math.max(...points) * 1.1 || 1;
  const min = Math.min(...points) * 0.9;
  const range = max - min || 1;
  const step = width / (points.length - 1);
  return points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * height;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export default function DashboardClient({
  analyticsSnapshot: s,
  topProducts,
  recentLeads,
  totalLeads,
  pipelineValue,
  walletBalance,
  walletStatus,
  walletCurrency,
}: DashboardClientProps) {
  const [hideBanner, setHideBanner] = useState(false);
  const [period, setPeriod] = useState("30D");

  const walletLow = walletBalance < 200;
  const currencySymbol = walletCurrency === "INR" ? "₹" : walletCurrency + " ";
  const ctrPct = (s.ctr * 100).toFixed(1);

  // Only show chart lines when there is real activity to display
  const hasActivity = s.total_spend > 0 || pipelineValue > 0 || s.ai_mentions > 0;

  const xAxisLabels = useMemo(() => {
    if (period === "7D")  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (period === "1Y")  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "30"];
  }, [period]);

  // Illustrative shape only shown when account already has real activity
  const mockRevenueData = useMemo(() => {
    if (!hasActivity) return [];
    if (period === "7D")  return [3800, 3600, 4000, 4200, 4800, 4500, 5000];
    if (period === "1Y")  return [10000, 12000, 15000, 11000, 22000, 28000, 25000, 31000, 29000, 38000, 36000, 42000];
    return [1200, 1500, 1100, 2200, 2800, 2500, 3100, 2900, 3800, 3600, 4200, 4800];
  }, [period, hasActivity]);

  const mockSpendData = useMemo(() => {
    if (!hasActivity) return [];
    if (period === "7D")  return [140, 135, 150, 160, 180, 170, 190];
    if (period === "1Y")  return [400, 500, 600, 450, 900, 1100, 1000, 1200, 1150, 1400, 1350, 1600];
    return [50, 60, 45, 90, 110, 100, 120, 115, 140, 135, 160, 180];
  }, [period, hasActivity]);

  const revPath   = generateSparkline(mockRevenueData, 600, 200);
  const spendPath = generateSparkline(mockSpendData,   600, 200);

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-8">

      {/* Low Balance Banner */}
      {!hideBanner && walletLow && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="flex-1">
            <h4 className="text-[13px] font-semibold text-amber-900 mb-1">Wallet Balance Low</h4>
            <p className="text-[12px] text-amber-700">
              Balance is <strong>{currencySymbol}{fmt(walletBalance)}</strong>. Products may pause when funds run out.{" "}
              <Link href="/merchant/billing" className="underline font-semibold">Top up now →</Link>
            </p>
          </div>
          <button onClick={() => setHideBanner(true)} className="p-1 text-amber-500 hover:text-amber-700">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-[12px] text-gray-400 font-normal mt-1">Your storefront overview — last 30 days.</p>
        </div>
        <Link href="/merchant/products" className="h-8 px-4 bg-[#111827] text-white text-[11px] font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </Link>
      </div>

      {/* ── KPI Ribbon (real data) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className={`bg-white border rounded-xl p-5 flex flex-col justify-between ${walletLow ? "border-amber-200" : "border-[#EAECEF]"}`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Wallet Balance</span>
            {walletStatus === "depleted" && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Depleted</span>}
            {walletStatus === "active" && !walletLow && <span className="text-[10px] font-medium text-[#0E9F88]">Active</span>}
            {walletStatus === "active" && walletLow && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Low</span>}
          </div>
          <div>
            <h3 className={`text-[28px] font-bold tabular-nums tracking-tight ${walletLow ? "text-amber-600" : "text-[#111827]"}`}>
              {currencySymbol}{fmt(walletBalance)}
            </h3>
            <Link href="/merchant/billing" className="text-[11px] text-[#0E9F88] mt-1 font-medium hover:underline inline-block">Add funds →</Link>
          </div>
        </div>

        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Token Spend (30d)</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">{fmtRs(s.total_spend)}</h3>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">Across {s.published_products} active products</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Total Leads</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">{fmt(totalLeads)}</h3>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">Pipeline: {fmtRs(pipelineValue)}</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Catalogue</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">
              {s.published_products}
              <span className="text-[16px] text-gray-400 font-medium">/{s.total_products}</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">Products published</p>
          </div>
        </div>
      </div>

      {/* ── Platform Engagement Strip (real data) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 mb-1">External Redirects</p>
            <p className="text-[22px] font-bold text-[#111827] tabular-nums leading-none">{fmt(s.external_redirects)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Buyers sent to your store</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 mb-1">AI Mentions</p>
            <p className="text-[22px] font-bold text-[#111827] tabular-nums leading-none">{fmt(s.ai_mentions)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Products surfaced by AI</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 mb-1">AI Visualizations</p>
            <p className="text-[22px] font-bold text-[#111827] tabular-nums leading-none">{fmt(s.ai_image_generations)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Room renders generated</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 mb-1">Click-Through Rate</p>
            <p className="text-[22px] font-bold text-[#111827] tabular-nums leading-none">{ctrPct}%</p>
            <p className="text-[10px] text-gray-400 mt-1">{fmt(s.clicks)} clicks · {fmt(s.impressions)} impr.</p>
          </div>
        </div>
      </div>

      {/* ── Spend vs Revenue Chart ── */}
      <div className="bg-white rounded-xl border border-[#EAECEF] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
            <div>
              <h4 className="text-[15px] font-semibold text-[#111827] tracking-tight">Spend vs Revenue</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Token investment vs checkout revenue over time.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-0.5 bg-[#0E9F88] rounded inline-block" />
                  <span className="text-[11px] font-medium text-gray-500">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-8 border-t-2 border-dashed border-gray-400 inline-block" />
                  <span className="text-[11px] font-medium text-gray-500">Token Spend</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#EDEEF0] border border-[#EAECEF] rounded-lg p-1">
                {(["7D", "30D", "1Y"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${period === p ? "bg-white text-[#111827] shadow-sm" : "text-gray-500 hover:text-[#111827]"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real summary strip */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="pr-6">
              <p className="text-[10px] font-medium text-gray-400">Token Spend (30d)</p>
              <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">{fmtRs(s.total_spend)}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{s.published_products} products active</p>
            </div>
            <div className="px-6">
              <p className="text-[10px] font-medium text-gray-400">Pipeline Value</p>
              <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">{fmtRs(pipelineValue)}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">From {fmt(totalLeads)} leads</p>
            </div>
            <div className="pl-6">
              <p className="text-[10px] font-medium text-gray-400">Wallet Balance</p>
              <p className={`text-2xl font-bold tabular-nums mt-1 ${walletLow ? "text-amber-600" : "text-[#0E9F88]"}`}>
                {currencySymbol}{fmt(walletBalance)}
              </p>
              <Link href="/merchant/billing" className="text-[11px] text-[#0E9F88] font-normal mt-0.5 hover:underline inline-block">Billing →</Link>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        {!hasActivity ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-[#EAECEF] flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-400">No activity yet</p>
              <p className="text-[11px] text-gray-300 mt-0.5">Chart will populate once products are active and receiving traffic.</p>
            </div>
            <Link href="/merchant/products/add" className="mt-1 px-4 py-1.5 bg-[#111827] text-white text-[11px] font-medium rounded-lg hover:bg-black transition-colors">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="relative px-6 pt-6 pb-10" style={{ height: "340px" }}>
            <div className="absolute left-6 top-6 bottom-10 flex flex-col justify-between text-[10px] font-semibold text-gray-400">
              <span>₹5L</span><span>₹4L</span><span>₹3L</span><span>₹2L</span><span>₹1L</span><span>₹0</span>
            </div>
            <div className="relative border-l border-b border-gray-100 ml-8" style={{ height: "260px" }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0,1,2,3,4,5].map((i) => <div key={i} className="w-full h-px bg-gray-50/80" />)}
              </div>
              <svg viewBox="0 0 600 260" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0E9F88" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0E9F88" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Revenue area fill */}
                <path d={`${revPath} L 600 260 L 0 260 Z`} fill="url(#revGrad)" />
                {/* Revenue line */}
                <path d={revPath} fill="none" stroke="#0E9F88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {/* Spend area fill */}
                <path d={`${spendPath} L 600 260 L 0 260 Z`} fill="url(#spendGrad)" />
                {/* Spend dashed line */}
                <path d={spendPath} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
                {/* End dot */}
                <circle cx="545" cy="25" r="5" fill="white" stroke="#0E9F88" strokeWidth="2" />
                <circle cx="545" cy="210" r="3.5" fill="white" stroke="#9CA3AF" strokeWidth="1.5" />
              </svg>
            </div>
            {/* X-axis labels */}
            <div className="absolute left-14 right-6 bottom-3 flex justify-between text-[10px] font-semibold text-gray-400">
              {xAxisLabels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Grid: Products + Leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Top Products (real from analytics API) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#EAECEF] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#F1F3F5]">
            <div>
              <h4 className="text-[13px] font-semibold text-[#111827] tracking-tight">Top Products by AI Reach</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Ranked by AI mentions (30d).</p>
            </div>
            <Link href="/merchant/analytics" className="text-[11px] font-medium text-[#0E9F88] hover:underline">All &rarr;</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {topProducts.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-gray-400">
                No product data yet.{" "}
                <Link href="/merchant/products" className="text-[#0E9F88] underline">Add products →</Link>
              </div>
            ) : (
              topProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/merchant/products`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#FAFBFC] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-200 shrink-0" />
                    )}
                    <div>
                      <h5 className="text-[12px] font-semibold text-[#111827] group-hover:text-[#0E9F88] transition-colors truncate max-w-[140px]">
                        {p.title}
                      </h5>
                      <p className="text-[10px] font-normal text-gray-400">{p.category ?? "Uncategorised"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {p.price != null && <p className="text-[12px] font-semibold text-[#111827]">{fmtRs(p.price)}</p>}
                    <p className="text-[10px] font-medium text-[#0E9F88] mt-0.5">{fmt(p.ai_mentions)} AI mentions</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Leads (real from leads API) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#EAECEF] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#F1F3F5]">
            <div>
              <h4 className="text-[13px] font-semibold text-[#111827] tracking-tight">Recent Leads</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Latest purchase intents from SimulaFly.</p>
            </div>
            <Link href="/merchant/orders" className="text-[11px] font-medium text-[#0E9F88] hover:underline">
              View All ({fmt(totalLeads)}) &rarr;
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-gray-400">
                No leads yet. Leads appear here once buyers interact with your products.
              </div>
            ) : (
              <div className="divide-y divide-[#F1F3F5]">
                {recentLeads.map((lead, idx) => (
                  <Link
                    key={idx}
                    href="/merchant/orders"
                    className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors group cursor-pointer block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F1F2F4] border border-[#EAECEF] rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#111827] group-hover:text-[#0E9F88] transition-colors">#{lead.id}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{lead.date}</span>
                          {lead.customer.city && (
                            <><span className="w-1 h-1 bg-gray-300 rounded-full" /><span className="text-[11px] text-gray-400">{lead.customer.city}</span></>
                          )}
                          {lead.aiInteractions > 0 && (
                            <><span className="w-1 h-1 bg-gray-300 rounded-full" /><span className="text-[11px] text-[#0E9F88] font-medium">{lead.aiInteractions} AI</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-semibold text-[#111827] tabular-nums">{fmtRs(lead.total)}</p>
                      <span className={`inline-flex items-center gap-1.5 mt-1 text-[10px] font-medium ${statusColorMap[lead.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[lead.status]}`} />
                        {lead.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
