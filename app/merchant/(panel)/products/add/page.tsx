"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createProductAction, uploadProductImageAction } from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  sku: z.string().min(1, "SKU is required").max(64, "SKU must be under 64 characters"),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      { message: "Price must be a non-negative number" },
    ),
  productUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      { message: "Please enter a valid URL" },
    ),
  metadata: z.array(z.object({ key: z.string(), value: z.string() })),
});

type ProductFormValues = z.infer<typeof productSchema>;

/** Convert a File to a base64 string (no `data:` prefix). */
function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      // result is like "data:image/jpeg;base64,/9j/4AAQ..."
      const match = result.match(/^data:(.+);base64,(.+)$/);
      if (!match) {
        reject(new Error("could not parse data URL"));
        return;
      }
      resolve({ mediaType: match[1], base64: match[2] });
    };
    reader.readAsDataURL(file);
  });
}

export default function AddProductPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      sku: "",
      category: "",
      description: "",
      price: "",
      productUrl: "",
      metadata: [{ key: "", value: "" }],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metadata",
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitError(null);
    setUploadingImage(true);

    try {
      const { base64, mediaType } = await fileToBase64(file);
      // Show local preview (data URL)
      setImagePreview(`data:${mediaType};base64,${base64}`);

      // Upload via Server Action (cross-origin httpOnly cookies → server-side forwarding)
      const result = await uploadProductImageAction(base64, mediaType);
      setUploadedImageUrl(result.url);
    } catch (err) {
      setSubmitError(
        isApiError(err) ? `Image upload failed: ${err.detail}` : "Image upload failed",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setSubmitError(null);
    setIsSubmitting(true);

    // Convert metadata array to dict (skip blank rows)
    const customMetadata: Record<string, string> = {};
    for (const row of data.metadata) {
      if (row.key.trim()) customMetadata[row.key.trim()] = row.value;
    }
    if (data.productUrl) customMetadata.legacy_product_url = data.productUrl;

    try {
      await createProductAction({
        sku: data.sku,
        title: data.title,
        description: data.description || undefined,
        category: data.category || undefined,
        primary_image_url: uploadedImageUrl || undefined,
        in_app_price: data.price ? parseFloat(data.price) : undefined,
        custom_metadata: customMetadata,
      });
      router.push("/merchant/products");
    } catch (err) {
      setSubmitError(
        isApiError(err)
          ? err.status === 409
            ? "A product with that SKU already exists."
            : err.detail
          : "Failed to create product",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/merchant/products"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to products
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#111827] mb-6">Add Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-xl border border-[#E2E4E8] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Basic info
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              {...register("title")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Oak Dining Table"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                {...register("sku")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                placeholder="OAK-DT-001"
              />
              {errors.sku && (
                <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                {...register("category")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Furniture"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              {...register("price")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="15000"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#E2E4E8] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Primary image
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="text-sm"
            />
            {uploadingImage && <span className="text-gray-500 text-xs">uploading…</span>}
            {uploadedImageUrl && !uploadingImage && (
              <span className="text-green-600 text-xs">✓ uploaded</span>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#E2E4E8] p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Custom attributes (for AI matching)
          </h2>
          <p className="text-xs text-gray-500">
            E.g. Color = Oak, Material = Solid wood, Style = Mid-century modern
          </p>

          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`metadata.${idx}.key`)}
                placeholder="Key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register(`metadata.${idx}.value`)}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="text-sm text-[#0E9F88] hover:underline"
          >
            + Add attribute
          </button>
        </section>

        {submitError && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/merchant/products"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploadingImage}
            className="px-6 py-2 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69] disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
