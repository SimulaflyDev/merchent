"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { callAction } from "@/lib/api/action-utils";
import { isApiError } from "@/lib/api/errors";
import {
  acceptMerchantAgreementsAction,
  verifyMerchantGstinAction,
  verifyMerchantPanAction,
} from "@/lib/auth/verification-actions";
import type { MerchantOut } from "@/lib/types/merchant";
import type { MerchantVerification } from "@/lib/types/verification";

interface Props {
  merchant: MerchantOut;
  initialVerification: MerchantVerification;
  initialGstin: string;
}

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
  const [pan, setPan] = useState("");
  const [panName, setPanName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [consent, setConsent] = useState(false);
  const [gstin, setGstin] = useState(initialGstin.toUpperCase());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [agreementChecks, setAgreementChecks] = useState<Record<string, boolean>>({
    merchant_agreement: false,
    terms_and_conditions: false,
    privacy_policy: false,
    marketplace_rules: false,
    product_listing_policy: false,
    cancellation_return_rules: false,
    merchant_obligations_and_fees: false,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const enteredPan = sessionStorage.getItem("sf_pending_pan");
      if (enteredPan && verification.pan.status !== "verified") setPan(enteredPan);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [verification.pan.status]);

  const panVerified = verification.pan.status === "verified";
  const gstinVerified = verification.gstin.status === "verified";
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = requestedReturnTo?.startsWith("/merchant/")
    ? requestedReturnTo
    : "/merchant/dashboard";
  const allAgreementsAccepted = Object.values(agreementChecks).every(Boolean);

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
        setSuccess("PAN verified. You can now verify this shop's GSTIN.");
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
    startTransition(async () => {
      try {
        const result = await callAction(
          verifyMerchantGstinAction(merchant.id, { gstin: gstin.trim().toUpperCase() }),
        );
        setVerification(result);
        setSuccess("Shop GSTIN verified. Review and accept the activation agreements below.");
        router.refresh();
      } catch (err) {
        showError(err, "GSTIN verification failed. Please try again.");
      }
    });
  };

  const activateMerchant = () => {
    setError(null);
    setSuccess(null);
    if (!allAgreementsAccepted) {
      setError("Accept every required agreement and policy before activation.");
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
        setSuccess("Merchant approved. Redirecting to your dashboard…");
        setTimeout(() => router.push(returnTo), 900);
      } catch (err) {
        showError(err, "Merchant activation failed. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-full bg-[#EDEEF0] px-4 py-8 sm:px-7 lg:px-10">
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
              PAN verifies the merchant owner once. GSTIN verifies this individual shop and must
              belong to the same PAN.
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

        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] leading-relaxed text-blue-800">
          Details are checked securely through Sandbox.co.in. SimulaFly stores only a protected PAN
          fingerprint and the last four characters; the full PAN and date of birth are not retained.
        </div>

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

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-[#E2E4E8] bg-white shadow-sm">
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
                    <h2 className="text-base font-bold text-[#111827]">Merchant PAN</h2>
                    <p className="mt-0.5 text-[11px] text-gray-400">One-time owner verification</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {panVerified ? "Verified" : "Required"}
                </span>
              </div>

              {panVerified ? (
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
                    Verified {formatVerifiedAt(verification.pan.verified_at)}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitPan} className="space-y-4">
                  <div>
                    <label htmlFor="pan" className={labelClass}>PAN number</label>
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
                    <label htmlFor="pan-name" className={labelClass}>Name exactly as on PAN</label>
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
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-[#E2E4E8] bg-white shadow-sm">
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
                    <h2 className="text-base font-bold text-[#111827]">Shop GSTIN</h2>
                    <p className="mt-0.5 text-[11px] text-gray-400">Required separately for every shop</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {gstinVerified ? "Verified" : panVerified ? "Ready" : "PAN first"}
                </span>
              </div>

              {gstinVerified ? (
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
                  {!panVerified && (
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
                      disabled={!panVerified}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <p className="text-[10px] leading-relaxed text-gray-400">
                    The GST registration must be Active, and its linked PAN must match the verified merchant PAN.
                  </p>
                  <button
                    type="submit"
                    disabled={pending || !panVerified}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E9F88] py-3 text-sm font-bold text-white transition hover:bg-[#0B7A69] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    Verify GSTIN
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-[#E2E4E8] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-bold text-[#111827]">Other mandatory checks</h2>
            <p className="mt-1 text-[11px] text-gray-400">These checks are derived from the validated onboarding submission.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["authorized_person", "Authorized person"],
              ["business_address", "Business address"],
              ["shop_location", "Shop / location"],
            ] as const).map(([key, label]) => {
              const verified = verification.other_checks[key].status === "verified";
              return <div key={key} className={`rounded-2xl border p-4 ${verified ? "border-emerald-100 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><div className="flex items-center gap-2"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${verified ? "bg-emerald-600 text-white" : "bg-amber-200 text-amber-800"}`}>{verified ? <CheckIcon /> : "!"}</span><span className="text-xs font-bold text-gray-800">{label}</span></div><p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${verified ? "text-emerald-700" : "text-amber-700"}`}>{verified ? "Verified" : "Pending"}</p></div>;
            })}
          </div>
        </section>

        {(verification.can_activate || verification.approval_status === "approved") && (
          <section className="mt-6 rounded-3xl border border-[#E2E4E8] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-[#111827]">Merchant agreement &amp; activation</h2>
              <p className="mt-1 text-[11px] text-gray-400">Acceptance is recorded with the current policy versions and your merchant account.</p>
            </div>
            {verification.approval_status === "approved" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">All agreements accepted. Merchant status: Verified / Approved.</div>
            ) : (
              <div className="space-y-3">
                {([
                  ["merchant_agreement", "Merchant Agreement"],
                  ["terms_and_conditions", "Terms & Conditions"],
                  ["privacy_policy", "Privacy Policy"],
                  ["marketplace_rules", "Marketplace / Platform Rules"],
                  ["product_listing_policy", "Product & Listing Policies"],
                  ["cancellation_return_rules", "Cancellation / Return Rules"],
                  ["merchant_obligations_and_fees", "Merchant obligations and applicable platform fees"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[12px] text-gray-700"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#0E9F88]" checked={agreementChecks[key]} onChange={(event) => setAgreementChecks((current) => ({ ...current, [key]: event.target.checked }))} /><span>I accept the {label}.</span></label>
                ))}
                <button type="button" onClick={activateMerchant} disabled={pending || !allAgreementsAccepted} className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#0E9F88] py-3 text-sm font-bold text-white disabled:opacity-50">Approve &amp; activate merchant</button>
              </div>
            )}
          </section>
        )}

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
