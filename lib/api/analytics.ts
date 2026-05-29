import "server-only";
import { api } from "./client";
import type {
  AnalyticsSummary,
  ProductPerformanceList,
  ProductAnalyticsDetail,
  DiagnosticsResponse,
} from "@/lib/types/analytics";

export async function getAnalyticsSummary(days: number = 30): Promise<AnalyticsSummary> {
  return api(`/merchant/analytics/summary?days=${days}`);
}

export async function listProductPerformance(days: number = 30): Promise<ProductPerformanceList> {
  return api(`/merchant/analytics/products?days=${days}`);
}

export async function getProductAnalytics(productId: string): Promise<ProductAnalyticsDetail> {
  return api(`/merchant/analytics/products/${productId}`);
}

export async function getDiagnostics(): Promise<DiagnosticsResponse> {
  return api(`/merchant/analytics/diagnostics`);
}
