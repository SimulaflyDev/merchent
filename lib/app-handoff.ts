import { publicShopUrl, STOREFRONT_BASE_URL } from "./share-links";

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.simulafly";
export const ANDROID_PACKAGE = "com.simulafly";

/** The HTTPS share URL stays public; only the browser handoff uses an Intent. */
export function appLaunchLinks(lookup: string, productId?: string, baseUrl = STOREFRONT_BASE_URL) {
  const validId = /^[a-zA-Z0-9_-]{1,120}$/;
  if (!validId.test(lookup) || (productId !== undefined && !validId.test(productId))) {
    throw new Error("Invalid shared shop or product");
  }
  const share = new URL(publicShopUrl(lookup, productId, baseUrl));
  if (share.protocol !== "https:" || share.port) throw new Error("App links require HTTPS without a custom port");
  // Chrome resolves this to the installed package. If it is missing, Chrome
  // uses the explicit Play Store fallback, NOT the website product page.
  const intentUrl = `intent://${share.host}${share.pathname}${share.search}#Intent;scheme=https;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
  return { shareUrl: share.toString(), intentUrl, playStoreUrl: PLAY_STORE_URL };
}

export function isAndroidBrowser(userAgent: string): boolean {
  return /android/i.test(userAgent) && !/bot|crawler|spider|preview/i.test(userAgent);
}

/** Browsers may refuse automatic launches. Keep a user-gesture link available;
 * never guess installation status from a timer or redirect after app return. */
export function attemptAutomaticAppOpen(intentUrl: string, browser: {
  userAgent: string;
  visibilityState: string;
  navigate: (url: string) => void;
}): boolean {
  if (!isAndroidBrowser(browser.userAgent) || browser.visibilityState !== "visible") return false;
  try {
    browser.navigate(intentUrl);
    return true;
  } catch {
    return false;
  }
}
