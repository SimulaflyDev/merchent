"use client";

import { useState } from "react";
import Link from "next/link";
import UnlockModal from "./UnlockModal";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_CREDITS = 840;

const INITIAL_BUYERS = [
  {
    id: "1",
    name: "Rahul Sharma",
    city: "Mumbai",
    initials: "RS",
    intentScore: 92,
    intentLabel: "Purchase Ready",
    intentTier: "ready",      // ready | high | medium | low
    conversionLabel: "Likely within 7 days",
    totalOrders: 2,
    lifetimeSpend: 42500,
    savedCount: 4,
    interactions: 18,
    roomVisualizationCount: 3,
    styleAffinity: "Japandi",
    cartSignals: 2,
    tags: ["Japandi", "Dining"],
    unlocked: false,
  },
  {
    id: "2",
    name: "Priya Mehta",
    city: "Bangalore",
    initials: "PM",
    intentScore: 74,
    intentLabel: "High Intent",
    intentTier: "high",
    conversionLabel: "High revisit momentum",
    totalOrders: 1,
    lifetimeSpend: 18900,
    savedCount: 6,
    interactions: 12,
    roomVisualizationCount: 4,
    styleAffinity: "Mid-Century",
    cartSignals: 1,
    tags: ["Mid-Century", "Bedroom"],
    unlocked: false,
  },
  {
    id: "3",
    name: "Arjun Patel",
    city: "Delhi",
    initials: "AP",
    intentScore: 51,
    intentLabel: "Medium Intent",
    intentTier: "medium",
    conversionLabel: "Building consideration",
    totalOrders: 0,
    lifetimeSpend: 0,
    savedCount: 2,
    interactions: 7,
    roomVisualizationCount: 1,
    styleAffinity: "Industrial",
    cartSignals: 0,
    tags: ["Industrial", "Office"],
    unlocked: false,
  },
  {
    id: "4",
    name: "Sneha Reddy",
    city: "Hyderabad",
    initials: "SR",
    intentScore: 88,
    intentLabel: "Purchase Ready",
    intentTier: "ready",
    conversionLabel: "Likely within 3 days",
    totalOrders: 3,
    lifetimeSpend: 67200,
    savedCount: 5,
    interactions: 22,
    roomVisualizationCount: 5,
    styleAffinity: "Boho Luxe",
    cartSignals: 3,
    tags: ["Boho", "Living Room"],
    unlocked: false,
  },
  {
    id: "5",
    name: "Vikram Nair",
    city: "Chennai",
    initials: "VN",
    intentScore: 23,
    intentLabel: "Low Intent",
    intentTier: "low",
    conversionLabel: "Early exploration",
    totalOrders: 1,
    lifetimeSpend: 8400,
    savedCount: 1,
    interactions: 3,
    roomVisualizationCount: 0,
    styleAffinity: "Minimalist",
    cartSignals: 0,
    tags: ["Minimalist"],
    unlocked: false,
  },
];

// ─── Design tokens ────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { border: string; dot: string; text: string; bar: string }> = {
  ready:  { border: "border-l-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700", bar: "bg-emerald-500" },
  high:   { border: "border-l-amber-400",   dot: "bg-amber-400",   text: "text-amber-700",   bar: "bg-amber-400"   },
  medium: { border: "border-l-blue-400",    dot: "bg-blue-400",    text: "text-blue-700",    bar: "bg-blue-400"    },
  low:    { border: "border-l-gray-300",    dot: "bg-gray-300",    text: "text-gray-500",    bar: "bg-gray-300"    },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-[22px] font-bold text-gray-900 leading-tight mt-1">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────

