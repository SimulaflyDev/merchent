"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import type { ShopperOut } from "@/lib/api/buyer-intelligence";
import type { ContactOut } from "@/lib/api/contacts";
import { getContact as apiGetContact } from "@/lib/api/contacts";

import { getShopperDetail as apiGetShopperDetail } from "@/lib/api/buyer-intelligence";
import type { ShopperDetailResponse } from "@/lib/api/buyer-intelligence";
import { srvAction, type ActionResult } from "@/lib/api/action-utils";

export async function getShopperDetailAction(userId: string): Promise<ActionResult<ShopperDetailResponse>> {
  return srvAction(() => apiGetShopperDetail(userId));
}

export async function unlockShopperAction(userId: string): Promise<ActionResult<ShopperOut>> {
  return srvAction(async () => {
    const result = await api<ShopperOut>(`/merchant/buyer-intelligence/${userId}/unlock`, {
      method: "POST",
    });
    revalidatePath("/merchant/buyer-intelligence");
    return result;
  });
}

export async function createContactAction(body: {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  last_purchase_note?: string;
}): Promise<ActionResult<ContactOut>> {
  return srvAction(async () => {
    const result = await api<ContactOut>("/merchant/contacts/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    revalidatePath("/merchant/buyer-network");
    return result;
  });
}

export async function updateContactInviteAction(
  contactId: string,
  invite_status: string
): Promise<ActionResult<ContactOut>> {
  return srvAction(async () => {
    const result = await api<ContactOut>(`/merchant/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify({ invite_status }),
    });
    revalidatePath("/merchant/buyer-network");
    return result;
  });
}

export async function importContactsCsvAction(
  formData: FormData
): Promise<ActionResult<ContactOut[]>> {
  return srvAction(async () => {
    const result = await api<ContactOut[]>("/merchant/contacts/csv-import", {
      method: "POST",
      body: formData,
    });
    revalidatePath("/merchant/buyer-network");
    return result;
  });
}

export async function getContactAction(contactId: string): Promise<ActionResult<ContactOut>> {
  return srvAction(() => apiGetContact(contactId));
}
