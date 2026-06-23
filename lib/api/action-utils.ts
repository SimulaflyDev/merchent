import { ApiError } from "./errors";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { status: number; detail: string; payload?: unknown } };

/**
 * Wraps a backend API call on the server side to catch any ApiError and return a serializable payload.
 * Also preserves Next.js internal redirect errors so routing remains functional.
 */
export async function srvAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const res = await fn();
    return { success: true, data: res };
  } catch (err) {
    // If it's a Next.js redirect/not-found error, we must re-throw it so Next.js can handle it!
    if (
      err instanceof Error &&
      (err.message === "NEXT_REDIRECT" || (err as any).digest?.startsWith("NEXT_REDIRECT"))
    ) {
      throw err;
    }
    if (err instanceof ApiError) {
      return {
        success: false,
        error: { status: err.status, detail: err.detail, payload: err.payload },
      };
    }
    return {
      success: false,
      error: { status: 500, detail: err instanceof Error ? err.message : "Unknown error" },
    };
  }
}

/**
 * Unwraps a serializable ActionResult on the client side, reconstructing the ApiError instance.
 */
export async function callAction<T>(promise: Promise<ActionResult<T>>): Promise<T> {
  const result = await promise;
  if (!result.success) {
    throw new ApiError(result.error.status, result.error.detail, result.error.payload);
  }
  return result.data;
}
