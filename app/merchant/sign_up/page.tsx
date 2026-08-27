"use client";

import Link from "next/link";
import { useState } from "react";

import Spinner from "../components/Spinner";
import { registerAction } from "@/lib/auth/actions";
import { isApiError } from "@/lib/api/errors";
import { callAction } from "@/lib/api/action-utils";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMerchantAgreement, setAcceptMerchantAgreement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (password !== rePassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!acceptPrivacy || !acceptTerms || !acceptMerchantAgreement) {
      setError("Accept the Terms, Privacy Policy, and Merchant Agreement to register.");
      return;
    }

    setIsSubmitting(true);
    try {
      await callAction(
        registerAction(trimmedEmail, password, fullName.trim(), {
          terms: acceptTerms,
          privacy: acceptPrivacy,
          merchant: acceptMerchantAgreement,
        }),
      );
    } catch (err) {
      if (isApiError(err)) {
        setError(
          err.status === 409
            ? "An account with that email already exists. Try signing in instead."
            : err.detail || "Sign up failed.",
        );
      } else {
        if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
        setError("Could not reach the server. Try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDEEF0] px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E4E8] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Create your merchant account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Start selling on SimulaFly. We&apos;ll set up your store next.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
              autoComplete="name"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Business Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ""))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
              autoComplete="email"
              placeholder="e.g. name@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
          </div>

          <div>
            <label htmlFor="rePassword" className="block text-sm font-medium text-gray-700 mb-1">
              Re-password
            </label>
            <input
              id="rePassword"
              type="password"
              required
              minLength={8}
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-start gap-2.5">
              <input
                id="acceptPrivacy"
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0E9F88] focus:ring-[#0E9F88]"
              />
              <label htmlFor="acceptPrivacy" className="text-xs text-gray-600">
                I have read and agree to the{" "}
                <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="text-[#0E9F88] font-medium hover:underline">
                  Privacy Policy (read more)
                </a>
              </label>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="acceptMerchantAgreement"
                type="checkbox"
                checked={acceptMerchantAgreement}
                onChange={(e) => setAcceptMerchantAgreement(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0E9F88] focus:ring-[#0E9F88]"
              />
              <label htmlFor="acceptMerchantAgreement" className="text-xs text-gray-600">
                I accept the SimulaFly Merchant Agreement and marketplace obligations.
              </label>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0E9F88] focus:ring-[#0E9F88]"
              />
              <label htmlFor="acceptTerms" className="text-xs text-gray-600">
                I have read and agree to the{" "}
                <a href="/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer" className="text-[#0E9F88] font-medium hover:underline">
                  Terms of Services (read more)
                </a>
              </label>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !acceptPrivacy || !acceptTerms || !acceptMerchantAgreement}
            className="w-full py-2.5 bg-[#0E9F88] text-white font-medium rounded-lg hover:bg-[#0B7A69] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner variant="inline" /> : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have one?{" "}
          <Link href="/merchant/sign_in" className="text-[#0E9F88] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
