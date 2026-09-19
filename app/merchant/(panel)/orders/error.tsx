"use client";

import { useEffect } from "react";

export default function OrdersError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Unexpected merchant orders error", error);
  }, [error]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
        <h1 className="text-xl font-bold text-amber-950">Orders could not be loaded</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-amber-800">
          The order service is temporarily unavailable. Your existing orders are safe.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-5 rounded-xl bg-amber-950 px-5 py-2.5 text-sm font-bold text-white"
        >
          Retry orders
        </button>
      </div>
    </div>
  );
}
