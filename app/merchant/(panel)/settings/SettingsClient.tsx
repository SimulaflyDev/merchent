"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { updateMerchantAction, getReferredMerchantsAction } from "@/lib/auth/merchant-actions";
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
  const [rangeKm, setRangeKm] = useState(
    merchant.range_km !== null && merchant.range_km !== undefined ? String(merchant.range_km) : "10"
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

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState<"profile" | "setup" | "referral" | "billing" | "notifications" | "security">("profile");

  // --- Referral List State ---
  const [referredMerchants, setReferredMerchants] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  // --- Notifications State ---
  const [emailNewOrder, setEmailNewOrder] = useState<boolean>(
    (merchant.settings?.notifications as any)?.email_new_order ?? true
  );
  const [emailOrderStatus, setEmailOrderStatus] = useState<boolean>(
    (merchant.settings?.notifications as any)?.email_order_status ?? true
  );
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState<boolean>(
    (merchant.settings?.notifications as any)?.email_weekly_digest ?? false
  );
  const [whatsappNewOrder, setWhatsappNewOrder] = useState<boolean>(
    (merchant.settings?.notifications as any)?.whatsapp_new_order ?? true
  );
  const [whatsappWalletAlert, setWhatsappWalletAlert] = useState<boolean>(
    (merchant.settings?.notifications as any)?.whatsapp_wallet_alert ?? true
  );

  // --- Security State ---
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(
    (merchant.settings?.security as any)?.two_factor_auth ?? false
  );
  const [sessionTimeout, setSessionTimeout] = useState<string>(
    (merchant.settings?.security as any)?.session_timeout ?? "60"
  );
  const [allowedIps, setAllowedIps] = useState<string>(
    (merchant.settings?.security as any)?.allowed_ips ?? ""
  );

  // Fetch referrals on tab switch
  useEffect(() => {
    if (activeTab === "referral") {
      setLoadingReferrals(true);
      callAction(getReferredMerchantsAction(merchant.id))
        .then((res) => {
          setReferredMerchants(res || []);
        })
        .catch((err) => {
          console.error("Failed to load referred merchants", err);
        })
        .finally(() => {
          setLoadingReferrals(false);
        });
    }
  }, [activeTab, merchant.id]);

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
        const rangeVal = rangeKm.trim() !== "" ? parseFloat(rangeKm) : null;
        if (rangeKm.trim() !== "" && (isNaN(rangeVal!) || rangeVal! < 0)) {
          throw new Error("Service Range must be a positive number (0 or greater)");
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
          notifications: {
            email_new_order: emailNewOrder,
            email_order_status: emailOrderStatus,
            email_weekly_digest: emailWeeklyDigest,
            whatsapp_new_order: whatsappNewOrder,
            whatsapp_wallet_alert: whatsappWalletAlert,
          },
          security: {
            two_factor_auth: twoFactorAuth,
            session_timeout: sessionTimeout,
            allowed_ips: allowedIps,
          }
        };

        const updated = await callAction(
          updateMerchantAction(merchant.id, {
            display_name: displayName.trim(),
            support_email: supportEmail.trim() || undefined,
            support_phone: supportPhone.trim() || undefined,
            logo_url: logoUrl || undefined,
            range_km: rangeVal,
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

  const tabs = [
    { id: "profile", label: "Business Profile", desc: "Branding, contact info & legal credentials", icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
    { id: "setup", label: "Store Setup", desc: "Categories, description & range", icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    )},
    { id: "referral", label: "Referral & Rewards", desc: "Invite code, payouts & history", icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )},
    { id: "billing", label: "Billing Info", desc: "Subscription details & wallet summary", icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )},
    { id: "notifications", label: "Notifications", desc: "Email & WhatsApp preferences", icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    )},
    { id: "security", label: "Security", desc: "Two-factor auth & session safety", icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )},
  ] as const;

  return (
    <div className="p-6 pb-24 max-w-5xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="border-b border-[#E2E4E8] pb-5">
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings, store profiles, payouts, and notification frequencies.
        </p>
      </div>

      {/* Two Column Layout: Left Tabs List, Right Active tab panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 items-start">
        
        {/* Left tabs List */}
        <div className="flex flex-col space-y-1 bg-white p-3 rounded-2xl border border-[#E2E4E8] shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setProfileError(null);
                  setProfileSaved(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left ${
                  isActive
                    ? "bg-[#111827] text-white font-medium shadow-sm"
                    : "text-gray-500 hover:bg-[#F5F5F7] hover:text-[#111827]"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}>
                  {tab.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold leading-tight">{tab.label}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-gray-300" : "text-gray-400"}`}>{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Panel */}
        <div className="flex flex-col gap-6">
          
          {/* Notification banners */}
          {profileError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5 shadow-sm">
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

          <form onSubmit={handleSaveSubmit} className="space-y-6">
            
            {/* 1. BUSINESS PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden">
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
                </div>

                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5 border-b border-gray-200/60 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-gray-700 flex items-center gap-1.5">
                        <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

                    {/* Shop Location */}
                    <div className="md:col-span-2">
                      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                          </svg>
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-amber-800 mb-0.5">Shop Location <span className="text-[9px] font-bold uppercase tracking-wider border border-amber-300 text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full ml-1">Set Once · Locked</span></p>
                            <p className="text-[11px] text-amber-700 mb-2">Location can only be set once during shop creation and cannot be changed here. To update your shop location, email <span className="font-semibold">support@simulafly.com</span>.</p>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold block mb-1">Address</span>
                                <input type="text" readOnly value={merchant.address || "Not provided"} className={readOnlyInputCls} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Latitude</span>
                                  <input type="text" readOnly value={merchant.latitude !== null && merchant.latitude !== undefined ? String(merchant.latitude) : "Not set"} className={readOnlyInputCls} />
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Longitude</span>
                                  <input type="text" readOnly value={merchant.longitude !== null && merchant.longitude !== undefined ? String(merchant.longitude) : "Not set"} className={readOnlyInputCls} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={pending}
                    className="px-6 py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                  >
                    {pending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    SAVE CHANGE
                  </button>
                </div>
              </div>
            )}

            {/* 2. STORE SETUP TAB */}
            {activeTab === "setup" && (
              <div className="space-y-6 bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden">
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

                  {/* Service Range */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Service/Delivery Range (km)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={rangeKm}
                      onChange={(e) => setRangeKm(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 10"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Configure the delivery radius of your shop. Users outside this range cannot view or buy products.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                  <button
                    type="submit"
                    disabled={pending || isDescriptionTooLong}
                    className="px-6 py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                  >
                    {pending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    SAVE CHANGE
                  </button>
                </div>
              </div>
            )}

            {/* 3. REFERRAL & REWARDS TAB */}
            {activeTab === "referral" && (
              <div className="space-y-6">
                
                {/* Referral Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-[#E2E4E8] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referred Signups</p>
                      <p className="text-3xl font-extrabold text-gray-900 mt-1">{referredMerchants.length}</p>
                      <p className="text-[11px] text-gray-500 mt-1">Shops registered with your code</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0E9F88] flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E4E8] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rewards Earned</p>
                      <p className="text-3xl font-extrabold text-gray-900 mt-1">
                        ₹{(referredMerchants.filter(m => m.referral_bonus_paid).length * 500).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">₹500 per active verified signup</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Referral Code Box */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Your Unique Referral Link</h3>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        Share this code with other business owners. When they complete KYC, you both get ₹500 and ₹1,000 respectively!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#F8FAFB] border border-gray-200 rounded-xl px-4 py-2.5">
                      <code className="text-sm font-bold text-[#0B7A69] font-mono tracking-wider">
                        {merchant.referral_code}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(merchant.referral_code);
                          alert("Referral code copied to clipboard!");
                        }}
                        className="p-1 rounded text-gray-400 hover:text-[#0E9F88] hover:bg-gray-100 transition-colors"
                        title="Copy Code"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referred Merchants History List */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#F1F3F5] bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Referred Businesses</h3>
                  </div>

                  <div className="divide-y divide-[#F1F3F5]">
                    {loadingReferrals ? (
                      <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#0E9F88] border-t-transparent rounded-full animate-spin" />
                        <span>Loading referrals history...</span>
                      </div>
                    ) : referredMerchants.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 italic">
                        No shops referred yet. Share your code to earn wallet balance rewards!
                      </div>
                    ) : (
                      referredMerchants.map((refM) => (
                        <div key={refM.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{refM.display_name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Joined: {new Date(refM.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            {refM.is_kyc_completed ? (
                              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                KYC Verified
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                KYC Pending
                              </span>
                            )}

                            {refM.referral_bonus_paid ? (
                              <span className="text-[9.5px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Bonus Disbursed
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Processing Payout
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 4. BILLING INFO TAB */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                
                {/* Subscription Card */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#111827]" />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-[#111827] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                        Active Plan
                      </span>
                      <h2 className="text-xl font-extrabold text-gray-900 mt-2.5">SimulaFly Prime Merchant</h2>
                      <p className="text-xs text-gray-500 mt-1">Automatic matching system, unlimited AI leads, and search indices.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  <hr className="my-5 border-gray-100" />

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Billing Cycle</p>
                      <p className="text-gray-800 font-medium mt-1">Lifetime Free Developer Trial</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Next Renewal</p>
                      <p className="text-gray-800 font-medium mt-1">N/A (Unlimited Access)</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0E9F88] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wallet Balance Status</p>
                      <p className="text-2xl font-black text-gray-900 mt-0.5">
                        ₹{merchant.is_kyc_completed ? "10,012.75" : "0.00"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">Used for unlocking leads and AI interactions.</p>
                    </div>
                  </div>

                  <a
                    href="/merchant/billing"
                    className="px-5 py-3 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-xs font-bold rounded-lg shadow-md transition-all text-center shrink-0"
                  >
                    Recharge Wallet
                  </a>
                </div>

                {/* Billing Details Summary */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#F1F3F5] bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Billing Info Summary</h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Billing Entity</p>
                      <p className="text-gray-800 font-bold">{legalName}</p>
                      <p className="text-gray-500 mt-0.5">GSTIN: {gstNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Receipts & Invoices</p>
                      <p className="text-gray-800">Sent automatically to your registered business email:</p>
                      <p className="text-[#0E9F88] font-semibold mt-0.5">{registeredEmail}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 5. NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-[#111827]" />
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">Notification Preferences</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Configure how you receive new order alerts and reports.</p>
                  </div>
                  <span className="bg-[#111827] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Alert Channels
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">Email Alerts</h3>
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-700">New Order Alerts</p>
                          <p className="text-[11px] text-gray-500">Receive an email immediately when a new customer purchase intent is received.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailNewOrder}
                          onChange={(e) => setEmailNewOrder(e.target.checked)}
                          className="h-4 w-4 text-[#0E9F88] focus:ring-[#0E9F88] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-700">Order Status Updates</p>
                          <p className="text-[11px] text-gray-500">Get updates when a buyer changes payment status or cancels an intent.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailOrderStatus}
                          onChange={(e) => setEmailOrderStatus(e.target.checked)}
                          className="h-4 w-4 text-[#0E9F88] focus:ring-[#0E9F88] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-700">Weekly Analytics Digest</p>
                          <p className="text-[11px] text-gray-500">A weekly review of product views, conversion analytics, and wallet spend.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailWeeklyDigest}
                          onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
                          className="h-4 w-4 text-[#0E9F88] focus:ring-[#0E9F88] border-gray-300 rounded"
                        />
                      </div>

                    </div>
                  </div>

                  {/* WhatsApp Alerts */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">WhatsApp Alerts</h3>
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-700">Instant Order Alerts</p>
                          <p className="text-[11px] text-gray-500">Send customer purchase requests directly to your support mobile number via WhatsApp.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={whatsappNewOrder}
                          onChange={(e) => setWhatsappNewOrder(e.target.checked)}
                          className="h-4 w-4 text-[#0E9F88] focus:ring-[#0E9F88] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-700">Low Wallet Alerts</p>
                          <p className="text-[11px] text-gray-500">Notify you via WhatsApp when wallet balance falls below threshold (₹2,000).</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={whatsappWalletAlert}
                          onChange={(e) => setWhatsappWalletAlert(e.target.checked)}
                          className="h-4 w-4 text-[#0E9F88] focus:ring-[#0E9F88] border-gray-300 rounded"
                        />
                      </div>

                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                  <button
                    type="submit"
                    disabled={pending}
                    className="px-6 py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                  >
                    {pending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    SAVE CHANGE
                  </button>
                </div>
              </div>
            )}

            {/* 6. SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6">
                
                {/* Security Settings Card */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden space-y-6">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-[#111827]" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-[#111827]">Security &amp; Session Configuration</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Control how your merchant account remains protected.</p>
                    </div>
                    <span className="bg-[#111827] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Account Safety
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-700">Two-Factor Authentication (2FA)</p>
                        <p className="text-[11px] text-gray-500">Require an OTP sent to your email/phone during sign in.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                        className="h-4 w-4 text-[#0E9F88] focus:ring-[#0E9F88] border-gray-300 rounded"
                      />
                    </div>

                    {/* Session Timeout */}
                    <div>
                      <label className={labelCls}>Session Timeout Duration</label>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className={inputCls}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour (Recommended)</option>
                        <option value="180">3 hours</option>
                        <option value="never">Never expire</option>
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">Automatically log out of your session after period of inactivity.</p>
                    </div>

                    {/* Allowed IPs */}
                    <div>
                      <label className={labelCls}>Allowed IP Addresses (IP Whitelist)</label>
                      <input
                        type="text"
                        value={allowedIps}
                        onChange={(e) => setAllowedIps(e.target.value)}
                        placeholder="e.g. 192.168.1.1, 103.45.67.* (Comma separated, empty for any)"
                        className={inputCls}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Restrict panel access to specific IP ranges.</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                    <button
                      type="submit"
                      disabled={pending}
                      className="px-6 py-2.5 bg-[#0E9F88] hover:bg-[#0B7A69] text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                      {pending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                      SAVE CHANGE
                    </button>
                  </div>
                </div>

                {/* Session logs */}
                <div className="bg-white rounded-2xl border border-[#E2E4E8] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#F1F3F5] bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Security Logs</h3>
                  </div>
                  <div className="overflow-x-auto text-[11.5px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-[#F1F3F5] bg-[#FAFBFC] text-left text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                          <th className="p-3 pl-5">Timestamp</th>
                          <th className="p-3">IP Address</th>
                          <th className="p-3">Location</th>
                          <th className="p-3 pr-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F3F5] text-gray-600 font-medium">
                        <tr>
                          <td className="p-3 pl-5 font-mono">{new Date().toLocaleString("en-IN")}</td>
                          <td className="p-3 font-mono">103.88.22.12</td>
                          <td className="p-3">Noida, India (Current Session)</td>
                          <td className="p-3 pr-5 text-right text-emerald-600 font-bold">Successful</td>
                        </tr>
                        <tr>
                          <td className="p-3 pl-5 font-mono">{new Date(Date.now() - 3600000 * 24).toLocaleString("en-IN")}</td>
                          <td className="p-3 font-mono">103.88.22.12</td>
                          <td className="p-3">Noida, India</td>
                          <td className="p-3 pr-5 text-right text-emerald-600 font-bold">Successful</td>
                        </tr>
                        <tr>
                          <td className="p-3 pl-5 font-mono">{new Date(Date.now() - 3600000 * 24 * 3).toLocaleString("en-IN")}</td>
                          <td className="p-3 font-mono">157.45.198.81</td>
                          <td className="p-3">Delhi, India</td>
                          <td className="p-3 pr-5 text-right text-emerald-600 font-bold">Successful</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </form>
        </div>

      </div>

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
                type="button"
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

              {otpError && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {otpError}
                </div>
              )}

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
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      OTP successfully sent to your <span className="font-semibold">{otpChannel === "email" ? "Registered Email" : "Registered Contact"}</span>.
                    </span>
                  </div>

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