function Avatar({ initials, tier }: { initials: string; tier: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-gray-200">
      {initials}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyerIntelligencePage() {
  const [buyers, setBuyers] = useState(INITIAL_BUYERS);
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [search, setSearch] = useState("");
  const [unlockTarget, setUnlockTarget] = useState<typeof INITIAL_BUYERS[0] | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleUnlock = (buyerId: string, cost: number) => {
    setBuyers(prev => prev.map(b => b.id === buyerId ? { ...b, unlocked: true } : b));
    setCredits(prev => prev - cost);
  };

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const highIntentCount = buyers.filter(b => b.intentScore >= 70).length;
  const totalRoomViews = buyers.reduce((s, b) => s + b.roomVisualizationCount, 0);
  const recoverableCarts = buyers.filter(b => b.cartSignals > 0).length;
  const totalCartValue = buyers.filter(b => b.cartSignals > 0).reduce((s, b) => s + Math.round(b.lifetimeSpend * 0.4), 0);

  // Right rail
  const styleCounts: Record<string, number> = {};
  buyers.forEach(b => { styleCounts[b.styleAffinity] = (styleCounts[b.styleAffinity] || 0) + 1; });
  const topStyles = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topBuyers = [...buyers].sort((a, b) => b.intentScore - a.intentScore).slice(0, 3);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = "data:text/csv;charset=utf-8,Name,City,Intent Score,Saved,Rooms,Orders,Spend\n"
        + buyers.map(b => `${b.name},${b.city},${b.intentScore},${b.savedCount},${b.roomVisualizationCount},${b.totalOrders},${b.lifetimeSpend}`).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", `buyer_intelligence_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Buyer Intelligence</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Shopper intent signals, room engagement, and conversion opportunities.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Intent Credits</p>
            <p className="text-lg font-bold text-gray-900">₹{credits}</p>
          </div>
          <button className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors whitespace-nowrap">
            Add Credits
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="High Intent Buyers"
          value={highIntentCount}
          sub={`of ${buyers.length} tracked`}
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
        />
        <KpiCard
          label="Room Visualizations"
          value={totalRoomViews}
          sub="by shoppers this month"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 3-3 3 3M9 15l3 3 3-3"/></svg>}
        />
        <KpiCard
          label="Active Conversations"
          value={2}
          sub="WhatsApp threads open"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        />
        <KpiCard
          label="Recoverable Carts"
          value={recoverableCarts}
          sub={`~₹${totalCartValue.toLocaleString('en-IN')} potential`}
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
        />
      </div>

      {/* ── 70/30 Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── Buyer Feed ── */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* Toolbar */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search buyers, city, or style..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <span className="text-[11px] text-gray-400 shrink-0">{filtered.length} buyers</span>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {isExporting ? "Exporting…" : "Export"}
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Intent</th>
                  <th className="px-5 py-3">Signals</th>
                  <th className="px-5 py-3">Conversion Est.</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">No buyers match your search.</td></tr>
                ) : filtered.map((buyer) => {
                  const tier = TIER_CONFIG[buyer.intentTier];
                  return (
                    <tr key={buyer.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors border-l-2 ${tier.border}`}>

                      {/* Buyer */}
                      <td className="px-5 py-4">
                        <Link href={`/merchant/buyer-intelligence/${buyer.id}`} className="flex items-center gap-3 group">
                          <Avatar initials={buyer.initials} tier={buyer.intentTier} />
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900 group-hover:text-[#0E9F88] transition-colors">{buyer.name}</p>
                            <p className="text-[11px] text-gray-400">{buyer.city}</p>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {buyer.tags.map(t => (
                                <span key={t} className="text-[9px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Intent */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5 min-w-[110px]">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${tier.text}`}>{buyer.intentLabel}</span>
                            <span className="text-[11px] font-bold text-gray-900">{buyer.intentScore}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div className={`h-1 rounded-full ${tier.bar}`} style={{ width: `${buyer.intentScore}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Signals */}
                      <td className="px-5 py-4">
                        {buyer.unlocked ? (
                          <div className="space-y-0.5 text-[11px] text-gray-600">
                            <div>{buyer.roomVisualizationCount} room renders · {buyer.styleAffinity}</div>
                            <div>{buyer.savedCount} saved · {buyer.cartSignals > 0 ? `${buyer.cartSignals} cart signal${buyer.cartSignals > 1 ? 's' : ''}` : 'no cart yet'}</div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Unlock engagement insights
                          </div>
                        )}
                        {/* Free tier */}
                        <div className="text-[10px] text-gray-400 mt-1">{buyer.savedCount} saved · {buyer.interactions} interactions</div>
                      </td>

                      {/* Conversion Est. */}
                      <td className="px-5 py-4">
                        <p className="text-[11px] font-medium text-gray-700">{buyer.conversionLabel}</p>
                        {buyer.cartSignals > 0 && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mt-1 inline-block">Cart signal detected</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        {!buyer.unlocked ? (
                          <button
                            onClick={() => setUnlockTarget(buyer)}
                            className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-black transition-colors whitespace-nowrap"
                          >
                            Unlock · ₹30
                          </button>
                        ) : (
                          <Link
                            href={`/merchant/buyer-intelligence/${buyer.id}`}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-[11px] font-semibold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            View Profile →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Insight Rail ── */}
        <div className="w-64 shrink-0 space-y-3">

          {/* Top Buyers */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Top Intent</p>
            <div className="space-y-3">
              {topBuyers.map((b, i) => {
                const t = TIER_CONFIG[b.intentTier];
                return (
                  <Link key={b.id} href={`/merchant/buyer-intelligence/${b.id}`} className="flex items-center gap-2.5 group">
                    <span className="text-[10px] font-bold text-gray-300 w-3 shrink-0">{i + 1}</span>
                    <div className={`w-1.5 h-7 rounded-full ${t.bar} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-900 truncate group-hover:text-[#0E9F88] transition-colors">{b.name}</p>
                      <p className={`text-[10px] font-medium ${t.text}`}>{b.intentScore} · {b.intentLabel}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Style Affinities */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Trending Styles</p>
            <div className="space-y-2">
              {topStyles.map(([style, count]) => (
                <div key={style} className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-gray-700">{style}</span>
                  <span className="text-[10px] text-gray-400">{count} buyer{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recoverable Value */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Recoverable Value</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalCartValue.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{recoverableCarts} buyers with cart signals</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Suggested Action</p>
              <p className="text-[11px] text-gray-600">Send a personalized WhatsApp offer to recover high-intent carts.</p>
            </div>
          </div>

        </div>
      </div>

      {unlockTarget && (
        <UnlockModal
          buyer={unlockTarget}
          credits={credits}
          onClose={() => setUnlockTarget(null)}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}
