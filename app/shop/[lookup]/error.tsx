"use client";
import { PLAY_STORE_URL } from "@/lib/app-handoff";

export default function StorefrontError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl p-8 text-center">
    <h1 className="text-2xl font-semibold">Open Simulafly</h1>
    <p className="mt-3 text-gray-600">Please try opening this link again, or install the app from Google Play.</p>
    <button className="mt-5 rounded-full bg-green-800 px-6 py-3 text-white" onClick={reset}>Try again</button>
    <a href={PLAY_STORE_URL} className="mt-5 block font-semibold text-green-800 underline">Install from Google Play</a>
  </main>;
}
