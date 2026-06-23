import { api } from "./client";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export async function login(email: string, password: string): Promise<TokenPair> {
  return api<TokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function register(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<{ id: string; email: string; full_name: string | null }> {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  return api<TokenPair>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
    skipAuth: true,
  });
}
