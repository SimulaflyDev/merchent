import "server-only";
import { api } from "./client";
import type { BuyerLeadOut, PaginatedLeads } from "@/lib/types/lead";

export interface ListLeadsParams {
  status?: string;
  lead_type?: string;
  limit?: number;
  offset?: number;
}

export async function listLeads(params: ListLeadsParams = {}): Promise<PaginatedLeads> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.lead_type) qs.set("lead_type", params.lead_type);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const q = qs.toString();
  return api<PaginatedLeads>(`/merchant/leads/${q ? `?${q}` : ""}`);
}

export async function getLead(leadId: string): Promise<BuyerLeadOut> {
  return api<BuyerLeadOut>(`/merchant/leads/${leadId}`);
}

export interface CancellationReason {
  parent_reason: string;
  child_reason: string;
  note?: string;
}

export async function patchLead(
  leadId: string,
  body: {
    status?: string;
    merchant_notes?: string;
    fulfillment_status?: string;
    payment_status?: "paid";
    cancellation_reason?: CancellationReason;
  },
): Promise<BuyerLeadOut> {
  return api<BuyerLeadOut>(`/merchant/leads/${leadId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
