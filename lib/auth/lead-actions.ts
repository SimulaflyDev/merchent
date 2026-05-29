"use server";

import { revalidatePath } from "next/cache";
import { patchLead as apiPatchLead } from "@/lib/api/leads";
import type { BuyerLeadOut } from "@/lib/types/lead";

export async function updateLeadStatusAction(
  leadId: string,
  status: string,
): Promise<BuyerLeadOut> {
  const updated = await apiPatchLead(leadId, { status });
  revalidatePath("/merchant/orders");
  return updated;
}

export async function updateLeadNotesAction(
  leadId: string,
  merchant_notes: string,
): Promise<BuyerLeadOut> {
  const updated = await apiPatchLead(leadId, { merchant_notes });
  revalidatePath("/merchant/orders");
  return updated;
}
