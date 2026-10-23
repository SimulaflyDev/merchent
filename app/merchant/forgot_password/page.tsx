"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import Spinner from "../components/Spinner";
import { callAction } from "@/lib/api/action-utils";
import { isApiError } from "@/lib/api/errors";
import { forgotPasswordAction, resetPasswordAction } from "@/lib/auth/actions";

type Stage = "request" | "reset" | "complete";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0E9F88] focus:ring-2 focus:ring-[#0E9F88]/20";

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const normalizedEmail = email.trim().toLowerCase();

  const requestCode = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (pending || resendSeconds > 0) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await callAction(forgotPasswordAction(normalizedEmail));
      setMessage(result.message);
      setOtp("");
      setResendSeconds(60);
      setStage("reset");
    } catch (err) {
      setError(isApiError(err) && err.status === 503
        ? "We couldn’t send the email because the email service is unavailable. Please try later or contact SimulaFly support."
        : isApiError(err) ? err.detail : "Could not request a reset code. Try again.");
    } finally {
      setPending(false);
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result = await callAction(resetPasswordAction(normalizedEmail, otp, password));
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setStage("complete");
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Could not reset your password. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDEEF0] px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-[#E2E4E8] bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/merchant/sign_in"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0E9F88]"
        >
          <span aria-hidden>←</span> Back to sign in
        </Link>

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0E9F88]">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#111827]">
          {stage === "complete" ? "Password updated" : "Forgot password"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {stage === "request" && "Enter your merchant email and we’ll send you a six-digit reset code."}
          {stage === "reset" && `If ${normalizedEmail} has an active account, use the code in your latest email. It expires in 10 minutes.`}
          {stage === "complete" && "Your password has been reset. You can now sign in with the new password."}
        </p>

        {error && (
          <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && stage !== "complete" && (
          <div role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {stage === "request" && (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value.toLowerCase().replace(/\s/g, ""))}
                className={inputClass}
                placeholder="merchant@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center rounded-lg bg-[#0E9F88] py-2.5 font-semibold text-white transition hover:bg-[#0B7A69] disabled:opacity-50"
            >
              {pending ? <Spinner variant="inline" /> : "Send reset code"}
            </button>
          </form>
        )}

        {stage === "reset" && (
          <form onSubmit={resetPassword} className="mt-6 space-y-4">
            <div>
              <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">Reset code</label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                minLength={6}
                maxLength={6}
                pattern="[0-9]{6}"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${inputClass} text-center font-mono text-lg tracking-[0.35em]`}
                placeholder="000000"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-700">New password</label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={pending || otp.length !== 6}
              className="flex w-full items-center justify-center rounded-lg bg-[#0E9F88] py-2.5 font-semibold text-white transition hover:bg-[#0B7A69] disabled:opacity-50"
            >
              {pending ? <Spinner variant="inline" /> : "Reset password"}
            </button>
            <button
              type="button"
              disabled={pending || resendSeconds > 0}
              onClick={() => void requestCode()}
              className="w-full text-sm font-semibold text-[#0E9F88] hover:underline disabled:opacity-50"
            >
              {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => { setStage("request"); setError(null); setMessage(null); setOtp(""); setPassword(""); setConfirmPassword(""); setResendSeconds(0); }}
              className="w-full text-sm text-gray-500 hover:underline disabled:opacity-50"
            >
              Use a different email
            </button>
          </form>
        )}

        {stage === "complete" && (
          <Link
            href="/merchant/sign_in"
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#0E9F88] py-2.5 font-semibold text-white transition hover:bg-[#0B7A69]"
          >
            Continue to sign in
          </Link>
        )}
      </section>
    </main>
  );
}
