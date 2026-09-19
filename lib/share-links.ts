/** Public URLs, never merchant-dashboard routes or custom app schemes. */
export const STOREFRONT_BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL || "https://merchant.simulatech.org/";

export function publicShopUrl(lookup: string, productId?: string, baseUrl = STOREFRONT_BASE_URL): string {
  const base = new URL(baseUrl);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error("Storefront sharing needs an HTTP(S) website URL");
  }
  const value = lookup.trim();
  if (!value || value === "." || value === ".." || /[\\/]/.test(value)) throw new Error("Invalid shop identifier");
  base.pathname = `${base.pathname.replace(/\/+$/, "")}/shop/${encodeURIComponent(value)}`;
  if (productId) base.searchParams.set("product", productId);
  return base.toString();
}

export function isPublicStorefrontPath(pathname: string): boolean {
  return /^\/shop\/[^/]+\/?$/.test(pathname);
}
