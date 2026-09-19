import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { appLaunchLinks } from "@/lib/app-handoff";
import AppLaunch from "./AppLaunch";

type Props = {
  params: Promise<{ lookup: string }>;
  searchParams: Promise<{ product?: string | string[] }>;
};

// No product preview/catalog or API fetch: a shared URL's only job on the web
// is to launch the app or offer installation, even if the catalog API is down.
export const metadata: Metadata = {
  title: "Open Simulafly",
  description: "Open this shared product or shop in Simulafly, or install the app from Google Play.",
  robots: { index: false, follow: false },
};

export default async function SharedAppLinkPage({ params, searchParams }: Props) {
  const [{ lookup }, query] = await Promise.all([params, searchParams]);
  if (Array.isArray(query.product)) notFound();
  let links;
  try {
    links = appLaunchLinks(lookup, query.product);
  } catch {
    notFound();
  }
  return <AppLaunch key={links.shareUrl} intentUrl={links.intentUrl} product={query.product !== undefined} />;
}
