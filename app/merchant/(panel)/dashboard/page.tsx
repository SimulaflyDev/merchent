"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMerchant } from "../../context/MerchantContext";

function generateSparkline(points: number[], width: number, height: number) {
  const max = Math.max(...points) * 1.1;
  const min = Math.min(...points) * 0.9;
  const range = max - min || 1;
  const step = width / (points.length - 1);
  return points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

export default function DashboardPage() {
  const { leads, products } = useMerchant();
  const [hideBanner, setHideBanner] = useState(false);
  const [period, setPeriod] = useState("30D");

  const mockRevenueData = useMemo(() => {
    if (period === '7D') return [3800, 3600, 4000, 4200, 4800, 4500, 5000];
    if (period === '1Y') return [10000, 12000, 15000, 11000, 22000, 28000, 25000, 31000, 29000, 38000, 36000, 42000];
    return [1200, 1500, 1100, 2200, 2800, 2500, 3100, 2900, 3800, 3600, 4200, 4800];
  }, [period]);

  const mockSpendData = useMemo(() => {
    if (period === '7D') return [140, 135, 150, 160, 180, 170, 190];
    if (period === '1Y') return [400, 500, 600, 450, 900, 1100, 1000, 1200, 1150, 1400, 1350, 1600];
    return [50, 60, 45, 90, 110, 100, 120, 115, 140, 135, 160, 180];
  }, [period]);

  const xAxisLabels = useMemo(() => {
    if (period === '7D') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (period === '1Y') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '30'];
  }, [period]);
  
  const revenueChartPath = generateSparkline(mockRevenueData, 600, 200);
  const spendChartPath = generateSparkline(mockSpendData, 600, 200);

  // Live data from context
  const recentLeads = [...leads].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  const topProducts = [...products]
    .sort((a, b) => (b.aiConversions ?? 0) - (a.aiConversions ?? 0))
    .slice(0, 4);

  const statusColorMap: Record<string, string> = {
    'New Lead': 'text-gray-600',
    'Synced': 'text-gray-500',
    'Converted': 'text-[#0E9F88]',
    'Lost': 'text-gray-400',
  };
  const statusDotMap: Record<string, string> = {
    'New Lead': 'bg-[#111827]',
    'Synced': 'bg-gray-400',
    'Converted': 'bg-[#0E9F88]',
    'Lost': 'bg-gray-300',
  };


  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-8">
      
      {/* Shopper Quick Insights Banner */}
      {!hideBanner && (
        <div className="bg-white border border-[#EAECEF] rounded-xl p-4 flex items-start gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-[#EAECEF] flex items-center justify-center shrink-0 z-10">
             <span className="text-xl">✨</span>
          </div>
          <div className="flex-1 z-10">
            <h4 className="text-[13px] font-semibold text-[#111827] mb-1">Shopper Conversion Insight</h4>
            <p className="text-[12px] text-gray-500 font-normal">
              <strong className="text-[#111827]">Velvet Sofas</strong> are seeing a 45% higher Add-to-Cart rate when users view AI-generated visuals. Consider increasing your daily token budget for the "Furniture" category to capture more high-intent checkouts.
            </p>
            <div className="mt-3 flex gap-3">
              <button className="text-[11px] font-medium bg-[#111827] text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors">Adjust Budget</button>
              <button className="text-[11px] font-medium text-gray-400 hover:text-gray-600 px-2 py-1.5" onClick={() => setHideBanner(true)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-[12px] text-gray-400 font-normal mt-1">Here's your storefront overview for the last 30 days.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/merchant/products" className="h-8 px-4 bg-[#111827] text-white text-[11px] font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Ribbon (Token-Centric) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Total Revenue</span>
            <span className="text-[10px] font-medium text-[#0E9F88]">+18.4%</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">₹31,00,000</h3>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">From 214 checkouts</p>
          </div>
        </div>

        {/* Token Spend */}
        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Total Token Spend</span>
            <span className="text-[10px] font-medium text-gray-500">Optimal</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">₹1,15,000</h3>
            <p className="text-[11px] text-[#0E9F88] mt-1 font-medium">26x ROI</p>
          </div>
        </div>

        {/* Shopper Add-to-Carts */}
        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Shopper Add-to-Carts</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">517</h3>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">32% conversion rate</p>
          </div>
        </div>

        {/* Cost Per Checkout */}
        <div className="bg-white border border-[#EAECEF] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-medium text-gray-400">Avg Cost Per Checkout</span>
            <span className="text-[10px] font-medium text-[#0E9F88]">-5.2%</span>
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-[#111827] tabular-nums tracking-tight">₹550</h3>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">Platform average: ₹700</p>
          </div>
        </div>
      </div>

      {/* HERO CHART — Spend vs Revenue */}
      <div className="bg-white rounded-xl border border-[#EAECEF] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
            <div>
              <h4 className="text-[15px] font-semibold text-[#111827] tracking-tight">Spend vs Revenue</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 font-normal">Token investment vs checkout revenue over time.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><span className="w-8 h-0.5 bg-[#0E9F88] rounded inline-block"></span><span className="text-[11px] font-medium text-gray-500">Revenue</span></div>
                <div className="flex items-center gap-1.5"><span className="w-8 border-t-2 border-dashed border-gray-400 inline-block"></span><span className="text-[11px] font-medium text-gray-500">Token Spend</span></div>
              </div>
              <div className="flex items-center gap-1 bg-[#EDEEF0] border border-[#EAECEF] rounded-lg p-1">
                <button onClick={() => setPeriod('7D')} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${period === '7D' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-500 hover:text-[#111827]'}`}>7D</button>
                <button onClick={() => setPeriod('30D')} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${period === '30D' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-500 hover:text-[#111827]'}`}>30D</button>
                <button onClick={() => setPeriod('1Y')} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${period === '1Y' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-500 hover:text-[#111827]'}`}>1Y</button>
              </div>
            </div>
          </div>
          {/* Big summary strip */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="pr-6">
              <p className="text-[10px] font-medium text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">₹31,00,000</p>
              <p className="text-[11px] text-[#0E9F88] font-medium mt-0.5">↑ +18.4% vs last period</p>
            </div>
            <div className="px-6">
              <p className="text-[10px] font-medium text-gray-400">Token Spend</p>
              <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">₹1,15,000</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">26x Return on Spend</p>
            </div>
            <div className="pl-6">
              <p className="text-[10px] font-medium text-gray-400">Net Profit</p>
              <p className="text-2xl font-bold text-[#0E9F88] tabular-nums mt-1">₹29,85,000</p>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">After all costs</p>
            </div>
          </div>
        </div>

        {/* Chart canvas */}
        <div className="relative px-6 pt-6 pb-10" style={{height: '340px'}}>
          <div className="absolute left-6 top-6 bottom-10 flex flex-col justify-between text-[10px] font-semibold text-gray-400">
            <span>₹5L</span><span>₹4L</span><span>₹3L</span><span>₹2L</span><span>₹1L</span><span>₹0</span>
          </div>
          <div className="relative border-l border-b border-gray-100 ml-8" style={{height: '260px'}}>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0,1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-gray-50/80" />)}
            </div>
            <svg viewBox="0 0 600 260" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="revGradHero" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0E9F88" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0E9F88" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="spendGradHero" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${generateSparkline(mockRevenueData, 600, 260)} L 600 260 L 0 260 Z`} fill="url(#revGradHero)" />
              <path d={generateSparkline(mockRevenueData, 600, 260)} fill="none" stroke="#0E9F88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`${generateSparkline(mockSpendData, 600, 260)} L 600 260 L 0 260 Z`} fill="url(#spendGradHero)" />
              <path d={generateSparkline(mockSpendData, 600, 260)} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="545" cy="25" r="5" fill="white" stroke="#0E9F88" strokeWidth="2" />
              <circle cx="545" cy="210" r="3.5" fill="white" stroke="#9CA3AF" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute left-14 right-6 bottom-3 flex justify-between text-[10px] font-semibold text-gray-400">
            {xAxisLabels.map((l, i) => <span key={i}>{l}</span>)}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Performing Products — Live from Context */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#EAECEF] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#F1F3F5]">
            <div>
              <h4 className="text-[13px] font-semibold text-[#111827] tracking-tight">Top Shopper Conversions</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 font-normal">Products generating the most leads.</p>
            </div>
            <Link href="/merchant/analytics" className="text-[11px] font-medium text-[#0E9F88] hover:underline transition-colors">Insights &rarr;</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#FAFBFC] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${product.img}`} />
                  <div>
                    <h5 className="text-[12px] font-semibold text-[#111827] group-hover:text-[#0E9F88] transition-colors">{product.name}</h5>
                    <p className="text-[10px] font-normal text-gray-400">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-[#111827]">₹{product.sellPrice.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-medium text-[#0E9F88] mt-0.5">{product.aiConversions} Leads</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders — Live from Context */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#EAECEF] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#F1F3F5]">
            <div>
              <h4 className="text-[13px] font-semibold text-[#111827] tracking-tight">Recent Orders</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 font-normal">Latest purchase intents from SimulaFly.</p>
            </div>
            <Link href="/merchant/orders" className="text-[11px] font-medium text-[#0E9F88] hover:underline transition-colors">View All &rarr;</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             <div className="divide-y divide-[#F1F3F5]">
               {recentLeads.map((lead, idx) => (
                 <Link key={idx} href="/merchant/orders" className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors group cursor-pointer block">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-[#F1F2F4] border border-[#EAECEF] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                     </div>
                     <div>
                       <p className="text-[12px] font-semibold text-[#111827] group-hover:text-[#0E9F88] transition-colors">{lead.id}</p>
                       <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[11px] font-normal text-gray-400">{lead.date}</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <span className="text-[11px] font-normal text-gray-400">{lead.customer.city}</span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-[12px] font-semibold text-[#111827] tabular-nums">₹{lead.total.toLocaleString('en-IN')}</p>
                     <span className={`inline-flex items-center gap-1.5 mt-1 text-[10px] font-medium ${statusColorMap[lead.status]}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[lead.status]}`}></span>
                       {lead.status}
                     </span>
                   </div>
                 </Link>
               ))}
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
