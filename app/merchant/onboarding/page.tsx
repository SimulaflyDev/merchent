"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Spinner from "../components/Spinner";
import { callAction } from "@/lib/api/action-utils";
import { isApiError } from "@/lib/api/errors";
import {
  getCurrentUserAction,
  sendMobileOtpAction,
  setActiveMerchantAction,
  verifyMobileOtpAction,
} from "@/lib/auth/actions";
import {
  createMerchantAction,
  getMyMerchantsAction,
  submitMerchantOnboardingAction,
} from "@/lib/auth/merchant-actions";
import type {
  BusinessType,
  FulfilmentMethod,
  MerchantOnboardingSubmission,
  Relationship,
} from "@/lib/types/onboarding";

const STEPS = ["Personal", "Business", "Shop", "Fulfilment", "Review"];
const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "one_person_company", label: "One Person Company" },
  { value: "other", label: "Other" },
];
const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "partner", label: "Partner" },
  { value: "director", label: "Director" },
  { value: "authorized_representative", label: "Authorized Representative" },
];
const FULFILMENT_METHODS: { value: FulfilmentMethod; label: string }[] = [
  { value: "merchant_delivery", label: "Merchant delivery" },
  { value: "customer_pickup", label: "Customer pickup" },
  { value: "third_party_delivery", label: "Third-party delivery" },
  { value: "installation_service", label: "Installation / execution service" },
];
const OPERATING_HOURS_OPTIONS = [
  "Mon–Sat, 10:00 AM–8:00 PM",
  "Mon–Sat, 9:00 AM–7:00 PM",
  "Mon–Sat, 9:00 AM–9:00 PM",
  "Mon–Sat, 10:00 AM–9:00 PM",
  "Mon–Sun, 10:00 AM–8:00 PM",
  "Mon–Sun, 9:00 AM–9:00 PM",
  "Mon–Sun, 10:00 AM–10:00 PM",
  "Mon–Fri, 9:00 AM–6:00 PM",
  "Mon–Fri, 10:00 AM–7:00 PM",
  "All Days, 24 Hours (24/7)",
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-[#F8FAFB] px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-[#0E9F88] focus:ring-2 focus:ring-[#0E9F88]/15";
const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400";

const digitsOnly = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ReviewCard({ title, step, onEdit, children }: { title: string; step: number; onEdit: (step: number) => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-[#F8FAFB] p-5">
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <button type="button" onClick={() => onEdit(step)} className="text-xs font-bold text-[#0E9F88] hover:underline">
          Edit
        </button>
      </div>
      <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [existingMerchantId, setExistingMerchantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("owner");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [businessType, setBusinessType] = useState<BusinessType>("sole_proprietorship");
  const [otherBusinessType, setOtherBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [registeredBusinessName, setRegisteredBusinessName] = useState("");
  const [sameBusinessName, setSameBusinessName] = useState(false);
  const [businessPan, setBusinessPan] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [registeredAddress2, setRegisteredAddress2] = useState("");
  const [registeredCity, setRegisteredCity] = useState("");
  const [registeredState, setRegisteredState] = useState("");
  const [registeredPostalCode, setRegisteredPostalCode] = useState("");

  const [shopName, setShopName] = useState("");
  const [sameShopName, setSameShopName] = useState(false);
  const [shopAddress, setShopAddress] = useState("");
  const [shopAddress2, setShopAddress2] = useState("");
  const [shopCity, setShopCity] = useState("");
  const [shopState, setShopState] = useState("");
  const [shopPostalCode, setShopPostalCode] = useState("");
  const [sameShopAddress, setSameShopAddress] = useState(false);
  const [gstin, setGstin] = useState("");
  const [operatingLocation, setOperatingLocation] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [customOperatingHours, setCustomOperatingHours] = useState("");
  const [isCustomHours, setIsCustomHours] = useState(false);
  const [serviceRadius, setServiceRadius] = useState("");

  const [fulfilmentMethods, setFulfilmentMethods] = useState<FulfilmentMethod[]>([]);
  const [deliveryRadius, setDeliveryRadius] = useState("");
  const [fulfilmentTime, setFulfilmentTime] = useState("");
  const [informationAccurate, setInformationAccurate] = useState(false);

  useEffect(() => {
    Promise.all([callAction(getCurrentUserAction()), callAction(getMyMerchantsAction())])
      .then(([user, merchants]) => {
        setEmail(user.email);
        setFullName(user.full_name ?? "");
        setPhone(user.phone ?? "");
        setPhoneVerified(Boolean(user.phone));
        if (merchants[0]) {
          setExistingMerchantId(merchants[0].id);
          setShopName(merchants[0].display_name ?? "");
          setRegisteredBusinessName(merchants[0].legal_name ?? "");
        }
      })
      .catch(() => setError("Could not load your merchant profile."))
      .finally(() => setLoading(false));
  }, []);

  const sendOtp = async () => {
    setError(null);
    if (!/^\+?[0-9]{10,15}$/.test(phone)) return setError("Enter a valid 10–15 digit phone number.");
    setOtpBusy(true);
    try {
      const result = await callAction(sendMobileOtpAction(phone));
      setOtpSent(true);
      setDevOtp(result.dev_otp ?? null);
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Could not send phone OTP.");
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setOtpBusy(true);
    try {
      await callAction(verifyMobileOtpAction(phone, otp));
      setPhoneVerified(true);
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Phone OTP verification failed.");
    } finally {
      setOtpBusy(false);
    }
  };

  const applySameBusinessName = (checked: boolean) => {
    setSameBusinessName(checked);
    if (checked) setBusinessName(registeredBusinessName);
  };
  const applySameShopName = (checked: boolean) => {
    setSameShopName(checked);
    if (checked) setShopName(businessName);
  };
  const applySameShopAddress = (checked: boolean) => {
    setSameShopAddress(checked);
    if (checked) {
      setShopAddress(registeredAddress);
      setShopAddress2(registeredAddress2);
      setShopCity(registeredCity);
      setShopState(registeredState);
      setShopPostalCode(registeredPostalCode);
    }
  };

  const validateStep = (target = step): string | null => {
    if (target === 1 && (!fullName.trim() || !email || !phoneVerified || !relationship)) return "Complete your details and verify the phone number.";
    if (target === 2) {
      if (!businessType || !businessName.trim() || !registeredBusinessName.trim()) return "Complete all business identity fields.";
      if (businessType === "other" && !otherBusinessType.trim()) return "Enter the other business type.";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(businessPan)) return "Enter a valid 10-character PAN.";
      if (!registeredAddress.trim() || !registeredCity.trim() || !registeredState.trim() || !/^[1-9][0-9]{5}$/.test(registeredPostalCode)) return "Complete the registered business address and valid PIN code.";
    }
    if (target === 3) {
      if (!shopName.trim() || !shopAddress.trim() || !shopCity.trim() || !shopState.trim() || !/^[1-9][0-9]{5}$/.test(shopPostalCode)) return "Complete the primary shop address.";
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) return "Enter a valid 15-character GSTIN.";
      if (!operatingLocation.trim() || !operatingHours.trim()) return "Enter the operating location and operating hours.";
    }
    if (target === 4) {
      if (!fulfilmentMethods.length) return "Select at least one fulfilment method.";
      if (!/^[1-9][0-9]?$/.test(fulfilmentTime)) return "Enter maximum fulfilment days as a number from 1 to 99.";
    }
    if (target === 5 && !informationAccurate) return "Confirm that the submitted information is accurate.";
    return null;
  };

  const goNext = () => {
    const message = validateStep();
    if (message) return setError(message);
    setError(null);
    setStep((current) => Math.min(5, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submissionPayload = (): MerchantOnboardingSubmission => ({
    personal: { full_name: fullName.trim(), email, phone, relationship },
    business: {
      business_type: businessType,
      other_business_type: businessType === "other" ? otherBusinessType.trim() : undefined,
      business_name: businessName.trim(),
      registered_business_name: registeredBusinessName.trim(),
      business_pan: businessPan,
      registered_address: {
        line1: registeredAddress.trim(), line2: registeredAddress2.trim() || undefined,
        city: registeredCity.trim(), state: registeredState.trim(), postal_code: registeredPostalCode,
      },
    },
    shop: {
      shop_name: shopName.trim(),
      shop_address: {
        line1: shopAddress.trim(), line2: shopAddress2.trim() || undefined,
        city: shopCity.trim(), state: shopState.trim(), postal_code: shopPostalCode,
      },
      gstin,
      operating_location: operatingLocation.trim(),
      contact_number: phone,
      operating_hours: operatingHours.trim(),
      service_radius_km: serviceRadius ? Number(serviceRadius) : undefined,
    },
    fulfilment: {
      methods: fulfilmentMethods,
      delivery_service_radius_km: deliveryRadius ? Number(deliveryRadius) : undefined,
      estimated_fulfilment_time: fulfilmentTime.trim(),
    },
    information_accurate: true,
  });

  const submit = async () => {
    const message = validateStep(5);
    if (message) return setError(message);
    setSubmitting(true);
    setError(null);
    try {
      const payload = submissionPayload();
      let merchantId = existingMerchantId;
      if (!merchantId) {
        const merchant = await callAction(createMerchantAction({
          legal_name: registeredBusinessName.trim(),
          display_name: shopName.trim(),
          support_email: email,
          support_phone: phone,
          address: [shopAddress, shopAddress2, shopCity, shopState, shopPostalCode].filter(Boolean).join(", "),
          range_km: serviceRadius ? Number(serviceRadius) : undefined,
          state_code: registeredState.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "IN",
          city_code: shopCity.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase() || "N",
        }));
        merchantId = merchant.id;
        setExistingMerchantId(merchant.id);
      }
      await setActiveMerchantAction(merchantId);
      await callAction(submitMerchantOnboardingAction(merchantId, payload));

      sessionStorage.setItem("sf_pending_pan", businessPan);
      sessionStorage.removeItem("sf_onboarding_step");
      router.push("/merchant/verification?onboarding=complete");
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Could not submit onboarding. Please try again.");
      setSubmitting(false);
    }
  };

  const toggleFulfilment = (method: FulfilmentMethod) => setFulfilmentMethods((current) =>
    current.includes(method) ? current.filter((value) => value !== method) : [...current, method],
  );

  if (loading) return <Spinner variant="fullscreen" label="Loading onboarding…" />;

  return (
    <div className="min-h-screen bg-[#EEF0F2] px-4 py-6 sm:px-6 sm:py-8">
      {submitting && <Spinner variant="fullscreen" label="Submitting for verification…" />}
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/simulafly-logo.png" alt="SimulaFly" width={36} height={36} className="h-9 w-9 rounded-xl object-cover" />
            <div><p className="font-extrabold text-gray-900">SimulaFly Merchant</p><p className="text-[11px] text-gray-400">KYC &amp; onboarding</p></div>
          </div>
          <button type="button" onClick={() => { sessionStorage.setItem("sf_onboarding_step", String(step)); router.push("/merchant/sign_in"); }} className="text-xs font-bold text-gray-500 hover:text-gray-900">
            Save &amp; exit
          </button>
        </header>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-3 py-4 shadow-sm">
          <div className="flex min-w-0">
            {STEPS.map((label, index) => {
              const number = index + 1;
              return (
                <div key={label} className="flex min-w-0 flex-1 items-center">
                  <button type="button" aria-label={`Step ${number}: ${label}`} onClick={() => number < step && setStep(number)} className="flex shrink-0 items-center justify-center gap-2 text-left sm:justify-start">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold ${number <= step ? "bg-[#0E9F88] text-white" : "bg-gray-100 text-gray-400"}`}>{number < step ? "✓" : number}</span>
                    <span className={`hidden text-[10px] font-bold uppercase tracking-wider sm:inline ${number === step ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                  </button>
                  {number < STEPS.length && <span className={`mx-1 h-px min-w-0 flex-1 sm:mx-2 ${number < step ? "bg-[#0E9F88]" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-600 sm:hidden">Step {step}: {STEPS[step - 1]}</p>
        </div>

        <main className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          {step === 1 && <div>
            <SectionTitle title="Personal & authorized person details" description="Tell us who is responsible for this merchant account and verify the contact number." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required><input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
              <Field label="Verified email"><input className={`${inputClass} bg-gray-100`} value={email} disabled /></Field>
              <Field label="Relationship with business" required><select className={inputClass} value={relationship} onChange={(e) => setRelationship(e.target.value as Relationship)}>{RELATIONSHIPS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
              <Field label="Password"><div className={`${inputClass} bg-gray-100 text-gray-500`}>Password created during account registration</div></Field>
              <div className="sm:col-span-2"><Field label="Phone number" required>
                <div className="flex flex-col gap-2 sm:flex-row"><input className={inputClass} value={phone} disabled={phoneVerified} onChange={(e) => { setPhone(e.target.value.replace(/[^+0-9]/g, "")); setPhoneVerified(false); }} placeholder="+919876543210" /><button type="button" onClick={sendOtp} disabled={otpBusy || phoneVerified} className="rounded-xl bg-gray-900 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{phoneVerified ? "Verified ✓" : otpSent ? "Resend OTP" : "Send OTP"}</button></div>
              </Field></div>
              {otpSent && !phoneVerified && <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex flex-col gap-2 sm:flex-row"><input className={inputClass} value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit OTP" /><button type="button" onClick={verifyOtp} disabled={otpBusy || otp.length !== 6} className="rounded-xl bg-[#0E9F88] px-5 py-3 text-xs font-bold text-white disabled:opacity-50 sm:py-0">Verify</button></div>{devOtp && <p className="mt-2 text-[11px] text-amber-700">Development OTP: <strong>{devOtp}</strong></p>}</div>}
            </div>
          </div>}

          {step === 2 && <div>
            <SectionTitle title="Business details" description="Business registration is captured before the primary shop can be activated." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Business type" required><select className={inputClass} value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)}>{BUSINESS_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
              {businessType === "other" && <Field label="Other business type" required><input className={inputClass} value={otherBusinessType} onChange={(e) => setOtherBusinessType(e.target.value)} /></Field>}
              <Field label="Registered business name" required><input className={inputClass} value={registeredBusinessName} onChange={(e) => { setRegisteredBusinessName(e.target.value); if (sameBusinessName) setBusinessName(e.target.value); }} /></Field>
              <Field label="Business name" required><input className={inputClass} value={businessName} disabled={sameBusinessName} onChange={(e) => setBusinessName(e.target.value)} /><label className="mt-2 flex gap-2 text-xs text-gray-500"><input type="checkbox" checked={sameBusinessName} onChange={(e) => applySameBusinessName(e.target.checked)} /> Same as registered business name</label></Field>
              <Field label="Business PAN" required><input className={`${inputClass} font-mono uppercase tracking-widest`} value={businessPan} maxLength={10} onChange={(e) => setBusinessPan(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())} placeholder="ABCDE1234F" /></Field>
              <div className="sm:col-span-2"><Field label="Registered address" required><input className={inputClass} value={registeredAddress} onChange={(e) => setRegisteredAddress(e.target.value)} placeholder="Building / street" /></Field></div>
              <Field label="Address line 2"><input className={inputClass} value={registeredAddress2} onChange={(e) => setRegisteredAddress2(e.target.value)} /></Field>
              <Field label="City" required><input className={inputClass} value={registeredCity} onChange={(e) => setRegisteredCity(e.target.value)} /></Field>
              <Field label="State" required><input className={inputClass} value={registeredState} onChange={(e) => setRegisteredState(e.target.value)} /></Field>
              <Field label="PIN code" required><input className={inputClass} value={registeredPostalCode} maxLength={6} onChange={(e) => setRegisteredPostalCode(e.target.value.replace(/\D/g, ""))} /></Field>
            </div>
          </div>}

          {step === 3 && <div>
            <SectionTitle title="Primary shop & location" description="This is the location from which your products or services are offered. Additional shops are added later." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Shop name" required><input className={inputClass} value={shopName} disabled={sameShopName} onChange={(e) => setShopName(e.target.value)} /><label className="mt-2 flex gap-2 text-xs text-gray-500"><input type="checkbox" checked={sameShopName} onChange={(e) => applySameShopName(e.target.checked)} /> Same as business name</label></Field>
              <Field label="GSTIN" required><input className={`${inputClass} font-mono uppercase tracking-wider`} value={gstin} maxLength={15} onChange={(e) => setGstin(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())} placeholder="27ABCDE1234F1Z5" /></Field>
              <div className="sm:col-span-2"><label className="mb-3 flex gap-2 text-xs font-medium text-gray-600"><input type="checkbox" checked={sameShopAddress} onChange={(e) => applySameShopAddress(e.target.checked)} /> Shop address is the same as registered business address</label></div>
              <div className="sm:col-span-2"><Field label="Shop address" required><input className={inputClass} value={shopAddress} disabled={sameShopAddress} onChange={(e) => setShopAddress(e.target.value)} /></Field></div>
              <Field label="Address line 2"><input className={inputClass} value={shopAddress2} disabled={sameShopAddress} onChange={(e) => setShopAddress2(e.target.value)} /></Field>
              <Field label="City" required><input className={inputClass} value={shopCity} disabled={sameShopAddress} onChange={(e) => setShopCity(e.target.value)} /></Field>
              <Field label="State" required><input className={inputClass} value={shopState} disabled={sameShopAddress} onChange={(e) => setShopState(e.target.value)} /></Field>
              <Field label="PIN code" required><input className={inputClass} value={shopPostalCode} disabled={sameShopAddress} maxLength={6} onChange={(e) => setShopPostalCode(e.target.value.replace(/\D/g, ""))} /></Field>
              <Field label="Operating location" required><input className={inputClass} value={operatingLocation} onChange={(e) => setOperatingLocation(e.target.value)} placeholder="Area / landmark / service location" /></Field>
              <Field label="Contact number"><input className={`${inputClass} bg-gray-100`} value={phone} disabled /></Field>
              <Field label="Operating hours" required>
                <select
                  className={inputClass}
                  value={isCustomHours ? "custom" : operatingHours}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setIsCustomHours(true);
                      setOperatingHours(customOperatingHours);
                    } else {
                      setIsCustomHours(false);
                      setOperatingHours(val);
                    }
                  }}
                >
                  <option value="" disabled>Select operating hours</option>
                  {OPERATING_HOURS_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                  <option value="custom">Custom / Other hours</option>
                </select>
                {isCustomHours && (
                  <div className="mt-2">
                    <input
                      className={inputClass}
                      value={customOperatingHours}
                      onChange={(e) => {
                        setCustomOperatingHours(e.target.value);
                        setOperatingHours(e.target.value);
                      }}
                      placeholder="e.g. Tue–Sun, 11:00 AM–9:00 PM"
                    />
                  </div>
                )}
              </Field>
              <Field label="Service / delivery radius (km)"><input type="text" inputMode="numeric" pattern="[0-9]{0,2}" maxLength={2} className={inputClass} value={serviceRadius} onChange={(e) => setServiceRadius(digitsOnly(e.target.value, 2))} /></Field>
            </div>
          </div>}

          {step === 4 && <div>
            <SectionTitle title="Fulfilment & merchant operations" description="Choose how orders will be fulfilled after the merchant is activated." />
            <div className="grid gap-3 sm:grid-cols-2">{FULFILMENT_METHODS.map((method) => <label key={method.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold ${fulfilmentMethods.includes(method.value) ? "border-[#0E9F88] bg-emerald-50 text-[#0E9F88]" : "border-gray-200 text-gray-600"}`}><input type="checkbox" checked={fulfilmentMethods.includes(method.value)} onChange={() => toggleFulfilment(method.value)} />{method.label}</label>)}</div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Delivery / service radius (km)"><input type="text" inputMode="numeric" pattern="[0-9]{0,2}" maxLength={2} className={inputClass} value={deliveryRadius} onChange={(e) => setDeliveryRadius(digitsOnly(e.target.value, 2))} /></Field><Field label="MAXIMUM FULFILMENT DAYS" required><input type="text" inputMode="numeric" pattern="[0-9]{1,2}" maxLength={2} className={inputClass} value={fulfilmentTime} onChange={(e) => setFulfilmentTime(digitsOnly(e.target.value, 2))} placeholder="e.g. 3" /></Field></div>
          </div>}

          {step === 5 && <div>
            <SectionTitle title="Review & submit" description="Review every onboarding section before continuing." />
            <div className="space-y-4">
              <ReviewCard title="Personal details" step={1} onEdit={setStep}><p><strong>Name:</strong> {fullName}</p><p><strong>Relationship:</strong> {relationship.replaceAll("_", " ")}</p><p><strong>Email:</strong> {email}</p><p><strong>Phone:</strong> {phone} ✓</p></ReviewCard>
              <ReviewCard title="Business details" step={2} onEdit={setStep}><p><strong>Business:</strong> {registeredBusinessName}</p><p><strong>Type:</strong> {businessType.replaceAll("_", " ")}</p><p><strong>PAN:</strong> ******{businessPan.slice(-4)}</p><p><strong>Address:</strong> {registeredAddress}, {registeredCity}, {registeredState} {registeredPostalCode}</p></ReviewCard>
              <ReviewCard title="Shop & GST details" step={3} onEdit={setStep}><p><strong>Shop:</strong> {shopName}</p><p><strong>GSTIN:</strong> {gstin}</p><p><strong>Location:</strong> {shopAddress}, {shopCity}</p><p><strong>Hours:</strong> {operatingHours}</p></ReviewCard>
              <ReviewCard title="Fulfilment" step={4} onEdit={setStep}><p><strong>Methods:</strong> {fulfilmentMethods.map((v) => v.replaceAll("_", " ")).join(", ")}</p><p><strong>Maximum fulfilment:</strong> {fulfilmentTime} days</p></ReviewCard>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 p-4 text-sm text-gray-600"><input type="checkbox" className="mt-0.5" checked={informationAccurate} onChange={(e) => setInformationAccurate(e.target.checked)} /><span>I confirm that all submitted information is accurate and that I am authorized to submit it for this business.</span></label>
          </div>}

          <div className="mt-9 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            <button type="button" disabled={step === 1} onClick={() => { setError(null); setStep((current) => Math.max(1, current - 1)); }} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 disabled:opacity-30">Back</button>
            {step < 5 ? <button type="button" onClick={goNext} className="rounded-xl bg-[#0E9F88] px-7 py-3 text-sm font-bold text-white hover:bg-[#0B7A69]">Next</button> : <button type="button" disabled={submitting || !informationAccurate} onClick={submit} className="rounded-xl bg-[#0E9F88] px-7 py-3 text-sm font-bold text-white disabled:opacity-50">Complete onboarding</button>}
          </div>
        </main>
      </div>
    </div>
  );
}
