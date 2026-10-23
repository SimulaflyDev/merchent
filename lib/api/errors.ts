export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public payload?: unknown,
  ) {
    super(`API ${status}: ${detail}`);
    this.name = "ApiError";
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function apiErrorDetail(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) return fallback;
  const detail = payload.detail;
  if (typeof detail === "string") return detail;
  // FastAPI validation failures use a list of objects, which React cannot render.
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item) => {
      if (!item || typeof item !== "object" || typeof item.msg !== "string") return [];
      const field = Array.isArray(item.loc) ? item.loc.filter((part: unknown) => part !== "body").join(" ").replace(/_/g, " ") : "";
      return [field ? `${field}: ${item.msg}` : item.msg];
    });
    return messages.join(". ") || fallback;
  }
  return fallback;
}
