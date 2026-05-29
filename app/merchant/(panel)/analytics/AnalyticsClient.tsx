"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type {
  AnalyticsSummary,
  ProductPerformanceList,
  DiagnosticsResponse,
  DiagnosticIssueType,
} from "@/lib/types/analytics";

interface Props {
  summary: AnalyticsSummary;
  products: ProductPerformanceList;
  diagnostics: DiagnosticsResponse;
  days: number;
}

const ISSUE_LABELS: Record<DiagnosticIssueType, string> = {
  zero_click: "Zero clicks",
  low_ai_relevance: "Low AI relevance",
  missing_metadata: "Missing metadata",
};

export default function AnalyticsClient({ summary, products, diagnostics, days }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const setDays = (next: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("days", String(next));
    router.push(`/merchant/analytics?${params.toString()}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827]">Analytics</h1>
        <div className="flex gap-2 text-sm">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-md ${
                days === d
                  ? "bg-[#0E9F88] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary KPI grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Impressions" value={summary.impressions.toLocaleString("en-IN")} />
        <Kpi label="Clicks" value={summary.clicks.toLocaleString("en-IN")} />
        <Kpi label="CTR" value={`${(summary.ctr * 100).toFixed(2)}%`} />
        <Kpi label="Spend" value={`₹${summary.total_spend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
        <Kpi label="AI mentions" value={summary.ai_mentions.toLocaleString("en-IN")} />
        <Kpi label="AI img gens" value={summary.ai_image_generations.toLocaleString("en-IN")} />
        <Kpi label="External redirects" value={summary.external_redirects.toLocaleString("en-IN")} />
        <Kpi label="Published" value={`${summary.published_products}/${summary.total_products}`} />
      </div>

      {/* ── Diagnostics ── */}
      {diagnostics.alerts.length > 0 && (
        <section className="bg-white rounded-xl border border-[#E2E4E8] p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Diagnostics ({diagnostics.alerts.length})
          </h2>
          <ul className="space-y-2">
            {diagnostics.alerts.slice(0, 10).map((alert, idx) => (
              <li key={`${alert.product_id}-${idx}`} className="flex items-start gap-3 text-sm">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-medium shrink-0">
                  {ISSUE_LABELS[alert.issue_type]}
                </span>
                <span className="text-gray-700">
                  <Link
                    href={`/merchant/analytics/${alert.product_id}`}
                    className="font-medium hover:underline"
                  >
                    {alert.title}
                  </Link>{" "}
                  — {alert.detail}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Product performance matrix ── */}
      <section className="bg-white rounded-xl border border-[#E2E4E8] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Product performance ({products.items.length})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium text-right">Impressions</th>
              <th className="px-4 py-3 font-medium text-right">Clicks</th>
              <th className="px-4 py-3 font-medium text-right">CTR</th>
              <th className="px-4 py-3 font-medium text-right">AI mentions</th>
              <th className="px-4 py-3 font-medium text-right">Spend</th>
            </tr>
          </thead>
          <tbody>
            {products.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No data yet. Events accumulate as buyers interact in the consumer app.
                </td>
              </tr>
            )}
            {products.items.map((row) => (
              <tr key={row.product_id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/merchant/analytics/${row.product_id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {row.title}
                  </Link>
                  <div className="text-xs text-gray-500 font-mono">{row.sku}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.impressions.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.clicks.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {(row.ctr * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.ai_mentions.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  ₹{row.spend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E4E8] p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold text-[#111827] tabular-nums mt-1">{value}</div>
    </div>
  );
}
