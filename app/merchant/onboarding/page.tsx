"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Spinner from "../components/Spinner";

const STORE_TYPES = [
  "Furniture store",
  "Interior studio",
  "Home decor shop",
  "Manufacturer",
  "Dealer",
  "Wholesale seller",
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
  const [step, setStep] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitSaved, setExitSaved] = useState(false);

  // Restore last saved step on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sf_onboarding_step') : null;
    if (saved) {
      const n = parseInt(saved, 10);
      if (n >= 1 && n <= 7) setStep(n);
    }
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

  const validateReferral = (code: string) => {
    const upper = code.toUpperCase();
    setReferralCode(upper);
    if (upper.length === 0) { setReferralValid(null); return; }
    setReferralValid(upper.startsWith("SIMFLY-") && upper.length >= 10);
  };

  const TOTAL_STEPS = 7;

  const stepLabels = [
    "Welcome",
    "Business",
    "Store",
    "Catalog",
    "Product",
    "Review",
    "Go Live",
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleNext = () => {
    // If catalog choice is not "add", skip step 5 (First Product)
    if (step === 4 && catalogChoice !== "add") {
      setStep(6);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    // If on step 6 and catalog choice is not "add", go back to step 4
    if (step === 6 && catalogChoice !== "add") {
      setStep(4);
    } else {
      setStep(step - 1);
    }
  };

  const getCTALabel = () => {
    switch (step) {
      case 1: return "Continue";
      case 2: return "Continue";
      case 3: return "Continue";
      case 4: return catalogChoice === "add" ? "Add first product" : "Continue to review";
      case 5: return "Save and continue";
      case 6: return "Review and publish";
      case 7: return "Go to dashboard";
      default: return "Continue";
    }
  };

  // Shared input classes
  const inputCls = "w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors";
  const labelCls = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  // Readiness checklist items
  const checklist = [
    { label: "Business details added", done: true },
    { label: "Store profile complete", done: storeType !== "" },
    { label: "First product added", done: catalogChoice === "add" },
    { label: "Product image uploaded", done: false },
    { label: "Price entered", done: catalogChoice === "add" },
    { label: "Category selected", done: selectedCategories.length > 0 },
    { label: "Room placement chosen", done: catalogChoice === "add" },
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
            onClick={() => setShowExitModal(true)}
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
              const isSkipped = num === 5 && catalogChoice !== "add" && step > 5;
              return (
                <div
                  key={num}
                  className={`flex-1 min-w-0 text-center py-3.5 border-b-2 transition-all ${
                    isCompleted || isCurrent
                      ? "border-[#1FAF9A]"
                      : "border-transparent"
                  } ${isSkipped ? "opacity-40" : ""}`}
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
                              Your referring partner earns 500 reward points when you go live
                            </p>
                            <p className="text-[12px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              You receive a welcome bonus credited to your account
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setReferralCode(""); setReferralValid(null); }}
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
                            placeholder="e.g. SIMFLY-STORE-2024"
                            className={`w-full bg-white border-2 rounded-xl px-4 py-3.5 text-base outline-none font-mono font-bold tracking-widest transition-colors placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-300 ${
                              referralValid === false
                                ? 'border-red-300 text-red-700'
                                : 'border-gray-200 text-gray-900 focus:border-[#1FAF9A]'
                            }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => referralCode.length >= 10 && validateReferral(referralCode)}
                          className="px-6 py-3.5 bg-[#1FAF9A] text-white text-sm font-bold rounded-xl hover:bg-[#189986] transition-colors whitespace-nowrap"
                        >
                          Apply Code
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
                    <input type="text" placeholder="e.g. Acme Furniture Co." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Store Name <span className="text-red-400">*</span></label>
                    <input type="text" required placeholder="e.g. Acme Home" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GST Number <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
                    <input type="text" placeholder="e.g. 22AAAAA0000A1Z5" className={`${inputCls} uppercase`} />
                  </div>
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                    <input type="tel" required placeholder="+91 98765 43210" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City <span className="text-red-400">*</span></label>
                    <input type="text" required placeholder="e.g. Mumbai" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Website or Instagram <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
                    <input type="text" placeholder="e.g. www.acmefurniture.co or @acmefurniture" className={inputCls} />
                  </div>

                  {/* ── Referral Code ── */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      Partner Referral Code
                      <span className="text-gray-300 normal-case font-medium ml-1">(optional)</span>
                    </label>
                    {referralApplied ? (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div className="flex-1">
                          <span className="font-mono text-sm font-bold text-emerald-800 tracking-widest">{referralCode}</span>
                          <span className="text-[11px] text-emerald-600 ml-2">· Your partner earns 500 points when you go live</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setReferralCode(""); setReferralValid(null); }}
                          className="text-[10px] font-bold text-emerald-600 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={referralCode}
                              onChange={(e) => validateReferral(e.target.value)}
                              placeholder="e.g. SIMFLY-ACME-2024"
                              className={`w-full bg-[#F8FAFB] border rounded-lg px-4 py-3 text-sm outline-none font-mono font-medium tracking-widest transition-colors pr-9 ${
                                referralValid === false
                                  ? 'border-red-300 focus:border-red-400'
                                  : 'border-gray-200 focus:border-[#1FAF9A] focus:ring-2 focus:ring-[#1FAF9A]/20'
                              }`}
                            />
                            {referralValid === false && (
                              <svg className="w-4 h-4 text-red-400 absolute right-3 top-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            )}
                          </div>
                        </div>
                        {referralValid === false && (
                          <p className="text-[11px] text-red-500">Code not recognised — leave blank to continue without one.</p>
                        )}
                        {referralValid === null && referralCode.length === 0 && (
                          <p className="text-[10px] text-gray-400">Invited by another SimulaFly merchant? Enter their code to link accounts and earn rewards.</p>
                        )}
                      </div>
                    )}
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
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1FAF9A]/40 transition-colors cursor-pointer bg-[#F8FAFB]">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-xs font-bold text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className={labelCls}>Short Store Description</label>
                  <textarea
                    placeholder="Tell customers about your store in a few lines..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 4: Catalog Setup                   */}
            {/* ════════════════════════════════════════ */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">How would you like to add products?</h2>
                  <p className="text-sm text-gray-500">Start with what works for you. You can always add more later.</p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Add first product (recommended) */}
                  <button
                    onClick={() => setCatalogChoice("add")}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all group ${
                      catalogChoice === "add"
                        ? "border-[#1FAF9A] bg-[#1FAF9A]/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        catalogChoice === "add" ? "bg-[#1FAF9A] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-neutral-dark">Add your first product</h4>
                          <span className="text-[9px] font-bold bg-[#1FAF9A] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Recommended</span>
                        </div>
                        <p className="text-xs text-gray-500">Upload one product now to see your showroom come to life.</p>
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Spreadsheet */}
                  <button
                    onClick={() => setCatalogChoice("spreadsheet")}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      catalogChoice === "spreadsheet"
                        ? "border-[#1FAF9A] bg-[#1FAF9A]/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        catalogChoice === "spreadsheet" ? "bg-[#1FAF9A] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-dark mb-1">Upload a spreadsheet later</h4>
                        <p className="text-xs text-gray-500">I have a product list in Excel or CSV format.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 5: First Product                   */}
            {/* ════════════════════════════════════════ */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Add your first product</h2>
                  <p className="text-sm text-gray-500">Start with one product you want customers to see first.</p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className={labelCls}>Product Images</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#1FAF9A]/40 transition-colors cursor-pointer bg-[#F8FAFB]">
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-xs font-bold text-gray-500">Drop product photos here or click to upload</p>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB each · Up to 6 images</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Product Title</label>
                    <input type="text" placeholder="e.g. Nordic Lounge Chair" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select className={`${inputCls} appearance-none`}>
                      <option>Select category...</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Price (₹)</label>
                    <input type="number" placeholder="12,500" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Stock Quantity</label>
                    <input type="number" placeholder="25" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Material</label>
                    <input type="text" placeholder="e.g. Solid teak wood" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Dimensions (L × W × H in cm)</label>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="number" placeholder="Length" className={inputCls} />
                      <input type="number" placeholder="Width" className={inputCls} />
                      <input type="number" placeholder="Height" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Room Placement</label>
                    <select className={`${inputCls} appearance-none`}>
                      <option>Select room...</option>
                      {ROOM_OPTIONS.map((room) => (
                        <option key={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Style Tag</label>
                    <select className={`${inputCls} appearance-none`}>
                      <option>Select style...</option>
                      {STYLE_TAGS.map((tag) => (
                        <option key={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 6: Publish Readiness               */}
            {/* ════════════════════════════════════════ */}
            {step === 6 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Your showroom is almost ready</h2>
                  <p className="text-sm text-gray-500">Here's a quick check before you go live.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Score ring */}
                  <div className="shrink-0 relative">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F3F5" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="50"
                        fill="none"
                        stroke="#1FAF9A"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(readinessScore / 100) * 314} 314`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-neutral-dark">{readinessScore}%</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ready</span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="flex-1 w-full space-y-3">
                    {checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.done ? (
                          <div className="w-6 h-6 rounded-full bg-[#1FAF9A] flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${item.done ? "text-neutral-dark" : "text-gray-400"}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP 7: Go Live                         */}
            {/* ════════════════════════════════════════ */}
            {step === 7 && (
              <div className="text-center py-8 space-y-6">
                {/* Success animation */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-[#1FAF9A]/10 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="relative w-24 h-24 bg-[#1FAF9A]/10 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-display font-bold text-neutral-dark tracking-tight mb-3">Your store is now online</h2>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Customers can now discover your products in SimulaFly. Head to your dashboard to manage your showroom.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsNavigating(true);
                      setTimeout(() => { window.location.href = '/merchant/dashboard'; }, 1500);
                    }}
                    className="px-8 py-3 bg-neutral-dark text-white text-sm font-bold rounded-lg hover:bg-black transition-colors shadow-sm"
                  >
                    Go to dashboard
                  </button>
                  <Link
                    href="/merchant/products"
                    className="px-8 py-3 bg-white border border-gray-200 text-neutral-dark text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Add more products
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* ─── Footer Actions ─── */}
          {step < 7 && (
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
                    We'll save where you left off — <strong>Step {step} of 7</strong>. A reminder email will be sent to help you complete your setup.
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <p className="text-[12px] text-gray-600 font-medium">A completion reminder will be sent to your registered email.</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <p className="text-[12px] text-gray-600 font-medium">Sign back in anytime to resume exactly from Step {step}.</p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem('sf_onboarding_step', String(step));
                      setExitSaved(true);
                      setTimeout(() => { window.location.href = '/merchant/sign_in'; }, 2000);
                    }}
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
                <p className="text-[12px] text-gray-500 mb-1">Check your email for a link to resume setup.</p>
                <p className="text-[11px] text-gray-400">Redirecting you to sign in…</p>
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
