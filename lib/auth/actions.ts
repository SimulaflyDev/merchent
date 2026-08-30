"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { login as loginApi, register as registerApi } from "@/lib/api/auth";
import { api } from "@/lib/api/client";
import type { MerchantOut } from "@/lib/types/merchant";

import { srvAction, type ActionResult } from "@/lib/api/action-utils";
import { ApiError } from "@/lib/api/errors";

import { cookieOpts, ACCESS_TTL, REFRESH_TTL } from "./jwt";

export async function loginAction(email: string, password: string): Promise<ActionResult<void>> {
  return srvAction(async () => {
    const { access_token, refresh_token } = await loginApi(email, password);
    const c = await cookies();
    c.set("access_token", access_token, cookieOpts(ACCESS_TTL));
    c.set("refresh_token", refresh_token, cookieOpts(REFRESH_TTL));

    // Check email verification status
    const user = await api<{ is_email_verified: boolean }>("/users/me");
    if (!user.is_email_verified) {
      await api<{ message: string }>("/auth/send-otp", { method: "POST" });
      redirect("/merchant/verify_email");
    }

    // Look up which merchants this user belongs to.
    const merchants = await api<MerchantOut[]>("/merchants/me");
    if (merchants.length === 0) {
      // No merchant yet → onboarding will handle org creation.
      redirect("/merchant/onboarding");
    }
    redirect("/merchant/select_shop");
  });
}

export async function registerAction(
  email: string,
  password: string,
  fullName: string,
  agreements: { terms: boolean; privacy: boolean; merchant: boolean },
): Promise<ActionResult<void>> {
  return srvAction(async () => {
    await registerApi({
      email,
      password,
      full_name: fullName,
      terms_accepted: agreements.terms,
      privacy_policy_accepted: agreements.privacy,
      merchant_agreement_accepted: agreements.merchant,
    });
    // Auto-login after register.
    const loginRes = await loginAction(email, password);
    if (!loginRes.success) {
      throw new ApiError(loginRes.error.status, loginRes.error.detail, loginRes.error.payload);
    }
  });
}

export async function logoutAction() {
  const c = await cookies();
  c.delete("access_token");
  c.delete("refresh_token");
  c.delete("active_merchant_id");
  redirect("/merchant/sign_in");
}

export async function setActiveMerchantAction(merchantId: string) {
  const c = await cookies();
  c.set("active_merchant_id", merchantId, cookieOpts(REFRESH_TTL));
}

export async function sendEmailOtpAction(): Promise<ActionResult<{ message: string }>> {
  return srvAction(async () => {
    return api<{ message: string }>("/auth/send-otp", { method: "POST" });
  });
}

export async function verifyEmailOtpAction(otp: string): Promise<ActionResult<{ message: string; user: CurrentUserSummary }>> {
  return srvAction(async () => {
    return api<{ message: string; user: CurrentUserSummary }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  });
}

export async function sendMobileOtpAction(phone: string): Promise<ActionResult<{ message: string; dev_otp?: string }>> {
  return srvAction(async () => {
    return api<{ message: string; dev_otp?: string }>("/auth/send-mobile-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  });
}

export async function verifyMobileOtpAction(phone: string, otp: string): Promise<ActionResult<{ message: string }>> {
  return srvAction(async () => {
    return api<{ message: string }>("/auth/verify-mobile-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    });
  });
}

export interface CurrentUserSummary {
  email: string;
  full_name: string | null;
  phone: string | null;
  is_email_verified: boolean;
}

export async function getCurrentUserAction(): Promise<ActionResult<CurrentUserSummary>> {
  return srvAction(() => api<CurrentUserSummary>("/users/me"));
}
