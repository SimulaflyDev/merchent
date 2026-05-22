import { notFound } from "next/navigation";

import { getProductAnalytics } from "@/lib/api/analytics";
import { isApiError } from "@/lib/api/errors";
import ProductAnalyticsView from "./ProductAnalyticsView";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductAnalyticsPage({ params }: PageProps) {
  const { productId } = await params;

  let data;
  try {
    data = await getProductAnalytics(productId);
  } catch (err) {
    if (isApiError(err) && err.status === 404) notFound();
    throw err;
  }

  return <ProductAnalyticsView detail={data} />;
}
