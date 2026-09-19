"use client";

export default function StorefrontError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl p-8 text-center">
    <h1 className="text-2xl font-semibold">Could not load this shop</h1>
    <p className="mt-3 text-gray-600">Please try again in a moment.</p>
    <button className="mt-5 rounded-full bg-green-800 px-6 py-3 text-white" onClick={reset}>Try again</button>
  </main>;
}
