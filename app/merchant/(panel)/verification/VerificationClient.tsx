"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { callAction } from "@/lib/api/action-utils";
import { isApiError } from "@/lib/api/errors";
import {
  acceptMerchantAgreementsAction,
  refreshMerchantVerificationAction,
  verifyMerchantGstinAction,
  verifyMerchantPanAction,
  sendMerchantOtpAction,
  confirmMerchantOtpAction,
} from "@/lib/auth/verification-actions";
import type { MerchantOut } from "@/lib/types/merchant";
import type { MerchantVerification } from "@/lib/types/verification";

interface Props {
  merchant: MerchantOut;
  initialVerification: MerchantVerification;
  initialGstin: string;
}

type VerificationStep = 0 | 1 | 2;

const steps = ["Business PAN", "GST & OTP", "Terms & Conditions"] as const;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-[#F8FAFB] px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#0E9F88] focus:ring-2 focus:ring-[#0E9F88]/15 disabled:cursor-not-allowed disabled:bg-gray-100";
const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400";

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatVerifiedAt(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function VerificationClient({
  merchant,
  initialVerification,
  initialGstin,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verification, setVerification] = useState(initialVerification);
  const [activeStep, setActiveStep] = useState<VerificationStep>(
    initialVerification.pan.status === "not_started" ? 0 : initialVerification.gstin.status !== "verified" ? 1 : 2,
  );
  const [pan, setPan] = useState("");
  const [panName, setPanName] = useState(merchant.legal_name);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [consent, setConsent] = useState(false);
  const [gstin, setGstin] = useState((initialVerification.gstin.gstin || initialGstin).toUpperCase());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationPromptOpen, setVerificationPromptOpen] = useState(
    () => searchParams.get("onboarding") === "complete" || searchParams.get("locked") === "1",
  );
  const [pending, startTransition] = useTransition();
  const [acceptAllTerms, setAcceptAllTerms] = useState(false);
  const [gstUsername, setGstUsername] = useState("");
  const [otpConsent, setOtpConsent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [editingOtpRequest, setEditingOtpRequest] = useState(false);

  useEffect(() => {
    function tick() {
      const now = Date.now();
      setResendIn(verification.otp?.resend_available_at ? Math.max(0, Math.ceil((Date.parse(verification.otp.resend_available_at) - now) / 1000)) : 0);
      setOtpExpired(Boolean(verification.otp?.expires_at && Date.parse(verification.otp.expires_at) <= now));
    }
    const timer = window.setInterval(tick, 1000);
    const initial = window.setTimeout(tick, 0);
    return () => { window.clearInterval(timer); window.clearTimeout(initial); };
  }, [verification.otp?.resend_available_at, verification.otp?.expires_at]);

  function refreshStatus() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await callAction(refreshMerchantVerificationAction(merchant.id));
        setVerification(result);
        setEditingOtpRequest(false);
        setActiveStep(result.pan.status === "not_started" ? 0 : result.gstin.status !== "verified" ? 1 : 2);
        setSuccess("Verification status updated.");
        router.refresh();
      } catch (err) {
        showError(err, "Unable to refresh verification. Please try again.");
      }
    });
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const enteredPan = sessionStorage.getItem("sf_pending_pan");
      if (enteredPan && verification.pan.status === "not_started") setPan(enteredPan);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [verification.pan.status]);

  const panVerified = verification.pan.status === "verified";
  const panChecked = verification.pan.status !== "not_started";
  const gstinVerified = verification.gstin.status === "verified";
  const challenge = verification.otp;
  const otpPending = challenge?.status === "pending" && !otpExpired && !editingOtpRequest;
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = requestedReturnTo?.startsWith("/merchant/")
    ? requestedReturnTo
    : "/merchant/dashboard";
  const completedSteps = [panVerified, gstinVerified, verification.agreement.accepted];
  const availableSteps = [true, panChecked, panVerified && gstinVerified];

  const openStep = (step: VerificationStep) => {
    if (pending || !availableSteps[step]) return;
    setActiveStep(step);
    setError(null);
    setSuccess(null);
  };

  const showError = (err: unknown, fallback: string) => {
    setSuccess(null);
    setError(isApiError(err) ? err.detail : fallback);
  };

  const submitPan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!consent) {
      setError("Please provide consent before verifying PAN details.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await callAction(
          verifyMerchantPanAction(merchant.id, {
            pan: pan.trim().toUpperCase(),
            name_as_per_pan: panName.trim(),
            date_of_birth: dateOfBirth,
            consent: true,
          }),
        );
        setVerification(result);
        setPan("");
        setDateOfBirth("");
        setActiveStep(1);
        sessionStorage.removeItem("sf_pending_pan");
        setSuccess("PAN details matched. Confirm your GST account and linked business PAN with OTP in the next step.");
        router.refresh();
      } catch (err) {
        showError(err, "PAN verification failed. Please try again.");
      }
    });
  };

  const submitGstin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!otpConsent || resendIn > 0) return;
    startTransition(async () => {
      try {
        const checked = await callAction(
          verifyMerchantGstinAction(merchant.id, { gstin: gstin.trim().toUpperCase() }),
        );
        setVerification(checked);
        const result = await callAction(sendMerchantOtpAction(merchant.id, {
          gstin: gstin.trim().toUpperCase(), username: gstUsername.trim(), consent: true,
        }));
        setVerification(result);
        setOtpCode("");
        setResendIn(result.is_kyc_completed ? 0 : 60);
        setOtpExpired(false);
        setEditingOtpRequest(false);
        if (result.is_kyc_completed) {
          setActiveStep(2);
          setSuccess("Verification is complete. Read and accept the terms.");
        } else {
          setSuccess("OTP requested through GST. Check the contact details registered on your GST account.");
        }
        router.refresh();
      } catch (err) {
        showError(err, "Could not send a GST OTP. Check your GST portal username and try again.");
        try { setVerification(await callAction(refreshMerchantVerificationAction(merchant.id))); } catch { /* Keep the original send error. */ }
      }
    });
  };

  function confirmOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge?.challenge_id || !otpPending || pending) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await callAction(confirmMerchantOtpAction(merchant.id, { challenge_id: challenge.challenge_id!, otp: otpCode }));
        setVerification(result);
        setOtpCode("");
        setGstUsername("");
        setActiveStep(2);
        setSuccess("OTP confirmed. Business PAN and GST verification is complete. Read and accept the terms.");
        router.refresh();
      } catch (err) {
        showError(err, "OTP verification failed. Please try again.");
        setOtpCode("");
        try { setVerification(await callAction(refreshMerchantVerificationAction(merchant.id))); } catch { /* Keep the original verification error. */ }
      }
    });
  }

  const activateMerchant = () => {
    setError(null);
    setSuccess(null);
    if (!acceptAllTerms || !verification.can_activate) {
      setError("Complete verification and accept all Terms and Conditions before activation.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await callAction(
          acceptMerchantAgreementsAction(merchant.id, {
            merchant_agreement: true,
            terms_and_conditions: true,
            privacy_policy: true,
            marketplace_rules: true,
            product_listing_policy: true,
            cancellation_return_rules: true,
            merchant_obligations_and_fees: true,
          }),
        );
        setVerification(result);
        sessionStorage.removeItem("sf_pending_pan");
        setSuccess("Terms accepted. Your merchant account is approved and ready to use.");
        router.refresh();
      } catch (err) {
        showError(err, "Merchant activation failed. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-full bg-[#EDEEF0] px-4 py-8 sm:px-7 lg:px-10">
      {verificationPromptOpen && verification.approval_status !== "approved" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-prompt-title"
            className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 text-center shadow-2xl sm:p-8"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-[#0E9F88]">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 id="verification-prompt-title" className="text-xl font-extrabold text-[#111827]">
              Complete shop verification
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Check your business PAN, confirm the linked GST account with OTP, then read and accept the PDF agreement.
            </p>
            <button
              type="button"
              onClick={() => setVerificationPromptOpen(false)}
              className="mt-6 w-full rounded-xl bg-[#0E9F88] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0B7A69]"
            >
              Start verification
            </button>
          </section>
        </div>
      )}
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0E9F88]">
              <span className="h-2 w-2 rounded-full bg-[#0E9F88]" />
              Account &amp; shop verification
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Verify {merchant.display_name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Check your business PAN, confirm PAN and GST through the GST account OTP, then accept the PDF agreement.
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
              verification.approval_status === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {verification.approval_status === "approved" ? "Verified / approved" : "Verification pending"}
          </span>
        </div>

        <div className="mb-4 flex justify-end">
          <button type="button" onClick={refreshStatus} disabled={pending} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#0E9F88] disabled:opacity-50">Refresh status</button>
        </div>

        <nav aria-label="Verification steps" className="mb-6 rounded-3xl border border-[#E2E4E8] bg-white px-2 py-5 shadow-sm sm:p-6">
          <ol className="grid grid-cols-3">
            {steps.map((label, index) => (
              <li key={label} className="relative min-w-0">
                {index > 0 && (
                  <span aria-hidden="true" className={`absolute right-1/2 top-5 h-0.5 w-full ${completedSteps[index - 1] ? "bg-[#0E9F88]" : "bg-gray-200"}`} />
                )}
                <button
                  type="button"
                  id={`verification-step-${index}`}
                  aria-controls={`verification-panel-${index}`}
                  aria-current={activeStep === index ? "step" : undefined}
                  disabled={pending || !availableSteps[index]}
                  onClick={() => openStep(index as VerificationStep)}
                  className="relative z-10 flex w-full flex-col items-center gap-2 rounded-xl px-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#0E9F88] disabled:cursor-not-allowed"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${completedSteps[index] ? "border-[#0E9F88] bg-[#0E9F88] text-white" : activeStep === index ? "border-[#0E9F88] bg-white text-[#0E9F88] ring-4 ring-emerald-50" : "border-gray-200 bg-white text-gray-400"}`}>
                    {completedSteps[index] ? <CheckIcon /> : index + 1}
                  </span>
                  <span className={`text-[11px] font-bold sm:text-sm ${activeStep === index ? "text-[#0E9F88]" : availableSteps[index] ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
                  <span className="text-[10px] text-gray-400">{completedSteps[index] ? "Completed" : activeStep === index ? "In progress" : "Pending"}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] leading-relaxed text-blue-800">
          Automatic checks use Sandbox.co.in. SimulaFly stores only a protected PAN
          fingerprint and the last four characters; the full PAN and date of birth are not retained.
        </div>

        {verification.manually_verified && (
          <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            An admin has approved the PAN and GSTIN requirements for this shop.
            {!verification.agreement.accepted && " Read and accept the Terms & Conditions to finish verification."}
          </div>
        )}

        {(error || success) && (
          <div
            role="status"
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ?? success}
          </div>
        )}

        <div>
          <section id="verification-panel-0" aria-labelledby="verification-step-0" hidden={activeStep !== 0} className="overflow-hidden rounded-3xl border border-[#E2E4E8] bg-white shadow-sm">
            <div className="h-1 bg-gradient-to-r from-[#111827] to-gray-500" />
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      panVerified ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {panVerified ? <CheckIcon /> : <span className="text-sm font-extrabold">1</span>}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">Business PAN</h2>
                    <p className="mt-0.5 text-[11px] text-gray-400">The PAN registered to your business</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {panVerified ? "Verified" : panChecked ? "OTP pending" : "Required"}
                </span>
              </div>

              {verification.pan.source === "admin" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">
                  <p className="font-semibold">PAN requirement approved by admin</p>
                  <p className="mt-1 text-xs">Manually reviewed on {formatVerifiedAt(verification.pan.verified_at)}.</p>
                </div>
              ) : panChecked ? (
                <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">PAN</span>
                    <span className="font-mono font-bold text-[#111827]">{verification.pan.masked_pan}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Verified name</span>
                    <span className="text-right font-semibold text-[#111827]">{verification.pan.verified_name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Category</span>
                    <span className="font-semibold capitalize text-[#111827]">{verification.pan.category}</span>
                  </div>
                  <p className="border-t border-emerald-100 pt-3 text-[10px] text-emerald-700">
                    Details checked {formatVerifiedAt(verification.pan.verified_at)}
                  </p>
                  {!panVerified && <p className="text-xs text-amber-700">Complete the GST account OTP in step 2 to confirm the linked business PAN and GSTIN.</p>}
                </div>
              ) : (
                <form onSubmit={submitPan} className="space-y-4">
                  <div>
                    <label htmlFor="pan" className={labelClass}>Business PAN number</label>
                    <input
                      id="pan"
                      value={pan}
                      onChange={(event) => setPan(event.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                      className={`${inputClass} font-mono uppercase tracking-widest`}
                      minLength={10}
                      maxLength={10}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                      placeholder="ABCDE1234F"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pan-name" className={labelClass}>Business name exactly as on PAN</label>
                    <input
                      id="pan-name"
                      value={panName}
                      onChange={(event) => setPanName(event.target.value)}
                      className={inputClass}
                      placeholder="Legal name on PAN card"
                      minLength={2}
                      maxLength={255}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pan-dob" className={labelClass}>Date of birth / incorporation</label>
                    <input
                      id="pan-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      className={inputClass}
                      max={new Date().toISOString().slice(0, 10)}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Companies: enter the incorporation date. Sole proprietors: use the proprietor&apos;s PAN and date of birth.</p>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#0E9F88]"
                    />
                    <span className="text-[11px] leading-relaxed text-gray-600">
                      I consent to SimulaFly retrieving and verifying these PAN details for merchant onboarding.
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={pending || !consent}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111827] py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    Verify PAN
                  </button>
                </form>
              )}
              {panChecked && (
                <button type="button" onClick={() => openStep(1)} disabled={pending} className="mt-5 w-full rounded-xl bg-[#0E9F88] px-4 py-3 text-sm font-bold text-white hover:bg-[#0B7A69] disabled:opacity-50">
                  Continue to GSTIN
                </button>
              )}
            </div>
          </section>

          <section id="verification-panel-1" aria-labelledby="verification-step-1" hidden={activeStep !== 1} className="overflow-hidden rounded-3xl border border-[#E2E4E8] bg-white shadow-sm">
            <div className="h-1 bg-gradient-to-r from-[#0E9F88] to-emerald-400" />
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      gstinVerified ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {gstinVerified ? <CheckIcon /> : <span className="text-sm font-extrabold">2</span>}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">Shop GSTIN &amp; OTP</h2>
                    <p className="mt-0.5 text-[11px] text-gray-400">Required separately for every shop</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {gstinVerified ? "Verified" : panChecked ? "OTP required" : "PAN first"}
                </span>
              </div>

              {verification.gstin.source === "admin" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">
                  <p className="font-semibold">GSTIN requirement approved by admin</p>
                  <p className="mt-1 text-xs">Manually reviewed on {formatVerifiedAt(verification.gstin.verified_at)}.</p>
                </div>
              ) : gstinVerified ? (
                <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">GSTIN</span>
                    <span className="font-mono font-bold text-[#111827]">{verification.gstin.gstin}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Legal business</span>
                    <span className="text-right font-semibold text-[#111827]">{verification.gstin.legal_name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Registration</span>
                    <span className="font-bold text-emerald-700">{verification.gstin.registration_status}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">State</span>
                    <span className="font-semibold text-[#111827]">{verification.gstin.state_name || "—"}</span>
                  </div>
                  <p className="border-t border-emerald-100 pt-3 text-[10px] text-emerald-700">
                    Verified {formatVerifiedAt(verification.gstin.verified_at)}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitGstin} className="space-y-4">
                  {!panChecked && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
                      Complete merchant PAN verification first. This lets us confirm the GSTIN belongs to the same account.
                    </div>
                  )}
                  <div>
                    <label htmlFor="gstin" className={labelClass}>GST identification number</label>
                    <input
                      id="gstin"
                      value={gstin}
                      onChange={(event) => setGstin(event.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                      className={`${inputClass} font-mono uppercase tracking-wider`}
                      minLength={15}
                      maxLength={15}
                      pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]"
                      placeholder="27ABCDE1234F1Z5"
                      disabled={!panChecked || pending || otpPending}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gst-username" className={labelClass}>GST portal username</label>
                    <input id="gst-username" value={gstUsername} onChange={(event) => setGstUsername(event.target.value)} className={inputClass} maxLength={100} autoComplete="off" disabled={pending || !panChecked || otpPending} required />
                    <p className="mt-1 text-xs text-gray-500">Use the username for this GSTIN on the GST portal. Enable API access there if requested by GST. You do not need to enter your GST password.</p>
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                    <input type="checkbox" checked={otpConsent} onChange={(event) => setOtpConsent(event.target.checked)} disabled={pending || otpPending} className="mt-1 h-4 w-4 shrink-0 accent-[#0E9F88]" />
                    I authorize GST account authentication to confirm this GSTIN and its linked business PAN.
                  </label>
                  <p className="text-[10px] leading-relaxed text-gray-400">
                    GST sends the OTP to the contact details registered on your GST account. Its linked PAN must match the PAN checked in step 1.
                  </p>
                  <button
                    type="submit"
                    disabled={pending || !panChecked || !otpConsent || resendIn > 0 || otpPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E9F88] py-3 text-sm font-bold text-white transition hover:bg-[#0B7A69] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    {resendIn > 0 ? `Request another OTP in ${resendIn}s` : challenge?.challenge_id ? "Resend GST OTP" : "Send GST OTP"}
                  </button>
                </form>
              )}
              {!gstinVerified && challenge?.challenge_id && !editingOtpRequest && (
                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">Confirm OTP for {challenge.gstin}</p>
                  {otpPending ? (
                    <form onSubmit={confirmOtp} className="mt-3 space-y-3">
                      <label htmlFor="gst-otp" className={labelClass}>6-digit GST OTP</label>
                      <input id="gst-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))} disabled={pending} required className={`${inputClass} font-mono tracking-[0.3em]`} />
                      <p className="text-xs text-blue-800">This request expires after 10 minutes. {challenge.attempts_remaining} attempts remaining.</p>
                      <button type="submit" disabled={pending || otpCode.length !== 6} className="w-full rounded-xl bg-[#0E9F88] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "Checking…" : "Confirm OTP & verify PAN + GST"}</button>
                    </form>
                  ) : <p role="status" className="mt-2 text-sm text-amber-800">{challenge.status === "locked" ? "Too many incorrect attempts." : "This OTP request has expired."} Request a new code above.</p>}
                  {otpPending && <button type="button" disabled={pending || resendIn > 0} onClick={() => { setEditingOtpRequest(true); setOtpCode(""); }} className="mt-3 text-xs font-semibold text-blue-800 underline disabled:opacity-50">Change username or request another code</button>}
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => openStep(0)} disabled={pending} className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 disabled:opacity-50">Back to PAN</button>
                {gstinVerified && (
                  <button type="button" onClick={() => openStep(2)} disabled={pending} className="rounded-xl bg-[#0E9F88] px-4 py-3 text-sm font-bold text-white hover:bg-[#0B7A69] disabled:opacity-50">Continue to Terms</button>
                )}
              </div>
            </div>
          </section>
        </div>

        {activeStep === 2 && (
          <section id="verification-panel-2" aria-labelledby="verification-step-2" className="rounded-3xl border border-[#E2E4E8] bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Terms &amp; Conditions</h2>
                <p className="mt-1 text-xs text-gray-500">Read the PDF and accept the agreement to complete verification.</p>
              </div>
              <a href="/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#0E9F88] hover:bg-emerald-50">Open / download PDF</a>
            </div>

            <iframe src="/terms-and-conditions.pdf#view=FitH" title="SimulaFly Terms and Conditions PDF" className="h-[420px] w-full rounded-xl border border-gray-200 bg-gray-50 sm:h-[600px]" />
            <p className="mt-2 text-xs text-gray-500">If the preview is unavailable on your phone, use Open / download PDF above.</p>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              <input
                type="checkbox"
                checked={verification.agreement.accepted || acceptAllTerms}
                disabled={pending || verification.agreement.accepted}
                onChange={(event) => setAcceptAllTerms(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#0E9F88]"
              />
              <span>
                I have read the PDF and accept all Terms and Conditions, the Merchant Agreement, Privacy Policy, marketplace and listing rules, cancellation and return rules, and merchant obligations and applicable fees.
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              You can also review the <a href="https://simulafly.com/privacy-policy-for-website" target="_blank" rel="noopener noreferrer" className="text-[#0E9F88] underline">Privacy Policy</a>. Acceptance is saved with your merchant account.
            </p>

            {verification.agreement.accepted ? (
              <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                All terms accepted{verification.agreement.accepted_at ? ` on ${formatVerifiedAt(verification.agreement.accepted_at)}` : ""}.
              </div>
            ) : (
              <>
                {!verification.can_activate && <p className="mt-4 text-sm text-amber-700">Complete the pending onboarding checks below before activation.</p>}
                <button type="button" onClick={activateMerchant} disabled={pending || !acceptAllTerms || !verification.can_activate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E9F88] px-4 py-3 text-sm font-bold text-white hover:bg-[#0B7A69] disabled:cursor-not-allowed disabled:opacity-50">
                  {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  Accept &amp; complete verification
                </button>
              </>
            )}
            <button type="button" onClick={() => openStep(1)} disabled={pending} className="mt-4 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 disabled:opacity-50">Back to GSTIN</button>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-[#E2E4E8] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#111827]">Other mandatory checks</h2>
          <p className="mt-1 text-[11px] text-gray-400">These checks are derived from the validated onboarding submission.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {([
              ["authorized_person", "Authorized person"],
              ["business_address", "Business address"],
              ["shop_location", "Shop / location"],
            ] as const).map(([key, label]) => {
              const verified = verification.other_checks[key].status === "verified";
              return (
                <div key={key} className={`rounded-2xl border p-4 ${verified ? "border-emerald-100 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${verified ? "bg-emerald-600 text-white" : "bg-amber-200 text-amber-800"}`}>{verified ? <CheckIcon /> : "!"}</span>
                    <span className="text-xs font-bold text-gray-800">{label}</span>
                  </div>
                  <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${verified ? "text-emerald-700" : "text-amber-700"}`}>{verified ? "Verified" : "Pending"}</p>
                </div>
              );
            })}
          </div>
        </section>

        {verification.approval_status === "approved" && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row">
            <div>
              <p className="font-bold text-emerald-900">Verification complete</p>
              <p className="mt-0.5 text-[12px] text-emerald-700">
                This merchant is verified, approved, and ready to use SimulaFly merchant features.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(returnTo)}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 sm:w-auto"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
