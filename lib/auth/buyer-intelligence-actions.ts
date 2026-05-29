"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import type { ShopperOut } from "@/lib/api/buyer-intelligence";
import type { ContactOut } from "@/lib/api/contacts";

export async function unlockShopperAction(userId: string): Promise<ShopperOut> {
  const result = await api<ShopperOut>(`/merchant/buyer-intelligence/${userId}/unlock`, {
    method: "POST",
  });
  revalidatePath("/merchant/buyer-intelligence");
  return result;
}

export async function createContactAction(body: {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  last_purchase_note?: string;
}): Promise<ContactOut> {
  const result = await api<ContactOut>("/merchant/contacts/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  revalidatePath("/merchant/buyer-network");
  return result;
}

export async function updateContactInviteAction(
  contactId: string,
  invite_status: string
): Promise<ContactOut> {
  const result = await api<ContactOut>(`/merchant/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify({ invite_status }),
  });
  revalidatePath("/merchant/buyer-network");
  return result;
}
