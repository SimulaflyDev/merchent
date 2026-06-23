"use client";

import Link from "next/link";

import type { ProductAnalyticsDetail } from "@/lib/types/analytics";

interface Props {
  detail: ProductAnalyticsDetail;
}

export default function ProductAnalyticsView({ detail }: Props) {
  const maxImps = Math.max(...detail.daily_impressions, 1);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link
          href="/merchant/analytics"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← All analytics
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#111827]">{detail.title}</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{detail.sku}</p>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Impressions (30d)" value={detail.impressions.toLocaleString("en-IN")} />
        <Kpi label="Clicks" value={detail.clicks.toLocaleString("en-IN")} />
        <Kpi label="CTR" value={`${(detail.ctr * 100).toFixed(2)}%`} />
        <Kpi label="AI mentions" value={detail.ai_mentions.toLocaleString("en-IN")} />
        <Kpi label="AI img gens" value={detail.ai_image_generations.toLocaleString("en-IN")} />
        <Kpi label="External redirects" value={detail.external_redirects.toLocaleString("en-IN")} />
        <Kpi
          label="Spend (30d)"
          value={`₹${detail.spend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        />
        <Kpi
          label="AI relevance"
          value={detail.ai_relevance_score != null ? `${detail.ai_relevance_score.toFixed(0)}/100` : "—"}
        />
      </div>

      {/* ── Health alert ── */}
      {detail.health_reason && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <strong>Health note:</strong> {detail.health_reason}
        </div>
      )}

      {/* ── Daily sparkline (text-only for Phase 4) ── */}
      <section className="bg-white rounded-xl border border-[#E2E4E8] p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Last 7 days (impressions / clicks)
        </h2>
        <div className="space-y-1 font-mono text-xs">
          {detail.daily_impressions.map((imp, idx) => {
            const bar = "▓".repeat(Math.max(0, Math.round((imp / maxImps) * 30)));
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-gray-500 w-12">Day -{6 - idx}</span>
                <span className="text-[#0E9F88]">{bar || "·"}</span>
                <span className="text-gray-700">
                  {imp} imps · {detail.daily_clicks[idx]} clicks
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Top RAG queries ── */}
      <section className="bg-white rounded-xl border border-[#E2E4E8] p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Top AI queries surfacing this product
        </h2>
        {detail.top_rag_queries.length === 0 ? (
          <p className="text-sm text-gray-400">
            No AI mentions in the last 30 days. Ensure description + metadata are detailed.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 text-xs">
              <tr>
                <th className="py-1 font-medium">Query</th>
                <th className="py-1 font-medium text-right">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {detail.top_rag_queries.map((q, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="py-2 text-gray-700">{q.query || "—"}</td>
                  <td className="py-2 text-right tabular-nums">{q.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
