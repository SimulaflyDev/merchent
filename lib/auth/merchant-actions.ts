"use server";

import {
  createMerchant as apiCreate,
  updateMerchant as apiUpdate,
  inviteMember as apiInvite,
  changeMemberRole as apiChangeRole,
  removeMember as apiRemove,
} from "@/lib/api/merchants";
import { setActiveMerchantAction } from "@/lib/auth/actions";
import type {
  MerchantCreatePayload,
  MerchantUpdatePayload,
  MemberInvitePayload,
  MerchantMemberOut,
  MerchantOut,
  MemberRole,
} from "@/lib/types/merchant";

export async function createMerchantAction(
  payload: MerchantCreatePayload,
): Promise<MerchantOut> {
  const merchant = await apiCreate(payload);
  await setActiveMerchantAction(merchant.id);
  return merchant;
}

export async function updateMerchantAction(
  id: string,
  payload: MerchantUpdatePayload,
): Promise<MerchantOut> {
  return apiUpdate(id, payload);
}

export async function inviteMemberAction(
  merchantId: string,
  payload: MemberInvitePayload,
): Promise<MerchantMemberOut> {
  return apiInvite(merchantId, payload);
}

export async function changeMemberRoleAction(
  merchantId: string,
  userId: string,
  role: MemberRole,
): Promise<MerchantMemberOut> {
  return apiChangeRole(merchantId, userId, role);
}

export async function removeMemberAction(
  merchantId: string,
  userId: string,
): Promise<void> {
  return apiRemove(merchantId, userId);
}
