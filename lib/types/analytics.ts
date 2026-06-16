export interface DailyMetric {
  date: string;
  spend: number;
  revenue: number;
  pipeline: number;
  drop_rate: number;
  impressions: number;
  clicks: number;
  interactions: number;
  leads: number;
  converted: number;
  lost?: number;
}

export interface RagQueryRow {
  query: string;
  product_title: string;
  count: number;
  conversion_rate: number;
}

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
  daily_metrics: DailyMetric[];
  total_leads: number;
  pipeline_value: number;
  drop_rate: number;
  catalog_published: number;
  catalog_archived: number;
  catalog_draft: number;
  catalog_paused: number;
  top_queries: RagQueryRow[];
  converted_leads: number;
  pending_leads_count: number;
  reach_count: number;
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
  category: string | null;
  converted: number;
  est_roas: number;
  trend: string | null;
  primary_image_url?: string | null;
  daily_impressions?: number[];
}

export interface ProductPerformanceList {
  items: ProductPerformanceRow[];
  start_date: string;
  end_date: string;
}

export interface RagQueryStat {
  query: string;
  count: number;
  conversion_rate: number;
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
  leads_count: number;
  converted_count: number;
  cost_per_lead: number;
  avg_sale: number;
  token_roas: number;
  realized_revenue: number;
  potential_pipeline: number;
  primary_image_url?: string | null;
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
