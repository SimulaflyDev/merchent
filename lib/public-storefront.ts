import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";

export interface PublicShop {
  id: string;
  slug: string;
  display_name: string;
  legal_name: string;
  address: string | null;
  support_phone: string | null;
  support_email: string | null;
  logo_url: string | null;
  storefront?: { description?: string | null; tagline?: string | null };
}

export interface PublicProduct {
  id: string;
  merchant_id: string;
  title: string;
  description: string | null;
  category: string | null;
  primary_image_url: string | null;
  in_app_price: number | string | null;
  in_app_stock: number | null;
  status: string;
  has_simulafly_listing: boolean;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.simulatech.org/api/v1").replace(/\/+$/, "");

async function publicJson<T>(path: string): Promise<T> {
  // Deliberately do not use the authenticated merchant API client: only
  // existing public endpoints, no cookies, tokens or merchant headers.
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if ([400, 404].includes(response.status)) notFound();
  if (!response.ok) throw new Error("The shop is temporarily unavailable. Please try again.");
  return response.json() as Promise<T>;
}

export const loadPublicStorefront = cache(async (lookup: string, productId?: string) => {
  if (!lookup.trim() || lookup.length > 120 || /[\\/]/.test(lookup) || [".", ".."].includes(lookup)) notFound();
  const path = `/merchants/public/${encodeURIComponent(lookup)}`;
  const [shop, catalog] = await Promise.all([
    publicJson<PublicShop>(path), publicJson<PublicProduct[]>(`${path}/products`),
  ]);
  const products = catalog.filter((p) => p.merchant_id === shop.id && p.status === "published" && p.has_simulafly_listing);
  const selected = productId ? products.find((p) => p.id === productId) : undefined;
  if (productId && !selected) notFound();
  return { shop, products, selected };
});

export function publicImageUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, `${new URL(API_BASE).origin}/`);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : undefined;
  } catch { return undefined; }
}

export function displayPrice(price: PublicProduct["in_app_price"]): string {
  if (price == null || !Number.isFinite(Number(price))) return "Contact shop for price";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(price));
}
