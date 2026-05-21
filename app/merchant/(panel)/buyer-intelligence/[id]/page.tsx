"use client";

import React, { useState } from "react";
import Link from "next/link";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BUYERS: Record<string, any> = {
  "1": {
    id: "1", name: "Rahul Sharma", initials: "RS",
    intentScore: 92, intentLabel: "Purchase Ready", intentTier: "ready",
    conversionLabel: "Likely to purchase within 7 days",
    city: "Mumbai", state: "Maharashtra",
    totalOrders: 2, lifetimeSpend: 42500,
    revisitCount: 5, repeatScore: 84,
    tags: ["Japandi", "Dining Furniture", "Compact Spaces"],
    styleAffinity: "Japandi", preferredRoom: "Compact Living Room",
    savedCount: 4, interactions: 18,
    roomVisualizationCount: 3, cartSignals: 2,
    phone: "919876543210",
    intentReasons: [
      "Generated 3 room previews",
      "Returned to browse 5 times",
      "Saved 4 products",
      "Added dining table to cart",
    ],
    viewedProducts: [
      { name: "Oak Dining Table", views: 4, engagement: "High engagement with dining seating", saved: true, carted: true },
      { name: "Walnut Side Table", views: 2, engagement: "High engagement with accent furniture", saved: true, carted: false },
      { name: "Rattan Accent Chair", views: 3, engagement: "High engagement with Japandi seating", saved: true, carted: false },
      { name: "Teak Bookshelf", views: 1, engagement: "Moderate engagement with storage", saved: false, carted: false },
    ],
    timeline: [
      { time: "This week", icon: "🛒", text: "Added to cart", type: "cart" },
      { time: "This week", icon: "🛋️", text: "Generated a room preview", type: "room" },
      { time: "This week", icon: "💾", text: "Saved a product", type: "save" },
      { time: "Last week", icon: "👁️", text: "Returned to browse", type: "view" },
      { time: "Last week", icon: "🛋️", text: "Generated a room preview", type: "room" },
      { time: "This month", icon: "💾", text: "Saved a product", type: "save" },
    ],
    roomRenders: ["Japandi Living Room", "Compact Dining Room", "Japandi Bedroom"],
    cartProduct: "Oak Dining Table",
    suggestedBundle: ["Oak Dining Table", "Japandi Pendant Light", "Walnut Sideboard"],
  },
  "2": {
    id: "2", name: "Priya Mehta", initials: "PM",
    intentScore: 74, intentLabel: "High Intent", intentTier: "high",
    conversionLabel: "High revisit momentum detected",
    city: "Bangalore", state: "Karnataka",
    totalOrders: 1, lifetimeSpend: 18900,
    revisitCount: 3, repeatScore: 62,
    tags: ["Mid-Century Modern", "Bedroom", "Warm Tones"],
    styleAffinity: "Mid-Century Modern", preferredRoom: "Master Bedroom",
    savedCount: 6, interactions: 12,
    roomVisualizationCount: 4, cartSignals: 1,
    phone: "919765432109",
    intentReasons: [
      "Generated 4 room previews",
      "Saved 6 products",
      "Added 1 item to cart",
      "Returned 3 times",
    ],
    viewedProducts: [
      { name: "Velvet Wingback Chair", views: 5, engagement: "High engagement with statement seating", saved: true, carted: true },
      { name: "Blue Velvet Sofa", views: 3, engagement: "High engagement with living room seating", saved: true, carted: false },
      { name: "Brass Floor Lamp", views: 2, engagement: "Moderate engagement with accent lighting", saved: true, carted: false },
    ],
    timeline: [
      { time: "This week", icon: "🛒", text: "Added to cart", type: "cart" },
      { time: "This week", icon: "🛋️", text: "Generated a room preview", type: "room" },
      { time: "This week", icon: "💾", text: "Saved a product", type: "save" },
      { time: "Last week", icon: "🛋️", text: "Generated a room preview", type: "room" },
    ],
    roomRenders: ["Mid-Century Bedroom", "Warm Tone Living Room", "Master Suite", "Reading Nook"],
    cartProduct: "Velvet Wingback Chair",
    suggestedBundle: ["Velvet Wingback Chair", "Brass Floor Lamp", "Woven Area Rug"],
  },
  "4": {
    id: "4", name: "Sneha Reddy", initials: "SR",
    intentScore: 88, intentLabel: "Purchase Ready", intentTier: "ready",
    conversionLabel: "Likely to purchase within 3 days",
    city: "Hyderabad", state: "Telangana",
    totalOrders: 3, lifetimeSpend: 67200,
    revisitCount: 7, repeatScore: 91,
    tags: ["Boho Luxe", "Living Room", "Statement Pieces"],
    styleAffinity: "Boho Luxe", preferredRoom: "Open Living Space",
    savedCount: 5, interactions: 22,
    roomVisualizationCount: 5, cartSignals: 3,
    phone: "919654321098",
    intentReasons: [
      "Generated 5 room previews",
      "Returned 7 times this month",
      "3 cart additions",
      "Saved 5 products",
    ],
    viewedProducts: [
      { name: "Macramé Wall Art", views: 3, engagement: "High engagement with boho wall decor", saved: true, carted: false },
      { name: "Rattan Corner Sofa", views: 6, engagement: "High engagement with statement seating", saved: true, carted: true },
      { name: "Terracotta Planter Set", views: 2, engagement: "Moderate engagement with natural decor", saved: true, carted: false },
      { name: "Jute Area Rug", views: 4, engagement: "High engagement with floor accents", saved: true, carted: true },
      { name: "Woven Pendant Light", views: 2, engagement: "Moderate engagement with boho lighting", saved: false, carted: true },
    ],
    timeline: [
      { time: "This week", icon: "🛒", text: "Added to cart", type: "cart" },
      { time: "This week", icon: "👁️", text: "Returned to browse", type: "view" },
      { time: "This week", icon: "🛋️", text: "Generated a room preview", type: "room" },
      { time: "Last week", icon: "🛒", text: "Added to cart", type: "cart" },
      { time: "Last week", icon: "💾", text: "Saved a product", type: "save" },
    ],
    roomRenders: ["Boho Open Living", "Earthy Tones Lounge", "Bohemian Dining", "Desert-inspired Bedroom", "Patio Extension"],
    cartProduct: "Rattan Corner Sofa",
    suggestedBundle: ["Rattan Corner Sofa", "Jute Area Rug", "Woven Pendant Light"],
  },
};

