"use client";

export default function MerchantPanelError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="p-4 sm:p-6 md:p-8" role="alert">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
        <h1 className="text-xl font-bold text-amber-950">This page could not be loaded</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-amber-800">
          A service is temporarily unavailable. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-5 rounded-xl bg-amber-950 px-5 py-2.5 text-sm font-bold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
