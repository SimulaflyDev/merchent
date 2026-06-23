export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // 1. If it's a relative URL starting with "/api/v1" or "/upload", resolve it properly
  if (url.startsWith("/api/v1")) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const baseClean = apiBase.replace(/\/+$/, "");
    return `${baseClean}${url.replace(/^\/api\/v1/, "")}`;
  }
  if (url.startsWith("/upload")) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const baseClean = apiBase.replace(/\/+$/, "");
    return `${baseClean}/${url.replace(/^\/+/, "")}`;
  }

  // 2. If it contains the production API prefix, rewrite it in dev/test to use the local API base
  const productionPrefix = "https://api.simulatech.org/api/v1";
  if (url.startsWith(productionPrefix)) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
    const baseClean = apiBase.replace(/\/+$/, "");
    return `${baseClean}${url.slice(productionPrefix.length)}`;
  }

  // 3. For any other URLs (e.g. external Amazon image links), return them as-is
  return url;
}
