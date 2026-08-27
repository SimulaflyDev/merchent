"use client";

import { useState } from "react";
import Link from "next/link";
import UnlockModal from "./UnlockModal";
import { unlockShopperAction } from "@/lib/auth/buyer-intelligence-actions";
import type { ShopperOut } from "@/lib/api/buyer-intelligence";
import { callAction } from "@/lib/api/action-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Buyer = {
  id: string;
  name: string;
  city: string;
  initials: string;
  intentScore: number;
  intentLabel: string;
  intentTier: "ready" | "high" | "medium" | "low";
  conversionLabel: string;
  totalOrders: number;
  lifetimeSpend: number;
  savedCount: number;
  interactions: number;
  roomVisualizationCount: number;
  styleAffinity: string;
  cartSignals: number;
  tags: string[];
  unlocked: boolean;
  email: string | null;
  phone: string | null;
};

function initials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function conversionLabel(tier: string): string {
  switch (tier) {
    case "ready":  return "Likely within 7 days";
    case "high":   return "High revisit momentum";
    case "medium": return "Building consideration";
    default:       return "Early exploration";
  }
}

function adaptShopper(s: ShopperOut): Buyer {
  return {
    id: s.user_id,
    name: s.name ?? "Protected Buyer",
    city: s.city,
    initials: initials(s.name),
    intentScore: s.intent_score,
    intentLabel: s.intent_label,
    intentTier: s.intent_tier,
    conversionLabel: conversionLabel(s.intent_tier),
    totalOrders: 0,
    lifetimeSpend: 0,
    savedCount: 0,
    interactions: s.interaction_count,
    roomVisualizationCount: s.image_count,
    styleAffinity: "—",
    cartSignals: 0,
    tags: [],
    unlocked: s.unlocked,
    email: s.email,
    phone: s.phone,
  };
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { border: string; dot: string; text: string; bar: string }> = {
  ready:  { border: "border-l-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700", bar: "bg-emerald-500" },
  high:   { border: "border-l-amber-400",   dot: "bg-amber-400",   text: "text-amber-700",   bar: "bg-amber-400"   },
  medium: { border: "border-l-blue-400",    dot: "bg-blue-400",    text: "text-blue-700",    bar: "bg-blue-400"    },
  low:    { border: "border-l-gray-300",    dot: "bg-gray-300",    text: "text-gray-500",    bar: "bg-gray-300"    },
};

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

function Avatar({ initials: ini }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-gray-200">
      {ini}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialShoppers: ShopperOut[];
  walletBalance: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BuyerIntelligenceClient({ initialShoppers, walletBalance }: Props) {
  const [buyers, setBuyers] = useState<Buyer[]>(initialShoppers.map(adaptShopper));
  const [credits, setCredits] = useState(Math.floor(walletBalance));
  const [search, setSearch] = useState("");
  const [unlockTarget, setUnlockTarget] = useState<Buyer | null>(null);

  const handleUnlock = async (buyerId: string, cost: number) => {
    try {
      const updated = await callAction(unlockShopperAction(buyerId));
      setBuyers((prev) =>
        prev.map((b) =>
          b.id === buyerId
            ? {
                ...b,
                ...adaptShopper(updated),
                unlocked: true,
              }
            : b
        )
      );
      setCredits((prev) => prev - cost);
    } catch {
      // Wallet insufficient or already unlocked — UI shows error via modal
    }
  };

  const filtered = buyers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const highIntentCount = buyers.filter((b) => b.intentScore >= 70).length;
  const totalRoomViews = buyers.reduce((s, b) => s + b.roomVisualizationCount, 0);
  const topBuyers = [...buyers].sort((a, b) => b.intentScore - a.intentScore).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Buyer Intelligence</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Shopper intent signals, room engagement, and conversion opportunities.</p>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard
          label="High Intent Buyers"
          value={highIntentCount}
          sub={`of ${buyers.length} tracked`}
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
        />
        <KpiCard
          label="Room Visualizations"
          value={totalRoomViews}
          sub="by shoppers this period"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 3-3 3 3M9 15l3 3 3-3"/></svg>}
        />
        <KpiCard
          label="Total Interactions"
          value={buyers.reduce((s, b) => s + b.interactions, 0)}
          sub="clicks, AI views, redirects"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        />
      </div>

      {/* ── 70/30 Layout ── */}
      <div className="flex flex-col items-stretch gap-5 xl:flex-row xl:items-start">

        {/* ── Buyer Feed ── */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search buyers or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <span className="text-[11px] text-gray-400 shrink-0">{filtered.length} buyers</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            {buyers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-[14px] font-semibold text-gray-700 mb-1">No shopper data yet</p>
                <p className="text-[12px] text-gray-400">Buyer interactions will appear here once shoppers engage with your products on SimulaFly.</p>
              </div>
            ) : (
              <table className="w-full min-w-[760px] text-left">
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
                    const tier = TIER_CONFIG[buyer.intentTier] ?? TIER_CONFIG["low"];
                    return (
                      <tr key={buyer.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors border-l-2 ${tier.border}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={buyer.initials} />
                            <div>
                              <p className="text-[13px] font-semibold text-gray-900">{buyer.name}</p>
                              <p className="text-[11px] text-gray-400">{buyer.city}</p>
                              {buyer.unlocked && buyer.phone && (
                                <p className="text-[10px] text-[#1FAF9A] font-medium mt-0.5">{buyer.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
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
                        <td className="px-5 py-4">
                          <div className="space-y-0.5 text-[11px] text-gray-600">
                            <div>{buyer.roomVisualizationCount} room renders · {buyer.interactions} interactions</div>
                            {buyer.unlocked && buyer.email && (
                              <div className="text-[10px] text-gray-400">{buyer.email}</div>
                            )}
                            {!buyer.unlocked && (
                              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1">
                                <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Unlock to reveal contact
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[11px] font-medium text-gray-700">{buyer.conversionLabel}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {!buyer.unlocked ? (
                            <button
                              onClick={() => setUnlockTarget(buyer)}
                              className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-black transition-colors whitespace-nowrap"
                            >
                              Unlock · ₹{buyer.intentScore >= 81 ? 30 : 15}
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
            )}
          </div>
        </div>

        {/* ── Insight Rail ── */}
        <div className="w-full shrink-0 space-y-3 xl:w-64">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Top Intent</p>
            <div className="space-y-3">
              {topBuyers.map((b, i) => {
                const t = TIER_CONFIG[b.intentTier] ?? TIER_CONFIG["low"];
                return (
                  <div key={b.id} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-gray-300 w-3 shrink-0">{i + 1}</span>
                    <div className={`w-1.5 h-7 rounded-full ${t.bar} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className={`text-[10px] font-medium ${t.text}`}>{b.intentScore} · {b.intentLabel}</p>
                    </div>
                  </div>
                );
              })}
              {topBuyers.length === 0 && (
                <p className="text-[11px] text-gray-400 italic">No data yet</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Unlock Cost</p>
            <p className="text-xl font-bold text-gray-900">₹15 / ₹30</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Tiered pricing by intent</p>
            <div className="mt-2 text-[10px] text-gray-400 space-y-1">
              <div>• 10% - 80% score: ₹15</div>
              <div>• 81% - 99% score: ₹30</div>
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
