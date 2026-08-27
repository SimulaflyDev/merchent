"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import type { MerchantProductOut, PaginatedProducts, ProductStatus } from "@/lib/types/product";
import { archiveProductAction, publishProductAction } from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";
import ProductEditModal from "./ProductEditModal";
import ProductPreviewModal from "./ProductPreviewModal";
import { useMerchant } from "@/app/merchant/context/MerchantContext";
import ShareCatalogModal from "./ShareCatalogModal";
import { resolveImageUrl } from "@/lib/api/image-utils";

interface Props {
  initialData: PaginatedProducts;
  initialStatus: string;
  initialSearch: string;
  counts: {
    all: number;
    draft: number;
    published: number;
    archived: number;
  };
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Live" },
  { value: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<ProductStatus, { label: string; cls: string; dot: string }> = {
  draft:                    { label: "Draft",   cls: "bg-gray-100 text-gray-600",    dot: "bg-gray-400" },
  published:                { label: "Live",    cls: "bg-[#F0FDF4] text-[#0E9F88]", dot: "bg-[#0E9F88]" },
  paused_insufficient_funds:{ label: "Paused",  cls: "bg-amber-50 text-amber-700",   dot: "bg-amber-400" },
  archived:                 { label: "Archived",cls: "bg-red-50 text-red-500",       dot: "bg-red-400" },
};

const HEALTH_BADGE: Record<string, { label: string; cls: string }> = {
  good:      { label: "Healthy",  cls: "text-[#0E9F88]" },
  review:    { label: "Review",   cls: "text-amber-600" },
  mismatch:  { label: "Mismatch", cls: "text-red-500" },
  paused:    { label: "Paused",   cls: "text-gray-400" },
};

// Gradient backgrounds for products without images
const GRADIENTS = [
  "from-violet-100 to-purple-200",
  "from-amber-100 to-orange-200",
  "from-sky-100 to-blue-200",
  "from-emerald-100 to-teal-200",
  "from-rose-100 to-pink-200",
  "from-lime-100 to-green-200",
  "from-indigo-100 to-violet-200",
  "from-orange-100 to-red-200",
];

function gradientFor(sku: string) {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function ProductsClient({ initialData, initialStatus, initialSearch, counts }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const { merchant } = useMerchant();
  const onboardingCompleted = merchant?.settings?.onboarding_completed === true;
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [editingProduct, setEditingProduct] = useState<MerchantProductOut | null>(null);
  const [previewProduct, setPreviewProduct] = useState<MerchantProductOut | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const applyFilters = (next: { status?: string; search?: string }) => {
    const params = new URLSearchParams(sp.toString());
    if (next.status !== undefined) {
      if (next.status === "all") params.delete("status"); else params.set("status", next.status);
    }
    if (next.search !== undefined) {
      if (!next.search) params.delete("search"); else params.set("search", next.search);
    }
    params.delete("offset");
    router.push(`/merchant/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handlePublish = (id: string) => {
    setActionError(null);
    const prod = initialData.items.find((p) => p.id === id);
    if (prod) {
      const missingFields: string[] = [];
      if (!prod.title?.trim()) missingFields.push("Product Title");
      if (!prod.sku?.trim()) missingFields.push("SKU");
      if (prod.in_app_price == null) missingFields.push("Price");
      if (!prod.category?.trim()) missingFields.push("Category");
      if (!prod.subcategory?.trim()) missingFields.push("Subcategory");
      if (!prod.brand?.trim()) missingFields.push("Brand");
      if (prod.in_app_stock == null) missingFields.push("Stock Quantity");
      if (!prod.description?.trim()) missingFields.push("Description");
      if (!prod.primary_image_url) missingFields.push("Product Image");

      if (missingFields.length > 0) {
        setActionError(`Cannot publish product. The following fields are required: ${missingFields.join(", ")}`);
        return;
      }
    }

    startTransition(async () => {
      try { await callAction(publishProductAction(id)); router.refresh(); }
      catch (err) { setActionError(isApiError(err) ? err.detail : "Failed to publish"); }
    });
  };

  const handleArchive = (id: string) => {
    if (!confirm("Archive this product? It will stop appearing to shoppers.")) return;
    setActionError(null);
    startTransition(async () => {
      try { await callAction(archiveProductAction(id)); router.refresh(); }
      catch (err) { setActionError(isApiError(err) ? err.detail : "Failed to archive"); }
    });
  };

  const statusCounts = initialData.items.reduce(
    (acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Products</h1>
          <p className="text-[12px] text-gray-400 mt-1">
            {initialData.total} product{initialData.total !== 1 ? "s" : ""} in your catalogue
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          {/* View toggle */}
          <div className="flex bg-[#F1F2F4] rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-[#111827]" : "text-gray-400 hover:text-gray-600"}`}
              title="Grid view"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-[#111827]" : "text-gray-400 hover:text-gray-600"}`}
              title="List view"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShareModalOpen(true)}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#EAECEF] bg-white px-3 text-[12px] font-medium text-gray-700 transition-colors hover:border-gray-300 sm:flex-none sm:px-4"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share Storefront
          </button>

          <Link
            href={onboardingCompleted ? "/merchant/products/add" : "/merchant/onboarding"}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#111827] px-3 text-[12px] font-medium text-white transition-colors hover:bg-black sm:flex-none sm:px-4"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Onboarding Incomplete Banner */}
      {!onboardingCompleted && (
        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-[13px] font-bold text-amber-900">Finish Store Setup to Add Products</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">Your showroom profile and legal verification must be completed before you can manage products.</p>
            </div>
          </div>
          <Link
            href="/merchant/onboarding"
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-center text-[11px] font-bold text-white shadow-sm transition-all hover:bg-amber-700"
          >
            Resume Setup
          </Link>
        </div>
      )}

      {/* Status tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-1">
        {STATUS_OPTIONS.map((opt) => {
          const count = opt.value === "all" ? counts.all : (counts[opt.value as keyof typeof counts] ?? 0);
          const active = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); applyFilters({ status: opt.value }); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                active ? "bg-[#111827] text-white" : "bg-white border border-[#EAECEF] text-gray-500 hover:text-[#111827] hover:border-gray-300"
              }`}
            >
              {opt.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Search */}
        <div className="relative mt-2 w-full sm:ml-auto sm:mt-0 sm:w-auto">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <form onSubmit={(e) => { e.preventDefault(); applyFilters({ search: searchValue }); }}>
            <input
              type="text"
              placeholder="Search title or SKU…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-lg border border-[#EAECEF] bg-white py-2 pl-9 pr-4 text-[12px] text-gray-700 placeholder-gray-400 transition-all focus:border-[#0E9F88] focus:outline-none focus:ring-1 focus:ring-[#0E9F88] sm:w-64"
            />
          </form>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {actionError}
        </div>
      )}

      {/* Empty state */}
      {initialData.items.length === 0 && (
        <div className="bg-white border border-[#EAECEF] rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#111827] mb-1">No products yet</h3>
          <p className="text-[12px] text-gray-400 mb-5 max-w-xs">
            Add your first product to start appearing in SimulaFly shopper searches and AI recommendations.
          </p>
          <Link href={onboardingCompleted ? "/merchant/products/add" : "/merchant/onboarding"} className="px-5 py-2.5 bg-[#111827] text-white text-[12px] font-medium rounded-lg hover:bg-black transition-colors">
            {onboardingCompleted ? "Add your first product" : "Complete setup to add product"}
          </Link>
        </div>
      )}

      {/* Grid view */}
      {viewMode === "grid" && initialData.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {initialData.items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              pending={pending}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onEdit={setEditingProduct}
              onPreview={setPreviewProduct}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && initialData.items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[#EAECEF] bg-white">
          <div className="min-w-[760px]">
          {/* List header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#FAFBFC] border-b border-[#F1F3F5] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1 text-right">Price</div>
            <div className="col-span-1 text-center">Stock</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-[#F5F6F8]">
            {initialData.items.map((p) => (
              <ProductListRow
                key={p.id}
                product={p}
                pending={pending}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onEdit={setEditingProduct}
                onPreview={setPreviewProduct}
              />
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { setEditingProduct(null); router.refresh(); }}
        />
      )}
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}
      {shareModalOpen && merchant && (
        <ShareCatalogModal
          merchant={merchant}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}

// ── Product Card (Grid View) ──────────────────────────────────────────────────

function ProductCard({
  product, pending, onPublish, onArchive, onEdit, onPreview,
}: {
  product: MerchantProductOut;
  pending: boolean;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (p: MerchantProductOut) => void;
  onPreview: (p: MerchantProductOut) => void;
}) {
  const status = STATUS_BADGE[product.status];
  const health = HEALTH_BADGE[product.health_score] ?? HEALTH_BADGE.review;
  const grad = gradientFor(product.sku);

  return (
    <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group flex flex-col">
      {/* Thumbnail */}
      <div
        className="relative cursor-pointer"
        onClick={() => onPreview(product)}
      >
        {product.primary_image_url ? (
          <img
            src={resolveImageUrl(product.primary_image_url)}
            alt={product.title}
            className="w-full h-44 object-cover"
          />
        ) : (
          <div className={`w-full h-44 bg-gradient-to-br ${grad} flex items-center justify-center`}>
            <svg className="w-10 h-10 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        {/* Preview hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 text-[#111827] text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-sm">
            Preview
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-[13px] font-semibold text-[#111827] leading-tight mb-0.5 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-[11px] text-gray-400 font-mono mb-2">{product.sku}</p>
          <div className="flex items-center justify-between">
            {product.in_app_price != null ? (
              <span className="text-[14px] font-bold text-[#111827]">
                ₹{product.in_app_price.toLocaleString("en-IN")}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400">No price set</span>
            )}
            {product.category && (
              <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
            )}
          </div>
          {product.in_app_stock != null && (
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-[11px] font-medium ${product.in_app_stock > 0 ? "text-[#0E9F88]" : "text-red-500"}`}>
                {product.in_app_stock > 0 ? `${product.in_app_stock} available` : "Out of stock"}
              </span>
            </div>
          )}
        </div>

        {/* AI health indicator */}
        <div className="mt-3 pt-3 border-t border-[#F5F6F8] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className={`text-[10px] font-semibold ${health.cls}`}>{health.label}</span>
            {product.ai_relevance_score != null && (
              <span className="text-[10px] text-gray-400">· {Math.round(product.ai_relevance_score)}/100</span>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            {/* Preview */}
            <button
              onClick={() => onPreview(product)}
              disabled={pending}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-[#F0FDF4] hover:text-[#0E9F88] transition-colors disabled:opacity-50"
              title="Preview"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            {/* Edit */}
            <button
              onClick={() => onEdit(product)}
              disabled={pending}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#111827] transition-colors disabled:opacity-50"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            {(product.status === "draft" || product.status === "archived") && (
              <button
                onClick={() => onPublish(product.id)}
                disabled={pending}
                className="p-1.5 rounded-lg text-[#0E9F88] hover:bg-[#F0FDF4] transition-colors disabled:opacity-50"
                title="Publish"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            )}
            {product.status !== "archived" && (
              <button
                onClick={() => onArchive(product.id)}
                disabled={pending}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Archive"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product List Row ──────────────────────────────────────────────────────────

function ProductListRow({
  product, pending, onPublish, onArchive, onEdit, onPreview,
}: {
  product: MerchantProductOut;
  pending: boolean;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (p: MerchantProductOut) => void;
  onPreview: (p: MerchantProductOut) => void;
}) {
  const status = STATUS_BADGE[product.status];
  const grad = gradientFor(product.sku);

  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-[#FAFBFC] transition-colors group">
      {/* Product */}
      <div className="col-span-4 flex items-center gap-3">
        <div
          className="shrink-0 w-12 h-12 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => onPreview(product)}
        >
          {product.primary_image_url ? (
            <img src={resolveImageUrl(product.primary_image_url)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${grad}`} />
          )}
        </div>
        <div className="min-w-0">
          <p
            className="text-[13px] font-semibold text-[#111827] truncate cursor-pointer group-hover:text-[#0E9F88] transition-colors"
            onClick={() => onPreview(product)}
          >
            {product.title}
          </p>
          <p className="text-[11px] font-mono text-gray-400">{product.sku}</p>
        </div>
      </div>

      {/* Category */}
      <div className="col-span-2">
        <span className="text-[12px] text-gray-500">{product.category ?? "—"}</span>
      </div>

      {/* Price */}
      <div className="col-span-1 text-right">
        <span className="text-[13px] font-semibold text-[#111827]">
          {product.in_app_price != null ? `₹${product.in_app_price.toLocaleString("en-IN")}` : "—"}
        </span>
      </div>

      {/* Stock */}
      <div className="col-span-1 text-center">
        <span className="text-[12px] text-gray-500">
          {product.in_app_stock != null ? product.in_app_stock : "—"}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-2 flex justify-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          onClick={() => onPreview(product)}
          disabled={pending}
          className="px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={() => onEdit(product)}
          disabled={pending}
          className="px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Edit
        </button>
        {(product.status === "draft" || product.status === "archived") && (
          <button
            onClick={() => onPublish(product.id)}
            disabled={pending}
            className="px-2.5 py-1.5 text-[11px] font-medium text-[#0E9F88] hover:bg-[#F0FDF4] rounded-lg transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        )}
        {product.status !== "archived" && (
          <button
            onClick={() => onArchive(product.id)}
            disabled={pending}
            className="px-2.5 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}
