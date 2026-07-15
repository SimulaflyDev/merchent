"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createProductAction, uploadProductImageAction } from "@/lib/auth/product-actions";
import { getMyMerchantsAction } from "@/lib/auth/merchant-actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";
import ProductPreviewModal from "../ProductPreviewModal";
import type { MerchantProductOut, Dimensions, Materials, RoomStorytelling } from "@/lib/types/product";
import type { MerchantOut } from "@/lib/types/merchant";
import { resolveImageUrl } from "@/lib/api/image-utils";
import { useMerchant } from "@/app/merchant/context/MerchantContext";

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(500),
  sku:         z.string().min(1, "SKU is required").max(64),
  category:    z.string().optional(),
  subcategory: z.string().optional(),
  brand:       z.string().optional(),
  description: z.string().optional(),
  price:       z.string().optional().refine(
    (v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0),
    { message: "Must be a positive number" }
  ),
  stock:       z.string().optional().refine(
    (v) => !v || (!isNaN(parseInt(v)) && parseInt(v) >= 0),
    { message: "Must be a positive integer" }
  ),
  metadata: z.array(z.object({ key: z.string(), value: z.string() })),
});
type FormValues = z.infer<typeof schema>;

function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      const match = result.match(/^data:(.+);base64,(.+)$/);
      if (!match) { reject(new Error("parse error")); return; }
      resolve({ mediaType: match[1], base64: match[2] });
    };
    reader.readAsDataURL(file);
  });
}

const CATEGORY_SUGGESTIONS = [
  "Sofa", "Dining Table", "Bed", "Wardrobe", "Chair", "Bookshelf",
  "Coffee Table", "Side Table", "Lighting", "Decor", "Rug", "Curtain",
];

