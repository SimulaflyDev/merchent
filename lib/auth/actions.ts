"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { login as loginApi, register as registerApi } from "@/lib/api/auth";
import { api } from "@/lib/api/client";
import type { MerchantOut } from "@/lib/types/merchant";

const ONE_DAY = 60 * 60 * 24;
const ACCESS_TTL = ONE_DAY;       // backend access token lifetime
const REFRESH_TTL = ONE_DAY * 30; // backend refresh token lifetime

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function loginAction(email: string, password: string) {
  const { access_token, refresh_token } = await loginApi(email, password);
  const c = await cookies();
  c.set("access_token", access_token, cookieOpts(ACCESS_TTL));
  c.set("refresh_token", refresh_token, cookieOpts(REFRESH_TTL));

  // Look up which merchants this user belongs to.
  const merchants = await api<MerchantOut[]>("/merchants/me");
  if (merchants.length === 0) {
    // No merchant yet → onboarding will handle org creation.
    redirect("/merchant/onboarding");
  }
  if (merchants.length === 1) {
    c.set("active_merchant_id", merchants[0].id, cookieOpts(REFRESH_TTL));
    redirect("/merchant/dashboard");
  }
  // Multi-merchant: store first as active; sidebar switcher (future) can change it.
  c.set("active_merchant_id", merchants[0].id, cookieOpts(REFRESH_TTL));
  redirect("/merchant/dashboard");
}

export async function registerAction(
  email: string,
  password: string,
  fullName: string,
) {
  await registerApi({ email, password, full_name: fullName });
  // Auto-login after register.
  await loginAction(email, password);
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
