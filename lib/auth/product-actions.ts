"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  createProduct as apiCreate,
  updateProduct as apiUpdate,
  archiveProduct as apiArchive,
  publishProduct as apiPublish,
  listProducts as apiList,

} from "@/lib/api/products";
import { ApiError } from "@/lib/api/errors";
import type {
  MerchantProductCreatePayload,
  MerchantProductOut,
  MerchantProductUpdatePayload,
  PaginatedProducts,
} from "@/lib/types/product";

import { srvAction, type ActionResult } from "@/lib/api/action-utils";

export async function createProductAction(
  payload: MerchantProductCreatePayload,
): Promise<ActionResult<MerchantProductOut>> {
  return srvAction(async () => {
    const product = await apiCreate(payload);
    revalidatePath("/merchant/products");
    return product;
  });
}

export async function updateProductAction(
  id: string,
  payload: MerchantProductUpdatePayload,
): Promise<ActionResult<MerchantProductOut>> {
  return srvAction(async () => {
    const product = await apiUpdate(id, payload);
    revalidatePath("/merchant/products");
    return product;
  });
}

export async function archiveProductAction(id: string): Promise<ActionResult<void>> {
  return srvAction(async () => {
    await apiArchive(id);
    revalidatePath("/merchant/products");
  });
}

export async function publishProductAction(id: string): Promise<ActionResult<MerchantProductOut>> {
  return srvAction(async () => {
    const product = await apiPublish(id);
    revalidatePath("/merchant/products");
    return product;
  });
}



/**
 * Upload a product image to the backend's base64-JSON upload endpoint.
 *
 * Runs server-side so the httpOnly access_token cookie is read on the
 * server and forwarded as an Authorization header. The browser cannot send
 * the cookie cross-origin (localhost:3000 → localhost:8000 in dev).
 *
 * Caller passes the base64-encoded image bytes (WITHOUT the `data:` prefix)
 * and the media type (e.g. "image/jpeg").
 */
export async function uploadProductImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string; id: string }>> {
  return srvAction(async () => {
    const imageBase64 = formData.get("imageBase64") as string;
    const mediaType = formData.get("mediaType") as string;
    if (!imageBase64 || !mediaType) {
      throw new ApiError(400, "Missing imageBase64 or mediaType");
    }
    const c = await cookies();
    const accessToken = c.get("access_token")?.value;
    const merchantId = c.get("active_merchant_id")?.value;
    if (!accessToken) {
      throw new ApiError(401, "not authenticated");
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.simulatech.org/api/v1";
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    if (merchantId) headers["X-Merchant-Id"] = merchantId;

    const res = await fetch(`${base}/upload/merchant-product-image`, {
      method: "POST",
      body: JSON.stringify({ image_base64: imageBase64, media_type: mediaType }),
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body.detail ?? detail;
      } catch {
        /* non-JSON error */
      }
      throw new ApiError(res.status, detail);
    }

    const data = await res.json();
    // The backend returns a relative URL like "/api/v1/upload/room-image/<id>".
    // The frontend prepends the host so the resulting URL is fetch-able from the browser.
    const base_no_v1 = base.replace(/\/api\/v1\/?$/, "");
    const fullUrl = data.url.startsWith("http") ? data.url : `${base_no_v1}${data.url}`;
    return { url: fullUrl, id: data.id };
  });
}

export async function listProductsAction(
  params?: any,
): Promise<ActionResult<PaginatedProducts>> {
  return srvAction(() => apiList(params));
}
