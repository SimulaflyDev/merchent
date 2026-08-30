"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "../components/Spinner";
import { sendEmailOtpAction, verifyEmailOtpAction } from "@/lib/auth/actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      await callAction(verifyEmailOtpAction(otp));
      setSuccessMessage("Email verified successfully! Redirecting...");
      setTimeout(() => {
        router.push("/merchant/onboarding");
      }, 1500);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.detail || "Verification failed. Please try again.");
      } else {
        setError("Failed to verify code. Please check your connection and try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setError(null);
    setSuccessMessage(null);
    setIsResending(true);
    try {
      await callAction(sendEmailOtpAction());
      setSuccessMessage("A new verification code has been sent to your email.");
      setCountdown(60);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.detail || "Failed to resend code.");
      } else {
        setError("Failed to resend. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDEEF0] px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E4E8] bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#0E9F88]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0E9F88]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-4.996a2 2 0 012.22 0l8 4.996A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">Verify your business email</h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Please enter the 6-digit One-Time Password (OTP) sent to your registered business email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full rounded-xl border-2 border-gray-200 bg-[#F8FAFB] px-3 py-4 text-center font-mono text-xl font-bold tracking-[5px] outline-none transition-colors focus:border-[#0E9F88] sm:px-4 sm:text-2xl sm:tracking-[8px]"
              autoFocus
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg text-center font-semibold">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-3 bg-[#0E9F88] hover:bg-[#0B7A69] text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner variant="inline" /> : "Verify & Continue"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="text-sm font-semibold text-[#0E9F88] hover:text-[#0B7A69] disabled:opacity-50 disabled:text-gray-400 transition-colors"
          >
            {isResending ? "Resending..." : countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Entered the wrong email?{" "}
          <Link href="/merchant/sign_in" className="text-[#0E9F88] font-medium hover:underline">
            Sign in with a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
