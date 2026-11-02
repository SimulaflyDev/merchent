"use server";

import { api } from "@/lib/api/client";
import { srvAction } from "@/lib/api/action-utils";
import type { TermsDocument, TermsPage } from "@/lib/types/terms";

export async function getCurrentTermsAction(merchantId: string) {
  return srvAction(() => api<TermsDocument>(`/merchants/${encodeURIComponent(merchantId)}/verification/terms`));
}

export async function getTermsPageAction(merchantId: string, version: string, page: number) {
  return srvAction(() => api<TermsPage>(`/merchants/${encodeURIComponent(merchantId)}/verification/terms/${encodeURIComponent(version)}/pages/${page}`));
}
