import { listProducts } from "@/lib/api/products";
import type { ProductStatus } from "@/lib/types/product";
import ProductsClient from "./ProductsClient";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; offset?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status as ProductStatus | undefined) ?? undefined;
  const search = sp.search ?? undefined;
  const offset = sp.offset ? Number(sp.offset) : 0;

  // Fetch counts from the unfiltered list (capped at 100 for API limit safety)
  const countsData = await listProducts({ search, limit: 100 });

  const counts = {
    all: countsData.total,
    draft: countsData.items.filter(p => p.status === "draft").length,
    published: countsData.items.filter(p => p.status === "published" || p.status === "paused_insufficient_funds").length,
    archived: countsData.items.filter(p => p.status === "archived").length,
  };

  const data = await listProducts({ status, search, offset, limit: 20 });

  return (
    <ProductsClient
      initialData={data}
      initialStatus={status ?? "all"}
      initialSearch={search ?? ""}
      counts={counts}
    />
  );
}
