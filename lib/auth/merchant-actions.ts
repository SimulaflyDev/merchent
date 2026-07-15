"use server";

import {
  createMerchant as apiCreate,
  updateMerchant as apiUpdate,
  inviteMember as apiInvite,
  changeMemberRole as apiChangeRole,
  removeMember as apiRemove,
  listMyMerchants as apiList,
  listReferredMerchants as apiListReferrals,
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

import { srvAction, type ActionResult } from "@/lib/api/action-utils";

export async function getMyMerchantsAction(): Promise<ActionResult<MerchantOut[]>> {
  return srvAction(() => apiList());
}

export async function createMerchantAction(
  payload: MerchantCreatePayload,
): Promise<ActionResult<MerchantOut>> {
  return srvAction(async () => {
    const merchant = await apiCreate(payload);
    await setActiveMerchantAction(merchant.id);
    return merchant;
  });
}

export async function updateMerchantAction(
  id: string,
  payload: MerchantUpdatePayload,
): Promise<ActionResult<MerchantOut>> {
  return srvAction(async () => {
    const merchant = await apiUpdate(id, payload);
    await setActiveMerchantAction(merchant.id);
    return merchant;
  });
}

export async function inviteMemberAction(
  merchantId: string,
  payload: MemberInvitePayload,
): Promise<ActionResult<MerchantMemberOut>> {
  return srvAction(() => apiInvite(merchantId, payload));
}

export async function changeMemberRoleAction(
  merchantId: string,
  userId: string,
  role: MemberRole,
): Promise<ActionResult<MerchantMemberOut>> {
  return srvAction(() => apiChangeRole(merchantId, userId, role));
}

export async function removeMemberAction(
  merchantId: string,
  userId: string,
): Promise<ActionResult<void>> {
  return srvAction(() => apiRemove(merchantId, userId));
}

export async function getPublicMerchantAction(
  lookup: string,
): Promise<ActionResult<MerchantOut>> {
  return srvAction(() => {
    const { api } = require("@/lib/api/client");
    return api(`/merchants/public/${lookup}`, { skipAuth: true });
  });
}

export async function getReferredMerchantsAction(
  merchantId: string,
): Promise<ActionResult<MerchantOut[]>> {
  return srvAction(() => apiListReferrals(merchantId));
}

