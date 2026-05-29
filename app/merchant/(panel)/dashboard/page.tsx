import { getAnalyticsSummary, listProductPerformance } from "@/lib/api/analytics";
import { listLeads } from "@/lib/api/leads";
import { listProducts } from "@/lib/api/products";
import { getWallet } from "@/lib/api/wallet";
import { adaptLead } from "@/lib/types/lead";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [summary, productPerf, leadsData, productsData, wallet] = await Promise.all([
    getAnalyticsSummary(30).catch(() => ({
      total_products: 0,
      published_products: 0,
      impressions: 0,
      clicks: 0,
      ai_mentions: 0,
      ai_image_generations: 0,
      external_redirects: 0,
      total_spend: 0,
      ctr: 0,
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    })),
    listProductPerformance(30).catch(() => ({ items: [], start_date: "", end_date: "" })),
    listLeads({ limit: 5 }).catch(() => ({ items: [], total: 0, limit: 5, offset: 0 })),
    listProducts({ status: "published", limit: 12 }).catch(() => ({ items: [], total: 0, limit: 12, offset: 0 })),
    getWallet().catch(() => ({ balance: 0, currency: "INR", status: "active" as const, low_balance_threshold: 200, last_recharged_at: null, id: "", merchant_id: "", created_at: "", updated_at: "" })),
  ]);

  // Merge product performance with product details
  const productMap = Object.fromEntries(productsData.items.map((p) => [p.id, p]));
  const topProducts = productPerf.items
    .filter((r) => productMap[r.product_id])
    .slice(0, 4)
    .map((r) => ({
      id: r.product_id,
      title: r.title,
      category: productMap[r.product_id]?.category ?? null,
      price: productMap[r.product_id]?.in_app_price ?? null,
      image: productMap[r.product_id]?.primary_image_url ?? null,
      ai_mentions: r.ai_mentions,
      clicks: r.clicks,
      spend: r.spend,
    }));

  // Convert leads to UI shape
  const recentLeads = leadsData.items.map(adaptLead);

  // Sum estimated pipeline value across all recent leads
  const pipelineValue = leadsData.items.reduce((s, l) => s + Number(l.estimated_value), 0);

  return (
    <DashboardClient
      analyticsSnapshot={{
        external_redirects: summary.external_redirects,
        ai_mentions: summary.ai_mentions,
        ai_image_generations: summary.ai_image_generations,
        impressions: summary.impressions,
        clicks: summary.clicks,
        total_spend: summary.total_spend,
        published_products: summary.published_products,
        total_products: summary.total_products,
        ctr: summary.ctr,
      }}
      topProducts={topProducts}
      recentLeads={recentLeads}
      totalLeads={leadsData.total}
      pipelineValue={pipelineValue}
      walletBalance={Number(wallet.balance)}
      walletStatus={wallet.status}
      walletCurrency={wallet.currency}
    />
  );
}
