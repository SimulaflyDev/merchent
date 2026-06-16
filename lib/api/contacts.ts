import "server-only";
import { api } from "./client";

export interface ContactOut {
  id: string;
  merchant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  last_purchase_note: string | null;
  invite_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedContacts {
  items: ContactOut[];
  total: number;
  limit: number;
  offset: number;
}

export async function listContacts(params: {
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<PaginatedContacts> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.search) qs.set("search", params.search);
  const q = qs.toString();
  return api<PaginatedContacts>(`/merchant/contacts/${q ? `?${q}` : ""}`);
}

export async function getContact(contactId: string): Promise<ContactOut> {
  return api<ContactOut>(`/merchant/contacts/${contactId}`);
}

