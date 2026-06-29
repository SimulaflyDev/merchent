"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { callAction } from "@/lib/api/action-utils";
import { createMerchantAction, getMyMerchantsAction } from "@/lib/auth/merchant-actions";
import { uploadProductImageAction } from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";
import { resolveImageUrl } from "@/lib/api/image-utils";
import type { MerchantOut } from "@/lib/types/merchant";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORE_TYPES = ["Manufacturer", "Whole Seller", "Retailors"];

const PRODUCT_CATEGORIES = [
  "Sofas & Seating",
  "Tables & Desks",
  "Beds & Mattresses",
  "Storage & Shelves",
  "Lighting",
  "Rugs & Carpets",
  "Wall Art & Mirrors",
  "Outdoor Furniture",
  "Office Furniture",
  "Kitchen & Dining",
];

// ─── Shared Style Tokens ──────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#F8FAFB] border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:ring-2 focus:ring-[#0E9F88]/20 focus:border-[#0E9F88] outline-none text-[#111827] font-medium transition-colors placeholder:text-gray-400";
const labelCls =
  "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StepDot({ num, current }: { num: number; current: number }) {
  const done = current > num;
  const active = current === num;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${
          done
            ? "bg-[#0E9F88] border-[#0E9F88] text-white"
            : active
            ? "border-[#0E9F88] text-[#0E9F88] bg-white"
            : "border-gray-200 text-gray-300 bg-white"
        }`}
      >
        {done ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          num
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddShopClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // KYC gate state
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [hasNoShops, setHasNoShops] = useState(false);

  // Multi-step form state
  const [step, setStep] = useState(1); // 1 = Shop Info, 2 = Store Profile

  // ── Step 1: Shop Info ─────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rangeKm, setRangeKm] = useState("10");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  // ── Step 2: Store Profile ─────────────────────────────────────────────────
  const [storeType, setStoreType] = useState("");
  const [customStoreType, setCustomStoreType] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ─── On Mount: check KYC ──────────────────────────────────────────────────
  useEffect(() => {
    async function checkKyc() {
      try {
        const merchants = await callAction(getMyMerchantsAction());
        if (!merchants || merchants.length === 0) {
          setHasNoShops(true);
          setKycCompleted(false);
        } else {
          const verified = merchants.some((m: MerchantOut) => m.is_kyc_completed);
          setKycCompleted(verified);
          setHasNoShops(false);
        }
      } catch {
        setKycCompleted(false);
      } finally {
        setLoadingKyc(false);
      }
    }
    checkKyc();
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const fileToBase64 = (file: File): Promise<{ base64: string; mediaType: string }> =>
    new Promise((resolve, reject) => {
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

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select a valid image."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be under 2 MB."); return; }
    setError(null);
    setUploadingLogo(true);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      const fd = new FormData();
      fd.append("imageBase64", base64);
      fd.append("mediaType", mediaType);
      const result = await callAction(uploadProductImageAction(fd));
      setLogoUrl(result.url);
    } catch (err) {
      setError(isApiError(err) ? `Logo upload failed: ${err.detail}` : "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await res.json();
          if (data?.address) {
            const parts = [
              data.address.road || data.address.neighbourhood || "",
              data.address.suburb || data.address.city_district || "",
              data.address.city || data.address.town || data.address.village || "",
              data.address.state || "",
            ].filter(Boolean);
            if (parts.length && !address) setAddress(parts.join(", "));
          }
        } catch {
          // ignore geocoding failure
        } finally {
          setIsDetectingLoc(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to detect location. Please enter manually.");
        setIsDetectingLoc(false);
      }
    );
  };

  // ─── Step 1 validation & advance ─────────────────────────────────────────

  const handleNextStep = () => {
    setError(null);
    if (!displayName.trim()) { setError("Shop Display Name is required."); return; }
    if (!legalName.trim()) { setError("Legal Business Name is required."); return; }
    if (!address.trim()) { setError("Shop Address is required."); return; }
    const latVal = parseFloat(latitude);
    const lonVal = parseFloat(longitude);
    if (!latitude.trim() || isNaN(latVal)) { setError("Please enter a valid latitude."); return; }
    if (!longitude.trim() || isNaN(lonVal)) { setError("Please enter a valid longitude."); return; }
    const rangeVal = parseFloat(rangeKm);
    if (!rangeKm.trim() || isNaN(rangeVal) || rangeVal < 0) {
      setError("Please enter a valid delivery radius (0 or greater).");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Final submission ─────────────────────────────────────────────────────

  const handleSubmit = () => {
    setError(null);
    if (!storeType && !customStoreType) {
      setError("Please select a store type.");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Please select at least one product category.");
      return;
    }

    const latVal = parseFloat(latitude);
    const lonVal = parseFloat(longitude);
    const rangeVal = parseFloat(rangeKm);
    const finalStoreType = storeType === "__other" ? customStoreType : storeType;

    startTransition(async () => {
      try {
        await callAction(
          createMerchantAction({
            legal_name: legalName.trim(),
            display_name: displayName.trim(),
            support_email: supportEmail.trim() || undefined,
            support_phone: supportPhone.trim() || undefined,
            address: address.trim(),
            latitude: latVal,
            longitude: lonVal,
            range_km: rangeVal,
            logo_url: logoUrl || undefined,
            settings: {
              onboarding_completed: true,
              onboarding_data: {
                store_type: finalStoreType,
                categories: selectedCategories,
                description: storeDescription || undefined,
              },
            },
          })
        );
        router.push("/merchant/select_shop");
        router.refresh();
      } catch (err: any) {
        setError(isApiError(err) ? err.detail : err.message || "Failed to create shop.");
      }
    });
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loadingKyc) {
    return (
      <div className="min-h-screen bg-[#EDEEF0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0E9F88] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Checking your account…</p>
        </div>
      </div>
    );
  }

  // ─── No shops / not verified: redirect to onboarding ─────────────────────

  if (hasNoShops || !kycCompleted) {
    return (
      <div className="min-h-screen bg-[#EDEEF0] flex flex-col items-center justify-center py-12 px-4 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E4E8] overflow-hidden">
          {/* Header accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="p-8">
            {/* Icon */}
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>

            <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-2">
              Complete KYC First
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              To add a new shop, you need to complete your identity verification (KYC) for your
              primary account first. This only needs to be done once — all future shops will be
              automatically verified.
            </p>

            {/* Steps illustration */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-6 space-y-3">
              {[
                { icon: "🏪", title: "Complete Onboarding", desc: "Set up your first shop with full KYC" },
                { icon: "✅", title: "KYC Verified Once", desc: "Your identity is linked to your account" },
                { icon: "➕", title: "Add More Shops Easily", desc: "Future shops skip KYC automatically" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/merchant/onboarding"
                className="w-full py-3.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white font-extrabold rounded-xl text-sm text-center transition-all shadow-md shadow-emerald-700/10"
              >
                Go to Onboarding & Complete KYC →
              </Link>
              <Link
                href="/merchant/select_shop"
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-sm text-center transition-colors"
              >
                Back to My Shops
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── KYC Verified: Shop Verification Form ─────────────────────────────────

  return (
    <div className="min-h-screen bg-[#EDEEF0] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl w-full">

        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/merchant/select_shop" className="p-2 rounded-xl bg-white border border-[#E2E4E8] hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-[#111827] tracking-tight">Add New Shop</h1>
            <p className="text-xs text-gray-400 font-medium">Your identity is already verified — just fill in the shop details</p>
          </div>
        </div>

        {/* KYC verified badge */}
        <div className="mb-5 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[12px] font-semibold text-emerald-800">
            KYC verified — no re-verification needed for additional shops
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center mb-6">
          <StepDot num={1} current={step} />
          <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > 1 ? "bg-[#0E9F88]" : "bg-gray-200"}`} />
          <StepDot num={2} current={step} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">
          <span className={step === 1 ? "text-[#0E9F88]" : step > 1 ? "text-gray-500" : ""}>Shop Info</span>
          <span className={step === 2 ? "text-[#0E9F88]" : ""}>Store Profile</span>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#E2E4E8] overflow-hidden">

          {/* Top accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0E9F88] to-emerald-400" />

          <div className="p-8 space-y-6">

            {/* Error Banner */}
            {error && (
              <div className="px-4 py-3.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-2xl flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ══════════════════════════ STEP 1: SHOP INFO ══════════════════════════ */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight mb-1">Shop Information</h2>
                  <p className="text-[12px] text-gray-400">Enter the details specific to this new shop location.</p>
                </div>

                {/* Names */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Shop Display Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Acme Home — Koramangala"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Legal Business Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        required
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Acme Furniture Pvt. Ltd."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Shop Location
                    </h3>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Set Once · Locked After Creation
                    </span>
                  </div>

                  <div className="bg-amber-50/60 border border-dashed border-amber-200 rounded-2xl p-4 text-[12px] text-amber-800 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                      Once created, the shop's physical coordinates and address <strong>cannot be changed</strong>.
                      Please enter accurate values. To request a change later, contact <strong>support@simulafly.com</strong>.
                    </span>
                  </div>

                  {/* Auto-detect button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isDetectingLoc}
                      className="text-[11px] font-bold text-[#0E9F88] hover:text-[#0B7A69] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                      </svg>
                      {isDetectingLoc ? "Detecting…" : "Detect My Location"}
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Shop Address <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 42 MG Road, Bengaluru, Karnataka 560001"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Latitude <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. 12.9716"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Longitude <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. 77.5946"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Service / Delivery Radius (km) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={rangeKm}
                      onChange={(e) => setRangeKm(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 10"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Buyers outside this radius won't see or order from this shop.
                    </p>
                  </div>
                </div>

                {/* Step 1 CTA */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <Link
                    href="/merchant/select_shop"
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-center text-sm transition-colors uppercase"
                  >
                    Cancel
                  </Link>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-3.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white font-extrabold rounded-xl text-sm shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-2 uppercase"
                  >
                    Continue to Store Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* ══════════════════════ STEP 2: STORE PROFILE ══════════════════════════ */}
            {step === 2 && (
              <>
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight mb-1">Store Profile</h2>
                  <p className="text-[12px] text-gray-400">Tell buyers what this shop sells and how it looks.</p>
                </div>

                {/* Logo upload */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Branding
                  </h3>
                  <div className="flex items-center gap-5">
                    {/* Preview */}
                    <div
                      className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#0E9F88]/50 transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {logoUrl ? (
                        <img src={resolveImageUrl(logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }}
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-bold rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wide"
                      >
                        {uploadingLogo ? "Uploading…" : logoUrl ? "Change Logo" : "Upload Logo"}
                      </button>
                      <p className="text-[10px] text-gray-400 mt-1.5">PNG or JPG, max 2 MB. Square images work best.</p>
                    </div>
                  </div>
                </div>

                {/* Store Type */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    What kind of store is this?
                  </h3>
                  <div>
                    <label className={labelCls}>Store Type <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {STORE_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { setStoreType(type); setCustomStoreType(""); }}
                          className={`px-4 py-3 rounded-xl text-[12px] font-medium border transition-all text-left ${
                            storeType === type
                              ? "border-[#0E9F88] bg-[#0E9F88]/5 text-[#0E9F88]"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setStoreType("__other")}
                        className={`px-4 py-3 rounded-xl text-[12px] font-medium border transition-all text-left ${
                          storeType === "__other"
                            ? "border-[#0E9F88] bg-[#0E9F88]/5 text-[#0E9F88]"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        Other
                      </button>
                    </div>
                    {storeType === "__other" && (
                      <input
                        type="text"
                        value={customStoreType}
                        onChange={(e) => setCustomStoreType(e.target.value)}
                        placeholder="Describe your store type…"
                        className={`${inputCls} mt-3`}
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                {/* Product Categories */}
                <div>
                  <label className={labelCls}>Product Categories <span className="text-red-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {[...PRODUCT_CATEGORIES, ...selectedCategories.filter((c) => !PRODUCT_CATEGORIES.includes(c))].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-2 rounded-full text-[11px] font-bold border transition-all ${
                          selectedCategories.includes(cat)
                            ? "border-[#0E9F88] bg-[#0E9F88] text-white"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Custom category */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Add a custom category…"
                      className={`${inputCls} flex-1`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customCategory.trim()) {
                          e.preventDefault();
                          const cat = customCategory.trim();
                          if (!selectedCategories.includes(cat)) {
                            setSelectedCategories((p) => [...p, cat]);
                          }
                          setCustomCategory("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cat = customCategory.trim();
                        if (cat && !selectedCategories.includes(cat)) {
                          setSelectedCategories((p) => [...p, cat]);
                        }
                        setCustomCategory("");
                      }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-xl transition-colors uppercase"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Store Description */}
                <div>
                  <label className={labelCls}>Store Description</label>
                  <textarea
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell buyers what makes this shop special…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Step 2 CTAs */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-center text-sm transition-colors uppercase"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={pending}
                    className="flex-1 py-3.5 bg-[#0E9F88] hover:bg-[#0B7A69] disabled:opacity-60 text-white font-extrabold rounded-xl text-sm shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-2 uppercase"
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
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-gray-400 mt-5">
          Need help?{" "}
          <a href="mailto:support@simulafly.com" className="text-[#0E9F88] font-semibold hover:underline">
            support@simulafly.com
          </a>
        </p>
      </div>
    </div>
  );
}
