import { getAnalyticsSummary, listProductPerformance, getDiagnostics } from "@/lib/api/analytics";
import AnalyticsClient from "./AnalyticsClient";

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const days = sp.days ? Number(sp.days) : 30;

  const [summary, products, diagnostics] = await Promise.all([
    getAnalyticsSummary(days),
    listProductPerformance(days),
    getDiagnostics(),
  ]);

  return (
    <AnalyticsClient
      summary={summary}
      products={products}
      diagnostics={diagnostics}
      days={days}
    />
  );
}
