"use server";

import { revalidatePath } from "next/cache";
import { patchLead as apiPatchLead } from "@/lib/api/leads";
import type { CancellationReason } from "@/lib/api/leads";
import type { BuyerLeadOut } from "@/lib/types/lead";

import { srvAction, type ActionResult } from "@/lib/api/action-utils";

export async function updateLeadStatusAction(
  leadId: string,
  status: string,
): Promise<ActionResult<BuyerLeadOut>> {
  return srvAction(async () => {
    const updated = await apiPatchLead(leadId, { status });
    revalidatePath("/merchant/orders");
    return updated;
  });
}

/** Cancel an order with a structured reason — sent as a single atomic PATCH. */
export async function cancelLeadAction(
  leadId: string,
  cancellationReason: CancellationReason,
): Promise<ActionResult<BuyerLeadOut>> {
  return srvAction(async () => {
    const updated = await apiPatchLead(leadId, {
      status: "lost",
      cancellation_reason: cancellationReason,
    });
    revalidatePath("/merchant/orders");
    return updated;
  });
}

export async function updateLeadNotesAction(
  leadId: string,
  merchant_notes: string,
): Promise<ActionResult<BuyerLeadOut>> {
  return srvAction(async () => {
    const updated = await apiPatchLead(leadId, { merchant_notes });
    revalidatePath("/merchant/orders");
    return updated;
  });
}

export async function updateOrderProgressAction(
  leadId: string,
  progress: { fulfillment_status?: string; payment_status?: "paid" },
): Promise<ActionResult<BuyerLeadOut>> {
  return srvAction(async () => {
    // The API authenticates the session/active shop and validates transitions.
    const updated = await apiPatchLead(leadId, progress);
    revalidatePath("/merchant/orders");
    return updated;
  });
}

export async function listLeadsAction(
  params: { status?: string; lead_type?: string; limit?: number; offset?: number } = {},
): Promise<ActionResult<{ items: BuyerLeadOut[]; total: number; limit: number; offset: number }>> {
  return srvAction(async () => {
    const { listLeads } = await import("@/lib/api/leads");
    return await listLeads(params);
  });
}
