"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { updateMerchantAction } from "@/lib/auth/merchant-actions";
import { uploadProductImageAction } from "@/lib/auth/product-actions";
import {
  sendEmailOtpAction,
  verifyEmailOtpAction,
  sendMobileOtpAction,
  verifyMobileOtpAction,
} from "@/lib/auth/actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";
import { resolveImageUrl } from "@/lib/api/image-utils";
import Spinner from "@/app/merchant/components/Spinner";
import type { MerchantOut } from "@/lib/types/merchant";

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

interface Props {
  initialMerchant: MerchantOut;
  currentUser: {
    email: string;
    phone: string | null;
  };
}

export default function SettingsClient({ initialMerchant, currentUser }: Props) {
  const [merchant, setMerchant] = useState(initialMerchant);
  const [pending, startTransition] = useTransition();

  // --- Form fields state ---
  // Group 2: OTP-Protected
  const [displayName, setDisplayName] = useState(merchant.display_name);
  const [supportEmail, setSupportEmail] = useState(merchant.support_email ?? "");
  const [supportPhone, setSupportPhone] = useState(merchant.support_phone ?? "");
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Group 1: Directly Saveable
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (merchant.settings?.onboarding_data as any)?.categories ?? []
  );
  const [storeDescription, setStoreDescription] = useState(
    (merchant.settings?.onboarding_data as any)?.description ?? ""
  );
  const [latitude, setLatitude] = useState(
    merchant.latitude !== null && merchant.latitude !== undefined ? String(merchant.latitude) : ""
  );
  const [longitude, setLongitude] = useState(
    merchant.longitude !== null && merchant.longitude !== undefined ? String(merchant.longitude) : ""
  );

  // Group 3: Read-Only snapshot from DB/Onboarding
  const legalName = merchant.legal_name;
  const gstNumber = (merchant.settings?.onboarding_data as any)?.gst_number ?? "";
  const storeType = (merchant.settings?.onboarding_data as any)?.store_type ?? "";
  const registeredEmail = currentUser.email;
  const registeredPhone = merchant.support_phone ?? "";
  const locality = (merchant.settings?.onboarding_data as any)?.locality ?? "";
  const city = (merchant.settings?.onboarding_data as any)?.city ?? "";
  const businessState = (merchant.settings?.onboarding_data as any)?.state ?? "";

  // Other UI States
  const [customCategory, setCustomCategory] = useState("");
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- OTP Modal States ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpChannel, setOtpChannel] = useState<"email" | "mobile">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Cooldown countdown effect
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => {
      setOtpCooldown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  // Word count utility
  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  const wordCount = getWordCount(storeDescription);
  const isDescriptionTooLong = wordCount > 250;

  // File Upload Helper
  const fileToBase64 = (file: File): Promise<{ base64: string; mediaType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const result = reader.result as string;
        const match = result.match(/^data:(.+);base64,(.+)$/);
        if (!match) {
          reject(new Error("Parse error"));
          return;
        }
        resolve({ mediaType: match[1], base64: match[2] });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file for the logo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Logo image must be under 2 MB.");
      return;
    }
    setProfileError(null);
    setUploadingLogo(true);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      const formData = new FormData();
      formData.append("imageBase64", base64);
      formData.append("mediaType", mediaType);
      const result = await callAction(uploadProductImageAction(formData));
      setLogoUrl(result.url);
    } catch (err: any) {
      setProfileError(isApiError(err) ? `Logo upload failed: ${err.detail}` : "Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddCustomCategory = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customCategory.trim()) {
      e.preventDefault();
      const newCat = customCategory.trim();
      if (!selectedCategories.includes(newCat)) {
        setSelectedCategories([...selectedCategories, newCat]);
      }
      setCustomCategory("");
    }
  };

  // Check if Group 2 (OTP-Protected) fields were altered
  const checkHasGroup2Changes = () => {
    const dNameChanged = displayName.trim() !== merchant.display_name;
    const emailChanged = supportEmail.trim() !== (merchant.support_email ?? "");
    const phoneChanged = supportPhone.trim() !== (merchant.support_phone ?? "");
    const logoChanged = logoUrl !== (merchant.logo_url ?? "");
    return dNameChanged || emailChanged || phoneChanged || logoChanged;
  };

  // Submit flow
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);

    if (isDescriptionTooLong) {
      setProfileError("Short store description cannot exceed 250 words.");
      return;
    }

    const hasGroup2Changes = checkHasGroup2Changes();

    if (hasGroup2Changes) {
      // Trigger OTP Modal
      setOtpSent(false);
      setOtpCode("");
      setOtpError(null);
      setShowOtpModal(true);
    } else {
      // Direct save Group 1 updates
      saveChanges();
    }
  };

  const saveChanges = async () => {
    startTransition(async () => {
      try {
        const latVal = latitude.trim() !== "" ? parseFloat(latitude) : null;
        const lonVal = longitude.trim() !== "" ? parseFloat(longitude) : null;
        if ((latVal !== null && isNaN(latVal)) || (lonVal !== null && isNaN(lonVal))) {
          throw new Error("Latitude and Longitude must be valid numbers");
        }

        const currentOnboardingData = (merchant.settings?.onboarding_data as any) || {};
        const settingsPayload = {
          ...merchant.settings,
          onboarding_completed: true,
          onboarding_data: {
            ...currentOnboardingData,
            categories: selectedCategories,
            description: storeDescription || undefined,
          },
        };

        const updated = await callAction(
          updateMerchantAction(merchant.id, {
            display_name: displayName.trim(),
            support_email: supportEmail.trim() || undefined,
            support_phone: supportPhone.trim() || undefined,
            logo_url: logoUrl || undefined,
            latitude: latVal,
            longitude: lonVal,
            settings: settingsPayload,
          })
        );
        setMerchant(updated);
        setProfileSaved(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        setProfileError(isApiError(err) ? err.detail : err.message || "Failed to save changes");
      }
    });
  };

  // OTP Verification Actions
  const handleSendOtp = async () => {
    setOtpError(null);
    setIsSendingOtp(true);
    try {
      if (otpChannel === "email") {
        await callAction(sendEmailOtpAction());
        setOtpSent(true);
        setOtpCooldown(60);
      } else {
        if (!registeredPhone) {
          throw new Error("No registered contact number on file. Please verify via Registered Business Email.");
        }
        await callAction(sendMobileOtpAction(registeredPhone));
        setOtpSent(true);
        setOtpCooldown(60);
      }
    } catch (err: any) {
      setOtpError(isApiError(err) ? err.detail : err.message || "Failed to send OTP code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndCommit = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError("Please enter a valid OTP code.");
      return;
    }
    setOtpError(null);
    setIsVerifyingOtp(true);
    try {
      if (otpChannel === "email") {
        await callAction(verifyEmailOtpAction(otpCode));
        setShowOtpModal(false);
        await saveChanges();
      } else {
        if (!registeredPhone) {
          throw new Error("No registered contact number on file.");
        }
        await callAction(verifyMobileOtpAction(registeredPhone, otpCode));
        setShowOtpModal(false);
        await saveChanges();
      }
    } catch (err: any) {
      setOtpError(isApiError(err) ? err.detail : err.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Helper maskers
  const maskEmail = (email: string) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (local.length <= 2) return `**@${domain}`;
    return `${local.substring(0, 2)}***@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "No phone registered";
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length <= 4) return "****";
    return `******${cleaned.slice(-4)}`;
  };

  // Shared classes
  const inputCls =
    "w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0E9F88]/20 focus:border-[#0E9F88] outline-none text-neutral-dark font-medium transition-colors";
  const readOnlyInputCls =
    "w-full bg-[#F3F4F6] border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none text-gray-500 font-medium cursor-not-allowed select-none";
  const labelCls = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="p-6 pb-24 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2E4E8] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store information, product category associations, and contact channels.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {profileError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5 shadow-sm animate-pulse">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <span className="font-semibold">Error saving changes: </span>
            {profileError}
          </div>
        </div>
      )}

      {profileSaved && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-start gap-2.5 shadow-sm">
          <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <span className="font-semibold">Success! </span>
            Your store settings have been updated successfully.
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSubmit} className="space-y-8">
        {/* Section 1: Store Branding & Contact (OTP verification required) */}
        <section className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-[#0E9F88]" />
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Store Branding & Contact</h2>
              <p className="text-xs text-gray-400 mt-0.5">Editing these fields triggers secure OTP verification.</p>
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              OTP Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Upload Card */}
            <div className="md:col-span-1 flex flex-col justify-center">
              <label className={labelCls}>Store Logo</label>
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoUpload(f);
                }}
                className="sr-only"
              />
              <div
                onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#0E9F88]/40 rounded-xl p-5 text-center transition-colors cursor-pointer bg-[#F8FAFB] flex flex-col items-center justify-center min-h-[160px]"
              >
                {logoUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={resolveImageUrl(logoUrl)}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-100 mb-2 shadow-sm"
                    />
                    <p className="text-[11px] font-semibold text-emerald-600">Logo Uploaded</p>
                    <p className="text-[9px] text-gray-400">Click to replace</p>
                  </div>
                ) : uploadingLogo ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-8 h-8 border-2 border-[#0E9F88] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs font-bold text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="text-[11px] font-bold text-gray-500">Upload logo</p>
                    <p className="text-[9px] text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className={labelCls}>Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Acme Furnitures"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Support Email Address</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className={inputCls}
                    placeholder="support@company.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Support Contact Number</label>
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
          </div>
        </section>

        {/* Section 2: General Settings & Categories (Direct Save - No OTP required) */}
        <section className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Store Description & Categories</h2>
              <p className="text-xs text-gray-400 mt-0.5">These changes are saved instantly without OTP verification.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Direct Save
            </span>
          </div>

          <div className="space-y-6">
            {/* Categories Selection */}
            <div>
              <label className={labelCls}>Product Categories</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  ...PRODUCT_CATEGORIES,
                  ...selectedCategories.filter((c) => !PRODUCT_CATEGORIES.includes(c)),
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      selectedCategories.includes(cat)
                        ? "border-[#0E9F88] bg-[#0E9F88] text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Add Custom Category */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Type custom category & press Enter..."
                  className={`${inputCls} py-2 text-xs`}
                  onKeyDown={handleAddCustomCategory}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCategory.trim()) {
                      const newCat = customCategory.trim();
                      if (!selectedCategories.includes(newCat)) {
                        setSelectedCategories([...selectedCategories, newCat]);
                      }
                      setCustomCategory("");
                    }
                  }}
                  className="bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Short Store Description
                </label>
                <span className={`text-[10px] font-semibold ${isDescriptionTooLong ? "text-red-500 font-bold" : "text-gray-400"}`}>
                  {wordCount}/250 words
                </span>
              </div>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Briefly describe your store products and services..."
                className={`${inputCls} resize-none min-h-[110px] ${isDescriptionTooLong ? "border-red-300 focus:ring-red-200 focus:border-red-500" : ""}`}
              />
              {isDescriptionTooLong && (
                <p className="text-red-500 text-[11px] mt-1 font-medium">
                  Word limit exceeded. Please shorten your description to under 250 words.
                </p>
              )}
            </div>

            {/* Store Coordinates */}
            <div className="border-t border-[#F1F3F5] pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Store Coordinates
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      alert("Geolocation is not supported by your browser");
                      return;
                    }
                    setIsDetectingLoc(true);
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setLatitude(String(position.coords.latitude));
                        setLongitude(String(position.coords.longitude));
                        setIsDetectingLoc(false);
                      },
                      (error) => {
                        console.error("Error getting geolocation:", error);
                        alert("Failed to detect location. Please input coordinates manually.");
                        setIsDetectingLoc(false);
                      }
                    );
                  }}
                  disabled={isDetectingLoc}
                  className="text-xs font-semibold text-[#0E9F88] hover:text-[#0B7A69] disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                  </svg>
                  {isDetectingLoc ? "Detecting..." : "Detect store coordinates"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
        </section>

        {/* Section 3: Registered Info (Read-Only / SimulaFly Manual Verification Required) */}
        <section className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between mb-5 border-b border-gray-200/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-700 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Verified Business Credentials
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                These credentials cannot be changed on your own. Contact SimulaFly support to update.
              </p>
            </div>
            <span className="bg-gray-200 text-gray-600 border border-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
              Locked Info
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Legal Business Name</label>
              <input type="text" readOnly value={legalName || "Not Available"} className={readOnlyInputCls} />
            </div>

            <div>
              <label className={labelCls}>GST Number</label>
              <input type="text" readOnly value={gstNumber || "Not Provided"} className={readOnlyInputCls} />
            </div>

            <div>
              <label className={labelCls}>Store Type</label>
              <input type="text" readOnly value={storeType || "Not Specified"} className={readOnlyInputCls} />
            </div>

            <div>
              <label className={labelCls}>Registered Mobile Number</label>
              <input type="text" readOnly value={registeredPhone || "Not Registered"} className={readOnlyInputCls} />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Registered Business Email</label>
              <input type="text" readOnly value={registeredEmail || "Not Registered"} className={readOnlyInputCls} />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Registered Business Address</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Locality</span>
                  <input type="text" readOnly value={locality || "—"} className={readOnlyInputCls} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">City</span>
                  <input type="text" readOnly value={city || "—"} className={readOnlyInputCls} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">State</span>
                  <input type="text" readOnly value={businessState || "—"} className={readOnlyInputCls} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Actions Footer */}
        <div className="fixed bottom-0 left-0 md:left-[var(--sidebar-width)] right-0 bg-white/95 backdrop-blur border-t border-[#E2E4E8] py-4 px-6 z-40 flex items-center justify-between shadow-lg transition-all duration-300">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
            <span className="text-xs text-gray-400 hidden sm:inline">
              Make sure to save changes before leaving the page.
            </span>
            <div className="flex gap-3 ml-auto">
              <button
                type="submit"
                disabled={pending || isDescriptionTooLong}
                className="px-6 py-2.5 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69] disabled:opacity-50 text-sm font-bold shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20 transition-all flex items-center gap-2"
              >
                {pending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "SAVE CHANGE"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* --- OTP Verification Modal --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Verify Change Request</h3>
                <p className="text-xs text-gray-400 mt-0.5">A verification code is required to update secure fields.</p>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Explanatory banner */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
                You are changing sensitive contact credentials. Choose where you want to receive the 6-digit OTP code below.
              </div>

              {/* Selection cards */}
              {!otpSent && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Select Verification Method
                  </label>
                  
                  {/* Email option */}
                  <div
                    onClick={() => setOtpChannel("email")}
                    className={`border p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 hover:bg-gray-50 ${
                      otpChannel === "email" ? "border-[#0E9F88] bg-emerald-50/20" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={otpChannel === "email"}
                      onChange={() => setOtpChannel("email")}
                      className="text-[#0E9F88] focus:ring-[#0E9F88] h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700">Registered Business Email</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{maskEmail(registeredEmail)}</p>
                    </div>
                  </div>

                  {/* Mobile option */}
                  <div
                    onClick={() => registeredPhone && setOtpChannel("mobile")}
                    className={`border p-3 rounded-xl transition-all flex items-center gap-3 ${
                      !registeredPhone
                        ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                        : "cursor-pointer hover:bg-gray-50 " +
                          (otpChannel === "mobile" ? "border-[#0E9F88] bg-emerald-50/20" : "border-gray-200")
                    }`}
                  >
                    <input
                      type="radio"
                      disabled={!registeredPhone}
                      checked={otpChannel === "mobile"}
                      onChange={() => setOtpChannel("mobile")}
                      className="text-[#0E9F88] focus:ring-[#0E9F88] h-4 w-4 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700">Registered Contact Number</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {registeredPhone ? maskPhone(registeredPhone) : "No mobile registered"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status or error alerts */}
              {otpError && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-shake">
                  {otpError}
                </div>
              )}

              {/* OTP Action controls */}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Verification Code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Sent confirmation */}
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      OTP successfully sent to your{" "}
                      <span className="font-semibold">{otpChannel === "email" ? "Registered Email" : "Registered Contact"}</span>.
                    </span>
                  </div>

                  {/* Digit Input */}
                  <div>
                    <label className={labelCls}>Enter 6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className={`${inputCls} text-center tracking-[0.6em] text-lg font-bold font-mono`}
                      placeholder="******"
                      autoFocus
                    />
                  </div>

                  {/* Resend and Actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={otpCooldown > 0 || isSendingOtp}
                      onClick={handleSendOtp}
                      className="text-[#0E9F88] font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : "Resend Verification Code"}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Change Channel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyAndCommit}
                      disabled={isVerifyingOtp || otpCode.length < 4}
                      className="flex-1 py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Save"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
