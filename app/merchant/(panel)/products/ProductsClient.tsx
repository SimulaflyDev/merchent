"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import type { MerchantProductOut, PaginatedProducts, ProductStatus } from "@/lib/types/product";
import {
  archiveProductAction,
  publishProductAction,
} from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";

interface Props {
  initialData: PaginatedProducts;
  initialStatus: string;
  initialSearch: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "paused_insufficient_funds", label: "Paused (low balance)" },
  { value: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<ProductStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  paused_insufficient_funds: "bg-amber-100 text-amber-800",
  archived: "bg-red-50 text-red-600",
};

export default function ProductsClient({ initialData, initialStatus, initialSearch }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchValue, setSearchValue] = useState(initialSearch);

  const applyFilters = (next: { status?: string; search?: string }) => {
    const params = new URLSearchParams(sp.toString());
    if (next.status !== undefined) {
      if (next.status === "all") params.delete("status");
      else params.set("status", next.status);
    }
    if (next.search !== undefined) {
      if (!next.search) params.delete("search");
      else params.set("search", next.search);
    }
    params.delete("offset");
    router.push(`/merchant/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handlePublish = (id: string) => {
    setActionError(null);
    startTransition(async () => {
      try {
        await publishProductAction(id);
        router.refresh();
      } catch (err) {
        setActionError(isApiError(err) ? err.detail : "Failed to publish");
      }
    });
  };

  const handleArchive = (id: string) => {
    if (!confirm("Archive this product? It will no longer appear in the consumer app.")) return;
    setActionError(null);
    startTransition(async () => {
      try {
        await archiveProductAction(id);
        router.refresh();
      } catch (err) {
        setActionError(isApiError(err) ? err.detail : "Failed to archive");
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{initialData.total} total</p>
        </div>
        <Link
          href="/merchant/products/add"
          className="px-4 py-2 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69]"
        >
          Add Product
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            applyFilters({ status: e.target.value });
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <form
          className="flex gap-2 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters({ search: searchValue });
          }}
        >
          <input
            type="text"
            placeholder="Search by title or SKU"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Search
          </button>
        </form>
      </div>

      {actionError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E4E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No products yet.{" "}
                  <Link href="/merchant/products/add" className="text-[#0E9F88] underline">
                    Add your first product
                  </Link>
                  .
                </td>
              </tr>
            )}
            {initialData.items.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                pending={pending}
                onPublish={handlePublish}
                onArchive={handleArchive}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  pending,
  onPublish,
  onArchive,
}: {
  product: MerchantProductOut;
  pending: boolean;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.primary_image_url ? (
            <img
              src={product.primary_image_url}
              alt=""
              className="w-10 h-10 rounded-md object-cover bg-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100" />
          )}
          <div className="font-medium text-gray-900">{product.title}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{product.sku}</td>
      <td className="px-4 py-3 text-gray-600">{product.category ?? "—"}</td>
      <td className="px-4 py-3 text-gray-600">
        {product.in_app_price != null ? `₹${product.in_app_price.toLocaleString("en-IN")}` : "—"}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {product.in_app_stock != null ? product.in_app_stock : "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[product.status]}`}
        >
          {product.status.replace(/_/g, " ")}
        </span>
      </td>
      <td className="px-4 py-3 text-right space-x-2">
        {product.status === "draft" && (
          <button
            onClick={() => onPublish(product.id)}
            disabled={pending}
            className="text-[#0E9F88] hover:underline disabled:opacity-50"
          >
            Publish
          </button>
        )}
        {product.status !== "archived" && (
          <button
            onClick={() => onArchive(product.id)}
            disabled={pending}
            className="text-red-500 hover:underline disabled:opacity-50"
          >
            Archive
          </button>
        )}
      </td>
    </tr>
  );
}
