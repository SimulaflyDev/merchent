"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { callAction } from "@/lib/api/action-utils";
import {
  createMerchantAction,
  getMyMerchantsAction,
} from "@/lib/auth/merchant-actions";
import { setActiveMerchantAction } from "@/lib/auth/actions";
import { isApiError } from "@/lib/api/errors";
import type { MerchantOut } from "@/lib/types/merchant";

interface Props {
  shops: MerchantOut[];
  activeMerchantId: string;
}

// Status badge colours
const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Active" },
  suspended: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", label: "Suspended" },
  trial: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", label: "Trial" },
};

function ShopCard({
  shop,
  isActive,
  onSwitch,
}: {
  shop: MerchantOut;
  isActive: boolean;
  onSwitch: () => void;
}) {
  const st = statusConfig[shop.status] ?? statusConfig.active;
  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? "border-[#0E9F88] shadow-[0_0_0_3px_rgba(14,159,136,0.12)] shadow-md"
          : "border-[#E2E4E8] hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {/* Top accent */}
      <div
        className={`h-1 w-full ${
          isActive
            ? "bg-gradient-to-r from-[#0E9F88] to-emerald-400"
            : "bg-gradient-to-r from-gray-200 to-gray-100"
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Initials avatar */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                isActive
                  ? "bg-[#0E9F88] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {shop.display_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-[#111827] leading-tight">
                  {shop.display_name}
                </p>
                {isActive && (
                  <span className="text-[9px] font-bold bg-[#0E9F88] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{shop.legal_name}</p>
            </div>
          </div>
          {/* Status */}
          <span
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${st.bg} ${st.text} shrink-0`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>

        {/* IDs grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#F8FAFB] rounded-lg px-3 py-2 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Shop ID (MPSUID)
              </p>
              <p className="text-[11px] font-bold text-[#0E9F88] font-mono tracking-tight">
                {shop.shop_id ?? "—"}
              </p>
            </div>
            {shop.shop_id && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shop.shop_id!)}
                title="Copy Shop ID"
                className="text-gray-400 hover:text-[#0E9F88] transition-colors p-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
          <div className="bg-[#F8FAFB] rounded-lg px-3 py-2 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Partner ID (MPUID)
              </p>
              <p className="text-[11px] font-bold text-gray-600 font-mono tracking-tight">
                {shop.partner_id ?? "—"}
              </p>
            </div>
            {shop.partner_id && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shop.partner_id!)}
                title="Copy Partner ID"
                className="text-gray-400 hover:text-gray-700 transition-colors p-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        {(shop.address || shop.latitude) && (
          <div className="flex items-start gap-1.5 mb-4">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <p className="text-[11px] text-gray-500 leading-snug">
              {shop.address ?? `${shop.latitude}, ${shop.longitude}`}
            </p>
          </div>
        )}

        {/* Referral code */}
        <p className="text-[10px] text-gray-400 font-mono mb-4">
          Referral: <span className="font-bold text-gray-500">{shop.referral_code}</span>
        </p>

        {/* Actions */}
        {isActive ? (
          <div className="flex items-center gap-2 text-[11px] text-[#0E9F88] font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Currently active shop
          </div>
        ) : (
          <button
            onClick={onSwitch}
            className="w-full py-2 bg-[#F5F5F7] hover:bg-[#111827] hover:text-white text-[#111827] rounded-lg text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch to this shop
          </button>
        )}
      </div>
    </div>
  );
}

