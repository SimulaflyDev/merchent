"use client";

import { useState } from "react";
import Image from "next/image";
import type { MerchantProductOut } from "@/lib/types/product";
import { resolveImageUrl } from "@/lib/api/image-utils";


interface Props {
  product: MerchantProductOut;
  onClose: () => void;
}

const HEALTH_CONFIG: Record<string, { label: string; cls: string; bar: string; icon: string }> = {
  good:     { label: "Healthy",  cls: "text-[#0E9F88] bg-[#F0FDF4] border-[#D1FAF0]", bar: "bg-[#0E9F88]", icon: "✓" },
  review:   { label: "Needs Review", cls: "text-amber-700 bg-amber-50 border-amber-100", bar: "bg-amber-400", icon: "⚠" },
  mismatch: { label: "Mismatch", cls: "text-red-600 bg-red-50 border-red-100", bar: "bg-red-400", icon: "✕" },
  paused:   { label: "Paused",   cls: "text-gray-500 bg-gray-50 border-gray-100", bar: "bg-gray-300", icon: "‖" },
};

export default function ProductPreviewModal({ product, onClose }: Props) {
  const [tab, setTab] = useState<"preview" | "details" | "ai">("preview");
  const [activeImage, setActiveImage] = useState(0);
  const health = HEALTH_CONFIG[product.health_score] ?? HEALTH_CONFIG.review;
  const aiScore = product.ai_relevance_score != null ? Math.round(product.ai_relevance_score) : null;
  const gallery = [product.primary_image_url, ...(product.additional_images ?? [])]
    .filter((image): image is string => Boolean(image))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F3F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(["preview", "details", "ai"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-colors ${
                    tab === t ? "bg-[#111827] text-white" : "text-gray-500 hover:text-[#111827] hover:bg-gray-100"
                  }`}
                >
                  {t === "ai" ? "AI Health" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Preview Tab ── */}
          {tab === "preview" && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left: image */}
              <div className="md:w-2/5 shrink-0 bg-[#F8FAFB] flex flex-col items-center justify-center gap-3 p-6">
                {gallery.length > 0 ? (
                  <>
                    <Image
                      src={resolveImageUrl(gallery[activeImage] ?? gallery[0])}
                      alt={`${product.title} image ${activeImage + 1}`}
                      width={720}
                      height={720}
                      unoptimized
                      className="max-w-full max-h-72 object-contain rounded-xl shadow-sm"
                    />
                    {gallery.length > 1 && (
                      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                        {gallery.map((image, index) => (
                          <button
                            key={image}
                            type="button"
                            onClick={() => setActiveImage(index)}
                            className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 ${index === activeImage ? "border-[#0E9F88]" : "border-transparent"}`}
                          >
                            <Image
                              src={resolveImageUrl(image)}
                              alt={`${product.title} thumbnail ${index + 1}`}
                              width={96}
                              height={96}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#0E9F88]">Image 1 is used for AI visualisation</p>
                  </>
                ) : (
                  <div className={`w-full max-w-[240px] aspect-square rounded-2xl bg-gradient-to-br ${gradientFor(product.sku)} flex items-center justify-center`}>
                    <svg className="w-16 h-16 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Right: SimulaFly consumer card preview */}
              <div className="flex-1 p-6">
                {/* SimulaFly tag */}
                <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 bg-[#F0FDF4] border border-[#D1FAF0] rounded-full">
                  <div className="w-4 h-4 rounded-full bg-[#0E9F88] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#0E9F88]">SimulaFly Storefront Preview</span>
                </div>

                <h2 className="text-[20px] font-bold text-[#111827] leading-tight mb-1">{product.title}</h2>
                {product.brand && <p className="text-[12px] text-gray-400 mb-3">by {product.brand}</p>}

                {product.in_app_price != null && (
                  <p className="text-[28px] font-bold text-[#111827] mb-1">
                    ₹{product.in_app_price.toLocaleString("en-IN")}
                  </p>
                )}
                {product.in_app_stock != null && (
                  <p className={`text-[11px] font-medium mb-4 ${product.in_app_stock > 0 ? "text-[#0E9F88]" : "text-red-500"}`}>
                    {product.in_app_stock > 0 ? `${product.in_app_stock} in stock` : "Out of stock"}
                  </p>
                )}

                {product.description && (
                  <p className="text-[13px] text-gray-600 leading-relaxed mb-5 line-clamp-4">{product.description}</p>
                )}

                {/* Category + tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {product.category && (
                    <span className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{product.category}</span>
                  )}
                  {product.subcategory && (
                    <span className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{product.subcategory}</span>
                  )}
                  {Object.entries(product.colors).filter(([k]) => k !== "secondary").map(([, v]) => typeof v === "string" && v && (
                    <span key={v} className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{v}</span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2">
                  {product.has_simulafly_listing && (
                    <div className="flex items-center gap-2 p-3 bg-[#111827] text-white rounded-xl text-[12px] font-semibold">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      Buy on SimulaFly
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ── Details Tab ── */}
          {tab === "details" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="SKU" value={product.sku} mono />
                <InfoBlock label="Status" value={product.status.replace(/_/g, " ")} />
                <InfoBlock label="Category" value={product.category ?? "—"} />
                <InfoBlock label="Subcategory" value={product.subcategory ?? "—"} />
                <InfoBlock label="Brand" value={product.brand ?? "—"} />
                <InfoBlock label="Price" value={product.in_app_price != null ? `₹${product.in_app_price.toLocaleString("en-IN")}` : "—"} />
                <InfoBlock label="Stock" value={product.in_app_stock != null ? String(product.in_app_stock) : "—"} />
                <InfoBlock label="SimulaFly Listing" value={product.has_simulafly_listing ? "Yes" : "No"} />
              </div>

              {product.description && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{product.description}</p>
                </div>
              )}

              {Object.keys(product.dimensions).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Dimensions</p>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(product.dimensions).filter(([, v]) => v != null).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 capitalize mb-1">{k}</p>
                        <p className="text-[13px] font-semibold text-[#111827]">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(product.materials).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Materials</p>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(product.materials).filter(([, v]) => v != null).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 capitalize mb-1">{k.replace(/_/g, " ")}</p>
                        <p className="text-[13px] font-semibold text-[#111827]">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            </div>
          )}

          {/* ── AI Health Tab ── */}
          {tab === "ai" && (
            <div className="p-6 space-y-6">
              {/* Score hero */}
              <div className={`flex items-start gap-4 p-5 rounded-2xl border ${health.cls}`}>
                <div className="text-[28px] leading-none">{health.icon}</div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold mb-1">AI Status: {health.label}</p>
                  {product.health_reason && (
                    <p className="text-[12px] opacity-80 leading-relaxed">{product.health_reason}</p>
                  )}
                </div>
              </div>

              {/* AI relevance score */}
              {aiScore != null && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[12px] font-semibold text-[#111827]">AI Relevance Score</p>
                    <p className="text-[13px] font-bold text-[#111827]">{aiScore}/100</p>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${health.bar}`}
                      style={{ width: `${aiScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {aiScore >= 80 ? "Excellent — highly likely to appear in AI recommendations"
                     : aiScore >= 60 ? "Good — products above 80 appear more frequently"
                     : aiScore >= 40 ? "Fair — add more details to improve AI matching"
                     : "Low — consider adding description, dimensions and materials"}
                  </p>
                </div>
              )}

              {/* What improves score */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">What helps AI matching</p>
                <div className="space-y-2">
                  {[
                    { done: !!product.description && product.description.length >= 30, text: "Description ≥ 30 characters" },
                    { done: !!product.category, text: "Category assigned" },
                    { done: !!product.brand, text: "Brand name set" },
                    { done: !!product.primary_image_url, text: "Primary image uploaded" },
                    { done: Object.keys(product.dimensions).length > 0, text: "Dimensions filled in" },
                    { done: Object.keys(product.materials).length > 0, text: "Materials specified" },
                    { done: product.has_simulafly_listing, text: "SimulaFly in-app listing active" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 px-3 bg-gray-50 rounded-xl">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-[#0E9F88]" : "bg-gray-200"}`}>
                        {item.done
                          ? <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        }
                      </div>
                      <span className={`text-[12px] ${item.done ? "text-gray-600" : "text-gray-400"}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room storytelling */}
              {Object.keys(product.room_storytelling).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Room Storytelling</p>
                  <div className="grid grid-cols-2 gap-3">
                    {product.room_storytelling.best_used_in && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 mb-1">Best Used In</p>
                        <p className="text-[12px] font-medium text-[#111827]">{product.room_storytelling.best_used_in as string}</p>
                      </div>
                    )}
                    {product.room_storytelling.mood && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 mb-1">Mood</p>
                        <p className="text-[12px] font-medium text-[#111827]">{product.room_storytelling.mood as string}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F1F3F5] flex justify-between items-center shrink-0 bg-[#FAFBFC]">
          <p className="text-[10px] text-gray-400">
            Last updated {new Date(product.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium bg-white border border-[#EAECEF] text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[13px] font-semibold text-[#111827] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function gradientFor(sku: string) {
  const GRADIENTS = [
    "from-violet-200 to-purple-300",
    "from-amber-200 to-orange-300",
    "from-sky-200 to-blue-300",
    "from-emerald-200 to-teal-300",
    "from-rose-200 to-pink-300",
    "from-lime-200 to-green-300",
  ];
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}
