import { PLAY_STORE_URL } from "@/lib/app-handoff";

export default function StorefrontNotFound() {
  return <main className="mx-auto max-w-xl p-8 text-center">
    <h1 className="text-2xl font-semibold">This share link is invalid</h1>
    <p className="mt-3 text-gray-600">Ask the sender for a new link. You can also install Simulafly to browse in the app.</p>
    <a href={PLAY_STORE_URL} className="mt-5 inline-block rounded-full bg-green-800 px-6 py-3 text-white">Install from Google Play</a>
  </main>;
}
