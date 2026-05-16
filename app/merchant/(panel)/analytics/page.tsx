"use client";

import { useState } from "react";
import Link from "next/link";
import { useMerchant } from "../../context/MerchantContext";

// Shared-axis path: all series use the SAME globalMax so proportions are accurate
function genPathShared(points: number[], W: number, H: number, globalMax: number) {
  const step = W / Math.max(points.length - 1, 1);
  return points.map((p, i) => {
    const x = i * step;
    const y = H - (p / (globalMax || 1)) * (H - 4); // 4px top padding
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

export default function AnalyticsPage() {
  const { products } = useMerchant();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  // Chart line visibility toggles
  const [vis, setVis] = useState({ impressions: true, clicks: true, ai: false, leads: true, converted: true });
  const toggleLine = (key: keyof typeof vis) => setVis(v => ({...v, [key]: !v[key]}));

  // Summary Metrics (mock calculations based on the context data)
  const totalImpressions = products.reduce((acc, p) => acc + p.impressions, 0);
  const totalClicks = products.reduce((acc, p) => acc + p.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";
  const totalRAGMentions = products.reduce((acc, p) => acc + p.aiMentions, 0);
  
  // Aggregate all RAG queries across all products
  const allQueries = products.flatMap(p => 
    p.ragQueries.map(q => ({ ...q, product: p.name, productId: p.id }))
  ).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 md:p-8 w-full space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-dark tracking-tight">Intelligence Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Cross-channel analytics, AI performance, and product-level insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1FAF9A]/20 shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="px-5 py-2 bg-[#1FAF9A] text-white text-sm font-semibold rounded-lg hover:bg-[#189986] transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === "overview" ? "text-[#1FAF9A]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Overview
          {activeTab === "overview" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1FAF9A] rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab("products")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === "products" ? "text-[#1FAF9A]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Product Breakdown
          {activeTab === "products" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1FAF9A] rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab("insights")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-1.5 ${activeTab === "insights" ? "text-[#1FAF9A]" : "text-gray-400 hover:text-gray-600"}`}
        >
          AI Insights <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-sm">BETA</span>
          {activeTab === "insights" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1FAF9A] rounded-t-full"></span>}
        </button>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* HERO MULTI-LINE CHART — shared Y-axis + checkbox filters */}
          {(() => {
            const chartData = dateRange === '7d' ? {
              impressions: [980, 1100, 950, 1250, 1300, 1500, 1350],
              clicks:      [46,   52,   42,  60,   64,   72,   66],
              ai:          [28,   35,   26,  42,   48,   53,   45],
              leads:       [8,    10,   7,   14,   16,   18,   15],
              converted:   [3,    5,    3,   7,    8,    9,    7],
            } : {
              impressions: [600,750,820,700,980,1050,900,1100,1200,1050,1300,1350,1150,1400,1500,1350,1450,1600,1500,1650,1700,1550,1800,1750,1900,2000,1850,2100,2050,2200],
              clicks:      [28,  36, 39, 33, 48,  51, 43,  54,  58,  51,  63,  66,  56,  68,  73,  66,  71,  78,  73,  81,  83,  76,  88,  86,  93,  98,  91, 103, 101, 108],
              ai:          [16,  22, 25, 19, 30,  33, 27,  36,  38,  33,  41,  44,  36,  45,  50,  44,  48,  54,  50,  56,  58,  52,  62,  60,  66,  70,  65,  74,  72,  78],
              leads:       [4,   7,  8,  6,  11,  12, 9,   13,  14,  12,  16,  17,  13,  18,  20,  17,  19,  22,  20,  24,  25,  21,  27,  26,  29,  31,  28,  33,  32,  36],
              converted:   [1,   3,  3,  2,  5,   6,  4,   6,   7,   5,   8,   8,   6,   9,   10,  8,   9,   11,  10,  12,  12,  10,  13,  13,  14,  15,  14,  16,  16,  18],
            };
            const W = 600; const H = 220;
            const days7  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            const xLabels = dateRange === '7d' ? days7 : ['1','5','9','13','17','21','25','30'];
            const allLines = [
              { key: 'impressions' as const, label: 'Impressions', color: '#374151', data: chartData.impressions },
              { key: 'clicks'      as const, label: 'Clicks',       color: '#1FAF9A', data: chartData.clicks },
              { key: 'ai'          as const, label: 'AI Interact.', color: '#0d9488', data: chartData.ai },
              { key: 'leads'       as const, label: 'Leads',        color: '#10b981', data: chartData.leads },
              { key: 'converted'   as const, label: 'Converted',    color: '#8b5cf6', data: chartData.converted },
            ];
            // Shared global max — only across VISIBLE series
            const visibleLines = allLines.filter(l => vis[l.key]);
            const globalMax = Math.max(...visibleLines.flatMap(l => l.data), 1) * 1.05;
            // Y-axis ticks
            const yTicks = [globalMax, globalMax*0.75, globalMax*0.5, globalMax*0.25, 0]
              .map(v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : Math.round(v).toString());
            return (
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_32px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Header + checkboxes */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-dark tracking-tight">Performance Overview</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Toggle metrics below · Shared scale so proportions are accurate.</p>
                    </div>
                  </div>
                  {/* Checkbox filter pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {allLines.map(l => (
                      <button
                        key={l.key}
                        onClick={() => toggleLine(l.key)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                          vis[l.key]
                            ? 'border-transparent text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                        style={vis[l.key] ? {backgroundColor: l.color} : {}}
                      >
                        <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                          vis[l.key] ? 'border-white/50' : 'border-gray-300'
                        }`}>
                          {vis[l.key] && <span className="w-1.5 h-1 bg-white rounded-sm"/>}
                        </span>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Chart canvas */}
                <div className="relative px-6 pt-4 pb-8" style={{height: '300px'}}>
                  <div className="absolute left-6 top-4 bottom-8 flex flex-col justify-between text-[10px] font-semibold text-gray-400">
                    {yTicks.map((v,i) => <span key={i}>{v}</span>)}
                  </div>
                  <div className="relative border-l border-b border-gray-100 ml-8" style={{height: '232px'}}>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0,1,2,3,4].map(i => <div key={i} className="w-full h-px bg-gray-50" />)}
                    </div>
                    {visibleLines.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">Select at least one metric above</div>
                    )}
                    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                      <defs>
                        {allLines.map(l => (
                          <linearGradient key={l.key} id={`ag_${l.key}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={l.color} stopOpacity="0.18" />
                            <stop offset="100%" stopColor={l.color} stopOpacity="0" />
                          </linearGradient>
                        ))}
                      </defs>
                      {/* Area fill for top-most visible line */}
                      {visibleLines[0] && (
                        <path
                          d={`${genPathShared(visibleLines[0].data, W, H, globalMax)} L ${W} ${H} L 0 ${H} Z`}
                          fill={`url(#ag_${visibleLines[0].key})`}
                        />
                      )}
                      {/* Lines */}
                      {visibleLines.map(l => (
                        <path key={l.key}
                          d={genPathShared(l.data, W, H, globalMax)}
                          fill="none" stroke={l.color}
                          strokeWidth={l.key === 'impressions' ? 3 : 2.5}
                          strokeLinecap="round" strokeLinejoin="round"
                        />
                      ))}
                      {/* Pulse dot on last point of first visible line */}
                      {visibleLines[0] && (() => {
                        const d = visibleLines[0].data;
                        const lastY = H - (d[d.length-1] / globalMax) * (H - 4);
                        return <circle cx={W} cy={lastY.toFixed(1)} r="5" fill="white" stroke={visibleLines[0].color} strokeWidth="2.5" className="animate-pulse" />;
                      })()}
                    </svg>
                  </div>
                  <div className="absolute left-14 right-6 bottom-2 flex justify-between text-[10px] font-semibold text-gray-400">
                    {xLabels.map((l,i) => <span key={i}>{l}</span>)}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* KPI Ribbon — 6 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(() => {
              const totalLeads = products.reduce((a,p) => a+p.leadsGenerated, 0);
              const totalConverted = products.reduce((a,p) => a+p.convertedLeads, 0);
              const convRate = totalLeads > 0 ? ((totalConverted/totalLeads)*100).toFixed(1) : "0.0";
              const totalSpend = products.reduce((a,p) => a+p.tokenSpend, 0);
              const tokenROI = totalSpend > 0 ? ((totalConverted * products.reduce((a,p)=>a+p.sellPrice,0)/products.length) / totalSpend).toFixed(1) : "0";
              return [
                { label: "Impressions", value: totalImpressions.toLocaleString(), trend: "+14.2%", up: true },
                { label: "Total Clicks", value: totalClicks.toLocaleString(), trend: "+8.1%", up: true },
                { label: "AI RAG Mentions", value: totalRAGMentions.toLocaleString(), trend: "+22.4%", up: true, highlight: true },
                { label: "Avg. CTR", value: `${avgCtr}%`, trend: "-0.4%", up: false },
                { label: "Total Leads", value: totalLeads.toString(), trend: "+11.3%", up: true },
                { label: "Conv. Rate", value: `${convRate}%`, trend: "+2.1%", up: true },
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border ${kpi.highlight ? 'border-[#1FAF9A] ring-1 ring-[#1FAF9A]/20' : 'border-gray-100'}`}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                    {kpi.label}
                    {kpi.highlight && <span className="bg-[#1FAF9A]/10 text-[#1FAF9A] px-1.5 py-0.5 rounded text-[9px]">AI</span>}
                  </p>
                  <p className="text-2xl font-bold text-neutral-dark tabular-nums tracking-tight">{kpi.value}</p>
                  <p className={`text-xs font-bold mt-1 ${kpi.up ? 'text-emerald-500' : 'text-amber-500'}`}>{kpi.trend}</p>
                </div>
              ));
            })()}
          </div>

          {/* Master Conversion Funnel — trapezoid style */}
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-neutral-dark">Aggregate Conversion Funnel</h2>
              <span className="text-xs text-gray-400 font-medium">Showing full customer journey across all products</span>
            </div>
            {(() => {
              const totalAI = products.reduce((acc, p) => acc + p.aiImageGenerations, 0);
              const totalLeads = products.reduce((acc, p) => acc + p.leadsGenerated, 0);
              const totalConverted = products.reduce((acc, p) => acc + p.convertedLeads, 0);
              const steps = [
                { label: "App Impressions", value: totalImpressions, color: "#374151", pct: 100 },
                { label: "Product Clicks", value: totalClicks, color: "#1FAF9A", pct: totalImpressions > 0 ? +((totalClicks/totalImpressions)*100).toFixed(1) : 0 },
                { label: "AI Gen Interactions", value: totalAI, color: "#0d9488", pct: totalClicks > 0 ? +((totalAI/totalClicks)*100).toFixed(1) : 0 },
                { label: "Leads Raised", value: totalLeads, color: "#10b981", pct: totalAI > 0 ? +((totalLeads/totalAI)*100).toFixed(1) : 0 },
                { label: "Converted", value: totalConverted, color: "#8b5cf6", pct: totalLeads > 0 ? +((totalConverted/totalLeads)*100).toFixed(1) : 0 },
              ];
              const maxVal = steps[0].value || 1;
              return (
                <div className="space-y-2">
                  {steps.map((s, i) => {
                    const prev = steps[i - 1];
                    const convRate = prev && prev.value > 0 ? ((s.value / prev.value) * 100).toFixed(1) : "100";
                    const width = Math.max(20, (s.value / maxVal) * 100);
                    return (
                      <div key={i}>
                        {i > 0 && (
                          <div className="flex items-center gap-4 h-9">
                            <div className="w-36 shrink-0" />
                            <div className="flex-1 flex items-center gap-3">
                              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${steps[i-1].color}30, transparent)` }} />
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap"
                                style={{ color: s.color, borderColor: s.color + '25', backgroundColor: s.color + '10' }}>
                                {convRate}% advance ›
                              </span>
                              <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${s.color}30, transparent)` }} />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="w-36 shrink-0 text-right">
                            <span className="text-xs font-semibold text-gray-500">{s.label}</span>
                          </div>
                          <div className="flex-1 relative h-10 flex items-center">
                            <div
                              className="h-10 rounded-lg flex items-center px-4 transition-all duration-500"
                              style={{ width: `${width}%`, backgroundColor: s.color }}
                            >
                              <span className="text-white font-bold text-sm tabular-nums">{s.value.toLocaleString()}</span>
                            </div>
                            <span className="ml-3 text-xs font-bold text-gray-400">{s.pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>


          {/* Channel Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
              <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-widest mb-4">SimulaFly AI Channel</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Reach", value: "8,240", sub: "unique users" },
                  { label: "Frequency", value: "1.1x", sub: "avg per user" },
                  { label: "CTR", value: `${avgCtr}%`, sub: "click-through" },
                  { label: "Cost/Lead", value: `₹${products.reduce((a,p)=>a+p.tokenSpend,0) > 0 ? (products.reduce((a,p)=>a+p.tokenSpend,0)/Math.max(1,products.reduce((a,p)=>a+p.leadsGenerated,0))).toFixed(0) : 0}`, sub: "token spend" },
                  { label: "Total Leads", value: products.reduce((a,p)=>a+p.leadsGenerated,0).toString(), sub: "from AI" },
                  { label: "Est. ROAS", value: `${products.reduce((a,p)=>a+p.tokenSpend,0)>0?((products.reduce((a,p)=>a+p.convertedLeads*p.sellPrice,0)/products.reduce((a,p)=>a+p.tokenSpend,0)).toFixed(1)):'0'}x`, sub: "return" },
                ].map((m,i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-neutral-dark tabular-nums">{m.value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
              <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-widest mb-1">7-Day Lead Trend</h2>
              <p className="text-[10px] text-gray-400 mb-4">New · Converted · Lost breakdown</p>
              {(() => {
                const data = [
                  { day: "Mon", newL: 3,  conv: 1, lost: 1 },
                  { day: "Tue", newL: 5,  conv: 2, lost: 1 },
                  { day: "Wed", newL: 4,  conv: 1, lost: 2 },
                  { day: "Thu", newL: 6,  conv: 3, lost: 1 },
                  { day: "Fri", newL: 5,  conv: 2, lost: 1 },
                  { day: "Sat", newL: 8,  conv: 4, lost: 2 },
                  { day: "Today", newL: products.reduce((a,p)=>a+p.leadsGenerated,0), conv: products.reduce((a,p)=>a+p.convertedLeads,0), lost: 2 },
                ];
                const maxH = Math.max(...data.map(d => d.newL + d.conv + d.lost), 1);
                return (
                  <div className="flex items-end gap-1.5 h-28 w-full">
                    {data.map((d, i) => {
                      const totalH = ((d.newL + d.conv + d.lost) / maxH) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col justify-end" style={{ height: `${Math.max(8, totalH)}%` }}>
                            <div className="w-full rounded-t-sm" style={{ height: `${(d.newL/(d.newL+d.conv+d.lost))*100}%`, backgroundColor: '#60a5fa' }}></div>
                            <div className="w-full" style={{ height: `${(d.conv/(d.newL+d.conv+d.lost))*100}%`, backgroundColor: '#1FAF9A' }}></div>
                            <div className="w-full" style={{ height: `${(d.lost/(d.newL+d.conv+d.lost))*100}%`, backgroundColor: '#fca5a5' }}></div>
                          </div>
                          <span className="text-[9px] text-gray-400 font-medium">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#60a5fa]"></span><span className="text-xs text-gray-500">New</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1FAF9A]"></span><span className="text-xs text-gray-500">Converted</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#fca5a5]"></span><span className="text-xs text-gray-500">Lost</span></div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content: PRODUCTS GRID */}
      {activeTab === "products" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:border-[#1FAF9A]/30 transition-colors">
                <div className="p-5 flex items-start justify-between border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${product.img} shrink-0 border border-gray-100 shadow-sm`} />
                    <div>
                      <h3 className="text-lg font-bold text-neutral-dark leading-tight mb-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">{product.id}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-xs font-medium text-gray-500">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {product.healthScore === 'good' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">✅ Good</span>}
                    {product.healthScore === 'review' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-700">⚠️ Review</span>}
                    {product.healthScore === 'mismatch' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold bg-orange-100 text-orange-700">🟠 Mismatch</span>}
                    {product.healthScore === 'paused' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold bg-red-100 text-red-700">🔴 Paused</span>}
                    {/* Mini sparkline */}
                    {(() => {
                      const data = product.impressionTrend;
                      const max = Math.max(...data, 1);
                      const min = Math.min(...data);
                      const W = 64; const H = 24;
                      const pts = data.map((v, i) => `${(i/(data.length-1))*W},${H - ((v-min)/(max-min||1))*H}`).join(' ');
                      return (
                        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                          <polyline points={pts} fill="none" stroke="#1FAF9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">AI Mentions</p>
                    <p className="text-lg font-bold text-purple-600">{product.aiMentions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CTR</p>
                    <p className="text-lg font-bold text-neutral-dark">{product.ctr.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Converted</p>
                    <p className="text-lg font-bold text-neutral-dark">{product.convertedLeads}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Est. ROAS</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {product.tokenSpend > 0 ? ((product.convertedLeads * product.sellPrice) / product.tokenSpend).toFixed(1) : '0'}x
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                   <div className="text-xs text-gray-500 font-medium truncate pr-4 max-w-[70%]">
                     <span className="font-bold text-neutral-dark text-[11px] uppercase tracking-wider mr-2">Trend</span> 
                     {product.healthReason}
                   </div>
                   <Link href={`/merchant/analytics/${product.id.replace('#', '')}`} className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-[#1FAF9A] hover:text-white hover:border-[#1FAF9A] transition-colors shadow-sm whitespace-nowrap">
                     Full Report →
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: AI INSIGHTS */}
      {activeTab === "insights" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">

          {/* AI Catalogue Health Score */}
          {(() => {
            const avgScore = Math.round(products.reduce((a,p) => a + p.aiRelevanceScore, 0) / (products.length || 1));
            const healthy = products.filter(p => p.healthScore === 'good').length;
            return (
              <div className="bg-gradient-to-r from-[#1FAF9A]/5 to-purple-50/30 rounded-[16px] border border-[#1FAF9A]/20 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1FAF9A" strokeWidth="10"
                      strokeDasharray={`${(avgScore/100)*251.2} 251.2`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-neutral-dark">{avgScore}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">/ 100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-neutral-dark">Catalogue AI Health Score</h2>
                  <p className="text-sm text-gray-500 mt-1">{healthy} of {products.length} products are performing well. {products.length - healthy} need attention.</p>
                  <div className="flex gap-3 mt-3">
                    {products.map(p => (
                      <div key={p.id} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{backgroundColor: p.aiRelevanceScore > 80 ? '#1FAF9A' : p.aiRelevanceScore > 60 ? '#f59e0b' : '#ef4444'}}>{p.aiRelevanceScore}</div>
                        <span className="text-[9px] text-gray-500 font-medium text-center leading-tight max-w-[48px] truncate">{p.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-white to-purple-50/30 p-5 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
              <div className="flex gap-3 items-start mb-3 relative z-10">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-dark">Demand Opportunity</h3>
                  <p className="text-xs font-bold text-purple-600 mt-0.5">Velvet Sofa (Blue)</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-4 relative z-10">
                Queries for "blue velvet" are up 3x globally this week. Your CTR is currently low (1.6%).
              </p>
              <button className="text-xs font-bold text-purple-700 bg-white border border-purple-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-purple-50 transition-colors w-full relative z-10">
                Auto-Optimize Description
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-white to-orange-50/30 p-5 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
              <div className="flex gap-3 items-start mb-3 relative z-10">
                <span className="text-xl">📉</span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-dark">Creative Fatigue</h3>
                  <p className="text-xs font-bold text-orange-600 mt-0.5">Oak Dining Table</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-4 relative z-10">
                Your primary product image has seen a 12% drop in conversion rate over the last 14 days.
              </p>
              <button className="text-xs font-bold text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-orange-50 transition-colors w-full relative z-10">
                Generate New AI Variants
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="flex gap-3 items-start mb-3 relative z-10">
                <span className="text-xl">💰</span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-dark">Follow-up Gap</h3>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">3 Leads Uncontacted</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-4 relative z-10">
                There are 3 high-value leads generated by the "Modern Floor Lamp" waiting in CRM for &gt;48h.
              </p>
              <Link href="/merchant/crm" className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors w-full relative z-10 block text-center">
                Open CRM
              </Link>
            </div>
          </div>

          {/* RAG Mentions Table */}
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-dark">Search Term Analysis (RAG)</h2>
                <p className="text-xs text-gray-500 mt-1">See exactly what users typed to trigger your products.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-bold h-10">
                    <th className="px-5">User Search Query</th>
                    <th className="px-5">Triggered Product</th>
                    <th className="px-5 text-right">Volume (Fires)</th>
                    <th className="px-5 text-right">Lead Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allQueries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500 text-sm">No queries found.</td>
                    </tr>
                  ) : allQueries.map((q, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors h-14 font-medium text-gray-700">
                      <td className="px-5 font-medium text-neutral-dark">"{q.query}"</td>
                      <td className="px-5">
                        <Link href={`/merchant/analytics/${q.productId.replace('#', '')}`} className="text-[#1FAF9A] hover:underline">
                          {q.product}
                        </Link>
                      </td>
                      <td className="px-5 text-right tabular-nums text-purple-600 font-bold">{q.count.toLocaleString()}</td>
                      <td className="px-5 text-right tabular-nums">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${q.conversionRate > 15 ? 'bg-emerald-50 text-emerald-600' : q.conversionRate > 5 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {q.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
