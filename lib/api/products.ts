import "server-only";
import { api } from "./client";
import type {
  MerchantProductOut,
  MerchantProductCreatePayload,
  MerchantProductUpdatePayload,
  PaginatedProducts,
  ProductStatus,

} from "@/lib/types/product";

export interface ListProductsParams {
  status?: ProductStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listProducts(p: ListProductsParams = {}): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  if (p.status) qs.set("status", p.status);
  if (p.search) qs.set("search", p.search);
  if (p.limit != null) qs.set("limit", String(p.limit));
  if (p.offset != null) qs.set("offset", String(p.offset));
  const q = qs.toString();
  return api<PaginatedProducts>(`/merchant/products/${q ? `?${q}` : ""}`);
}

export async function getProduct(id: string): Promise<MerchantProductOut> {
  return api<MerchantProductOut>(`/merchant/products/${id}`);
}

export async function createProduct(
  payload: MerchantProductCreatePayload,
): Promise<MerchantProductOut> {
  return api<MerchantProductOut>("/merchant/products/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: string,
  payload: MerchantProductUpdatePayload,
): Promise<MerchantProductOut> {
  return api<MerchantProductOut>(`/merchant/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archiveProduct(id: string): Promise<void> {
  return api<void>(`/merchant/products/${id}`, { method: "DELETE" });
}

export async function publishProduct(id: string): Promise<MerchantProductOut> {
  return api<MerchantProductOut>(`/merchant/products/${id}/publish`, { method: "POST" });
}


