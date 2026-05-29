export interface AnalyticsSummary {
  total_products: number;
  published_products: number;
  impressions: number;
  clicks: number;
  ai_mentions: number;
  ai_image_generations: number;
  external_redirects: number;
  total_spend: number;
  ctr: number;
  start_date: string;
  end_date: string;
}

export interface ProductPerformanceRow {
  product_id: string;
  title: string;
  sku: string;
  status: string;
  impressions: number;
  clicks: number;
  ai_mentions: number;
  ai_image_generations: number;
  external_redirects: number;
  spend: number;
  ctr: number;
  health_score: string;
}

export interface ProductPerformanceList {
  items: ProductPerformanceRow[];
  start_date: string;
  end_date: string;
}

export interface RagQueryStat {
  query: string;
  count: number;
}

export interface ProductAnalyticsDetail {
  product_id: string;
  title: string;
  sku: string;
  status: string;
  impressions: number;
  clicks: number;
  ai_mentions: number;
  ai_image_generations: number;
  external_redirects: number;
  spend: number;
  ctr: number;
  health_score: string;
  health_reason: string | null;
  ai_relevance_score: number | null;
  top_rag_queries: RagQueryStat[];
  daily_impressions: number[];
  daily_clicks: number[];
}

export type DiagnosticIssueType = "zero_click" | "low_ai_relevance" | "missing_metadata";

export interface DiagnosticAlert {
  product_id: string;
  title: string;
  issue_type: DiagnosticIssueType;
  detail: string;
}

export interface DiagnosticsResponse {
  alerts: DiagnosticAlert[];
}
