"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { ShopperDetailResponse } from "@/lib/api/buyer-intelligence";
import { getShopperDetailAction, unlockShopperAction } from "@/lib/auth/buyer-intelligence-actions";
import { listProductsAction } from "@/lib/auth/product-actions";
import { callAction } from "@/lib/api/action-utils";

// ─── Design config ─────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { border: string; bar: string; text: string; label: string }> = {
  ready:  { border: "border-l-emerald-500", bar: "bg-emerald-500", text: "text-emerald-700", label: "Purchase Ready" },
  high:   { border: "border-l-amber-400",   bar: "bg-amber-400",   text: "text-amber-700",   label: "High Intent"      },
  medium: { border: "border-l-blue-400",    bar: "bg-blue-400",    text: "text-blue-700",    label: "Medium Intent"    },
  low:    { border: "border-l-gray-300",    bar: "bg-gray-300",    text: "text-gray-500",    label: "Low Intent"       },
};

function TimelineDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    view: "bg-blue-300", room: "bg-violet-300", save: "bg-amber-300", cart: "bg-emerald-400"
  };
  return <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${colors[type] || "bg-gray-200"}`} />;
}

function ProductThumb({ name }: { name: string }) {
  const hue = Math.abs(name.split("").reduce((h, c) => h + c.charCodeAt(0), 0)) % 360;
  return (
    <div
      className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center border border-gray-100"
      style={{ backgroundColor: `hsl(${hue}, 15%, 94%)` }}
    >
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-2 2"/>
      </svg>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-[13px] font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

const DEFAULT_PRODUCTS = [
  "Walnut Side Table",
  "Teak Bookshelf",
  "Blue Velvet Sofa",
  "Brass Floor Lamp",
  "Rattan Corner Sofa",
  "Oak Dining Table",
  "Japandi Pendant Light"
];

function generateRandomCode(name: string, suffix: string | number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randStr = "";
  for (let i = 0; i < 4; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const cleanName = name.split(" ")[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
  return `SIMFLY-${cleanName}-${randStr}-${suffix}`;
}

function getValidityDateStr(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function BuyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [buyer, setBuyer] = useState<ShopperDetailResponse | null>(null);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [showWAModal, setShowWAModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [merchantNote, setMerchantNote] = useState("");

  // Discount modal state
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPct, setDiscountPct] = useState(10);
  const [durationDays, setDurationDays] = useState(7);
  const [discountCopied, setDiscountCopied] = useState(false);

  // Collection modal state
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionProducts, setCollectionProducts] = useState<string[]>([]);
  const [waCodeCopied, setWACodeCopied] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    Promise.all([
      callAction(getShopperDetailAction(id)),
      callAction(listProductsAction({ status: "published", limit: 100 })).catch(() => ({ items: [] }))
    ])
      .then(([shopperData, productsData]) => {
        setBuyer(shopperData);
        const titles = productsData.items.map((p: any) => p.title);
        setCatalog(titles.length > 0 ? titles : DEFAULT_PRODUCTS);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (buyer) {
      const bName = buyer.name ?? "Protected Buyer";
      setCouponCode(generateRandomCode(bName, 10));
    }
  }, [buyer]);

  useEffect(() => {
    if (buyer && showDiscountModal) {
      const bName = buyer.name ?? "Protected Buyer";
      setDiscountCode(generateRandomCode(bName, discountPct));
    }
  }, [buyer, discountPct, showDiscountModal]);

  const handleUnlock = async () => {
    if (!buyer) return;
    try {
      await callAction(unlockShopperAction(buyer.user_id));
      const updated = await callAction(getShopperDetailAction(buyer.user_id));
      setBuyer(updated);
    } catch {
      alert("Insufficient wallet balance or unlock failed.");
    }
  };

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

  if (!buyer) {
    return (
      <div className="p-8 text-center text-gray-500">
        Buyer profile not found or failed to load.
      </div>
    );
  }

  const tier = TIER_CONFIG[buyer.intent_tier] || TIER_CONFIG.low;
  const buyerName = buyer.name ?? "Protected Buyer";
  const initials = buyer.name
    ? buyer.name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : "PB";

  const filteredCatalog = catalog.filter(p =>
    p.toLowerCase().includes(productSearch.toLowerCase()) && !selectedProducts.includes(p)
  );
  const filteredCollection = catalog.filter(p =>
    p.toLowerCase().includes(collectionSearch.toLowerCase()) && !collectionProducts.includes(p)
  );

  const toggleProduct = (p: string) => setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleCollectionProduct = (p: string) => setCollectionProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const validityDateText = getValidityDateStr(durationDays);
  const discountWAMessage = selectedProducts.length > 0
    ? `Hi ${buyerName.split(" ")[0]},\n\nWe have a special ${discountPct}% offer on:\n${selectedProducts.map(p => `• ${p}`).join("\n")}\n\nUse code: *${discountCode}*\n(One-time use only. Exclusively for ${buyerName.split(" ")[0]})\n\nValid until ${validityDateText}.\n\nSimulaFly Store`
    : `Hi ${buyerName.split(" ")[0]},\n\nEnjoy ${discountPct}% off your next order with code:\n*${discountCode}*\n(One-time use only. Exclusively for ${buyerName.split(" ")[0]})\n\nValid until ${validityDateText}.\n\nSimulaFly Store`;

  const copyDiscountCode = () => { navigator.clipboard.writeText(discountCode); setDiscountCopied(true); setTimeout(() => setDiscountCopied(false), 2000); };

  const cartProduct = buyer.viewed_products.find(p => p.views > 2)?.name || buyer.viewed_products[0]?.name || "our products";
  const waMessage = `Hi ${buyerName.split(" ")[0]},\n\nWe noticed you explored our ${cartProduct}. 🛋️\n\nHere's a special 10% offer valid today:\n*${couponCode}*\n(One-time use only. Exclusively for ${buyerName.split(" ")[0]})\n\nExplore your showroom: https://simulafly.com\n\nSimulaFly Store`;

  const copyWACode = () => { navigator.clipboard.writeText(couponCode); setWACodeCopied(true); setTimeout(() => setWACodeCopied(false), 2000); };

  const VISIBLE_TIMELINE = 3;
  const visibleEvents = showAllTimeline ? buyer.timeline : buyer.timeline.slice(0, VISIBLE_TIMELINE);
  const hiddenCount = buyer.timeline.length - VISIBLE_TIMELINE;

  const styleAffinity = buyer.viewed_products[0]?.name || "—";
  const preferredRoom = buyer.timeline.some(e => e.type === "room") ? "Visualization Active" : "—";
  const roomRenders = buyer.timeline.filter(e => e.type === "room").map(e => e.text);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <Link href="/merchant/buyer-intelligence" className="hover:text-gray-700 transition-colors">Buyer Intelligence</Link>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="text-gray-700 font-medium">{buyerName}</span>
      </div>

      {/* ── Profile Header ── */}
      <div className={`bg-white border border-gray-200 rounded-xl p-5 border-l-4 ${tier.border} flex flex-col md:flex-row items-start md:items-center justify-between gap-5`}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-lg shrink-0 border border-gray-200">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-bold text-gray-900">{buyerName}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current ${tier.text} bg-opacity-5`}>{buyer.intent_label}</span>
            </div>
            <p className="text-[12px] text-gray-500">{buyer.city} · Active this week</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {buyer.viewed_products.slice(0, 3).map((p) => (
                <span key={p.name} className="text-[9px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="flex w-full shrink-0 items-center justify-between gap-6 md:w-auto md:justify-start md:gap-8">
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Intent Score</p>
            <div className="flex items-end gap-1 mt-0.5">
              <span className={`text-3xl font-bold ${tier.text}`}>{buyer.intent_score}</span>
              <span className="text-gray-400 text-xs mb-1">/100</span>
            </div>
            <div className="w-28 bg-gray-100 rounded-full h-1.5 overflow-hidden mt-1">
              <div className={`h-1.5 rounded-full ${tier.bar}`} style={{ width: `${buyer.intent_score}%` }} />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Interactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{buyer.interaction_count}</p>
          </div>
        </div>
      </div>

      {/* ── Conversion Probability Banner ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <p className="text-[12px] font-semibold text-gray-700">
          {buyer.intent_tier === "ready" ? "Likely to purchase within 7 days" : buyer.intent_tier === "high" ? "High revisit momentum detected" : "Building catalog consideration"}
        </p>
        <span className="w-full text-[10px] text-gray-400 sm:ml-auto sm:w-auto">AI estimate based on engagement patterns</span>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2">
        {!buyer.unlocked ? (
          <button
            onClick={handleUnlock}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[12px] font-bold rounded-lg hover:bg-black transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Unlock Contact Details (₹30)
          </button>
        ) : (
          <>
            <button onClick={() => setShowWAModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-[12px] font-bold rounded-lg hover:bg-[#1DA851] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              Send WhatsApp Offer
            </button>
            <button onClick={() => setShowDiscountModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-[12px] font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Offer Bundle Discount
            </button>
            <button onClick={() => setShowCollectionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-[12px] font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 5 5m0-5-5 5"/></svg>
              Share New Collection
            </button>
          </>
        )}
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="flex flex-col items-stretch gap-5 xl:flex-row xl:items-start">

        {/* ── LEFT ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Intent Score Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Why This Score" sub="Factors contributing to buyer intent" />
            <div className="px-5 py-4 grid grid-cols-2 gap-2">
              {buyer.intent_reasons.length === 0 ? (
                <p className="text-[12px] text-gray-400 italic col-span-2">No score contributing activities yet.</p>
              ) : (
                buyer.intent_reasons.map((reason: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-gray-700">
                    <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    {reason}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Product Interactions */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Product Interactions" sub={`${buyer.viewed_products.length} products explored`} />
            <div className="divide-y divide-gray-50">
              {buyer.viewed_products.length === 0 ? (
                <p className="p-5 text-[12px] text-gray-400 italic">No products viewed yet.</p>
              ) : (
                buyer.viewed_products.map((p: any, i: number) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                    <ProductThumb name={p.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{p.engagement}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.name.includes("Dining Table") && (
                        <>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">
                            Saved
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shadow-sm">
                            In Cart
                          </span>
                        </>
                      )}
                      {!p.name.includes("Dining Table") && p.views > 1 && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">
                          Saved
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-semibold ml-1">{p.views}×</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Recent Engagement Signals" sub="Real-time activity logs" />
            <div className="px-5 py-4 space-y-3">
              {buyer.timeline.length === 0 ? (
                <p className="text-[12px] text-gray-400 italic">No timeline events recorded yet.</p>
              ) : (
                visibleEvents.map((event: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <TimelineDot type={event.type} />
                    <div className="flex-1">
                      <span className="text-[10px] font-medium text-gray-400">{event.time}</span>
                      <span className="text-[11px] text-gray-700 ml-2">{event.text}</span>
                    </div>
                  </div>
                ))
              )}
              {hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllTimeline(!showAllTimeline)}
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors pt-1"
                >
                  {showAllTimeline ? "Show less" : `+${hiddenCount} more signals`}
                </button>
              )}
            </div>
          </div>

          {/* Merchant Notes */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Merchant Notes" sub="Private notes — not visible to the customer" />
            <div className="px-5 pb-5 pt-3">
              <textarea
                value={merchantNote}
                onChange={(e) => setMerchantNote(e.target.value)}
                placeholder={"e.g. Prefers darker walnut finish · Budget ~₹1.5L · WhatsApp preferred"}
                rows={3}
                className="w-full text-[12px] text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-gray-400 transition-colors"
              />
              {merchantNote && (
                <p className="text-[10px] text-gray-400 mt-1">Saved locally · sync coming soon</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="w-full shrink-0 space-y-4 xl:w-64">

          {/* Customer Overview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Customer Overview" />
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { label: "Spend", value: `₹${buyer.lifetime_spend.toLocaleString('en-IN')}` },
                { label: "Orders", value: buyer.total_orders },
                { label: "Clicks", value: `${buyer.click_count}×` },
                { label: "Interactions", value: buyer.interaction_count },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Preferred Room</span>
                <span className="font-medium text-gray-800">{preferredRoom}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Style affinity</span>
                <span className="font-medium text-gray-800 truncate max-w-[120px]">{styleAffinity}</span>
              </div>
            </div>
          </div>

          {/* Visualization Activity */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-gray-900">Visualization Activity</h3>
              <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Unique signal</span>
            </div>
            <div className="p-4">
              <div className="text-center py-3 border border-gray-100 rounded-lg mb-3">
                <p className="text-4xl font-bold text-gray-900">{buyer.image_count}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Room renders generated</p>
              </div>
              <div className="space-y-1.5">
                {roomRenders.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No room visualization active.</p>
                ) : (
                  roomRenders.map((r: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                      {r}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Purchase Intent Signals */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Purchase Signals" />
            <div className="p-4 space-y-2">
              {[
                { icon: "💾", label: `${buyer.click_count} products saved`, sub: "Building consideration list" },
                { icon: "🔁", label: `Returned ${buyer.click_count} times`, sub: "High consideration depth" },
                { icon: "🎨", label: `${styleAffinity} affinity`, sub: "High style engagement" },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
                  <span className="text-sm">{s.icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-700">{s.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Bundle Recommendation */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-gray-900">Suggested Bundle</h3>
              <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
            </div>
            <div className="p-4">
              <p className="text-[10px] text-gray-400 mb-3">Frequently visualized together by this buyer</p>
              <div className="space-y-2">
                {buyer.suggested_bundle.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No bundle recommendations yet.</p>
                ) : (
                  buyer.suggested_bundle.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <ProductThumb name={item} />
                      <span className="text-[11px] font-medium text-gray-700">{item}</span>
                    </div>
                  ))
                )}
              </div>
              {buyer.suggested_bundle.length > 0 && (
                <button
                  onClick={() => { setSelectedProducts(buyer.suggested_bundle); setShowDiscountModal(true); }}
                  className="mt-4 w-full py-2 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Create Bundle Offer →
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── WhatsApp Modal ── */}
      {showWAModal && buyer.phone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWAModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Personalized Offer</p>
                <h3 className="text-base font-bold text-gray-900">Send WhatsApp Message</h3>
              </div>
              <button onClick={() => setShowWAModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Message Preview</p>
                <p className="text-[12px] text-gray-700 whitespace-pre-line leading-relaxed">{waMessage}</p>
              </div>
              <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                <span className="font-mono text-sm font-bold text-gray-800 tracking-widest">{couponCode}</span>
                <button onClick={copyWACode} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${waCodeCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {waCodeCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="px-6 pb-6">
              <a href={`https://wa.me/${buyer.phone}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noreferrer"
                className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#1DA851] transition-colors shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                Send via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Advanced Discount Modal ── */}
      {showDiscountModal && buyer.phone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDiscountModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Custom Offer Builder</p>
                <h3 className="text-base font-bold text-gray-900">Bundle Discount for {buyerName.split(" ")[0]}</h3>
              </div>
              <button onClick={() => setShowDiscountModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Step 1 */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">1. Select Products</label>
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Search your products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedProducts.map(p => (
                      <span key={p} className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                        {p}
                        <button onClick={() => toggleProduct(p)} className="hover:text-red-500 transition-colors"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                      </span>
                    ))}
                  </div>
                )}
                {productSearch && filteredCatalog.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {filteredCatalog.slice(0, 5).map(p => (
                      <button key={p} onClick={() => { toggleProduct(p); setProductSearch(""); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                {selectedProducts.length === 0 && !productSearch && <p className="text-[11px] text-gray-400">Start typing to search your product catalog</p>}
              </div>
              {/* Step 2 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">2. Discount Percentage</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={discountPct || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= 100) {
                          setDiscountPct(val);
                        } else if (e.target.value === "") {
                          setDiscountPct(0);
                        }
                      }}
                      className="w-16 text-right px-2 py-1 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm font-bold text-gray-900">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={discountPct || ""}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-full accent-gray-800 cursor-pointer appearance-none"
                />
                <div className="flex gap-2">
                  {[10, 15, 20, 25].map(n => (
                    <button
                      key={n}
                      onClick={() => setDiscountPct(n)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${discountPct === n ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                      {n}% off
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">3. Offer Duration</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={durationDays || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= 365) {
                          setDurationDays(val);
                        } else if (e.target.value === "") {
                          setDurationDays(0);
                        }
                      }}
                      className="w-16 text-right px-2 py-1 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-semibold text-gray-500">{durationDays === 1 ? "day" : "days"}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={durationDays || ""}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-full accent-gray-800 cursor-pointer appearance-none"
                />
                <div className="flex gap-2">
                  {[1, 3, 7, 14, 30].map(d => (
                    <button
                      key={d}
                      onClick={() => setDurationDays(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${durationDays === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                      {d} {d === 1 ? "day" : "days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">4. Generated Code</label>
                <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                  <span className="font-mono text-sm font-bold text-gray-800 tracking-widest">{discountCode}</span>
                  <button onClick={copyDiscountCode} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${discountCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{discountCopied ? '✓ Copied' : 'Copy'}</button>
                </div>
                {selectedProducts.length > 0 && <p className="text-[11px] text-gray-400">Applies to: {selectedProducts.join(", ")}</p>}
              </div>

              {/* Message Preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Message Preview</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[12px] text-gray-700 whitespace-pre-line leading-relaxed">{discountWAMessage}</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 shrink-0">
              <a href={`https://wa.me/${buyer.phone}?text=${encodeURIComponent(discountWAMessage)}`} target="_blank" rel="noreferrer"
                className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#1DA851] transition-colors shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                Send Offer via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Collection Modal ── */}
      {showCollectionModal && buyer.phone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCollectionModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">WhatsApp Collection Share</p>
                <h3 className="text-base font-bold text-gray-900">Share Products with {buyerName.split(" ")[0]}</h3>
              </div>
              <button onClick={() => setShowCollectionModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Select Products to Share</label>
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Search your products..." value={collectionSearch} onChange={(e) => setCollectionSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
                {collectionProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {collectionProducts.map(p => (
                      <span key={p} className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                        {p}
                        <button onClick={() => toggleCollectionProduct(p)} className="hover:text-red-500 transition-colors"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                      </span>
                    ))}
                  </div>
                )}
                {collectionSearch && filteredCollection.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {filteredCollection.slice(0, 6).map(p => (
                      <button key={p} onClick={() => { toggleCollectionProduct(p); setCollectionSearch(""); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                {collectionProducts.length === 0 && !collectionSearch && <p className="text-[11px] text-gray-400">Start typing to pick products from your catalog</p>}
              </div>
              {collectionProducts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Message Preview</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-[12px] text-gray-700 whitespace-pre-line leading-relaxed">
                      {`Hi ${buyerName.split(" ")[0]},\n\nWe thought you'd love our latest collection! 🛋️\n\n${collectionProducts.map(p => `• ${p}\n  simulafly.com/products/${p.toLowerCase().replace(/ /g, "-")}`).join("\n\n")}\n\nFeel free to ask anything.\n\nSimulaFly Store`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 shrink-0">
              {collectionProducts.length === 0 ? (
                <p className="text-center text-[12px] text-gray-400 py-2">Select at least one product to continue</p>
              ) : (
                <a href={`https://wa.me/${buyer.phone}?text=${encodeURIComponent(`Hi ${buyerName.split(" ")[0]},\n\nWe thought you'd love our latest collection! 🛋️\n\n${collectionProducts.map(p => `• ${p}\n  simulafly.com/products/${p.toLowerCase().replace(/ /g, "-")}`).join("\n\n")}\n\nFeel free to ask anything.\n\nSimulaFly Store`)}`}
                  target="_blank" rel="noreferrer"
                  className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#1DA851] transition-colors shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  Share Collection via WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
