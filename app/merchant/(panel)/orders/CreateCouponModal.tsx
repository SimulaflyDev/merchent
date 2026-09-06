"use client";

import { FormEvent, useState } from "react";
import { createCouponAction } from "@/lib/auth/coupon-actions";
import { callAction } from "@/lib/api/action-utils";

interface Props {
  onClose: () => void;
  onCreated: (message: string) => void;
}

export function CreateCouponModal({ onClose, onCreated }: Props) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [minimumOrder, setMinimumOrder] = useState("0");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const coupon = await callAction(
        createCouponAction({
          code,
          title,
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_amount: Number(minimumOrder),
          ...(maximumDiscount ? { max_discount_amount: Number(maximumDiscount) } : {}),
          ...(usageLimit ? { usage_limit: Number(usageLimit) } : {}),
        }),
      );
      onCreated(`Coupon ${coupon.code} created successfully.`);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message.replace(/^API \d+: /, "") : "Could not create coupon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close coupon form" />
      <form onSubmit={submit} className="relative w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create merchant coupon</h2>
            <p className="mt-1 text-sm text-gray-500">This coupon will only apply to orders from your shop.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">&times;</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Coupon code
            <input required maxLength={64} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono uppercase outline-none focus:border-[#1FAF9A]" placeholder="WELCOME10" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Display title
            <input required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#1FAF9A]" placeholder="Welcome offer" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Discount type
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "flat" | "percentage")} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#1FAF9A]">
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Discount value
            <input required min="0.01" max={discountType === "percentage" ? 100 : undefined} step="0.01" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#1FAF9A]" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Minimum order (₹)
            <input required min="0" step="0.01" type="number" value={minimumOrder} onChange={(e) => setMinimumOrder(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#1FAF9A]" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Usage limit <span className="font-normal text-gray-400">(optional)</span>
            <input min="1" step="1" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#1FAF9A]" />
          </label>
          {discountType === "percentage" && (
            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
              Maximum discount (₹) <span className="font-normal text-gray-400">(optional)</span>
              <input min="0.01" step="0.01" type="number" value={maximumDiscount} onChange={(e) => setMaximumDiscount(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#1FAF9A]" />
            </label>
          )}
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-[#1FAF9A] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Creating..." : "Create coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}
