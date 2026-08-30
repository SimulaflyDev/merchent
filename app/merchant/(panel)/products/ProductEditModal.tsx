"use client";

import { useState } from "react";

import { updateProductAction } from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";
import ProductImagesField from "./ProductImagesField";
import type {
  MerchantProductOut,
  MerchantProductUpdatePayload,
  Dimensions,
  Materials,
  RoomStorytelling,
} from "@/lib/types/product";

interface Props {
  product: MerchantProductOut;
  onClose: () => void;
  onSaved: (updated: MerchantProductOut) => void;
}

// Initialise metadata rows from custom_metadata object
function metadataToRows(meta: Record<string, unknown>): { key: string; value: string }[] {
  return Object.entries(meta ?? {}).filter(([k]) => k !== "legacy_product_url").map(([k, v]) => ({ key: k, value: String(v ?? "") }));
}

export default function ProductEditModal({ product, onClose, onSaved }: Props) {
  // ── Basic Info ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description ?? "");
  const [category, setCategory] = useState(product.category ?? "");
  const [subcategory, setSubcategory] = useState(product.subcategory ?? "");
  const [brand, setBrand] = useState(product.brand ?? "");
  const [inAppPrice, setInAppPrice] = useState(
    product.in_app_price != null ? String(product.in_app_price) : "",
  );
  const [inAppStock, setInAppStock] = useState(
    product.in_app_stock != null ? String(product.in_app_stock) : "",
  );
  const [hasSimulaflyListing, setHasSimulaflyListing] = useState(product.has_simulafly_listing);

  // ── Ordered image gallery (first image is the AI reference) ─────────────────
  const [productImages, setProductImages] = useState<string[]>(
    [product.primary_image_url, ...(product.additional_images ?? [])].filter(
      (image): image is string => Boolean(image),
    ).slice(0, 5),
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── AI Attributes (custom_metadata) ─────────────────────────────────────────
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    metadataToRows(product.custom_metadata ?? {}),
  );



  // ── Extra edit-only fields ───────────────────────────────────────────────────
  const [dimensions, setDimensions] = useState<Dimensions>(product.dimensions);
  const [materials, setMaterials] = useState<Materials>(product.materials);
  const [roomStorytelling, setRoomStorytelling] = useState<RoomStorytelling>(
    product.room_storytelling,
  );

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);

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

    // Build custom_metadata from rows
    const customMetadata: Record<string, string> = {};
    for (const row of metadata) {
      if (row.key.trim()) customMetadata[row.key.trim()] = row.value;
    }


    const payload: MerchantProductUpdatePayload = {
      title,
      description: description || null,
      category: category || null,
      subcategory: subcategory || null,
      brand: brand || null,
      in_app_price: inAppPrice ? parseFloat(inAppPrice) : null,
      in_app_stock: inAppStock ? parseInt(inAppStock, 10) : null,
      has_simulafly_listing: hasSimulaflyListing,
      primary_image_url: productImages[0] || null,
      additional_images: productImages.slice(1),
      dimensions: parsedDimensions,
      materials,
      room_storytelling: roomStorytelling,
      custom_metadata: customMetadata,
    };

    try {
      const updated = await callAction(updateProductAction(product.id, payload));
      onSaved(updated);
    } catch (err) {
      setSaveError(isApiError(err) ? err.detail : "Failed to save");
      setSaving(false);
    }
  };

  const addMetaRow = () => setMetadata([...metadata, { key: "", value: "" }]);
  const removeMetaRow = (idx: number) => setMetadata(metadata.filter((_, i) => i !== idx));
  const updateMetaRow = (idx: number, field: "key" | "value", val: string) =>
    setMetadata(metadata.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className="max-h-[96dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#F5F5F7] sm:max-h-[90vh]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-[15px] font-bold text-[#111827]">Edit Product</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{product.sku}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Basic Info ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5]">
              <h3 className="text-[13px] font-semibold text-[#111827]">Basic Info</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Name, SKU and categorisation help AI match your product.</p>
            </div>
            <div className="p-5 space-y-4">

              {/* Product Title */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Product Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                  placeholder="e.g. Nordic Oak Dining Table"
                />
              </div>

              {/* SKU (read-only) + Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    SKU <span className="text-[10px] font-normal text-gray-400 normal-case">(cannot be changed)</span>
                  </label>
                  <input
                    readOnly
                    value={product.sku}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-mono text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inAppPrice}
                    onChange={(e) => setInAppPrice(sanitiseDecimal(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="15000"
                  />
                </div>
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="e.g. Dining Table"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Brand <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="e.g. WoodCraft"
                  />
                </div>
              </div>

              {/* Stock + Subcategory */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Stock Quantity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inAppStock}
                    onChange={(e) => setInAppStock(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Subcategory <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                    placeholder="e.g. 4-seater"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-[#0E9F88] font-medium">Improves AI matching ↑</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all resize-none"
                  placeholder="Describe the product — material, dimensions, feel, style..."
                />
                <p className="text-[10px] text-gray-400 mt-1">30+ characters significantly improves AI recommendation accuracy.</p>
              </div>
            </div>
          </div>

          {/* ── Product Images ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#111827]">Product Images</h3>
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5">MAXIMUM OF 05 IMAGES CAN BE ADDED PER PRODUCT</p>
                </div>
                <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#0E9F88]">Image 1 powers AI</span>
              </div>
            </div>
            <div className="p-5">
              <ProductImagesField
                images={productImages}
                onChange={setProductImages}
                onUploadingChange={setUploadingImage}
                onError={setSaveError}
                compact
              />
            </div>
          </div>

          {/* ── SimulaFly Listing ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5]">
              <h3 className="text-[13px] font-semibold text-[#111827]">SimulaFly Listing</h3>
            </div>
            <div className="p-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSimulaflyListing}
                  onChange={(e) => setHasSimulaflyListing(e.target.checked)}
                  className="w-4 h-4 text-[#0E9F88] focus:ring-[#0E9F88]/30 rounded border-gray-300"
                />
                <span className="text-[13px] text-gray-700">Enable in-app checkout (buyers can submit a lead for this product)</span>
              </label>
            </div>
          </div>

          {/* ── AI Attributes ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[#111827]">AI Attributes</h3>
                <span className="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Boosts AI</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Key-value pairs like Color = Oak, Style = Scandinavian that the AI uses for matching.</p>
            </div>
            <div className="p-5 space-y-3">
              {metadata.length === 0 && (
                <p className="text-[12px] text-gray-400 italic">No attributes yet. Add some to improve AI discoverability.</p>
              )}
              {metadata.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={row.key}
                    onChange={(e) => updateMetaRow(idx, "key", e.target.value)}
                    placeholder="Key (e.g. Color)"
                    className="flex-1 px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[12px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                  />
                  <input
                    value={row.value}
                    onChange={(e) => updateMetaRow(idx, "value", e.target.value)}
                    placeholder="Value (e.g. Oak)"
                    className="flex-1 px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[12px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetaRow(idx)}
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
                onClick={addMetaRow}
                className="flex items-center gap-1.5 text-[12px] text-[#0E9F88] font-medium hover:underline"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add attribute
              </button>
            </div>
          </div>


          {/* ── Dimensions ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5] flex justify-between items-center">
              <h3 className="text-[13px] font-semibold text-[#111827]">Dimensions</h3>
              <select
                value={(dimensions.unit as string) || "cm"}
                onChange={(e) => setDimensions({ ...dimensions, unit: e.target.value })}
                className="px-2.5 py-1.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-lg text-[12px] font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0E9F88]"
              >
                <option value="cm">cm</option>
                <option value="inches">inches</option>
              </select>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <NumberField label="Height" value={String(dimensions.height ?? "")} onChange={(v) => setDimensions({ ...dimensions, height: v })} />
                <NumberField label="Width" value={String(dimensions.width ?? "")} onChange={(v) => setDimensions({ ...dimensions, width: v })} />
                <NumberField label="Depth" value={String(dimensions.depth ?? "")} onChange={(v) => setDimensions({ ...dimensions, depth: v })} />
              </div>
            </div>
          </div>

          {/* ── Weight ── */}
          <div className="overflow-hidden rounded-2xl border border-[#EAECEF] bg-white">
            <div className="border-b border-[#F1F3F5] px-5 py-3.5">
              <h3 className="text-[13px] font-semibold text-[#111827]">Weight</h3>
              <p className="mt-0.5 text-[11px] text-gray-400">Product weight and its measurement unit.</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_9rem]">
                <label htmlFor="edit-product-weight" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Weight</label>
                <input
                  id="edit-product-weight"
                  type="text"
                  inputMode="decimal"
                  value={String(dimensions.weight ?? "")}
                  onChange={(e) => setDimensions({ ...dimensions, weight: sanitiseDecimal(e.target.value) })}
                  className="w-full rounded-xl border border-[#EAECEF] bg-[#FAFBFC] px-3.5 py-2.5 text-[13px] text-[#111827] transition-all focus:border-[#0E9F88] focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30"
                />
                <select
                  aria-label="Weight unit"
                  value={(dimensions.weight_unit as string) || "kg"}
                  onChange={(e) => setDimensions({ ...dimensions, weight_unit: e.target.value })}
                  className="col-start-2 rounded-xl border border-[#EAECEF] bg-[#FAFBFC] px-3.5 py-2.5 text-[12px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 sm:col-start-auto"
                >
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Materials ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5]">
              <h3 className="text-[13px] font-semibold text-[#111827]">Materials</h3>
            </div>
            <div className="p-5 space-y-4">
              <TextField label="Primary Material" value={materials.primary ?? ""} onChange={(v) => setMaterials({ ...materials, primary: v })} placeholder="e.g. Solid Oak" />
              <TextField label="Finish" value={materials.finish ?? ""} onChange={(v) => setMaterials({ ...materials, finish: v })} placeholder="e.g. Matte lacquer" />
              <TextField label="Upholstery" value={materials.upholstery_type ?? ""} onChange={(v) => setMaterials({ ...materials, upholstery_type: v })} placeholder="e.g. Full-grain leather" />
            </div>
          </div>

          {/* ── Room Storytelling ── */}
          <div className="bg-white border border-[#EAECEF] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[#111827]">Room Storytelling</h3>
                <span className="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Helps AI matching</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <TextField label="Best used in" value={roomStorytelling.best_used_in ?? ""} onChange={(v) => setRoomStorytelling({ ...roomStorytelling, best_used_in: v })} placeholder="e.g. Living room, dining area" />
              <TextField label="Pairs well with" value={roomStorytelling.pairs_well_with ?? ""} onChange={(v) => setRoomStorytelling({ ...roomStorytelling, pairs_well_with: v })} placeholder="e.g. Upholstered chairs, area rug" />
              <TextField label="Mood" value={roomStorytelling.mood ?? ""} onChange={(v) => setRoomStorytelling({ ...roomStorytelling, mood: v })} placeholder="e.g. Scandinavian minimalist" />
            </div>
          </div>

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-xl">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {saveError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col-reverse gap-3 rounded-b-2xl border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[12px] font-medium text-gray-500 hover:text-[#111827] bg-white border border-[#EAECEF] rounded-xl hover:bg-gray-50 transition-colors uppercase"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploadingImage}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#111827] text-white text-[12px] font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 uppercase"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving…
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared field components ───────────────────────────────────────────────────

function TextField({
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

function NumberField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(sanitiseDecimal(e.target.value))}
        className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#EAECEF] rounded-xl text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all"
      />
    </div>
  );
}

function sanitiseDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimalParts] = cleaned.split(".");
  return decimalParts.length ? `${whole}.${decimalParts.join("")}` : whole;
}
