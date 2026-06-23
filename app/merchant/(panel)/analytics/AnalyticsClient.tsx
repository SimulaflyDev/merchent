"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import type {
  AnalyticsSummary,
  ProductPerformanceList,
  DiagnosticsResponse,
  DiagnosticIssueType,
  DailyMetric,
} from "@/lib/types/analytics";
import { resolveImageUrl } from "@/lib/api/image-utils";

interface Props {
  summary: AnalyticsSummary;
  products: ProductPerformanceList;
  diagnostics: DiagnosticsResponse;
  days: number;
}

const ISSUE_LABELS: Record<DiagnosticIssueType, string> = {
  zero_click: "Zero clicks",
  low_ai_relevance: "Low AI relevance",
  missing_metadata: "Missing metadata",
};

export default function AnalyticsClient({ summary, products, diagnostics, days }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "insights">("overview");

  // Overview Tab Line Toggles
  const [showImpressions, setShowImpressions] = useState(true);
  const [showClicks, setShowClicks] = useState(true);
  const [showInteractions, setShowInteractions] = useState(false);
  const [showLeads, setShowLeads] = useState(true);
  const [showConverted, setShowConverted] = useState(true);

  const setDays = (next: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("days", String(next));
    router.push(`/merchant/analytics?${params.toString()}`);
  };

  const chartData = useMemo(() => {
    return (summary.daily_metrics || []).map((m) => {
      const d = new Date(m.date);
      const name = isNaN(d.getTime())
        ? m.date
        : d.toLocaleDateString("en-IN", { day: "numeric" });

      return {
        ...m,
        name,
        Impressions: m.impressions || 0,
        Clicks: m.clicks || 0,
        Interactions: m.interactions || 0,
        Leads: m.leads || 0,
        Converted: m.converted || 0,
      };
    });
  }, [summary.daily_metrics]);

  // Lead trend bar chart (7 days)
  const barChartData = useMemo(() => {
    const last7 = (summary.daily_metrics || []).slice(-7);
    return last7.map((m) => {
      const d = new Date(m.date);
      const name = isNaN(d.getTime())
        ? m.date
        : d.toLocaleDateString("en-IN", { weekday: "short" });
      return {
        name,
        New: m.leads || 0,
        Converted: m.converted || 0,
        Lost: m.lost || 0,
      };
    });
  }, [summary.daily_metrics]);

  // Dynamic trends
  const getTrend = (key: keyof DailyMetric) => {
    const metrics = summary.daily_metrics || [];
    if (metrics.length < 2) return { text: "0.0%", dir: "up" as const };
    const midIdx = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midIdx);
    const secondHalf = metrics.slice(midIdx);

    const sum1 = firstHalf.reduce((acc, m) => acc + (Number(m[key] as any) || 0), 0);
    const sum2 = secondHalf.reduce((acc, m) => acc + (Number(m[key] as any) || 0), 0);

    if (sum1 === 0) {
      return sum2 > 0 ? { text: "+100%", dir: "up" as const } : { text: "0.0%", dir: "up" as const };
    }
    const diff = ((sum2 - sum1) / sum1) * 100;
    const text = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    const dir = diff >= 0 ? ("up" as const) : ("down" as const);
    return { text, dir };
  };

  const impTrend = useMemo(() => getTrend("impressions"), [summary.daily_metrics]);
  const clickTrend = useMemo(() => getTrend("clicks"), [summary.daily_metrics]);
  const mentionsTrend = useMemo(() => getTrend("interactions"), [summary.daily_metrics]);
  const leadsTrend = useMemo(() => getTrend("leads"), [summary.daily_metrics]);
  const convTrend = useMemo(() => getTrend("converted"), [summary.daily_metrics]);

  const ctrTrend = useMemo(() => {
    const metrics = summary.daily_metrics || [];
    if (metrics.length < 2) return { text: "0.0%", dir: "up" as const };
    const midIdx = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midIdx);
    const secondHalf = metrics.slice(midIdx);

    const imps1 = firstHalf.reduce((acc, m) => acc + (m.impressions || 0), 0);
    const clicks1 = firstHalf.reduce((acc, m) => acc + (m.clicks || 0), 0);
    const imps2 = secondHalf.reduce((acc, m) => acc + (m.impressions || 0), 0);
    const clicks2 = secondHalf.reduce((acc, m) => acc + (m.clicks || 0), 0);

    const ctr1 = imps1 > 0 ? clicks1 / imps1 : 0;
    const ctr2 = imps2 > 0 ? clicks2 / imps2 : 0;

    if (ctr1 === 0) {
      return ctr2 > 0 ? { text: "+100%", dir: "up" as const } : { text: "0.0%", dir: "up" as const };
    }
    const diff = ((ctr2 - ctr1) / ctr1) * 100;
    return {
      text: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
      dir: diff >= 0 ? ("up" as const) : ("down" as const)
    };
  }, [summary.daily_metrics]);

  // Aggregate Funnel calculations
  const imp = summary.impressions || 0;
  const click = summary.clicks || 0;
  const interact = (summary.ai_mentions || 0) + (summary.ai_image_generations || 0);
  const lead = summary.total_leads || 0;
  const converted = summary.converted_leads || 0;

  const clickPct = imp > 0 ? Math.round((click / imp) * 100) : 0;
  const interactPct = click > 0 ? Math.round((interact / click) * 100) : 0;
  const leadPct = interact > 0 ? Math.round((lead / interact) * 100) : 0;
  const convertedPct = lead > 0 ? Math.round((converted / lead) * 100) : 0;

  const clickFunnelPct = imp > 0 ? Math.round((click / imp) * 100) : 0;
  const interactFunnelPct = imp > 0 ? Math.round((interact / imp) * 100) : 0;
  const leadFunnelPct = imp > 0 ? Math.round((lead / imp) * 100) : 0;
  const convertedFunnelPct = imp > 0 ? Math.round((converted / imp) * 100) : 0;

  const overallConvRate = useMemo(() => {
    return summary.total_leads > 0 ? (converted / summary.total_leads) * 100 : 0.0;
  }, [summary.total_leads, converted]);

  // Product Health Pills
  const productHealths = useMemo(() => {
    return (products.items || []).map((p) => {
      let score = 95;
      if (p.status === "paused_insufficient_funds" || p.status === "archived") {
        score = 40;
      } else if (p.status === "draft") {
        score = 60;
      } else {
        const ctrVal = p.ctr || 0;
        if (ctrVal < 0.02) {
          score -= 15;
        }
        if (p.health_score === "review" || p.health_score === "poor") {
          score -= 20;
        }
      }
      return {
        id: p.product_id,
        name: p.title.split(" ")[0] || p.title,
        score,
        status: p.status,
        health: p.health_score,
      };
    });
  }, [products.items]);

  const avgHealthScore = useMemo(() => {
    if (productHealths.length === 0) return 100;
    const sum = productHealths.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / productHealths.length);
  }, [productHealths]);

  const performingWellCount = useMemo(() => {
    return productHealths.filter((p) => p.score >= 75).length;
  }, [productHealths]);

  // Opportunity cards
  const opportunityCards = useMemo(() => {
    const cards = [];

    const aiAlert = diagnostics.alerts.find(a => a.issue_type === "low_ai_relevance" || a.issue_type === "missing_metadata");
    if (aiAlert) {
      cards.push({
        title: "AI Relevance Boost",
        subtitle: aiAlert.title,
        text: aiAlert.detail,
        btn: "Auto-Optimize Description",
        link: `/merchant/products`
      });
    } else {
      cards.push({
        title: "AI Relevance Boost",
        subtitle: products.items[0]?.title || "All Products Optimized",
        text: "Your product listings are fully descriptive. AI relevance score is healthy across the board.",
        btn: "Review Metadata",
        link: "/merchant/products"
      });
    }

    const zeroClickAlert = diagnostics.alerts.find(a => a.issue_type === "zero_click");
    if (zeroClickAlert) {
      cards.push({
        title: "CTR Improvement",
        subtitle: zeroClickAlert.title,
        text: zeroClickAlert.detail,
        btn: "Optimize Product Listing",
        link: `/merchant/products`
      });
    } else {
      const lowestCtrProduct = [...(products.items || [])].sort((a, b) => a.ctr - b.ctr)[0];
      if (lowestCtrProduct && lowestCtrProduct.ctr < 0.03) {
        cards.push({
          title: "CTR Improvement",
          subtitle: lowestCtrProduct.title,
          text: `CTR is currently low (${(lowestCtrProduct.ctr * 100).toFixed(1)}%). Consider adding more high-quality variants or adjusting pricing.`,
          btn: "Review Product details",
          link: `/merchant/products`
        });
      } else {
        cards.push({
          title: "Demand Opportunity",
          subtitle: products.items[0]?.title || "No Products",
          text: "Shopper interest is high. Check individual reports to adjust inventory limits.",
          btn: "Explore Products",
          link: "/merchant/products"
        });
      }
    }

    const pendingCount = summary.pending_leads_count || 0;
    cards.push({
      title: "Follow-up Gap",
      subtitle: `${pendingCount} Lead${pendingCount !== 1 ? "s" : ""} Uncontacted`,
      text: pendingCount > 0
        ? `You have ${pendingCount} high-intent shopper lead${pendingCount !== 1 ? "s" : ""} waiting for response in your orders list.`
        : "All leads have been contacted! Great job keeping up with your shoppers.",
      btn: "Open CRM",
      link: "/merchant/orders"
    });

    return cards;
  }, [diagnostics.alerts, products.items, summary.pending_leads_count]);

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto w-full bg-[#F3F4F6] min-h-screen text-[#111827]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#111827] tracking-tight">Intelligence Hub</h1>
          <p className="text-[12px] text-gray-500 font-medium mt-1">Cross-channel analytics, shopper performance, and product-level insights.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-white border border-[#E5E7EB] rounded-lg text-[12px] font-semibold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0E9F88] appearance-none pr-8 cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
          {/* Export Report Button */}
          <button className="flex items-center gap-2 h-9 px-4 bg-[#111827] text-white text-[12px] font-semibold rounded-lg hover:bg-black transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {[
          { key: "overview", label: "Overview" },
          { key: "breakdown", label: "Product Breakdown" },
          { key: "insights", label: "Shopper Insights", badge: "BETA" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all relative flex items-center gap-1.5 ${activeTab === t.key
                ? "bg-[#111827] text-white"
                : "text-gray-500 hover:text-[#111827] hover:bg-gray-100"
              }`}
          >
            {t.label}
            {t.badge && (
              <span className={`text-[8px] font-bold px-1 py-0.25 rounded-md ${activeTab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Performance Overview Chart */}
          <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-[14px] font-bold text-[#111827]">Performance Overview</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Toggle metrics below - Shared scale so proportions are accurate.</p>
              </div>
              {/* Checkbox Pills */}
              <div className="flex flex-wrap gap-2">
                <TogglePill label="Impressions" checked={showImpressions} onChange={setShowImpressions} color="bg-gray-600" />
                <TogglePill label="Clicks" checked={showClicks} onChange={setShowClicks} color="bg-[#0E9F88]" />
                <TogglePill label="AI Mentions" checked={showInteractions} onChange={setShowInteractions} color="bg-[#6366F1]" />
                <TogglePill label="Orders" checked={showLeads} onChange={setShowLeads} color="bg-[#3B82F6]" />
                <TogglePill label="Converted" checked={showConverted} onChange={setShowConverted} color="bg-[#8B5CF6]" />
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                  <Tooltip labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#111827' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #EAECEF' }} />
                  {showImpressions && (
                    <Line type="monotone" dataKey="Impressions" stroke="#4B5563" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  )}
                  {showClicks && (
                    <Line type="monotone" dataKey="Clicks" stroke="#0E9F88" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  )}
                  {showInteractions && (
                    <Line type="monotone" dataKey="Interactions" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  )}
                  {showLeads && (
                    <Line type="monotone" dataKey="Leads" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  )}
                  {showConverted && (
                    <Line type="monotone" dataKey="Converted" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <MiniKpi label="Impressions" value={imp.toLocaleString()} trend={impTrend.text} trendDir={impTrend.dir} />
            <MiniKpi label="Total Clicks" value={click.toLocaleString()} trend={clickTrend.text} trendDir={clickTrend.dir} />
            <MiniKpi label="AI Mentions" value={summary.ai_mentions.toLocaleString()} trend={mentionsTrend.text} trendDir={mentionsTrend.dir} showAi />
            <MiniKpi label="Avg. CTR" value={`${(summary.ctr * 100).toFixed(1)}%`} trend={ctrTrend.text} trendDir={ctrTrend.dir} />
            <MiniKpi label="Total Orders" value={lead.toLocaleString()} trend={leadsTrend.text} trendDir={leadsTrend.dir} />
            <MiniKpi label="Conv. Rate" value={`${overallConvRate.toFixed(1)}%`} trend={convTrend.text} trendDir={convTrend.dir} />
          </div>

          {/* Aggregate Conversion Funnel */}
          <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[14px] font-bold text-[#111827]">Aggregate Conversion Funnel</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Showing full customer journey across all products</p>
              </div>
            </div>
            <div className="space-y-4">
              <FunnelRow label="App Impressions" val={imp.toLocaleString()} pct={100} advance={`${clickPct}% advance`} />
              <FunnelRow label="Product Clicks" val={click.toLocaleString()} pct={clickFunnelPct} advance={`${interactPct}% advance`} />
              <FunnelRow label="AI Mentions" val={interact.toLocaleString()} pct={interactFunnelPct} advance={`${leadPct}% advance`} />
              <FunnelRow label="Orders Raised" val={lead.toLocaleString()} pct={leadFunnelPct} advance={`${convertedPct}% advance`} />
              <FunnelRow label="Converted" val={converted.toLocaleString()} pct={convertedFunnelPct} />
            </div>
          </div>

          {/* Bottom widgets row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SimulaFly Commerce Channel */}
            <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-[#111827] mb-4">SimulaFly Commerce Channel</h4>
                <div className="grid grid-cols-3 gap-4">
                  <ChannelBox label="Reach" value={(summary.reach_count || 0).toLocaleString()} sub="unique users" />
                  <ChannelBox label="Frequency" value={`${(summary.reach_count > 0 ? (imp / summary.reach_count) : 1.0).toFixed(1)}x`} sub="avg per user" />
                  <ChannelBox label="CTR" value={`${(summary.ctr * 100).toFixed(1)}%`} sub="click-through" />
                  <ChannelBox label="Cost/Order" value={`₹${lead > 0 ? Math.round(summary.total_spend / lead) : 0}`} sub="totsl spend" />
                  <ChannelBox label="Total Orders" value={lead.toLocaleString()} sub="from AI" />
                  <ChannelBox label="Est. ROAS" value={`${summary.total_spend > 0 ? ((summary.daily_metrics.reduce((acc, m) => acc + (m.revenue || 0), 0)) / summary.total_spend).toFixed(1) : "0.0"}x`} sub="return" />
                </div>
              </div>
            </div>

            {/* 7-Day Order Trend */}
            <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-[#111827]">7-Day Order Trend</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">New - Converted - Lost breakdown</p>
              </div>
              <div className="h-[140px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                    <Bar name="New" dataKey="New" fill="#4B5563" stackId="a" />
                    <Bar name="Converted" dataKey="Converted" fill="#0E9F88" stackId="a" />
                    <Bar name="Lost" dataKey="Lost" fill="#D1D5DB" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT BREAKDOWN TAB */}
      {activeTab === "breakdown" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {(products.items || []).map((p, idx) => {
            const bgColors = [
              "bg-amber-700/60",
              "bg-teal-700/60",
              "bg-yellow-600/70",
              "bg-orange-600/60",
              "bg-blue-600/60",
              "bg-violet-600/60"
            ];
            const bgColor = bgColors[idx % bgColors.length];
            const statusLabel = p.status === "published"
              ? "Healthy"
              : p.status === "paused_insufficient_funds"
                ? "Paused"
                : p.status === "draft"
                  ? "Review"
                  : "Review";

            return (
              <ProductCard
                key={p.product_id}
                title={p.title}
                sku={p.sku}
                category={p.category || "General"}
                status={statusLabel as any}
                rawStatus={p.status}
                activity={p.orders_count || 0}
                ctr={p.ctr * 100}
                converted={p.converted || 0}
                estRos={p.est_ros || 0}
                trend={p.trend || "Trend: Stable performance and regular shopper exposure."}
                bgColor={bgColor}
                productId={p.product_id}
                primaryImageUrl={p.primary_image_url}
                dailyImpressions={p.daily_impressions}
              />
            );
          })}
          {(!products.items || products.items.length === 0) && (
            <div className="col-span-2 text-center py-12 text-gray-400 font-medium text-[12px] bg-white border border-[#EAECEF] rounded-2xl">
              No products found in this catalogue.
            </div>
          )}
        </div>
      )}

      {/* SHOPPER INSIGHTS TAB */}
      {activeTab === "insights" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Health Score Circular Widget */}
          <div className="bg-white rounded-2xl border border-[#EAECEF] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#0E9F88]" strokeWidth="3" strokeDasharray={`${avgHealthScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-[#111827]">{avgHealthScore}</span>
                <span className="text-[10px] text-gray-400 block font-bold">/100</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-[15px] font-bold text-[#111827]">Catalogue Shopper Health Score</h3>
              <p className="text-[12px] text-gray-500 mt-1">
                {performingWellCount} of {productHealths.length} product{productHealths.length !== 1 ? "s" : ""} are performing well. {productHealths.length - performingWellCount} need attention.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {productHealths.map((p) => {
                  let color = "bg-[#E8F4EC] text-[#0E9F88] border-[#D1FAF0]";
                  if (p.score < 60) {
                    color = "bg-red-50 text-red-600 border-red-200";
                  } else if (p.score < 80) {
                    color = "bg-amber-50 text-amber-700 border-amber-200";
                  }
                  return (
                    <HealthBadge key={p.id} label={p.name} score={p.score} color={color} />
                  );
                })}
                {productHealths.length === 0 && (
                  <span className="text-[11px] text-gray-400 font-medium">No products in catalogue.</span>
                )}
              </div>
            </div>
          </div>

          {/* Three Opportunity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunityCards.map((card, idx) => (
              <OpportunityCard
                key={idx}
                title={card.title}
                subtitle={card.subtitle}
                text={card.text}
                btn={card.btn}
                link={card.link}
              />
            ))}
          </div>

          {/* Search Term Analysis (RAG) */}
          <div className="bg-white rounded-2xl border border-[#EAECEF] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[#F1F3F5]">
              <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">Search Term Analysis (RAG)</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">See exactly what users typed to trigger your products.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFBFC] text-left text-gray-400 border-b border-[#F1F3F5] text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-3.5">User Search Query</th>
                    <th className="px-6 py-3.5">Triggered Product</th>
                    <th className="px-6 py-3.5 text-right">Volume (Fires)</th>
                    <th className="px-6 py-3.5 text-right">Lead Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6F8]">
                  {(summary.top_queries || []).map((row, idx) => (
                    <RagRow
                      key={idx}
                      query={row.query}
                      product={row.product_title}
                      volume={row.count}
                      rate={`${(row.conversion_rate * 100).toFixed(1)}%`}
                    />
                  ))}
                  {(!summary.top_queries || summary.top_queries.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[12px] text-gray-400 font-medium">
                        No search query history in this time window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Toggle Pill component ──
function TogglePill({ label, checked, onChange, color }: { label: string; checked: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${checked
          ? `${color} text-white border-transparent`
          : "bg-white text-gray-500 border-gray-250 hover:bg-gray-50"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${checked ? "bg-white" : color}`} />
      {label}
    </button>
  );
}

// ── Mini KPI card ──
function MiniKpi({ label, value, trend, trendDir, showAi = false }: { label: string; value: string; trend: string; trendDir: "up" | "down"; showAi?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-[#EAECEF] p-4 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start gap-1">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{label}</span>
        {showAi && (
          <span className="text-violet-500" title="AI Insight Powered">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-1">
        <h4 className="text-[18px] font-bold text-[#111827] tabular-nums tracking-tight">{value}</h4>
        <span className={`text-[10px] font-bold ${trendDir === "up" ? "text-[#0E9F88]" : "text-red-500"}`}>{trend}</span>
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
              className="bg-[#1F2937] h-full rounded-l-lg transition-all"
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

// ── Channel Box ──
function ChannelBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 text-center">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <h5 className="text-[16px] font-bold text-[#111827] mt-1">{value}</h5>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// Helper to generate dynamic sparkline SVG path
function generateSparklinePath(data?: number[], width = 100, height = 30): string {
  if (!data || data.length === 0) {
    return "M 0 15 L 100 15";
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - 3 - ((val - min) / range) * (height - 6);
    return { x, y };
  });

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    path += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return path;
}

// ── Product Card (Breakdown Tab) ──
interface ProductCardProps {
  title: string;
  sku: string;
  category: string;
  status: "Healthy" | "Review" | "Paused";
  rawStatus: string;
  activity: number;
  ctr: number;
  converted: number;
  estRos: number;
  trend: string;
  bgColor: string;
  productId?: string;
  primaryImageUrl?: string | null;
  dailyImpressions?: number[];
}

function ProductCard({
  title,
  sku,
  category,
  status,
  rawStatus,
  activity,
  ctr,
  converted,
  estRos,
  trend,
  bgColor,
  productId,
  primaryImageUrl,
  dailyImpressions,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAECEF] p-5 shadow-sm space-y-4 hover:border-gray-300 transition-colors flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            {primaryImageUrl ? (
              <div className="relative w-10 h-10 shrink-0">
                <img
                  src={resolveImageUrl(primaryImageUrl)}
                  alt={title}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-xl shrink-0 ${bgColor}`} />
            )}
            <div>
              <h4 className="text-[13px] font-bold text-[#111827] leading-tight">{title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">#{sku} &bull; {category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Status identifier badge */}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
              rawStatus === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : rawStatus === "archived" ? "bg-gray-100 text-gray-500 border-gray-300"
              : rawStatus === "paused_insufficient_funds" ? "bg-red-50 text-red-600 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {rawStatus === "published" ? "Published"
                : rawStatus === "archived" ? "Archived"
                : rawStatus === "paused_insufficient_funds" ? "Paused"
                : "Draft"}
            </span>
            {/* Health Status Dot */}
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${status === "Healthy" ? "bg-[#0E9F88]" : status === "Review" ? "bg-amber-400" : "bg-red-400"}`} />
              <span className={`text-[10px] font-bold ${status === "Healthy" ? "text-[#0E9F88]" : status === "Review" ? "text-amber-500" : "text-red-500"}`}>{status}</span>
            </span>
            {/* Tiny Sparkline */}
            <div className="w-14 h-5 opacity-80">
              <svg
                className={`w-full h-full ${status === "Healthy" ? "text-[#0E9F88]" : status === "Review" ? "text-amber-500" : "text-red-500"
                  }`}
                viewBox="0 0 100 30"
                fill="none"
              >
                <path
                  d={generateSparklinePath(dailyImpressions)}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 4 KPIs grid */}
        <div className="grid grid-cols-4 gap-2 border-t border-[#F1F3F5] mt-4 pt-4 text-center">
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Orders Placed</p>
            <p className="text-[14px] font-bold text-[#111827] mt-1 tabular-nums">{activity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">CTR</p>
            <p className="text-[14px] font-bold text-[#111827] mt-1">{ctr.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Converted</p>
            <p className="text-[14px] font-bold text-[#111827] mt-1 tabular-nums">{converted}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Est. ROS</p>
            <p className="text-[14px] font-bold text-[#111827] mt-1">{estRos.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Footer Trend & Link */}
      <div className="flex justify-between items-end border-t border-[#F1F3F5] pt-3 mt-1">
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-[70%]">{trend}</p>
        <Link
          href={`/merchant/analytics/${productId ?? "temp-id"}`}
          className="text-[11px] font-bold text-gray-500 hover:text-[#0E9F88] transition-colors shrink-0"
        >
          Full Report &rarr;
        </Link>
      </div>
    </div>
  );
}

// ── Health Badge (Shopper Insights tab) ──
function HealthBadge({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${color}`}>
      <span className="font-mono">{score}</span>
      <span className="font-normal opacity-80">{label}</span>
    </span>
  );
}

// ── Opportunity Card (Shopper Insights tab) ──
function OpportunityCard({
  title,
  subtitle,
  text,
  btn,
  link,
}: {
  title: string;
  subtitle: string;
  text: string;
  btn: string;
  link?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAECEF] p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between space-y-4">
      <div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        <h4 className="text-[13px] font-bold text-[#111827] mt-1.5 leading-tight">{subtitle}</h4>
        <p className="text-[11px] text-gray-500 leading-relaxed mt-2">{text}</p>
      </div>
      {link ? (
        <Link
          href={link}
          className="w-full text-center py-2 bg-white border border-[#EAECEF] text-gray-700 hover:bg-gray-50 text-[11px] font-bold rounded-lg transition-colors block"
        >
          {btn}
        </Link>
      ) : (
        <button className="w-full py-2 bg-white border border-[#EAECEF] text-gray-700 hover:bg-gray-50 text-[11px] font-bold rounded-lg transition-colors">
          {btn}
        </button>
      )}
    </div>
  );
}

// ── RAG Row ──
function RagRow({ query, product, volume, rate }: { query: string; product: string; volume: number; rate: string }) {
  return (
    <tr>
      <td className="px-6 py-3 text-[#111827] font-semibold text-[12px]">{`"${query}"`}</td>
      <td className="px-6 py-3 text-gray-500 text-[12px] font-medium">{product}</td>
      <td className="px-6 py-3 text-right tabular-nums text-[12px] text-gray-500 font-mono">{volume}</td>
      <td className="px-6 py-3 text-right text-[12px] text-[#0E9F88] font-bold">{rate}</td>
    </tr>
  );
}
