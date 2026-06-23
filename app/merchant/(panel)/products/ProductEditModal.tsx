"use client";

import { useState } from "react";

import { updateProductAction } from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";
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

export default function ProductEditModal({ product, onClose, onSaved }: Props) {
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

  const [dimensions, setDimensions] = useState<Dimensions>(product.dimensions);
  const [materials, setMaterials] = useState<Materials>(product.materials);
  const [roomStorytelling, setRoomStorytelling] = useState<RoomStorytelling>(
    product.room_storytelling,
  );

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);

    const payload: MerchantProductUpdatePayload = {
      title,
      description: description || null,
      category: category || null,
      subcategory: subcategory || null,
      brand: brand || null,
      in_app_price: inAppPrice ? parseFloat(inAppPrice) : null,
      in_app_stock: inAppStock ? parseInt(inAppStock, 10) : null,
      has_simulafly_listing: hasSimulaflyListing,
      dimensions,
      materials,
      room_storytelling: roomStorytelling,
    };

    try {
      const updated = await updateProductAction(product.id, payload);
      onSaved(updated);
    } catch (err) {
      setSaveError(isApiError(err) ? err.detail : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Edit product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Basics</h3>
            <Field label="Title" value={title} onChange={setTitle} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" value={category} onChange={setCategory} />
              <Field label="Subcategory" value={subcategory} onChange={setSubcategory} />
            </div>
            <Field label="Brand" value={brand} onChange={setBrand} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              SimulaFly listing
            </h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasSimulaflyListing}
                onChange={(e) => setHasSimulaflyListing(e.target.checked)}
              />
              <span className="text-sm">Enable in-app checkout (buyers can submit a lead for this product)</span>
            </label>
            {hasSimulaflyListing && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₹)" value={inAppPrice} onChange={setInAppPrice} />
                <Field label="Stock" value={inAppStock} onChange={setInAppStock} />
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Dimensions</h3>
            <div className="grid grid-cols-3 gap-3">
              <Field
                label="Width"
                value={String(dimensions.width ?? "")}
                onChange={(v) => setDimensions({ ...dimensions, width: v })}
              />
              <Field
                label="Height"
                value={String(dimensions.height ?? "")}
                onChange={(v) => setDimensions({ ...dimensions, height: v })}
              />
              <Field
                label="Depth"
                value={String(dimensions.depth ?? "")}
                onChange={(v) => setDimensions({ ...dimensions, depth: v })}
              />
              <Field
                label="Weight"
                value={String(dimensions.weight ?? "")}
                onChange={(v) => setDimensions({ ...dimensions, weight: v })}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Materials</h3>
            <Field
              label="Primary"
              value={materials.primary ?? ""}
              onChange={(v) => setMaterials({ ...materials, primary: v })}
            />
            <Field
              label="Finish"
              value={materials.finish ?? ""}
              onChange={(v) => setMaterials({ ...materials, finish: v })}
            />
            <Field
              label="Upholstery"
              value={materials.upholstery_type ?? ""}
              onChange={(v) => setMaterials({ ...materials, upholstery_type: v })}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Room storytelling (helps AI matching)
            </h3>
            <Field
              label="Best used in"
              value={roomStorytelling.best_used_in ?? ""}
              onChange={(v) => setRoomStorytelling({ ...roomStorytelling, best_used_in: v })}
            />
            <Field
              label="Pairs well with"
              value={roomStorytelling.pairs_well_with ?? ""}
              onChange={(v) => setRoomStorytelling({ ...roomStorytelling, pairs_well_with: v })}
            />
            <Field
              label="Mood"
              value={roomStorytelling.mood ?? ""}
              onChange={(v) => setRoomStorytelling({ ...roomStorytelling, mood: v })}
            />
          </section>

          {saveError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {saveError}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
}
