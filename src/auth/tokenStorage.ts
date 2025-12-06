export const ACCESS_TOKEN_KEY = "csr_access_token";

// In-memory fallback storage for environments where `window` is not available
let inMemoryAccessToken: string | null = null;

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function setAccessToken(token: string): void {
  if (hasWindow()) {
    try {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
      // If localStorage is not accessible (e.g. quota exceeded, disabled), fall back to memory
      inMemoryAccessToken = token;
    }
  } else {
    inMemoryAccessToken = token;
  }
}

export function getAccessToken(): string | null {
  if (hasWindow()) {
    try {
      const value = window.localStorage.getItem(ACCESS_TOKEN_KEY);
      return value !== null ? value : inMemoryAccessToken;
    } catch {
      // If localStorage access fails, use in-memory token
      return inMemoryAccessToken;
    }
  }

  return inMemoryAccessToken;
}

export function clearAccessToken(): void {
  if (hasWindow()) {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // Ignore localStorage errors and still clear memory token
    }
  }

  inMemoryAccessToken = null;
}

export function clearTokens(): void {
  if (hasWindow()) {
    try {
      // Clear localStorage
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      
      // Clear sessionStorage if there are any auth-related keys
      if (typeof window.sessionStorage !== "undefined") {
        // Add any sessionStorage keys here if needed in the future
        // window.sessionStorage.removeItem("some_session_key");
      }
    } catch {
      // Ignore storage errors and still clear memory token
    }
  }

  // Clear in-memory token
  inMemoryAccessToken = null;
}

