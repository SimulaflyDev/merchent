"use client";

import Link from "next/link";
import { useState } from "react";

import Spinner from "../components/Spinner";
import { registerAction } from "@/lib/auth/actions";
import { isApiError } from "@/lib/api/errors";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerAction(email, password, fullName);
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
    <div className="min-h-screen flex items-center justify-center bg-[#EDEEF0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E2E4E8] p-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Create your merchant account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Start selling on SimulaFly. We&apos;ll set up your store next.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
              autoComplete="email"
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

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
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
