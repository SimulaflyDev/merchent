import "server-only";
import { api } from "./client";

export interface SupportTicketCreatePayload {
  reason: string;
  sub_reason: string;
  description: string;
  merchant_product_id?: string;
  attachment_url?: string;
}

export interface SupportTicketOut {
  id: string;
  reference: string;
  subject: string;
  status: string;
  priority: string;
  reason: string | null;
  sub_reason: string | null;
  merchant_product_id: string | null;
  attachment_url: string | null;
  description: string | null;
  sla_due_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function createSupportTicket(
  payload: SupportTicketCreatePayload
): Promise<SupportTicketOut> {
  return api<SupportTicketOut>("/merchant/support/tickets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listSupportTickets(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: SupportTicketOut[]; total: number; limit: number; offset: number }> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const q = qs.toString();
  return api(`/merchant/support/tickets/${q ? `?${q}` : ""}`);
}
