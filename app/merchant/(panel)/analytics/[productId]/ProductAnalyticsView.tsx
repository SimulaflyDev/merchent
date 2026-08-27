"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { ProductAnalyticsDetail } from "@/lib/types/analytics";
import { resolveImageUrl } from "@/lib/api/image-utils";

interface Props {
  detail: ProductAnalyticsDetail;
}

export default function ProductAnalyticsView({ detail }: Props) {
  // Parse fields or fallback to design mockups where backend doesn't have details
  const title = detail.title || "Oak Dining Table";
  const sku = detail.sku || "PRD109283";
  const status = detail.status || "Healthy";
  const isHealthy = status === "Healthy" || status === "published";

  const last7DaysNames = useMemo(() => {
    const names = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      names.push(daysOfWeek[d.getDay()]);
    }
    return names;
  }, []);

  const impTrendData = useMemo(() => {
    const imps = detail.daily_impressions || [0, 0, 0, 0, 0, 0, 0];
    return last7DaysNames.map((name, idx) => ({
      day: name,
      count: imps[idx] || 0,
    }));
  }, [detail.daily_impressions, last7DaysNames]);

  const ctrTrendData = useMemo(() => {
    const imps = detail.daily_impressions || [0, 0, 0, 0, 0, 0, 0];
    const clicks = detail.daily_clicks || [0, 0, 0, 0, 0, 0, 0];
    return last7DaysNames.map((name, idx) => {
      const imp = imps[idx] || 0;
      const click = clicks[idx] || 0;
      const rate = imp > 0 ? parseFloat(((click / imp) * 100).toFixed(1)) : 0.0;
      return {
        day: name,
        rate,
      };
    });
  }, [detail.daily_impressions, detail.daily_clicks, last7DaysNames]);

  // Aggregate Funnel calculations
  const imp = detail.impressions || 0;
  const click = detail.clicks || 0;
  const interact = (detail.ai_mentions || 0) + (detail.ai_image_generations || 0);
  const lead = detail.leads_count || 0;
  const converted = detail.converted_count || 0;

  const clickPct = imp > 0 ? Math.round((click / imp) * 100) : 0;
  const interactPct = click > 0 ? Math.round((interact / click) * 100) : 0;
  const leadPct = interact > 0 ? Math.round((lead / interact) * 100) : 0;
  const convertedPct = lead > 0 ? Math.round((converted / lead) * 100) : 0;

  const clickFunnelPct = imp > 0 ? Math.round((click / imp) * 100) : 0;
  const interactFunnelPct = imp > 0 ? Math.round((interact / imp) * 100) : 0;
  const leadFunnelPct = imp > 0 ? Math.round((lead / imp) * 100) : 0;
  const convertedFunnelPct = imp > 0 ? Math.round((converted / imp) * 100) : 0;

  // Revenue progress bars
  const realizedRevenue = detail.realized_revenue || 0;
  const potentialPipeline = detail.potential_pipeline || 0;
  const totalSpend = detail.spend || 0;

  const maxVal = Math.max(realizedRevenue, potentialPipeline, 1);
  const realizedPct = Math.round((realizedRevenue / maxVal) * 100);
  const potentialPct = Math.round((potentialPipeline / maxVal) * 100);

  // Profitability status
  let profitabilityStatus = "No Spend";
  let profitabilityColor = "text-gray-500 bg-gray-100 border-gray-250";
  if (totalSpend > 0) {
    const roas = realizedRevenue / totalSpend;
    if (roas >= 10) {
      profitabilityStatus = "Highly Profitable";
      profitabilityColor = "text-[#0E9F88] bg-[#E8F4EC] border-[#D1FAF0]";
    } else if (roas >= 1) {
      profitabilityStatus = "Profitable";
      profitabilityColor = "text-blue-700 bg-blue-50 border-blue-200";
    } else {
      profitabilityStatus = "Low ROI";
      profitabilityColor = "text-amber-700 bg-amber-50 border-amber-200";
    }
  }

  // Trend averages
  const impAverage = useMemo(() => {
    const imps = detail.daily_impressions || [];
    if (imps.length === 0) return 0;
    const sum = imps.reduce((acc, c) => acc + c, 0);
    return Math.round(sum / imps.length);
  }, [detail.daily_impressions]);

  const impPeak = useMemo(() => {
    const imps = detail.daily_impressions || [];
    if (imps.length === 0) return 0;
    return Math.max(...imps);
  }, [detail.daily_impressions]);

  const ctrAverage = useMemo(() => {
    const imps = detail.daily_impressions || [];
    const clicks = detail.daily_clicks || [];
    const totalImps = imps.reduce((acc, c) => acc + c, 0);
    const totalClicks = clicks.reduce((acc, c) => acc + c, 0);
    return totalImps > 0 ? (totalClicks / totalImps) * 100 : 0.0;
  }, [detail.daily_impressions, detail.daily_clicks]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1440px] space-y-6 bg-[#F3F4F6] p-4 text-[#111827] animate-in fade-in duration-200 sm:p-6 lg:p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex min-w-0 items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/merchant/analytics" className="hover:text-[#111827] transition-colors">Analytics</Link>
          <span>/</span>
          <Link href="/merchant/analytics" className="hover:text-[#111827] transition-colors">Products</Link>
          <span>/</span>
          <span className="truncate text-gray-500 font-semibold">{title}</span>
        </div>
      </div>

      {/* Product Title Block */}
      <div className="bg-white rounded-2xl border border-[#EAECEF] p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Product Thumbnail Block */}
          {detail.primary_image_url ? (
            <div className="relative w-12 h-12 shrink-0">
              <img
                src={resolveImageUrl(detail.primary_image_url)}
                alt={title}
                className="w-12 h-12 rounded-xl object-cover shadow-inner"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-700/60 shrink-0 shadow-inner" />
          )}
          <div>
            <h1 className="text-[20px] font-bold text-[#111827] tracking-tight leading-tight">{title}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400 font-semibold">
              <span>#{sku}</span>
              <span>&bull;</span>
              <span>Furniture</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? "bg-[#0E9F88]" : "bg-amber-400"}`} />
                <span className={isHealthy ? "text-[#0E9F88]" : "text-amber-500"}>{status === "published" ? "Healthy" : status}</span>
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/merchant/products"
          className="h-9 px-4 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 text-[12px] font-bold rounded-lg transition-colors flex items-center shadow-sm"
        >
          Edit Product
        </Link>
      </div>

      {/* Product Conversion Funnel */}
      <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-[14px] font-bold text-[#111827]">Product Conversion Funnel</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Step-by-step journey for this product</p>
        </div>
        <div className="space-y-4">
          <FunnelRow label="Total Impressions" val={imp.toLocaleString()} pct={100} advance={`${clickPct}% advance`} />
          <FunnelRow label="Total Clicks" val={click.toLocaleString()} pct={clickFunnelPct} advance={`${interactPct}% advance`} />
          <FunnelRow label="AI Visualization" val={interact.toLocaleString()} pct={interactFunnelPct} advance={`${leadPct}% advance`} />
          <FunnelRow label="Total Order Placed" val={lead.toLocaleString()} pct={leadFunnelPct} advance={`${convertedPct}% advance`} />
          <FunnelRow label="Total Converted" val={converted.toLocaleString()} pct={convertedFunnelPct} />
        </div>
      </div>

      {/* 5-Column KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKpi label="AI Score" value={`${Math.round(detail.ai_relevance_score ?? 0)}/100`} sub="relevance rating" />
        <MiniKpi label="CTR" value={`${((detail.ctr || 0) * 100).toFixed(1)}%`} sub="click-through rate" />
        <MiniKpi label="Total Cost For Converted Orders" value={`₹${(detail.cost_per_lead || 0).toFixed(0)}`} sub="wallet spend on converted" />
        <MiniKpi label="Total Sales (Converted)" value={`₹${(detail.avg_sale || 0).toLocaleString()}`} sub="converted contract value" />
      </div>

      {/* Two-Column Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Trigger Performance */}
        <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex flex-col items-start justify-between gap-2 border-b border-[#F1F3F5] pb-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-[13px] font-bold text-[#111827]">AI Trigger Performance</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Surfaced keywords in shopper chat queries</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E8F4EC] text-[#0E9F88] flex items-center justify-center text-[11px] font-bold border border-[#D1FAF0]" title="AI Relevance Score">
                {Math.round(detail.ai_relevance_score ?? 0)}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2">User Search Query</th>
                  <th className="py-2 text-right">Fires</th>
                  <th className="py-2 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6F8]">
                {(detail.top_rag_queries || []).map((row, idx) => (
                  <TableRow
                    key={idx}
                    query={row.query}
                    fires={row.count}
                    rate={`${(row.conversion_rate * 100).toFixed(1)}%`}
                  />
                ))}
                {(!detail.top_rag_queries || detail.top_rag_queries.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[12px] text-gray-400 font-medium">
                      No search keywords registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Intelligence */}
        <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[13px] font-bold text-[#111827] border-b border-[#F1F3F5] pb-4">Revenue Intelligence</h4>

            {/* Total Sales Converted */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                <span>TOTAL SALES (CONVERTED)</span>
                <span className="text-[#111827] font-bold">₹{realizedRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2.5">
                <div className="bg-[#0E9F88] h-full rounded-full" style={{ width: `${realizedPct}%` }} />
              </div>
            </div>

            {/* Potential Pipeline */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                <span>POTENTIAL PIPELINE (UNCONVERTED)</span>
                <span className="text-[#111827] font-bold">₹{potentialPipeline.toLocaleString()}</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2.5">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${potentialPct}%` }} />
              </div>
            </div>

            {/* Profitability Status */}
            <div className="border-t border-[#F1F3F5] pt-4 mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profitability Status</p>
              <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${profitabilityColor}`}>
                {profitabilityStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column 7-Day Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impressions Trend Chart */}
        <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex flex-col items-start justify-between gap-2 border-b border-[#F1F3F5] pb-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-[13px] font-bold text-[#111827]">7-Day Impressions Trend</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Average weekly volume and shopper exposure</p>
              </div>
              <div className="text-right text-[10px] text-gray-455 font-bold uppercase tracking-wider">
                7-day avg: <span className="text-[#111827] font-semibold">{impAverage}</span> &bull; Peak: <span className="text-[#111827] font-semibold">{impPeak}</span>
              </div>
            </div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impTrendData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                  <Bar dataKey="count" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CTR Trend Chart */}
        <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#F1F3F5] pb-4">
              <div>
                <h4 className="text-[13px] font-bold text-[#111827]">7-Day CTR Trend</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Click-through rate conversion performance</p>
              </div>
              <div className="text-right text-[10px] text-gray-455 font-bold uppercase tracking-wider">
                7-day avg: <span className="text-[#111827] font-semibold">{ctrAverage.toFixed(1)}%</span> &bull; Status: <span className="text-[#0E9F88] font-bold">{ctrAverage > 4.0 ? "Growing" : "Stable"}</span>
              </div>
            </div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctrTrendData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} tickFormatter={(val) => `${val}%`} />
                  <Bar dataKey="rate" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Actions Section */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Smart Actions for {title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title="Optimize Listing Description"
            text={`Your CTR is ${((detail.ctr || 0) * 100).toFixed(1)}%. Enhancing the prompt description with specific material and size keywords could boost AI relevance.`}
            btn="Review Listing Details"
            link="/merchant/products"
          />
          <ActionCard
            title="Follow up on Pipeline"
            text={`There is ₹${potentialPipeline.toLocaleString()} in unconverted pipeline value. Contact these leads via WhatsApp.`}
            btn="Open CRM"
            link="/merchant/orders"
            highlight
          />
        </div>
      </div>
    </div>
  );
}

// ── Funnel Bar component ──
function FunnelRow({ label, val, pct, advance }: { label: string; val: string; pct: number; advance?: string }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="col-span-9 flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-lg h-7 overflow-hidden relative border border-[#F1F3F5]">
            <div
              className="bg-[#0E9F88] h-full rounded-l-lg transition-all"
              style={{ width: `${pct}%` }}
            />
            <div className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold text-white z-10">{val}</div>
          </div>
          <span className="text-[11px] font-bold text-gray-400 w-10">{pct}%</span>
        </div>
      </div>
      {advance && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3" />
          <div className="col-span-9 pl-6 py-0.5 text-[9px] font-bold text-[#0E9F88] border-l-2 border-dashed border-gray-200">
            &bull; {advance}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini KPI card ──
function MiniKpi({ label, value, sub, highlight = false }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAECEF] p-5 shadow-sm hover:border-gray-300 transition-colors">
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
      <h3 className={`text-[20px] font-extrabold tabular-nums tracking-tight mt-1.5 ${highlight ? "text-[#0E9F88]" : "text-[#111827]"}`}>
        {value}
      </h3>
      <p className="text-[9px] text-gray-450 mt-1 font-normal leading-tight">{sub}</p>
    </div>
  );
}

// ── Table Row component ──
function TableRow({ query, fires, rate }: { query: string; fires: number; rate: string }) {
  return (
    <tr>
      <td className="py-2.5 text-[#111827] font-semibold text-[12px]">{`"${query}"`}</td>
      <td className="py-2.5 text-right font-mono text-gray-500 text-[12px]">{fires}</td>
      <td className="py-2.5 text-right font-bold text-[#0E9F88] text-[12px]">{rate}</td>
    </tr>
  );
}

// ── Action Card component ──
function ActionCard({
  title,
  text,
  btn,
  link,
  highlight = false,
}: {
  title: string;
  text: string;
  btn: string;
  link: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAECEF] p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between space-y-4">
      <div>
        <h4 className="text-[13px] font-bold text-[#111827] leading-tight">{title}</h4>
        <p className="text-[11px] text-gray-500 leading-relaxed mt-2">{text}</p>
      </div>
      <Link
        href={link}
        className={`w-full text-center py-2 text-[11px] font-bold rounded-lg transition-colors border block ${highlight
          ? "bg-[#0E9F88] hover:bg-[#0B7A69] text-white border-transparent"
          : "bg-white border-[#EAECEF] text-gray-700 hover:bg-gray-50"
          }`}
      >
        {btn}
      </Link>
    </div>
  );
}
