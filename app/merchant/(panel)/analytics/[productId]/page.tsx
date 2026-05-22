"use client";

import { useMerchant } from "../../../context/MerchantContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

export default function ProductAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.productId as string;
  const { products } = useMerchant();

  const product = useMemo(() => {
    if (!rawId) return null;
    return products.find(p => p.id === `#${rawId}`);
  }, [rawId, products]);

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-dark">Product Not Found</h2>
        <p className="text-gray-500">The requested product analytics could not be found.</p>
        <button onClick={() => router.push('/merchant/analytics')} className="text-[#1FAF9A] font-medium hover:underline">
          Return to Analytics Hub
        </button>
      </div>
    );
  }

  // Derived Metrics
  const estimatedROAS = product.tokenSpend > 0 ? ((product.convertedLeads * product.sellPrice) / product.tokenSpend).toFixed(1) : '0';
  const pipelineValue = (product.leadsGenerated - product.convertedLeads) * product.sellPrice;

  return (
    <div className="p-6 md:p-8 w-full space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/merchant/analytics" className="hover:text-[#1FAF9A] transition-colors">Analytics</Link>
        <span>/</span>
        <Link href="/merchant/analytics" className="hover:text-[#1FAF9A] transition-colors">Products</Link>
        <span>/</span>
        <span className="text-neutral-dark font-semibold">{product.name}</span>
      </div>

      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl ${product.img} shadow-sm border border-gray-100`}></div>
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-dark tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-mono text-gray-500">{product.id}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              {product.healthScore === 'good' && <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Healthy</span>}
              {product.healthScore === 'review' && <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Needs Review</span>}
              {product.healthScore === 'mismatch' && <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Mismatch</span>}
              {product.healthScore === 'paused' && <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Paused</span>}
            </div>
          </div>
        </div>
        <button onClick={() => router.push('/merchant/products')} className="px-5 py-2 bg-white border border-gray-200 text-neutral-dark text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
          Edit Product
        </button>
      </div>

      {/* Section 1: Conversion Funnel — premium bar style, no red */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-neutral-dark">Product Conversion Funnel</h2>
          <span className="text-xs text-gray-400">Step-by-step journey for this product</span>
        </div>
        {(() => {
          const steps = [
            { label: "App Impressions",     value: product.impressions,        color: "#374151", light: "#f9fafb" },
            { label: "Product Clicks",      value: product.clicks,             color: "#1FAF9A", light: "#f0fdf9" },
            { label: "AI Gen Interactions", value: product.aiImageGenerations ?? 0, color: "#0d9488", light: "#f0fdfa" },
            { label: "Leads Raised",        value: product.leadsGenerated,     color: "#10b981", light: "#f0fdf4" },
            { label: "Confirmed Converted", value: product.convertedLeads,     color: "#8b5cf6", light: "#f5f3ff" },
          ];
          const maxVal = steps[0].value || 1;
          return (
            <div className="space-y-0">
              {steps.map((s, i) => {
                const prev = steps[i - 1]?.value ?? s.value;
                const convRate = (prev ?? 0) > 0 ? ((s.value / (prev ?? s.value)) * 100).toFixed(1) : "100";
                const width = Math.max(10, (s.value / maxVal) * 100);
                return (
                  <div key={i}>
                    {/* Elegant connector — no red, just forward conversion */}
                    {i > 0 && (
                      <div className="flex items-center gap-4 h-9">
                        <div className="w-40 shrink-0" />
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${steps[i-1].color}30, transparent)` }} />
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap"
                            style={{ color: s.color, borderColor: s.color + '25', backgroundColor: s.light }}>
                            {convRate}% advance ›
                          </span>
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${s.color}30, transparent)` }} />
                        </div>
                      </div>
                    )}
                    {/* Bar row */}
                    <div className="flex items-center gap-4">
                      <div className="w-40 shrink-0 text-right">
                        <span className="text-xs font-semibold text-gray-500">{s.label}</span>
                      </div>
                      <div className="flex-1 h-11 flex items-center">
                        <div className="h-11 rounded-xl flex items-center px-4 transition-all duration-700"
                          style={{ width: `${width}%`, backgroundColor: s.color }}>
                          <span className="text-white font-bold text-sm tabular-nums">{s.value.toLocaleString()}</span>
                        </div>
                        <div className="ml-3 flex flex-col">
                          <span className="text-xs font-bold text-gray-400 tabular-nums">{((s.value / maxVal) * 100).toFixed(1)}%</span>
                          <span className="text-[9px] text-gray-300">of total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Section 2: Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "AI Score",      value: product.aiRelevanceScore, suffix: "/100" },
          { label: "CTR",           value: product.ctr.toFixed(1),   suffix: "%" },
          { label: "Cost Per Lead", value: product.leadsGenerated > 0 ? (product.tokenSpend / product.leadsGenerated).toFixed(0) : "0", prefix: "₹" },
          { label: "Avg. Sale",     value: product.sellPrice.toLocaleString(), prefix: "₹" },
          { label: "Token ROAS",    value: estimatedROAS, suffix: "x", color: "text-emerald-500", note: "vs token spend" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className={`text-2xl font-bold tracking-tight tabular-nums ${kpi.color || 'text-neutral-dark'}`}>
              {kpi.prefix}{kpi.value}{kpi.suffix}
            </p>
            {'note' in kpi && <p className="text-[10px] text-gray-400 mt-1">{kpi.note}</p>}
          </div>
        ))}
      </div>

      {/* Section 3 & 4: 2x2 Grid for Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section 3: AI Performance (RAG Queries) */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[320px]">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-widest">AI Trigger Performance</h2>
            <div className="w-10 h-10 rounded-full border-[3px] border-[#1FAF9A] flex items-center justify-center text-xs font-bold text-[#1FAF9A]">
              {product.aiRelevanceScore}
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-50">
                  <th className="p-3">User Search Query</th>
                  <th className="p-3 text-right">Fires</th>
                  <th className="p-3 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {product.ragQueries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-5 text-center text-gray-500 text-sm">No specific RAG query data yet.</td>
                  </tr>
                ) : product.ragQueries.map((q, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-3 font-medium text-gray-700 truncate max-w-[200px]" title={q.query}>"{q.query}"</td>
                    <td className="p-3 text-right font-bold text-purple-600 tabular-nums">{q.count}</td>
                    <td className="p-3 text-right tabular-nums">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${q.conversionRate > 15 ? 'text-emerald-700 bg-emerald-100' : q.conversionRate > 5 ? 'text-amber-700 bg-amber-100' : 'text-gray-600 bg-gray-100'}`}>
                        {q.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Revenue Intelligence */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[320px]">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-widest">Revenue Intelligence</h2>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center gap-6">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest flex justify-between">
                <span>Realized Revenue</span>
                <span className="text-neutral-dark">₹{(product.convertedLeads * product.sellPrice).toLocaleString()}</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-[#1FAF9A] h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest flex justify-between">
                <span>Potential Pipeline (Unconverted)</span>
                <span className="text-neutral-dark">₹{pipelineValue.toLocaleString()}</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Token Spend</p>
                  <p className="text-xl font-bold text-gray-600">₹{product.tokenSpend.toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Profitability Status</p>
                  <p className={`text-sm font-bold ${parseFloat(estimatedROAS) > 3 ? 'text-emerald-500' : parseFloat(estimatedROAS) > 1 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {parseFloat(estimatedROAS) > 3 ? 'Highly Profitable' : parseFloat(estimatedROAS) > 1 ? 'Breaking Even' : 'Early Stage'}
                  </p>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Section 5: 7-Day Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
          <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-widest mb-4">7-Day Impressions Trend</h2>
          <div className="flex items-end gap-1.5 h-24 w-full mb-2">
            {product.impressionTrend.map((v, i) => {
              const maxV = Math.max(...product.impressionTrend, 1);
              const pct = (v / maxV) * 100;
              const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 tabular-nums">{v}</span>
                  <div className="w-full rounded-t-md" style={{ height: `${Math.max(6, pct)}%`, backgroundColor: i === 6 ? '#1FAF9A' : '#d1fae5' }}></div>
                  <span className="text-[9px] text-gray-400">{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between text-xs text-gray-500">
            <span>7-day avg: <strong className="text-neutral-dark">{Math.round(product.impressionTrend.reduce((a,v)=>a+v,0)/7).toLocaleString()}</strong></span>
            <span>Peak: <strong className="text-neutral-dark">{Math.max(...product.impressionTrend).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* CTR Trend — all teal, no red bars */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
          <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-widest mb-4">7-Day CTR Trend</h2>
          <div className="flex items-end gap-1.5 h-24 w-full mb-2">
            {product.ctrTrend.map((v, i) => {
              const maxV = Math.max(...product.ctrTrend, 0.1);
              const pct = (v / maxV) * 100;
              const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 tabular-nums">{v}%</span>
                  <div className="w-full rounded-t-md" style={{ height: `${Math.max(6, pct)}%`, backgroundColor: i === 6 ? '#1FAF9A' : '#a7f3d0' }}></div>
                  <span className="text-[9px] text-gray-400">{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between text-xs text-gray-500">
            <span>7-day avg: <strong className="text-neutral-dark">{(product.ctrTrend.reduce((a,v)=>a+v,0)/7).toFixed(2)}%</strong></span>
            {product.ctrTrend[6] < product.ctrTrend[0]
              ? <span className="font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Needs Attention</span>
              : <span className="font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Growing</span>
            }
          </div>
        </div>
      </div>

      {/* Section 6: Smart Actions */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
        <h2 className="text-base font-bold text-neutral-dark mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Smart Actions for {product.name}
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            <div>
              <h4 className="text-sm font-bold text-neutral-dark mb-1">Optimize Listing Description</h4>
              <p className="text-xs text-gray-500 font-medium">Your CTR is {product.ctr.toFixed(1)}%. Enhancing the prompt description with specific material and size keywords could boost AI relevance.</p>
            </div>
            <button className="shrink-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 shadow-sm whitespace-nowrap">
              Review Listing Details
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            <div>
              <h4 className="text-sm font-bold text-neutral-dark mb-1">Follow up on Pipeline</h4>
              <p className="text-xs text-gray-500 font-medium">There is ₹{pipelineValue.toLocaleString()} in unconverted pipeline value. Contact these leads via WhatsApp.</p>
            </div>
            <Link href="/merchant/crm" className="shrink-0 px-4 py-2 bg-[#1FAF9A] text-white text-xs font-bold rounded-lg hover:bg-[#189986] shadow-sm whitespace-nowrap">
              Open CRM
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
