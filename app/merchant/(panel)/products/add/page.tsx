"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Validation Schema ---
// All fields are strings at the form level (HTML inputs always return strings).
// Validation and coercion happen inside zod transforms so the inferred types
// are exact and never produce `unknown`, which is what caused the Resolver mismatch.
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sku: z.string().min(1, "SKU is required").max(32, "SKU must be under 32 characters"),
  category: z.string().optional(),
  description: z.string().optional(),
  // Keep price as a string in the schema input; validate with refine so the
  // inferred OUTPUT stays `string | undefined` — no union/unknown ambiguity.
  price: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
      { message: "Price must be a positive number" }
    ),
  productUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      { message: "Please enter a valid URL" }
    ),
  metadata: z.array(z.object({ key: z.string(), value: z.string() })),
});

// Single source of truth — both useForm and zodResolver use this exact type.
type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    // Coerce price to number at submit time (after validation has passed)
    const payload = {
      ...data,
      price: data.price ? parseFloat(data.price) : undefined,
    };
    // Simulate API Call — replace with real fetch to /api/v1/products
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Submitted Payload:", payload);
    setIsSubmitting(false);
    alert("Product saved successfully!");
  };

  return (
    <div className="p-6 md:p-8 w-full space-y-6 max-w-6xl mx-auto mb-20">
      
      {/* Header & Sticky Actions */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/merchant/products" className="hover:text-neutral-dark transition-colors">Products</Link>
              <span>/</span>
              <span className="text-neutral-dark font-semibold">Add New Product</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-dark tracking-tight">Create Product</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/merchant/products" className="px-5 py-2 bg-white border border-gray-200 text-neutral-dark text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Discard
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#1FAF9A] text-white text-sm font-semibold rounded-lg hover:bg-[#189986] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Primary Details */}
          <div className="flex-1 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              <h3 className="text-base font-bold text-neutral-dark tracking-tight">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Product Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Modern Oak Dining Table" 
                      {...register("title")}
                      className={`w-full bg-[#F8FAFB] border rounded-lg px-3 py-2.5 text-sm outline-none text-neutral-dark font-medium transition-colors ${errors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-2 focus:ring-[#1FAF9A]/20'}`} 
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">SKU / ASIN <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. B0CLWCS28R" 
                      {...register("sku")}
                      className={`w-full bg-[#F8FAFB] border rounded-lg px-3 py-2.5 text-sm outline-none text-neutral-dark font-medium uppercase transition-colors ${errors.sku ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-2 focus:ring-[#1FAF9A]/20'}`} 
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1 font-medium">{errors.sku.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select 
                      {...register("category")}
                      className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium appearance-none"
                    >
                      <option value="">Select Category...</option>
                      <option value="furniture">Furniture</option>
                      <option value="lighting">Lighting</option>
                      <option value="decor">Decor</option>
                    </select>
                  </div>
              </div>

              <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    rows={5} 
                    placeholder="Describe the product features and details..." 
                    {...register("description")}
                    className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium resize-y"
                  ></textarea>
              </div>
            </div>

            {/* Dynamic Metadata / Attributes */}
            <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-dark tracking-tight">Product Attributes</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Add custom key-value pairs (e.g. Material, Dimensions).</p>
                </div>
              </div>
              
              <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Key (e.g. Color)" 
                        {...register(`metadata.${index}.key`)}
                        className="w-full sm:flex-1 bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" 
                      />
                      <input 
                        type="text" 
                        placeholder="Value (e.g. Deep Blue)" 
                        {...register(`metadata.${index}.value`)}
                        className="w-full sm:flex-1 bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" 
                      />
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 w-full sm:w-auto flex justify-center"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => append({ key: "", value: "" })}
                    className="mt-2 flex items-center gap-2 text-xs font-bold text-[#1FAF9A] hover:text-[#189986] transition-colors py-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Another Attribute
                  </button>
              </div>
            </div>
            
          </div>

          {/* Right Column: Media, Pricing & Links */}
          <div className="w-full lg:w-[350px] space-y-6">
            
            {/* Media Uploader */}
            <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              <h3 className="text-base font-bold text-neutral-dark tracking-tight">Product Media</h3>
              
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl bg-[#F8FAFB] flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                {imagePreview ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <p className="text-sm font-bold text-neutral-dark mb-1">Click to upload</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Pricing & Checkout */}
            <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              <h3 className="text-base font-bold text-neutral-dark tracking-tight">Pricing & Checkout</h3>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Base Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...register("price")}
                    className={`w-full bg-[#F8FAFB] border rounded-lg pl-8 pr-3 py-2.5 text-sm outline-none text-neutral-dark font-medium transition-colors ${errors.price ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-2 focus:ring-[#1FAF9A]/20'}`} 
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price.message}</p>}
              </div>
              
              <div className="pt-2 border-t border-gray-50">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">External Product URL</label>
                <p className="text-[10px] text-gray-500 mb-2">Where users are sent to complete the purchase.</p>
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <input 
                    type="text" 
                    placeholder="https://" 
                    {...register("productUrl")}
                    className={`w-full bg-[#F8FAFB] border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none text-neutral-dark font-medium transition-colors ${errors.productUrl ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-2 focus:ring-[#1FAF9A]/20'}`} 
                  />
                </div>
                {errors.productUrl && <p className="text-red-500 text-xs mt-1 font-medium">{errors.productUrl.message}</p>}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