const FALLBACK = BUYERS["1"];

const TIER_CONFIG: Record<string, { border: string; bar: string; text: string; label: string }> = {
  ready:  { border: "border-l-emerald-500", bar: "bg-emerald-500", text: "text-emerald-700", label: "Purchase Ready" },
  high:   { border: "border-l-amber-400",   bar: "bg-amber-400",   text: "text-amber-700",   label: "High Intent"      },
  medium: { border: "border-l-blue-400",    bar: "bg-blue-400",    text: "text-blue-700",    label: "Medium Intent"    },
  low:    { border: "border-l-gray-300",    bar: "bg-gray-300",    text: "text-gray-500",    label: "Low Intent"       },
};

// ─── Timeline Dot ─────────────────────────────────────────────────────────────

function TimelineDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    view: "bg-blue-300", room: "bg-violet-300", save: "bg-amber-300", cart: "bg-emerald-400"
  };
  return <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${colors[type] || "bg-gray-200"}`} />;
}

// ─── Product Thumbnail ────────────────────────────────────────────────────────

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

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-[13px] font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const buyer = BUYERS[id] || FALLBACK;
  const tier = TIER_CONFIG[buyer.intentTier] || TIER_CONFIG.low;

  const [showWAModal, setShowWAModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [merchantNote, setMerchantNote] = useState("");

  // Discount modal state
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPct, setDiscountPct] = useState(10);
  const [discountCopied, setDiscountCopied] = useState(false);

  // Collection modal state
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionProducts, setCollectionProducts] = useState<string[]>([]);

  const CATALOG = [
    "Oak Dining Table", "Walnut Side Table", "Rattan Accent Chair", "Teak Bookshelf",
    "Velvet Wingback Chair", "Blue Velvet Sofa", "Brass Floor Lamp",
    "Macramé Wall Art", "Rattan Corner Sofa", "Jute Area Rug",
    "Woven Pendant Light", "Terracotta Planter Set", "White Storage Ottoman",
    "Metal Shelf Unit", "Pipe Desk",
  ];

  const filteredCatalog = CATALOG.filter(p =>
    p.toLowerCase().includes(productSearch.toLowerCase()) && !selectedProducts.includes(p)
  );
  const filteredCollection = CATALOG.filter(p =>
    p.toLowerCase().includes(collectionSearch.toLowerCase()) && !collectionProducts.includes(p)
  );

  const toggleProduct = (p: string) => setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleCollectionProduct = (p: string) => setCollectionProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const discountCode = `SIMFLY-${buyer.name.split(" ")[0].toUpperCase()}-${discountPct}`;
  const discountWAMessage = selectedProducts.length > 0
    ? `Hi ${buyer.name.split(" ")[0]},\n\nWe have a special ${discountPct}% offer on:\n${selectedProducts.map(p => `• ${p}`).join("\n")}\n\nUse code: *${discountCode}*\n\nValid this week only.\n\nSimulaFly Store`
    : `Hi ${buyer.name.split(" ")[0]},\n\nEnjoy ${discountPct}% off your next order with code:\n*${discountCode}*\n\nSimulaFly Store`;

  const copyDiscountCode = () => { navigator.clipboard.writeText(discountCode); setDiscountCopied(true); setTimeout(() => setDiscountCopied(false), 2000); };

  const couponCode = `SIMFLY-${buyer.name.split(" ")[0].toUpperCase()}-10`;
  const waMessage = `Hi ${buyer.name.split(" ")[0]},\n\nWe noticed you explored our ${buyer.cartProduct || buyer.viewedProducts[0]?.name}. 🛋️\n\nHere's a special 10% offer valid today:\n*${couponCode}*\n\nExplore your showroom: https://simulafly.com\n\nSimulaFly Store`;

  const [waCodeCopied, setWACodeCopied] = useState(false);
  const copyWACode = () => { navigator.clipboard.writeText(couponCode); setWACodeCopied(true); setTimeout(() => setWACodeCopied(false), 2000); };

  const VISIBLE_TIMELINE = 3;
  const visibleEvents = showAllTimeline ? buyer.timeline : buyer.timeline.slice(0, VISIBLE_TIMELINE);
  const hiddenCount = buyer.timeline.length - VISIBLE_TIMELINE;

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-5">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <Link href="/merchant/buyer-intelligence" className="hover:text-gray-700 transition-colors">Buyer Intelligence</Link>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="text-gray-700 font-medium">{buyer.name}</span>
      </div>

      {/* ── Profile Header ── */}
      <div className={`bg-white border border-gray-200 rounded-xl p-5 border-l-4 ${tier.border} flex flex-col md:flex-row items-start md:items-center justify-between gap-5`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-lg shrink-0 border border-gray-200">
            {buyer.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[18px] font-bold text-gray-900">{buyer.name}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current ${tier.text} bg-opacity-5`}>{buyer.intentLabel}</span>
            </div>
            <p className="text-[12px] text-gray-500">{buyer.city}, {buyer.state} · Active this week</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {buyer.tags.map((t: string) => (
                <span key={t} className="text-[9px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-8 shrink-0">
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Intent Score</p>
            <div className="flex items-end gap-1 mt-0.5">
              <span className={`text-3xl font-bold ${tier.text}`}>{buyer.intentScore}</span>
              <span className="text-gray-400 text-xs mb-1">/100</span>
            </div>
            <div className="w-28 bg-gray-100 rounded-full h-1.5 overflow-hidden mt-1">
              <div className={`h-1.5 rounded-full ${tier.bar}`} style={{ width: `${buyer.intentScore}%` }} />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Repeat Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{buyer.repeatScore}</p>
          </div>
        </div>
      </div>

      {/* ── Conversion Probability Banner ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <p className="text-[12px] font-semibold text-gray-700">{buyer.conversionLabel}</p>
        <span className="text-[10px] text-gray-400 ml-auto">AI estimate based on engagement patterns</span>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2">
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
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── LEFT ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Intent Score Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Why This Score" sub="Factors contributing to buyer intent" />
            <div className="px-5 py-4 grid grid-cols-2 gap-2">
              {buyer.intentReasons.map((reason: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-gray-700">
                  <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Product Interactions */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Product Interactions" sub={`${buyer.viewedProducts.length} products explored`} />
            <div className="divide-y divide-gray-50">
              {buyer.viewedProducts.map((p: any, i: number) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                  <ProductThumb name={p.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{p.engagement}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-gray-400">{p.views}×</span>
                    {p.saved && <span className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Saved</span>}
                    {p.carted && <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded">In Cart</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Recent Engagement Signals" sub="Approximate activity windows · not exact tracking" />
            <div className="px-5 py-4 space-y-3">
              {visibleEvents.map((event: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <TimelineDot type={event.type} />
                  <div className="flex-1">
                    <span className="text-[10px] font-medium text-gray-400">{event.time}</span>
                    <span className="text-[11px] text-gray-700 ml-2">{event.text}</span>
                  </div>
                </div>
              ))}
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
        <div className="w-64 shrink-0 space-y-4">

          {/* Customer Overview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Customer Overview" />
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { label: "Spend", value: `₹${buyer.lifetimeSpend.toLocaleString('en-IN')}` },
                { label: "Orders", value: buyer.totalOrders },
                { label: "Returns", value: `${buyer.revisitCount}×` },
                { label: "Interactions", value: buyer.interactions },
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
                <span className="font-medium text-gray-800">{buyer.preferredRoom}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Style</span>
                <span className="font-medium text-gray-800">{buyer.styleAffinity}</span>
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
                <p className="text-4xl font-bold text-gray-900">{buyer.roomVisualizationCount}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Room renders generated</p>
              </div>
              <div className="space-y-1.5">
                {buyer.roomRenders.map((r: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Intent Signals */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <SectionHeader title="Purchase Signals" />
            <div className="p-4 space-y-2">
              {buyer.cartProduct && (
                <div className={`flex items-start gap-2.5 p-3 rounded-lg border-l-2 border-l-emerald-500 bg-gray-50`}>
                  <div className="text-sm">🛒</div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">{buyer.cartProduct} in cart</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Strong purchase intent</p>
                  </div>
                </div>
              )}
              {[
                { icon: "💾", label: `${buyer.savedCount} products saved`, sub: "Building consideration list" },
                { icon: "🔁", label: `Returned ${buyer.revisitCount} times`, sub: "High consideration depth" },
                { icon: "🎨", label: `${buyer.styleAffinity} affinity`, sub: "High style engagement" },
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
                {buyer.suggestedBundle.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <ProductThumb name={item} />
                    <span className="text-[11px] font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setSelectedProducts(buyer.suggestedBundle); setShowDiscountModal(true); }}
                className="mt-4 w-full py-2 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Bundle Offer →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── WhatsApp Modal ── */}
      {showWAModal && (
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
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDiscountModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Custom Offer Builder</p>
                <h3 className="text-base font-bold text-gray-900">Bundle Discount for {buyer.name.split(" ")[0]}</h3>
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
                  <span className="text-xl font-bold text-gray-900">{discountPct}%</span>
                </div>
                <input type="range" min={5} max={50} step={5} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full h-2 rounded-full accent-gray-800 cursor-pointer" />
                <div className="flex gap-2">
                  {[10, 15, 20, 25].map(n => (
                    <button key={n} onClick={() => setDiscountPct(n)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${discountPct === n ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{n}% off</button>
                  ))}
                </div>
              </div>
              {/* Step 3 */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">3. Generated Code</label>
                <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                  <span className="font-mono text-sm font-bold text-gray-800 tracking-widest">{discountCode}</span>
                  <button onClick={copyDiscountCode} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${discountCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{discountCopied ? '✓ Copied' : 'Copy'}</button>
                </div>
                {selectedProducts.length > 0 && <p className="text-[11px] text-gray-400">Applies to: {selectedProducts.join(", ")}</p>}
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
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCollectionModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">WhatsApp Collection Share</p>
                <h3 className="text-base font-bold text-gray-900">Share Products with {buyer.name.split(" ")[0]}</h3>
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
                      {`Hi ${buyer.name.split(" ")[0]},\n\nWe thought you'd love our latest collection! 🛋️\n\n${collectionProducts.map(p => `• ${p}\n  simulafly.com/products/${p.toLowerCase().replace(/ /g, "-")}`).join("\n\n")}\n\nFeel free to ask anything.\n\nSimulaFly Store`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 shrink-0">
              {collectionProducts.length === 0 ? (
                <p className="text-center text-[12px] text-gray-400 py-2">Select at least one product to continue</p>
              ) : (
                <a href={`https://wa.me/${buyer.phone}?text=${encodeURIComponent(`Hi ${buyer.name.split(" ")[0]},\n\nWe thought you'd love our latest collection! 🛋️\n\n${collectionProducts.map(p => `• ${p}\n  simulafly.com/products/${p.toLowerCase().replace(/ /g, "-")}`).join("\n\n")}\n\nFeel free to ask anything.\n\nSimulaFly Store`)}`}
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
