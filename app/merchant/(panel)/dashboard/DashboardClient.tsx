"use client";

import Link from "next/link";
import { publicShopUrl } from "@/lib/share-links";
import { useMemo, useState } from "react";
import type { Lead } from "@/lib/types/lead";
import { useMerchant } from "@/app/merchant/context/MerchantContext";
import ShareCatalogModal from "../products/ShareCatalogModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyMetric {
  date: string;
  spend: number;
  revenue: number;
  pipeline: number;
  drop_rate: number;
}

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
  daily_metrics: DailyMetric[];
  total_leads: number;
  pipeline_value: number;
  drop_rate: number;
  catalog_published: number;
  catalog_archived: number;
  catalog_draft: number;
  catalog_paused: number;
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
  "New Order": "text-blue-600",
  "Order Confirmed": "text-amber-600",
  Converted: "text-[#0E9F88]",
  "Cancelled Orders": "text-gray-400",
};
const statusDotMap: Record<string, string> = {
  "New Order": "bg-blue-500",
  "Order Confirmed": "bg-amber-500",
  Converted: "bg-[#0E9F88]",
  "Cancelled Orders": "bg-gray-400",
};

function fmt(n: number) { return n.toLocaleString("en-IN"); }
function fmtRs(n: number) { return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }



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
  const [graphType, setGraphType] = useState<"revenue" | "pipeline" | "drop_rate">("revenue");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const { merchant } = useMerchant();

  const walletLow = walletBalance < 200;
  const currencySymbol = walletCurrency === "INR" ? "₹" : walletCurrency + " ";
  const ctrPct = (s.ctr * 100).toFixed(1);
  const totalRevenue = useMemo(() => {
    return (s.daily_metrics || []).reduce((acc, m) => acc + (m.revenue || 0), 0);
  }, [s.daily_metrics]);

  // Only show chart lines when there is real activity to display
  const hasActivity = s.total_spend > 0 || pipelineValue > 0 || s.ai_mentions > 0;

  const chartData = useMemo(() => {
    const metrics = s.daily_metrics || [];
    if (!hasActivity) return [];

    const formatMetric = (m: DailyMetric) => {
      const d = new Date(m.date);
      const name = isNaN(d.getTime()) ? m.date : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const base = {
        name,
        "Total Balance Spent": m.spend,
      };
      if (graphType === "revenue") {
        return { ...base, Revenue: m.revenue };
      } else if (graphType === "pipeline") {
        return { ...base, Pipeline: m.pipeline };
      } else {
        return { ...base, "Drop Rate (%)": m.drop_rate * 100 };
      }
    };

    if (period === "7D") {
      return metrics.slice(-7).map(formatMetric);
    }

    if (period === "1Y") {
      const groupedByMonth: Record<string, { spend: number; revenue: number; pipeline: number; drop_rate_sum: number; count: number }> = {};
      metrics.forEach((m) => {
        const d = new Date(m.date);
        if (isNaN(d.getTime())) return;
        const monthKey = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = { spend: 0, revenue: 0, pipeline: 0, drop_rate_sum: 0, count: 0 };
        }
        groupedByMonth[monthKey].spend += m.spend;
        groupedByMonth[monthKey].revenue += m.revenue;
        groupedByMonth[monthKey].pipeline += m.pipeline;
        groupedByMonth[monthKey].drop_rate_sum += m.drop_rate;
        groupedByMonth[monthKey].count += 1;
      });
      return Object.entries(groupedByMonth).map(([month, val]) => {
        const base = {
          name: month,
          "Total Balance Spent": val.spend,
        };
        if (graphType === "revenue") {
          return { ...base, Revenue: val.revenue };
        } else if (graphType === "pipeline") {
          return { ...base, Pipeline: val.pipeline };
        } else {
          return { ...base, "Drop Rate (%)": (val.drop_rate_sum / (val.count || 1)) * 100 };
        }
      });
    }

    // 30D (default)
    return metrics.map(formatMetric);
  }, [s.daily_metrics, period, graphType, hasActivity]);


  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

      {/* Low Balance Banner */}
      {!hideBanner && walletLow && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div className="flex-1">
            <h4 className="text-[13px] font-semibold text-amber-900 mb-1">Wallet Balance Low</h4>
            <p className="text-[12px] text-amber-700">
              Balance is <strong>{currencySymbol}{fmt(walletBalance)}</strong>. Products may pause when funds run out.{" "}
              <Link href="/merchant/billing" className="underline font-semibold">Top up now →</Link>
            </p>
          </div>
          <button onClick={() => setHideBanner(true)} className="p-1 text-amber-500 hover:text-amber-700">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-[12px] text-gray-400 font-normal mt-1">Your storefront overview — last 30 days.</p>
        </div>
        <Link href="/merchant/products" className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 text-[11px] font-medium text-white transition-colors hover:bg-black sm:w-auto">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Product
        </Link>
      </div>

      {/* ── QR Share Card ── */}
      {merchant && (
        <div className="flex flex-col items-stretch gap-4 rounded-xl border border-[#2d3748] bg-gradient-to-r from-[#111827] to-[#1f2937] p-5 sm:flex-row sm:items-center sm:gap-5">
          {/* Live QR preview */}
          <div className="self-start shrink-0 rounded-xl bg-white p-2.5 shadow-lg sm:self-auto">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(publicShopUrl(merchant.slug))}&color=111827&margin=4`}
              alt="Store QR"
              className="w-16 h-16 block"
            />
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#0E9F88] tracking-widest uppercase mb-1">Your Store QR Code</p>
            <h3 className="text-[15px] font-semibold text-white leading-tight truncate">{merchant.display_name}</h3>
            <p className="text-[12px] text-gray-400 mt-1 font-mono">{merchant.referral_code}</p>
          </div>
          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-[12px] font-semibold text-[#111827] transition-colors hover:bg-gray-100 sm:w-auto"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
              </svg>
              Share / Download QR
            </button>
          </div>
        </div>
      )}
      {qrModalOpen && merchant && (
        <ShareCatalogModal merchant={merchant} onClose={() => setQrModalOpen(false)} />
      )}

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
            <span className="text-[10px] font-medium text-gray-400">Total Balance Spent (30d)</span>
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
              {s.catalog_published}
              <span className="text-[16px] text-gray-400 font-medium">/{s.total_products}</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 font-normal">
              <span className="text-[#0E9F88] font-semibold">{s.catalog_published} pub.</span>
              <span>•</span>
              <span>{s.catalog_archived} arch.</span>
              <span>•</span>
              <span>{s.catalog_draft} draft</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform Engagement Strip (real data) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 mb-1">Click-Through Rate</p>
            <p className="text-[22px] font-bold text-[#111827] tabular-nums leading-none">{ctrPct}%</p>
            <p className="text-[10px] text-gray-400 mt-1">{fmt(s.clicks)} clicks · {fmt(s.impressions)} impr.</p>
          </div>
        </div>
      </div>


      {/* ── Dynamic Chart ── */}
      <div className="bg-white rounded-xl border border-[#EAECEF] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
            <div>
              <h4 className="text-[15px] font-semibold text-[#111827] tracking-tight">
                {graphType === "revenue" && "Spend vs Revenue"}
                {graphType === "pipeline" && "Spend vs Pipeline"}
                {graphType === "drop_rate" && "Spend vs Drop Rate"}
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {graphType === "revenue" && "Total investment vs checkout revenue over time."}
                {graphType === "pipeline" && "Total investment vs active cart pipeline value over time."}
                {graphType === "drop_rate" && "Total investment vs drop/cancellation rate over time."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Graph Type Selector */}
              <div className="flex items-center gap-1 bg-[#EDEEF0] border border-[#EAECEF] rounded-lg p-1">
                {(["revenue", "pipeline", "drop_rate"] as const).map((gt) => (
                  <button
                    key={gt}
                    onClick={() => setGraphType(gt)}
                    className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${graphType === gt ? "bg-white text-[#111827] shadow-sm" : "text-gray-500 hover:text-[#111827]"}`}
                  >
                    {gt === "revenue" && "Revenue"}
                    {gt === "pipeline" && "Pipeline"}
                    {gt === "drop_rate" && "Drop Rate"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-8 h-0.5 rounded inline-block ${graphType === "revenue" ? "bg-[#0E9F88]" : graphType === "pipeline" ? "bg-blue-500" : "bg-red-500"}`} />
                  <span className="text-[11px] font-medium text-gray-500">
                    {graphType === "revenue" && "Revenue"}
                    {graphType === "pipeline" && "Pipeline"}
                    {graphType === "drop_rate" && "Drop Rate (%)"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-8 border-t-2 border-dashed border-gray-400 inline-block" />
                  <span className="text-[11px] font-medium text-gray-500">Total Balance Spent</span>
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
          <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <p className="text-[10px] font-medium text-gray-400">Total Balance Spent (30d)</p>
              <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">{fmtRs(s.total_spend)}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{s.published_products} products active</p>
            </div>
            <div className="py-4 sm:px-6 sm:py-0">
              <p className="text-[10px] font-medium text-gray-400">
                {graphType === "revenue" && "Total Revenue Generated"}
                {graphType === "pipeline" && "Pipeline Value"}
                {graphType === "drop_rate" && "Drop Rate Value"}
              </p>
              <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">
                {graphType === "revenue" && fmtRs(totalRevenue)}
                {graphType === "pipeline" && fmtRs(pipelineValue)}
                {graphType === "drop_rate" && `${(s.drop_rate * 100).toFixed(1)}%`}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {graphType === "revenue" && "From checkout conversions"}
                {graphType === "pipeline" && `From ${fmt(totalLeads)} orders`}
                {graphType === "drop_rate" && "Average cancellation rate"}
              </p>
            </div>
            <div className="pt-4 sm:pl-6 sm:pt-0">
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
          <div className="relative px-2 pb-6 pt-6 sm:px-6" style={{ height: "340px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E9F88" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0E9F88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECEF" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                  tickFormatter={(value) => graphType === "drop_rate" ? `${value.toFixed(0)}%` : `₹${value > 1000 ? (value / 1000).toFixed(0) + 'K' : value}`}
                  dx={-10}
                />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={(value) => `₹${value}`} dx={10} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #EAECEF', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                  labelStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}
                />
                {graphType === "revenue" && (
                  <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#0E9F88" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#0E9F88', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                )}
                {graphType === "pipeline" && (
                  <Line yAxisId="left" type="monotone" dataKey="Pipeline" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                )}
                {graphType === "drop_rate" && (
                  <Line yAxisId="left" type="monotone" dataKey="Drop Rate (%)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#EF4444', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                )}
                <Line yAxisId="right" type="monotone" dataKey="Total Balance Spent" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#fff', stroke: '#9CA3AF', strokeWidth: 1.5 }} />
              </LineChart>
            </ResponsiveContainer>
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

        {/* Recent Orders (real from leads API) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#EAECEF] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#F1F3F5]">
            <div>
              <h4 className="text-[13px] font-semibold text-[#111827] tracking-tight">Recent Orders</h4>
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
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
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
