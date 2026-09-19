"use client";

import { useEffect, useRef } from "react";
import { attemptAutomaticAppOpen, isAndroidBrowser, PLAY_STORE_URL } from "@/lib/app-handoff";

export default function AppLaunch({ intentUrl, product }: { intentUrl: string; product: boolean }) {
  const attempted = useRef<string | null>(null);
  useEffect(() => {
    if (attempted.current === intentUrl) return;
    attempted.current = intentUrl;
    attemptAutomaticAppOpen(intentUrl, {
      userAgent: navigator.userAgent,
      visibilityState: document.visibilityState,
      navigate: (url) => window.location.replace(url),
    });
  }, [intentUrl]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5faf4] px-5 py-12 text-[#202c21]">
      <section className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-7 text-center shadow-sm sm:p-10">
        <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#459d4a] text-4xl font-bold text-white">S</div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Simulafly</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Open in the app</h1>
        <p className="mt-4 leading-7 text-gray-600">
          View this {product ? "product" : "shop"} in Simulafly. Don&apos;t have the app? Install it from Google Play.
        </p>
        <a
          href={intentUrl}
          onClick={(event) => {
            // Desktop / iOS cannot handle an Android Intent. Offer the exact
            // listing instead of navigating them to an unsupported protocol.
            if (!isAndroidBrowser(navigator.userAgent)) {
              event.preventDefault();
              window.location.assign(PLAY_STORE_URL);
            }
          }}
          className="mt-8 block rounded-full bg-[#202c21] px-6 py-4 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700"
        >Open app</a>
        <a href={PLAY_STORE_URL} className="mt-3 block rounded-full border border-green-300 px-6 py-4 font-semibold text-green-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700">
          Install from Google Play
        </a>
        <p className="mt-6 text-sm leading-6 text-gray-500">After installing, tap the shared link again.</p>
        <p className="mt-3 text-xs leading-5 text-gray-500">If your chat browser blocks opening apps, choose “Open in browser” from its menu, then tap Open app.</p>
      </section>
    </main>
  );
}
