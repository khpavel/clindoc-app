import { apiUrl } from "../config";
import { getAccessToken, clearAccessToken } from "../auth/tokenStorage";

async function handleJsonResponse<T>(
  method: string,
  path: string,
  response: Response
): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
    }

    let message = `${method} ${path} failed: ${response.status} ${response.statusText}`;
    try {
      const text = await response.text();
      if (text) message += ` - ${text}`;
    } catch {
      // ignore body read errors
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getJson<T>(path: string): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    headers,
  });
  return handleJsonResponse<T>("GET", path, response);
}

export async function postJson<TRequest, TResponse>(
  path: string,
  body: TRequest
): Promise<TResponse> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  return handleJsonResponse<TResponse>("POST", path, response);
}