export default function AddProductPage() {
  const router = useRouter();
  const { merchant } = useMerchant();
  const onboardingCompleted = merchant?.settings?.onboarding_completed === true;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [statusToSubmit, setStatusToSubmit] = useState<"draft" | "published">("draft");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shops, setShops] = useState<MerchantOut[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);

  // ── Extra fields matching Edit modal ──────────────────────────────────────
  const [dimensions, setDimensions] = useState<Dimensions>({});
  const [materials, setMaterials] = useState<Materials>({});
  const [roomStorytelling, setRoomStorytelling] = useState<RoomStorytelling>({});

  useEffect(() => {
    async function loadShops() {
      try {
        const res = await callAction(getMyMerchantsAction());
        if (Array.isArray(res)) {
          setShops(res);
        }
        if (merchant?.id) {
          setSelectedShops([merchant.id]);
        }
      } catch (err) {
        console.error("Failed to load user shops:", err);
      }
    }
    loadShops();
  }, [merchant?.id]);

  if (!onboardingCompleted) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
        <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden p-8 sm:p-10 text-center flex flex-col items-center">
          {/* Decorative subtle gradients */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1FAF9A]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#108A77]/5 rounded-full blur-3xl" />

          {/* Premium Animated Icon container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#1FAF9A]/10 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#1FAF9A] to-[#108A77] rounded-full flex items-center justify-center shadow-lg shadow-[#1FAF9A]/20">
              <svg className="w-9 h-9 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F2925] tracking-tight mb-3">
            Onboarding Required
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
            To keep the SimulaFly ecosystem secure and verify your store, we require all merchants to complete the quick store setup onboarding wizard before adding products.
          </p>

          {/* Checklist progress visual */}
          <div className="w-full bg-[#F8FAFB] border border-gray-100 rounded-2xl p-5 mb-8 text-left space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Setup Status</h4>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Business Details</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Store Showroom Profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Initial Product Showcase</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href="/merchant/onboarding"
              className="px-8 py-3.5 bg-gradient-to-r from-[#1FAF9A] to-[#108A77] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#1FAF9A]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Complete Setup Now
            </Link>
            <Link
              href="/merchant/dashboard"
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    register, control, handleSubmit, watch, setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", sku: "", category: "", subcategory: "", brand: "", description: "", price: "", stock: "", metadata: [] },
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({ control, name: "metadata" });

  const watchTitle = watch("title");
  const watchSku = watch("sku");
  const watchCategory = watch("category");
  const watchSubcategory = watch("subcategory");
  const watchBrand = watch("brand");
  const watchDescription = watch("description");
  const watchPrice = watch("price");
  const watchStock = watch("stock");
  const watchMetadata = watch("metadata");

  // Format dimensions, materials, and colors from metadata if present
  const dimensionsObj: Record<string, string> = {};
  const materialsObj: Record<string, string> = {};
  const colorsObj: Record<string, string> = {};
  
  if (watchMetadata) {
    for (const item of watchMetadata) {
      const key = item.key.toLowerCase().trim();
      const val = item.value;
      if (!key || !val) continue;
      
      if (["width", "height", "depth", "weight"].includes(key)) {
        dimensionsObj[key] = val;
      } else if (["material", "primary", "primary material", "finish", "upholstery"].includes(key)) {
        materialsObj[key] = val;
      } else if (["color", "colour", "primary color", "secondary color"].includes(key)) {
        colorsObj[key] = val;
      }
    }
  }

  const previewProductData: MerchantProductOut = {
    id: "temp-preview-id",
    merchant_id: "temp-merchant-id",
    sku: watchSku || "TEMP-SKU",
    title: watchTitle || "Untitled Product",
    description: watchDescription || null,
    category: watchCategory || null,
    subcategory: watchSubcategory || null,
    brand: watchBrand || null,
    status: "draft",
    primary_image_url: imagePreview || uploadedImageUrl || null,
    additional_images: [],
    dimensions: dimensionsObj,
    materials: materialsObj,
    colors: colorsObj,
    room_storytelling: {
      placements: watchCategory ? [watchCategory] : [],
      best_used_in: watchCategory || undefined,
    },
    custom_metadata: {},
    has_simulafly_listing: true,
    in_app_price: watchPrice ? parseFloat(watchPrice) : null,
    in_app_stock: watchStock ? parseInt(watchStock) : null,
    ai_relevance_score: watchDescription && watchDescription.length >= 30 ? 95 : 65,
    health_score: watchDescription && watchDescription.length >= 30 ? "good" : "review",
    health_reason: "This is a real-time storefront preview of your product.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError("Image must be under 8 MB.");
      return;
    }
    setSubmitError(null);
    setUploadingImage(true);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      setImagePreview(`data:${mediaType};base64,${base64}`);
      const formData = new FormData();
      formData.append("imageBase64", base64);
      formData.append("mediaType", mediaType);
      const result = await callAction(uploadProductImageAction(formData));
      setUploadedImageUrl(result.url);
    } catch (err) {
      setSubmitError(isApiError(err) ? `Image upload failed: ${err.detail}` : "Image upload failed. Please try again.");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitError(null);
    setIsSubmitting(true);

    if (statusToSubmit === "published") {
      let hasError = false;
      const checkRequired = (field: keyof FormValues, name: string) => {
        if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
          setError(field, { type: "manual", message: `${name} is required to publish.` });
          hasError = true;
        }
      };

      checkRequired("title", "Product Title");
      checkRequired("sku", "SKU");
      checkRequired("price", "Price");
      checkRequired("category", "Category");
      checkRequired("subcategory", "Subcategory");
      checkRequired("brand", "Brand");
      checkRequired("stock", "Stock Quantity");
      checkRequired("description", "Description");

      if (!uploadedImageUrl) {
        setSubmitError("Product Image is required to publish.");
        hasError = true;
      }

      if (hasError) {
        setIsSubmitting(false);
        return;
      }
    } else {
      let hasError = false;
      if (!data.title?.trim()) {
        setError("title", { type: "manual", message: "Title is required to create a draft." });
        hasError = true;
      }
      if (!data.sku?.trim()) {
        setError("sku", { type: "manual", message: "SKU is required to create a draft." });
        hasError = true;
      }
      if (hasError) {
        setIsSubmitting(false);
        return;
      }
    }

    const customMetadata: Record<string, string> = {};
    for (const row of data.metadata) {
      if (row.key.trim()) customMetadata[row.key.trim()] = row.value;
    }


    const parseNumber = (val: unknown) => {
      if (val === null || val === undefined || String(val).trim() === "") return undefined;
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? undefined : parsed;
    };
    const parsedDimensions: Dimensions = {
      ...dimensions,
      width: parseNumber(dimensions.width),
      height: parseNumber(dimensions.height),
      depth: parseNumber(dimensions.depth),
      weight: parseNumber(dimensions.weight),
    };

    try {
      await callAction(createProductAction({
        sku: data.sku,
        title: data.title,
        description: data.description || undefined,
        category: data.category || undefined,
        subcategory: data.subcategory || undefined,
        brand: data.brand || undefined,
        primary_image_url: uploadedImageUrl || undefined,
        in_app_price: data.price ? parseFloat(data.price) : undefined,
        in_app_stock: data.stock ? parseInt(data.stock) : undefined,
        custom_metadata: customMetadata,
        status: statusToSubmit,
        shop_ids: selectedShops,
        dimensions: parsedDimensions,
        materials,
        room_storytelling: roomStorytelling,
      }));
      router.push("/merchant/products");
    } catch (err) {
      setSubmitError(
        isApiError(err)
          ? err.status === 409 ? "A product with that SKU already exists." : err.detail
          : "Failed to create product"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-8 py-8 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/merchant/products"
          className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#111827] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Products
        </Link>
        <svg className="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="text-[12px] font-medium text-[#111827]">Add Product</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - 65% width (col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          {/* ── Section: Basic Info ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <h2 className="text-[13px] font-semibold text-[#111827]">Basic Info</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Name, SKU and categorisation help AI match your product.</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Product Title <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("title")}
                  className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                  placeholder="e.g. Nordic Oak Dining Table"
                />
                {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>}
              </div>

              {/* SKU + Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    SKU <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("sku")}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] font-mono text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="OAK-DT-001"
                  />
                  {errors.sku && <p className="text-red-500 text-[11px] mt-1">{errors.sku.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    {...register("price")}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="15000"
                  />
                  {errors.price && <p className="text-red-500 text-[11px] mt-1">{errors.price.message}</p>}
                </div>
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category <span className="text-red-400">*</span></label>
                  <input
                    {...register("category")}
                    list="category-suggestions"
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="e.g. Dining Table"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                  </datalist>
                  {errors.category && <p className="text-red-500 text-[11px] mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Brand <span className="text-red-400">*</span></label>
                  <input
                    {...register("brand")}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="e.g. WoodCraft"
                  />
                  {errors.brand && <p className="text-red-500 text-[11px] mt-1">{errors.brand.message}</p>}
                </div>
              </div>

              {/* Stock + Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Stock Quantity <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    {...register("stock")}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="50"
                  />
                  {errors.stock && <p className="text-red-500 text-[11px] mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subcategory <span className="text-red-400">*</span></label>
                  <input
                    {...register("subcategory")}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="e.g. 4-seater"
                  />
                  {errors.subcategory && <p className="text-red-500 text-[11px] mt-1">{errors.subcategory.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                  <span className="text-[10px] text-[#0E9F88] font-medium">Improves AI matching ↑</span>
                </div>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all resize-none"
                  placeholder="Describe the product — material, dimensions, feel, style..."
                />
                {errors.description && <p className="text-red-500 text-[11px] mt-1">{errors.description.message}</p>}
                <p className="text-[10px] text-gray-400 mt-1">30+ characters significantly improves AI recommendation accuracy.</p>
              </div>
            </div>
          </div>

          {/* ── Section: AI Attributes ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-[#111827]">AI Attributes</h2>
                <span className="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Boosts AI</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Key-value pairs like Color = Oak, Style = Scandinavian that the AI uses for matching.</p>
            </div>
            <div className="p-6 space-y-3">
              {fields.length === 0 && (
                <p className="text-[12px] text-gray-400 italic">No attributes yet. Add some to improve AI discoverability.</p>
              )}
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    {...register(`metadata.${idx}.key`)}
                    placeholder="Key (e.g. Color)"
                    className="flex-1 px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[12px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                  />
                  <input
                    {...register(`metadata.${idx}.value`)}
                    placeholder="Value (e.g. Oak)"
                    className="flex-1 px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[12px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ key: "", value: "" })}
                className="flex items-center gap-1.5 text-[12px] text-[#0E9F88] font-medium hover:underline"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add attribute
              </button>
            </div>
          </div>


          {/* ── Section: Dimensions ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5] flex justify-between items-center">
              <div>
                <h2 className="text-[13px] font-semibold text-[#111827]">Dimensions</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Physical size of the product in cm/inches.</p>
              </div>
              <select
                value={(dimensions.unit as string) || "cm"}
                onChange={(e) => setDimensions({ ...dimensions, unit: e.target.value })}
                className="px-2.5 py-1.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-lg text-[12px] font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0E9F88]"
              >
                <option value="cm">cm</option>
                <option value="inches">inches</option>
              </select>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <DimField label="Width" value={String(dimensions.width ?? "")} onChange={(v) => setDimensions({ ...dimensions, width: v })} />
                <DimField label="Height" value={String(dimensions.height ?? "")} onChange={(v) => setDimensions({ ...dimensions, height: v })} />
                <DimField label="Depth" value={String(dimensions.depth ?? "")} onChange={(v) => setDimensions({ ...dimensions, depth: v })} />
                <DimField label="Weight" value={String(dimensions.weight ?? "")} onChange={(v) => setDimensions({ ...dimensions, weight: v })} />
              </div>
            </div>
          </div>

          {/* ── Section: Materials ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <h2 className="text-[13px] font-semibold text-[#111827]">Materials</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Material composition helps AI understand your product.</p>
            </div>
            <div className="p-6 space-y-4">
              <MatField label="Primary Material" value={materials.primary ?? ""} onChange={(v) => setMaterials({ ...materials, primary: v })} placeholder="e.g. Solid Oak" />
              <MatField label="Finish" value={materials.finish ?? ""} onChange={(v) => setMaterials({ ...materials, finish: v })} placeholder="e.g. Matte lacquer" />
              <MatField label="Upholstery" value={materials.upholstery_type ?? ""} onChange={(v) => setMaterials({ ...materials, upholstery_type: v })} placeholder="e.g. Full-grain leather" />
            </div>
          </div>

          {/* ── Section: Room Storytelling ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-[#111827]">Room Storytelling</h2>
                <span className="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Helps AI matching</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Describe how and where this product fits in a room.</p>
            </div>
            <div className="p-6 space-y-4">
              <MatField label="Best used in" value={roomStorytelling.best_used_in ?? ""} onChange={(v) => setRoomStorytelling({ ...roomStorytelling, best_used_in: v })} placeholder="e.g. Living room, dining area" />
              <MatField label="Pairs well with" value={roomStorytelling.pairs_well_with ?? ""} onChange={(v) => setRoomStorytelling({ ...roomStorytelling, pairs_well_with: v })} placeholder="e.g. Upholstered chairs, area rug" />
              <MatField label="Mood" value={roomStorytelling.mood ?? ""} onChange={(v) => setRoomStorytelling({ ...roomStorytelling, mood: v })} placeholder="e.g. Scandinavian minimalist" />
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-xl">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#F1F3F5]">
            <Link
              href="/merchant/products"
              className="px-5 py-2.5 text-[12px] font-medium text-gray-500 hover:text-[#111827] bg-white border border-[#EAECEF] rounded-xl hover:bg-gray-50 transition-colors uppercase"
            >
              Cancel
            </Link>
            <button
              type="submit"
              onClick={() => setStatusToSubmit("draft")}
              disabled={isSubmitting || uploadingImage}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-[#EAECEF] hover:bg-gray-50 text-[12px] font-semibold rounded-xl transition-colors disabled:opacity-50 uppercase"
            >
              {isSubmitting && statusToSubmit === "draft" ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving Draft…
                </>
              ) : "Create Draft"}
            </button>
            <button
              type="submit"
              onClick={() => setStatusToSubmit("published")}
              disabled={isSubmitting || uploadingImage}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#111827] text-white text-[12px] font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 uppercase"
            >
              {isSubmitting && statusToSubmit === "published" ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Publishing…
                </>
              ) : "Publish Product"}
            </button>
          </div>
        </div>

        {/* Right Column - 35% width (col-span-4) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-8">
          {/* ── Section: Shop Association ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <h2 className="text-[13px] font-semibold text-[#111827]">Shop Association</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Select which of your shops will sell this product.</p>
            </div>
            <div className="p-6">
              {shops.length === 0 ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-[#0E9F88] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[12px] text-gray-500">Loading your shops...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {shops.map((s) => {
                    const isChecked = selectedShops.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? "border-[#0E9F88] bg-[#0E9F88]/5"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedShops([...selectedShops, s.id]);
                            } else {
                              // Prevent unchecking all shops — at least one shop must be selected
                              if (selectedShops.length > 1) {
                                setSelectedShops(selectedShops.filter((id) => id !== s.id));
                              }
                            }
                          }}
                          className="w-4 h-4 text-[#0E9F88] focus:ring-[#0E9F88]/30 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-gray-700 leading-tight truncate">
                            {s.display_name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            {s.shop_id || s.partner_id}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Section: Product Image ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <h2 className="text-[13px] font-semibold text-[#111827]">Product Image <span className="text-red-400">*</span></h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Drag & drop or select your primary product image.</p>
            </div>
            <div className="p-6 space-y-3">
              {/* Drag-and-drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
                  dragOver ? "border-[#0E9F88] bg-[#F0FDF4]" : "border-[#EAECEF] hover:border-gray-300"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Hidden input triggered by click / drop */}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  className="sr-only"
                />

                {imagePreview ? (
                  <div className="p-4 flex items-center gap-4">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-[#EAECEF]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#111827]">
                        {uploadingImage ? "Uploading…" : uploadedImageUrl ? "✓ Uploaded successfully" : "Processing…"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Click or drag to replace</p>
                    </div>
                    {uploadingImage && (
                      <svg className="animate-spin w-5 h-5 text-[#0E9F88] shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    )}
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <p className="text-[12px] font-medium text-gray-600">Drag & drop or click</p>
                    <p className="text-[11px] text-gray-400">Max 8 MB</p>
                  </div>
                )}
              </div>

              {/* Fallback visible file input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  className="text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:text-[10px] file:font-semibold file:rounded-lg file:border file:border-[#EAECEF] file:bg-white file:text-[#111827] hover:file:bg-gray-50 cursor-pointer w-full"
                />
              </div>
            </div>
          </div>

          {/* ── Live Storefront Preview Card ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#F1F3F5]">
              <h2 className="text-[13px] font-semibold text-[#111827]">Live Storefront Preview</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Real-time view of how shoppers see your product.</p>
            </div>
            <div className="p-6">
              <div className="border border-[#EAECEF] rounded-2xl overflow-hidden flex flex-col bg-white">
                {/* Thumbnail Area */}
                <div className="relative aspect-[4/3] bg-[#FAFBFC] flex items-center justify-center overflow-hidden">
                  {previewProductData.primary_image_url ? (
                    <img
                      src={resolveImageUrl(previewProductData.primary_image_url)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                    </div>
                  )}
                  {/* Storefront Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF4] border border-[#D1FAF0] rounded-full text-[10px] font-bold text-[#0E9F88]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F88]" />
                      SimulaFly Storefront
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#111827] leading-snug line-clamp-2">
                      {previewProductData.title}
                    </h3>
                    {previewProductData.brand && (
                      <p className="text-[11px] text-gray-400 mt-0.5">by {previewProductData.brand}</p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    {previewProductData.in_app_price != null ? (
                      <span className="text-[18px] font-extrabold text-[#111827]">
                        ₹{previewProductData.in_app_price.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400 italic">No price set</span>
                    )}
                    {previewProductData.in_app_stock != null && (
                      <span className={`text-[10px] font-bold ${previewProductData.in_app_stock > 0 ? "text-[#0E9F88]" : "text-red-500"}`}>
                        {previewProductData.in_app_stock > 0 ? `· ${previewProductData.in_app_stock} in stock` : "· Out of stock"}
                      </span>
                    )}
                  </div>

                  {previewProductData.description && (
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                      {previewProductData.description}
                    </p>
                  )}

                  {/* Category & Attributes tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {previewProductData.category && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {previewProductData.category}
                      </span>
                    )}
                    {previewProductData.subcategory && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {previewProductData.subcategory}
                      </span>
                    )}
                    {Object.entries(previewProductData.colors).map(([k, v]) => typeof v === "string" && v && (
                      <span key={v} className="text-[9px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {v}
                      </span>
                    ))}
                    {Object.entries(previewProductData.materials).map(([k, v]) => typeof v === "string" && v && (
                      <span key={v} className="text-[9px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* AI RAG Recommendation Insights */}
                  <div className="mt-3 pt-3 border-t border-[#F5F6F8] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span className={`text-[10px] font-bold ${previewProductData.health_score === "good" ? "text-[#0E9F88]" : "text-amber-600"}`}>
                        {previewProductData.health_score === "good" ? "Healthy Match" : "Needs Detail"}
                      </span>
                      <span className="text-[10px] text-gray-400">· Score: {previewProductData.ai_relevance_score}/100</span>
                    </div>
                  </div>

                  {/* Mock CTA Button */}
                  <button
                    type="button"
                    disabled
                    className="w-full mt-2 py-2 bg-[#111827] text-white rounded-xl text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 opacity-90 cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Buy on SimulaFly
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Helper field components for Dimensions / Materials / Room Storytelling ────

function DimField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="number"
        step="any"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
      />
    </div>
  );
}

function MatField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
      />
    </div>
  );
}
