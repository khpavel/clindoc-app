import { apiUrl } from "../config";
import { getAccessToken, clearAccessToken } from "../auth/tokenStorage";

interface ErrorResponse {
  detail?: string;
  error?: string;
  type?: string;
  message?: string;
}

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
      if (text) {
        // Try to parse as JSON for structured error responses
        try {
          const errorJson: ErrorResponse = JSON.parse(text);
          if (errorJson.detail) {
            message = errorJson.detail;
            // Append additional error details if available
            if (errorJson.error && errorJson.type === "ValidationError") {
              // Extract first validation error for cleaner message
              const firstError = errorJson.error.split('\n')[0];
              message += `: ${firstError}`;
            } else if (errorJson.error) {
              message += `: ${errorJson.error}`;
            }
          } else {
            message += ` - ${text}`;
          }
        } catch {
          // Not JSON, use text as-is
          message += ` - ${text}`;
        }
      }
    } catch {
      // ignore body read errors
    }
    throw new Error(message);
  }

  // Handle empty responses (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
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

export async function deleteJson(path: string): Promise<void> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    method: "DELETE",
    headers,
  });

  await handleJsonResponse<void>("DELETE", path, response);
}
