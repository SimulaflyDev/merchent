"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "../components/Spinner";
import { createMerchantAction, updateMerchantAction, getMyMerchantsAction, getPublicMerchantAction } from "@/lib/auth/merchant-actions";
import { createProductAction, uploadProductImageAction } from "@/lib/auth/product-actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";
import { setActiveMerchantAction, sendMobileOtpAction, verifyMobileOtpAction } from "@/lib/auth/actions";
import { resolveImageUrl } from "@/lib/api/image-utils";

const STORE_TYPES = [
  "Manufacturer",
  "Whole Seller",
  "Retailors",
];

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

const ROOM_OPTIONS = [
  "Living room",
  "Bedroom",
  "Dining room",
  "Home office",
  "Kitchen",
  "Bathroom",
  "Outdoor / Patio",
  "Kids room",
];

const STYLE_TAGS = [
  "Modern",
  "Traditional",
  "Minimalist",
  "Industrial",
  "Scandinavian",
  "Bohemian",
  "Mid-century",
  "Rustic",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitSaved, setExitSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeName, setStoreName] = useState("");

  // Step 2: Business Details
  const [legalName, setLegalName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [website, setWebsite] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  // Mobile OTP Verification States
  const [mobileOtp, setMobileOtp] = useState("");
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [isVerifyingMobileOtp, setIsVerifyingMobileOtp] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [mobileOtpError, setMobileOtpError] = useState<string | null>(null);
  const [mobileOtpSuccess, setMobileOtpSuccess] = useState<string | null>(null);
  const [devMobileOtp, setDevMobileOtp] = useState<string | null>(null);

  const handleSendMobileOtp = async () => {
    if (!mobileNumber.trim()) {
      setMobileOtpError("Please enter a valid mobile number.");
      return;
    }
    const digitsOnly = mobileNumber.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setMobileOtpError("Please enter a valid mobile number (10 to 15 digits).");
      return;
    }
    setMobileOtpError(null);
    setMobileOtpSuccess(null);
    setIsSendingMobileOtp(true);
    try {
      const res = await callAction(sendMobileOtpAction(mobileNumber.trim()));
      setMobileOtpSent(true);
      setMobileOtpSuccess(res.message);
      if (res.dev_otp) {
        setDevMobileOtp(res.dev_otp);
      }
    } catch (err) {
      if (isApiError(err)) {
        setMobileOtpError(err.detail || "Failed to send mobile OTP.");
      } else {
        setMobileOtpError("Failed to send mobile OTP.");
      }
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (mobileOtp.length !== 6 || isNaN(Number(mobileOtp))) {
      setMobileOtpError("Please enter a 6-digit code.");
      return;
    }
    setMobileOtpError(null);
    setMobileOtpSuccess(null);
    setIsVerifyingMobileOtp(true);
    try {
      await callAction(verifyMobileOtpAction(mobileNumber.trim(), mobileOtp));
      setIsMobileVerified(true);
      setMobileOtpSuccess("Mobile number verified successfully!");
    } catch (err) {
      if (isApiError(err)) {
        setMobileOtpError(err.detail || "Invalid code.");
      } else {
        setMobileOtpError("Invalid code.");
      }
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  // Step 3: Store Profile
  const [storeDescription, setStoreDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Step 5: First Product Details
  const [productTitle, setProductTitle] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productMaterial, setProductMaterial] = useState("");
  const [productLength, setProductLength] = useState("");
  const [productWidth, setProductWidth] = useState("");
  const [productHeight, setProductHeight] = useState("");
  const [productRoomPlacement, setProductRoomPlacement] = useState("");
  const [productStyleTag, setProductStyleTag] = useState("");
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const [existingMerchantId, setExistingMerchantId] = useState<string | null>(null);

  // Restore last saved step on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sf_onboarding_step') : null;
    if (saved) {
      const n = parseInt(saved, 10);
      if (n >= 1 && n <= 7) setStep(n);
    }
  }, []);

  // Prepopulate onboarding form with existing merchant data if available
  useEffect(() => {
    async function loadExistingMerchant() {
      try {
        const merchants = await callAction(getMyMerchantsAction());
        if (merchants && merchants.length > 0) {
          const m = merchants[0];
          setExistingMerchantId(m.id);
          setStoreName(m.display_name || "");
          setLegalName(m.legal_name || "");
          setLogoUrl(m.logo_url || null);
          setMobileNumber(m.support_phone || "");
          if (m.support_phone) {
            setIsMobileVerified(true);
          }
          setLatitude(m.latitude || null);
          setLongitude(m.longitude || null);

          const onboardData = (m.settings?.onboarding_data as any) || {};
          setGstNumber(onboardData.gst_number || "");
          setCompanyType(onboardData.company_type || "");
          setCity(onboardData.city || "");
          setLocality(onboardData.locality || "");
          setBusinessState(onboardData.state || "");
          setWebsite(onboardData.website || "");

          const sType = onboardData.store_type || "";
          if (sType && !STORE_TYPES.includes(sType)) {
            setStoreType("__other");
            setCustomStoreType(sType);
          } else {
            setStoreType(sType);
          }

          setSelectedCategories(onboardData.categories || []);
          setStoreDescription(onboardData.description || "");
          setCatalogChoice(onboardData.catalog_choice || "add");
          setReferralCode(onboardData.referral_code_entered || "");
        }
      } catch (err) {
        console.error("Failed to load existing merchant data:", err);
      }
    }
    loadExistingMerchant();
  }, []);

  // Auto-save step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_onboarding_step', String(step));
    }
  }, [step]);
  const [catalogChoice, setCatalogChoice] = useState<"add" | "spreadsheet">("add");
  const [customStoreType, setCustomStoreType] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [storeType, setStoreType] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState<null | boolean>(null);
  const referralApplied = referralValid === true;
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [referredMerchantName, setReferredMerchantName] = useState<string | null>(null);

  // File Upload Helper
  const fileToBase64 = (file: File): Promise<{ base64: string; mediaType: string }> => {
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
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select a valid image file for the logo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Logo image must be under 2 MB.");
      return;
    }
    setSubmitError(null);
    setUploadingLogo(true);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      const formData = new FormData();
      formData.append("imageBase64", base64);
      formData.append("mediaType", mediaType);
      const result = await callAction(uploadProductImageAction(formData));
      setLogoUrl(result.url);
    } catch (err) {
      setSubmitError(isApiError(err) ? `Logo upload failed: ${err.detail}` : "Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProductImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select a valid image file for the product.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Product image must be under 5 MB.");
      return;
    }
    setSubmitError(null);
    setUploadingProductImage(true);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      setProductImagePreview(`data:${mediaType};base64,${base64}`);
      const formData = new FormData();
      formData.append("imageBase64", base64);
      formData.append("mediaType", mediaType);
      const result = await callAction(uploadProductImageAction(formData));
      setProductImageUrl(result.url);
    } catch (err) {
      setSubmitError(isApiError(err) ? `Product image upload failed: ${err.detail}` : "Product image upload failed. Please try again.");
      setProductImagePreview(null);
    } finally {
      setUploadingProductImage(false);
    }
  };

  const validateReferral = (code: string) => {
    const upper = code.toUpperCase().trim();
    setReferralCode(upper);
    setReferralValid(null);
    setReferredMerchantName(null);
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    setIsValidatingReferral(true);
    setReferralValid(null);
    setReferredMerchantName(null);
    try {
      const res = await callAction(getPublicMerchantAction(referralCode.trim()));
      if (res && res.id) {
        setReferralValid(true);
        setReferredMerchantName(res.display_name);
      } else {
        setReferralValid(false);
      }
    } catch (err) {
      setReferralValid(false);
    } finally {
      setIsValidatingReferral(false);
    }
  };

  const TOTAL_STEPS = 5;

  const stepLabels = [
    "Welcome",
    "Business",
    "Store",
    "Review",
    "Go Live",
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleNext = () => {
    if (step === 2) {
      if (!storeName.trim() || !companyType || !mobileNumber.trim() || !city.trim() || !locality.trim() || !businessState.trim()) {
        alert("Please fill in all required fields: Store Name, Company Type, Mobile Number, Locality, City, and State.");
        return;
      }
      if (!isMobileVerified) {
        alert("Please verify your mobile number via OTP before continuing.");
        return;
      }
      if (!gstNumber.trim()) {
        alert("Please enter your GST number.");
        return;
      }
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.trim().toUpperCase())) {
        alert("Please enter a valid GST number (15-character format, e.g. 22AAAAA0000A1Z5).");
        return;
      }
      if (website.trim()) {
        const webVal = website.trim();
        const isInstagramHandle = webVal.startsWith("@");
        const looksLikeUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(webVal);
        if (!isInstagramHandle && !looksLikeUrl) {
          alert("Please enter a valid Website URL (e.g. www.store.com) or Instagram handle (e.g. @store).");
          return;
        }
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleOpenExitModal = () => {
    setSubmitError(null);
    setShowExitModal(true);
  };

  const handleSaveAndExit = async () => {
    setSubmitError(null);
    try {
      if (!storeName.trim()) {
        setSubmitError("Please enter a Store Name on Step 1 to save progress.");
        return;
      }

      const settingsPayload = {
        onboarding_completed: false,
        onboarding_data: {
          gst_number: gstNumber || undefined,
          company_type: companyType || undefined,
          city: city || undefined,
          locality: locality || undefined,
          state: businessState || undefined,
          website: website || undefined,
          store_type: storeType === "__other" ? customStoreType : storeType,
          categories: selectedCategories,
          description: storeDescription || undefined,
          catalog_choice: catalogChoice,
          referral_code_entered: referralCode || undefined,
        }
      };

      const merchantPayload: any = {
        legal_name: legalName || storeName,
        display_name: storeName,
        country: "IN",
        support_phone: mobileNumber || undefined,
        logo_url: logoUrl || undefined,
        settings: settingsPayload,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      };

      if (existingMerchantId) {
        await callAction(updateMerchantAction(existingMerchantId, merchantPayload));
      } else {
        merchantPayload.referred_by_code = referralCode || undefined;
        await callAction(createMerchantAction(merchantPayload));
      }

      localStorage.setItem('sf_onboarding_step', String(step));
      setExitSaved(true);
      setTimeout(() => { window.location.href = '/merchant/dashboard'; }, 2000);
    } catch (err) {
      console.error("Failed to save progress on exit:", err);
      if (isApiError(err)) {
        setSubmitError(err.detail || "Failed to save progress. Please try again.");
      } else {
        setSubmitError("Failed to save progress. Please try again.");
      }
    }
  };

  const handleFinalSubmit = async (completeKyc: boolean = true) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const settingsPayload = {
        onboarding_completed: true,
        onboarding_data: {
          gst_number: gstNumber || undefined,
          company_type: companyType || undefined,
          city: city || undefined,
          locality: locality || undefined,
          state: businessState || undefined,
          website: website || undefined,
          store_type: storeType === "__other" ? customStoreType : storeType,
          categories: selectedCategories,
          description: storeDescription || undefined,
          catalog_choice: catalogChoice,
          referral_code_entered: referralCode || undefined,
        }
      };

      // 1. Create or Update the merchant
      const merchantPayload: any = {
        legal_name: legalName || storeName,
        display_name: storeName,
        country: "IN",
        support_phone: mobileNumber || undefined,
        logo_url: logoUrl || undefined,
        settings: settingsPayload,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      };

      let merchant;
      if (existingMerchantId) {
        // Toggle KYC to complete so referral bonus is triggered
        merchantPayload.is_kyc_completed = completeKyc;
        merchant = await callAction(updateMerchantAction(existingMerchantId, merchantPayload));
        await setActiveMerchantAction(merchant.id);
      } else {
        merchantPayload.referred_by_code = referralCode || undefined;
        merchant = await callAction(createMerchantAction(merchantPayload));
        await setActiveMerchantAction(merchant.id);
        if (completeKyc) {
          // Update the merchant to set KYC to completed and trigger the referral payout
          merchant = await callAction(updateMerchantAction(merchant.id, { is_kyc_completed: true }));
        }
      }

      // 2. Create the first product if requested
      if (catalogChoice === "add" && productTitle.trim()) {
        const generatedSku = `ONB-${storeName.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")}-${productTitle.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        await callAction(createProductAction({
          sku: generatedSku,
          title: productTitle,
          description: storeDescription || "First product added during onboarding.",
          category: productCategory || undefined,
          primary_image_url: productImageUrl || undefined,
          in_app_price: productPrice ? parseFloat(productPrice) : undefined,
          in_app_stock: productStock ? parseInt(productStock) : undefined,
          dimensions: {
            width: productWidth ? parseFloat(productWidth) : undefined,
            height: productHeight ? parseFloat(productHeight) : undefined,
            depth: productLength ? parseFloat(productLength) : undefined,
          },
          materials: {
            primary: productMaterial || undefined,
          },
          room_storytelling: {
            placements: productRoomPlacement ? [productRoomPlacement] : [],
            best_used_in: productRoomPlacement || undefined,
          },
          custom_metadata: {
            style_tag: productStyleTag || ""
          }
        }));
      }

      localStorage.removeItem("sf_onboarding_step");
      setIsNavigating(true);
      window.location.href = "/merchant/dashboard";
    } catch (err) {
      if (isApiError(err)) {
        setSubmitError(err.detail || "Could not create your store.");
      } else {
        setSubmitError("Unexpected error. Try again.");
      }
      setIsSubmitting(false);
    }
  };

  const getCTALabel = () => {
    switch (step) {
      case 1: return "Continue";
      case 2: return "Continue";
      case 3: return "Continue to review";
      case 4: return "Review and publish";
      case 5: return "Go to dashboard";
      default: return "Continue";
    }
  };

  // Shared input classes
  const inputCls = "w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors";
  const labelCls = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  // Readiness checklist items
  const checklist = [
    { label: "Business details added", done: storeName.trim().length > 0 && mobileNumber.trim().length > 0 && city.trim().length > 0 },
    { label: "Store profile complete", done: storeType !== "" && storeDescription.trim().length > 0 },
    { label: "First product added", done: catalogChoice !== "add" || productTitle.trim().length > 0 },
    { label: "Product image uploaded", done: catalogChoice !== "add" || !!productImageUrl },
    { label: "Price entered", done: catalogChoice !== "add" || (productPrice.trim().length > 0 && !isNaN(parseFloat(productPrice))) },
    { label: "Category selected", done: selectedCategories.length > 0 },
    { label: "Room placement chosen", done: catalogChoice !== "add" || productRoomPlacement !== "" },
  ];
  const readinessScore = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <>
      {isNavigating && <Spinner variant="fullscreen" label="Setting up your dashboard…" />}
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center py-10 px-6">

        {/* Header */}
        <div className="w-full max-w-3xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <img src="/simulafly-logo.png" alt="SimulaFly" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
            <span className="font-display font-bold text-xl tracking-tight text-neutral-dark">SimulaFly</span>
          </div>
          <button
            onClick={handleOpenExitModal}
            className="text-sm font-semibold text-gray-400 hover:text-neutral-dark transition-colors"
          >
            Save &amp; Exit
          </button>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">

          {/* ─── Progress Bar ─── */}
          <div className="flex border-b border-gray-50 overflow-x-auto">
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const isCompleted = step > num;
              const isCurrent = step === num;
              return (
                <div
                  key={num}
                  className={`flex-1 min-w-0 text-center py-3.5 border-b-2 transition-all ${
                    isCompleted || isCurrent
                      ? "border-[#1FAF9A]"
                      : "border-transparent"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${
                      isCompleted || isCurrent ? "text-[#1FAF9A]" : "text-gray-300"
                    }`}
                  >
                    {isCompleted ? "✓" : num}
                  </span>
                  <span
                    className={`text-[11px] font-bold truncate block px-1 ${
                      isCurrent
                        ? "text-neutral-dark"
                        : isCompleted
                        ? "text-gray-500"
                        : "text-gray-300"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ─── Content Area ─── */}
          <div className="p-8 sm:p-12">

            {/* ════════════════════════════════════════ */}
            {/* STEP 1: Welcome                         */}
            {/* ════════════════════════════════════════ */}
            {step === 1 && (
              <div className="py-4 space-y-8">

                {/* Top: heading + image */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#1FAF9A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-neutral-dark tracking-tight mb-2">
                    Let's bring your store online
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Set up your SimulaFly showroom in a few quick steps. We'll guide you through everything.
                  </p>
                </div>

                {/* Steps illustration — fixed height, object-cover crops vertically */}
                <div className="max-w-lg mx-auto w-full h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img
                    src="/onboarding-banner.png"
                    alt="4-step onboarding: Business, Store, Products, Publish"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* ── Referral Code Card ── */}
                <div className="max-w-lg mx-auto">
                  {referralApplied ? (
                    /* ── Applied State ── */
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-emerald-900 uppercase tracking-widest mb-1">Partner Referral Applied</p>
                          <p className="text-2xl font-mono font-bold text-emerald-800 tracking-widest">{referralCode}</p>
                          <div className="mt-3 space-y-1">
                            <p className="text-[12px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              Referred by: <span className="font-bold underline ml-1">{referredMerchantName}</span>
                            </p>
                            <p className="text-[12px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              Both you and {referredMerchantName} will receive 500 INR in wallet balance upon completing KYC!
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setReferralCode(""); setReferralValid(null); setReferredMerchantName(null); }}
                          className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Input State ── */
                    <div className="border-2 border-dashed border-gray-200 hover:border-[#1FAF9A]/40 rounded-2xl p-6 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#1FAF9A]/10 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M20 12V22H4V12"/>
                            <path d="M22 7H2v5h20V7z"/>
                            <path d="M12 22V7"/>
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">Got a partner referral code?</p>
                          <p className="text-[11px] text-gray-400">Invited by another SimulaFly merchant · Enter their code to link accounts and earn rewards</p>
                        </div>
                      </div>
 
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={referralCode}
                            onChange={(e) => validateReferral(e.target.value)}
                            placeholder="e.g. SIMULA-ACME-2026"
                            className={`w-full bg-white border-2 rounded-xl px-4 py-3.5 text-base outline-none font-mono font-bold tracking-widest transition-colors placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-300 ${
                              referralValid === false
                                ? 'border-red-300 text-red-700'
                                : 'border-gray-200 text-gray-900 focus:border-[#1FAF9A]'
                            }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyReferral}
                          disabled={isValidatingReferral || !referralCode}
                          className="px-6 py-3.5 bg-[#1FAF9A] text-white text-sm font-bold rounded-xl hover:bg-[#189986] disabled:opacity-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
                        >
                          {isValidatingReferral ? <Spinner variant="inline" /> : "Apply Code"}
                        </button>
                      </div>
 
                      {referralValid === false && (
                        <p className="text-[11px] text-red-500 font-medium mt-2">
                          Code not recognised — double-check with your partner, or leave blank to continue.
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2">
                        Skip this if you don't have a code — you can add it later from your account settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
                {/* ════════════════════════════════════════ */}
                {/* STEP 2: Business Details                */}
                {/* ════════════════════════════════════════ */}
                {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Business details</h2>
                  <p className="text-sm text-gray-500">This helps us verify your store and set up your merchant profile.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Legal Business Name <span className="text-gray-300 normal-case font-medium">(if available)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Furniture Co."
                      className={inputCls}
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Store Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Home"
                      className={inputCls}
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Company Type <span className="text-red-400">*</span></label>
                    <select
                      required
                      className={`${inputCls} appearance-none bg-no-repeat bg-[right_1rem_center]`}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                    >
                      <option value="" disabled>Select company type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="Public Limited">Public Limited Company</option>
                      <option value="One Person Company">One Person Company (OPC)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>GST Number <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      className={`${inputCls} uppercase`}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    />
                  </div>
                  
                  {/* Mobile OTP Verification */}
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        required
                        disabled={isMobileVerified}
                        placeholder="+91 98765 43210"
                        className={`${inputCls} flex-1`}
                        value={mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          const sanitized = val.replace(/(?!^\+)\+|[^\d+]/g, "");
                          setMobileNumber(sanitized);
                        }}
                      />
                      {!isMobileVerified && (
                        <button
                          type="button"
                          onClick={handleSendMobileOtp}
                          disabled={isSendingMobileOtp || !mobileNumber}
                          className="px-4 py-2.5 bg-[#1FAF9A] text-white text-xs font-bold rounded-lg hover:bg-[#189986] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {isSendingMobileOtp ? "Sending..." : mobileOtpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      )}
                      {isMobileVerified && (
                        <span className="px-4 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 select-none">
                          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Verified
                        </span>
                      )}
                    </div>

                    {mobileOtpSent && !isMobileVerified && (
                      <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enter 6-digit Mobile OTP</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-center font-bold tracking-widest outline-none focus:border-[#1FAF9A] w-32"
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyMobileOtp}
                            disabled={isVerifyingMobileOtp || mobileOtp.length !== 6}
                            className="px-4 py-2 bg-[#1FAF9A] text-white text-xs font-bold rounded-lg hover:bg-[#189986] transition-colors disabled:opacity-50"
                          >
                            {isVerifyingMobileOtp ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                        {devMobileOtp && (
                          <p className="text-[11px] text-[#1FAF9A] font-semibold">
                            Demo OTP: <span className="font-mono bg-white border border-gray-200 px-1 py-0.5 rounded">{devMobileOtp}</span>
                          </p>
                        )}
                      </div>
                    )}
                    
                    {mobileOtpError && <p className="text-xs text-red-500 mt-1">{mobileOtpError}</p>}
                    {mobileOtpSuccess && <p className="text-xs text-emerald-600 font-semibold mt-1">{mobileOtpSuccess}</p>}
                  </div>

                  {/* Location Auto Detection */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelCls}>Location <span className="text-red-400">*</span></label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!navigator.geolocation) {
                            alert("Geolocation is not supported by your browser");
                            return;
                          }
                          setIsDetectingLoc(true);
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              const lat = position.coords.latitude;
                              const lon = position.coords.longitude;
                              setLatitude(lat);
                              setLongitude(lon);
                              try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
                                const data = await res.json();
                                if (data && data.address) {
                                  const cityName = data.address.city || data.address.town || data.address.village || data.address.county || "";
                                  const stateName = data.address.state || "";
                                  const localityName = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.road || "";
                                  
                                  if (cityName) setCity(cityName);
                                  if (stateName) setBusinessState(stateName);
                                  if (localityName) setLocality(localityName);
                                }
                              } catch (err) {
                                console.error("Error reverse geocoding:", err);
                              } finally {
                                setIsDetectingLoc(false);
                              }
                            },
                            (error) => {
                              console.error("Error getting geolocation:", error);
                              alert("Failed to detect location. Please type manually.");
                              setIsDetectingLoc(false);
                            }
                          );
                        }}
                        className="text-[11px] font-bold text-[#1FAF9A] hover:text-[#189986] transition-colors flex items-center gap-1"
                        disabled={isDetectingLoc}
                      >
                        {isDetectingLoc ? "Detecting..." : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                            Detect Location
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Locality (e.g. Bandra West)"
                        className={inputCls}
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                      />
                      <input
                        type="text"
                        required
                        placeholder="City (e.g. Mumbai)"
                        className={inputCls}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      <input
                        type="text"
                        required
                        placeholder="State (e.g. Maharashtra)"
                        className={inputCls}
                        value={businessState}
                        onChange={(e) => setBusinessState(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Website or Instagram <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. www.acmefurniture.co or @acmefurniture"
                      className={inputCls}
                      value={website}
                      onChange={(e) => setWebsite(e.target.value.replace(/\s/g, ""))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 3: Store Profile                   */}
            {/* ════════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Tell customers what you sell</h2>
                  <p className="text-sm text-gray-500">We'll use this to set up your showroom profile.</p>
                </div>

                {/* Store Type */}
                <div>
                  <label className={labelCls}>Store Type <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {STORE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => { setStoreType(type); setCustomStoreType(""); }}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                          storeType === type
                            ? "border-[#1FAF9A] bg-[#1FAF9A]/5 text-[#1FAF9A]"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                    {/* Other option */}
                    <button
                      onClick={() => setStoreType("__other")}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                        storeType === "__other"
                          ? "border-[#1FAF9A] bg-[#1FAF9A]/5 text-[#1FAF9A]"
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
                      placeholder="Enter your store type..."
                      className={`${inputCls} mt-3`}
                      autoFocus
                    />
                  )}
                </div>

                {/* Product Categories */}
                <div>
                  <label className={labelCls}>Product Categories <span className="text-red-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {[...PRODUCT_CATEGORIES, ...selectedCategories.filter(c => !PRODUCT_CATEGORIES.includes(c))].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
                          selectedCategories.includes(cat)
                            ? "border-[#1FAF9A] bg-[#1FAF9A] text-white"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Custom category input */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Add a custom category..."
                      className={`${inputCls} flex-1`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customCategory.trim()) {
                          e.preventDefault();
                          if (!selectedCategories.includes(customCategory.trim())) {
                            setSelectedCategories([...selectedCategories, customCategory.trim()]);
                          }
                          setCustomCategory("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
                          setSelectedCategories([...selectedCategories, customCategory.trim()]);
                        }
                        setCustomCategory("");
                      }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className={labelCls}>Store Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
                    className="sr-only"
                  />
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-[#1FAF9A]/40 rounded-xl p-6 text-center transition-colors cursor-pointer bg-[#F8FAFB]"
                  >
                    {logoUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={resolveImageUrl(logoUrl)} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg border border-gray-100 mb-2" />
                        <p className="text-xs font-semibold text-emerald-600">Logo uploaded successfully</p>
                        <p className="text-[10px] text-gray-400">Click to change</p>
                      </div>
                    ) : uploadingLogo ? (
                      <div className="flex flex-col items-center py-2">
                        <div className="w-6 h-6 border-2 border-[#1FAF9A] border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-xs font-bold text-gray-500">Uploading logo...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p className="text-xs font-bold text-gray-500">Click to upload logo</p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelCls}>Short Store Description</label>
                    <span className={`text-[10px] font-bold ${
                      storeDescription.trim().split(/\s+/).filter(Boolean).length > 250 ? "text-red-500" : "text-gray-400"
                    }`}>
                      {storeDescription.trim().split(/\s+/).filter(Boolean).length} / 250 words
                    </span>
                  </div>
                  <textarea
                    placeholder="Tell customers about your store in a few lines..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                    value={storeDescription}
                    onChange={(e) => {
                      const text = e.target.value;
                      const words = text.trim().split(/\s+/).filter(Boolean);
                      if (words.length <= 250 || text.endsWith(" ") || text.length < storeDescription.length) {
                        setStoreDescription(text);
                      } else {
                        const truncated = text.split(/\s+/).slice(0, 250).join(" ");
                        setStoreDescription(truncated);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 4: Review Stage                    */}
            {/* ════════════════════════════════════════ */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Review your store details</h2>
                  <p className="text-sm text-gray-500">Please review all the completed stages of account creation before moving forward to the last step of KYC completion.</p>
                </div>

                <div className="space-y-6">
                  {/* Business Details Card */}
                  <div className="bg-[#F8FAFB] border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                      <svg className="w-4 h-4 text-[#1FAF9A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-10.5h16.5M2.25 9h19.5M4.5 21V9m15 12V9m-11.25 12V12m3 9V12M15 21V12m-9-6h12a1.5 1.5 0 0 1 1.5 1.5V9H4.5V7.5A1.5 1.5 0 0 1 6 6Z"/></svg>
                      <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">01. Business Details</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Legal Business Name</p>
                        <p className="font-semibold text-neutral-dark">{legalName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Store Name</p>
                        <p className="font-semibold text-neutral-dark">{storeName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">GST Number</p>
                        <p className="font-semibold text-neutral-dark uppercase">{gstNumber || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Company Type</p>
                        <p className="font-semibold text-neutral-dark">{companyType || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Mobile Number</p>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-neutral-dark">{mobileNumber || "—"}</p>
                          {isMobileVerified ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 select-none">Verified</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-200 select-none">Pending</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Website / Instagram</p>
                        <p className="font-semibold text-neutral-dark">{website || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Location</p>
                        <p className="font-semibold text-neutral-dark">
                          {locality ? `${locality}, ` : ""}{city ? `${city}, ` : ""}{businessState || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Store Profile Card */}
                  <div className="bg-[#F8FAFB] border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                      <svg className="w-4 h-4 text-[#1FAF9A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"/></svg>
                      <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">02. Store Profile</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 text-xs">
                      <div className="shrink-0">
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Logo</p>
                        {logoUrl ? (
                          <img src={resolveImageUrl(logoUrl)} alt="Store Logo" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-300 font-bold text-xs uppercase">No Logo</div>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Store Type</p>
                          <p className="font-semibold text-neutral-dark">{storeType === "__other" ? customStoreType : storeType || "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Product Categories</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {selectedCategories.map((cat) => (
                              <span key={cat} className="bg-gray-100 text-gray-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">{cat}</span>
                            ))}
                            {selectedCategories.length === 0 && <span className="font-semibold text-neutral-dark">—</span>}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Store Description</p>
                          <p className="font-medium text-gray-600 leading-relaxed whitespace-pre-line">{storeDescription || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 7: Complete your KYC               */}
            {/* ════════════════════════════════════════ */}
            {step === 5 && (
              <div className="py-4 space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#1FAF9A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-neutral-dark tracking-tight mb-2">
                    Complete your KYC
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Activate your SimulaFly showroom and unlock referral bonuses by completing KYC verification.
                  </p>
                </div>

                {/* Referral bonus callout if a code was applied */}
                {referralApplied && (
                  <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Referral Code Connected ({referralCode})</p>
                      <p className="text-[12px] text-amber-700 leading-relaxed font-semibold">
                        Once KYC is complete, both you and <span className="font-bold underline text-amber-900">{referredMerchantName}</span> will receive <strong className="text-emerald-700 font-bold">500 INR</strong> wallet balance instantly!
                      </p>
                    </div>
                  </div>
                )}

                {/* KYC Action Box */}
                <div className="max-w-md mx-auto bg-white border border-gray-150 shadow-sm rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-dark">Instant KYC verification</h4>
                      <p className="text-[11px] text-gray-400">Verifies business ownership and profile completeness</p>
                    </div>
                    <span className="bg-[#1FAF9A]/10 text-[#1FAF9A] text-[10px] font-bold px-2 py-0.5 rounded-full select-none">Fastest</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-xs font-medium text-gray-600">Publishes your store immediately to the marketplace</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-xs font-medium text-gray-600">Unlocks standard 500 INR wallet reward</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-xs font-medium text-gray-600">Enables interactive 3D product uploads</span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                      {submitError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => handleFinalSubmit(true)}
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#1FAF9A] text-white text-sm font-bold rounded-xl hover:bg-[#189986] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      {isSubmitting && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Verify KYC &amp; Go Live
                    </button>
                  </div>
                </div>

                {/* Shortcut to Skip / Toggle to Dashboard */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => handleFinalSubmit(false)}
                    disabled={isSubmitting}
                    className="text-xs font-bold text-gray-400 hover:text-neutral-dark transition-colors inline-flex items-center gap-1"
                  >
                    Skip KYC for now &amp; go to dashboard
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ─── Footer Actions ─── */}
          {step < 5 && (
            <div className="bg-[#F8FAFB] px-8 py-5 border-t border-gray-100 flex justify-between items-center">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-neutral-dark text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#1FAF9A] text-white text-sm font-bold rounded-lg hover:bg-[#189986] transition-colors shadow-sm"
              >
                {getCTALabel()}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Save & Exit Modal ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !exitSaved && setShowExitModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {!exitSaved ? (
              /* ── Confirm exit ── */
              <>
                <div className="p-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                    </svg>
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-1">Save progress and exit?</h3>
                  <p className="text-[13px] text-gray-500">
                    We'll save where you left off — <strong>Step {step} of 5</strong>. You can resume your setup anytime from the dashboard.
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  {submitError && (
                    <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                      {submitError}
                    </div>
                  )}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <p className="text-[12px] text-gray-600 font-medium">Your progress is securely saved to your merchant profile.</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <p className="text-[12px] text-gray-600 font-medium">Return anytime to resume exactly from Step {step}.</p>
                  </div>
                  <button
                    onClick={handleSaveAndExit}
                    className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
                  >
                    Save &amp; Exit
                  </button>
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Continue setup
                  </button>
                </div>
              </>
            ) : (
              /* ── Saved confirmation ── */
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-2">Progress saved!</h3>
                <p className="text-[12px] text-gray-500 mb-1">You can resume your setup anytime from the dashboard.</p>
                <p className="text-[11px] text-gray-400">Redirecting to the dashboard…</p>
                <div className="flex justify-center mt-4">
                  <div className="w-5 h-5 border-2 border-[#1FAF9A] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