// Modal: Create New Shop
function CreateShopModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rangeKm, setRangeKm] = useState("10");
  const [stateCode, setStateCode] = useState("DL");
  const [cityCode, setCityCode] = useState("N");
  const [referredByCode, setReferredByCode] = useState("");

  const inputCls =
    "w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0E9F88]/20 focus:border-[#0E9F88] outline-none text-[#111827] font-medium transition-colors placeholder:text-gray-400";
  const labelCls =
    "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latVal = latitude.trim() !== "" ? parseFloat(latitude) : null;
    const lonVal = longitude.trim() !== "" ? parseFloat(longitude) : null;
    const rangeVal = rangeKm.trim() !== "" ? parseFloat(rangeKm) : null;

    if (latitude.trim() !== "" && isNaN(latVal!)) {
      setError("Latitude must be a valid number (e.g. 12.9716).");
      return;
    }
    if (longitude.trim() !== "" && isNaN(lonVal!)) {
      setError("Longitude must be a valid number (e.g. 77.5946).");
      return;
    }
    if (rangeKm.trim() !== "" && (isNaN(rangeVal!) || rangeVal! < 0)) {
      setError("Service Range must be a positive number (0 or greater).");
      return;
    }

    startTransition(async () => {
      try {
        await callAction(
          createMerchantAction({
            legal_name: legalName.trim(),
            display_name: displayName.trim(),
            support_email: supportEmail.trim() || undefined,
            support_phone: supportPhone.trim() || undefined,
            address: address.trim() || null,
            latitude: latVal,
            longitude: lonVal,
            range_km: rangeVal,
            state_code: stateCode.trim().toUpperCase() || "DL",
            city_code: cityCode.trim().toUpperCase() || "N",
            referred_by_code: referredByCode.trim() || undefined,
          })
        );
        onCreated();
      } catch (err: any) {
        setError(isApiError(err) ? err.detail : err.message || "Failed to create shop.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gray-900 to-[#111827] p-5 text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-[16px] font-bold">Create New Shop</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              A unique Shop ID and Partner ID will be auto-generated.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Section: Business Info */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Business Information
            </p>
            <div>
              <label className={labelCls}>Legal Business Name *</label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Acme Furniture Pvt. Ltd."
              />
            </div>
            <div>
              <label className={labelCls}>Display Name *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Acme Home"
              />
            </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={inputCls}
                  placeholder="support@shop.com"
                />
              </div>
              <div>
                <label className={labelCls}>Support Phone</label>
                <input
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          {/* Section: Shop Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Shop Location
              </p>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Set Once · Locked After Creation
              </span>
            </div>
            <div className="bg-amber-50/60 border border-dashed border-amber-200 rounded-xl p-3 text-[11px] text-amber-700 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Once set, shop location <strong>cannot be edited</strong>. Please enter
                accurate details. To change later, email{" "}
                <strong>support@simulafly.com</strong>.
              </span>
            </div>
            <div>
              <label className={labelCls}>Shop Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputCls}
                placeholder="e.g. 42 MG Road, Bengaluru, Karnataka 560001"
              />
            </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 12.9716"
                />
              </div>
              <div>
                <label className={labelCls}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 77.5946"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Service/Delivery Range (km) *</label>
              <input
                type="number"
                step="any"
                required
                value={rangeKm}
                onChange={(e) => setRangeKm(e.target.value)}
                className={inputCls}
                placeholder="e.g. 10"
              />
              <p className="text-[10px] text-gray-400 mt-1">Users further than this distance won't be able to see or buy from your shop.</p>
            </div>
          </div>

          {/* Section: Regional Routing & ID Specs */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Regional Routing & ID Generation
            </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>State Code (2-letter)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  className={inputCls}
                  placeholder="e.g. MH, DL, KA, BR, UP"
                />
              </div>
              <div>
                <label className={labelCls}>City Code (1-character)</label>
                <input
                  type="text"
                  maxLength={1}
                  value={cityCode}
                  onChange={(e) => setCityCode(e.target.value.toUpperCase())}
                  className={inputCls}
                  placeholder="e.g. M (Mumbai), N (Noida), P (Patna)"
                />
              </div>
            </div>
          </div>

          {/* Section: Optional */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Optional
            </p>
            <div>
              <label className={labelCls}>Referral Code</label>
              <input
                type="text"
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value)}
                className={inputCls}
                placeholder="Enter a referral code if you have one"
              />
            </div>
          </div>

          {/* Auto-generated IDs note */}
          <div className="bg-[#F8FAFB] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E9F88]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#0E9F88]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#111827]">Auto-Generated MPUID & MPSUID Architecture</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                <span className="font-mono font-bold text-[#0E9F88]">Shop ID</span> (MPSUID: SIM-S-{stateCode ? "000142" : "000142"}-01-{cityCode || "N"}) and{" "}
                <span className="font-mono font-bold text-gray-500">Partner ID</span> (MPUID: SIM-M-{stateCode || "DL"}-000142-{cityCode || "N"}) will be auto-generated.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 bg-[#0E9F88] hover:bg-[#0B7A69] disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Shop…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Shop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShopsClient({ shops: initialShops, activeMerchantId }: Props) {
  const router = useRouter();
  const [shops, setShops] = useState(initialShops);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const handleSwitch = async (shopId: string) => {
    setSwitching(shopId);
    setSwitchError(null);
    try {
      await setActiveMerchantAction(shopId);
      window.location.href = "/merchant/dashboard";
    } catch (err: any) {
      setSwitchError(isApiError(err) ? err.detail : "Failed to switch shop.");
    } finally {
      setSwitching(null);
    }
  };

  const handleShopCreated = async () => {
    setShowCreateModal(false);
    // Re-fetch shops and redirect to dashboard (new shop is now active)
    router.push("/merchant/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 sm:pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E4E8] pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">My Shops</h1>
          <p className="text-sm text-gray-500 mt-1">
            You have{" "}
            <span className="font-bold text-[#111827]">{shops.length}</span>{" "}
            {shops.length === 1 ? "shop" : "shops"}. Switch between them or create a new one.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E9F88] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/10 transition-all hover:bg-[#0B7A69] sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Shop
        </button>
      </div>

      {/* Switch error */}
      {switchError && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {switchError}
        </div>
      )}

      {/* Info banner */}
      <div className="mb-8 bg-gradient-to-br from-[#0E9F88]/5 to-emerald-50 border border-[#0E9F88]/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#0E9F88]/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#0E9F88]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#0B7A69] mb-0.5">Multi-Shop Management</p>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Each shop gets a unique <span className="font-mono font-bold">Shop ID</span> (SXXX) and{" "}
            <span className="font-mono font-bold">Partner ID</span> (mXXXXXXX) auto-generated at creation.
            Shop location is <strong>set once during creation</strong> and cannot be changed afterwards.
            Use the switcher below to manage multiple shops from one account.
          </p>
        </div>
      </div>

      {/* Shops Grid */}
      {shops.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="text-[#111827] font-bold text-lg mb-2">No shops yet</p>
          <p className="text-gray-500 text-sm mb-6">Create your first shop to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#0E9F88] hover:bg-[#0B7A69] text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            Create First Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {shops.map((shop) =>
            switching === shop.id ? (
              <div key={shop.id} className="bg-white rounded-2xl border border-[#0E9F88]/30 p-5 flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3 text-[#0E9F88]">
                  <div className="w-8 h-8 border-2 border-[#0E9F88] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold">Switching shop…</p>
                </div>
              </div>
            ) : (
              <ShopCard
                key={shop.id}
                shop={shop}
                isActive={shop.id === activeMerchantId}
                onSwitch={() => handleSwitch(shop.id)}
              />
            )
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateShopModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleShopCreated}
        />
      )}
    </div>
  );
}
