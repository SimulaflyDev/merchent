import { api } from "./client";
import type {
  MerchantOut,
  MerchantMemberOut,
  MerchantCreatePayload,
  MerchantUpdatePayload,
  MemberInvitePayload,
} from "@/lib/types/merchant";

export async function createMerchant(p: MerchantCreatePayload): Promise<MerchantOut> {
  return api("/merchants/", { method: "POST", body: JSON.stringify(p) });
}

export async function listMyMerchants(): Promise<MerchantOut[]> {
  return api("/merchants/me");
}

export async function getMerchant(id: string): Promise<MerchantOut> {
  return api(`/merchants/${id}`);
}

export async function updateMerchant(
  id: string,
  p: MerchantUpdatePayload,
): Promise<MerchantOut> {
  return api(`/merchants/${id}`, { method: "PATCH", body: JSON.stringify(p) });
}

export async function listMembers(merchantId: string): Promise<MerchantMemberOut[]> {
  return api(`/merchants/${merchantId}/members`);
}

export async function inviteMember(
  merchantId: string,
  p: MemberInvitePayload,
): Promise<MerchantMemberOut> {
  return api(`/merchants/${merchantId}/members/invite`, {
    method: "POST",
    body: JSON.stringify(p),
  });
}

export async function changeMemberRole(
  merchantId: string,
  userId: string,
  role: "owner" | "admin" | "staff",
): Promise<MerchantMemberOut> {
  return api(`/merchants/${merchantId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function removeMember(merchantId: string, userId: string): Promise<void> {
  return api(`/merchants/${merchantId}/members/${userId}`, { method: "DELETE" });
}
