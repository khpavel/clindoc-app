import type { TokenResponse, LoginPayload } from "../types/auth";
import { apiUrl } from "../config";

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const response = await fetch(apiUrl("/auth/token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: payload.username,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed with status ${response.status}`);
  }

  return (await response.json()) as TokenResponse;
}


