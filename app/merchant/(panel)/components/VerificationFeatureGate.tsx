"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  isVerified: boolean;
}

export default function VerificationFeatureGate({ children, isVerified }: Props) {
  const pathname = usePathname();

  if (isVerified || pathname?.startsWith("/merchant/verification")) {
    return <>{children}</>;
  }

  const returnTo = pathname?.startsWith("/merchant/") ? pathname : "/merchant/dashboard";

  return (
    <div className="flex min-h-[calc(100dvh-104px)] items-center justify-center px-4 py-8 sm:px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-required-title"
        className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-xl sm:p-9"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 id="verification-required-title" className="text-2xl font-extrabold tracking-tight text-[#111827]">
          Shop verification required
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
          All merchant features remain locked until your merchant PAN and this shop&apos;s GSTIN are verified.
        </p>
        <Link
          href={`/merchant/verification?locked=1&returnTo=${encodeURIComponent(returnTo)}`}
          className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#0E9F88] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0B7A69] sm:w-auto"
        >
          Verify shop now
        </Link>
      </section>
    </div>
  );
}
